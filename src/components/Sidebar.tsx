import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useEffect, useState } from "react";
import { getCategories, getTags } from "../lib/db";
import { Category, Tag } from "../types";
import { SidebarNewsletter } from "./Newsletter";

export function Sidebar() {
  const { profile } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [categories, setCategories] = useState<Category[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    getCategories().then(setCategories);
    getTags().then(setTags);
  }, []);

  const handleSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && searchQuery.trim()) {
      navigate(`/?q=${encodeURIComponent(searchQuery.trim())}`);
    } else if (e.key === "Enter" && !searchQuery.trim()) {
      navigate(`/`);
    }
  };

  return (
    <aside className="w-full h-full flex flex-col bg-editorial-bg overflow-y-auto">
      <div className="text-[11px] font-bold uppercase tracking-[1.5px] text-editorial-muted mb-3 px-[30px] pt-[30px]">
        Pages
      </div>
      
      <Link 
        to="/" 
        className={`px-[30px] py-[12px] text-[14px] flex items-center ${location.pathname === '/' && !location.search ? 'bg-editorial-active text-editorial-text font-semibold' : 'text-editorial-muted hover:bg-editorial-active/50 hover:text-editorial-text'}`}
      >
        {location.pathname === '/' && !location.search && <span className="w-1.5 h-1.5 bg-editorial-accent rounded-full inline-block mr-2" />}
        Home
      </Link>

      <Link 
        to="/about" 
        className={`px-[30px] py-[12px] text-[14px] flex items-center ${location.pathname === '/about' ? 'bg-editorial-active text-editorial-text font-semibold' : 'text-editorial-muted hover:bg-editorial-active/50 hover:text-editorial-text'}`}
      >
        {location.pathname === '/about' && <span className="w-1.5 h-1.5 bg-editorial-accent rounded-full inline-block mr-2" />}
        About
      </Link>

      <Link 
        to="/contact" 
        className={`px-[30px] py-[12px] text-[14px] flex items-center ${location.pathname === '/contact' ? 'bg-editorial-active text-editorial-text font-semibold' : 'text-editorial-muted hover:bg-editorial-active/50 hover:text-editorial-text'}`}
      >
        {location.pathname === '/contact' && <span className="w-1.5 h-1.5 bg-editorial-accent rounded-full inline-block mr-2" />}
        Contact
      </Link>

      {profile && (
        <Link 
          to="/new" 
          className="px-[30px] py-[12px] text-[14px] flex items-center font-bold text-editorial-accent hover:bg-editorial-active/50"
        >
          + Write a Blog
        </Link>
      )}

      {profile && (
        <>
          <div className="text-[11px] font-bold uppercase tracking-[1.5px] text-editorial-muted mb-3 px-[30px] pt-[24px]">
            Profile Workspace
          </div>
          <Link 
            to="/?user=me" 
            className={`px-[30px] py-[12px] text-[14px] flex items-center ${location.pathname === '/' && location.search.includes('user=me') ? 'bg-editorial-active text-editorial-text font-semibold' : 'text-editorial-muted hover:bg-editorial-active/50 hover:text-editorial-text'}`}
          >
            My Published Blogs
          </Link>
          <Link 
            to="/?status=draft" 
            className={`px-[30px] py-[12px] text-[14px] flex items-center ${location.pathname === '/' && location.search.includes('status=draft') ? 'bg-editorial-active text-editorial-text font-semibold' : 'text-editorial-muted hover:bg-editorial-active/50 hover:text-editorial-text'}`}
          >
            My Drafts
          </Link>
          <Link 
            to="/?status=liked" 
            className={`px-[30px] py-[12px] text-[14px] flex items-center ${location.pathname === '/' && location.search.includes('status=liked') ? 'bg-editorial-active text-editorial-text font-semibold' : 'text-editorial-muted hover:bg-editorial-active/50 hover:text-editorial-text'}`}
          >
            Liked Posts
          </Link>
          <button 
            type="button"
            onClick={() => window.dispatchEvent(new Event("open-analytics"))}
            className="w-full text-left px-[30px] py-[12px] text-[14px] flex items-center text-editorial-muted hover:bg-editorial-active/50 hover:text-editorial-text cursor-pointer"
          >
            Analytics
          </button>
        </>
      )}

      {categories.length > 0 && (
        <>
          <div className="text-[11px] font-bold uppercase tracking-[1.5px] text-editorial-muted mb-5 px-[30px] pt-[30px]">
            Categories
          </div>
          {categories.map(c => (
            <Link key={c.id} to={`/?category=${c.id}`} className="px-[30px] py-[12px] text-[14px] text-editorial-muted flex items-center cursor-pointer hover:bg-editorial-active/50 hover:text-editorial-text">
              {c.name}
            </Link>
          ))}
        </>
      )}

      {tags.length > 0 && (
        <>
          <div className="text-[11px] font-bold uppercase tracking-[1.5px] text-editorial-muted mb-3 px-[30px] pt-[30px]">
            Tags
          </div>
          <div className="px-[30px] flex flex-wrap gap-2">
            {tags.map(t => (
              <Link key={t.id} to={`/?tag=${t.id}`} className="text-[12px] bg-editorial-active text-editorial-text px-2 py-1 rounded hover:bg-editorial-border transition-colors">
                #{t.name}
              </Link>
            ))}
          </div>
        </>
      )}

      <SidebarNewsletter />
    </aside>
  );
}

