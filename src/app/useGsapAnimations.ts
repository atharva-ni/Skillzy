'use client';

import { useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

export function useGsapAnimations(isLoaded: boolean) {
  useEffect(() => {
    // Only run on client-side and when component is fully loaded
    if (!isLoaded || typeof window === 'undefined') return;

    let ctx: any;
    const timer = setTimeout(() => {
      console.log('useGsapAnimations: Initializing animations...');
      try {
        // Register plugins only on client-side
        gsap.registerPlugin(ScrollTrigger);
        console.log('useGsapAnimations: ScrollTrigger registered successfully.');

        // Clean up existing triggers cleanly on re-run
        ScrollTrigger.getAll().forEach((t) => t.kill());

        ctx = gsap.context(() => {
      // ─── 1. Hero Title reveal ─────────────────────────
      const heroTitle = document.querySelector('.gsap-hero-title');
      if (heroTitle) {
        gsap.fromTo(
          heroTitle,
          { y: 30, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 1.0,
            ease: 'power4.out',
            delay: 0.2,
          }
        );
      }

      // ─── 2. Hero Subtitle reveal ──────────────────────
      const heroSub = document.querySelector('.gsap-hero-sub');
      if (heroSub) {
        gsap.fromTo(
          heroSub,
          { opacity: 0, y: 20 },
          { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out', delay: 0.4 }
        );
      }

      // ─── 3. Hero Actions reveal ───────────────────────
      const heroActions = document.querySelector('.gsap-hero-actions');
      if (heroActions) {
        gsap.fromTo(
          heroActions,
          { opacity: 0, y: 15 },
          { opacity: 1, y: 0, duration: 0.7, ease: 'power3.out', delay: 0.55 }
        );
      }

      // ─── 4. Section headline reveals ───────────────────
      document.querySelectorAll('.gsap-section-title').forEach((el) => {
        gsap.fromTo(
          el,
          { y: 35, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.9,
            ease: 'power4.out',
            scrollTrigger: {
              trigger: el,
              start: 'top 85%',
              toggleActions: 'play none none none',
            },
          }
        );
      });

      // ─── 5. Section subtitles fade in ──────────────────
      document.querySelectorAll('.gsap-section-sub').forEach((el) => {
        gsap.fromTo(
          el,
          { opacity: 0, y: 15 },
          {
            opacity: 1,
            y: 0,
            duration: 0.8,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: el,
              start: 'top 88%',
              toggleActions: 'play none none none',
            },
          }
        );
      });

      // ─── 6. Stats - count-up numbers ──────────────────
      document.querySelectorAll('.gsap-stat-value').forEach((el) => {
        const raw = el.textContent ?? '';
        const suffix = raw.replace(/[\d.]/g, ''); // e.g. '+', '%', 'k'
        const num = parseFloat(raw.replace(/[^0-9.]/g, ''));
        if (isNaN(num)) return;

        const obj = { val: 0 };
        gsap.to(obj, {
          val: num,
          duration: 1.8,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: el,
            start: 'top 85%',
            toggleActions: 'play none none none',
          },
          onUpdate: () => {
            el.textContent =
              (Number.isInteger(num) ? Math.round(obj.val) : obj.val.toFixed(1)) + suffix;
          },
        });
      });

      // ─── 7. Staggered card/item reveals ────────────────
      document.querySelectorAll('.gsap-stagger-group').forEach((group) => {
        const items = Array.from(group.querySelectorAll('.gsap-stagger-item'));
        gsap.fromTo(
          items,
          { opacity: 0, y: 30 },
          {
            opacity: 1,
            y: 0,
            stagger: 0.1,
            duration: 0.7,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: group,
              start: 'top 80%',
              toggleActions: 'play none none none',
            },
          }
        );
      });

      // ─── 8. Horizontal marquee speed check ──────────────
      const marqueeTrack = document.querySelector('.gsap-marquee');
      if (marqueeTrack) {
        ScrollTrigger.create({
          trigger: marqueeTrack,
          start: 'top 90%',
          onEnter: () => {
            gsap.to(marqueeTrack, {
              '--marquee-duration': '18s',
              duration: 0.5,
              ease: 'power2.out',
            });
          },
        });
      }



      // ─── 10. Feature showcase browser ──────────────────
      const showcaseBrowser = document.querySelector('.gsap-showcase-browser');
      if (showcaseBrowser) {
        gsap.fromTo(
          showcaseBrowser,
          { opacity: 0, y: 40 },
          {
            opacity: 1,
            y: 0,
            duration: 0.9,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: showcaseBrowser,
              start: 'top 85%',
              toggleActions: 'play none none none',
            },
          }
        );
      }

      // ─── 11. CTA Title reveal ─────────────────────────
      const ctaTitle = document.querySelector('.gsap-cta-title');
      if (ctaTitle) {
        gsap.fromTo(
          ctaTitle,
          { y: 30, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.8,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: ctaTitle,
              start: 'top 85%',
              toggleActions: 'play none none none',
            },
          }
        );
      }

      // ─── 12. PROCESS SECTION ANIMATION (GSAP + ScrollTrigger) ───────────────────────
      const processSection = document.querySelector('.gsap-process-section');
      const nodes = gsap.utils.toArray(".gsap-timeline-node");
      const leftLight = document.querySelector('.gsap-ambient-left');
      const rightLight = document.querySelector('.gsap-ambient-right');

      const ambientColors = [
        { left: 'rgba(99, 102, 241, 0.15)', right: 'rgba(168, 85, 247, 0.15)' }, // Step 1: Indigo/Purple
        { left: 'rgba(13, 148, 136, 0.15)', right: 'rgba(5, 150, 105, 0.15)' }, // Step 2: Teal/Emerald
        { left: 'rgba(217, 119, 6, 0.15)',  right: 'rgba(225, 29, 72, 0.15)' },  // Step 3: Amber/Rose
        { left: 'rgba(79, 70, 229, 0.15)',  right: 'rgba(8, 145, 178, 0.15)' }   // Step 4: Indigo/Cyan
      ];

      const panels = gsap.utils.toArray(".gsap-story-panel");

      if (processSection && panels.length > 1 && window.innerWidth > 1024) {
        // 1. Pinned Timeline Scroll Trigger
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: processSection,
            start: "top top",
            end: `+=${panels.length * 800}`,
            pin: true,
            scrub: 0.2,
            invalidateOnRefresh: true,
          }
        });

        // Initial setup states: show first panel, hide others
        panels.forEach((panel: any, idx: number) => {
          if (idx !== 0) {
            gsap.set(panel, { opacity: 0, display: 'none' });
          } else {
            gsap.set(panel, { opacity: 1, display: 'grid' });
          }
        });

        // Initial setup for timeline nodes
        nodes.forEach((node: any, idx: number) => {
          const indexText = node.querySelector(".gsap-node-index");
          if (idx === 0) {
            gsap.set(node, { borderColor: "#6366f1", backgroundColor: "#6366f1", scale: 1.15 });
            if (indexText) gsap.set(indexText, { color: "#ffffff" });
          } else {
            gsap.set(node, { borderColor: "rgba(0, 0, 0, 0.08)", backgroundColor: "#ffffff", scale: 1 });
            if (indexText) gsap.set(indexText, { color: "var(--text-tertiary)" });
          }
        });

        // Initial setup for ambient background glows
        if (leftLight && rightLight) {
          gsap.set(leftLight, { background: `radial-gradient(circle, ${ambientColors[0].left} 0%, transparent 70%)` });
          gsap.set(rightLight, { background: `radial-gradient(circle, ${ambientColors[0].right} 0%, transparent 70%)` });
        }

        // Sequence transitions
        panels.forEach((panel: any, idx: number) => {
          if (idx < panels.length - 1) {
            const nextPanel = panels[idx + 1];
            const nextColor = ambientColors[idx + 1];
            const currentNode = nodes[idx] as any;
            const nextNode = nodes[idx + 1] as any;
            const curText = currentNode?.querySelector?.(".gsap-node-index");
            const nextText = nextNode?.querySelector?.(".gsap-node-index");

            // Hold current panel visible for a moment
            tl.to({}, { duration: 0.5 });

            // Transition: Snap panels
            tl.set(panel, { opacity: 0, display: 'none' }, `trans_${idx}`);
            tl.set(nextPanel, { opacity: 1, display: 'grid' }, `trans_${idx}`);

            // Transition: Animate timeline progress bar height to the next node in sync
            const nextHeight = `${((idx + 1) / (panels.length - 1)) * 100}%`;
            tl.to(".gsap-timeline-progress", {
              height: nextHeight,
              duration: 0.3,
              ease: "none"
            }, `trans_${idx}`);

            // Transition: Deactivate current timeline node, activate next
            tl.to(currentNode, { borderColor: "rgba(0, 0, 0, 0.08)", backgroundColor: "#ffffff", scale: 1, duration: 0.3 }, `trans_${idx}`);
            if (curText) tl.to(curText, { color: "var(--text-tertiary)", duration: 0.3 }, `trans_${idx}`);

            tl.to(nextNode, { borderColor: "#6366f1", backgroundColor: "#6366f1", scale: 1.15, duration: 0.3 }, `trans_${idx}`);
            if (nextText) tl.to(nextText, { color: "#ffffff", duration: 0.3 }, `trans_${idx}`);

            // Transition: Morph ambient background glows
            if (leftLight && rightLight) {
              tl.to(leftLight, {
                background: `radial-gradient(circle, ${nextColor.left} 0%, transparent 70%)`,
                duration: 0.6,
                ease: "power2.inOut"
              }, `trans_${idx}`);
              tl.to(rightLight, {
                background: `radial-gradient(circle, ${nextColor.right} 0%, transparent 70%)`,
                duration: 0.6,
                ease: "power2.inOut"
              }, `trans_${idx}`);
            }
          }
        });

        // Extra hold on final panel
        tl.to({}, { duration: 0.5 });
      }

      // ─── 13. Hero watermark parallax ───────────────────
      const heroWatermark = document.querySelector('.gsap-hero-watermark');
      if (heroWatermark) {
        gsap.to(heroWatermark, {
          y: -60,
          ease: 'none',
          scrollTrigger: {
            trigger: '.gsap-hero',
            start: 'top top',
            end: 'bottom top',
            scrub: 1.5,
          },
        });
      }

      // ─── 14. Chapter labels reveal ─────────────────────
      document.querySelectorAll('.gsap-chapter-label').forEach((el) => {
        gsap.fromTo(
          el,
          { opacity: 0, y: 15 },
          {
            opacity: 1,
            y: 0,
            duration: 0.6,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: el,
              start: 'top 92%',
              toggleActions: 'play none none none',
            },
          }
        );
      });

      // ─── 15. Hero badge pulse ──────────────────────────
      const heroBadge = document.querySelector('.gsap-hero-badge');
      if (heroBadge) {
        gsap.fromTo(
          heroBadge,
          { opacity: 0, y: -10, scale: 0.95 },
          { opacity: 1, y: 0, scale: 1, duration: 0.6, ease: 'back.out(1.5)', delay: 0.05 }
        );
      }
      });
      } catch (err) {
        console.error('useGsapAnimations: Error initializing GSAP ScrollTrigger:', err);
      }
    }, 100);

    return () => {
      clearTimeout(timer);
      if (ctx) ctx.revert();
      ScrollTrigger.getAll().forEach((t) => t.kill());
    };
  }, [isLoaded]);
}
