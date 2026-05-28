/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { motion } from "motion/react";
import PageLayout from "../components/PageLayout";
import { ArrowRight, Star, Heart, CheckCircle2 } from "lucide-react";
import { Link } from "react-router-dom";

export default function Join() {
  return (
    <PageLayout>
      <div className="container mx-auto px-6 py-20">
        <div className="max-w-5xl mx-auto bg-brand-purple rounded-[4rem] text-white p-12 md:p-32 relative overflow-hidden shadow-2xl shadow-brand-purple/40">
          {/* Decorative Blobs */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-red-500 rounded-full blur-[140px] opacity-20 -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-400 rounded-full blur-[140px] opacity-10 translate-y-1/2 -translate-x-1/2" />

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative z-10 text-center"
          >
            <div className="inline-flex items-center gap-2 px-5 py-2 bg-white/10 rounded-full text-red-300 font-bold text-sm mb-10">
              <Star size={16} fill="currentColor" /> Become a Resource for Someone
            </div>
            
            <h1 className="text-5xl md:text-7xl font-black mb-8 leading-tight tracking-tighter">
              Start your <br />
              <span className="text-red-400">volunteer</span> journey.
            </h1>
            
            <p className="text-xl text-white/70 mb-12 max-w-2xl mx-auto leading-relaxed">
              "The Charity of Knowledge is Spreading It." Join Resala STEM Helpers and help us build a brighter future through mentorship, resource sharing, and simple STEM sessions.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left mb-16 max-w-2xl mx-auto">
               {[
                 "Connect with 200+ STEM volunteers",
                 "Impact the lives of students in Egypt",
                 "Share your academic knowledge",
                 "Join our hub in Cairo",
               ].map((point, i) => (
                 <div key={i} className="flex items-center gap-3">
                    <CheckCircle2 size={24} className="text-red-400" />
                    <span className="font-bold text-lg">{point}</span>
                 </div>
               ))}
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
              <Link
                to="/register"
                className="w-full sm:w-auto px-12 py-6 bg-red-500 text-white rounded-full font-black text-2xl hover:bg-red-600 hover:shadow-2xl hover:shadow-red-500/40 transition-all flex items-center justify-center gap-3 group active:scale-95"
              >
                Go to Registration
                <ArrowRight size={24} className="group-hover:translate-x-2 transition-transform" />
              </Link>
              <p className="text-white/50 font-medium flex items-center gap-2">
                 Join <span className="text-white font-bold">200 others</span> already making a difference <Heart size={16} fill="currentColor" />
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </PageLayout>
  );
}
