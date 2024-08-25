import React, { useEffect, useState } from "react";
import { EventModel } from "../data/types";
import styles from "../styles/SelectedMoment.module.css";

interface SelectedMomentProps {
  event: EventModel;
  onExpandImage: (imageUrls: string[]) => void;
}

const SelectedMoment: React.FC<SelectedMomentProps> = ({
  event,
  onExpandImage,
}) => {
  const [imageUrls, setImageUrls] = useState<string[] | null>(null);

  useEffect(() => {
    if (event.photoPointerSrc) {
      const fetchImage = async () => {
        try {
          const response = await fetch(
            `/api/image?key=${event.photoPointerSrc}`,
          );
          if (response.status == 200) {
            const data = await response.json();
            if (data) {
              console.log(JSON.stringify(data));
              setImageUrls(data.imageUrls);
            } else {
              setImageUrls([]);
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
      if (!imageUrls) {
        fetchImage();
      }
    }
  }, [imageUrls]);

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
      {imageUrls && imageUrls.length > 0 && (
        <img
          className={styles.photo}
          src={imageUrls[0]}
          alt={event.description}
          onClick={() => {
            onExpandImage(imageUrls);
          }}
        />
      )}
      <p>{formatTime(event.time)}</p>
    </div>
  );
};

export default SelectedMoment;
