'use client';

import React from 'react';
import Link from 'next/link';
import styles from './page.module.css';

const features = [
  {
    icon: '📚',
    title: 'Expert-Led Courses',
    description: 'Learn from industry professionals with structured, project-based courses across tech domains.',
  },
  {
    icon: '💻',
    title: 'Interactive Coding Lab',
    description: 'Practice coding in-browser with our Monaco-powered editor. Compile, run, and test instantly.',
  },
  {
    icon: '🤖',
    title: 'AI-Powered Feedback',
    description: 'Get instant optimization guidance, style tips, and performance insights on every submission.',
  },
  {
    icon: '💼',
    title: 'Job Placement',
    description: 'Apply to top companies, track applications, and get matched with roles that fit your skills.',
  },
  {
    icon: '🏆',
    title: 'Certifications',
    description: 'Earn verified certificates on course completion to showcase your skills to recruiters.',
  },
  {
    icon: '💬',
    title: 'Community',
    description: 'Join discussions, share knowledge, and collaborate with learners and mentors worldwide.',
  },
];

const stats = [
  { value: '12,500+', label: 'Active Learners' },
  { value: '150+', label: 'Courses' },
  { value: '89+', label: 'Hiring Partners' },
  { value: '4.7★', label: 'Avg Rating' },
];

export default function LandingPage() {
  return (
    <div className={styles.landing}>
      {/* Navigation */}
      <nav className={styles.nav}>
        <div className={styles.navInner}>
          <Link href="/" className={styles.brand}>
            <span className={styles.brandIcon}>⚡</span>
            <span className={styles.brandText}>Skillzy</span>
          </Link>
          <div className={styles.navLinks}>
            <a href="#features" className={styles.navLink}>Features</a>
            <a href="#stats" className={styles.navLink}>Stats</a>
            <Link href="/login" className={styles.navLink}>Sign In</Link>
            <Link href="/login" className={`btn btn-primary ${styles.ctaBtn}`}>
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className={styles.hero}>
        <div className={styles.heroBg}>
          <div className={styles.heroOrb1} />
          <div className={styles.heroOrb2} />
          <div className={styles.heroOrb3} />
        </div>
        <div className={styles.heroContent}>
          <div className={styles.heroBadge}>🚀 Your Career Starts Here</div>
          <h1 className={styles.heroTitle}>
            Learn. Code.{' '}
            <span className={styles.heroGradient}>Get Hired.</span>
          </h1>
          <p className={styles.heroSubtitle}>
            Master in-demand tech skills with expert-led courses, practice coding with AI-powered feedback,
            and connect directly with top employers. All in one platform.
          </p>
          <div className={styles.heroActions}>
            <Link href="/login" className="btn btn-primary btn-lg">
              Start Learning Free →
            </Link>
            <Link href="#features" className="btn btn-secondary btn-lg">
              Explore Features
            </Link>
          </div>
          <div className={styles.heroTrust}>
            <span className={styles.trustAvatars}>🎓👨‍💻👩‍🔬🛠️👩‍🏫</span>
            <span className={styles.trustText}>Trusted by 12,500+ learners across India</span>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className={styles.features} id="features">
        <div className={styles.sectionInner}>
          <h2 className={styles.sectionTitle}>
            Everything You Need to{' '}
            <span className={styles.heroGradient}>Succeed</span>
          </h2>
          <p className={styles.sectionSubtitle}>
            From learning to placement — Skillzy has got you covered with a complete career toolkit.
          </p>
          <div className={styles.featuresGrid}>
            {features.map((feature, index) => (
              <div
                key={feature.title}
                className={`${styles.featureCard} animate-fade-in-up stagger-${index + 1}`}
              >
                <div className={styles.featureIcon}>{feature.icon}</div>
                <h3 className={styles.featureTitle}>{feature.title}</h3>
                <p className={styles.featureDesc}>{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className={styles.statsSection} id="stats">
        <div className={styles.sectionInner}>
          <div className={styles.statsGrid}>
            {stats.map((stat) => (
              <div key={stat.label} className={styles.statItem}>
                <span className={styles.statValue}>{stat.value}</span>
                <span className={styles.statLabel}>{stat.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className={styles.ctaSection}>
        <div className={styles.sectionInner}>
          <div className={styles.ctaCard}>
            <h2 className={styles.ctaTitle}>Ready to Transform Your Career?</h2>
            <p className={styles.ctaText}>
              Join thousands of learners who are building the skills employers want. Start with free courses today.
            </p>
            <Link href="/login" className="btn btn-primary btn-lg">
              Join Skillzy Now →
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className={styles.footer}>
        <div className={styles.footerInner}>
          <div className={styles.footerBrand}>
            <span className={styles.brandIcon}>⚡</span>
            <span className={styles.brandText}>Skillzy</span>
          </div>
          <p className={styles.footerText}>
            © 2026 Skillzy. All rights reserved. Built for learners, by learners.
          </p>
        </div>
      </footer>
    </div>
  );
}
