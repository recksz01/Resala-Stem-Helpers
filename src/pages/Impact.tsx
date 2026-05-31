/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { motion, useMotionValue, useSpring, useInView } from "motion/react";
import { useEffect, useRef, useState } from "react";
import PageLayout from "../components/PageLayout";
import { Trophy, Users, Clock, Target } from "lucide-react";

function Counter({ value }: { value: number }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });
  const motionValue = useMotionValue(0);
  const springValue = useSpring(motionValue, {
    damping: 30,
    stiffness: 100,
  });
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    if (isInView) {
      motionValue.set(value);
    }
  }, [isInView, value, motionValue]);

  useEffect(() => {
    return springValue.on("change", (latest) => {
      setDisplayValue(Math.floor(latest));
    });
  }, [springValue]);

  return <span ref={ref}>{displayValue.toLocaleString()}</span>;
}

const stats = [
  { label: "Active Volunteers", value: 200, suffix: "", icon: Users },
  { label: "Knowledge Sessions", value: 150, suffix: "+", icon: Target },
  { label: "Hours Contributed", value: 8500, suffix: "+", icon: Clock },
  { label: "Lives Impacted", value: 1000, suffix: "+", icon: Trophy },
];

export default function Impact() {
  return (
    <PageLayout>
      <div className="container mx-auto px-6 py-20">
        <motion.div
           initial={{ opacity: 0, scale: 0.95 }}
           animate={{ opacity: 1, scale: 1 }}
           className="text-center mb-24"
        >
          <span className="text-red-500 font-bold uppercase tracking-[0.4em] text-xs">Our Impact</span>
          <h1 className="text-5xl md:text-7xl font-black text-brand-purple mt-6 mb-8">Changing Communities</h1>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto">
            Our numbers tell a story of dedication, hard work, and a shared passion for making STEM education accessible to everyone in Egypt.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {stats.map((stat, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              className="p-12 rounded-[3rem] bg-brand-purple text-white text-center shadow-2xl shadow-brand-purple/20 relative group overflow-hidden"
            >
              <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-125 group-hover:rotate-12 transition-transform">
                <stat.icon size={120} />
              </div>
              <h4 className="text-5xl md:text-6xl font-black mb-4 tracking-tighter tabular-nums">
                <Counter value={stat.value} />
                <span className="text-red-400">{stat.suffix}</span>
              </h4>
              <p className="text-white/70 text-sm uppercase font-black tracking-widest">
                {stat.label}
              </p>
            </motion.div>
          ))}
        </div>

        {/* Impact Story – القسم المعدل بالكامل */}
        <div className="mt-32 p-12 md:p-24 bg-slate-50 rounded-[4rem] border border-slate-100">
          <div className="flex flex-col lg:flex-row items-center gap-16">
            <div className="flex-1">
              <h2 className="text-4xl font-black text-brand-purple mb-6">More than just numbers</h2>
              <p className="text-lg text-slate-600 leading-relaxed mb-8">
                Every volunteer hour contributed is a seed planted for the future. We've seen our students secure international scholarships, excel in their academics, and launch their own technical ventures.
              </p>
              <div className="flex flex-wrap gap-4">
                {["Knowledge Shared", "Futures Built", "Mindsets Changed"].map(tag => (
                  <span key={tag} className="px-6 py-2 bg-white border border-slate-200 rounded-full text-slate-800 font-bold text-sm shadow-sm">{tag}</span>
                ))}
              </div>
            </div>
            <div className="flex-1 w-full">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="bg-white rounded-[3rem] p-8 md:p-10 border border-slate-100 shadow-2xl relative overflow-hidden"
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-8">
                  <div>
                    <span className="text-red-500 text-[10px] font-black uppercase tracking-[0.2em] block mb-1">
                      Volunteer Focus
                    </span>
                    <h3 className="text-2xl font-black text-brand-purple">
                      Our Core Pillars of Support
                    </h3>
                  </div>
                  <div className="bg-red-500/10 text-red-500 px-4 py-1.5 rounded-full font-black text-xs flex items-center gap-1.5">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                    </span>
                    OUR METHOD
                  </div>
                </div>

                {/* Progress Bars */}
                <div className="space-y-6 mb-8">
                  {[
                    { region: "Scientific Research & STEM Competitions", hubs: "Mentorship & Projects", percentage: 95, color: "bg-brand-purple" },
                    { region: "Coding, Robotics & Technology", hubs: "Practical Skills", percentage: 85, color: "bg-red-500" },
                    { region: "Soft Skills, Leadership & Pitching", hubs: "Personal Development", percentage: 80, color: "bg-brand-purple" },
                    { region: "University Admissions & Scholarships", hubs: "Futures & Careers", percentage: 70, color: "bg-red-500" },
                  ].map((item, idx) => (
                    <div key={idx} className="space-y-2">
                      <div className="flex justify-between items-center text-sm font-bold text-slate-700">
                        <span>{item.region}</span>
                        <span className="text-xs font-black text-slate-400 uppercase tracking-wider">{item.hubs}</span>
                      </div>
                      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          whileInView={{ width: `${item.percentage}%` }}
                          viewport={{ once: true }}
                          transition={{ duration: 1, delay: idx * 0.1, ease: "easeOut" }}
                          className={`h-full ${item.color} rounded-full`}
                        />
                      </div>
                    </div>
                  ))}
                </div>

                {/* Summary Banner */}
                <div className="bg-brand-purple/5 border border-brand-purple/10 rounded-2xl p-4 flex items-center gap-4">
                  <div className="w-12 h-12 bg-brand-purple rounded-xl flex items-center justify-center text-white font-black text-lg flex-shrink-0">
                    100%
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-brand-purple">Student-to-Student Mentorship</h4>
                    <p className="text-xs text-slate-500 font-medium mt-0.5">Completely run by passionate youth leaders sharing peer-to-peer insights.</p>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </PageLayout>
  );
}
