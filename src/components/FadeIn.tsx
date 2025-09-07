// src/components/FadeIn.tsx
'use client'

import { motion } from 'framer-motion'
import { ReactNode } from 'react'

export default function FadeIn({ children }: { children: ReactNode }) {
  return (
    <motion.main
      className="flex-1"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
    >
      {children}
    </motion.main>
  )
}
