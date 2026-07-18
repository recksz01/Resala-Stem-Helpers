/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { motion } from "motion/react";
import PageLayout from "../components/PageLayout";
import { Cpu, Code, Microscope, UsersRound, ArrowRight } from "lucide-react";
import TechGrid from "../components/TechGrid";
import { Link } from "react-router-dom";

const programs = [
  {
    title: "Scholarship & Academic Support",
    desc: "Providing expert guidance on scholarship applications, SAT preparation, language proficiency exams (IELTS/TOEFL), and university admissions to help students unlock global opportunities.",
    icon: Microscope,
    color: "bg-slate-900 text-white shadow-slate-900/20",
    image: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&q=80&w=800",
  },
  {
    title: "Knowledge Sharing",
    desc: "A dedicated platform for sharing academic resources, sessions, and past experiences to help STEM students excel in their studies and scientific research.",
    icon: Code,
    color: "bg-red-500 text-white shadow-red-500/20",
    image: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&q=80&w=800",
  },
  {
    title: "Basic STEM Events",
    desc: "Organizing workshops and community events that celebrate innovation, curiosity, and practical scientific application across various STEM fields.",
    icon: UsersRound,
    color: "bg-brand-purple-dark text-white shadow-brand-purple/20",
    image: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&q=80&w=800",
  },
  {
    title: "Simple Robotics Sessions",
    desc: "Hands-on sessions focused on the basics of circuitry and simple robotics, introducing students to the core concepts of engineering in a fun, accessible way.",
    icon: Cpu,
    color: "bg-brand-purple text-white shadow-brand-purple/20",
    image: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&q=80&w=800",
  },
];

export default function Programs() {
  return (
    <PageLayout>
      <div className="container mx-auto px-6 py-20 text-center relative">
        <TechGrid />
        <motion.div
           initial={{ opacity: 0, y: 20 }}
           animate={{ opacity: 1, y: 0 }}
           className="max-w-3xl mx-auto mb-20 relative z-10"
        >
          <span className="text-red-500 font-bold uppercase tracking-[0.4em] text-xs">Our Expertise</span>
          <h1 className="text-5xl md:text-7xl font-black text-brand-purple mt-6 mb-8">What We Do</h1>
          <p className="text-lg text-slate-400 font-light leading-relaxed">
            We offer comprehensive educational activities designed to bridge the gap between theory and practice, inspiring the next generation of innovators in Egypt.
          </p>
        </motion.div>

        {/* تم تغيير md:flex-row إلى lg:flex-row و md:w-2/5 إلى lg:w-2/5 لضمان مظهر متناسق ومريح للتابلت في الوضع الرأسي */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 relative z-10">
          {programs.map((program, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              whileHover={{ y: -5 }}
              className="group flex flex-col lg:flex-row glass-dark rounded-[2.5rem] overflow-hidden border border-white/5 shadow-2xl hover:shadow-brand-purple/10 transition-all duration-500 text-left"
            >
              <div className="lg:w-2/5 shrink-0 relative h-64 lg:h-auto overflow-hidden">
                <img 
                  src={program.image} 
                  alt={program.title}
                  className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-transparent to-brand-bg/90 mix-blend-multiply" />
              </div>
              <div className="flex-1 p-8 md:p-10">
                <div className={`w-12 h-12 rounded-2xl ${program.color} flex items-center justify-center mb-6 border border-white/5`}>
                  <program.icon size={24} />
                </div>
                <h3 className="text-2xl font-bold text-white mb-4">{program.title}</h3>
                <p className="text-slate-400 font-light leading-relaxed mb-8">{program.desc}</p>
                <Link 
                  to="/register" 
                  className="inline-flex items-center gap-2 text-brand-purple-glow font-medium hover:text-white transition-colors group/link"
                >
                  Join Program <ArrowRight size={18} className="group-hover/link:translate-x-1 transition-transform" />
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </PageLayout>
  );
}
