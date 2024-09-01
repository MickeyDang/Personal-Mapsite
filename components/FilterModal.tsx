import React, { useState } from 'react';
import styles from '../styles/FilterModal.module.css';

interface FilterModalProps {
  onClose: (selectedFilters: string[]) => void; 
}

const FilterModal: React.FC<FilterModalProps> = ({ onClose }) => {
  const [selectedFilters, setSelectedFilters] = useState<string[]>([]);
  const handleCheckboxChange = (filter: string) => {
    if (selectedFilters.includes(filter)) {
      setSelectedFilters(selectedFilters.filter((f) => f !== filter));
    } else {
      setSelectedFilters([...selectedFilters, filter]);
    }
  };
  
  const filters = [
    'Nature',
    'Literature',
    'Urbanism',
    'Projects',
    'Food',
    'Work',
  ];
  
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
