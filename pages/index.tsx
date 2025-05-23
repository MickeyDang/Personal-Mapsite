import type { NextPage } from "next";
import styles from "../styles/Home.module.css";
import { useRef, useState, useEffect } from "react";
import mapboxgl from "mapbox-gl";
import ReactDOM from "react-dom/client";
import PopupContent from "../components/PopupContent";
import {
  CombinedMapModel,
  CombinedTimelineModel,
  combineToMapFormat,
  combineToTimelineFormat,
  createBarTimeFromEvent,
  EventModel,
  mapStringToTag,
} from "../data/types";
import { convertResponseToEventModel, fetchImageUrls } from "../data/requests";
import {
  compareMapModelLatLng,
  compareMarkerLatLng,
  configureMarkerColour,
  removePopups,
} from "../data/mapUtils";
import SelectedMomentModal from "../components/SelectedMomentModal";
import TopBar from "../components/TopBar";
import EventsTimelineChart from "../components/EventsTimelineChart";

const Home: NextPage = () => {
  // Event Model Setup
  const [eventsModel, setEventsModel] = useState<EventModel[]>([]);
  const [eventsMapModel, setEventsMapModel] = useState<CombinedMapModel[]>([]);
  const [eventsTimelineModel, setEventsTimelineModel] = useState<
    CombinedTimelineModel[]
  >([]);
  const [selectedEventIdx, setSelectedEventIdx] = useState(0);

  // Timeline Tracking
  const [selectedBarIndex, setSelectedBarIndex] = useState<number>(0);

  // Cached Data
  const cachedEvents: React.MutableRefObject<EventModel[]> = useRef(null);
  //TODO: on each change to the event model, cache the mappings of titles and (LatLng) to event & map models, removing searching

  // Filtering
  const [selectedFilters, setSelectedFilters] = useState<string[]>([]);

  // Modal Parameters
  const [stackedEvents, setStackedEvents] = useState<EventModel[]>([]);
  const [expandedImageUrls, setExpandedImageUrls] = useState<string[]>([]);
  const [stackId, setStackId] = useState(0);

  // Mapbox Parameters
  const [mapboxAccessToken, setMapboxAccessToken] = useState();
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const mapContainer = useRef<any>(null);
  const mapMarkers = useRef<mapboxgl.Marker[]>([]);

  const handleFiltersSelected = (selectedFilters: string[]) => {
    setSelectedFilters(selectedFilters);
  };

  const handleNext = () => {
    setSelectedEventIdx((selectedEventIdx + 1) % eventsModel.length);
  };

  const handlePrev = () => {
    if (selectedEventIdx > 0) {
      setSelectedEventIdx((selectedEventIdx - 1) % eventsModel.length);
    }
  };

  const handleImageCollapsed = () => {
    setExpandedImageUrls([]);
    setStackedEvents([]);
    setStackId(0);
  };

  const handleBarClick = (data: CombinedTimelineModel) => {
    const time = data.time;
    if (time) {
      eventsModel.forEach((value: EventModel, index: number) => {
        if (time == value.time) {
          setSelectedEventIdx(index);
        }
      });
    }
  };

  const handleMomentSelectedFromPopup = async (moment: EventModel) => {
    const index = eventsModel.findIndex(
      (value: EventModel) => value.title === moment.title,
    );

    const candidateEvent = eventsModel[index];

    const eventStack = eventsMapModel.find((eventMapModel) =>
      compareMapModelLatLng(eventMapModel, candidateEvent),
    );
    const eventStackId = eventStack.events.findIndex(
      (event) => event.title === candidateEvent.title,
    );

    const imageUrls = await fetchImageUrls(
      eventStack.events[eventStackId].photoPointerSrc,
    );
    setExpandedImageUrls(imageUrls);

    setStackedEvents(eventStack.events);
    setStackId(eventStackId);
    setSelectedEventIdx(index);
  };

  const handleNextInStack = async () => {
    const nextStackId = (stackId + 1) % stackedEvents.length;
    const imageUrls = await fetchImageUrls(
      stackedEvents[nextStackId].photoPointerSrc,
    );

    setExpandedImageUrls(imageUrls);
    setStackId(nextStackId);
  };

  const handlePrevInStack = async () => {
    const nextStackId =
      stackId > 0
        ? (stackId - 1) % stackedEvents.length
        : stackedEvents.length - 1;

    const imageUrls = await fetchImageUrls(
      stackedEvents[nextStackId].photoPointerSrc,
    );

    setExpandedImageUrls(imageUrls);
    setStackId(nextStackId);
  };

  // Load data from Airtable and get mapbox access token safely
  useEffect(() => {
    const hasMatchingTag = (tags: string[], checks: string[]): boolean => {
      for (const tag of tags) {
        for (const check of checks) {
          if (tag === check) {
            return true;
          }
        }
      }
      return false;
    };

    const loadData = async () => {
      const response = await fetch("/api/airtable");
      const data = await response.json();
      cachedEvents.current = [...convertResponseToEventModel(data)];
      populateEventModels();
    };

    const populateEventModels = () => {
      const selectedTags = mapStringToTag(selectedFilters);

      const moments: EventModel[] = cachedEvents.current.filter(
        (moment: EventModel) => {
          return (
            selectedTags.length === 0 ||
            hasMatchingTag(moment.tags, selectedTags)
          );
        },
      );

      setEventsModel(moments);
      setEventsMapModel(combineToMapFormat(moments));
      setEventsTimelineModel(combineToTimelineFormat(moments));
    };

    const fetchToken = async () => {
      const response = await fetch("/api/mapbox");
      const data = await response.json();
      setMapboxAccessToken(data.token);
    };

    if (!cachedEvents.current) {
      loadData();
    } else {
      populateEventModels();
    }

    if (!mapboxgl.accessToken) {
      fetchToken();
    }
  }, [selectedFilters]);

  // Init map, markers, listeners once data is properly fetched from API.
  useEffect(() => {
    mapboxgl.accessToken = mapboxAccessToken;
    // Create map
    if (!mapRef.current && mapboxgl.accessToken) {
      mapRef.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: "mapbox://styles/mapbox/light-v11",
        center: [-80.52, 43.46],
        zoom: 2,
      });
    }

    const resetMap = () => {
      mapMarkers.current.forEach((marker) => {
        marker.remove();
      });
      mapMarkers.current = [];
    };

    const addNewMarkersToMap = (eventMapModel: CombinedMapModel) => {
      const mapMarker = new mapboxgl.Marker({
        color: configureMarkerColour(eventMapModel),
      })
        .setLngLat([eventMapModel.longitude, eventMapModel.latitude])
        .addTo(mapRef.current);

      mapMarker.getElement().addEventListener("click", (event) => {
        event.stopPropagation();
        const index = eventsModel.findIndex((value) =>
          compareMapModelLatLng(eventMapModel, value),
        );
        setSelectedEventIdx(index);
      });

      mapMarkers.current.push(mapMarker);
    };

    // Set all markers and click listeners
    if (mapRef.current) {
      resetMap();
      eventsMapModel.map(addNewMarkersToMap);
    }
  }, [eventsModel, mapboxAccessToken]);

  // Handle camera movement and popup upon a selected moment
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const eventMapModel = eventsMapModel.find((value: CombinedMapModel) =>
      compareMapModelLatLng(value, eventsModel[selectedEventIdx]),
    );
    if (!eventMapModel) return;

    const mapMarker = mapMarkers.current.find((value: mapboxgl.Marker) =>
      compareMarkerLatLng(value, eventMapModel),
    );

    // Skip if unable to find map marker or if the map marker is already showing a popup
    if (!mapMarker || (mapMarker.getPopup() && mapMarker.getPopup().isOpen()))
      return;

    mapRef.current.flyTo({
      center: [eventMapModel.longitude, eventMapModel.latitude],
      zoom: 11,
    });

    mapMarkers.current.forEach(removePopups);

    mapMarker.setPopup(
      new mapboxgl.Popup({ closeOnClick: true })
        .setLngLat([eventMapModel.longitude, eventMapModel.latitude])
        .setHTML(
          `<div className=${styles.popupContainer} id="popup-container"></div>`,
        )
        .addTo(map),
    );

    ReactDOM.createRoot(document.getElementById("popup-container")!).render(
      <PopupContent
        events={eventMapModel.events}
        onMomentSelected={handleMomentSelectedFromPopup}
      />,
    );

    // Update selected bar in the timeline
    const candidateBarTime = createBarTimeFromEvent(
      eventsModel[selectedEventIdx],
    );
    const eventsTimelineIndex = eventsTimelineModel.findIndex((value) => {
      return value.barTime.getTime() == candidateBarTime.getTime();
    });
    setSelectedBarIndex(eventsTimelineIndex);
  }, [selectedEventIdx]);

  return (
    <>
      <TopBar
        onFiltersSelected={handleFiltersSelected}
        initialFilters={selectedFilters}
      />
      {expandedImageUrls && expandedImageUrls.length > 0 && (
        <>
          <span
            onClick={handleImageCollapsed}
            className={styles.modalOverlay}
          ></span>
          <SelectedMomentModal
            events={stackedEvents}
            idx={stackId}
            expandedImageUrls={expandedImageUrls}
            handleNext={handleNextInStack}
            handlePrev={handlePrevInStack}
          />
        </>
      )}
      <div className={styles.pageContainer}>
        <div ref={mapContainer} className={styles.mapContainer} />
        <div className={styles.timelineContainer}>
          <div className={styles.chartContainer}>
            <EventsTimelineChart
              data={eventsTimelineModel}
              handleBarClick={handleBarClick}
              selectedBarIndex={selectedBarIndex}
            />
          </div>
          <div className={styles.buttonContainer}>
            <button className={styles.pinButton} onClick={handlePrev}>
              <img src="/prev.png" width={24} height={24} alt="Previous" />
            </button>
            <button className={styles.pinButton} onClick={handleNext}>
              <img src="/next.png" width={24} height={24} alt="Next" />
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default Home;
