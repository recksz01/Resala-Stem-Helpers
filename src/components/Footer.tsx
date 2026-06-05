/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Rocket, Heart, Facebook, Youtube } from "lucide-react";
import { Link } from "react-router-dom";

export default function Footer() {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="bg-brand-purple pt-24 pb-12 text-white relative overflow-hidden">
      {/* Decorative Blob */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-red-500 rounded-full blur-[140px] opacity-10 -translate-x-1/2 -translate-y-1/2" />

      <div className="container mx-auto px-6 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-16 mb-20">
          <div className="lg:col-span-2">
            <Link to="/" className="flex items-center gap-3 mb-8 group">
              <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center p-1 group-hover:rotate-6 transition-transform shadow-lg overflow-hidden relative">
                <div className="w-full h-full bg-brand-purple rounded-xl flex items-center justify-center relative overflow-hidden">
                  <img 
                    src="/logo.png" 
                    alt="Resala STEM helpers logo" 
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      const img = e.currentTarget;
                      if (img.src.endsWith('/logo.png')) {
                        img.src = '/logooo.png';
                      } else {
                        img.style.display = 'none';
                        const fb = img.parentElement?.querySelector('.logo-fallback');
                        if (fb) (fb as HTMLElement).style.display = 'flex';
                      }
                    }}
                    className="w-full h-full object-cover rounded-xl"
                  />
                  {/* Fallback to stylized elegant text if the image file isn't uploaded/found yet */}
                  <div className="logo-fallback hidden absolute inset-0 bg-brand-purple rounded-xl flex items-center justify-center">
                    <span className="text-white text-xs font-black italic tracking-tighter relative z-10">S<span className="text-red-500">T</span>EM</span>
                  </div>
                  {/* Internal Glow Effect */}
                  <div className="absolute inset-0 bg-gradient-to-tr from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                </div>
              </div>
              <div className="flex flex-col">
                <span className="text-2xl font-black tracking-tighter leading-none text-white">
                  Resala STEM <span className="italic">Helpers</span>
                </span>
                <span className="text-[0.6rem] font-black uppercase tracking-[0.3em] mt-1 text-white/60">
                  Egypt Hub
                </span>
              </div>
            </Link>
            <p className="text-white/60 max-w-sm mb-10 text-lg leading-relaxed font-medium italic">
              "The Charity of Knowledge is Spreading It" <br /> (زكاة العلم نشره)
            </p>
            <div className="flex gap-4">
               {[
                 { icon: Facebook, href: "https://facebook.com/ResalaSTEM" },
                 { icon: Youtube, href: "https://youtube.com/@resalastem-et5vd?si=c-HF-NEhKF4cmB8E" }
               ].map((social, i) => (
                 <a 
                   key={i} 
                   href={social.href} 
                   target="_blank"
                   rel="noopener noreferrer"
                   className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white hover:text-brand-purple hover:border-transparent transition-all shadow-xl"
                 >
                    <social.icon size={20} />
                  </a>
               ))}
            </div>
          </div>

          <div>
            <h4 className="font-black mb-8 uppercase tracking-[0.2em] text-sm text-red-500">Organization</h4>
            <ul className="space-y-4 font-bold">
              <li><Link to="/about" className="text-white/60 hover:text-white transition-colors">Our Story</Link></li>
              <li><Link to="/programs" className="text-white/60 hover:text-white transition-colors">Programs</Link></li>
              <li><Link to="/register" className="text-white/60 hover:text-white transition-colors">Join Us</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-black mb-8 uppercase tracking-[0.2em] text-sm text-red-500">Connect</h4>
            <ul className="space-y-4 font-bold">
              <li><a href="mailto:fly2877@gmail.com" className="text-white/60 hover:text-white transition-colors">fly2877@gmail.com</a></li>
              <li><a href="https://facebook.com/ResalaSTEM" target="_blank" rel="noopener noreferrer" className="text-white/60 hover:text-white transition-colors">Facebook</a></li>
              <li><a href="https://youtube.com/@resalastem-et5vd?si=c-HF-NEhKF4cmB8E" target="_blank" rel="noopener noreferrer" className="text-white/60 hover:text-white transition-colors">YouTube Channel</a></li>
              <li><span className="text-white/30 text-xs">Cairo, Egypt</span></li>
            </ul>
          </div>
        </div>

        <div className="pt-12 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-8 text-white/20 text-[0.6rem] font-black uppercase tracking-[0.3em]">
          <p>© {currentYear} Resala STEM Helpers Organization.</p>
          <div className="flex flex-col items-center md:items-start gap-1.5">
            <div className="flex items-center gap-2">
              Developed with Integrity by <span className="text-white/60">Omar Sayed Haggag</span>
            </div>
            <div className="flex items-center gap-2 text-white/30 text-[0.55rem]">
              Deployment assistance by <span className="text-white/50">Omar Afifi</span>
            </div>
          </div>
          <div className="flex items-center gap-1 group">
             Made with <Heart size={14} className="text-red-500 fill-red-500 group-hover:scale-125 transition-transform" /> in Egypt
          </div>
        </div>
      </div>
    </footer>
  );
}
