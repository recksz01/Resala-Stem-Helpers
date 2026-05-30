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

        {/* Impact Story */}
        <div className="mt-32 p-12 md:p-24 bg-slate-50 rounded-[4rem] border border-slate-100 flex flex-col lg:flex-row items-center gap-16">
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
          
            <div className="flex-1 relative">
  <div className="w-full aspect-[4/3] bg-brand-purple rounded-[3rem] shadow-2xl overflow-hidden">
    <img
      src="https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800"
      alt="Students collaborating"
      className="w-full h-full object-cover"
    />
  </div>

  <div className="absolute -bottom-8 -left-8 p-8 bg-red-500 text-white rounded-3xl shadow-2xl">
    <p className="text-3xl font-black">20+</p>
    <p className="text-xs font-bold uppercase tracking-widest">
      Cities Covered
    </p>
  </div>
</div>

          
          </div>
        </div>
      </div>
    </PageLayout>
  );
}
