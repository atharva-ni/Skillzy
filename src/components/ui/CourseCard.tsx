import React, { useState } from 'react';
import Link from 'next/link';
import ProgressBar from './ProgressBar';
import { motion } from 'framer-motion';
import { Code, Bot, Settings, Palette, Lock, Laptop } from 'lucide-react';

interface CourseCardProps {
  id: string;
  title: string;
  instructor: string;
  category: string;
  price: number;
  rating: number;
  studentsEnrolled: number;
  duration: string;
  progress?: number;
  thumbnailUrl?: string;
}

const getThumbnailUrl = (courseTitle: string, providedUrl?: string) => {
  const titleLower = courseTitle.toLowerCase();
  
  if (titleLower.includes('python')) {
    return '/python_course_thumbnail.png';
  }
  if (
    titleLower.includes('react') ||
    titleLower.includes('next.js') ||
    titleLower.includes('web development') ||
    titleLower.includes('node.js') ||
    titleLower.includes('html') ||
    titleLower.includes('css') ||
    titleLower.includes('javascript') ||
    titleLower.includes('js')
  ) {
    return '/web_dev_course_thumbnail.png';
  }
  if (
    titleLower.includes('machine learning') ||
    titleLower.includes('ai') ||
    titleLower.includes('artificial intelligence') ||
    titleLower.includes('deep learning')
  ) {
    return '/ai_ml_course_thumbnail.png';
  }
  if (
    titleLower.includes('data structures') ||
    titleLower.includes('algorithms') ||
    titleLower.includes('dsa') ||
    titleLower.includes('c++')
  ) {
    return '/dsa_course_thumbnail.png';
  }
  if (
    titleLower.includes('cybersecurity') ||
    titleLower.includes('security') ||
    titleLower.includes('cryptography')
  ) {
    return '/cybersecurity_course_thumbnail.png';
  }
  if (
    titleLower.includes('aws') ||
    titleLower.includes('cloud') ||
    titleLower.includes('devops')
  ) {
    return '/cloud_computing_course_thumbnail.png';
  }
  
  if (providedUrl && !providedUrl.startsWith('/course-')) {
    return providedUrl;
  }
  
  return '/web_dev_course_thumbnail.png';
};

