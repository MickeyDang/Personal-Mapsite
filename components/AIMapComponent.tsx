import React, { useEffect, useRef, useCallback } from "react";
import mapboxgl from "mapbox-gl";
import { CombinedMapModel, EventModel } from "../data/types";
import { fetchImageUrls } from "../data/requests";
import styles from "../styles/AIMapComponent.module.css";

interface AIMapComponentProps {
  eventsMapModel: CombinedMapModel[];
  mapboxAccessToken: string;
  onMomentSelected: (moment: EventModel) => void;
  selectedEvent?: EventModel;
}

const AIMapComponent: React.FC<AIMapComponentProps> = ({
  eventsMapModel,
  mapboxAccessToken,
  onMomentSelected,
  selectedEvent,
}) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<mapboxgl.Marker[]>([]);
  const imageCache = useRef<Map<string, string[]>>(new Map());

  const fetchAndCacheImages = useCallback(
    async (event: EventModel): Promise<string[]> => {
      const cached = imageCache.current.get(event.title);
      if (cached) return cached;
      try {
        const urls = await fetchImageUrls(event.photoPointerSrc);
        if (urls && urls.length > 0) {
          imageCache.current.set(event.title, urls);
          return urls;
        }
      } catch (e) {
        console.error("Failed to fetch images for", event.title, e);
      }
      return [];
    },
    [],
  );

  // Builds an image card that shows a spinner placeholder until its image
  // has actually downloaded, then fades the image in over the placeholder.
  const createImageCard = useCallback((url: string, alt: string) => {
    const card = document.createElement("div");
    card.className = `${styles.imageCard} ${styles.loading}`;

    const spinner = document.createElement("div");
    spinner.className = styles.spinner;
    card.appendChild(spinner);

    const img = document.createElement("img");
    img.alt = alt;
    img.className = styles.markerImage;
    img.draggable = false;
    const markLoaded = () => card.classList.remove(styles.loading);
    img.addEventListener("load", markLoaded, { once: true });
    img.addEventListener("error", markLoaded, { once: true });
    img.src = url;
    if (img.complete && img.naturalWidth > 0) markLoaded();
    card.appendChild(img);

    return card;
  }, []);

  // Creates the marker shell immediately with a loading placeholder card.
  // `populate` swaps in the real cards once the image URLs are known.
  const createMarkerElement = useCallback(
    (mapModel: CombinedMapModel) => {
      // Outer wrapper with fixed dimensions for stable hitbox
      const wrapper = document.createElement("div");
      wrapper.className = styles.markerWrapper;

      // Inner container that holds the cards
      const container = document.createElement("div");
      container.className = styles.markerContainer;

      const placeholder = document.createElement("div");
      placeholder.className = `${styles.imageCard} ${styles.loading}`;
      const spinner = document.createElement("div");
      spinner.className = styles.spinner;
      placeholder.appendChild(spinner);
      container.appendChild(placeholder);
      wrapper.appendChild(container);

      // Event opened when the wrapper itself is clicked; null when individual
      // cards handle their own clicks (multi-image stacks).
      let wrapperTarget: EventModel | null = mapModel.events[0];
      wrapper.addEventListener("click", (e) => {
        if (!wrapperTarget) return;
        e.stopPropagation();
        onMomentSelected(wrapperTarget);
      });

      const populate = (allImageUrls: Map<string, string[]>) => {
        container.replaceChildren();

        // Collect all images across all events at this location
        const allImages: { url: string; event: EventModel }[] = [];
        mapModel.events.forEach((event) => {
          const urls = allImageUrls.get(event.title) || [];
          urls.forEach((url) => {
            allImages.push({ url, event });
          });
        });

        if (allImages.length === 0) {
          // Fallback: show a colored dot
          const dot = document.createElement("div");
          dot.className = styles.fallbackDot;
          dot.style.backgroundColor =
            mapModel.events.length > 1
              ? "gray"
              : mapModel.events[0].tags[0]?.valueOf() || "#BDBDBD";
          container.appendChild(dot);
          wrapperTarget = mapModel.events[0];
          return;
        }

        if (allImages.length === 1) {
          // Single image - just show it
          container.appendChild(
            createImageCard(allImages[0].url, allImages[0].event.title),
          );
          wrapperTarget = allImages[0].event;
          return;
        }

        // Multiple images - show stack that expands on hover
        // Show only first image by default, expand all on hover
        wrapperTarget = null;
        allImages.forEach((item, index) => {
          const card = createImageCard(item.url, item.event.title);
          card.setAttribute("data-index", String(index));
          card.setAttribute("data-total", String(allImages.length));

          // Click on individual card opens that event's modal
          card.addEventListener("click", (e) => {
            e.stopPropagation();
            onMomentSelected(item.event);
          });

          container.appendChild(card);
        });

        // Count badge
        const badge = document.createElement("div");
        badge.className = styles.countBadge;
        badge.textContent = String(allImages.length);
        container.appendChild(badge);
      };

      return { element: wrapper, populate };
    },
    [onMomentSelected, createImageCard],
  );

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current || !mapboxAccessToken) return;

    mapboxgl.accessToken = mapboxAccessToken;

    if (!mapRef.current) {
      mapRef.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: "mapbox://styles/mapbox/light-v11",
        center: [-80.52, 43.46],
        zoom: 2,
      });
    }

    return () => {
      // Don't destroy map on cleanup - we reuse it
    };
  }, [mapboxAccessToken]);

  // Add markers when data changes
  useEffect(() => {
    const map = mapRef.current;
    if (!map || eventsMapModel.length === 0) return;

    let cancelled = false;

    // Clear existing markers
    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    // Place every marker right away in its loading state, then fill each one
    // in independently as its image URLs come back.
    eventsMapModel.forEach((mapModel) => {
      const { element, populate } = createMarkerElement(mapModel);

      const marker = new mapboxgl.Marker({ element, anchor: "center" })
        .setLngLat([mapModel.longitude, mapModel.latitude])
        .addTo(map);

      markersRef.current.push(marker);

      Promise.all(
        mapModel.events.map(
          async (event) =>
            [event.title, await fetchAndCacheImages(event)] as const,
        ),
      ).then((entries) => {
        if (!cancelled) populate(new Map(entries));
      });
    });

    return () => {
      cancelled = true;
    };
  }, [eventsMapModel, createMarkerElement, fetchAndCacheImages]);

  // Fly camera when selected event changes (e.g. scrub buttons)
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !selectedEvent) return;

    map.flyTo({
      center: [selectedEvent.longitude, selectedEvent.latitude],
      zoom: 11,
    });
  }, [selectedEvent]);

  return <div ref={mapContainer} className={styles.mapContainer} />;
};

export default AIMapComponent;
