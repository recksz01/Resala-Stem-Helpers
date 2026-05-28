/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { motion } from "motion/react";
import PageLayout from "../components/PageLayout";
import { History, ShieldCheck, Zap, Globe } from "lucide-react";
import TechGrid from "../components/TechGrid";

const timeline = [
  { year: "2020", title: "The Beginning", desc: "Founded by top students from Egypt's STEM schools with a vision to democratize technical knowledge." },
  { year: "2021", title: "Expansion", desc: "Launched our first major workshops, reaching students in across various governorates." },
  { year: "2022", title: "Partnerships", desc: "Established connections with leading tech students to provide resources and mentorship to our members." },
  { year: "2023", title: "Legacy", desc: "Became a leading student-led initiative with a community of over 200 active volunteers." },
];

export default function About() {
  return (
    <PageLayout>
      <div className="container mx-auto px-6 py-12 relative overflow-hidden">
        <TechGrid />
        {/* Who We Are */}
        <div className="max-w-4xl mx-auto mb-32 relative z-10">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            className="text-center mb-16"
          >
            <span className="text-red-500 font-bold uppercase tracking-widest text-sm">Who We Are</span>
            <h1 className="text-5xl md:text-7xl font-black text-brand-purple mt-4 mb-8 leading-tight">
              A Student-Led <br />
              <span className="text-red-500 underline decoration-brand-purple/10">Revolution</span> in Knowledge.
            </h1>
            <p className="text-xl text-slate-600 leading-relaxed text-left md:text-center">
              Resala STEM Helpers is a volunteer initiative in Egypt that supports STEM students by sharing knowledge, providing scholarship opportunities, and organizing educational activities. Founded in 2020 by top STEM school students, the organization has grown into a strong community empowering future scientists and engineers.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="p-10 bg-brand-purple rounded-[2.5rem] text-white shadow-2xl shadow-brand-purple/20">
              <ShieldCheck size={40} className="text-red-400 mb-6" />
              <h3 className="text-3xl font-black mb-4">Our Mission</h3>
              <p className="text-white/80 text-lg leading-relaxed">
                To empower every Egyptian student with access to quality STEM education and the resources needed to succeed in a tech-driven world.
              </p>
            </div>
            <div className="p-10 bg-white border-2 border-brand-purple/5 rounded-[2.5rem] text-brand-purple shadow-xl">
              <Zap size={40} className="text-red-500 mb-6" />
              <h3 className="text-3xl font-black mb-4">Our Vision</h3>
              <p className="text-slate-600 text-lg leading-relaxed">
                A future where knowledge is accessible to all and students are supported to achieve their full potential, regardless of their background.
              </p>
            </div>
          </div>
        </div>

        {/* History Timeline */}
        <section className="py-24 relative z-10">
          <div className="bg-brand-purple rounded-[4rem] text-white overflow-hidden relative shadow-2xl">
            <div className="absolute top-0 right-0 w-96 h-96 bg-red-500/20 rounded-full blur-[100px] translate-x-1/2 -translate-y-1/2" />
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-500/10 rounded-full blur-[100px] -translate-x-1/2 translate-y-1/2" />
            
            <div className="container mx-auto px-10 py-20 relative z-10">
              <div className="text-center mb-20">
                <span className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/10 rounded-full text-sm font-bold mb-4">
                  <History size={16} /> Our Journey
                </span>
                <h2 className="text-5xl md:text-7xl font-black mb-6 tracking-tighter">Our Growing Legacy.</h2>
              </div>

              <div className="max-w-4xl mx-auto space-y-12">
                {timeline.map((item, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    className="group"
                  >
                    <div className="flex flex-col md:flex-row items-center gap-10 md:gap-16">
                      <div className="md:w-1/4 text-center md:text-right">
                        <span className="text-5xl md:text-7xl font-black text-red-500 block group-hover:scale-110 transition-transform">{item.year}</span>
                      </div>
                      <div className="flex-1 p-10 bg-white/5 border border-white/10 rounded-[2.5rem] backdrop-blur-xl group-hover:bg-white/10 group-hover:border-white/20 transition-all">
                        <h4 className="text-3xl font-black mb-3">{item.title}</h4>
                        <p className="text-white/70 text-lg leading-relaxed">{item.desc}</p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </div>
    </PageLayout>
  );
}
