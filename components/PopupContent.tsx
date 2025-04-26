import React, { useEffect } from "react";
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

  useEffect(() => {
    if (events.length === 1) handleMomentSelected(events[0].title);
  });
  
  return (
    <MomentSelector events={events} onMomentSelected={handleMomentSelected} />
  );
};

export default PopupContent;
