import React, { useState } from "react";
import styles from "../styles/TopBar.module.css";
import { FaLinkedin, FaTwitter, FaInstagram } from "react-icons/fa";
import FilterModal from "./FilterModal";
import AboutModal from "./AboutModal";

interface TopBarProps {
  onFiltersSelected: (selectedFilters: string[]) => void;
  initialFilters: string[];
  aiMode: boolean;
  onAiModeToggle: (enabled: boolean) => void;
}

const TopBar: React.FC<TopBarProps> = ({
  onFiltersSelected,
  initialFilters,
  aiMode,
  onAiModeToggle,
}) => {
  const [showAboutModal, setShowAboutModal] = useState(true);

  const handleAboutModalClose = () => {
    setShowAboutModal(false);
  };

  const handleAboutModalOpen = () => {
    setShowAboutModal(true);
  };

  const handleFilterChange = (selectedFilters: string[]) => {
    onFiltersSelected(selectedFilters);
  };

  return (
    <div className={styles.topBar}>
      <div className={styles.filterSection}>
        <FilterModal
          onFilterChange={handleFilterChange}
          initialFilters={initialFilters}
        />
      </div>
      <div className={styles.meSection}>
        <img
          src="./MickeyHeadshot.jpg"
          alt="Mickey"
          className={styles.profileImage}
        />
        <h3>Mickey</h3>
      </div>
      <div className={styles.aiToggleSection}>
        <span className={styles.toggleLabel}>AI</span>
        <label className={styles.toggleSwitch}>
          <input
            type="checkbox"
            checked={aiMode}
            onChange={(e) => onAiModeToggle(e.target.checked)}
          />
          <span className={styles.toggleSlider}></span>
        </label>
      </div>
      <div className={styles.aboutSection}>
        <button className={styles.topBarButton} onClick={handleAboutModalOpen}>
          About
        </button>
        {showAboutModal && (
          <>
            <AboutModal />
            <span
              onClick={handleAboutModalClose}
              className={styles.modalOverlay}
            ></span>
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
