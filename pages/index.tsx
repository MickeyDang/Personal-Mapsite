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
} from "./data/types";
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
import { convertResponseToEventModel } from "./data/requests";
import {
  compareMapModelLatLng,
  compareMarkerLatLng,
  configureMarkerColour,
  removePopups,
} from "./data/mapUtils";
import SelectedMomentModal from "../components/SelectedMomentModal";

/**
 * TODOs:
 * 1. Add a filter based on tags and level of minutia (maybe this affects bar chart colours too).
 * ~~2. Make the tooltip in bar chart more helpful (show "MMM, YYYY").~~
 * 3. Support multiple photos per memory and enable a drilldown flow after the popup to display a dynamic grid of photos (plus the original description).
 * 4. Make the styling of the popup, bar chart, next / previous buttons, and drilldown modal better.
 * 5. Add an overall "about" explainer for the project.
 * 6. Improve performance as the # of rows scales (might get hard to search & render popups).
 * 7. Add an MVP amount of data (maybe ~60 moments).
 * 8. Deploy and buy domain.
 */
const Home: NextPage = () => {
  const [selectedEventIdx, setSelectedEventIdx] = useState(0);
  const [mapboxAccessToken, setMapboxAccessToken] = useState();
  const [eventsModel, setEventsModel] = useState<EventModel[]>([]);
  const [eventsMapModel, setEventsMapModel] = useState<CombinedMapModel[]>([]);
  const [eventsTimelineModel, setEventsTimelineModel] = useState<
    CombinedTimelineModel[]
  >([]);
  const [expandedImageUrls, setExpandedImageUrls] = useState<string[]>([]);

  const mapRef = useRef<mapboxgl.Map | null>(null);
  const mapContainer = useRef<any>(null);
  const mapMarkers = useRef<mapboxgl.Marker[]>([]);

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

  // Load data from Airtable and get mapbox access token safely
  useEffect(() => {
    const loadData = async () => {
      const response = await fetch("/api/airtable");
      const data = await response.json();

      const moments: EventModel[] = convertResponseToEventModel(data);
      setEventsModel(moments);
      setEventsMapModel(combineToMapFormat(moments));
      setEventsTimelineModel(combineToTimelineFormat(moments));
    };

    const fetchToken = async () => {
      const response = await fetch("/api/mapbox");
      const data = await response.json();
      setMapboxAccessToken(data.token);
    };

    if (eventsModel.length === 0) {
      loadData();
    }

    if (!mapboxgl.accessToken) {
      fetchToken();
    }
  });

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

    // Set all markers and listeners when clicked
    if (mapRef.current) {
      eventsMapModel.map((eventMapModel: CombinedMapModel) => {
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
      });
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
