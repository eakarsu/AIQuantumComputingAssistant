import React, { useState, useEffect, useRef } from 'react';
import { FiSearch, FiX, FiFilter } from 'react-icons/fi';

function SearchBar({ onSearch, onFilter, statusOptions, categories }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({ status: '', category: '', startDate: '', endDate: '' });
  const debounceRef = useRef(null);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      onSearch(searchTerm);
    }, 300);
    return () => clearTimeout(debounceRef.current);
  }, [searchTerm, onSearch]);

  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilter(newFilters);
  };

  const clearFilters = () => {
    const empty = { status: '', category: '', startDate: '', endDate: '' };
    setFilters(empty);
    onFilter(empty);
  };

  const hasActiveFilters = Object.values(filters).some(v => v !== '');

  return (
    <div className="search-bar-container">
      <div className="search-bar-row">
        <div className="search-input-wrapper">
          <FiSearch className="search-icon" />
          <input
            type="text"
            className="search-input"
            placeholder="Search records..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {searchTerm && (
            <button className="search-clear" onClick={() => setSearchTerm('')}>
              <FiX />
            </button>
          )}
        </div>
        <button
          className={`btn btn-secondary btn-sm filter-toggle ${hasActiveFilters ? 'filter-active' : ''}`}
          onClick={() => setShowFilters(!showFilters)}
        >
          <FiFilter /> Filters {hasActiveFilters && <span className="filter-badge" />}
        </button>
      </div>
      {showFilters && (
        <div className="filter-panel">
          <div className="filter-row">
            {statusOptions && statusOptions.length > 0 && (
              <div className="filter-group">
                <label className="filter-label">Status</label>
                <select
                  className="filter-select"
                  value={filters.status}
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                >
                  <option value="">All Statuses</option>
                  {statusOptions.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            )}
            <div className="filter-group">
              <label className="filter-label">Category</label>
              <input
                type="text"
                className="filter-input"
                placeholder="Filter by category..."
                value={filters.category}
                onChange={(e) => handleFilterChange('category', e.target.value)}
              />
            </div>
            <div className="filter-group">
              <label className="filter-label">From Date</label>
              <input
                type="date"
                className="filter-input"
                value={filters.startDate}
                onChange={(e) => handleFilterChange('startDate', e.target.value)}
              />
            </div>
            <div className="filter-group">
              <label className="filter-label">To Date</label>
              <input
                type="date"
                className="filter-input"
                value={filters.endDate}
                onChange={(e) => handleFilterChange('endDate', e.target.value)}
              />
            </div>
          </div>
          {hasActiveFilters && (
            <button className="btn btn-text btn-sm clear-filters" onClick={clearFilters}>
              <FiX /> Clear all filters
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export default SearchBar;
