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
      duration: 0.3,
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
      className={`border border-white/10 bg-[#141414] rounded-none p-6 hover:border-white/20 transition-colors duration-200 ${className}`}
    >
      {children}
    </motion.div>
  );
}
