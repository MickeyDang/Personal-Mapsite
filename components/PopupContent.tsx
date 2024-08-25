import React, { useState } from "react";
import { EventModel } from "../data/types";
import MomentSelector from "./MomentSelector";
import SelectedMoment from "./SelectedMoment";

interface PopupContentProps {
  events: EventModel[];
  numEvents: number;
  onMomentSelected: (event: EventModel) => void;
  onExpandImage: (imageUrls: string[]) => void;
}

const PopupContent: React.FC<PopupContentProps> = ({ events, numEvents, onMomentSelected, onExpandImage }) => {
  const [selectedMoment, setSelectedMoment] = useState<EventModel | null>();
  
  const handleMomentSelected = (key: String) => {
    const moment = events.find((value: EventModel) => value.title === key);
    if (!moment) console.error(`Could not find a moment matching the provided title: ${key}`);
    setSelectedMoment(moment);
    onMomentSelected(moment);
  }

  return (
    <>
      {(numEvents === 1) && <SelectedMoment event={events[0]} onExpandImage={onExpandImage}/>}
      {(numEvents > 1 && !selectedMoment) && <MomentSelector events={events} onMomentSelected={handleMomentSelected} />}
      {(numEvents) > 1 && selectedMoment && <SelectedMoment event={selectedMoment} onExpandImage={onExpandImage} />}
    </>
  );
};

export default PopupContent;
