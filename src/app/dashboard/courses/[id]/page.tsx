'use client';

import React, { use, useState } from 'react';
import { mockCourses } from '@/data/mock';
import Link from 'next/link';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import ProgressBar from '@/components/ui/ProgressBar';
import { useAuth } from '@/context/AuthContext';

interface PageProps {
  params: Promise<{ id: string }>;
}

// ─── Razorpay Checkout Modal ───────────────────────────────────────────────
interface CheckoutModalProps {
  course: { id: string; title: string; price: number };
  onClose: () => void;
  onSuccess: (paymentId: string) => void;
}

function CheckoutModal({ course, onClose, onSuccess }: CheckoutModalProps) {
  const [step, setStep] = useState<'form' | 'processing' | 'success'>('form');
  const [method, setMethod] = useState<'upi' | 'card' | 'netbanking'>('upi');
  const [upiId, setUpiId] = useState('');
  const [cardNum, setCardNum] = useState('');
  const [cardName, setCardName] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');

  const handlePay = () => {
    setStep('processing');
    setTimeout(() => {
      const fakeTxnId = 'pay_' + Math.random().toString(36).substring(2, 12).toUpperCase();
      setStep('success');
      setTimeout(() => onSuccess(fakeTxnId), 1600);
    }, 2200);
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 1000,
      background: 'rgba(0,0,0,0.72)',
      backdropFilter: 'blur(6px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '16px',
      animation: 'fadeIn 0.2s ease'
    }}>
      <div style={{
        background: 'var(--bg-secondary)',
        border: '1px solid var(--border-primary)',
        borderRadius: 'var(--radius-xl)',
        width: '100%', maxWidth: '480px',
        boxShadow: '0 24px 80px rgba(0,0,0,0.6)',
        overflow: 'hidden',
        animation: 'slideInUp 0.3s cubic-bezier(0.34,1.56,0.64,1)'
      }}>

        {/* Modal Header */}
        <div style={{
          background: 'linear-gradient(135deg, #1e1b4b 0%, #0a0e1a 100%)',
          padding: '20px 24px',
          borderBottom: '1px solid var(--border-primary)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '36px', height: '36px', borderRadius: '8px',
              background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '18px'
            }}>💳</div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 'var(--font-size-md)', color: 'var(--text-primary)' }}>Skillzy Checkout</div>
              <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-tertiary)' }}>Secured by Razorpay</div>
            </div>
          </div>
          {step === 'form' && (
            <button onClick={onClose} style={{ background: 'transparent', color: 'var(--text-tertiary)', fontSize: '1.4rem', lineHeight: 1 }}>×</button>
          )}
        </div>

        <div style={{ padding: '24px' }}>
          {step === 'form' && (
            <>
              {/* Order Summary */}
              <div style={{
                background: 'var(--bg-glass)',
                border: '1px solid var(--border-primary)',
                borderRadius: 'var(--radius-md)',
                padding: '14px 16px',
                marginBottom: '20px',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center'
              }}>
                <div>
                  <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-tertiary)', marginBottom: '4px' }}>Enrolling in</div>
                  <div style={{ fontWeight: 600, fontSize: 'var(--font-size-sm)', color: 'var(--text-primary)', maxWidth: '260px' }}>{course.title}</div>
                </div>
                <div style={{ fontWeight: 900, fontSize: '1.25rem', color: 'var(--accent-primary-hover)', whiteSpace: 'nowrap' }}>
                  ₹{course.price.toLocaleString('en-IN')}
                </div>
              </div>

              {/* Payment Method Tabs */}
              <div style={{ marginBottom: '20px' }}>
                <div style={{ fontSize: 'var(--font-size-xs)', fontWeight: 600, color: 'var(--text-tertiary)', textTransform: 'uppercase', marginBottom: '10px' }}>Payment Method</div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  {(['upi', 'card', 'netbanking'] as const).map((m) => (
                    <button
                      key={m}
                      onClick={() => setMethod(m)}
                      style={{
                        flex: 1, padding: '8px 4px',
                        borderRadius: 'var(--radius-md)',
                        border: method === m ? '2px solid var(--accent-primary)' : '2px solid var(--border-primary)',
                        background: method === m ? 'rgba(99,102,241,0.12)' : 'var(--bg-tertiary)',
                        color: method === m ? 'var(--accent-primary-hover)' : 'var(--text-secondary)',
                        fontSize: 'var(--font-size-xs)',
                        fontWeight: 600,
                        cursor: 'pointer',
                        textTransform: 'uppercase',
                        letterSpacing: '0.03em',
                        transition: 'all var(--transition-fast)'
                      }}
                    >
                      {m === 'upi' ? '⚡ UPI' : m === 'card' ? '💳 Card' : '🏦 Net Banking'}
                    </button>
                  ))}
                </div>
              </div>

              {/* UPI Fields */}
              {method === 'upi' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px' }}>
                  <div>
                    <label style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-tertiary)', fontWeight: 600, display: 'block', marginBottom: '6px' }}>UPI ID</label>
                    <input
                      className="input"
                      placeholder="yourname@upi"
                      value={upiId}
                      onChange={e => setUpiId(e.target.value)}
                      style={{ width: '100%' }}
                    />
                  </div>
                  <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-tertiary)', display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <span>Supported:</span>
                    <span style={{ fontWeight: 600 }}>GPay • PhonePe • BHIM • Paytm</span>
                  </div>
                </div>
              )}

              {/* Card Fields */}
              {method === 'card' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px' }}>
                  <div>
                    <label style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-tertiary)', fontWeight: 600, display: 'block', marginBottom: '6px' }}>Card Number</label>
                    <input
                      className="input"
                      placeholder="1234 5678 9012 3456"
                      maxLength={19}
                      value={cardNum}
                      onChange={e => setCardNum(e.target.value.replace(/\D/g, '').replace(/(.{4})/g, '$1 ').trim())}
                      style={{ width: '100%', fontFamily: 'monospace' }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-tertiary)', fontWeight: 600, display: 'block', marginBottom: '6px' }}>Cardholder Name</label>
                    <input className="input" placeholder="Name on card" value={cardName} onChange={e => setCardName(e.target.value)} style={{ width: '100%' }} />
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <div>
                      <label style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-tertiary)', fontWeight: 600, display: 'block', marginBottom: '6px' }}>Expiry</label>
                      <input className="input" placeholder="MM / YY" maxLength={7} value={cardExpiry} onChange={e => setCardExpiry(e.target.value)} style={{ width: '100%' }} />
                    </div>
                    <div>
                      <label style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-tertiary)', fontWeight: 600, display: 'block', marginBottom: '6px' }}>CVV</label>
                      <input className="input" placeholder="•••" maxLength={4} type="password" value={cardCvv} onChange={e => setCardCvv(e.target.value)} style={{ width: '100%' }} />
                    </div>
                  </div>
                </div>
              )}

              {/* Net Banking Fields */}
              {method === 'netbanking' && (
                <div style={{ marginBottom: '20px' }}>
                  <label style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-tertiary)', fontWeight: 600, display: 'block', marginBottom: '6px' }}>Select Bank</label>
                  <select className="input select" style={{ width: '100%' }}>
                    <option>State Bank of India</option>
                    <option>HDFC Bank</option>
                    <option>ICICI Bank</option>
                    <option>Axis Bank</option>
                    <option>Kotak Mahindra Bank</option>
                    <option>Punjab National Bank</option>
                  </select>
                </div>
              )}

              {/* Security Badge */}
              <div style={{
                display: 'flex', gap: '6px', alignItems: 'center', justifyContent: 'center',
                fontSize: 'var(--font-size-xs)', color: 'var(--text-tertiary)',
                marginBottom: '16px'
              }}>
                <span>🔒</span> <span>256-bit SSL Encrypted • PCI-DSS Compliant</span>
              </div>

              <Button
                style={{ width: '100%' }}
                onClick={handlePay}
              >
                Pay ₹{course.price.toLocaleString('en-IN')} →
              </Button>
            </>
          )}

          {step === 'processing' && (
            <div style={{ textAlign: 'center', padding: '32px 0', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
              <div style={{
                width: '56px', height: '56px', borderRadius: '50%',
                border: '3px solid var(--border-primary)',
                borderTop: '3px solid var(--accent-primary)',
                animation: 'spin 0.8s linear infinite'
              }} />
              <div>
                <div style={{ fontWeight: 700, fontSize: 'var(--font-size-md)', color: 'var(--text-primary)', marginBottom: '6px' }}>Processing Payment</div>
                <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-tertiary)' }}>Please do not close this window...</div>
              </div>
            </div>
          )}

          {step === 'success' && (
            <div style={{ textAlign: 'center', padding: '32px 0', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
              <div style={{
                width: '64px', height: '64px', borderRadius: '50%',
                background: 'rgba(16,185,129,0.15)',
                border: '2px solid var(--success)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '2rem',
                animation: 'float 2s ease infinite'
              }}>✅</div>
              <div style={{ fontWeight: 800, fontSize: 'var(--font-size-lg)', color: 'var(--success)' }}>Payment Successful!</div>
              <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)' }}>You are now enrolled. Redirecting...</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Course Detail Page ────────────────────────────────────────────────────
export default function CourseDetail({ params }: PageProps) {
  const { id } = use(params);
  const course = mockCourses.find((c) => c.id === id);
  const { enrolledCourseIds, enrollInCourse, addPayment, user } = useAuth();
  const [showCheckout, setShowCheckout] = useState(false);

  const isEnrolled = course ? enrolledCourseIds.includes(course.id) : false;
  // Use dynamic enrollment from context, fall back to mock progress
  const enrolledProgress = isEnrolled && course?.progress !== undefined ? course.progress : (isEnrolled ? 0 : undefined);

  const handlePaymentSuccess = (txnId: string) => {
    if (!course) return;
    enrollInCourse(course.id);
    addPayment({
      id: txnId,
      studentName: user?.name ?? 'Student',
      courseName: course.title,
      amount: course.price,
      status: 'completed',
      date: new Date().toISOString().slice(0, 10),
      method: 'UPI',
      invoiceId: 'INV-' + Date.now(),
    });
    setShowCheckout(false);
  };

  if (!course) {
    return (
      <div style={{ textAlign: 'center', padding: '4rem var(--spacing-xl)' }}>
        <h2>Course Not Found</h2>
        <p style={{ margin: '1rem 0 2rem 0', color: 'var(--text-secondary)' }}>
          The course you are looking for does not exist or has been removed.
        </p>
        <Link href="/dashboard/courses" className="btn btn-primary">
          Back to Catalog
        </Link>
      </div>
    );
  }

  // Mock course curriculum
  const syllabus = [
    {
      title: 'Module 1: Getting Started & Setup',
      lessons: ['Introduction & Overview', 'Environment Setup & Installation', 'Your First Hello World'],
    },
    {
      title: 'Module 2: Core Concepts & Deep Dive',
      lessons: ['Understanding the Architecture', 'Working with Data & Variables', 'Styling & Basic Styling Systems'],
    },
    {
      title: 'Module 3: Advanced Optimization & Production',
      lessons: ['Performance Optimization Strategies', 'Building for Production', 'Deployment and Cloud hosting'],
    },
  ];

  return (
    <>
      {showCheckout && (
        <CheckoutModal
          course={course}
          onClose={() => setShowCheckout(false)}
          onSuccess={handlePaymentSuccess}
        />
      )}

      <div className="page-container" style={{ display: 'grid', gridTemplateColumns: '3fr 1fr', gap: 'var(--spacing-xl)' }}>
        {/* Course Main Details */}
        <div>
          <div style={{ marginBottom: 'var(--spacing-xl)' }}>
            <Link href="/dashboard/courses" style={{ color: 'var(--accent-primary-hover)', display: 'inline-block', marginBottom: 'var(--spacing-base)' }}>
              ← Back to Catalog
            </Link>
            <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
              <Badge variant="primary">{course.category}</Badge>
              <Badge variant="info">{course.level}</Badge>
            </div>
            <h1 className="page-title" style={{ fontSize: '2.5rem', lineHeight: '1.2' }}>{course.title}</h1>
            <p style={{ fontSize: 'var(--font-size-md)', color: 'var(--text-secondary)', marginTop: 'var(--spacing-sm)' }}>
              {course.description}
            </p>
          </div>

          {/* Rating and Info */}
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '24px',
            padding: 'var(--spacing-base) 0',
            borderTop: '1px solid var(--border-primary)',
            borderBottom: '1px solid var(--border-primary)',
            marginBottom: 'var(--spacing-xl)',
            fontSize: 'var(--font-size-sm)',
            color: 'var(--text-secondary)'
          }}>
            <span>⭐ <strong style={{ color: 'var(--warning)' }}>{course.rating}</strong>/5 rating</span>
            <span>👥 {course.studentsEnrolled.toLocaleString()} students enrolled</span>
            <span>⏱️ {course.duration} total duration</span>
            <span>📁 {course.modules} modules • {course.lessons} lessons</span>
          </div>

          {/* Instructor */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: 'var(--spacing-xl)' }}>
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: 'var(--radius-full)',
              background: 'var(--bg-glass)',
              border: '1px solid var(--border-secondary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.5rem'
            }}>
              {course.instructorAvatar}
            </div>
            <div>
              <h4 style={{ fontWeight: 600 }}>{course.instructor}</h4>
              <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-tertiary)' }}>Lead Instructor</p>
            </div>
          </div>

          {/* Curriculum Section */}
          <div>
            <h2 className="section-title">Course Curriculum</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-base)' }}>
              {syllabus.map((module, mIdx) => (
                <div key={module.title} className="card" style={{ padding: 'var(--spacing-base)' }}>
                  <h3 style={{ fontSize: 'var(--font-size-md)', fontWeight: 700, marginBottom: 'var(--spacing-sm)' }}>
                    {module.title}
                  </h3>
                  <ul style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {module.lessons.map((lesson, lIdx) => (
                      <li key={lesson} style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        fontSize: 'var(--font-size-sm)',
                        color: 'var(--text-secondary)',
                        padding: '8px',
                        background: 'var(--bg-glass)',
                        borderRadius: 'var(--radius-sm)'
                      }}>
                        <span>{isEnrolled ? '▶️' : '🔒'} {mIdx + 1}.{lIdx + 1} {lesson}</span>
                        {isEnrolled ? (
                          <Link href="/dashboard/coding-lab" style={{ fontSize: 'var(--font-size-xs)', color: 'var(--accent-primary-hover)', fontWeight: 500 }}>
                            {mIdx === 0 && lIdx === 0 ? 'Start Lesson ➔' : 'Resume ➔'}
                          </Link>
                        ) : (
                          <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-tertiary)' }}>Enroll to unlock</span>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Pricing / Enrollment Side Card */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-lg)' }}>
          <div className="card" style={{ position: 'sticky', top: 'calc(var(--header-height) + 24px)', display: 'flex', flexDirection: 'column', gap: 'var(--spacing-lg)' }}>
            {isEnrolled ? (
              <>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                    <span style={{ fontSize: '1.25rem' }}>✅</span>
                    <h3 style={{ fontSize: 'var(--font-size-md)', fontWeight: 700 }}>You are enrolled!</h3>
                  </div>
                  <ProgressBar progress={enrolledProgress ?? 0} showLabel />
                  <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-tertiary)', marginTop: '8px' }}>
                    {enrolledProgress ?? 0}% complete • Keep it up!
                  </div>
                </div>
                <Link href="/dashboard/coding-lab" style={{ width: '100%' }}>
                  <Button style={{ width: '100%' }}>Resume Learning ▶</Button>
                </Link>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: 'var(--font-size-xs)', color: 'var(--text-secondary)', borderTop: '1px solid var(--border-primary)', paddingTop: '12px' }}>
                  <span>✓ Lifetime access to all content</span>
                  <span>✓ AI-powered code reviews</span>
                  <span>✓ Certificate of Completion</span>
                </div>
              </>
            ) : (
              <>
                <div>
                  <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-tertiary)' }}>Course Price</span>
                  <div style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--text-primary)', margin: '4px 0' }}>
                    ₹{course.price.toLocaleString('en-IN')}
                  </div>
                  <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--success)' }}>✓ 30-day money-back guarantee</div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: 'var(--font-size-xs)', color: 'var(--text-secondary)' }}>
                  <span>✓ Lifetime access to course content</span>
                  <span>✓ Interactive coding sandbox lab</span>
                  <span>✓ AI-generated review & feedback</span>
                  <span>✓ Certificate of Completion</span>
                </div>
                <Button
                  style={{ width: '100%' }}
                  onClick={() => setShowCheckout(true)}
                >
                  Enroll Now — ₹{course.price.toLocaleString('en-IN')} →
                </Button>
                <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-tertiary)', textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                  <span>🔒</span> Secured by Razorpay
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
