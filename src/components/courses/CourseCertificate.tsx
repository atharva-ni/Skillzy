'use client';

import React, { useRef } from 'react';
import { Printer } from 'lucide-react';

interface CertificateProps {
  studentName: string;
  courseTitle: string;
  completionDate?: string;
}

export default function CourseCertificate({
  studentName,
  courseTitle,
  completionDate,
}: CertificateProps) {
  const certificateRef = useRef<HTMLDivElement>(null);

  const formattedDate = completionDate || new Date().toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  const handlePrint = () => {
    window.print();
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px', width: '100%', maxWidth: '880px', margin: '24px auto' }}>
      {/* Printable Action Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }} className="no-print">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '1.25rem' }}>🎓</span>
          <span style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-primary)' }}>
            Official Course Completion Certificate
          </span>
        </div>
        <button
          onClick={handlePrint}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 20px',
            borderRadius: '8px',
            background: '#0d3b66',
            color: '#ffffff',
            fontWeight: 700,
            fontSize: '14px',
            border: 'none',
            cursor: 'pointer',
            boxShadow: '0 4px 14px rgba(13, 59, 102, 0.25)',
            transition: 'all 0.2s ease',
          }}
        >
          <Printer size={16} /> Print / Save Certificate
        </button>
      </div>

      {/* Certificate Frame Matching Template */}
      <div
        ref={certificateRef}
        id="printable-certificate"
        style={{
          width: '100%',
          aspectRatio: '1.35 / 1',
          minHeight: '520px',
          background: '#ffffff',
          color: '#1a202c',
          position: 'relative',
          padding: '48px 56px',
          boxSizing: 'border-box',
          boxShadow: '0 12px 40px rgba(0,0,0,0.12)',
          borderRadius: '4px',
          border: '14px solid #f8fafc',
          outline: '1px solid #cbd5e1',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
        }}
      >
        {/* Top Left Accent Decorative Shape (Navy Blue) */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: 0,
            height: 0,
            borderStyle: 'solid',
            borderWidth: '100px 100px 0 0',
            borderColor: '#0d3b66 transparent transparent transparent',
            zIndex: 1,
          }}
        />

        {/* Top Right Accent Decorative Line */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            right: 0,
            width: '140px',
            height: '10px',
            background: '#0d3b66',
          }}
        />

        {/* Bottom Left Accent Decorative Shape */}
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            width: 0,
            height: 0,
            borderStyle: 'solid',
            borderWidth: '0 0 80px 80px',
            borderColor: 'transparent transparent #0d3b66 transparent',
            zIndex: 1,
          }}
        />

        {/* Header Section */}
        <div style={{ textAlign: 'center', marginTop: '12px', zIndex: 3 }}>
          <h1
            style={{
              fontSize: '2.8rem',
              fontWeight: 900,
              color: '#0d3b66',
              letterSpacing: '4px',
              margin: 0,
              textTransform: 'uppercase',
              lineHeight: 1.1,
            }}
          >
            CERTIFICATE
          </h1>
          <h2
            style={{
              fontSize: '1.05rem',
              fontWeight: 700,
              color: '#1e5b8e',
              letterSpacing: '5px',
              marginTop: '8px',
              marginBottom: '24px',
              textTransform: 'uppercase',
            }}
          >
            OF COMPLETION
          </h2>
          <p
            style={{
              fontSize: '0.95rem',
              color: '#475569',
              margin: 0,
              fontWeight: 500,
            }}
          >
            This certifies that
          </p>
        </div>

        {/* Recipient Name Section */}
        <div style={{ textAlign: 'center', margin: '16px 0', zIndex: 3 }}>
          <div
            style={{
              fontSize: '2.3rem',
              fontWeight: 600,
              color: '#0f172a',
              paddingBottom: '8px',
              display: 'inline-block',
              minWidth: '340px',
              borderBottom: '2px solid #1e293b',
              fontFamily: "Georgia, 'Times New Roman', serif",
            }}
          >
            {studentName || 'Student'}
          </div>
        </div>

        {/* Course Info Section */}
        <div style={{ textAlign: 'center', maxWidth: '640px', margin: '0 auto', zIndex: 3 }}>
          <p style={{ fontSize: '0.95rem', color: '#334155', margin: '0 0 8px 0', lineHeight: 1.5 }}>
            has successfully completed the
          </p>
          <p
            style={{
              fontSize: '1.25rem',
              fontWeight: 800,
              fontStyle: 'italic',
              color: '#0f172a',
              margin: '6px 0 10px 0',
              lineHeight: 1.4,
            }}
          >
            “{courseTitle}”
          </p>
          <p style={{ fontSize: '0.9rem', color: '#475569', margin: 0, lineHeight: 1.6 }}>
            conducted by TechBridge Academy
            <br />
            on {formattedDate}, in San Francisco, California
          </p>
        </div>

        {/* Footer Signatures Section */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-end',
            padding: '0 40px',
            marginTop: '36px',
            zIndex: 3,
          }}
        >
          {/* Left Signatory - CEO (Empty name line per instructions) */}
          <div style={{ textAlign: 'left', minWidth: '200px' }}>
            <div style={{ height: '32px' }} />
            <div style={{ borderBottom: '1.5px solid #334155', width: '100%', marginBottom: '8px' }} />
            <p style={{ margin: 0, fontSize: '0.8rem', fontWeight: 600, color: '#334155' }}>
              Chief Executive Officer
            </p>
          </div>

          {/* Right Signatory - Training Coordinator (Empty name line per instructions) */}
          <div style={{ textAlign: 'right', minWidth: '200px' }}>
            <div style={{ height: '32px' }} />
            <div style={{ borderBottom: '1.5px solid #334155', width: '100%', marginBottom: '8px' }} />
            <p style={{ margin: 0, fontSize: '0.8rem', fontWeight: 600, color: '#334155' }}>
              Training Coordinator
            </p>
          </div>
        </div>
      </div>

      {/* Global CSS for Print */}
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden !important;
          }
          #printable-certificate, #printable-certificate * {
            visibility: visible !important;
          }
          #printable-certificate {
            position: fixed !important;
            left: 0 !important;
            top: 0 !important;
            width: 100vw !important;
            height: 100vh !important;
            max-width: none !important;
            border: none !important;
            box-shadow: none !important;
            padding: 40px 60px !important;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
}
