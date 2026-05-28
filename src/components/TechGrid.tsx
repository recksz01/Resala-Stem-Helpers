/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { motion } from "motion/react";

export default function TechGrid() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0 opacity-20">
      {/* Background Grid */}
      <div 
        className="absolute inset-0" 
        style={{ 
          backgroundImage: `linear-gradient(to right, #6b21a8 1px, transparent 1px), linear-gradient(to bottom, #6b21a8 1px, transparent 1px)`,
          backgroundSize: '40px 40px'
        }}
      />
      
      {/* Animated Floating Glows */}
      <motion.div
        animate={{
          x: [0, 200, 0],
          y: [0, 100, 0],
          scale: [1, 1.2, 1],
        }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-brand-purple/20 blur-[120px] rounded-full"
      />
      
      <motion.div
        animate={{
          x: [0, -150, 0],
          y: [0, 120, 0],
          scale: [1, 1.3, 1],
        }}
        transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
        className="absolute bottom-1/4 right-1/4 w-[800px] h-[800px] bg-red-500/10 blur-[150px] rounded-full"
      />

      {/* Floating Particles */}
      {[...Array(15)].map((_, i) => (
        <motion.div
          key={`particle-${i}`}
          initial={{ 
            x: Math.random() * 2000 - 1000, 
            y: Math.random() * 2000 - 1000,
            opacity: 0 
          }}
          animate={{ 
            y: [null, Math.random() * -100 - 50],
            opacity: [0, 0.4, 0],
          }}
          transition={{
            duration: 10 + Math.random() * 10,
            repeat: Infinity,
            delay: Math.random() * 10,
            ease: "easeInOut"
          }}
          className="absolute w-1 h-1 bg-white rounded-full shadow-[0_0_10px_white]"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
          }}
        />
      ))}

      {/* Decorative Lines */}
      <div className="absolute top-0 left-0 w-full h-full">
        {[...Array(5)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ left: '-10%', top: `${20 + i * 15}%`, opacity: 0 }}
            animate={{ 
              left: '110%', 
              opacity: [0, 1, 1, 0],
            }}
            transition={{
              duration: 8 + i * 2,
              repeat: Infinity,
              delay: i * 3,
              ease: "linear"
            }}
            className="absolute h-[1px] w-40 bg-gradient-to-r from-transparent via-brand-purple to-transparent"
          />
        ))}
      </div>
    </div>
  );
}
