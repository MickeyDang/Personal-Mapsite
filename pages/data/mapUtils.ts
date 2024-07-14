import mapboxgl from "mapbox-gl";
import { CombinedMapModel, EventModel } from "./types";

export const compareMarkerLatLng = (
  value: mapboxgl.Marker,
  marker: mapboxgl.Marker,
) => {
  return (
    value.getLngLat().lng == marker.longitude &&
    value.getLngLat().lat == marker.latitude
  );
};

export const compareMapModelLatLng = (a: CombinedMapModel, b: EventModel) =>
  a.longitude == b.longitude && a.latitude == b.latitude;

export const removePopups = (m: mapboxgl.Marker) => {
  if (m.getPopup()) {
    m.getPopup().remove();
  }
};

export const configureMarkerColour = (marker: CombinedMapModel) =>
  marker.events.length > 1 ? "gray" : marker.events[0].tags[0].valueOf();
