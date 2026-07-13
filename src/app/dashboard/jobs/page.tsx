'use client';

import React, { useState } from 'react';
import { Job } from '@/data/mock';
import JobCard from '@/components/ui/JobCard';
import SearchFilter from '@/components/ui/SearchFilter';

export default function JobBoard() {
  const [search, setSearch] = useState('');
  const [type, setType] = useState('All');
  const [sortBy, setSortBy] = useState('newest');
  const [jobs] = useState<Job[]>([]);

  const types = ['Full-time', 'Part-time', 'Internship', 'Contract'];

  const filteredJobs = jobs
    .filter((job) => job.status === 'active')
    .filter((job) => {
      const matchesSearch = job.title.toLowerCase().includes(search.toLowerCase()) ||
                            job.company.toLowerCase().includes(search.toLowerCase()) ||
                            job.skills.some(skill => skill.toLowerCase().includes(search.toLowerCase()));
      const matchesType = type === 'All' || job.type === type;
      return matchesSearch && matchesType;
    });

  const sortOptions = [
    { label: 'Newest Postings', value: 'newest' },
    { label: 'Most Applicants', value: 'applicants' },
  ];

  const handleApply = (id: string) => {
    alert(`Application submitted successfully for job ID: ${id}! Match score will be calculated.`);
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">Job Placement Board</h1>
        <p className="page-subtitle">Find jobs and internships tailored to your Skilotech profile accomplishments.</p>
      </div>

      <SearchFilter
        searchPlaceholder="Search job titles, companies, or skills (e.g. React)..."
        searchValue={search}
        onSearchChange={setSearch}
        categories={types}
        selectedCategory={type}
        onCategoryChange={setType}
        sortOptions={sortOptions}
        selectedSort={sortBy}
        onSortChange={setSortBy}
      />

      <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>
        <h3 style={{ color: 'var(--text-primary)', marginBottom: '8px' }}>No jobs posted yet</h3>
        <p>Check back soon — recruiters are actively posting new opportunities on Skilotech.</p>
      </div>
    </div>
  );
}
