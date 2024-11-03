import React, { useEffect, useRef, useState } from "react";
import styles from "../styles/FilterModal.module.css";
import { Tag } from "../data/types";

interface FilterModalProps {
  onFilterChange: (selectedFilters: string[]) => void;
  initialFilters: string[];
}

const FilterModal: React.FC<FilterModalProps> = ({
  onFilterChange: onClose,
  initialFilters,
}) => {
  const [selectedFilters, setSelectedFilters] =
    useState<string[]>(initialFilters);
  const debounceTimeout = useRef<NodeJS.Timeout | null>(null);

  const filterOptions = Object.keys(Tag).filter(
    (key) => isNaN(Number(key)) && key !== "None",
  );

  const handleFilterChange = (filter: string) => {
    if (selectedFilters.includes(filter)) {
      setSelectedFilters(selectedFilters.filter((f) => f !== filter));
    } else {
      setSelectedFilters([...selectedFilters, filter]);
    }
  };

  useEffect(() => {
    // Clear any existing debounce timeout
    if (debounceTimeout.current) {
      clearTimeout(debounceTimeout.current);
    }

    // Set a new debounce timeout
    if (selectedFilters != initialFilters) {
      debounceTimeout.current = setTimeout(() => {
        onClose(selectedFilters);
      }, 400); // 0.4 seconds delay
    }
  }, [selectedFilters]);

  const processFilterWords = (filter: string) => {
    if (filter === "Literature") return "Read & Write";
    if (filter === "Urbanism") return "Urban Pics";
    return filter;
  };

  return (
    <div className={styles.filterModal}>
      <div className={styles.filterGrid}>
        {filterOptions.map((filter) => (
          <button
            key={filter}
            className={[
              styles.filterItem,
              selectedFilters.includes(filter) ? styles.selected : "",
            ].join(" ")}
            onClick={() => handleFilterChange(filter)}
          >
            {processFilterWords(filter)}
          </button>
        ))}
      </div>
    </div>
  );
};
export default FilterModal;
