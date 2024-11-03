import React from "react";
import { EventModel } from "../data/types";
import styles from "../styles/MomentSelector.module.css";

interface MomentSelectorProps {
  events: EventModel[];
  onMomentSelected: (key: String) => void;
}

const MomentSelector: React.FC<MomentSelectorProps> = ({
  events,
  onMomentSelected,
}) => {
  const handleMomentSelected = (idx: number) => {
    onMomentSelected(events[idx].title);
  };

  const formatTime = (time) =>
    Intl.DateTimeFormat("en-US", {
      timeZone: "UTC",
      year: "numeric",
      month: "short",
      day: "numeric",
    }).format(time);

  return (
    <div className={styles.container}>
      {events.map((event: EventModel, idx: number) => (
        <button
          key={idx}
          className={styles.row}
          onClick={() => handleMomentSelected(idx)}
        >
          <p className={styles.selectorText}>
            #{idx + 1}: {event.title} ({formatTime(event.time)})
          </p>
        </button>
      ))}
    </div>
  );
};

export default MomentSelector;
