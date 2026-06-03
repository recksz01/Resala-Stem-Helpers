/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { 
  ArrowRight, 
  BookOpen, 
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

// هنا سطر استيراد صورتك بالاسم والمسار لفعالية مسار القاهرة
import masarCairoHologram from "../32813cf3-9243-4bf3-b670-622ba59e3e0c.png";

// بيانات المبدعين المختارين كـ Best Members لشهر مايو 2026 لقائمة الشرف الدوارة
const MAY_BEST_MEMBERS = [
  {
    name: "Jana Mustafa",
    committee: "HR & Talent Development",
    committeeAr: "الموارد البشرية",
    roleAr: "بيست الـ HR ونجمة الجمعية الأولى لشهر مايو 👑",
    badgeAr: "نجمة الشهر الذهبية الأولى على مستوى الجمعية",
    color: "from-amber-400 via-yellow-500 to-orange-500",
    shadow: "shadow-amber-500/10",
    border: "border-amber-500/30",
    initials: "JM",
    category: "overall"
  },
  {
    name: "Omar Sayed",
    committee: "Public Relations",
    committeeAr: "العلاقات العامة",
    roleAr: "بيست العلاقات العامة والاتصال الاستراتيجي ⭐️",
    badgeAr: "سفير التأثير والاتصال المؤسسي للجمعية",
    color: "from-purple-500 via-pink-500 to-purple-600",
    shadow: "shadow-purple-500/10",
    border: "border-purple-500/25",
    initials: "OS",
    category: "pr"
  },
  {
    name: "야나 🦋 (Yana)",
    committee: "Media Production",
    committeeAr: "ميديا والإنتاج الإعلامي",
    roleAr: "بيست ميديا — الإبداع الرقمي وصناعة الصورة 📸",
    badgeAr: "مستشارة الإعلام المرئي وتغطية الفعاليات",
    color: "from-blue-500 via-indigo-500 to-blue-600",
    shadow: "shadow-blue-500/10",
    border: "border-blue-500/20",
    initials: "야نا",
    category: "media"
  },
  {
    name: "Rahma",
    committee: "Video Editing",
    committeeAr: "المونتاج وصناعة الفيديو",
    roleAr: "بيست لجنة المونتاج والتحرير السينمائي 🎬",
    badgeAr: "صانعة المحتوى المرئي السينمائي الملهم",
    color: "from-emerald-400 to-teal-600",
    shadow: "shadow-emerald-500/10",
    border: "border-emerald-500/20",
    initials: "R",
    category: "ve"
  },
  {
    name: "Omar",
    committee: "Graphic Design",
    committeeAr: "تصميم الجرافيك والهوية البصرية",
    roleAr: "بيست الجرافيك وفارس الابتكار البصري 🎨",
    badgeAr: "صاحب أجمل لمسات البصمة والهوية الفنية",
    color: "from-cyan-400 to-blue-600",
    shadow: "shadow-cyan-500/10",
    border: "border-cyan-500/20",
    initials: "O",
    category: "graphic"
  },
  {
    name: "Reem Jamal",
    committee: "Sales & Sponsorship",
    committeeAr: "لجنة المبيعات والتمويل",
    roleAr: "بيست ميمبر مبيعات وقناصة الرعاية والاتفاقيات 💼",
    badgeAr: "قائدة النمو وجذب الرعاية والشراكات الذهبية",
    color: "from-rose-400 to-pink-600",
    shadow: "shadow-rose-500/10",
    border: "border-rose-500/20",
    initials: "RJ",
    category: "sales"
  },
  {
    name: "Yassin Otaka",
    committee: "Marketing & Sales",
    committeeAr: "التسويق والمبيعات",
    roleAr: "بيست الماركتينج وتاني بيست سيلز المشترك 📈",
    badgeAr: "بطل النمو الرقمي والتواصل التسويقي الذكي",
    color: "from-fuchsia-500 to-purple-600",
    shadow: "shadow-fuchsia-500/10",
    border: "border-fuchsia-500/20",
    initials: "YO",
    category: "marketing"
  }
];

const PROMOTED_LEADER = {
  name: "Rodina Mohammed",
  titleAr: "بشرى ترقية استثنائية مستحقة ومباركة 🎉",
  badgeAr: "من نائب رئيس العلاقات العامة ➔ رئيس العلاقات العامة والاتصال المؤسسي (Head of PR)",
  achievement: "تقديراً واعترافاً بمسيرتها الذهبية، وجهودها الاستثنائية وتفانيها غير المحدود كأحد أهم الركائز والقادة في دعم فريق العلاقات العامة والاتصال.",
  color: "from-teal-400 via-emerald-500 to-cyan-400",
  shadow: "shadow-emerald-500/20",
  border: "border-emerald-500/40",
  initials: "RM"
};

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
    <div className="bg-white overflow-hidden pt-36 md:pt-[140px]">
      {/* Best Members Holographic Auto-Scrolling Marquee Ticker */}
      <div id="best-members-marquee" className="bg-slate-950 border-y border-purple-900/35 py-5 relative overflow-hidden z-20 flex items-center shadow-[0_4px_30px_rgba(0,0,0,0.75)]" dir="ltr">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(168,85,247,0.18),transparent_70%)] pointer-events-none" />
        
        {/* Fixed Title Label (Glow Badge) */}
        <div className="px-2.5 md:px-4 shrink-0 bg-slate-950 border-r border-slate-900 flex items-center gap-1.5 md:gap-2 relative z-10 font-[900] text-[10px] md:text-xs select-none text-white tracking-widest">
          <Trophy size={14} className="text-amber-400 animate-bounce shrink-0" />
          <span className="text-amber-400 font-sans uppercase font-[900] tracking-widest leading-none">HALL OF FAME 👑</span>
        </div>

        {/* Marquee Loop scrolling horizontally */}
        <div className="flex-1 overflow-hidden relative flex items-center" dir="ltr">
          <div className="animate-marquee flex whitespace-nowrap gap-16 text-xs font-bold text-slate-300 md:text-sm pl-8 w-max shrink-0">
            {[...Array(2)].map((_, loopIdx) => (
              <div key={loopIdx} className="flex items-center gap-16 select-none shrink-0 w-max" dir="ltr">
                {/* 1. Rodina Promo */}
                <div className="flex items-center gap-2 px-3.5 py-1.5 bg-slate-900/80 border border-emerald-500/30 rounded-xl">
                  <span className="h-2.5 w-2.5 rounded-full bg-emerald-400 animate-ping shrink-0" />
                  <span className="px-1.5 py-0.5 bg-emerald-500/15 text-emerald-300 rounded-md text-[9.5px] font-black tracking-wider uppercase">SPECIAL PROMOTION 🎉</span>
                  <span className="text-white font-[900] text-sm tracking-wide">{PROMOTED_LEADER.name}</span>
                  <span className="text-emerald-400 font-bold text-sm">➔ Head of PR</span>
                </div>

                {/* 2. Jana Mustafa */}
                <div className="flex items-center gap-2 px-3.5 py-1.5 bg-slate-900/80 border border-amber-500/30 rounded-xl">
                  <span className="text-amber-400 text-sm shrink-0">👑</span>
                  <span className="px-1.5 py-0.5 bg-amber-500/15 text-amber-300 rounded-md text-[9.5px] font-black tracking-wider uppercase">OVERALL BEST MEMBER</span>
                  <span className="text-white font-[900] text-sm tracking-wide">Jana Mustafa</span>
                  <span className="text-slate-300 font-medium">/ HR</span>
                </div>

                {/* 3. Omar Sayed */}
                <div className="flex items-center gap-2 px-3.5 py-1.5 bg-slate-900/80 border border-purple-500/30 rounded-xl">
                  <span className="text-purple-400 text-sm shrink-0">⭐️</span>
                  <span className="px-1.5 py-0.5 bg-purple-500/15 text-purple-300 rounded-md text-[9.5px] font-black tracking-wider uppercase">BEST MEMBER PR</span>
                  <span className="text-white font-[900] text-sm tracking-wide">Omar Sayed</span>
                  <span className="text-slate-300 font-medium">/ Public Relations</span>
                </div>

                {/* 4. Yana */}
                <div className="flex items-center gap-2 px-3.5 py-1.5 bg-slate-900/80 border border-blue-500/30 rounded-xl">
                  <span className="text-blue-400 text-sm shrink-0">📸</span>
                  <span className="px-1.5 py-0.5 bg-blue-500/15 text-blue-300 rounded-md text-[9.5px] font-black tracking-wider uppercase">BEST MEMBER PR Media</span>
                  <span className="text-white font-[900] text-sm tracking-wide">야نا (Yana) 🦋</span>
                </div>

                {/* 5. Rahma */}
                <div className="flex items-center gap-2 px-3.5 py-1.5 bg-slate-900/80 border border-emerald-500/30 rounded-xl">
                  <span className="text-emerald-400 text-sm shrink-0">🎬</span>
                  <span className="px-1.5 py-0.5 bg-emerald-500/15 text-emerald-300 rounded-md text-[9.5px] font-black tracking-wider uppercase">BEST VIDEO EDITING</span>
                  <span className="text-white font-[900] text-sm tracking-wide">Rahma</span>
                </div>

                {/* 6. Omar */}
                <div className="flex items-center gap-2 px-3.5 py-1.5 bg-slate-900/80 border border-cyan-500/30 rounded-xl">
                  <span className="text-cyan-400 text-sm shrink-0">🎨</span>
                  <span className="px-1.5 py-0.5 bg-cyan-500/15 text-cyan-300 rounded-md text-[9.5px] font-black tracking-wider uppercase">BEST GRAPHIC DESIGN</span>
                  <span className="text-white font-[900] text-sm tracking-wide">Omar</span>
                </div>

                {/* 7. Reem Jamal */}
                <div className="flex items-center gap-2 px-3.5 py-1.5 bg-slate-900/80 border border-rose-500/30 rounded-xl">
                  <span className="text-rose-400 text-sm shrink-0">💼</span>
                  <span className="px-1.5 py-0.5 bg-rose-500/15 text-rose-300 rounded-md text-[9.5px] font-black tracking-wider uppercase">BEST SALES & CORPs</span>
                  <span className="text-white font-[900] text-sm tracking-wide">Reem Jamal</span>
                </div>

                {/* 8. Yassin Otaka */}
                <div className="flex items-center gap-2 px-3.5 py-1.5 bg-slate-900/80 border border-fuchsia-400/30 rounded-xl">
                  <span className="text-fuchsia-400 text-sm shrink-0">📈</span>
                  <span className="px-1.5 py-0.5 bg-fuchsia-500/15 text-fuchsia-300 rounded-md text-[9.5px] font-black tracking-wider uppercase">BEST MARKETING</span>
                  <span className="text-white font-[900] text-sm tracking-wide">Yassin Otaka</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

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

      {/* MASAR Event Banner Section */}
      <section className="py-24 relative bg-slate-950 overflow-hidden border-y border-slate-900">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(168,85,247,0.15),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(52,211,153,0.08),transparent_50%)]" />
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-purple-500/10 rounded-full blur-[120px] pointer-events-none animate-pulse" />
        
        <div className="container mx-auto px-6 relative z-10 max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }}
            className="bg-slate-900/60 backdrop-blur-xl border border-slate-800 text-white rounded-[3rem] p-8 md:p-14 shadow-2xl relative overflow-hidden group"
          >
            <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-purple-500/40 to-transparent" />
            <div className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-emerald-500/30 to-transparent" />
            
            <div className="relative z-10 flex flex-col lg:flex-row items-center gap-12 md:gap-16">
              <div className="flex-1 text-center lg:text-right" dir="rtl">
                
                <div className="inline-flex items-center gap-2.5 px-4.5 py-2 bg-purple-500/10 border border-purple-500/35 rounded-full text-xs font-black text-purple-300 mb-6 uppercase tracking-wider shadow-lg shadow-purple-950/45">
                  <span className="w-2 h-2 bg-emerald-400 rounded-full animate-ping" />
                  <span>الحدث السنوي الأكبر — مسار القاهرة 2026 (النسخة السابعة)</span>
                </div>
                
                <h3 className="text-4xl md:text-6xl font-black tracking-tight mb-5 text-white leading-tight">
                  خطط طريقك نحو <span className="text-transparent bg-clip-text bg-gradient-to-l from-purple-400 via-pink-400 to-emerald-400 font-extrabold drop-shadow">العالمية والتميز</span> الأكاديمي!
                </h3>
                
                <p className="text-slate-300 text-lg md:text-xl font-normal leading-relaxed mb-8 max-w-3xl">
                  يسر جمعيتنا دعوتكم لحضور مهرجان <strong className="text-purple-300 font-black">«مسار القاهرة»</strong> يوم <span className="font-bold border-b-2 border-purple-500/50 pb-0.5">25 / 6</span> على مسرح <span className="text-emerald-300 font-bold">الهوسابير العريق بالقاهرة</span>. حدث تفاعلي ملهم يقودك لعبور اختبارات القبول الدولية والحصول على تمويل دراسي بمشاركة أهم الخبراء الأكاديميين.
                </p>

                {/* Cosmic Live Countdown Widget */}
                <div className="mb-10" dir="ltr">
                  <div className="flex flex-wrap lg:justify-start justify-center gap-4">
                    {[
                      { label: "Days", val: timeLeft.days, color: "from-purple-500 to-pink-500" },
                      { label: "Hours", val: timeLeft.hours, color: "from-pink-500 to-rose-500" },
                      { label: "Mins", val: timeLeft.minutes, color: "from-rose-500 to-emerald-500" },
                      { label: "Secs", val: timeLeft.seconds, color: "from-emerald-500 to-teal-500" },
                    ].map((unit, idx) => (
                      <div key={idx} className="flex flex-col items-center bg-slate-950/80 border border-slate-800 rounded-2xl px-5 py-3.5 min-w-[85px] relative group overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-br opacity-[0.03] group-hover:opacity-[0.08] transition-opacity" />
                        <span className="block text-2xl md:text-3xl font-black text-white font-mono tracking-tight leading-none">
                          {String(unit.val).padStart(2, '0')}
                        </span>
                        <span className="block text-[10px] uppercase font-bold tracking-widest text-slate-400 mt-1.5 font-sans">
                          {unit.label}
                        </span>
                        <div className={`absolute bottom-0 inset-x-0 h-[2.5px] bg-gradient-to-r ${unit.color}`} />
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Interactive Dynamic Grid of Core Pillars */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-10 text-right">
                  <div className="flex items-start gap-4 p-5 bg-slate-950/40 border border-slate-850 rounded-2xl hover:border-purple-500/40 hover:bg-slate-950/60 transition-all duration-300 shadow-xl group/card">
                    <div className="w-11 h-11 bg-purple-500/10 border border-purple-500/20 rounded-xl flex items-center justify-center shrink-0 mt-0.5 shadow-inner">
                      <Globe className="text-purple-400 group-hover/card:scale-110 transition-transform" size={22} />
                    </div>
                    <div>
                      <h4 className="text-base font-black text-white mb-1.5">برامج التبادل الطلابي الدولي</h4>
                      <p className="text-xs text-slate-400 leading-relaxed">اكتشف بوابتك إلى برامج التبادل الثقافي والأكاديمي الممولة بالكامل في الخارج لتثري رحلتك.</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4 p-5 bg-slate-950/40 border border-slate-850 rounded-2xl hover:border-emerald-500/40 hover:bg-slate-950/60 transition-all duration-300 shadow-xl group/card">
                    <div className="w-11 h-11 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center justify-center shrink-0 mt-0.5 shadow-inner">
                      <BrainCircuit className="text-emerald-400 group-hover/card:scale-110 transition-transform" size={22} />
                    </div>
                    <div>
                      <h4 className="text-base font-black text-white mb-1.5">أسرار ومجالات البحث العلمي</h4>
                      <p className="text-xs text-slate-400 leading-relaxed">تعلم خطوات صياغة الأوراق البحثية، والانضمام إلى مختبرات رائدة محليًا وعالميًا بطريقة سلسة.</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4 p-5 bg-slate-950/40 border border-slate-850 rounded-2xl hover:border-cyan-500/40 hover:bg-slate-950/60 transition-all duration-300 shadow-xl group/card">
                    <div className="w-11 h-11 bg-cyan-500/10 border border-cyan-500/20 rounded-xl flex items-center justify-center shrink-0 mt-0.5 shadow-inner">
                      <Award className="text-cyan-400 group-hover/card:scale-110 transition-transform" size={22} />
                    </div>
                    <div>
                      <h4 className="text-base font-black text-white mb-1.5">اختبارات الكفاءة (IELTS, TOEFL, SAT)</h4>
                      <p className="text-xs text-slate-400 leading-relaxed">إرشادات واستراتيجيات حقيقية يقدمها ملهمون اجتازوا هذه العقبات وحققوا العلامات الكاملة.</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4 p-5 bg-slate-950/40 border border-slate-850 rounded-2xl hover:border-pink-500/40 hover:bg-slate-950/60 transition-all duration-300 shadow-xl group/card">
                    <div className="w-11 h-11 bg-pink-500/10 border border-pink-500/20 rounded-xl flex items-center justify-center shrink-0 mt-0.5 shadow-inner">
                      <Users className="text-pink-400 group-hover/card:scale-110 transition-transform" size={22} />
                    </div>
                    <div>
                      <h4 className="text-base font-black text-white mb-1.5">التمكين الدراسي والتطوير العام</h4>
                      <p className="text-xs text-slate-400 leading-relaxed">حقيبة متكاملة من ورش العمل التنموية لتأهيلك لكتابة خطابات النوايا والسيرة الذاتية المهنية.</p>
                    </div>
                  </div>
                </div>

                {/* Call to actions & venue labels */}
                <div className="flex flex-col sm:flex-row items-center justify-start gap-5">
                  <a
                    href="https://wa.me/201030834588"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover-spider-target w-full sm:w-auto px-10 py-5 bg-gradient-to-r from-purple-600 via-pink-600 to-emerald-600 text-white rounded-2xl font-black text-lg transition-all duration-200 active:scale-95 shadow-xl shadow-purple-950/35 hover:shadow-purple-500/20 text-center flex items-center justify-center gap-2.5 relative overflow-hidden group/btn"
                  >
                    <span className="absolute inset-0 bg-white/10 opacity-0 group-hover/btn:opacity-100 transition-opacity" />
                    احجز مقعدك بمسار القاهرة الآن 
                    <ArrowRight size={22} className="rotate-180 sm:rotate-0" />
                  </a>
                  
                  <div className="flex flex-col sm:flex-row sm:items-center gap-4 text-slate-400 mt-2 sm:mt-0 font-medium">
                    <div className="flex items-center gap-2">
                      <Calendar size={18} className="text-rose-400 animate-pulse" />
                      <span className="text-sm font-bold text-slate-200">الخميس، 25 يونيو 2026</span>
                    </div>
                    <div className="hidden sm:block text-slate-800">|</div>
                    <div className="flex items-center gap-2">
                      <MapPin size={18} className="text-emerald-400" />
                      <span className="text-sm font-bold text-slate-200">مسرح الهوسابير، وسط البلد بالقاهرة</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Ultra-Modern Interactive Graphic Representation (Image Frame with Cairo Cyber Vibe) */}
              <div className="w-full lg:w-96 shrink-0 flex flex-col items-center justify-center relative">
                <div className="absolute inset-0 bg-gradient-to-tr from-purple-500/20 via-pink-500/10 to-transparent rounded-[2.5rem] blur-2xl animate-pulse -z-10" />
                
                <div className="relative w-full aspect-[4/3] rounded-[2.5rem] overflow-hidden border border-slate-700/60 shadow-2xl group/img">
                  <img
                    src={masarCairoHologram}
                    alt="مسار القاهرة — MASAR Cairo Holographic Path"
                    className="w-full h-full object-cover transition-all duration-750 scale-102 group-hover/img:scale-108"
                    referrerPolicy="no-referrer"
                  />
                  {/* Subtle Neon Overlay gradient */}
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/15 to-transparent" />
                  
                  {/* Glassmorphic Metrics Card */}
                  <div className="absolute bottom-4 inset-x-4 bg-slate-950/85 backdrop-blur-md border border-slate-800/80 rounded-2xl p-4 flex items-center justify-between shadow-xl" dir="rtl">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 bg-purple-500 rounded-full animate-ping" />
                      <div>
                        <span className="block text-[8px] text-slate-400 font-mono tracking-widest leading-none uppercase">TARGET STUDENTS</span>
                        <span className="text-sm font-black text-white">400 - 500 حضور</span>
                      </div>
                    </div>
                    <div className="text-left">
                      <span className="block text-[8px] text-emerald-400 font-mono tracking-widest leading-none uppercase">ENTRANCE STATUS</span>
                      <span className="text-sm font-black text-emerald-400">حجز مسبق للتسجيل</span>
                    </div>
                  </div>
                </div>
                
                {/* Futuristic overlay badge */}
                <div className="absolute -top-5 -left-5 bg-slate-950/90 border border-purple-500/40 rounded-2xl p-3.5 flex flex-col items-center shadow-2xl relative z-20 backdrop-blur-md">
                  <span className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-b from-purple-300 to-pink-400 font-sans leading-none">25</span>
                  <span className="text-xs font-bold text-slate-300 uppercase tracking-wider leading-none mt-1">يونيو 2026</span>
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
