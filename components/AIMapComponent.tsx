import React, { useEffect, useRef, useCallback } from "react";
import mapboxgl from "mapbox-gl";
import { CombinedMapModel, EventModel } from "../data/types";
import { fetchImageUrls } from "../data/requests";
import styles from "../styles/AIMapComponent.module.css";

interface AIMapComponentProps {
  eventsMapModel: CombinedMapModel[];
  mapboxAccessToken: string;
  onMomentSelected: (moment: EventModel) => void;
}

const AIMapComponent: React.FC<AIMapComponentProps> = ({
  eventsMapModel,
  mapboxAccessToken,
  onMomentSelected,
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

  const createMarkerElement = useCallback(
    (mapModel: CombinedMapModel, allImageUrls: Map<string, string[]>) => {
      // Outer wrapper with fixed dimensions for stable hitbox
      const wrapper = document.createElement("div");
      wrapper.className = styles.markerWrapper;

      // Inner container that holds the cards
      const container = document.createElement("div");
      container.className = styles.markerContainer;

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
        wrapper.appendChild(container);

        wrapper.addEventListener("click", (e) => {
          e.stopPropagation();
          onMomentSelected(mapModel.events[0]);
        });

        return wrapper;
      }

      if (allImages.length === 1) {
        // Single image - just show it
        const card = document.createElement("div");
        card.className = styles.imageCard;
        const img = document.createElement("img");
        img.src = allImages[0].url;
        img.alt = allImages[0].event.title;
        img.className = styles.markerImage;
        img.draggable = false;
        card.appendChild(img);
        container.appendChild(card);
        wrapper.appendChild(container);

        wrapper.addEventListener("click", (e) => {
          e.stopPropagation();
          onMomentSelected(allImages[0].event);
        });

        return wrapper;
      }

      // Multiple images - show stack that expands on hover
      // Show only first image by default, expand all on hover
      allImages.forEach((item, index) => {
        const card = document.createElement("div");
        card.className = styles.imageCard;
        card.setAttribute("data-index", String(index));
        card.setAttribute("data-total", String(allImages.length));

        const img = document.createElement("img");
        img.src = item.url;
        img.alt = item.event.title;
        img.className = styles.markerImage;
        img.draggable = false;
        card.appendChild(img);

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

      wrapper.appendChild(container);
      return wrapper;
    },
    [onMomentSelected],
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

    const addMarkers = async () => {
      // Clear existing markers
      markersRef.current.forEach((m) => m.remove());
      markersRef.current = [];

      // Pre-fetch all images
      const allImageUrls = new Map<string, string[]>();
      const fetchPromises = eventsMapModel.flatMap((mapModel) =>
        mapModel.events.map(async (event) => {
          const urls = await fetchAndCacheImages(event);
          allImageUrls.set(event.title, urls);
        }),
      );

      await Promise.all(fetchPromises);

      // Create markers
      eventsMapModel.forEach((mapModel) => {
        const el = createMarkerElement(mapModel, allImageUrls);

        const marker = new mapboxgl.Marker({ element: el, anchor: "center" })
          .setLngLat([mapModel.longitude, mapModel.latitude])
          .addTo(map);

        markersRef.current.push(marker);
      });
    };

    addMarkers();
  }, [eventsMapModel, createMarkerElement, fetchAndCacheImages]);

  return <div ref={mapContainer} className={styles.mapContainer} />;
};

export default AIMapComponent;
