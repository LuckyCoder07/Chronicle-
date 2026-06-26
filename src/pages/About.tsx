import React from "react";
import { motion } from "motion/react";
import { LazyImage } from "../components/LazyImage";

export function About() {
  const team = [
    {
      name: "Lakshit Singh",
      role: "Full Stack Developer",
      bio: "Pursuing Computer Science Engineering at PCCOE Pune with strong interests in cutting-edge tech and digital productivity workflows. Dedicated to engineering robust web apps and silent, high-craft editorial writing systems.",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80",
    }
  ];

  const values = [
    {
      title: "Intellectual Depth",
      description: "We bypass rapid clickbait in favor of research, reflection, and deeply articulated viewpoints that stand the test of time.",
    },
    {
      title: "Tactile Typography",
      description: "Every pixel is placed with intent. We pair classic serif displays with spacious gutters to create a distraction-free digital reader.",
    },
    {
      title: "Community Growth",
      description: "Chronicle is a safe haven for authors to voice complex ideas and build reach through quality instead of algorithm optimization.",
    },
  ];

  return (
    <div className="p-[20px] md:p-[40px] lg:p-[60px] max-w-5xl mx-auto min-h-screen">
      <header className="mb-[60px] border-b border-editorial-border pb-[30px]">
        <div className="font-serif italic text-[14px] text-editorial-accent mb-[12px]">
          Our Philosophy
        </div>
        <motion.h1
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="font-serif text-[48px] md:text-[64px] leading-[1.05] tracking-[-1px] text-editorial-text mb-[24px]"
        >
          A Sanctuary for Slow Writing & Mindful Reading
        </motion.h1>
        <motion.p
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="font-serif italic text-[18px] md:text-[22px] text-editorial-muted max-w-3xl leading-[1.6]"
        >
          "Chronicle is born out of a desire to silence the constant digital hum. We choose craftsmanship over algorithms, depth over speed, and elegant prose over superficial metrics."
        </motion.p>
      </header>

      {/* Story section */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-[48px] mb-[80px]">
        <div>
          <h2 className="font-serif text-[28px] font-bold text-editorial-text mb-[16px]">
            Why Chronicle Matters
          </h2>
          <p className="font-sans text-[15px] leading-[1.7] text-editorial-muted mb-[16px]">
            In an era dominated by rapid scrolling and endless feeds, reading has become a passive habit rather than an active pleasure. Information hits our screens at light speed, but vanishes from our memory just as quickly.
          </p>
          <p className="font-sans text-[15px] leading-[1.7] text-editorial-muted">
            Chronicle offers a restorative pause. By designing clean layouts, utilizing generous white spaces, and supporting multiple calming color themes, we help authors and readers connect on a profound intellectual level.
          </p>
        </div>
        <div className="bg-editorial-panel border border-editorial-border p-[40px] flex flex-col justify-center">
          <div className="text-[32px] font-serif text-editorial-accent font-bold mb-[12px]">25k+</div>
          <div className="text-[12px] uppercase tracking-[1px] text-editorial-text font-bold mb-[24px]">Monthly Thoughtful Readers</div>
          <div className="text-[32px] font-serif text-editorial-accent font-bold mb-[12px]">300+</div>
          <div className="text-[12px] uppercase tracking-[1px] text-editorial-text font-bold">Independent Curators</div>
        </div>
      </section>

      {/* Values section */}
      <section className="mb-[80px] border-t border-b border-editorial-border py-[60px]">
        <h2 className="font-serif text-[32px] font-bold text-editorial-text mb-[40px] text-center">
          Our Editorial Pillars
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-[30px]">
          {values.map((v, i) => (
            <div key={i} className="flex flex-col gap-[16px]">
              <span className="font-serif text-[18px] italic text-editorial-accent">0{i + 1}.</span>
              <h3 className="font-serif text-[20px] font-bold text-editorial-text">{v.title}</h3>
              <p className="font-sans text-[14px] leading-[1.6] text-editorial-muted">{v.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Team section */}
      <section className="mb-[40px]">
        <h2 className="font-serif text-[32px] font-bold text-editorial-text mb-[40px] text-center">
          The Creator of Chronicle
        </h2>
        <div className="max-w-md mx-auto">
          {team.map((t, i) => (
            <div key={i} className="flex flex-col gap-[16px] group">
              <div className="overflow-hidden border border-editorial-border aspect-[1/1] w-full">
                <LazyImage
                  src={t.image}
                  alt={t.name}
                  className="w-full h-full object-cover filter grayscale hover:grayscale-0 transition-all duration-500"
                  wrapperClassName="w-full h-full"
                />
              </div>
              <div>
                <h3 className="font-serif text-[20px] font-bold text-editorial-text">{t.name}</h3>
                <span className="text-[11px] uppercase tracking-[1.5px] text-editorial-accent font-bold">{t.role}</span>
                <p className="font-sans text-[13px] leading-[1.6] text-editorial-muted mt-[10px]">{t.bio}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
