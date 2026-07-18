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
          <p className="text-xl text-slate-600 leading-relaxed">
            We offer comprehensive educational activities designed to bridge the gap between theory and practice, inspiring the next generation of innovators in Egypt.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 relative z-10">
          {programs.map((program, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              whileHover={{ rotate: idx % 2 === 0 ? -1 : 1 }}
              className="group flex flex-col lg:flex-row bg-white/80 backdrop-blur-xl rounded-[3rem] overflow-hidden border border-white shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 text-left"
            >
              {/* حاوية الصورة مع الحفاظ على الأبعاد ومنع الانكماش */}
              <div className="lg:w-2/5 shrink-0 relative h-64 lg:h-auto overflow-hidden">
                <img 
                  src={program.image} 
                  alt={program.title}
                  className="absolute inset-0 w-full h-full object-cover grayscale group-hover:grayscale-0 group-hover:scale-110 transition-all duration-700"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="flex-1 p-10 md:p-12">
                <div className={`w-14 h-14 rounded-2xl ${program.color} flex items-center justify-center mb-8 shadow-xl`}>
                  <program.icon size={28} />
                </div>
                <h3 className="text-3xl font-black text-brand-purple mb-4">{program.title}</h3>
                <p className="text-slate-600 leading-relaxed mb-8">{program.desc}</p>
                <Link 
                  to="/register" 
                  className="inline-flex items-center gap-2 px-8 py-3 bg-red-500 text-white rounded-full font-black hover:bg-red-600 hover:shadow-lg hover:shadow-red-500/30 transition-all active:scale-95 text-sm uppercase tracking-widest"
                >
                  Join Program <ArrowRight size={18} />
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </PageLayout>
  );
                }
