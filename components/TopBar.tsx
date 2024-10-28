import React, { useState } from "react";
import styles from "../styles/TopBar.module.css";
import { FaLinkedin, FaTwitter, FaInstagram } from "react-icons/fa";
import FilterModal from './FilterModal';

interface TopBarProps {
  onFiltersSelected: (selectedFilters: string[]) => void; 
  initialFilters: string[];
}

const TopBar: React.FC<TopBarProps> = ({onFiltersSelected, initialFilters}) => {
  const [showAboutModal, setShowAboutModal] = useState(false);
  const [showFilterModal, setShowFilterModal] = useState(false);
  
  const handleAboutModalClose = () => {
    setShowAboutModal(false);
  };
  
  const handleFilterChange = (selectedFilters: string[]) => {
    onFiltersSelected(selectedFilters);
  };
  
  const handleFilterClick = () => {
    setShowFilterModal(!showFilterModal);
  };
  
  return (
    <div className={styles.topBar}>
      <div className={styles.filterSection}>
        <button className={styles.filtersViewButton} onClick={handleFilterClick}>
          {showFilterModal ? "X" : "Filters"}
        </button>
        {showFilterModal && (
          <FilterModal onFilterChange={handleFilterChange} initialFilters={initialFilters}/>
        )}
      </div>
      <div className={styles.meSection}>
        <img src="./MickeyBoston.jpg" alt="Mickey" className={styles.profileImage} />
        <h3>Mickey</h3>
      </div>
      <div className={styles.aboutSection}>
        <button className={styles.topBarButton} onClick={() => setShowAboutModal(true)}>About</button>
        {showAboutModal && (
          <>
            <div className={styles.aboutModal}>
              <button className={styles.closeButton} onClick={handleAboutModalClose}>X</button>
              <h3>Hi there!</h3>
              <p>Anyone who knows me well from university will know that I&apos;ve always had a soft spot for maps and geospatial data visualizations. I wanted this personal website to be an extension of that interest.</p>
              <li>Here, you&apos;ll see a collection of &quot;lists&quot; that share a different peice of &quot;me&quot;: my favourite places, my outdoor & indoor hobbies, the projects I&apos;ve worked on, and subtle realizations.</li>
              <li>Each story is represented both as a pin on a map and as a point in my past timeline.</li>
              <p>You, lucky reader, can explore those little moments which I&apos;ve curated through space and time.</p>
              <span className={styles.aboutTools}>Made with Next.js, Mapbox, and Airtable.</span>
            </div>
            <div className={styles.modalOverlay}></div>
          </>
        )}
      </div>
      <div className={styles.socialSection}>
        <a
          href="https://www.linkedin.com/in/mickeydang/"
          target="_blank"
          rel="noopener noreferrer"
        >
          <FaLinkedin className={styles.socialIcon} />
        </a>
        <a
          href="https://twitter.com/_MickeyDang"
          target="_blank"
          rel="noopener noreferrer"
        >
          <FaTwitter className={styles.socialIcon} />
        </a>
        <a
          href="https://www.instagram.com/mickeymdang/"
          target="_blank"
          rel="noopener noreferrer"
        >
          <FaInstagram className={styles.socialIcon} />
        </a>
      </div>
    </div>
  );
};
export default TopBar;
