import mapboxgl from "mapbox-gl";
import { CombinedMapModel, EventModel } from "./types";

const latlngEquals = (a: String, b: String) => {
  const n = Number(a);
  const m = Number(b);
  return n === m || n === 180 + (180 + m) || m === 180 + (180 + n);
};

export const compareMarkerLatLng = (
  value: mapboxgl.Marker,
  eventMapModel: CombinedMapModel,
) => {
  return (
    latlngEquals(
      Number(value.getLngLat().lng).toPrecision(10),
      Number(eventMapModel.longitude).toPrecision(10),
    ) &&
    latlngEquals(
      Number(value.getLngLat().lat).toPrecision(10),
      Number(eventMapModel.latitude).toPrecision(10),
    )
  );
};

export const compareMapModelLatLng = (a: CombinedMapModel, b: EventModel) => {
  return a.longitude == b.longitude && a.latitude == b.latitude;
};

export const removePopups = (m: mapboxgl.Marker) => {
  if (m.getPopup()) {
    m.getPopup().remove();
  }
};

export const configureMarkerColour = (marker: CombinedMapModel) =>
  marker.events.length > 1 ? "gray" : marker.events[0].tags[0].valueOf();
