/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { motion } from "motion/react";
import PageLayout from "../components/PageLayout";
import { Mail, Phone, Facebook, Instagram, Linkedin, MapPin, Send } from "lucide-react";

export default function Contact() {
  const socials = [
    { name: "Facebook", icon: Facebook, href: "https://www.facebook.com/share/1DyskoD64R/", color: "hover:bg-blue-500" },
  ];

  return (
    <PageLayout>
      <div className="container mx-auto px-6 py-20">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col lg:flex-row gap-20">
            <div className="flex-1">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
              >
                <span className="text-red-500 font-bold uppercase tracking-[0.4em] text-xs">Speak to us</span>
                <h1 className="text-5xl md:text-7xl font-black text-brand-purple mt-6 mb-8 tracking-tighter">Get in touch.</h1>
                <p className="text-xl text-slate-600 mb-12 leading-relaxed">
                  Have questions about our programs, partnership opportunities, or how to join our Cairo hub? Our team is here to help.
                </p>

                <div className="space-y-10">
                   <div className="flex items-start gap-6 group">
                      <div className="w-16 h-16 rounded-[1.5rem] bg-brand-purple text-white flex items-center justify-center shrink-0 shadow-xl group-hover:scale-110 transition-transform">
                        <Mail size={28} />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Email us</p>
                        <p className="text-2xl font-black text-brand-purple hover:text-red-500 transition-colors">resalastem@gmail.com</p>
                      </div>
                   </div>

                   <div className="flex items-start gap-6 group">
                      <div className="w-16 h-16 rounded-[1.5rem] bg-red-500 text-white flex items-center justify-center shrink-0 shadow-xl group-hover:scale-110 transition-transform">
                        <Phone size={28} />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Call us</p>
                        <p className="text-2xl font-black text-brand-purple hover:text-red-500 transition-colors">+20 10 30834588</p>
                      </div>
                   </div>

                   <div className="flex items-start gap-6 group">
                      <div className="w-16 h-16 rounded-[1.5rem] bg-slate-900 text-white flex items-center justify-center shrink-0 shadow-xl group-hover:scale-110 transition-transform">
                        <MapPin size={28} />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Find us</p>
                        <p className="text-2xl font-black text-brand-purple">Cairo, Egypt</p>
                      </div>
                   </div>
                </div>

                <div className="mt-16 flex gap-4">
                   {socials.map(social => (
                     <a
                       key={social.name}
                       href={social.href}
                       className={`w-14 h-14 rounded-full border-2 border-slate-100 flex items-center justify-center text-slate-400 transition-all ${social.color} hover:text-white hover:border-transparent group`}
                     >
                       <social.icon size={22} />
                     </a>
                   ))}
                </div>
              </motion.div>
            </div>

            <div className="flex-1">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white p-10 md:p-14 rounded-[3.5rem] border border-slate-100 shadow-2xl shadow-slate-200"
              >
                  <h3 className="text-3xl font-black text-brand-purple mb-8">Send a message</h3>
                  <div className="space-y-6">
                     <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-900">Full Name</label>
                        <input type="text" className="w-full px-8 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-brand-purple/20 transition-all" placeholder="Enter your name" />
                     </div>
                     <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-900">Email Address</label>
                        <input type="email" className="w-full px-8 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-brand-purple/20 transition-all" placeholder="hello@example.com" />
                     </div>
                     <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-900">Message</label>
                        <textarea rows={4} className="w-full px-8 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-brand-purple/20 transition-all resize-none" placeholder="How can we help?"></textarea>
                     </div>
                     <button 
                       onClick={() => alert("Message sent successfully! (Demo)")}
                       className="w-full py-5 bg-brand-purple text-white rounded-2xl font-black text-xl hover:bg-brand-purple-dark hover:shadow-2xl hover:shadow-brand-purple/20 transition-all flex items-center justify-center gap-3 active:scale-95 group"
                     >
                        Send Message
                        <Send size={20} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                     </button>
                  </div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </PageLayout>
  );
}
