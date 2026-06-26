import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { getPosts } from "../lib/db";
import { Post } from "../types";
import { PostItemSkeleton } from "../components/Skeletons";
import { BarChart2, BookOpen, FileText, Heart } from "lucide-react";
import { motion } from "motion/react";

export function Profile() {
  const { profile } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (profile) {
      getPosts().then((data) => {
        setPosts(data.filter(p => p.authorId === profile.uid));
        setLoading(false);
      });
    }
  }, [profile]);

  if (loading) {
    return <div className="p-10 max-w-5xl mx-auto"><PostItemSkeleton /></div>;
  }

  const drafts = posts.filter(p => p.status === 'draft');
  const published = posts.filter(p => p.status !== 'draft');
  const totalViews = published.reduce((acc, p) => acc + (p.views || 0), 0);
  const totalLikes = published.reduce((acc, p) => acc + (p.likes || 0), 0);

  return (
    <div className="p-10 max-w-5xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">My Profile</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
        <div className="bg-editorial-panel p-6 border rounded-lg">
          <div className="text-editorial-muted text-sm flex items-center gap-2"><FileText size={16}/> Published</div>
          <div className="text-3xl font-bold">{published.length}</div>
        </div>
        <div className="bg-editorial-panel p-6 border rounded-lg">
          <div className="text-editorial-muted text-sm flex items-center gap-2"><BookOpen size={16}/> Drafts</div>
          <div className="text-3xl font-bold">{drafts.length}</div>
        </div>
        <div className="bg-editorial-panel p-6 border rounded-lg">
          <div className="text-editorial-muted text-sm flex items-center gap-2"><BarChart2 size={16}/> Total Views</div>
          <div className="text-3xl font-bold">{totalViews}</div>
        </div>
        <div className="bg-editorial-panel p-6 border rounded-lg">
          <div className="text-editorial-muted text-sm flex items-center gap-2"><Heart size={16}/> Total Likes</div>
          <div className="text-3xl font-bold">{totalLikes}</div>
        </div>
      </div>

      <h2 className="text-xl font-bold mb-4">Drafts</h2>
      <div className="space-y-4">
        {drafts.map(p => (
          <div key={p.id} className="p-4 border rounded">
            <h3 className="font-bold">{p.title}</h3>
          </div>
        ))}
      </div>
    </div>
  );
}
