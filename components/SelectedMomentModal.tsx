import React from "react";
import { EventModel, Tag } from "../data/types";
import styles from "../styles/SelectedMomentModal.module.css";

interface SelectedMomentModalProps {
  events: EventModel[];
  idx: number;
  expandedImageUrls: string[];
  handlePrev: () => void;
  handleNext: () => void;
}

const SelectedMomentModal: React.FC<SelectedMomentModalProps> = ({
  events,
  idx,
  expandedImageUrls,
  handlePrev,
  handleNext,
}) => {
  const event = events[idx];

  const imageStyle = events[idx].tags.includes(Tag.Literature)
    ? styles.litPreviewGrid
    : expandedImageUrls.length > 4
      ? styles.photoGrid6x
      : expandedImageUrls.length > 1
        ? styles.photoGrid4x
        : styles.photoGrid1x;

  const containerStyle = events[idx].tags.includes(Tag.Literature)
    ? styles.expandedLitPreviews
    : styles.expandedImages;

  return (
    <div className={containerStyle}>
      <div className={styles.singleLine}>
        <p className={styles.caption}>{event.time.toLocaleDateString()}</p>
      </div>
      <div className={styles.buttonContainer}>
        {events.length > 1 && (
          <button className={styles.pinButton} onClick={handlePrev}>
            {"<"}
          </button>
        )}
        <div className={imageStyle}>
          {expandedImageUrls.map((imageUrl: string, index: number) => (
            <img
              key={index}
              className={styles.photo}
              src={imageUrl}
              alt={`Photo ${index + 1}`}
            />
          ))}
        </div>
        {events.length > 1 && (
          <button className={styles.pinButton} onClick={handleNext}>
            {">"}
          </button>
        )}
      </div>
      <div className={styles.singleLine}>
        <p className={styles.caption}>{event.description}</p>
      </div>
      {event.linkSrc && (
        <div className={styles.singleLine}>
          <a target="_blank" href={event.linkSrc} className={styles.caption}>
            {event.linkTitle ?? "Link"}
          </a>
        </div>
      )}
    </div>
  );
};

export default SelectedMomentModal;
