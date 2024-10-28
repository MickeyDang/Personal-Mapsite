import React from "react";
import { EventModel } from "../data/types";
import MomentSelector from "./MomentSelector";

interface PopupContentProps {
  events: EventModel[];
  onMomentSelected: (event: EventModel) => void;
}

const PopupContent: React.FC<PopupContentProps> = ({
  events,
  onMomentSelected,
}) => {
  const handleMomentSelected = (key: String) => {
    const moment = events.find((value: EventModel) => value.title === key);
    if (!moment)
      console.error(
        `Could not find a moment matching the provided title: ${key}`,
      );
    onMomentSelected(moment);
  };

  return (
    <MomentSelector events={events} onMomentSelected={handleMomentSelected} />
  );
};

export default PopupContent;
