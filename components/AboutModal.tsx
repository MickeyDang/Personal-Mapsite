import React from "react";
import styles from "../styles/AboutModal.module.css";

const AboutModal: React.FC = () => {
  return (
    <div className={styles.aboutModal}>
      <div>
        <img
          src="./MickeyHeadshot.jpg"
          alt="Mickey"
          className={styles.profileImage}
        />
      </div>
      <div className={styles.textSection}>
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
        <span className={`${styles.aboutTools} ${styles.aboutAiNote}`}>
          This site was built &quot;organically&quot; before 2022: hand-coded,
          no coding agents. Toggle AI Mode to see the post-2025 version, built
          with Claude Code.
        </span>
      </div>
      
    </div>
  );
};
export default AboutModal;
