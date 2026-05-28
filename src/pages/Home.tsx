/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { motion } from "motion/react";
import { ArrowRight, Sparkles, BookOpen, Users, BrainCircuit, Cpu } from "lucide-react";
import { Link } from "react-router-dom";
import TechGrid from "../components/TechGrid";
import FloatingIcons from "../components/FloatingIcons";

export default function Home() {
  return (
    <div className="bg-white overflow-hidden">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center pt-20 overflow-hidden bg-slate-50">
        <TechGrid />
        <FloatingIcons />
        
        <div className="container mx-auto px-6 relative z-10">
          <div className="max-w-4xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 px-5 py-2 bg-red-500 text-white rounded-full text-sm font-bold mb-8 shadow-xl shadow-red-500/20"
            >
              <Cpu size={14} />
              <span>زكاة العلم نشره — Knowledge is Charity</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-6xl md:text-9xl font-black tracking-tighter text-brand-purple leading-[0.88] mb-8"
            >
              Building the <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-orange-500 to-red-500 animate-gradient-x relative">
                Future
                <motion.span 
                  initial={{ width: 0 }}
                  whileInView={{ width: "100%" }}
                  transition={{ delay: 1, duration: 0.8 }}
                  className="absolute bottom-2 left-0 h-4 bg-red-100 -z-10"
                />
              </span> of <br />
              <span className="italic font-serif">STEM</span> in Egypt.
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-xl md:text-2xl text-slate-600 leading-relaxed mb-10 max-w-2xl font-medium"
            >
              The charity of knowledge is spreading it. We are a student-led volunteer initiative under the Resala organization dedicated to sharing knowledge and supporting STEM education across Egypt.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="flex flex-col sm:flex-row items-center gap-5 relative z-10"
            >
              <Link
                to="/register"
                className="w-full sm:w-auto px-10 py-5 bg-brand-purple text-white rounded-full font-black text-xl hover:bg-brand-purple-dark hover:shadow-2xl hover:shadow-brand-purple/30 transition-all flex items-center justify-center gap-2 active:scale-95 group relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-red-500 to-brand-purple opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <span className="relative z-10 flex items-center gap-2">
                  Join Now
                  <ArrowRight size={22} className="group-hover:translate-x-1 transition-transform" />
                </span>
              </Link>
              <Link
                to="/about"
                className="w-full sm:w-auto px-10 py-5 bg-white/50 backdrop-blur-sm text-brand-purple border-2 border-brand-purple/10 rounded-full font-black text-xl hover:bg-white transition-all text-center hover:scale-105 active:scale-95 shadow-lg hover:shadow-brand-purple/5"
              >
                Our Story
              </Link>
            </motion.div>

            {/* Micro Stats */}
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={{
                hidden: { opacity: 0 },
                visible: {
                  opacity: 1,
                  transition: { staggerChildren: 0.2 }
                }
              }}
              className="mt-20 inline-grid grid-cols-1 sm:grid-cols-2 gap-8 bg-white/40 backdrop-blur-md p-8 rounded-[3rem] border border-white/50 shadow-2xl relative z-10"
            >
              {[
                { label: "Global Volunteers", value: "200", icon: Users, color: "text-red-500", bg: "bg-red-500/10" },
                { label: "Active Sessions", value: "150+", icon: Cpu, color: "text-brand-purple", bg: "bg-brand-purple/10" }
              ].map((stat, i) => (
                <motion.div 
                  key={i}
                  variants={{
                    hidden: { opacity: 0, x: -20 },
                    visible: { opacity: 1, x: 0 }
                  }}
                  className="flex items-center gap-4 group cursor-default"
                >
                  <div className={`w-14 h-14 ${stat.bg} rounded-2xl flex items-center justify-center group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 shadow-inner`}>
                    <stat.icon className={stat.color} size={28} />
                  </div>
                  <div>
                    <span className="block text-3xl font-black text-brand-purple leading-tight">{stat.value}</span>
                    <span className="text-xs font-black text-slate-400 uppercase tracking-widest">{stat.label}</span>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>
      
      {/* Featured Section Preview */}
      <section className="py-32 relative bg-white">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="text-left"
            >
              <span className="text-red-500 font-bold uppercase tracking-[0.3em] text-xs">Our Focus</span>
              <h2 className="text-5xl md:text-7xl font-black text-brand-purple mt-4 mb-8 leading-[0.9]">Empowering your <br /><span className="text-red-500 italic">Academic</span> journey.</h2>
              <p className="text-xl text-slate-600 mb-10 leading-relaxed max-w-xl font-medium">
                From scholarship mentoring and IELTS/SAT guidance to hands-on workshops, we provide the essential bridge to your future education.
              </p>
              <Link to="/programs" className="inline-flex items-center gap-4 px-10 py-5 bg-brand-purple text-white rounded-full font-black text-xl hover:bg-brand-purple-dark hover:shadow-2xl hover:shadow-brand-purple/30 transition-all active:scale-95 group">
                Explore our programs
                <ArrowRight size={24} className="group-hover:translate-x-1 transition-transform" />
              </Link>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="aspect-square bg-slate-100 rounded-[4rem] overflow-hidden shadow-2xl relative group">
                <img 
                  src="https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&q=80" 
                  alt="Students collaborating" 
                  className="w-full h-full object-cover grayscale opacity-80 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-brand-purple/40 to-transparent" />
                <motion.div 
                  animate={{ y: [20, -20, 20] }}
                  transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute bottom-10 left-10 p-6 bg-white/90 backdrop-blur rounded-3xl shadow-xl"
                >
                  <p className="text-brand-purple font-black text-2xl">Impactful</p>
                  <p className="text-slate-500 font-bold">Hands-on learning</p>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
}
