import React from "react";
import { EventModel } from "../data/types";
import styles from "../styles/SelectedMomentModal.module.css";

interface SelectedMomentModalProps {
  event: EventModel;
  expandedImageUrls: string[];
  onImageCollapse: () => void;
}

const SelectedMomentModal: React.FC<SelectedMomentModalProps> = ({ event, expandedImageUrls, onImageCollapse }) => {
  
  return (
    <div className={styles.expandedImage}>
      <div className={styles.photoGrid}>
        {expandedImageUrls.map((imageUrl: string, index: number) => (
          <img key={index} className={styles.photo} src={imageUrl} alt={`Photo ${index + 1}`} />
        ))}
      </div>
      <div className={styles.singleLine}>
          <p className={styles.caption}>
            {event.description}
          </p>
      </div>
      <button
        className={styles.closeButton}
        onClick={onImageCollapse}
      >
        X
      </button>
    </div>
  );
};

export default SelectedMomentModal;
