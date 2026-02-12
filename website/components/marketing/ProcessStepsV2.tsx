/**
 * ProcessStepsV2 Component - Modern Timeline Journey Design
 *
 * A modern, performant redesign of the "How It Works" section featuring:
 * - Timeline-based layout (3 horizontal + 1 centered)
 * - Native IntersectionObserver animations (no Framer Motion)
 * - Reduced motion support for accessibility
 * - Clean, minimalistic design with Lorenzo brand colors
 * - Mobile-first responsive design
 *
 * @module components/marketing/ProcessStepsV2
 */

'use client';

import { useEffect, useRef, useState } from 'react';
import { Calendar, Package, Sparkles, Truck } from 'lucide-react';

/** Customer login URL on the POS system */
const CUSTOMER_LOGIN_URL = `${process.env.NEXT_PUBLIC_POS_API_URL || 'http://localhost:3000'}/customer-login`;

interface Step {
  number: number;
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
}

const steps: Step[] = [
  {
    number: 1,
    icon: Calendar,
    title: 'Schedule a Pickup',
    description: 'Choose your preferred date and time. We work around your schedule for maximum convenience.',
  },
  {
    number: 2,
    icon: Package,
    title: 'We Collect It',
    description: 'Our team picks up your laundry bag safely and labels it for accurate and secure processing.',
  },
  {
    number: 3,
    icon: Sparkles,
    title: 'Clean & Care',
    description: 'Clothes are washed, dried, and folded neatly with care using safe detergents and premium machines.',
  },
  {
    number: 4,
    icon: Truck,
    title: 'Delivered to You',
    description: 'Your laundry is returned fresh and on schedule — clean, soft, and ready to wear.',
  },
];

export function ProcessStepsV2() {
  const [visibleSteps, setVisibleSteps] = useState<number[]>([]);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const stepRefs = useRef<(HTMLDivElement | null)[]>([]);
  const sectionRef = useRef<HTMLDivElement>(null);

  // Detect reduced motion preference
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    const handleChange = () => setPrefersReducedMotion(mediaQuery.matches);
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  // Intersection Observer for scroll animations
  useEffect(() => {
    if (prefersReducedMotion) {
      // If reduced motion, show all steps immediately
      setVisibleSteps([0, 1, 2, 3]);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const index = stepRefs.current.indexOf(entry.target as HTMLDivElement);
            if (index !== -1 && !visibleSteps.includes(index)) {
              setVisibleSteps((prev) => [...prev, index]);
            }
          }
        });
      },
      { threshold: 0.2 }
    );

    stepRefs.current.forEach((ref) => {
      if (ref) observer.observe(ref);
    });

    return () => observer.disconnect();
  }, [prefersReducedMotion, visibleSteps]);

  return (
    <section ref={sectionRef} className="py-16 md:py-24 bg-white">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Section Header */}
        <div className="text-center mb-12 md:mb-16">
          <h2 className="text-3xl md:text-5xl font-bold text-black mb-4">
            How It Works
          </h2>
          <p className="text-base md:text-lg text-secondary max-w-2xl mx-auto">
            Experience premium dry cleaning in four simple steps
          </p>
        </div>

        {/* Desktop Layout: 3 steps horizontal + 1 centered below */}
        <div className="hidden lg:block">
          {/* Top row: Steps 1-3 */}
          <div className="flex justify-center items-start gap-12 mb-16">
            {steps.slice(0, 3).map((step, index) => (
              <StepCard
                key={step.number}
                step={step}
                index={index}
                isVisible={visibleSteps.includes(index)}
                prefersReducedMotion={prefersReducedMotion}
                setRef={(el) => (stepRefs.current[index] = el)}
              />
            ))}
          </div>

          {/* Bottom row: Step 4 centered */}
          <div className="flex justify-center">
            <StepCard
              step={steps[3]}
              index={3}
              isVisible={visibleSteps.includes(3)}
              prefersReducedMotion={prefersReducedMotion}
              highlighted={true}
              setRef={(el) => (stepRefs.current[3] = el)}
            />
          </div>
        </div>

        {/* Mobile/Tablet Layout: Vertical timeline */}
        <div className="lg:hidden space-y-10">
          {steps.map((step, index) => (
            <div key={step.number} className="relative">
              <StepCard
                step={step}
                index={index}
                isVisible={visibleSteps.includes(index)}
                prefersReducedMotion={prefersReducedMotion}
                setRef={(el) => (stepRefs.current[index] = el)}
              />
              {index < steps.length - 1 && (
                <div className="absolute left-6 top-full h-10 w-0.5 bg-border" />
              )}
            </div>
          ))}
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mt-12 md:mt-16">
          <a
            href={CUSTOMER_LOGIN_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="px-8 py-4 bg-lorenzo-accent-teal text-white font-semibold rounded-lg hover:bg-lorenzo-accent-teal-dark transition-colors duration-300 text-center"
          >
            Get Started
          </a>
          <a
            href="/services"
            className="px-8 py-4 border-2 border-black text-black font-semibold rounded-lg hover:bg-black hover:text-white transition-colors duration-300 text-center"
          >
            View Services
          </a>
        </div>
      </div>
    </section>
  );
}

interface StepCardProps {
  step: Step;
  index: number;
  isVisible: boolean;
  prefersReducedMotion: boolean;
  highlighted?: boolean;
  setRef: (el: HTMLDivElement | null) => void;
}

function StepCard({
  step,
  index,
  isVisible,
  prefersReducedMotion,
  highlighted = false,
  setRef,
}: StepCardProps) {
  const Icon = step.icon;

  return (
    <div
      ref={setRef}
      className={`
        group relative max-w-xs w-full
        ${!prefersReducedMotion ? 'transition-all duration-500 ease-out' : ''}
        ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}
        ${highlighted ? 'lg:scale-105' : ''}
      `}
      style={{
        transitionDelay: prefersReducedMotion ? '0ms' : `${index * 100}ms`,
      }}
    >
      {/* Step Number Badge */}
      <div className="absolute -top-3 -left-3 w-8 h-8 bg-lorenzo-accent-teal rounded-full flex items-center justify-center z-10 shadow-md">
        <span className="text-white text-sm font-bold">{step.number}</span>
      </div>

      {/* Card Container */}
      <div
        className={`
          relative p-6 bg-light-gray rounded-lg
          group-hover:bg-lorenzo-accent-teal
          transition-all duration-300 ease-out
          ${!prefersReducedMotion ? 'group-hover:shadow-lg' : ''}
          h-full
        `}
      >
        {/* Icon Container */}
        <div
          className={`
            w-12 h-12 mx-auto mb-4 flex items-center justify-center
            ${!prefersReducedMotion ? 'transition-transform duration-300 group-hover:scale-110' : ''}
          `}
        >
          <Icon
            className={`
              w-full h-full text-lorenzo-accent-teal
              group-hover:text-white
              transition-colors duration-300
            `}
          />
        </div>

        {/* Content */}
        <h3
          className={`
            text-2xl font-semibold text-black mb-2 text-center
            group-hover:text-white
            transition-colors duration-300
          `}
        >
          {step.title}
        </h3>
        <p
          className={`
            text-base text-secondary text-center
            group-hover:text-white/90
            transition-colors duration-300
          `}
        >
          {step.description}
        </p>
      </div>
    </div>
  );
}
