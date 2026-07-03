import React, { useState } from 'react';

interface SearchFilterProps {
  searchPlaceholder?: string;
  searchValue: string;
  onSearchChange: (value: string) => void;
  categories?: string[];
  selectedCategory: string;
  onCategoryChange: (value: string) => void;
  sortOptions?: { label: string; value: string }[];
  selectedSort: string;
  onSortChange: (value: string) => void;
}

export default function SearchFilter({
  searchPlaceholder = 'Search...',
  searchValue,
  onSearchChange,
  categories = [],
  selectedCategory,
  onCategoryChange,
  sortOptions = [],
  selectedSort,
  onSortChange
}: SearchFilterProps) {
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  return (
    <div style={{
      display: 'flex',
      flexWrap: 'wrap',
      gap: 'var(--spacing-base)',
      alignItems: 'center',
      marginBottom: 'var(--spacing-xl)',
      background: '#ffffff',
      border: '1px solid #e5e5e5',
      padding: 'var(--spacing-base)',
      borderRadius: 'var(--radius-lg)',
      boxShadow: 'var(--shadow-premium)'
    }}>
      {/* Search Input */}
      <div style={{ flex: '1 1 300px', position: 'relative' }}>
        <span style={{ 
          position: 'absolute', 
          left: '14px', 
          top: '50%', 
          transform: 'translateY(-50%)', 
          opacity: isSearchFocused ? 0.8 : 0.4,
          fontSize: '0.85rem',
          transition: 'opacity 0.2s ease'
        }}>🔍</span>
        <input
          type="text"
          className="input"
          placeholder={searchPlaceholder}
          value={searchValue}
          onChange={(e) => onSearchChange(e.target.value)}
          onFocus={() => setIsSearchFocused(true)}
          onBlur={() => setIsSearchFocused(false)}
          style={{ 
            paddingLeft: '2.5rem',
            background: isSearchFocused ? '#ffffff' : '#f4f4f5',
            borderColor: isSearchFocused ? '#171717' : '#e5e5e5',
            boxShadow: isSearchFocused ? '0 0 0 2px rgba(0, 0, 0, 0.08)' : 'none',
            borderRadius: 'var(--radius-md)',
            transition: 'all 0.25s ease'
          }}
        />
      </div>

      {/* Category Filter */}
      {categories.length > 0 && (
        <div style={{ flex: '0 1 200px' }}>
          <select
            className="input select"
            value={selectedCategory}
            onChange={(e) => onCategoryChange(e.target.value)}
            style={{
              backgroundColor: '#f4f4f5',
              borderColor: '#e5e5e5',
              borderRadius: 'var(--radius-md)',
              cursor: 'pointer'
            }}
          >
            <option value="All" style={{ background: 'var(--bg-secondary)', color: 'var(--text-primary)' }}>All Categories</option>
            {categories.map((cat) => (
              <option key={cat} value={cat} style={{ background: 'var(--bg-secondary)', color: 'var(--text-primary)' }}>{cat}</option>
            ))}
          </select>
        </div>
      )}

      {/* Sort Option */}
      {sortOptions.length > 0 && (
        <div style={{ flex: '0 1 200px' }}>
          <select
            className="input select"
            value={selectedSort}
            onChange={(e) => onSortChange(e.target.value)}
            style={{
              backgroundColor: '#f4f4f5',
              borderColor: '#e5e5e5',
              borderRadius: 'var(--radius-md)',
              cursor: 'pointer'
            }}
          >
            {sortOptions.map((opt) => (
              <option key={opt.value} value={opt.value} style={{ background: 'var(--bg-secondary)', color: 'var(--text-primary)' }}>{opt.label}</option>
            ))}
          </select>
        </div>
      )}
    </div>
  );
}
