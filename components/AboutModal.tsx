import React from "react";
import styles from "../styles/AboutModal.module.css";

const AboutModal: React.FC = () => {
  return (
    <div className={styles.aboutModal}>
      <h3>Hi there!</h3>
      <p>
        Ever since entering university, I&apos;ve always had a soft spot for
        maps and geospatial data visualizations. I wanted this personal website
        to be an extension of that interest.
      </p>
      <p>
        Here, you&apos;ll find a collection of lists that share a different
        piece of &quot;me&quot;: my favourite places, my hobbies,{" "}
        <a target="_blank" href="https://github.com/MickeyDang">
          the projects I&apos;ve worked on
        </a>
        , fun reads, and{" "}
        <a target="_blank" href="https://mickeymdang.substack.com/">
          occasional writing
        </a>
        .
      </p>
      <p>
        Each item in the list is represented both as a pin on the map and a point on the timeline.
      </p>
      <p>
        Feel free to explore these curated moments through space and time... literally & figuratively.
      </p>
      <span className={styles.aboutTools}>
        Made in 🇨🇦 with Typescript, Next.js, Mapbox, and Airtable.
      </span>
    </div>
  );
};
export default AboutModal;
