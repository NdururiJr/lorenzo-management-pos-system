/**
 * HeroVideo Component
 *
 * Full-viewport hero section with video background, text overlay, and CTAs.
 * Features: autoplay video, gradient overlay, responsive, smooth animations
 *
 * @module components/marketing/HeroVideo
 */

'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ArrowRight, Play } from 'lucide-react';

interface HeroVideoProps {
  /** Video source (MP4) */
  videoSrcMp4?: string;
  /** Video source (WebM) - better compression */
  videoSrcWebm?: string;
  /** Poster image shown before video loads */
  posterImage?: string;
  /** Main headline */
  headline: string;
  /** Subheading / description */
  subheading: string;
  /** Primary CTA text */
  primaryCtaText: string;
  /** Primary CTA link */
  primaryCtaHref: string;
  /** Secondary CTA text */
  secondaryCtaText?: string;
  /** Secondary CTA link */
  secondaryCtaHref?: string;
}

export function HeroVideo({
  videoSrcMp4,
  videoSrcWebm,
  posterImage: _posterImage = '/images/marketing/hero-poster.jpg',
  headline,
  subheading,
  primaryCtaText,
  primaryCtaHref,
  secondaryCtaText,
  secondaryCtaHref,
}: HeroVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [_isVideoLoaded, _setIsVideoLoaded] = useState(false);
  const [_isVideoPlaying, _setIsVideoPlaying] = useState(false);
  const [_videoError, _setVideoError] = useState<string | null>(null);

  // Attempt to play video on mount
  useEffect(() => {
    const video = videoRef.current;
    if (video) {
      // Try to play video (may be blocked by browser autoplay policies)
      const playPromise = video.play();

      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            _setIsVideoPlaying(true);
            console.log('✅ Video is playing successfully');
          })
          .catch((error) => {
            console.error('❌ Video autoplay was prevented:', error);
            console.log('💡 Tip: Check browser address bar for autoplay settings');
            _setVideoError('Video autoplay blocked by browser. Click to enable.');
          });
      }
    }
  }, []);

  // Animation variants for staggered entrance
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.3,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: [0.0, 0.0, 0.2, 1.0] as [number, number, number, number],
      },
    },
  };

  const hasVideo = videoSrcMp4 || videoSrcWebm;

  return (
    <section className="relative h-screen min-h-[600px] flex items-center justify-center overflow-hidden">
      {/* Video Background or Gradient Background */}
      {hasVideo ? (
        <>
          <video
            ref={videoRef}
            className="absolute inset-0 w-full h-full object-cover"
            autoPlay
            muted
            loop
            playsInline
            onLoadedData={() => {
              _setIsVideoLoaded(true);
              console.log('✅ Video loaded successfully');
            }}
            onError={(e) => {
              console.error('❌ Video failed to load:', e);
              _setVideoError('Failed to load video file');
            }}
            onCanPlay={() => {
              console.log('✅ Video can play');
            }}
          >
            {videoSrcWebm && <source src={videoSrcWebm} type="video/webm" />}
            {videoSrcMp4 && <source src={videoSrcMp4} type="video/mp4" />}
            Your browser does not support the video tag.
          </video>

          {/* Gradient Overlay for text legibility */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/50 to-black/70" />
        </>
      ) : (
        /* Fallback gradient background if no video */
        <div className="absolute inset-0 bg-gradient-to-br from-brand-blue via-brand-blue-dark to-brand-blue-900" />
      )}

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="max-w-4xl mx-auto"
        >
          {/* Headline */}
          <motion.h1
            variants={itemVariants}
            className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight"
            style={{ color: '#FFFFFF' }}
          >
            {headline}
          </motion.h1>

          {/* Subheading */}
          <motion.p
            variants={itemVariants}
            className="text-lg sm:text-xl md:text-2xl mb-10 max-w-2xl mx-auto leading-relaxed"
            style={{ color: '#FFFFFF' }}
          >
            {subheading}
          </motion.p>

          {/* CTAs */}
          <motion.div
            variants={itemVariants}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            {/* Primary CTA */}
            <Button
              asChild
              size="lg"
              className="bg-brand-blue hover:bg-brand-blue-dark text-white text-lg px-8 py-6 rounded-full shadow-glow-blue transition-all hover:scale-105"
            >
              <Link href={primaryCtaHref} className="flex items-center gap-2">
                {primaryCtaText}
                <ArrowRight className="w-5 h-5" />
              </Link>
            </Button>

            {/* Secondary CTA */}
            {secondaryCtaText && secondaryCtaHref && (
              <Button
                asChild
                variant="outline"
                size="lg"
                className="bg-white/10 backdrop-blur-md border-white/30 text-white hover:bg-white/20 hover:border-white/50 text-lg px-8 py-6 rounded-full transition-all hover:scale-105"
              >
                <Link href={secondaryCtaHref} className="flex items-center gap-2">
                  {secondaryCtaText}
                  <Play className="w-5 h-5" />
                </Link>
              </Button>
            )}
          </motion.div>

          {/* Trust Badge */}
          <motion.div
            variants={itemVariants}
            className="mt-8 text-white/90 text-sm sm:text-base font-medium"
          >
            Trusted by thousands across the country
          </motion.div>

        </motion.div>
      </div>

      {/* Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.5, duration: 0.6 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 text-white/60"
      >
        <div className="flex flex-col items-center gap-2">
          <span className="text-sm font-medium">Scroll to explore</span>
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: [0.42, 0.0, 0.58, 1.0] as [number, number, number, number] }}
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 14l-7 7m0 0l-7-7m7 7V3"
              />
            </svg>
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
}

/**
 * Simpler hero variant without video (uses gradient background)
 */
export function HeroGradient({
  headline,
  subheading,
  primaryCtaText,
  primaryCtaHref,
  secondaryCtaText,
  secondaryCtaHref,
}: Omit<HeroVideoProps, 'videoSrcMp4' | 'videoSrcWebm' | 'posterImage'>) {
  return (
    <HeroVideo
      headline={headline}
      subheading={subheading}
      primaryCtaText={primaryCtaText}
      primaryCtaHref={primaryCtaHref}
      secondaryCtaText={secondaryCtaText}
      secondaryCtaHref={secondaryCtaHref}
    />
  );
}
