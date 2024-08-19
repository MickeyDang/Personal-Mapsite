import React from "react";
import { EventModel } from "../pages/data/types";
import styles from "../styles/SelectedMomentModal.module.css";

interface SelectedMomentModalProps {
  event: EventModel;
  expandedImageUrl: string;
  onImageCollapse: () => void;
}

const SelectedMomentModal: React.FC<SelectedMomentModalProps> = ({ event, expandedImageUrl, onImageCollapse }) => {
  
  return (
    <div className={styles.expandedImage}>
      <img className={styles.photo} src={expandedImageUrl} />
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
