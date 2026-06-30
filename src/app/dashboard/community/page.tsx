'use client';

import React, { useState } from 'react';
import { mockPosts } from '@/data/mock';
import Button from '@/components/ui/Button';

export default function Community() {
  const [posts, setPosts] = useState(mockPosts);
  const [newPostContent, setNewPostContent] = useState('');
  const [selectedTag, setSelectedTag] = useState('All');

  const allTags = Array.from(new Set(posts.flatMap((p) => p.tags)));

  const handleCreatePost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPostContent.trim()) return;

    const newPost = {
      id: `post-${Date.now()}`,
      author: 'Aarav Mehta',
      authorAvatar: '🎓',
      content: newPostContent,
      timestamp: 'Just now',
      likes: 0,
      comments: 0,
      tags: ['general'],
    };

    setPosts([newPost, ...posts]);
    setNewPostContent('');
  };

  const handleLike = (id: string) => {
    setPosts(
      posts.map((post) =>
        post.id === id ? { ...post, likes: post.likes + 1 } : post
      )
    );
  };

  const filteredPosts = posts.filter(
    (post) => selectedTag === 'All' || post.tags.includes(selectedTag)
  );

  return (
    <div className="page-container" style={{ display: 'grid', gridTemplateColumns: '3fr 1fr', gap: 'var(--spacing-xl)' }}>
      {/* Feed Area */}
      <div>
        <div className="page-header">
          <h1 className="page-title">Community Hub</h1>
          <p className="page-subtitle">Connect, discuss, and learn with fellow peers and mentors.</p>
        </div>

        {/* Create Post Card */}
        <div className="card" style={{ marginBottom: 'var(--spacing-xl)' }}>
          <form onSubmit={handleCreatePost}>
            <textarea
              className="input"
              placeholder="Share what is on your mind..."
              value={newPostContent}
              onChange={(e) => setNewPostContent(e.target.value)}
              style={{ minHeight: '80px', resize: 'vertical', marginBottom: '12px' }}
            />
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Button type="submit" size="sm">Post to Community</Button>
            </div>
          </form>
        </div>

        {/* Posts List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-base)' }}>
          {filteredPosts.map((post) => (
            <div key={post.id} className="card animate-fade-in-up" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {/* Header */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: 'var(--radius-full)',
                  background: 'var(--bg-glass)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.25rem'
                }}>
                  {post.authorAvatar}
                </div>
                <div>
                  <h4 style={{ fontWeight: 600, fontSize: 'var(--font-size-sm)' }}>{post.author}</h4>
                  <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-tertiary)' }}>{post.timestamp}</p>
                </div>
              </div>

              {/* Content */}
              <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                {post.content}
              </p>

              {/* Tags */}
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                {post.tags.map((tag) => (
                  <span
                    key={tag}
                    onClick={() => setSelectedTag(tag)}
                    style={{
                      fontSize: 'var(--font-size-xs)',
                      color: 'var(--accent-primary-hover)',
                      background: 'rgba(99, 102, 241, 0.1)',
                      padding: '2px 8px',
                      borderRadius: 'var(--radius-sm)',
                      cursor: 'pointer'
                    }}
                  >
                    #{tag}
                  </span>
                ))}
              </div>

              {/* Actions */}
              <div style={{
                display: 'flex',
                gap: '24px',
                paddingTop: '12px',
                borderTop: '1px solid var(--border-primary)',
                fontSize: 'var(--font-size-xs)',
                color: 'var(--text-secondary)'
              }}>
                <button
                  onClick={() => handleLike(post.id)}
                  style={{ background: 'transparent', display: 'flex', alignItems: 'center', gap: '6px', color: 'inherit' }}
                >
                  ❤️ {post.likes} Likes
                </button>
                <span>💬 {post.comments} Comments</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Sidebar Filters */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-lg)' }}>
        <div className="card" style={{ position: 'sticky', top: 'calc(var(--header-height) + 24px)' }}>
          <h3 style={{ fontSize: 'var(--font-size-md)', fontWeight: 700, marginBottom: '16px' }}>Filter by Topic</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <button
              onClick={() => setSelectedTag('All')}
              className={`btn ${selectedTag === 'All' ? 'btn-primary' : 'btn-ghost'}`}
              style={{ justifyContent: 'flex-start', padding: '6px 12px', fontSize: 'var(--font-size-xs)' }}
            >
              # All Posts
            </button>
            {allTags.map((tag) => (
              <button
                key={tag}
                onClick={() => setSelectedTag(tag)}
                className={`btn ${selectedTag === tag ? 'btn-primary' : 'btn-ghost'}`}
                style={{ justifyContent: 'flex-start', padding: '6px 12px', fontSize: 'var(--font-size-xs)' }}
              >
                # {tag}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