export default function CourseCard({
  id,
  title,
  instructor,
  category,
  price,
  rating,
  studentsEnrolled,
  duration,
  progress,
  thumbnailUrl
}: CourseCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  const getCategoryStyles = (cat: string, courseTitle: string) => {
    const monochromeBg = '#f9fafb';
    const monochromeText = 'var(--text-secondary, #6b7280)';
    const monochromeIconBg = 'var(--accent-primary, #000000)';

    const titleLower = courseTitle.toLowerCase();
    
    if (titleLower === 'python programming course') {
      return {
        bg: 'linear-gradient(135deg, #e2f1e8 0%, #fef08a 100%)',
        iconBg: '#306998',
        textColor: '#0369a1',
        iconType: 'custom',
        customIcon: <span style={{ fontSize: '1.45rem', lineHeight: 1 }}>🐍</span>
      };
    }
    if (titleLower === 'introduction to ai for beginners') {
      return {
        bg: 'linear-gradient(135deg, #f5f3ff 0%, #e0e7ff 100%)',
        iconBg: '#8b5cf6',
        textColor: '#6d28d9',
        iconType: 'custom',
        customIcon: <span style={{ fontSize: '1.45rem', lineHeight: 1 }}>🤖</span>
      };
    }
    if (titleLower === 'python basic') {
      return {
        bg: 'linear-gradient(135deg, #ecfdf5 0%, #fef08a 100%)',
        iconBg: '#4584b6',
        textColor: '#047857',
        iconType: 'custom',
        customIcon: <span style={{ fontSize: '1.45rem', lineHeight: 1 }}>🐍</span>
      };
    }
    if (titleLower.includes('react') && titleLower.includes('next.js')) {
      return {
        bg: 'linear-gradient(135deg, #ecfeff 0%, #e0f2fe 100%)',
        iconBg: '#00bcd4',
        textColor: '#0891b2',
        iconType: 'custom',
        customIcon: <span style={{ fontSize: '1.45rem', lineHeight: 1 }}>⚛️</span>
      };
    }
    if (titleLower.includes('machine learning')) {
      return {
        bg: 'linear-gradient(135deg, #f5f3ff 0%, #e0e7ff 100%)',
        iconBg: '#8b5cf6',
        textColor: '#6d28d9',
        iconType: 'custom',
        customIcon: <span style={{ fontSize: '1.45rem', lineHeight: 1 }}>🧠</span>
      };
    }
    if (titleLower.includes('data structures')) {
      return {
        bg: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)',
        iconBg: '#10b981',
        textColor: '#047857',
        iconType: 'custom',
        customIcon: <span style={{ fontSize: '1.45rem', lineHeight: 1 }}>🌳</span>
      };
    }
    if (titleLower.includes('cybersecurity')) {
      return {
        bg: 'linear-gradient(135deg, #fee2e2 0%, #ffedd5 100%)',
        iconBg: '#ef4444',
        textColor: '#b91c1c',
        iconType: 'custom',
        customIcon: <span style={{ fontSize: '1.45rem', lineHeight: 1 }}>🛡️</span>
      };
    }
    if (titleLower.includes('aws') || titleLower.includes('cloud computing')) {
      return {
        bg: 'linear-gradient(135deg, #ffedd5 0%, #e0f2fe 100%)',
        iconBg: '#ff9900',
        textColor: '#d97706',
        iconType: 'custom',
        customIcon: <span style={{ fontSize: '1.45rem', lineHeight: 1 }}>☁️</span>
      };
    }

    switch (cat) {
      case 'Web Development':
        return {
          bg: monochromeBg,
          iconBg: monochromeIconBg,
          textColor: monochromeText,
          iconType: 'code'
        };
      case 'Computer Science':
        return {
          bg: monochromeBg,
          iconBg: '#ffffff',
          textColor: monochromeText,
          iconType: 'abacus'
        };
      case 'AI & ML':
        return {
          bg: monochromeBg,
          iconBg: monochromeIconBg,
          textColor: monochromeText,
          iconType: 'bot'
        };
      case 'DevOps':
        return {
          bg: monochromeBg,
          iconBg: monochromeIconBg,
          textColor: monochromeText,
          iconType: 'cpu'
        };
      case 'Design':
        return {
          bg: monochromeBg,
          iconBg: monochromeIconBg,
          textColor: monochromeText,
          iconType: 'palette'
        };
      case 'Security':
        return {
          bg: monochromeBg,
          iconBg: monochromeIconBg,
          textColor: monochromeText,
          iconType: 'lock'
        };
      default:
        return {
          bg: monochromeBg,
          iconBg: monochromeIconBg,
          textColor: monochromeText,
          iconType: 'laptop'
        };
    }
  };

  const renderIcon = (type: string) => {
    const size = 18;
    const color = '#ffffff';
    switch (type) {
      case 'abacus':
        return <span style={{ fontSize: '1.45rem', lineHeight: 1 }}>🧮</span>;
      case 'code':
        return <Code size={size} color={color} strokeWidth={2.5} />;
      case 'bot':
        return <Bot size={size} color={color} strokeWidth={2} />;
      case 'cpu':
        return <Settings size={size} color={color} strokeWidth={2} />;
      case 'palette':
        return <Palette size={size} color={color} strokeWidth={2} />;
      case 'lock':
        return <Lock size={size} color={color} strokeWidth={2} />;
      default:
        return <Laptop size={size} color={color} strokeWidth={2} />;
    }
  };

  const styles = getCategoryStyles(category, title);
  const resolvedThumbnailUrl = getThumbnailUrl(title, thumbnailUrl);

  return (
    <Link href={`/dashboard/courses/${id}`} style={{ textDecoration: 'none', color: 'inherit', display: 'block', height: '100%' }}>
      <motion.div
        className="card card-interactive"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        whileHover={{ y: -4 }}
        transition={{ type: 'spring', stiffness: 350, damping: 22 }}
        style={{
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          padding: 0,
          overflow: 'hidden',
          position: 'relative',
          border: '1px solid #e2e8f0',
          background: '#ffffff',
          borderRadius: '16px',
          boxShadow: isHovered ? '0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.03)' : 'none'
        }}
      >
        <div style={{
          height: '140px',
          background: styles.bg,
          backgroundImage: `url(${resolvedThumbnailUrl})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          borderBottom: '1px solid #f1f5f9',
          zIndex: 1
        }}>

          <span style={{
            position: 'absolute',
            top: '12px',
            right: '12px',
            background: '#ffffff',
            color: '#1e293b',
            padding: '4px 8px',
            borderRadius: '6px',
            fontSize: '0.65rem',
            fontWeight: 700,
            border: '1px solid #e2e8f0',
            boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)',
            letterSpacing: '0.02em',
            textTransform: 'uppercase'
          }}>
            {duration.toUpperCase()}
          </span>
        </div>

        {/* Card Body */}
        <div style={{
          padding: '20px',
          display: 'flex',
          flexDirection: 'column',
          flex: 1,
          zIndex: 1,
          position: 'relative'
        }}>
          {/* Category Tag */}
          <span style={{
            fontSize: '10px',
            fontWeight: 700,
            color: styles.textColor,
            textTransform: 'uppercase',
            letterSpacing: '0.08em'
          }}>
            {category}
          </span>

          {/* Title */}
          <h3 style={{
            fontSize: '0.95rem',
            fontWeight: 700,
            margin: '8px 0',
            color: '#0f172a',
            lineHeight: 1.4,
            minHeight: '2.8em',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden'
          }}>
            {title}
          </h3>

          {/* Instructor */}
          <p style={{
            fontSize: '0.75rem',
            color: '#64748b',
            marginBottom: '12px'
          }}>
            by {instructor}
          </p>

          {/* Ratings & Students */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            marginBottom: '20px',
            fontSize: '0.75rem',
            color: '#64748b'
          }}>
            {rating > 0 ? (
              <>
                <span style={{ color: 'var(--text-primary, #171717)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '2px' }}>
                  ★ {rating.toFixed(1)}
                </span>
                <span>·</span>
                <span>{studentsEnrolled} students</span>
              </>
            ) : (
              <>
                <span>No ratings yet</span>
                <span>·</span>
                <span>{studentsEnrolled} students</span>
              </>
            )}
          </div>

          {/* Progress or Footer Row */}
          {progress !== undefined ? (
            <div style={{ marginTop: 'auto', paddingTop: '8px' }}>
              <ProgressBar progress={progress} showLabel />
            </div>
          ) : (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginTop: 'auto',
              paddingTop: '4px'
            }}>
              {/* Price */}
              <span style={{
                fontSize: '1.05rem',
                fontWeight: 800,
                color: '#0f172a'
              }}>
                {price === 0 ? 'Free' : `₹${price.toLocaleString('en-IN')}`}
              </span>

              {/* Learn More pill button */}
              <div style={{
                fontSize: '0.75rem',
                color: 'var(--text-on-accent, #ffffff)',
                backgroundColor: 'var(--accent-primary, #000000)',
                fontWeight: 600,
                padding: '6px 14px',
                borderRadius: '8px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                transition: 'all 0.2s ease',
                transform: isHovered ? 'translateX(2px)' : 'none'
              }}>
                Learn more <span style={{ transition: 'transform 0.2s ease', transform: isHovered ? 'translateX(2px)' : 'none' }}>→</span>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </Link>
  );
}
