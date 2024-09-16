import React, { useState } from 'react';
import styles from '../styles/FilterModal.module.css';
import { Tag } from '../data/types';

interface FilterModalProps {
  onClose: (selectedFilters: string[]) => void; 
  initialFilters: string[];
}

const FilterModal: React.FC<FilterModalProps> = ({ onClose, initialFilters }) => {
  const [selectedFilters, setSelectedFilters] = useState<string[]>(initialFilters);
  const handleCheckboxChange = (filter: string) => {
    if (selectedFilters.includes(filter)) {
      setSelectedFilters(selectedFilters.filter((f) => f !== filter));
    } else {
      setSelectedFilters([...selectedFilters, filter]);
    }
  };
  
  const filters = Object.keys(Tag).filter(key => isNaN(Number(key)) && key !== "None");
  
  return (
    <div className={styles.filterModal}>
      <div className={styles.filterGrid}>
        {filters.map((filter) => (
          <div key={filter} className={styles.filterItem}>
            <input
              type="checkbox"
              id={filter}
              checked={selectedFilters.includes(filter)}
              onChange={() => handleCheckboxChange(filter)}
            />
            <label htmlFor={filter}>{filter}</label>
          </div>
        ))}
      </div>
      <button className={styles.closeButton} onClick={() => onClose(selectedFilters)}>Apply</button>
    </div>
  );
};
export default FilterModal;
