import React from 'react';
import { motion } from 'framer-motion';

interface PageTransitionProps {
  children: React.ReactNode;
  transitionType?: 'fade' | 'slide' | 'scale' | 'slideUp';
}

// Different animation variants
const fadeVariants = {
  initial: { opacity: 0 },
  in: { opacity: 1 },
  out: { opacity: 0 },
};

const slideVariants = {
  initial: { opacity: 0, x: -20 },
  in: { opacity: 1, x: 0 },
  out: { opacity: 0, x: 20 },
};

const scaleVariants = {
  initial: { opacity: 0, scale: 0.95 },
  in: { opacity: 1, scale: 1 },
  out: { opacity: 0, scale: 1.05 },
};

const slideUpVariants = {
  initial: { opacity: 0, y: 20 },
  in: { opacity: 1, y: 0 },
  out: { opacity: 0, y: -20 },
};

// Transition configurations
const transitions = {
  fade: {
    type: 'tween',
    ease: 'easeInOut',
    duration: 0.3,
  },
  slide: {
    type: 'spring',
    stiffness: 300,
    damping: 30,
  },
  scale: {
    type: 'spring',
    stiffness: 400,
    damping: 40,
  },
  slideUp: {
    type: 'tween',
    ease: 'easeInOut',
    duration: 0.3,
  },
};

const PageTransition: React.FC<PageTransitionProps> = ({ 
  children, 
  transitionType = 'slideUp' 
}) => {
  const variants = 
    transitionType === 'fade' ? fadeVariants :
    transitionType === 'slide' ? slideVariants :
    transitionType === 'scale' ? scaleVariants :
    slideUpVariants;
    
  const transition = transitions[transitionType];

  return (
    <motion.div
      initial="initial"
      animate="in"
      exit="out"
      variants={variants}
      transition={transition}
      style={{ width: '100%' }}
    >
      {children}
    </motion.div>
  );
};

export default PageTransition;