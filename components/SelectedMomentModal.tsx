import React from "react";
import { EventModel } from "../data/types";
import styles from "../styles/SelectedMomentModal.module.css";

interface SelectedMomentModalProps {
  events: EventModel[];
  idx: number;
  expandedImageUrls: string[];
  onImageCollapse: () => void;
  handlePrev: () => void;
  handleNext: () => void;
}

const SelectedMomentModal: React.FC<SelectedMomentModalProps> = ({
  events,
  idx,
  expandedImageUrls,
  onImageCollapse,
  handlePrev,
  handleNext,
}) => {
  const event = events[idx];

  const imageStyle =
    expandedImageUrls.length > 4
      ? styles.photoGrid6x
      : expandedImageUrls.length > 3
        ? styles.photoGrid4x
        : expandedImageUrls.length > 1
          ? styles.photoGrid3x
          : styles.photoGrid1x;

  const containerStyle =
    expandedImageUrls.length > 1
      ? styles.expandedMultiImage
      : styles.expandedSingleImage;

  return (
    <div className={containerStyle}>
      {event.linkSrc && (
        <div className={styles.singleLine}>
          <a target="_blank" href={event.linkSrc} className={styles.caption}>
            {event.linkTitle ?? "Link"}
          </a>
        </div>
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
      <div className={styles.singleLine}>
        <p className={styles.caption}>{event.description}</p>
      </div>
      {events.length > 1 && (
        <div className={styles.buttonContainer}>
          <button className={styles.pinButton} onClick={handlePrev}>
            {"<"}
          </button>
          <button className={styles.pinButton} onClick={handleNext}>
            {">"}
          </button>
        </div>
      )}
      <button className={styles.closeButton} onClick={onImageCollapse}>
        X
      </button>
    </div>
  );
};

export default SelectedMomentModal;
