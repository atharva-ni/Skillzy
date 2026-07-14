'use client';

import React, { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import styles from './page.module.css';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, Code2, Briefcase, Award, Users, HelpCircle, FileText, Shield, Mail } from 'lucide-react';
import { useGsapAnimations } from './useGsapAnimations';

// Inline brand icons (lucide-react doesn't ship brand icons)
const IconTwitterX = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.741l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
  </svg>
);
const IconLinkedin = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
  </svg>
);
const IconGithub = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/>
  </svg>
);
const IconYoutube = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
  </svg>
);

// ── Data ──────────────────────────────────────────────────────────────────────

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

const partners = [
  'Google', 'Microsoft', 'Amazon', 'Flipkart', 'Razorpay', 'Zepto', 'PhonePe', 'Meesho',
  'Swiggy', 'CRED', 'Zomato', 'Infosys', 'TCS', 'Wipro', 'HCL', 'Accenture',
];

const workflowSteps = [
  {
    num: 'Step 01',
    title: 'Enroll in a Course',
    desc: 'Browse 150+ expert-led courses tailored to real industry roles. Filter by domain, level, or skill — and start learning in minutes.',
    visual: (
      <div style={{ fontFamily: 'var(--font-family)', fontSize: '0.85rem' }}>
        <div style={{ marginBottom: '12px', fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.95rem' }}>Trending Courses</div>
        {['Full-Stack Web Dev', 'DSA in Python', 'System Design', 'Cloud & DevOps'].map((c, i) => (
          <div key={c} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px', background: i === 0 ? 'var(--bg-secondary)' : 'transparent', border: '1px solid ' + (i === 0 ? 'var(--border-accent)' : 'transparent'), borderRadius: '8px', marginBottom: '6px', cursor: 'pointer', transition: 'all 0.2s' }}>
            <span style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-tertiary)', background: 'var(--bg-tertiary)', padding: '2px 6px', borderRadius: '4px' }}>{ ['Web','Dsa','Sys','Ops'][i] }</span>
            <span style={{ fontWeight: 500, color: 'var(--text-primary)' }}>{c}</span>
            {i === 0 && <span style={{ marginLeft: 'auto', fontSize: '11px', fontWeight: 700, background: 'var(--text-primary)', color: '#fff', padding: '2px 8px', borderRadius: 'var(--radius-full)' }}>Enrolled</span>}
          </div>
        ))}
      </div>
    ),
  },
  {
    num: 'Step 02',
    title: 'Code in the Lab',
    desc: 'Solve real problems in our Monaco-powered coding lab. Write code, run tests, and get instant pass/fail feedback right in your browser.',
    visual: (
      <div style={{ background: '#090d16', borderRadius: '10px', padding: '14px', fontFamily: 'monospace', fontSize: '11px', color: '#94a3b8' }}>
        <div style={{ color: '#64748b', marginBottom: '8px', fontSize: '10px' }}>solution.py</div>
        <div style={{ color: '#7dd3fc' }}>def <span style={{ color: '#a5f3fc' }}>binary_search</span>(arr, target):</div>
        <div style={{ paddingLeft: '16px', color: '#e2e8f0' }}>low, high = 0, len(arr) - 1</div>
        <div style={{ paddingLeft: '16px', color: '#e2e8f0' }}>while low &lt;= high:</div>
        <div style={{ paddingLeft: '32px', color: '#e2e8f0' }}>mid = (low + high) // 2</div>
        <div style={{ paddingLeft: '32px', color: '#e2e8f0' }}>if arr[mid] == target: <span style={{ color: '#86efac' }}>return mid</span></div>
        <div style={{ marginTop: '10px', display: 'flex', gap: '6px', alignItems: 'center' }}>
          <span style={{ color: '#22c55e', fontWeight: 700 }}>✓</span>
          <span style={{ color: '#22c55e' }}>3/3 tests passed · 12ms</span>
        </div>
      </div>
    ),
  },
  {
    num: 'Step 03',
    title: 'Get AI Feedback',
    desc: 'Our AI tutor reviews your code after every submission, pinpointing what to optimize, which patterns to adopt, and how to think like a senior engineer.',
    visual: (
      <div style={{ fontSize: '0.85rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
          <span style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--text-tertiary)', background: 'var(--bg-tertiary)', padding: '2px 8px', borderRadius: '4px' }}>AI</span>
          <span style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.9rem' }}>Diagnostics Overview</span>
        </div>
        {[
          { label: 'Correct', text: 'Correct binary search logic — O(log n) complexity.', ok: true, col: '#16a34a' },
          { label: 'Optimize', text: 'Consider using `arr[mid]` directly without extra variable.', ok: null, col: '#7c3aed' },
          { label: 'Warning', text: 'Use integer overflow-safe midpoint: `low + (high-low)//2`', ok: null, col: '#ea580c' },
        ].map((line, i) => (
          <div key={i} style={{ display: 'flex', gap: '8px', padding: '8px 10px', background: line.ok ? 'rgba(34, 197, 94, 0.04)' : 'var(--bg-tertiary)', borderRadius: '6px', marginBottom: '6px', lineHeight: 1.4 }}>
            <span style={{ fontSize: '9px', fontWeight: 700, color: line.col, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{line.label}</span>
            <span style={{ color: 'var(--text-secondary)', fontSize: '12px' }}>{line.text}</span>
          </div>
        ))}
      </div>
    ),
  },
  {
    num: 'Step 04',
    title: 'Land the Job',
    desc: 'With your verified certificates and real project portfolio, apply directly to our 89+ hiring partners — right from the Skilotech dashboard.',
    visual: (
      <div style={{ fontSize: '0.85rem' }}>
        <div style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.9rem', marginBottom: '12px' }}>Your Applications</div>
        {[
          { co: 'Google', role: 'SWE Intern', status: 'Interview', color: '#2563eb' },
          { co: 'Razorpay', role: 'Backend Dev', status: 'Applied', color: '#7c3aed' },
          { co: 'Flipkart', role: 'Full-Stack', status: 'Offer!', color: '#16a34a' },
        ].map((app, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 12px', background: 'var(--bg-secondary)', border: '1px solid var(--border-primary)', borderRadius: '8px', marginBottom: '6px' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: ['#2563eb','#7c3aed','#16a34a'][i], display: 'inline-block', flexShrink: 0 }} />
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '12px' }}>{app.co}</div>
              <div style={{ color: 'var(--text-tertiary)', fontSize: '11px' }}>{app.role}</div>
            </div>
            <span style={{ fontSize: '11px', fontWeight: 700, color: app.color, background: app.color + '15', padding: '2px 10px', borderRadius: 'var(--radius-full)' }}>{app.status}</span>
          </div>
        ))}
      </div>
    ),
  },
];

// ── Typewriter Mock Editor ─────────────────────────────────────────────────────

const CODE_LINES = [
  "def two_sum(nums, target):",
  "    seen = {}",
  "    for i, n in enumerate(nums):",
  "        diff = target - n",
  "        if diff in seen:",
  "            return [seen[diff], i]",
  "        seen[n] = i",
];

function MockEditor({ onPhaseChange }: { onPhaseChange?: (phase: string) => void }) {
  const [displayedLines, setDisplayedLines] = useState<string[]>(['']);
  const [phase, setPhase] = useState<'typing' | 'running' | 'done' | 'ai'>('typing');
  const lineIndex = useRef(0);
  const charIndex = useRef(0);

  const updatePhase = (p: 'typing' | 'running' | 'done' | 'ai') => {
    setPhase(p);
    onPhaseChange?.(p);
  };

  useEffect(() => {
    const type = () => {
      const currentLine = CODE_LINES[lineIndex.current];
      if (charIndex.current <= currentLine.length) {
        setDisplayedLines(prev => {
          const updated = [...prev];
          updated[lineIndex.current] = currentLine.slice(0, charIndex.current);
          return updated;
        });
        charIndex.current++;
        setTimeout(type, 28);
      } else if (lineIndex.current < CODE_LINES.length - 1) {
        lineIndex.current++;
        charIndex.current = 0;
        setDisplayedLines(prev => [...prev, '']);
        setTimeout(type, 60);
      } else {
        setTimeout(() => updatePhase('running'), 600);
        setTimeout(() => updatePhase('done'), 1600);
        setTimeout(() => updatePhase('ai'), 2800);
        setTimeout(() => {
          setDisplayedLines(['']);
          updatePhase('typing');
          lineIndex.current = 0;
          charIndex.current = 0;
          setTimeout(type, 100);
        }, 7000);
      }
    };
    const timer = setTimeout(type, 600);
    return () => clearTimeout(timer);
  }, []);

  const lineNums = Array.from({ length: Math.max(displayedLines.length, 7) }, (_, i) => i + 1);

  const syntaxColor = (line: string) => {
    if (line.startsWith('def ')) {
      const parts = line.split('def ');
      return <><span style={{ color: '#c792ea' }}>def </span><span style={{ color: '#82aaff' }}>{parts[1]}</span></>;
    }
    if (line.trim().startsWith('return')) return <span style={{ color: '#c792ea' }}>{line}</span>;
    if (line.trim().startsWith('#')) return <span style={{ color: '#546e7a' }}>{line}</span>;
    if (line.includes(' = ') || line.includes('={}')) return <span style={{ color: '#eeffff' }}>{line}</span>;
    if (line.trim().startsWith('for ') || line.trim().startsWith('if ')) return <span style={{ color: '#c792ea' }}>{line}</span>;
    return <span style={{ color: '#eeffff' }}>{line}</span>;
  };

  return (
    // NO overflow:hidden wrapper here - let heroVisualSide be the stacking context
    <div className={styles.editorFrame}>
      <div className={styles.editorHeader}>
        <div className={styles.editorDots}>
          <span className={`${styles.editorDot} ${styles.editorDotRed}`} />
          <span className={`${styles.editorDot} ${styles.editorDotYellow}`} />
          <span className={`${styles.editorDot} ${styles.editorDotGreen}`} />
        </div>
        <span className={styles.editorTitle}>solution.py</span>
        <span className={styles.editorLang}>Python 3.12</span>
      </div>

      <div className={styles.editorBody}>
        <div className={styles.editorLines}>
          {lineNums.map(n => <div key={n}>{n}</div>)}
        </div>
        <div className={styles.editorCode}>
          {displayedLines.map((line, i) => (
            <div key={i}>
              {syntaxColor(line)}
              {i === displayedLines.length - 1 && phase === 'typing' && (
                <span className={styles.editorCursor} />
              )}
            </div>
          ))}
        </div>
      </div>

      <div className={styles.editorOutput}>
        <div className={styles.editorOutputHeader}>
          <span>Terminal</span>
          <AnimatePresence mode="wait">
            {phase === 'running' && <motion.span key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ color: '#f59e0b', fontWeight: 700 }}>● Running...</motion.span>}
            {(phase === 'done' || phase === 'ai') && <motion.span key="d" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ color: '#22c55e', fontWeight: 700 }}>● 3/3 Passed</motion.span>}
          </AnimatePresence>
        </div>
        <div className={styles.editorOutputBody}>
          <AnimatePresence mode="wait">
            {phase === 'typing' && <motion.div key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className={styles.editorOutputLine} style={{ color: 'rgba(255,255,255,0.25)', fontStyle: 'italic' }}>Ready to run...</motion.div>}
            {phase === 'running' && (
              <motion.div key="running" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <div className={styles.editorOutputLine} style={{ color: '#94a3b8' }}>$ python solution.py</div>
                <div className={styles.editorOutputLine} style={{ color: '#64748b' }}>Running test cases...</div>
              </motion.div>
            )}
            {(phase === 'done' || phase === 'ai') && (
              <motion.div key="done" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <div className={styles.editorOutputLine} style={{ color: '#22c55e' }}>✓ Test 1: [0,1] - Passed</div>
                <div className={styles.editorOutputLine} style={{ color: '#22c55e' }}>✓ Test 2: [3,2] - Passed</div>
                <div className={styles.editorOutputLine} style={{ color: '#22c55e' }}>✓ Test 3: [0,4] - Passed</div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function LandingPage() {
  const { isLoaded, isSignedIn } = useUser();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState(0);
  const [editorPhase, setEditorPhase] = useState<string>('typing');
  const [activeFeatureTab, setActiveFeatureTab] = useState(0);
  useGsapAnimations();

  useEffect(() => {
    if (isLoaded && isSignedIn) router.replace('/dashboard');
  }, [isLoaded, isSignedIn, router]);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const indexAttr = entry.target.getAttribute('data-step-index');
            if (indexAttr) {
              const index = parseInt(indexAttr, 10);
              if (!isNaN(index) && index >= 0 && index < workflowSteps.length) {
                setActiveTab(index);
              }
            }
          }
        });
      },
      {
        root: null,
        rootMargin: '-35% 0px -40% 0px',
        threshold: 0.1,
      }
    );

    const steps = document.querySelectorAll('.gsap-workflow-step');
    steps.forEach((step) => observer.observe(step));

    return () => {
      steps.forEach((step) => observer.unobserve(step));
    };
  }, []);


  if (!isLoaded || isSignedIn) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: '#fafafa', flexDirection: 'column', gap: '20px' }}>
        <div style={{ width: '44px', height: '44px', borderRadius: '50%', border: '3px solid #e5e5e5', borderTop: '3px solid #171717', animation: 'spin 0.8s linear infinite' }} />
        <p style={{ color: 'var(--text-tertiary)', fontFamily: 'monospace', fontSize: '0.78rem', letterSpacing: '1px' }}>
          loading...
        </p>
      </div>
    );
  }

  // (animation variants removed — GSAP ScrollTrigger handles all animations)

  const partnerList = [...partners, ...partners];

  return (
    <div className={styles.landing}>

      {/* ── Navigation ────────────────────────────────────────── */}
      <nav className={styles.nav}>
        <div className={styles.navInner}>
          {/* Logo */}
          <Link href="/" className={styles.navBrand} style={{ overflow: 'hidden', height: '44px', display: 'flex', alignItems: 'center' }}>
            <img src="/logo.png" alt="Skilotech Logo" style={{ width: '160px', height: '160px', marginTop: '-58px', marginBottom: '-58px', objectFit: 'contain', display: 'block' }} />
          </Link>

          {/* Center pill nav */}
          <div className={styles.navCenter}>
            <a href="#features" className={styles.navLink}>Features</a>
            <a href="#how-it-works" className={styles.navLink}>How It Works</a>
            <a href="#stats" className={styles.navLink}>Stats</a>
          </div>

          {/* Right actions */}
          <div className={styles.navRight}>
            <Link href="/sign-in" className={styles.navSignIn}>Sign In</Link>
            <Link href="/sign-up" className={styles.navCta}>
              Get Started <span className={styles.navCtaArrow}>→</span>
            </Link>
          </div>
        </div>
      </nav>

      {/* ── Hero Section ───────────────────────────────────────── */}
      <section className={`${styles.hero} gsap-hero`}>
        {/* Background ghost watermark */}
        <div className={`${styles.heroWatermark} gsap-hero-watermark`} aria-hidden="true">SKILOTECH</div>
        <div className={styles.heroBg}>
          <div className={styles.heroOrb1} />
          <div className={styles.heroOrb2} />
        </div>

        <div className={styles.heroGrid}>
          {/* Left: Copy */}
          <div className={styles.heroTextSide}>
            <motion.div
              className={`${styles.heroBadge} gsap-hero-badge`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.05, duration: 0.01 }}
            >
              Skilotech Core Workspace
            </motion.div>

            <h1
              className={`${styles.heroTitle} gsap-hero-title`}
              style={{ perspective: '800px', transformStyle: 'preserve-3d' }}
            >
              Learn. Code. Get Hired.
            </h1>

            <p
              className={`${styles.heroSubtitle} gsap-hero-sub`}
            >
              Master in-demand tech skills with expert-led courses, solve coding challenges with real-time AI feedback, and connect directly with top employers.
            </p>

            <div
              className={`${styles.heroActions} gsap-hero-actions`}
            >
              <Link href="/sign-up" className="btn btn-primary btn-lg" style={{ borderRadius: 'var(--radius-md)' }}>
                Start for Free →
              </Link>
              <Link href="#how-it-works" className="btn btn-secondary btn-lg" style={{ borderRadius: 'var(--radius-md)' }}>
                See How It Works
              </Link>
            </div>

            <motion.div
              className={styles.heroTrust}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7, duration: 0.5 }}
            >
              <div className={styles.trustAvatars}>
                {['AK','RS','PM','VJ','ND'].map((init, i) => (
                  <span key={i} className={styles.trustAvatar} style={{ zIndex: 5 - i, background: ['#171717','#374151','#525252','#6b7280','#9ca3af'][i] }}>{init}</span>
                ))}
              </div>
              <span className={styles.trustText}>Trusted by <strong>12,500+</strong> learners across India</span>
            </motion.div>
          </div>

          {/* Right: Mock Code Editor */}
          <motion.div
            className={`${styles.heroVisualSide} gsap-hero-visual`}
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4, duration: 0.75, ease: [0.16, 1, 0.3, 1] }}
          >
            <MockEditor onPhaseChange={(p) => setEditorPhase(p)} />
            {/* AI Tooltip rendered here (outside editorFrame) so it is NOT clipped */}
            <AnimatePresence>
              {editorPhase === 'ai' && (
                <motion.div
                  key="aitooltip"
                  className={styles.aiTooltip}
                  initial={{ opacity: 0, y: 12, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 12, scale: 0.95 }}
                  transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                >
                  <div className={styles.aiTooltipHeader}>AI Feedback Diagnostics</div>
                  <div className={styles.aiTooltipContent}>
                    Great solution! Consider using{' '}
                    <code style={{ background: '#f0f0f0', padding: '1px 5px', borderRadius: '4px', fontSize: '10px', fontFamily: 'monospace' }}>low + (high-low)//2</code>{' '}
                    to prevent integer overflow in large inputs.
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </section>

      {/* ── Partner Marquee ────────────────────────────────────── */}
      <section className={styles.partnersSection}>
        <p className={styles.partnersTitle}>Trusted by learners placed at</p>
        <div className={styles.marqueeContainer}>
          <div className={styles.marqueeGradLeft} />
          <div className={styles.marqueeGradRight} />
          <div className={`${styles.marqueeTrack} gsap-marquee`}>
            {partnerList.map((name, i) => (
              <span key={i} className={styles.partnerLogo}>{name}</span>
            ))}
          </div>
        </div>
      </section>

      {/* ── Scroll Chapter Label ── */}
      <div className={`${styles.chapterLabel} gsap-chapter-label`}>
        <span className={styles.chapterLine} />
        <span className={styles.chapterText}>The Platform</span>
        <span className={styles.chapterLine} />
      </div>

      {/* ── Features Section (YouLearn-style Showcase) ──────────────── */}
      <section className={styles.features} id="features">
        <div className={styles.sectionInner}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.55 }}
            style={{ textAlign: 'center', marginBottom: '72px' }}
          >
            <h2 className={`${styles.sectionTitle} gsap-section-title`}>Built for every stage of your career</h2>
            <p className={`${styles.sectionSubtitle} gsap-section-sub`}>
              From first line of code to your first offer letter — Skilotech handles the entire engineering journey.
            </p>
          </motion.div>

          {/* Full-width product showcase — feature tabs above, large mockup below */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className={styles.showcaseWrapper}
          >
            {/* Tab Strip */}
            <div className={`${styles.showcaseTabStrip} gsap-stagger-group`}>
              {[
                { label: 'Code Playground' },
                { label: 'AI Diagnostics' },
                { label: 'Learning Tracks' },
                { label: 'Job Pipelines' },
              ].map((tab, idx) => (
                <button
                  key={idx}
                  className={`${styles.stripTab} ${activeFeatureTab === idx ? styles.stripTabActive : ''} gsap-stagger-item`}
                  onClick={() => setActiveFeatureTab(idx)}
                >
                  {tab.label}
                  {activeFeatureTab === idx && (
                    <motion.div layoutId="strip-underline" className={styles.stripUnderline} transition={{ type: 'spring', stiffness: 400, damping: 40 }} />
                  )}
                </button>
              ))}
            </div>

            {/* Large product window */}
            <div className={`${styles.showcaseBrowser} gsap-showcase-browser`}>
              {/* Browser chrome */}
              <div className={styles.browserChrome}>
                <div className={styles.browserDots}>
                  <span className={styles.browserDotR} />
                  <span className={styles.browserDotY} />
                  <span className={styles.browserDotG} />
                </div>
                <div className={styles.browserUrl}>
                  <span style={{ color: '#9ca3af', fontFamily: 'monospace', fontSize: '11px' }}>app.skilotech.in /</span>
                  <AnimatePresence mode="wait">
                    <motion.span
                      key={activeFeatureTab}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      style={{ fontFamily: 'monospace', fontSize: '11px', color: '#374151' }}
                    >
                      {['playground', 'diagnostics', 'tracks', 'careers'][activeFeatureTab]}
                    </motion.span>
                  </AnimatePresence>
                </div>
                <div style={{ width: '60px' }} />
              </div>

              {/* App content area */}
              <div className={styles.browserBody}>
                <AnimatePresence mode="wait">
                  {/* Panel 0: Code Playground */}
                  {activeFeatureTab === 0 && (
                    <motion.div key="p0" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }} className={styles.browserPanel}>
                      {/* Sidebar */}
                      <div className={styles.panelSidebar}>
                        <div className={styles.panelSidebarTitle}>Problems</div>
                        {['Binary Search', 'Two Sum', 'Merge Sort', 'BFS / DFS', 'Dynamic Prog.'].map((p, i) => (
                          <div key={i} className={`${styles.panelSidebarItem} ${i === 0 ? styles.panelSidebarItemActive : ''}`}>
                            <span style={{ fontFamily: 'monospace', fontSize: '9px', color: '#9ca3af', marginRight: '8px' }}>#{String(i + 1).padStart(2, '0')}</span>
                            {p}
                          </div>
                        ))}
                      </div>
                      {/* Editor */}
                      <div className={styles.panelEditor}>
                        <div className={styles.panelEditorHeader}>
                          <span style={{ color: '#50fa7b', fontSize: '10px' }}>binary_search.py</span>
                          <span style={{ marginLeft: 'auto', fontSize: '9px', background: '#22c55e20', color: '#22c55e', padding: '2px 8px', borderRadius: '4px', fontWeight: 700 }}>✓ All Tests Passed</span>
                        </div>
                        <div style={{ padding: '16px', fontFamily: 'monospace', fontSize: '11px', lineHeight: 1.7, color: '#c9d1d9' }}>
                          <div style={{ color: '#6b7280', marginBottom: '8px' }}># Binary Search — O(log N)</div>
                          <div><span style={{ color: '#ff79c6' }}>def</span> <span style={{ color: '#50fa7b' }}>binary_search</span>(arr, target):</div>
                          <div style={{ paddingLeft: '16px' }}>low, high = <span style={{ color: '#bd93f9' }}>0</span>, len(arr) - <span style={{ color: '#bd93f9' }}>1</span></div>
                          <div style={{ paddingLeft: '16px' }}><span style={{ color: '#ff79c6' }}>while</span> low &lt;= high:</div>
                          <div style={{ paddingLeft: '32px' }}>mid = (low + high) // <span style={{ color: '#bd93f9' }}>2</span></div>
                          <div style={{ paddingLeft: '32px' }}><span style={{ color: '#ff79c6' }}>if</span> arr[mid] == target:</div>
                          <div style={{ paddingLeft: '48px' }}><span style={{ color: '#ff79c6' }}>return</span> mid</div>
                        </div>
                        <div style={{ background: '#0d1117', padding: '10px 16px', borderTop: '1px solid rgba(255,255,255,0.04)', fontFamily: 'monospace', fontSize: '9px', color: '#8b949e' }}>
                          $ pytest — <span style={{ color: '#50fa7b' }}>3 passed</span> in 0.04s
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* Panel 1: AI Diagnostics */}
                  {activeFeatureTab === 1 && (
                    <motion.div key="p1" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }} className={styles.browserPanel}>
                      <div className={styles.panelDiagMain}>
                        <div style={{ fontSize: '12px', fontWeight: 700, color: '#1f2937', marginBottom: '16px' }}>AI Code Review</div>
                        {[
                          { type: 'error', label: 'Performance', msg: 'O(N²) nested loop at line 12. Refactor with hash map for O(N).', code: 'for i in arr:\n  for j in arr: ...' },
                          { type: 'warn', label: 'Style', msg: 'Variable name `x` is not descriptive. Consider renaming to `target_index`.', code: 'x = arr.index(val)' },
                          { type: 'ok', label: 'Logic', msg: 'Boundary conditions correctly handled. Edge case coverage is complete.', code: null },
                        ].map((d, i) => (
                          <div key={i} className={styles.diagCard} style={{ borderLeftColor: d.type === 'error' ? '#ef4444' : d.type === 'warn' ? '#f59e0b' : '#10b981' }}>
                            <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '4px' }}>
                              <span style={{ fontSize: '9px', fontWeight: 700, color: d.type === 'error' ? '#ef4444' : d.type === 'warn' ? '#f59e0b' : '#10b981', textTransform: 'uppercase' }}>{d.label}</span>
                            </div>
                            <div style={{ fontSize: '11px', color: '#374151', lineHeight: 1.5 }}>{d.msg}</div>
                            {d.code && <div style={{ fontFamily: 'monospace', fontSize: '10px', background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: '4px', padding: '4px 8px', marginTop: '6px', color: '#6b7280' }}>{d.code}</div>}
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}

                  {/* Panel 2: Learning Tracks */}
                  {activeFeatureTab === 2 && (
                    <motion.div key="p2" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }} className={styles.browserPanel}>
                      <div className={styles.panelTracksMain}>
                        <div style={{ fontSize: '12px', fontWeight: 700, color: '#1f2937', marginBottom: '16px' }}>Your Learning Tracks</div>
                        {[
                          { num: '01', name: 'DSA & Algorithms Core', level: 'Foundation', progress: 68, active: true },
                          { num: '02', name: 'System Design at Scale', level: 'Advanced', progress: 22, active: false },
                          { num: '03', name: 'Database Engine Internals', level: 'Expert', progress: 0, active: false },
                          { num: '04', name: 'Frontend Architecture', level: 'Advanced', progress: 0, active: false },
                        ].map((t, i) => (
                          <div key={i} className={styles.trackCard} style={{ borderColor: t.active ? '#171717' : '#e5e7eb', background: t.active ? '#fafafa' : '#fff' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                              <div>
                                <div style={{ fontFamily: 'monospace', fontSize: '9px', color: '#9ca3af', marginBottom: '2px' }}>{t.num}</div>
                                <div style={{ fontSize: '12px', fontWeight: 700, color: '#111827' }}>{t.name}</div>
                              </div>
                              <span style={{ fontSize: '9px', fontWeight: 700, color: t.active ? '#059669' : '#6b7280', background: t.active ? '#ecfdf5' : '#f9fafb', padding: '2px 6px', borderRadius: '4px' }}>{t.level}</span>
                            </div>
                            <div style={{ height: '3px', background: '#f3f4f6', borderRadius: '2px' }}>
                              <div style={{ height: '100%', width: `${t.progress}%`, background: t.active ? '#171717' : '#d1d5db', borderRadius: '2px', transition: 'width 0.5s ease' }} />
                            </div>
                            <div style={{ fontSize: '9px', color: '#9ca3af', marginTop: '4px' }}>{t.progress}% complete</div>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}

                  {/* Panel 3: Job Pipelines */}
                  {activeFeatureTab === 3 && (
                    <motion.div key="p3" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }} className={styles.browserPanel}>
                      <div className={styles.panelTracksMain}>
                        <div style={{ fontSize: '12px', fontWeight: 700, color: '#1f2937', marginBottom: '16px' }}>Active Applications</div>
                        {[
                          { co: 'Google', role: 'Software Engineer II', stage: 'Technical Interview', round: 'Round 3', col: '#1e40af', bg: '#eff6ff', dot: '#2563eb' },
                          { co: 'Razorpay', role: 'Backend Engineer', stage: 'System Design', round: 'Round 2', col: '#7c3aed', bg: '#f5f3ff', dot: '#7c3aed' },
                          { co: 'Flipkart', role: 'Full Stack Developer', stage: 'Offer Negotiation', round: 'Final', col: '#065f46', bg: '#ecfdf5', dot: '#10b981' },
                        ].map((job, i) => (
                          <div key={i} className={styles.trackCard}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: job.dot, flexShrink: 0 }} />
                                <div>
                                  <div style={{ fontSize: '12px', fontWeight: 700, color: '#111827' }}>{job.co}</div>
                                  <div style={{ fontSize: '10px', color: '#6b7280' }}>{job.role}</div>
                                </div>
                              </div>
                              <div style={{ textAlign: 'right' }}>
                                <span style={{ fontSize: '9px', fontWeight: 700, color: job.col, background: job.bg, padding: '2px 8px', borderRadius: '12px', display: 'block', marginBottom: '2px' }}>{job.stage}</span>
                                <span style={{ fontSize: '9px', color: '#9ca3af' }}>{job.round}</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
      {/* ── Scroll Chapter Label ── */}
      <div className={`${styles.chapterLabel} gsap-chapter-label`}>
        <span className={styles.chapterLine} />
        <span className={styles.chapterText}>How It Works</span>
        <span className={styles.chapterLine} />
      </div>

      <section className={styles.workflowSection} id="how-it-works">
        <div className={styles.sectionInner}>
          <div style={{ textAlign: 'center', marginBottom: '48px' }}>
            <h2 className={`${styles.sectionTitle} gsap-section-title`}>How Skilotech Works</h2>
            <p className={`${styles.sectionSubtitle} gsap-section-sub`}>
              Four simple steps from zero experience to your first offer letter.
            </p>
          </div>

          <div className={styles.storyContainer}>
            {/* Left Column: Sticky visual preview */}
            <div className={styles.storySticky}>
              <div className={styles.storyProgressIndicator}>
                {workflowSteps.map((_, i) => (
                  <button
                    key={i}
                    className={`${styles.storyProgressDot} ${activeTab === i ? styles.storyProgressDotActive : ''}`}
                    onClick={() => {
                      const el = document.getElementById(`workflow-step-${i}`);
                      el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    }}
                    aria-label={`Go to step ${i + 1}`}
                  />
                ))}
              </div>
              <div className={styles.storyVisualWrapper}>
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, scale: 0.95, y: 15 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: -15 }}
                    transition={{ duration: 0.35, ease: 'easeOut' }}
                    className={styles.storyVisualCard}
                  >
                    {workflowSteps[activeTab]?.visual || null}
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>

            {/* Right Column: Scrollable cards */}
            <div className={styles.storyScroll}>
              {workflowSteps.map((step, i) => (
                <div
                  key={i}
                  id={`workflow-step-${i}`}
                  className={`${styles.storyStepCard} gsap-workflow-step ${activeTab === i ? styles.storyStepCardActive : ''}`}
                  data-step-index={i}
                >
                  <span className={styles.storyStepNum}>{step.num}</span>
                  <h3 className={styles.storyStepTitle}>{step.title}</h3>
                  <p className={styles.storyStepDesc}>{step.desc}</p>
                  <div style={{ marginTop: '20px' }}>
                    <Link href="/sign-up" className="btn btn-primary" style={{ borderRadius: 'var(--radius-md)' }}>
                      Get Started →
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Stats Section ──────────────────────────────────────── */}
      <section className={styles.statsSection} id="stats">
        <div
          className={`${styles.statsGrid} gsap-stagger-group`}
        >
          {stats.map((stat) => (
            <div
              key={stat.label}
              className={`${styles.statItem} gsap-stagger-item`}
            >
              <span className={`${styles.statValue} gsap-stat-value`}>{stat.value}</span>
              <span className={styles.statLabel}>{stat.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── Scroll Chapter Label ────────────────────────── */}
      <div className={`${styles.chapterLabel} gsap-chapter-label`}>
        <span className={styles.chapterLine} />
        <span className={styles.chapterText}>By the Numbers</span>
        <span className={styles.chapterLine} />
      </div>


      {/* ── Final CTA Section ───────────────────────────────────── */}
      <section className={styles.ctaSection}>
        <div className={styles.ctaContainer}>
          <h2 className={`${styles.ctaTitle} gsap-cta-title`}>Ready to start coding?</h2>
          <p className={`${styles.ctaText} gsap-section-sub`}>Join thousands of learners building their tech careers with real-time feedback.</p>
          <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', marginTop: '24px' }}>
            <Link href="/sign-up" className="btn btn-primary btn-lg" style={{ borderRadius: 'var(--radius-md)' }}>
              Get Started Free →
            </Link>
            <Link href="/sign-in" className="btn btn-secondary btn-lg" style={{ borderRadius: 'var(--radius-md)' }}>
              Sign In
            </Link>
          </div>
        </div>
      </section>

      {/* ── Footer ─────────────────────────────────────────────── */}
      <footer className={styles.footer}>
        <div className={styles.footerInner}>
          <div className={styles.footerGrid}>
            {/* Column 1: Brand Info */}
            <div className={styles.footerBrandCol}>
              <div style={{ overflow: 'hidden', height: '36px', display: 'flex', alignItems: 'center', marginBottom: '16px' }}>
                <img src="/logo.png" alt="Skilotech Logo" style={{ width: '130px', height: '130px', marginTop: '-47px', marginBottom: '-47px', objectFit: 'contain', display: 'block' }} />
              </div>
              <p className={styles.footerTagline}>
                Master in-demand tech skills with expert-led courses, interactive coding labs, and real-time AI tutor feedback.
              </p>
              <div className={styles.footerSocials}>
                <a href="#" className={styles.footerSocialLink} aria-label="X"><IconTwitterX /></a>
                <a href="#" className={styles.footerSocialLink} aria-label="LinkedIn"><IconLinkedin /></a>
                <a href="#" className={styles.footerSocialLink} aria-label="GitHub"><IconGithub /></a>
              </div>
            </div>

            {/* Column 2: Platform Links */}
            <div className={styles.footerLinkCol}>
              <h4 className={styles.footerColTitle}>Platform</h4>
              <ul className={styles.footerLinks}>
                <li><a href="#features" className={styles.footerLink}>Courses</a></li>
                <li><a href="#features" className={styles.footerLink}>Coding Lab</a></li>
                <li><a href="#features" className={styles.footerLink}>AI Feedback</a></li>
                <li><a href="#features" className={styles.footerLink}>Job Placement</a></li>
              </ul>
            </div>

            {/* Column 3: Resources Links */}
            <div className={styles.footerLinkCol}>
              <h4 className={styles.footerColTitle}>Resources</h4>
              <ul className={styles.footerLinks}>
                <li><a href="#" className={styles.footerLink}>Documentation</a></li>
                <li><a href="#" className={styles.footerLink}>Help Center</a></li>
                <li><a href="#" className={styles.footerLink}>Blog Insights</a></li>
                <li><a href="#" className={styles.footerLink}>API Reference</a></li>
              </ul>
            </div>

            {/* Column 4: Company Links */}
            <div className={styles.footerLinkCol}>
              <h4 className={styles.footerColTitle}>Company</h4>
              <ul className={styles.footerLinks}>
                <li><a href="#" className={styles.footerLink}>About Us</a></li>
                <li><a href="#" className={styles.footerLink}>Careers</a></li>
                <li><a href="#" className={styles.footerLink}>Hiring Partners</a></li>
                <li><a href="#" className={styles.footerLink}>Contact</a></li>
              </ul>
            </div>
          </div>

          {/* Divider */}
          <div className={styles.footerDivider} />

          {/* Bottom Row */}
          <div className={styles.footerBottom}>
            <p className={styles.footerCopyright}>© 2026 Skilotech. All rights reserved.</p>
            <div className={styles.footerLegal}>
              <a href="#" className={styles.footerLegalLink}>Privacy Policy</a>
              <span className={styles.footerLegalDot}>·</span>
              <a href="#" className={styles.footerLegalLink}>Terms of Service</a>
              <span className={styles.footerLegalDot}>·</span>
              <a href="#" className={styles.footerLegalLink}>Cookie Policy</a>
            </div>
          </div>
        </div>
      </footer>

    </div>
  );
}
