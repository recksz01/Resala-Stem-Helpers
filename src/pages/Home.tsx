import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { 
  ArrowRight, 
  Users, 
  BrainCircuit, 
  Cpu, 
  Calendar, 
  Award, 
  MapPin, 
  Globe, 
  Trophy
} from "lucide-react";
import { Link } from "react-router-dom";
import TechGrid from "../components/TechGrid";
import FloatingIcons from "../components/FloatingIcons";

// الداتا تم فصلها في ملف hallOfFame.ts زي ما اتفقنا
import { PROMOTED_LEADER, MAY_BEST_MEMBERS } from "../data/hallOfFame";

export default function Home() {
  const [timeLeft, setTimeLeft] = useState({ days: 22, hours: 3, minutes: 48, seconds: 34 });

  useEffect(() => {
    const eventDate = new Date("2026-06-25T09:00:00").getTime();
    
    const updateCountdown = () => {
      const now = Date.now();
      const difference = eventDate - now;

      if (difference > 0) {
        const d = Math.floor(difference / (1000 * 60 * 60 * 24));
        const h = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const m = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        const s = Math.floor((difference % (1000 * 60)) / 1000);
        setTimeLeft({ days: d, hours: h, minutes: m, seconds: s });
      }
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-white overflow-hidden pt-24 md:pt-[100px]">
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center overflow-hidden bg-white">
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

      {/* Hall of Fame Section (Below Hero) */}
      <section className="py-14 relative bg-slate-50 overflow-hidden border-t border-slate-100">
        <div className="container mx-auto px-6 mb-10 text-center md:text-left">
          <div className="inline-flex items-center gap-3 mb-2 px-4 py-2 bg-amber-500/10 rounded-full border border-amber-500/20">
            <Trophy className="text-amber-500" size={20} />
            <h2 className="text-sm font-black uppercase tracking-widest text-brand-purple">Hall of Fame</h2>
          </div>
          <h3 className="text-2xl md:text-3xl font-black text-slate-800 mt-2">Honoring this month's exceptional members 🌟</h3>
        </div>
        
        <div className="w-full">
          <div className="max-w-[1500px] mx-auto px-6 flex justify-center overflow-x-auto snap-x snap-mandatory gap-6 pb-12 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            
            {/* 1. Rodina Promo */}
            <div className="snap-start shrink-0 w-[320px] bg-white rounded-[32px] p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 flex flex-col items-center text-center relative overflow-hidden group transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_20px_40px_rgb(0,0,0,0.08)] cursor-default">
              <div className="absolute top-0 w-full h-2 bg-gradient-to-r from-teal-400 to-cyan-400" />
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-teal-400 via-emerald-500 to-cyan-400 mb-5 flex items-center justify-center text-white font-bold text-2xl shadow-xl shadow-emerald-500/20 group-hover:scale-110 transition-transform duration-300">RM</div>
              <span className="px-3 py-1.5 bg-emerald-50 text-emerald-600 rounded-xl text-[10px] font-black tracking-wider uppercase mb-4 shadow-sm border border-emerald-100 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
                SPECIAL PROMOTION
              </span>
              <h3 className="text-xl font-black text-slate-800 mb-1">{PROMOTED_LEADER.name}</h3>
              <p className="text-emerald-500 font-bold text-sm bg-emerald-50 px-3 py-1 rounded-full mt-2">Head of PR</p>
            </div>

            {/* Loop Best Members */}
            {MAY_BEST_MEMBERS.map((member, idx) => {
              const isOverall = member.category === 'overall';
              return (
              <div key={idx} className={`snap-start shrink-0 w-[300px] bg-white rounded-[32px] p-6 border flex flex-col items-center text-center relative overflow-hidden group transition-all duration-300 hover:-translate-y-2 cursor-default ${isOverall ? 'border-amber-300 shadow-[0_12px_40px_rgb(251,191,36,0.2)] hover:shadow-[0_20px_50px_rgb(251,191,36,0.3)] md:scale-105 mx-2' : 'border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_40px_rgb(0,0,0,0.08)]'}`}>
                <div className={`absolute top-0 w-full h-2 bg-gradient-to-r ${member.color}`} />
                <div className={`w-20 h-20 rounded-full bg-gradient-to-br ${member.color} mb-5 flex items-center justify-center text-white font-bold text-2xl shadow-xl ${member.shadow} group-hover:scale-110 transition-transform duration-300`}>
                  {member.initials}
                </div>
                
                {isOverall ? (
                  <span className="px-3 py-1.5 bg-amber-50 text-amber-600 border border-amber-200 rounded-xl text-[10px] font-black tracking-wider uppercase mb-4 shadow-sm flex items-center gap-1.5">
                    👑 Overall Winner
                  </span>
                ) : (
                  <span className="px-3 py-1.5 bg-slate-50 text-slate-500 border border-slate-100 rounded-xl text-[10px] font-black tracking-wider uppercase mb-4 shadow-sm line-clamp-1">
                    {member.category.replace('_', ' ')} / BEST MEMBER
                  </span>
                )}
                
                <h3 className="text-xl font-black text-slate-800 mb-1">{member.name}</h3>
                <p className="text-slate-400 font-medium text-sm mt-1">{member.committee}</p>
              </div>
            )})}
          </div>
        </div>
      </section>

      {/* MASAR Event Banner Section - Soft & Harmonious Event Experience */}
      <section className="py-24 relative bg-white">
        <div className="container mx-auto px-6 max-w-4xl relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }}
            className="w-full relative min-h-[320px] flex items-center rounded-[40px] bg-gradient-to-br from-brand-purple to-red-500 overflow-hidden shadow-2xl shadow-brand-purple/20 p-8 md:p-12 group"
          >
            {/* Soft Ambient glow behind content layout */}
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10" />
            <div className="absolute top-[-20%] right-[-10%] w-[500px] h-[500px] bg-red-400/40 rounded-full blur-[120px] pointer-events-none" />

            <div className="flex flex-col items-start text-left max-w-3xl w-full relative z-10" dir="ltr">
              
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-md border border-white/30 rounded-full text-[10px] font-bold text-white mb-6 uppercase tracking-wider shadow-lg">
                <div className="relative flex h-2 w-2 shrink-0">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
                </div>
                <span>FEATURED ANNUAL EVENT — MASAR CAIRO 2026</span>
              </div>
              
              <h3 className="text-3xl md:text-5xl font-black text-white tracking-tight leading-none mb-4 text-left">
                MASAR CAIRO 2026
              </h3>

              <h4 className="text-lg md:text-xl font-bold text-white/90 mb-6 tracking-tight text-left">
                Plan Your Path to Global Academic Excellence.
              </h4>

              <p className="text-white/80 text-sm md:text-base leading-relaxed mb-8 max-w-2xl text-left font-medium">
                Join our preeminent annual STEM gathering. Discover international student exchanges, scientific research secrets, IELTS/TOEFL/SAT masterclasses, and complete academic mentorship from elite students.
              </p>

              {/* High quality mini-chips representation */}
              <div className="flex flex-wrap justify-start gap-2 mb-8">
                <div className="flex items-center gap-1.5 px-4 py-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-xs font-bold text-white hover:bg-white/20 transition-all duration-200">
                  <Globe size={14} className="text-white shrink-0" />
                  <span>Exchange Programs</span>
                </div>
                <div className="flex items-center gap-1.5 px-4 py-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-xs font-bold text-white hover:bg-white/20 transition-all duration-200">
                  <BrainCircuit size={14} className="text-white shrink-0" />
                  <span>Research Opportunities</span>
                </div>
                <div className="flex items-center gap-1.5 px-4 py-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-xs font-bold text-white hover:bg-white/20 transition-all duration-200">
                  <Award size={14} className="text-white shrink-0" />
                  <span>IELTS • TOEFL • SAT</span>
                </div>
                <div className="flex items-center gap-1.5 px-4 py-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-xs font-bold text-white hover:bg-white/20 transition-all duration-200">
                  <Users size={14} className="text-white shrink-0" />
                  <span>Academic Development</span>
                </div>
              </div>

              {/* Elegant subtle venue meta labels */}
              <div className="flex flex-wrap justify-start items-center gap-4 text-xs font-bold text-white/90 mb-8 w-full border-t border-white/20 pt-6">
                <div className="flex items-center gap-2">
                  <Calendar size={15} className="text-white shrink-0" />
                  <span>Thursday, 25 June 2026</span>
                </div>
                <span className="text-white/40 hidden sm:block">|</span>
                <div className="flex items-center gap-2">
                  <MapPin size={15} className="text-white shrink-0" />
                  <span>Hossaber Theater, Downtown Cairo</span>
                </div>
              </div>

              {/* Primary CTA with customized brand gradient */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-6 w-full">
                <a
                  href="https://wa.me/201030834588"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto px-10 py-4 bg-white text-brand-purple rounded-2xl font-black text-base transition-all duration-250 hover:scale-[1.03] active:scale-95 shadow-xl text-center flex items-center justify-center gap-2 group/btn relative overflow-hidden"
                >
                  <span className="relative z-10 flex items-center gap-2">
                    Register Now
                    <ArrowRight size={18} className="text-brand-purple group-hover/btn:translate-x-1 transition-transform" />
                  </span>
                </a>

                {/* Living premium countdown widget */}
                <div className="flex flex-wrap gap-2">
                  {[
                    { label: "D", val: timeLeft.days },
                    { label: "H", val: timeLeft.hours },
                    { label: "M", val: timeLeft.minutes },
                    { label: "S", val: timeLeft.seconds },
                  ].map((unit, idx) => (
                    <div key={idx} className="flex flex-col items-center bg-white/10 backdrop-blur-md border border-white/20 rounded-xl px-3 py-2 min-w-[60px] relative overflow-hidden">
                      <span className="block text-xl font-black text-white font-mono tracking-tight leading-none relative z-10">
                        {String(unit.val).padStart(2, '0')}
                      </span>
                      <span className="block text-[9px] uppercase font-bold tracking-widest text-white/70 mt-1 font-sans relative z-10">
                        {unit.label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </motion.div>
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
