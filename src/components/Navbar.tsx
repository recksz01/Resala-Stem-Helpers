/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { motion, useScroll, useTransform } from "motion/react";
import { Menu, X, Rocket, Facebook, Youtube } from "lucide-react";
import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const { scrollY } = useScroll();
  
  const backgroundColor = useTransform(
    scrollY,
    [0, 50],
    ["rgba(255, 255, 255, 0)", "rgba(107, 33, 168, 0.95)"]
  );
  
  const backdropBlur = useTransform(
    scrollY,
    [0, 50],
    ["blur(0px)", "blur(12px)"]
  );

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { name: "Home", href: "/" },
    { name: "About", href: "/about" },
    { name: "Programs", href: "/programs" },
    { name: "Impact", href: "/impact" },
    { name: "Contact", href: "/contact" },
  ];

  const isHome = location.pathname === "/";

  return (
    <motion.nav
      style={{ backgroundColor, backdropFilter: backdropBlur }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ease-out ${
        scrolled ? "py-3 border-b border-white/10 shadow-xl" : "py-6"
      }`}
    >
      <div className="container mx-auto px-6 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3 group relative">
          <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center p-0.5 group-hover:rotate-6 transition-transform shadow-lg overflow-hidden relative">
            <div className="w-full h-full bg-brand-purple rounded-xl flex items-center justify-center relative overflow-hidden">
              <img 
                src="/logo-internal.png" 
                alt="Resala STEM helpers logo" 
                referrerPolicy="no-referrer"
                onError={(e) => {
                  const img = e.currentTarget;
                  img.style.display = 'none';
                  const fb = img.parentElement?.querySelector('.logo-fallback');
                  if (fb) (fb as HTMLElement).style.display = 'flex';
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
            <span className={`text-xl font-black tracking-tighter leading-none transition-colors duration-500 ${scrolled || !isHome ? 'text-white' : 'text-brand-purple'}`}>
              Resala STEM <span className="italic">Helpers</span>
            </span>
            <span className={`text-[0.6rem] font-black uppercase tracking-[0.3em] mt-1 transition-colors duration-500 ${scrolled || !isHome ? 'text-white/60' : 'text-slate-400'}`}>
              Egypt Hub
            </span>
          </div>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              to={link.href}
              className={`text-sm font-black uppercase tracking-widest transition-all relative group ${
                location.pathname === link.href
                  ? "text-red-400"
                  : scrolled || !isHome
                  ? "text-white/80 hover:text-white"
                  : "text-brand-purple/70 hover:text-brand-purple"
              }`}
            >
              {link.name}
              <span className={`absolute -bottom-1 left-0 h-0.5 bg-red-400 transition-all ${location.pathname === link.href ? 'w-full' : 'w-0 group-hover:w-full'}`} />
            </Link>
          ))}
          <div className="flex items-center gap-3">
            <div className="hidden lg:flex items-center gap-2">
              <a 
                href="https://facebook.com/ResalaSTEM" 
                target="_blank" 
                rel="noopener noreferrer"
                className={`p-2 rounded-xl transition-all ${
                  scrolled || !isHome 
                  ? "hover:bg-white/10 text-white" 
                  : "hover:bg-slate-100 text-brand-purple"
                }`}
              >
                <Facebook size={18} />
              </a>
              <a 
                href="https://youtube.com/@resalastem-et5vd?si=c-HF-NEhKF4cmB8E" 
                target="_blank" 
                rel="noopener noreferrer"
                className={`p-2 rounded-xl transition-all ${
                  scrolled || !isHome 
                  ? "hover:bg-white/10 text-white" 
                  : "hover:bg-slate-100 text-brand-purple"
                }`}
              >
                <Youtube size={18} />
              </a>
            </div>
            <Link
              to="/register"
              className={`px-6 py-3 rounded-full text-sm font-black uppercase tracking-widest transition-all active:scale-95 shadow-xl hover:-translate-y-0.5 ${
                scrolled || !isHome 
                ? "bg-white text-brand-purple hover:bg-slate-50" 
                : "bg-red-500 text-white hover:bg-red-600 shadow-red-500/20"
              }`}
            >
              Join Now
            </Link>
          </div>
        </div>

        {/* Mobile Toggle */}
        <button
          className={`md:hidden ${scrolled || !isHome ? 'text-white' : 'text-brand-purple'}`}
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      {/* Mobile Nav */}
      <motion.div
        initial={false}
        animate={isOpen ? { height: "auto", opacity: 1 } : { height: 0, opacity: 0 }}
        className="absolute top-full left-0 right-0 bg-brand-purple overflow-hidden md:hidden shadow-2xl"
      >
        <div className="p-6 flex flex-col gap-4 border-t border-white/10">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              to={link.href}
              onClick={() => setIsOpen(false)}
              className={`text-lg font-bold ${
                location.pathname === link.href ? "text-red-400" : "text-white"
              }`}
            >
              {link.name}
            </Link>
          ))}
          <Link
            to="/register"
            onClick={() => setIsOpen(false)}
            className="w-full py-4 bg-red-500 text-white rounded-xl text-center font-bold text-lg"
          >
            Join Now
          </Link>
        </div>
      </motion.div>
    </motion.nav>
  );
}
