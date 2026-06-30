import React from 'react';

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
  return (
    <div style={{
      display: 'flex',
      flexWrap: 'wrap',
      gap: 'var(--spacing-base)',
      alignItems: 'center',
      marginBottom: 'var(--spacing-xl)',
      background: 'var(--bg-card)',
      border: '1px solid var(--border-primary)',
      padding: 'var(--spacing-base)',
      borderRadius: 'var(--radius-lg)'
    }}>
      {/* Search Input */}
      <div style={{ flex: '1 1 300px', position: 'relative' }}>
        <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', opacity: 0.5 }}>🔍</span>
        <input
          type="text"
          className="input"
          placeholder={searchPlaceholder}
          value={searchValue}
          onChange={(e) => onSearchChange(e.target.value)}
          style={{ paddingLeft: '2.25rem' }}
        />
      </div>

      {/* Category Filter */}
      {categories.length > 0 && (
        <div style={{ flex: '0 1 200px' }}>
          <select
            className="input select"
            value={selectedCategory}
            onChange={(e) => onCategoryChange(e.target.value)}
          >
            <option value="All">All Categories</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
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
          >
            {sortOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
      )}
    </div>
  );
}
