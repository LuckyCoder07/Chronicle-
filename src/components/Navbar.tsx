import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useTheme, THEMES } from "../contexts/ThemeContext";
import { useSearch } from "../contexts/SearchContext";
import { auth } from "../lib/firebase";
import { signOut } from "firebase/auth";
import { LogOut, Palette, Menu, X, Search, BookOpen, ChevronDown, FileText, BarChart2, Plus, Heart } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useState, useEffect } from "react";
import { AnalyticsModal } from "./AnalyticsModal";

interface NavbarProps {
  onToggleSidebar: () => void;
}

export function Navbar({ onToggleSidebar }: NavbarProps) {
  const { profile } = useAuth();
  const { currentTheme, setTheme, isDark } = useTheme();
  const navigate = useNavigate();
  const { searchQuery, setSearchQuery } = useSearch();
  const [isThemeMenuOpen, setIsThemeMenuOpen] = useState(false);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isAnalyticsOpen, setIsAnalyticsOpen] = useState(false);

  useEffect(() => {
    const handleOpenAnalytics = () => {
      setIsAnalyticsOpen(true);
    };
    window.addEventListener("open-analytics", handleOpenAnalytics);
    return () => window.removeEventListener("open-analytics", handleOpenAnalytics);
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
    navigate("/login");
  };

  const handleInputChange = (val: string) => {
    setSearchQuery(val);
    if (window.location.pathname !== "/") {
      navigate("/");
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsMobileSearchOpen(false);
  };

  const activeColorTheme = THEMES.find(t => t.id === currentTheme) || THEMES[0];

  return (
    <header className="h-[70px] border-b border-editorial-border flex items-center justify-between px-[15px] md:px-[30px] shrink-0 bg-editorial-bg z-50 relative">
      <div className="flex items-center gap-[10px] md:gap-[40px]">
        {/* Mobile Hamburger Menu Toggle */}
        <button 
          onClick={onToggleSidebar}
          className="p-2 lg:hidden hover:bg-editorial-active rounded text-editorial-text focus-visible:ring-2 focus-visible:ring-editorial-accent outline-none"
          title="Toggle Navigation Menu"
          aria-label="Toggle navigation sidebar"
          aria-expanded="false"
        >
          <Menu className="w-5 h-5" aria-hidden="true" />
        </button>

        <Link 
          to="/" 
          className="font-serif font-black text-[20px] md:text-[24px] tracking-[-0.5px] uppercase text-editorial-text hover:opacity-80 transition-opacity flex items-center gap-2 focus-visible:ring-2 focus-visible:ring-editorial-accent focus-visible:ring-offset-2 outline-none rounded-sm px-1"
          aria-label="Chronicle home"
        >
          <BookOpen className="w-5 h-5 text-editorial-accent hidden sm:inline-block" aria-hidden="true" />
          Chronicle
        </Link>
        
        {/* Desktop Search */}
        <form onSubmit={handleSearchSubmit} className="hidden lg:flex relative w-[240px]" role="search">
          <input 
            type="text" 
            placeholder="Search posts..." 
            value={searchQuery}
            onChange={(e) => handleInputChange(e.target.value)}
            className="w-full bg-editorial-panel border border-editorial-border px-4 py-2 text-[12px] font-sans rounded-full outline-none focus:border-editorial-text focus:ring-1 focus:ring-editorial-text transition-colors placeholder:text-editorial-muted text-editorial-text"
            aria-label="Search posts"
          />
          <button 
            type="submit" 
            className="absolute right-3 top-1/2 -translate-y-1/2 text-editorial-muted hover:text-editorial-text focus-visible:ring-2 focus-visible:ring-editorial-accent outline-none rounded-full p-0.5"
            aria-label="Submit search"
          >
            <Search className="w-3.5 h-3.5" aria-hidden="true" />
          </button>
        </form>
      </div>
      
      {/* Middle Navigation - Desktop */}
      <nav className="flex items-center hidden md:flex gap-[20px] lg:gap-[24px]" aria-label="Main navigation">
        <Link to="/" className="text-[12px] font-semibold uppercase tracking-[1px] text-editorial-text hover:opacity-70 transition-opacity focus-visible:ring-2 focus-visible:ring-editorial-accent outline-none px-1 rounded">
          Home
        </Link>
        <Link to="/about" className="text-[12px] font-semibold uppercase tracking-[1px] text-editorial-text hover:opacity-70 transition-opacity focus-visible:ring-2 focus-visible:ring-editorial-accent outline-none px-1 rounded">
          About
        </Link>
        <Link to="/contact" className="text-[12px] font-semibold uppercase tracking-[1px] text-editorial-text hover:opacity-70 transition-opacity focus-visible:ring-2 focus-visible:ring-editorial-accent outline-none px-1 rounded">
          Contact
        </Link>
        {profile && (
          <Link to="/new" className="px-[16px] py-[8px] text-[10px] font-bold uppercase tracking-[1px] border border-editorial-text bg-editorial-text text-editorial-bg hover:bg-editorial-bg hover:text-editorial-text transition-colors focus-visible:ring-2 focus-visible:ring-editorial-accent outline-none">
            + Write a Blog
          </Link>
        )}
      </nav>
 
      {/* Action Buttons */}
      <div className="flex items-center gap-[10px] md:gap-[16px]">
        {/* Mobile Search Toggle */}
        <button 
          onClick={() => setIsMobileSearchOpen(!isMobileSearchOpen)}
          className="p-2 lg:hidden hover:bg-editorial-active rounded text-editorial-muted hover:text-editorial-text focus-visible:ring-2 focus-visible:ring-editorial-accent outline-none"
          title="Toggle search"
          aria-label="Toggle search input"
          aria-expanded={isMobileSearchOpen}
        >
          <Search className="w-[18px] h-[18px]" aria-hidden="true" />
        </button>
 
        {/* Dynamic Theme Chooser Widget */}
        <div className="relative">
          <button 
            onClick={() => setIsThemeMenuOpen(!isThemeMenuOpen)}
            className="p-2 hover:bg-editorial-active rounded-full transition-colors flex items-center gap-1.5 text-editorial-muted hover:text-editorial-text focus-visible:ring-2 focus-visible:ring-editorial-accent outline-none"
            title="Change color theme"
            aria-label="Change color theme"
            aria-haspopup="true"
            aria-expanded={isThemeMenuOpen}
          >
            <Palette className="w-[18px] h-[18px]" aria-hidden="true" />
            <span className="text-[10px] font-bold uppercase tracking-[0.5px] hidden sm:inline-block">Theme</span>
          </button>
 
          <AnimatePresence>
            {isThemeMenuOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setIsThemeMenuOpen(false)} />
                <motion.div 
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 mt-[12px] top-full bg-editorial-panel border border-editorial-border p-3 w-[220px] shadow-lg z-50 rounded-lg"
                  role="menu"
                  aria-label="Theme selector options"
                >
                  <h4 className="text-[10px] font-bold uppercase tracking-[1px] text-editorial-muted mb-2 border-b border-editorial-border pb-1.5">
                    Select Theme
                  </h4>
                  <div className="space-y-1" role="none">
                    {THEMES.map(theme => (
                      <button
                        key={theme.id}
                        onClick={() => {
                          setTheme(theme.id);
                          setIsThemeMenuOpen(false);
                        }}
                        role="menuitem"
                        aria-current={currentTheme === theme.id ? "true" : "false"}
                        className={`w-full text-left flex items-center justify-between px-2.5 py-2 text-[12px] rounded transition-colors focus-visible:ring-2 focus-visible:ring-editorial-accent outline-none ${currentTheme === theme.id ? "bg-editorial-active font-semibold text-editorial-text" : "hover:bg-editorial-active/50 text-editorial-muted hover:text-editorial-text"}`}
                      >
                        <div className="flex items-center gap-2">
                          <div className="flex -space-x-1" aria-hidden="true">
                            <span className="w-2.5 h-2.5 rounded-full border border-black/10 inline-block shrink-0" style={{ backgroundColor: theme.colors.bg }} />
                            <span className="w-2.5 h-2.5 rounded-full border border-black/10 inline-block shrink-0" style={{ backgroundColor: theme.colors.accent }} />
                            <span className="w-2.5 h-2.5 rounded-full border border-black/10 inline-block shrink-0" style={{ backgroundColor: theme.colors.text }} />
                          </div>
                          <span>{theme.name}</span>
                        </div>
                        {currentTheme === theme.id && <span className="w-1.5 h-1.5 rounded-full bg-editorial-accent" />}
                      </button>
                    ))}
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>
 
        {/* User profile / Login trigger */}
        {profile ? (
          <>
            <div className="relative">
              <button 
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center gap-[8px] md:gap-[12px] hover:opacity-85 transition-opacity cursor-pointer focus-visible:ring-2 focus-visible:ring-editorial-accent outline-none rounded p-1"
                aria-haspopup="true"
                aria-expanded={isUserMenuOpen}
              >
                <div className="w-[28px] h-[28px] md:w-[32px] md:h-[32px] bg-editorial-text text-editorial-bg rounded-full flex items-center justify-center text-[10px] font-bold uppercase shrink-0" aria-hidden="true">
                  {profile.displayName.substring(0, 2)}
                </div>
                <span className="text-[12px] font-semibold text-editorial-text hidden lg:inline-block">
                  {profile.displayName}
                </span>
                <ChevronDown className="w-3 h-3 text-editorial-muted hidden lg:block" />
              </button>

              <AnimatePresence>
                {isUserMenuOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setIsUserMenuOpen(false)} />
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 mt-[12px] bg-editorial-panel border border-editorial-border p-3 w-[240px] shadow-lg z-50 rounded-lg flex flex-col gap-1"
                      role="menu"
                    >
                      <div className="px-2.5 py-1.5 border-b border-editorial-border mb-1">
                        <p className="text-xs font-bold text-editorial-text truncate">{profile.displayName}</p>
                        <p className="text-[10px] text-editorial-muted truncate">{profile.email}</p>
                      </div>

                      <Link
                        to="/profile"
                        onClick={() => setIsUserMenuOpen(false)}
                        className="flex items-center gap-2 px-2.5 py-2 text-[12px] text-editorial-muted hover:text-editorial-text hover:bg-editorial-active/50 rounded transition-colors"
                      >
                        <FileText className="w-3.5 h-3.5 text-editorial-accent" />
                        <span>My Profile</span>
                      </Link>

                      <Link
                        to="/?user=me"
                        onClick={() => setIsUserMenuOpen(false)}
                        className="flex items-center gap-2 px-2.5 py-2 text-[12px] text-editorial-muted hover:text-editorial-text hover:bg-editorial-active/50 rounded transition-colors"
                      >
                        <FileText className="w-3.5 h-3.5 text-editorial-accent" />
                        <span>My Published Blogs</span>
                      </Link>

                      <Link
                        to="/?status=draft"
                        onClick={() => setIsUserMenuOpen(false)}
                        className="flex items-center gap-2 px-2.5 py-2 text-[12px] text-editorial-muted hover:text-editorial-text hover:bg-editorial-active/50 rounded transition-colors"
                      >
                        <BookOpen className="w-3.5 h-3.5" />
                        <span>My Drafts</span>
                      </Link>

                      <Link
                        to="/?status=liked"
                        onClick={() => setIsUserMenuOpen(false)}
                        className="flex items-center gap-2 px-2.5 py-2 text-[12px] text-editorial-muted hover:text-editorial-text hover:bg-editorial-active/50 rounded transition-colors"
                      >
                        <Heart className="w-3.5 h-3.5 text-red-500" />
                        <span>Liked Posts</span>
                      </Link>

                      <button
                        type="button"
                        onClick={() => {
                          setIsUserMenuOpen(false);
                          setIsAnalyticsOpen(true);
                        }}
                        className="w-full text-left flex items-center gap-2 px-2.5 py-2 text-[12px] text-editorial-muted hover:text-editorial-text hover:bg-editorial-active/50 rounded transition-colors cursor-pointer"
                      >
                        <BarChart2 className="w-3.5 h-3.5 text-blue-500" />
                        <span>Analytics Dashboard</span>
                      </button>

                      <Link
                        to="/new"
                        onClick={() => setIsUserMenuOpen(false)}
                        className="flex items-center gap-2 px-2.5 py-2 text-[12px] text-editorial-muted hover:text-editorial-text hover:bg-editorial-active/50 rounded transition-colors font-semibold"
                      >
                        <Plus className="w-3.5 h-3.5 text-green-500" />
                        <span>Write a Blog</span>
                      </Link>

                      <div className="border-t border-editorial-border my-1" />

                      <button
                        onClick={() => {
                          setIsUserMenuOpen(false);
                          handleLogout();
                        }}
                        className="w-full text-left flex items-center gap-2 px-2.5 py-2 text-[12px] text-red-500 hover:bg-red-500/10 rounded transition-colors cursor-pointer"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>Logout</span>
                      </button>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
          </>
        ) : (
          <div className="flex items-center gap-[10px] md:gap-[16px] ml-1">
            <Link to="/login" className="text-[12px] font-semibold uppercase tracking-[1px] text-editorial-text hover:opacity-70 transition-opacity focus-visible:ring-2 focus-visible:ring-editorial-accent outline-none px-1 rounded">
              Sign in
            </Link>
            <Link to="/register" className="px-[12px] md:px-[20px] py-[8px] md:py-[10px] text-[10px] md:text-[11px] font-bold uppercase tracking-[1px] border border-editorial-text bg-editorial-text text-editorial-bg hover:bg-editorial-bg hover:text-editorial-text transition-colors rounded-none focus-visible:ring-2 focus-visible:ring-editorial-accent outline-none">
              Get started
            </Link>
          </div>
        )}
      </div>

      {/* Mobile Search Overlay Panel */}
      <AnimatePresence>
        {isMobileSearchOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-full left-0 right-0 bg-editorial-panel border-b border-editorial-border p-3 z-40 lg:hidden flex gap-2"
            role="search"
          >
            <form onSubmit={handleSearchSubmit} className="flex-1 relative">
              <input 
                type="text" 
                placeholder="Search articles..." 
                value={searchQuery}
                onChange={(e) => handleInputChange(e.target.value)}
                className="w-full bg-editorial-bg border border-editorial-border px-4 py-2 text-[14px] outline-none focus:border-editorial-text focus:ring-1 focus:ring-editorial-text transition-colors text-editorial-text"
                autoFocus
                aria-label="Search articles on mobile"
              />
              <button 
                type="submit" 
                className="absolute right-3 top-1/2 -translate-y-1/2 text-editorial-muted focus-visible:ring-2 focus-visible:ring-editorial-accent outline-none rounded p-1"
                aria-label="Submit mobile search"
              >
                <Search className="w-4 h-4" aria-hidden="true" />
              </button>
            </form>
            <button 
              onClick={() => setIsMobileSearchOpen(false)}
              className="p-2 border border-editorial-border text-editorial-text hover:bg-editorial-active focus-visible:ring-2 focus-visible:ring-editorial-accent outline-none"
              aria-label="Close search overlay"
            >
              <X className="w-4 h-4" aria-hidden="true" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <AnalyticsModal isOpen={isAnalyticsOpen} onClose={() => setIsAnalyticsOpen(false)} />
    </header>
  );
}
