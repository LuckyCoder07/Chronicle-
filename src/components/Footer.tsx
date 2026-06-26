import React from "react";
import { Link } from "react-router-dom";
import { BookOpen, Twitter, Linkedin, Github, ArrowUp } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";

export function Footer() {
  const { profile } = useAuth();

  const scrollToTop = () => {
    // Try scrolling both main containers
    const containers = [
      document.getElementById("main-scroll-container"),
      document.getElementById("post-main-scroll"),
      window
    ];
    containers.forEach(container => {
      if (container) {
        container.scrollTo({ top: 0, behavior: "smooth" });
      }
    });
  };

  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full bg-editorial-panel border-t border-editorial-border py-12 px-6 md:px-12 mt-auto" role="contentinfo" aria-label="Chronicle Site Footer">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 md:gap-12">
          {/* Brand Column */}
          <div className="md:col-span-2 flex flex-col gap-4">
            <Link 
              to="/" 
              className="font-serif font-black text-[22px] tracking-[-0.5px] uppercase text-editorial-text hover:opacity-80 transition-opacity flex items-center gap-2 focus-visible:ring-2 focus-visible:ring-editorial-accent outline-none w-fit"
              aria-label="Chronicle home"
            >
              <BookOpen className="w-5 h-5 text-editorial-accent" aria-hidden="true" />
              Chronicle
            </Link>
            <p className="text-[13px] leading-relaxed text-editorial-muted max-w-sm">
              An independent, curated space for digital chronicles, investigative journals, and insightful perspectives on technology, design, and culture.
            </p>
          </div>

          {/* Navigation Column */}
          <div>
            <h4 className="text-[11px] font-bold uppercase tracking-[1.5px] text-editorial-text mb-4">
              Explore
            </h4>
            <ul className="space-y-2.5" role="list">
              <li>
                <Link 
                  to="/" 
                  className="text-[13px] text-editorial-muted hover:text-editorial-text transition-colors focus-visible:ring-2 focus-visible:ring-editorial-accent outline-none rounded"
                >
                  Home
                </Link>
              </li>
              <li>
                <Link 
                  to="/about" 
                  className="text-[13px] text-editorial-muted hover:text-editorial-text transition-colors focus-visible:ring-2 focus-visible:ring-editorial-accent outline-none rounded"
                >
                  About
                </Link>
              </li>
              <li>
                <Link 
                  to="/contact" 
                  className="text-[13px] text-editorial-muted hover:text-editorial-text transition-colors focus-visible:ring-2 focus-visible:ring-editorial-accent outline-none rounded"
                >
                  Contact
                </Link>
              </li>
              {profile && (
                <li>
                  <Link 
                    to="/new" 
                    className="text-[13px] text-editorial-muted hover:text-editorial-text transition-colors focus-visible:ring-2 focus-visible:ring-editorial-accent outline-none rounded"
                  >
                    + New Post
                  </Link>
                </li>
              )}
            </ul>
          </div>

          {/* Social / Back to Top Column */}
          <div className="flex flex-col justify-between">
            <div>
              <h4 className="text-[11px] font-bold uppercase tracking-[1.5px] text-editorial-text mb-4">
                Follow Us
              </h4>
              <div className="flex items-center gap-4">
                <a 
                  href="https://twitter.com" 
                  target="_blank" 
                  rel="noreferrer" 
                  className="text-editorial-muted hover:text-editorial-text transition-colors focus-visible:ring-2 focus-visible:ring-editorial-accent outline-none rounded p-1"
                  aria-label="Follow Chronicle on Twitter"
                >
                  <Twitter className="w-4 h-4" />
                </a>
                <a 
                  href="https://linkedin.com" 
                  target="_blank" 
                  rel="noreferrer" 
                  className="text-editorial-muted hover:text-editorial-text transition-colors focus-visible:ring-2 focus-visible:ring-editorial-accent outline-none rounded p-1"
                  aria-label="Follow Chronicle on LinkedIn"
                >
                  <Linkedin className="w-4 h-4" />
                </a>
                <a 
                  href="https://github.com" 
                  target="_blank" 
                  rel="noreferrer" 
                  className="text-editorial-muted hover:text-editorial-text transition-colors focus-visible:ring-2 focus-visible:ring-editorial-accent outline-none rounded p-1"
                  aria-label="Check our Github"
                >
                  <Github className="w-4 h-4" />
                </a>
              </div>
            </div>

            <button
              onClick={scrollToTop}
              className="mt-6 md:mt-0 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[1.5px] text-editorial-muted hover:text-editorial-text transition-colors focus-visible:ring-2 focus-visible:ring-editorial-accent outline-none rounded py-1 w-fit"
              aria-label="Scroll back to top"
            >
              <ArrowUp className="w-3.5 h-3.5" />
              Back to Top
            </button>
          </div>
        </div>

        <div className="border-t border-editorial-border/60 mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-[12px] text-editorial-muted font-mono">
          <div>
            &copy; {currentYear} Chronicle. All rights reserved.
          </div>
          <div className="flex gap-4">
            <span className="hover:text-editorial-text transition-colors cursor-pointer">Privacy</span>
            <span>&middot;</span>
            <span className="hover:text-editorial-text transition-colors cursor-pointer">Terms</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
