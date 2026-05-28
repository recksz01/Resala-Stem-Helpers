/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { motion } from "motion/react";
import { Atom, Binary, FlaskConical, Network, Rocket } from "lucide-react";

export default function FloatingIcons() {
  const icons = [
    { Icon: Atom, color: "text-blue-400", delay: 0 },
    { Icon: Rocket, color: "text-red-400", delay: 2 },
    { Icon: Binary, color: "text-purple-400", delay: 4 },
    { Icon: FlaskConical, color: "text-green-400", delay: 1 },
    { Icon: Network, color: "text-orange-400", delay: 3 },
  ];

  return (
    <div className="absolute inset-0 pointer-events-none z-10 hidden lg:block">
      {icons.map((item, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, scale: 0 }}
          animate={{ 
            opacity: [0, 0.4, 0],
            scale: [0.5, 1, 0.5],
            y: [0, -100, 0],
            x: [0, Math.sin(i) * 50, 0]
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            delay: item.delay,
            ease: "easeInOut"
          }}
          className={`absolute ${item.color}`}
          style={{
            left: `${20 + i * 15}%`,
            top: `${30 + (i % 3) * 20}%`,
          }}
        >
          <item.Icon size={40 + i * 10} strokeWidth={1.5} />
        </motion.div>
      ))}
    </div>
  );
}
