import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { createPost, getPost, updatePost, getCategories, getTags, createCategory, createTag } from "../lib/db";
import { Category, Tag } from "../types";
import { motion } from "motion/react";
import { RichTextEditor } from "../components/RichTextEditor";

export function CreateEditPost() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { profile, loading: authLoading } = useAuth();
  
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  
  const [categories, setCategories] = useState<Category[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newTagName, setNewTagName] = useState("");

  const [loading, setLoading] = useState(true);

  const [postStatus, setPostStatus] = useState<'published' | 'draft'>('published');

  const [autoSaveStatus, setAutoSaveStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [lastSavedTime, setLastSavedTime] = useState<string>("");

  const titleRef = useRef(title);
  const contentRef = useRef(content);
  const categoryIdRef = useRef(categoryId);
  const selectedTagsRef = useRef(selectedTags);
  const idRef = useRef(id);
  const profileRef = useRef(profile);

  const lastSavedData = useRef<{ title: string; content: string; categoryId: string; selectedTags: string[] }>({
    title: "",
    content: "",
    categoryId: "",
    selectedTags: []
  });

  useEffect(() => {
    titleRef.current = title;
  }, [title]);

  useEffect(() => {
    contentRef.current = content;
  }, [content]);

  useEffect(() => {
    categoryIdRef.current = categoryId;
  }, [categoryId]);

  useEffect(() => {
    selectedTagsRef.current = selectedTags;
  }, [selectedTags]);

  useEffect(() => {
    idRef.current = id;
  }, [id]);

  useEffect(() => {
    profileRef.current = profile;
  }, [profile]);

  useEffect(() => {
    Promise.all([getCategories(), getTags()]).then(([cats, tgs]) => {
      setCategories(cats);
      setTags(tgs);
      if (id) {
        getPost(id).then((post) => {
          if (post) {
            setTitle(post.title);
            setContent(post.content);
            setCategoryId(post.category || "");
            setSelectedTags(post.tags || []);
            setPostStatus(post.status || 'published');
            lastSavedData.current = {
              title: post.title,
              content: post.content,
              categoryId: post.category || "",
              selectedTags: post.tags || []
            };
          }
          setLoading(false);
        });
      } else {
        setLoading(false);
        lastSavedData.current = {
          title: "",
          content: "",
          categoryId: "",
          selectedTags: []
        };
      }
    });
  }, [id]);

  const handleAddCategory = async () => {
    if (!newCategoryName.trim()) return;
    const existing = categories.find(c => c.name.toLowerCase() === newCategoryName.toLowerCase());
    if (existing) {
      setCategoryId(existing.id);
    } else {
      const newId = await createCategory(newCategoryName);
      setCategories([...categories, { id: newId, name: newCategoryName, slug: newCategoryName.toLowerCase().replace(/[^a-z0-9]+/g, '-') }]);
      setCategoryId(newId);
    }
    setNewCategoryName("");
  };

  const handleAddTag = async () => {
    if (!newTagName.trim()) return;
    const existing = tags.find(t => t.name.toLowerCase() === newTagName.toLowerCase());
    if (existing) {
      if (!selectedTags.includes(existing.id)) setSelectedTags([...selectedTags, existing.id]);
    } else {
      const newId = await createTag(newTagName);
      setTags([...tags, { id: newId, name: newTagName, slug: newTagName.toLowerCase().replace(/[^a-z0-9]+/g, '-') }]);
      setSelectedTags([...selectedTags, newId]);
    }
    setNewTagName("");
  };

  const toggleTag = (tagId: string) => {
    if (selectedTags.includes(tagId)) {
      setSelectedTags(selectedTags.filter(id => id !== tagId));
    } else {
      setSelectedTags([...selectedTags, tagId]);
    }
  };

  const performAutoSave = async () => {
    const currentProfile = profileRef.current;
    if (!currentProfile) return;

    const currentTitle = titleRef.current;
    const currentContent = contentRef.current;
    const currentCategoryId = categoryIdRef.current;
    const currentSelectedTags = selectedTagsRef.current;
    const currentId = idRef.current;

    // Don't auto-save if nothing is written yet
    if (!currentTitle.trim() && !currentContent.trim()) return;

    // Don't auto-save if nothing has changed since last save
    const hasChanged = 
      currentTitle !== lastSavedData.current.title ||
      currentContent !== lastSavedData.current.content ||
      currentCategoryId !== lastSavedData.current.categoryId ||
      JSON.stringify(currentSelectedTags) !== JSON.stringify(lastSavedData.current.selectedTags);

    if (!hasChanged) return;

    setAutoSaveStatus("saving");

    try {
      if (currentId) {
        // Update existing document
        await updatePost(currentId, {
          title: currentTitle || "Untitled Draft",
          content: currentContent,
          category: currentCategoryId,
          tags: currentSelectedTags,
          status: "draft"
        });
        
        lastSavedData.current = {
          title: currentTitle,
          content: currentContent,
          categoryId: currentCategoryId,
          selectedTags: currentSelectedTags
        };
        setAutoSaveStatus("saved");
        setLastSavedTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
      } else {
        // Create new document as a draft
        const newId = await createPost({
          title: currentTitle || "Untitled Draft",
          content: currentContent,
          authorId: currentProfile.uid,
          authorName: currentProfile.displayName,
          category: currentCategoryId,
          tags: currentSelectedTags,
          status: "draft",
          views: 0,
          likes: 0
        } as any);

        // Update the id ref and URL so subsequent auto-saves update the same document!
        idRef.current = newId;
        lastSavedData.current = {
          title: currentTitle,
          content: currentContent,
          categoryId: currentCategoryId,
          selectedTags: currentSelectedTags
        };
        
        setAutoSaveStatus("saved");
        setLastSavedTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
        
        // Update URL to edit page
        navigate(`/edit/${newId}`, { replace: true });
      }
    } catch (error) {
      console.error("Auto-save failed:", error);
      setAutoSaveStatus("error");
    }
  };

  useEffect(() => {
    const timer = setInterval(() => {
      performAutoSave();
    }, 30000);

    return () => clearInterval(timer);
  }, []);

  const handleSubmit = async (e: React.FormEvent, statusOverride?: 'published' | 'draft') => {
    if (e) e.preventDefault();
    if (!profile) return;

    const finalStatus = statusOverride || postStatus;

    // Update last saved data so we don't trigger auto-save again
    lastSavedData.current = {
      title,
      content,
      categoryId,
      selectedTags
    };

    if (id) {
      await updatePost(id, { 
        title, 
        content, 
        category: categoryId, 
        tags: selectedTags,
        status: finalStatus
      });
      if (finalStatus === 'draft') {
        navigate(`/?status=draft`);
      } else {
        navigate(`/post/${id}`);
      }
    } else {
      const newPostId = await createPost({
        title,
        content,
        authorId: profile.uid,
        authorName: profile.displayName,
        category: categoryId,
        tags: selectedTags,
        status: finalStatus,
        views: 0,
        likes: 0
      } as any);
      if (finalStatus === 'draft') {
        navigate(`/?status=draft`);
      } else {
        navigate(`/post/${newPostId}`);
      }
    }
  };

  if (authLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="w-8 h-8 border-4 border-editorial-text border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!profile) {
    return <div className="text-center py-12 text-editorial-muted font-serif">Please sign in to write a post.</div>;
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="w-8 h-8 border-4 border-editorial-text border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl mx-auto p-[40px]"
    >
      <div className="bg-editorial-panel">
        <h1 className="font-serif text-[40px] leading-[1.1] tracking-[-0.5px] text-editorial-text mb-[40px]">
          {id ? "Edit Blog" : "Draft a New Blog"}
        </h1>
        
        <form onSubmit={(e) => handleSubmit(e)}>
          <div className="mb-[20px]">
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Blog Title"
              className="w-full font-serif text-[32px] md:text-[48px] text-editorial-text placeholder:text-editorial-muted/50 border-none focus:outline-none focus:ring-0 bg-transparent transition-colors py-[10px]"
              required
            />
          </div>
          <div className="mb-[20px] flex gap-[20px] items-start">
            <div className="flex-1">
              <label className="block text-[11px] font-bold uppercase tracking-[1px] text-editorial-text mb-[8px]">Category</label>
              <div className="flex gap-[10px]">
                <select
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="flex-1 px-[16px] py-[12px] border border-editorial-border focus:outline-none focus:border-editorial-text transition-colors text-[14px] bg-editorial-panel"
                >
                  <option value="">Select a category</option>
                  {categories.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
                <div className="flex gap-[5px]">
                  <input
                    type="text"
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                    placeholder="New category..."
                    className="w-[120px] px-[10px] py-[12px] border border-editorial-border focus:outline-none focus:border-editorial-text text-[12px]"
                  />
                  <button type="button" onClick={handleAddCategory} className="px-[12px] py-[12px] bg-editorial-panel border border-editorial-border text-[12px] font-bold hover:bg-editorial-border transition-colors">Add</button>
                </div>
              </div>
            </div>
            
            <div className="flex-1">
              <label className="block text-[11px] font-bold uppercase tracking-[1px] text-editorial-text mb-[8px]">Tags</label>
              <div className="flex flex-wrap gap-[5px] mb-[10px]">
                {tags.map(t => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => toggleTag(t.id)}
                    className={`px-[10px] py-[4px] text-[10px] font-bold uppercase tracking-[0.5px] border ${selectedTags.includes(t.id) ? 'bg-editorial-text text-editorial-bg border-editorial-text' : 'bg-transparent text-editorial-muted border-editorial-border hover:border-editorial-text hover:text-editorial-text'} transition-colors rounded-full`}
                  >
                    {t.name}
                  </button>
                ))}
              </div>
              <div className="flex gap-[5px]">
                <input
                  type="text"
                  value={newTagName}
                  onChange={(e) => setNewTagName(e.target.value)}
                  placeholder="New tag..."
                  className="flex-1 px-[10px] py-[8px] border border-editorial-border focus:outline-none focus:border-editorial-text text-[12px]"
                />
                <button type="button" onClick={handleAddTag} className="px-[12px] py-[8px] bg-editorial-panel border border-editorial-border text-[12px] font-bold hover:bg-editorial-border transition-colors">Add</button>
              </div>
            </div>
          </div>

          <div className="mb-[40px]">
            <RichTextEditor content={content} onChange={setContent} />
          </div>
          <div className="pt-[20px] border-t border-editorial-border flex flex-col sm:flex-row sm:items-center sm:justify-between gap-[16px]">
            {/* Auto-save status feedback */}
            <div className="flex items-center gap-[8px] text-[11px] font-mono text-editorial-muted">
              {autoSaveStatus === "saving" && (
                <>
                  <span className="w-2 h-2 rounded-full bg-editorial-accent animate-pulse" />
                  <span>Auto-saving draft...</span>
                </>
              )}
              {autoSaveStatus === "saved" && (
                <>
                  <span className="w-2 h-2 rounded-full bg-green-500" />
                  <span>Draft auto-saved at {lastSavedTime}</span>
                </>
              )}
              {autoSaveStatus === "error" && (
                <>
                  <span className="w-2 h-2 rounded-full bg-red-500" />
                  <span>Auto-save failed</span>
                </>
              )}
              {autoSaveStatus === "idle" && (
                <>
                  <span className="w-2 h-2 rounded-full bg-editorial-border" />
                  <span>Auto-save active (30s interval)</span>
                </>
              )}
            </div>

            <div className="flex justify-end gap-[12px] items-center">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="px-[20px] py-[10px] text-[11px] font-bold uppercase tracking-[1px] border border-transparent text-editorial-text hover:bg-editorial-active transition-colors"
              >
                Cancel
              </button>
              {(!id || postStatus === 'draft') && (
                <button
                  type="button"
                  onClick={(e) => handleSubmit(e as any, 'draft')}
                  className="px-[20px] py-[10px] text-[11px] font-bold uppercase tracking-[1px] border border-editorial-border text-editorial-text bg-editorial-panel hover:bg-editorial-active transition-colors"
                >
                  Save as Draft
                </button>
              )}
              <button
                type="submit"
                onClick={() => setPostStatus('published')}
                className="px-[20px] py-[10px] text-[11px] font-bold uppercase tracking-[1px] border border-editorial-text bg-editorial-text text-editorial-bg hover:bg-transparent hover:text-editorial-text transition-colors"
              >
                {id && postStatus === 'published' ? "Save Changes" : "Publish Blog"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </motion.div>
  );
}
