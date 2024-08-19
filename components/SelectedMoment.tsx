import React, { useEffect, useState } from "react";
import { EventModel } from "../pages/data/types";
import styles from "../styles/SelectedMoment.module.css";

interface SelectedMomentProps {
  event: EventModel;
  onExpandImage: (imageUrl: string) => void;
}

const SelectedMoment: React.FC<SelectedMomentProps> = ({ event, onExpandImage }) => {
  const [imageUrl, setImageUrl] = useState("");

  useEffect(() => {
    if (event.photoPointerSrc) {
      const fetchImage = async () => {
        try {
          const response = await fetch(`/api/image?key=${event.photoPointerSrc}`);

          if (response.status == 200) {
            const data = await response.json();
            if (data) {
              setImageUrl(data.imageUrl);
            }
          } else {
            const reason = await response.json();
            console.error(
              `${response.status}. Reason: ${JSON.stringify(reason)}`,
            );
          }
        } catch (error) {
          console.error("Error fetching image:", error);
        }
      };
      if (!imageUrl) {
        fetchImage();
      }
    }
  }, [imageUrl]);

  const formatTime = (time) =>
    Intl.DateTimeFormat("en-US", {
      timeZone: "UTC",
      year: "numeric",
      month: "short",
      day: "numeric",
    }).format(time);

  return (
    <div className={styles.container}>
      {event.linkSrc && (
        <>
          <a target="_blank" href={event.linkSrc}>
            {event.linkTitle ?? "Link"}
          </a>
        </>
      )}
      <p className={styles.text}>{event.description}</p>
      {imageUrl && (
        <>
          {imageUrl && (
            <img
              className={styles.photo}
              src={imageUrl}
              alt={event.description}
              onClick={() => { onExpandImage(imageUrl); }}
            />
          )}
        </>
      )}
      <p>{formatTime(event.time)}</p>
    </div>
  );
};

export default SelectedMoment;
