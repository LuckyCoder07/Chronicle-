import { useEffect, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { Navbar } from "./Navbar";
import { Sidebar } from "./Sidebar";
import { Footer } from "./Footer";
import { motion, AnimatePresence } from "motion/react";

export function Layout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const location = useLocation();

  // Close sidebar on route change on mobile
  useEffect(() => {
    setIsSidebarOpen(false);
  }, [location.pathname, location.search]);

  const isPostDetailPage = location.pathname.startsWith("/post/");

  return (
    <div className="h-screen bg-editorial-bg text-editorial-text font-sans flex flex-col overflow-hidden selection:bg-editorial-active">
      <div className="relative z-10 flex flex-col h-full w-full">
        <Navbar onToggleSidebar={() => setIsSidebarOpen(prev => !prev)} />
        <div className="flex-1 flex overflow-hidden relative">
          
          {/* Backdrop overlay for mobile & tablet */}
          <AnimatePresence>
            {isSidebarOpen && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsSidebarOpen(false)}
                className="fixed inset-0 bg-black/40 z-30 lg:hidden"
              />
            )}
          </AnimatePresence>

          {/* Sidebar container - slide out on mobile/tablet, fixed side-panel on desktop */}
          <div className={`
            fixed lg:static inset-y-0 left-0 z-40 w-[280px] shrink-0 h-full
            transform ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0
            transition-transform duration-300 ease-in-out
            bg-editorial-bg border-r border-editorial-border
          `}>
            <Sidebar />
          </div>

          <motion.main 
            id="main-scroll-container"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className={`flex-1 ${isPostDetailPage ? "overflow-hidden" : "overflow-y-auto"} bg-editorial-bg flex flex-col`}
          >
            <div className={`flex-1 flex flex-col ${isPostDetailPage ? "overflow-hidden h-full" : ""}`}>
              <Outlet />
            </div>
            {!isPostDetailPage && <Footer />}
          </motion.main>
        </div>
      </div>
    </div>
  );
}
