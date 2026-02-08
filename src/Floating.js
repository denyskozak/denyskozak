import { motion } from "motion/react"

export function Floating({ children, className }) {
  return (
    <motion.div
      className={className}
      animate={{ y: [0, -20, 0] }}
      transition={{
        duration: 2.4,
        ease: "easeInOut",
        repeat: Infinity,
        repeatType: "mirror",
      }}
    >
      {children}
    </motion.div>
  )
}
