'use client';

import { motion } from 'framer-motion';

export function FloatingOrbs() {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none">
      {/* Top left orb */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{
          opacity: 0.4,
          scale: 1,
          y: [0, -20, 0],
        }}
        transition={{
          duration: 4,
          y: {
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }
        }}
        className="absolute -top-24 -left-24 w-96 h-96 bg-lorenzo-accent-teal rounded-full blur-3xl"
      />

      {/* Top right orb */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{
          opacity: 0.3,
          scale: 1,
          y: [0, 30, 0],
        }}
        transition={{
          duration: 4,
          delay: 1,
          y: {
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut"
          }
        }}
        className="absolute -top-32 -right-32 w-80 h-80 bg-lorenzo-cream rounded-full blur-3xl"
      />

      {/* Bottom left orb */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{
          opacity: 0.3,
          scale: 1,
          x: [0, 20, 0],
        }}
        transition={{
          duration: 4,
          delay: 2,
          x: {
            duration: 12,
            repeat: Infinity,
            ease: "easeInOut"
          }
        }}
        className="absolute -bottom-24 -left-24 w-72 h-72 bg-lorenzo-light-teal rounded-full blur-3xl"
      />

      {/* Bottom right orb */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{
          opacity: 0.25,
          scale: 1,
          x: [0, -30, 0],
          y: [0, 20, 0],
        }}
        transition={{
          duration: 4,
          delay: 1.5,
          x: {
            duration: 14,
            repeat: Infinity,
            ease: "easeInOut"
          },
          y: {
            duration: 9,
            repeat: Infinity,
            ease: "easeInOut"
          }
        }}
        className="absolute -bottom-32 -right-32 w-96 h-96 bg-linear-to-br from-lorenzo-teal to-lorenzo-cream rounded-full blur-3xl"
      />

      {/* Center accent orb */}
      <motion.div
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{
          opacity: 0.2,
          scale: 1,
          rotate: 360,
        }}
        transition={{
          duration: 5,
          delay: 0.5,
          rotate: {
            duration: 30,
            repeat: Infinity,
            ease: "linear"
          }
        }}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-gradient-radial from-lorenzo-accent-teal/20 to-transparent rounded-full blur-2xl"
      />
    </div>
  );
}