import type { NextPage } from "next";
import styles from "../styles/Home.module.css";
import { useRef, useState, useEffect } from "react";
import mapboxgl from "mapbox-gl";
import ReactDOM from "react-dom/client";
import PopupContent from "../components/PopupContent";
import { format } from "date-fns";
import {
  CombinedMapModel,
  CombinedTimelineModel,
  combineToMapFormat,
  combineToTimelineFormat,
  EventModel,
  mapStringToTag,
} from "../data/types";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { convertResponseToEventModel } from "../data/requests";
import {
  compareMapModelLatLng,
  compareMarkerLatLng,
  configureMarkerColour,
  removePopups,
} from "../data/mapUtils";
import SelectedMomentModal from "../components/SelectedMomentModal";
import TopBar from "../components/TopBar";

const Home: NextPage = () => {
  const [selectedEventIdx, setSelectedEventIdx] = useState(0);
  const [mapboxAccessToken, setMapboxAccessToken] = useState();
  const [eventsModel, setEventsModel] = useState<EventModel[]>([]);
  const [eventsMapModel, setEventsMapModel] = useState<CombinedMapModel[]>([]);
  const [eventsTimelineModel, setEventsTimelineModel] = useState<
    CombinedTimelineModel[]
  >([]);
  const [expandedImageUrls, setExpandedImageUrls] = useState<string[]>([]);
  const [selectedFilters, setSelectedFilters] = useState<string[]>([]);

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

  const handleImageExpanded = (imageUrls: string[]) => {
    setExpandedImageUrls(imageUrls);
  };

  const handleImageCollapsed = () => {
    setExpandedImageUrls([]);
  };

  const handleBarClick = (data: any) => {
    const time = data.time;
    if (time) {
      eventsModel.forEach((value: EventModel, index: number) => {
        if (time == value.time) {
          setSelectedEventIdx(index);
        }
      });
    }
  };

  const handleMomentSelectedFromPopup = (moment: EventModel) => {
    const index = eventsModel.findIndex(
      (value: EventModel) => value.title === moment.title,
    );
    setSelectedEventIdx(index);
  };

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

  // Load data from Airtable and get mapbox access token safely
  useEffect(() => {
    console.log(JSON.stringify(selectedFilters));

    const loadData = async () => {
      const response = await fetch("/api/airtable");
      const data = await response.json();

      const selectedTags = mapStringToTag(selectedFilters);
      const moments: EventModel[] = convertResponseToEventModel(data).filter(
        (moment: EventModel) => {
          return selectedTags.length === 0 || hasMatchingTag(moment.tags, selectedTags);
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

    loadData();
    
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
        zoom: 5,
      });
    }

    const resetMap = () => {
      mapMarkers.current.forEach(marker => {
        marker.remove();
      });
      mapMarkers.current = [];
    }

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
        numEvents={eventMapModel.numEvents}
        onMomentSelected={handleMomentSelectedFromPopup}
        onExpandImage={handleImageExpanded}
      />,
    );
  }, [selectedEventIdx]);

  const CustomTooltip = ({ payload }) => {
    if (payload && payload.length) {
      const label = payload[0].payload.time;
      return (
        <div className={styles.tooltip}>
          <p>{format(new Date(label), "MMM yyyy")}</p>
        </div>
      );
    }
  };

  return (
    <>
      <TopBar onFiltersSelected={handleFiltersSelected} initialFilters={selectedFilters} />
      {expandedImageUrls && expandedImageUrls.length > 0 && (
        <>
          <div className={styles.modalOverlay}></div>
          <SelectedMomentModal
            event={eventsModel[selectedEventIdx]}
            expandedImageUrls={expandedImageUrls}
            onImageCollapse={handleImageCollapsed}
          />
        </>
      )}
      <div className={styles.pageContainer}>
        <div ref={mapContainer} className={styles.mapContainer} />
        <div className={styles.timelineContainer}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={eventsTimelineModel}
              margin={{
                top: 20,
                right: 30,
                left: 20,
                bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="barTime"
                scale="time"
                domain={["auto", "auto"]}
                tickFormatter={(date) => format(date, "MMM yyyy")}
              />
              <YAxis />
              <Tooltip
                content={({ payload }) => <CustomTooltip payload={payload} />}
              />
              <Legend
                formatter={(value) => {
                  switch (value) {
                    case "numEvents":
                      return "Moments";
                    default:
                      return value;
                  }
                }}
              />
              <Bar
                dataKey="numEvents"
                stackId="a"
                fill="#8884d8"
                onClick={(event: any) => handleBarClick(event)}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className={styles.buttonContainer}>
          <button className={styles.pinButton} onClick={handlePrev}>
            {"<"}
          </button>
          <button className={styles.pinButton} onClick={handleNext}>
            {">"}
          </button>
        </div>
      </div>
    </>
  );
};

export default Home;
