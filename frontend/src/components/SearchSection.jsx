import React from 'react';
import '../styles/search.css';

const SearchSection = ({ onFiltersChange }) => {
  const [search, setSearch] = React.useState('');
  const [eventType, setEventType] = React.useState('');

  const handleSearch = (value) => {
    setSearch(value);
    onFiltersChange({ search: value, event_type: eventType });
  };

  const handleTypeChange = (value) => {
    setEventType(value);
    onFiltersChange({ search, event_type: value });
  };

  return (
    <section className="search-section">
      <div className="search-container">
        <input
          type="text"
          placeholder="Search for events..."
          value={search}
          onChange={(e) => handleSearch(e.target.value)}
          className="search-input"
        />
        <select
          value={eventType}
          onChange={(e) => handleTypeChange(e.target.value)}
          className="select-input"
        >
          <option value="">All Events</option>
          <option value="Movie">Movie</option>
          <option value="IPL">IPL</option>
          <option value="Concert">Concert</option>
          <option value="Show">Show</option>
          <option value="Sports">Sports</option>
        </select>
      </div>
    </section>
  );
};

export default SearchSection;
