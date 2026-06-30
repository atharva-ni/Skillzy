'use client';

import React, { useState } from 'react';
import { mockCourses } from '@/data/mock';
import CourseCard from '@/components/ui/CourseCard';
import SearchFilter from '@/components/ui/SearchFilter';

export default function CourseCatalog() {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [sortBy, setSortBy] = useState('rating');

  const categories = Array.from(new Set(mockCourses.map((c) => c.category)));

  const filteredCourses = mockCourses
    .filter((course) => course.status === 'published')
    .filter((course) => {
      const matchesSearch = course.title.toLowerCase().includes(search.toLowerCase()) ||
                            course.instructor.toLowerCase().includes(search.toLowerCase());
      const matchesCategory = category === 'All' || course.category === category;
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      if (sortBy === 'rating') return b.rating - a.rating;
      if (sortBy === 'price-low') return a.price - b.price;
      if (sortBy === 'price-high') return b.price - a.price;
      return 0;
    });

  const sortOptions = [
    { label: 'Highest Rated', value: 'rating' },
    { label: 'Price: Low to High', value: 'price-low' },
    { label: 'Price: High to Low', value: 'price-high' },
  ];

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">Course Catalog</h1>
        <p className="page-subtitle">Learn top tech and business skills from industry experts.</p>
      </div>

      <SearchFilter
        searchPlaceholder="Search courses, instructors..."
        searchValue={search}
        onSearchChange={setSearch}
        categories={categories}
        selectedCategory={category}
        onCategoryChange={setCategory}
        sortOptions={sortOptions}
        selectedSort={sortBy}
        onSortChange={setSortBy}
      />

      {filteredCourses.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>
          <h3>No courses found</h3>
          <p>Try resetting the search terms or categories filter.</p>
        </div>
      ) : (
        <div className="grid-3 animate-fade-in-up">
          {filteredCourses.map((course) => (
            <CourseCard
              key={course.id}
              id={course.id}
              title={course.title}
              instructor={course.instructor}
              category={course.category}
              price={course.price}
              rating={course.rating}
              studentsEnrolled={course.studentsEnrolled}
              duration={course.duration}
            />
          ))}
        </div>
      )}
    </div>
  );
}
