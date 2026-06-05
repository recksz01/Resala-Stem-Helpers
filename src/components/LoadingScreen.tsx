/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { motion, AnimatePresence } from "motion/react";
import { useState, useEffect } from "react";

export default function LoadingScreen() {
  const [loading, setLoading] = useState(true);
  const [percent, setPercent] = useState(0);
  const [isCinematic, setIsCinematic] = useState(false);

  useEffect(() => {
    const now = Date.now();
    const lastVisit = localStorage.getItem('hub_last_visit');
    
    // 5 hours = 18,000,000 ms
    const fiveHours = 18000000;
    const isFirstOrLongInterval = !lastVisit || (now - parseInt(lastVisit)) > fiveHours;
    
    setIsCinematic(isFirstOrLongInterval);
    localStorage.setItem('hub_last_visit', now.toString());

    const duration = isFirstOrLongInterval ? 7500 : 2500;
    const intervalTime = isFirstOrLongInterval ? 60 : 15;

    const interval = setInterval(() => {
      setPercent(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        const jump = Math.floor(Math.random() * (isFirstOrLongInterval ? 2 : 4)) + 1;
        return Math.min(100, prev + jump);
      });
    }, intervalTime);

    const timer = setTimeout(() => {
      setLoading(false);
      (window as any).__preloaderFinished = true;
      window.dispatchEvent(new CustomEvent("preloaderFinished"));
    }, duration);
    
    return () => {
      clearTimeout(timer);
      clearInterval(interval);
    };
  }, []);

  return (
    <AnimatePresence mode="wait">
      {loading && (
        <motion.div
          key="loader"
          initial={{ opacity: 1 }}
          exit={isCinematic ? { 
            scale: 1.1,
            opacity: 0,
            filter: "blur(40px)",
            transition: { duration: 1, ease: [0.76, 0, 0.24, 1] }
          } : { 
            opacity: 0,
            scale: 1.05,
            filter: "blur(10px)",
            transition: { duration: 0.6, ease: [0.43, 0.13, 0.23, 0.96] }
          }}
          className="fixed inset-0 z-[2000] flex items-center justify-center bg-slate-950 overflow-hidden"
        >
          {isCinematic ? (
            <div className="relative flex flex-col items-center">
              {/* Background Geometric Atmosphere */}
              <div className="absolute inset-0 z-0">
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: [0, 0.4, 0], y: [-100, 100] }}
                  transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
                  className="absolute top-0 left-1/4 w-[1px] h-32 bg-gradient-to-b from-transparent via-brand-purple to-transparent"
                />
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: [0, 0.3, 0], y: [100, -100] }}
                  transition={{ duration: 8, repeat: Infinity, ease: "linear", delay: 2 }}
                  className="absolute bottom-0 right-1/3 w-[1px] h-48 bg-gradient-to-b from-transparent via-red-500 to-transparent"
                />
                
                {/* Floating Particles */}
                {[...Array(20)].map((_, i) => (
                  <motion.div
                    key={i}
                    initial={{ 
                      x: Math.random() * 1000 - 500, 
                      y: Math.random() * 1000 - 500,
                      opacity: 0 
                    }}
                    animate={{ 
                      y: [null, Math.random() * -200],
                      opacity: [0, 1, 0]
                    }}
                    transition={{ 
                      duration: Math.random() * 3 + 2, 
                      repeat: Infinity,
                      delay: Math.random() * 5
                    }}
                    className="absolute w-1 h-1 bg-white rounded-full blur-[1px]"
                  />
                ))}
              </div>

              {/* Cinematic Logo Sequence */}
              <div className="relative z-10 flex flex-col items-center">
                <motion.div 
                  initial="hidden"
                  animate="visible"
                  variants={{
                    hidden: { opacity: 0 },
                    visible: {
                      opacity: 1,
                      transition: { staggerChildren: 0.3 }
                    }
                  }}
                  className="flex flex-col items-center gap-0 mb-20"
                >
                  <motion.div
                    variants={{
                      hidden: { y: 20, opacity: 0, letterSpacing: "1em" },
                      visible: { y: 0, opacity: 1, letterSpacing: "0.6em" }
                    }}
                    transition={{ duration: 1.2, ease: "easeOut" }}
                    className="text-red-500 text-xl md:text-2xl font-black uppercase mb-4 drop-shadow-[0_0_20px_rgba(239,68,68,0.4)]"
                  >
                    Resala
                  </motion.div>

                  <div className="flex gap-6 md:gap-12 relative">
                    {["S", "T", "E", "M"].map((char, i) => (
                      <motion.div key={i} className="relative">
                        <motion.span
                          variants={{
                            hidden: { y: 80, opacity: 0, filter: "blur(20px)", scale: 2, rotateY: 90 },
                            visible: { y: 0, opacity: 1, filter: "blur(0px)", scale: 1, rotateY: 0 }
                          }}
                          transition={{ duration: 1.8, ease: [0.16, 1, 0.3, 1] }}
                          className={`text-8xl md:text-[12rem] font-black italic tracking-tighter block leading-none select-none ${
                            char === 'T' ? 'text-red-500 drop-shadow-[0_0_30px_rgba(239,68,68,0.3)]' : 'text-white'
                          }`}
                        >
                          {char}
                        </motion.span>
                        {/* Chrome Effect Overlay */}
                        <motion.div 
                          initial={{ opacity: 0 }}
                          animate={{ opacity: [0, 0.2, 0] }}
                          transition={{ delay: 2, duration: 2, repeat: Infinity }}
                          className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/20 to-transparent pointer-events-none"
                        />
                      </motion.div>
                    ))}
                  </div>
                  
                  <motion.div
                    initial={{ opacity: 0, scale: 1.5, filter: "blur(20px)" }}
                    animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
                    transition={{ delay: 2.2, duration: 1.8, ease: [0.16, 1, 0.3, 1] }}
                    className="flex flex-col items-center gap-4"
                  >
                    <div className="flex items-center gap-6">
                      <div className="h-[1px] w-16 bg-gradient-to-r from-transparent via-red-500 to-red-500" />
                      <span className="text-5xl md:text-9xl font-black italic text-white tracking-[0.2em] uppercase drop-shadow-[0_0_40px_rgba(255,255,255,0.3)] select-none">Helpers</span>
                      <div className="h-[1px] w-16 bg-gradient-to-l from-transparent via-red-500 to-red-500" />
                    </div>
                    <motion.div 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 3.5 }}
                      className="text-[0.6rem] font-black uppercase tracking-[1em] text-red-500/60 select-none"
                    >
                      Resala STEM Helpers | Egypt Hub
                    </motion.div>
                  </motion.div>
                </motion.div>

                {/* Subtext Reveal */}
                <motion.div
                  initial={{ opacity: 0, letterSpacing: "1.5em", y: 20 }}
                  animate={{ opacity: 1, letterSpacing: "0.8em", y: 0 }}
                  transition={{ delay: 3.2, duration: 2.5, ease: "easeOut" }}
                  className="text-white/20 text-[0.6rem] font-bold uppercase mb-16 tracking-[1em]"
                >
                  Innovating STEM Education in Egypt
                </motion.div>

                {/* Detailed Matrix Progress */}
                <div className="relative w-80">
                  <div className="h-[2px] bg-white/5 w-full rounded-full overflow-hidden mb-4">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${percent}%` }}
                      className="h-full bg-gradient-to-r from-brand-purple via-red-500 to-brand-purple"
                    />
                  </div>
                  <div className="flex justify-between items-end">
                    <div className="text-[10px] font-mono text-green-500/50">
                      <motion.div animate={{ opacity: [0, 1, 0] }} transition={{ duration: 0.1, repeat: Infinity }}>
                        {percent < 100 ? `SYNCING_MODULE_${Math.floor(Math.random() * 999)}` : "SYSTEM_READY"}
                      </motion.div>
                    </div>
                    <div className="text-4xl font-black text-white italic tabular-nums">
                      {percent}<span className="text-sm text-red-500 not-italic ml-1">%</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Light Sweep Film Effect */}
              <motion.div 
                animate={{ 
                  x: ['-200%', '300%'],
                  opacity: [0, 0.1, 0] 
                }}
                transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                className="absolute top-0 bottom-0 w-[500px] bg-white blur-[150px] skew-x-[45deg] z-5"
              />
            </div>
          ) : (
            <div className="relative flex flex-col items-center z-20">
              {/* Logo Sequence (Standard) */}
              <div className="relative mb-12 flex flex-col items-center justify-center overflow-hidden">
                <motion.span
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-red-500 text-[0.6rem] font-black uppercase tracking-[0.6em] mb-1"
                >
                  Resala
                </motion.span>
                <motion.div 
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                  className="flex items-center gap-1"
                >
                  <span className="text-white text-6xl md:text-7xl font-black tracking-tighter italic leading-none">S</span>
                  <span className="text-red-500 text-6xl md:text-7xl font-black tracking-tighter italic leading-none">T</span>
                  <span className="text-white text-6xl md:text-7xl font-black tracking-tighter italic leading-none">EM</span>
                </motion.div>
                <motion.span
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="text-white text-xs font-black uppercase tracking-[0.4em] mt-2 block opacity-60"
                >
                  Helpers
                </motion.span>
              </div>

              {/* Standard Progress */}
              <div className="flex flex-col items-center gap-6">
                <div className="w-48 h-[2px] bg-white/5 relative overflow-hidden rounded-full">
                  <motion.div 
                     initial={{ width: "0%" }}
                     animate={{ width: `${percent}%` }}
                     className="absolute inset-y-0 left-0 bg-gradient-to-r from-brand-purple via-red-500 to-brand-purple"
                  />
                </div>
                
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex items-center justify-between w-48 text-[10px] font-black uppercase tracking-[0.4em] text-white/30 tabular-nums"
                >
                  <span>{percent < 100 ? "Loading" : "Ready"}</span>
                  <span>{percent}%</span>
                </motion.div>
              </div>
            </div>
          )}
          
          {/* Framed Corner Accents */}
          <div className="absolute top-10 left-10 w-10 h-10 border-t-2 border-l-2 border-white/10" />
          <div className="absolute top-10 right-10 w-10 h-10 border-t-2 border-r-2 border-white/10" />
          <div className="absolute bottom-10 left-10 w-10 h-10 border-b-2 border-l-2 border-white/10" />
          <div className="absolute bottom-10 right-10 w-10 h-10 border-b-2 border-r-2 border-white/10" />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
