import React, { useState } from "react";
import { motion } from "motion/react";
import { Mail, Phone, MapPin, Send, CheckCircle2 } from "lucide-react";

export function Contact() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name && email && message) {
      setSubmitted(true);
      setName("");
      setEmail("");
      setSubject("");
      setMessage("");
    }
  };

  return (
    <div className="p-[20px] md:p-[40px] lg:p-[60px] max-w-5xl mx-auto min-h-screen">
      <header className="mb-[60px] border-b border-editorial-border pb-[30px]">
        <div className="font-serif italic text-[14px] text-editorial-accent mb-[12px]">
          Get in Touch
        </div>
        <motion.h1
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="font-serif text-[48px] md:text-[64px] leading-[1.05] tracking-[-1px] text-editorial-text mb-[24px]"
        >
          Send Us a Dispatch
        </motion.h1>
        <motion.p
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="font-sans text-[16px] text-editorial-muted max-w-2xl leading-[1.6]"
        >
          Whether you want to pitch an article, report an issue, inquire about advertisements, or simply send us a letter, our team reads every message.
        </motion.p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-[50px]">
        {/* Contact info columns */}
        <div className="lg:col-span-5 flex flex-col justify-between gap-[40px]">
          <div className="space-y-[30px]">
            <div>
              <h2 className="font-serif text-[22px] font-bold text-editorial-text mb-[10px]">Office Coordinates</h2>
              <p className="font-sans text-[14px] text-editorial-muted leading-[1.6]">
                Our remote editorial team converges in our design hubs in Copenhagen and Kyoto.
              </p>
            </div>

            <div className="space-y-[20px]">
              <div className="flex gap-4 items-start">
                <div className="p-[10px] bg-editorial-active text-editorial-text rounded-full shrink-0">
                  <MapPin className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-[12px] uppercase tracking-[1px] font-bold text-editorial-text mb-1">Copenhagen HQ</h3>
                  <p className="text-[14px] text-editorial-muted">Nørrebrogade 142, 2200 København N, Denmark</p>
                </div>
              </div>

              <div className="flex gap-4 items-start">
                <div className="p-[10px] bg-editorial-active text-editorial-text rounded-full shrink-0">
                  <MapPin className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-[12px] uppercase tracking-[1px] font-bold text-editorial-text mb-1">Kyoto Atelier</h3>
                  <p className="text-[14px] text-editorial-muted">Nishijin textile district, Kamigyo-ku, Kyoto, Japan</p>
                </div>
              </div>

              <div className="flex gap-4 items-start">
                <div className="p-[10px] bg-editorial-active text-editorial-text rounded-full shrink-0">
                  <Mail className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-[12px] uppercase tracking-[1px] font-bold text-editorial-text mb-1">General Inquiries</h3>
                  <p className="text-[14px] text-editorial-muted hover:underline cursor-pointer">editor@chronicle-news.com</p>
                </div>
              </div>

              <div className="flex gap-4 items-start">
                <div className="p-[10px] bg-editorial-active text-editorial-text rounded-full shrink-0">
                  <Phone className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-[12px] uppercase tracking-[1px] font-bold text-editorial-text mb-1">Press Inquiries</h3>
                  <p className="text-[14px] text-editorial-muted">+45 88 12 34 56</p>
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-editorial-border pt-[30px] hidden lg:block">
            <span className="font-serif italic text-[14px] text-editorial-muted">
              "We write slowly, we read slowly, and we reply carefully."
            </span>
          </div>
        </div>

        {/* Contact Form column */}
        <div className="lg:col-span-7 bg-editorial-panel border border-editorial-border p-[20px] sm:p-[30px] md:p-[40px]">
          {submitted ? (
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="text-center py-[40px] flex flex-col items-center justify-center"
            >
              <div className="p-[16px] bg-emerald-500/10 text-emerald-500 rounded-full mb-4">
                <CheckCircle2 className="w-12 h-12" />
              </div>
              <h2 className="font-serif text-[28px] font-bold text-editorial-text mb-3">Letter Transmitted</h2>
              <p className="font-sans text-[14px] text-editorial-muted max-w-md mx-auto mb-6">
                Thank you. Your message has been safely delivered to our editors. We will read it over coffee and respond within two business days.
              </p>
              <button
                onClick={() => setSubmitted(false)}
                className="px-6 py-2.5 bg-editorial-text text-editorial-bg text-[12px] uppercase tracking-[1px] font-bold hover:opacity-90 transition-opacity"
              >
                Send Another Letter
              </button>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-[24px]">
              <h2 className="font-serif text-[24px] font-bold text-editorial-text mb-2 border-b border-editorial-border pb-3">
                The Letterbox
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-[11px] uppercase tracking-[1px] font-bold text-editorial-text mb-[8px]">
                    Your Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-editorial-bg border border-editorial-border px-4 py-3 text-[14px] outline-none focus:border-editorial-text transition-colors text-editorial-text"
                    placeholder="e.g. Alexis Carter"
                  />
                </div>

                <div>
                  <label className="block text-[11px] uppercase tracking-[1px] font-bold text-editorial-text mb-[8px]">
                    Your Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-editorial-bg border border-editorial-border px-4 py-3 text-[14px] outline-none focus:border-editorial-text transition-colors text-editorial-text"
                    placeholder="e.g. alexis@domain.com"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] uppercase tracking-[1px] font-bold text-editorial-text mb-[8px]">
                  Subject
                </label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full bg-editorial-bg border border-editorial-border px-4 py-3 text-[14px] outline-none focus:border-editorial-text transition-colors text-editorial-text"
                  placeholder="Inquire about pitching / partnership"
                />
              </div>

              <div>
                <label className="block text-[11px] uppercase tracking-[1px] font-bold text-editorial-text mb-[8px]">
                  Your Dispatch Message *
                </label>
                <textarea
                  required
                  rows={6}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full bg-editorial-bg border border-editorial-border px-4 py-3 text-[14px] outline-none focus:border-editorial-text transition-colors text-editorial-text resize-none"
                  placeholder="Write your message here..."
                ></textarea>
              </div>

              <button
                type="submit"
                className="w-full flex items-center justify-center gap-2 px-6 py-3.5 bg-editorial-text text-editorial-bg font-bold text-[12px] uppercase tracking-[1px] hover:opacity-95 transition-opacity"
              >
                <Send className="w-3.5 h-3.5" />
                Transmit Letter
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
