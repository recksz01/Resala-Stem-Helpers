/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence } from "motion/react";
import { useEffect } from "react";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import ScrollProgress from "./components/ScrollProgress";
import LoadingScreen from "./components/LoadingScreen";
import STEMCompanion from "./components/STEMCompanion"; // 👈 استيراد العنكبوت الجديد هنا
import Home from "./pages/Home";
import About from "./pages/About";
import Programs from "./pages/Programs";
import Impact from "./pages/Impact";
import Join from "./pages/Join";
import Contact from "./pages/Contact";
import Register from "./pages/Register";

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

export default function App() {
  return (
    <Router>
      <div className="flex flex-col min-h-screen">
        <STEMCompanion /> {/* 👈 إضافة المكون في جذع الشجرة ليعمل في كافة الصفحات */}
        <LoadingScreen />
        <ScrollToTop />
        <ScrollProgress />
        <Navbar />
        <main className="flex-grow">
          <AnimatePresence mode="wait">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/about" element={<About />} />
              <Route path="/programs" element={<Programs />} />
              <Route path="/impact" element={<Impact />} />
              <Route path="/join" element={<Join />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/register" element={<Register />} />
            </Routes>
          </AnimatePresence>
        </main>
        <Footer />
      </div>
    </Router>
  );
}
