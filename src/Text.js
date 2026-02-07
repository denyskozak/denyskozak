import React from "react";

import { motion } from "motion/react"
const container = {
  hidden: {},
  show: (p) => ({
    transition: {
      delayChildren: p.delay,
      staggerChildren: p.stagger,
    },
  }),
};

const word = {
  hidden: {
    opacity: 0,
    y: 18,
    filter: "blur(10px)",
    rotateX: 18,
  },
  show: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    rotateX: 0,
    transition: {
      type: "spring",
      stiffness: 520,
      damping: 34,
      mass: 0.7,
    },
  },
};

export function RevealText({
                             text,
                             as: Tag = "h1",
                             className,
                             delay = 0.05,
                             stagger = 0.06,

                           }) {
  const words = text.split(" ");

  return (
    <motion.div
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-10% 0px -10% 0px" }}
      variants={container}
      custom={{ delay, stagger }}
      style={{ perspective: 900 }}
    >
      <Tag className={className} style={{ display: "inline", margin: 0 }}>
        {words.map((w, i) => (
          <motion.span
            key={`${w}-${i}`}
            variants={word}
            style={{ display: "inline-block", marginRight: "0.28em" }}
          >
            {w}
          </motion.span>
        ))}
      </Tag>
    </motion.div>
  );
}

