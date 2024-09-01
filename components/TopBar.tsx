import React, { useState } from "react";
import styles from "../styles/TopBar.module.css";
import { FaLinkedin, FaTwitter, FaInstagram } from "react-icons/fa";
import FilterModal from './FilterModal';

interface TopBarProps {
  onFiltersSelected: (selectedFilters: string[]) => void; 
}

const TopBar: React.FC<TopBarProps> = ({onFiltersSelected}) => {
  const [showAboutModal, setShowAboutModal] = useState(false);
  const [showFilterModal, setShowFilterModal] = useState(false);
  
  const handleAboutModalClose = () => {
    setShowAboutModal(false);
  };
  
  const handleFilterModalClose = (selectedFilters: string[]) => {
    onFiltersSelected(selectedFilters);
    setShowFilterModal(false);
  };
  
  const handleFilterClick = () => {
    setShowFilterModal(true);
  };
  
  return (
    <div className={styles.topBar}>
      <div className={styles.meSection}>
        <img src="./MickeyBoston.jpg" alt="Mickey" className={styles.profileImage} />
        <h2>Mickey</h2>
      </div>
      <div className={styles.filterSection}>
        <button onClick={handleFilterClick}>Filter</button>
        {showFilterModal && (
          <FilterModal onClose={handleFilterModalClose} />
        )}
      </div>
      <div className={styles.aboutSection}>
        <button onClick={() => setShowAboutModal(true)}>About</button>
        {showAboutModal && (
          <>
            <div className={styles.aboutModal}>
              <button className={styles.closeButton} onClick={handleAboutModalClose}>X</button>
              {/* Add your "About" content here */}
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
