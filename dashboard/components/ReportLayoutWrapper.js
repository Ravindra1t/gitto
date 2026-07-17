'use client';

import { motion } from 'framer-motion';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08
    }
  }
};

const cardVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: "easeOut"
    }
  }
};

export function ReportContainer({ children }) {
  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-8"
    >
      {children}
    </motion.div>
  );
}

export function ReportCard({ children, className = "" }) {
  return (
    <motion.div
      variants={cardVariants}
      className={`border border-white/10 bg-[#141415]/80 backdrop-blur-md rounded-none p-6 shadow-[0_8px_30px_rgba(0,0,0,0.15)] hover:border-white/20 hover:-translate-y-0.5 hover:shadow-[0_0_20px_rgba(99,102,241,0.08)] transition-all duration-300 ${className}`}
    >
      {children}
    </motion.div>
  );
}
