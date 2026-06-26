import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import UnderlineExtension from '@tiptap/extension-underline';
import { Bold, Italic, Heading1, Heading2, List, ListOrdered, Image as ImageIcon, Link as LinkIcon, Underline, X, Plus } from 'lucide-react';
import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface RichTextEditorProps {
  content: string;
  onChange: (content: string) => void;
}

export function RichTextEditor({ content, onChange }: RichTextEditorProps) {
  const [modalType, setModalType] = useState<'link' | 'image' | null>(null);
  const [urlInput, setUrlInput] = useState('');

  const editor = useEditor({
    extensions: [
      StarterKit,
      Image,
      UnderlineExtension,
      Link.configure({ openOnClick: false }),
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: 'prose prose-sm sm:prose lg:prose-lg xl:prose-2xl mx-auto focus:outline-none min-h-[400px] py-[20px] font-serif text-[18px] leading-[1.7] text-editorial-text',
      },
    },
  });

  if (!editor) {
    return null;
  }

  const openLinkModal = () => {
    const previousUrl = editor.getAttributes('link').href || '';
    setUrlInput(previousUrl);
    setModalType('link');
  };

  const openImageModal = () => {
    setUrlInput('');
    setModalType('image');
  };

  const handleModalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!urlInput.trim()) {
      setModalType(null);
      return;
    }

    if (modalType === 'link') {
      editor.chain().focus().extendMarkRange('link').setLink({ href: urlInput }).run();
    } else if (modalType === 'image') {
      editor.chain().focus().setImage({ src: urlInput }).run();
    }
    setModalType(null);
    setUrlInput('');
  };

  const removeLink = () => {
    editor.chain().focus().extendMarkRange('link').unsetLink().run();
    setModalType(null);
  };

  return (
    <div className="border border-editorial-border bg-editorial-panel rounded-md flex flex-col relative">
      <div className="flex flex-wrap gap-[5px] p-[10px] border-b border-editorial-border bg-editorial-panel shrink-0">
        <button type="button" onClick={() => editor.chain().focus().toggleBold().run()} className={`p-[5px] rounded hover:bg-editorial-border ${editor.isActive('bold') ? 'bg-editorial-border text-editorial-text' : 'text-editorial-muted'}`}><Bold className="w-[18px] h-[18px]" /></button>
        <button type="button" onClick={() => editor.chain().focus().toggleItalic().run()} className={`p-[5px] rounded hover:bg-editorial-border ${editor.isActive('italic') ? 'bg-editorial-border text-editorial-text' : 'text-editorial-muted'}`}><Italic className="w-[18px] h-[18px]" /></button>
        <button type="button" onClick={() => editor.chain().focus().toggleUnderline().run()} className={`p-[5px] rounded hover:bg-editorial-border ${editor.isActive('underline') ? 'bg-editorial-border text-editorial-text' : 'text-editorial-muted'}`}><Underline className="w-[18px] h-[18px]" /></button>
        <div className="w-[1px] bg-editorial-border mx-[5px]" />
        <button type="button" onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} className={`p-[5px] rounded hover:bg-editorial-border ${editor.isActive('heading', { level: 2 }) ? 'bg-editorial-border text-editorial-text' : 'text-editorial-muted'}`}><Heading1 className="w-[18px] h-[18px]" /></button>
        <button type="button" onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} className={`p-[5px] rounded hover:bg-editorial-border ${editor.isActive('heading', { level: 3 }) ? 'bg-editorial-border text-editorial-text' : 'text-editorial-muted'}`}><Heading2 className="w-[18px] h-[18px]" /></button>
        <div className="w-[1px] bg-editorial-border mx-[5px]" />
        <button type="button" onClick={() => editor.chain().focus().toggleBulletList().run()} className={`p-[5px] rounded hover:bg-editorial-border ${editor.isActive('bulletList') ? 'bg-editorial-border text-editorial-text' : 'text-editorial-muted'}`}><List className="w-[18px] h-[18px]" /></button>
        <button type="button" onClick={() => editor.chain().focus().toggleOrderedList().run()} className={`p-[5px] rounded hover:bg-editorial-border ${editor.isActive('orderedList') ? 'bg-editorial-border text-editorial-text' : 'text-editorial-muted'}`}><ListOrdered className="w-[18px] h-[18px]" /></button>
        <div className="w-[1px] bg-editorial-border mx-[5px]" />
        <button type="button" onClick={openLinkModal} className={`p-[5px] rounded hover:bg-editorial-border ${editor.isActive('link') ? 'bg-editorial-border text-editorial-text' : 'text-editorial-muted'}`}><LinkIcon className="w-[18px] h-[18px]" /></button>
        <button type="button" onClick={openImageModal} className={`p-[5px] rounded hover:bg-editorial-border text-editorial-muted`}><ImageIcon className="w-[18px] h-[18px]" /></button>
      </div>
      <div className="flex-1 px-[20px] overflow-y-auto">
        <EditorContent editor={editor} />
      </div>

      {/* Modern custom modal for Links and Images */}
      <AnimatePresence>
        {modalType && (
          <div className="absolute inset-0 z-50 bg-black/45 backdrop-blur-xs flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-editorial-bg border border-editorial-border p-6 max-w-sm w-full shadow-xl"
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-serif text-lg font-bold text-editorial-text">
                  {modalType === 'link' ? 'Insert Link' : 'Insert Image'}
                </h3>
                <button
                  type="button"
                  onClick={() => setModalType(null)}
                  className="text-editorial-muted hover:text-editorial-text"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleModalSubmit}>
                <div className="mb-4">
                  <label className="block text-[10px] font-bold uppercase tracking-[1px] text-editorial-muted mb-2">
                    {modalType === 'link' ? 'URL (e.g., https://google.com)' : 'Image URL (e.g., https://unsplash.com/...)'}
                  </label>
                  <input
                    type="url"
                    value={urlInput}
                    onChange={(e) => setUrlInput(e.target.value)}
                    placeholder="https://"
                    className="w-full bg-editorial-panel border border-editorial-border px-3 py-2 text-sm text-editorial-text focus:outline-none focus:border-editorial-accent"
                    required
                    autoFocus
                  />
                </div>

                <div className="flex justify-between items-center pt-2">
                  {modalType === 'link' && editor.isActive('link') ? (
                    <button
                      type="button"
                      onClick={removeLink}
                      className="text-xs text-red-500 font-bold hover:underline"
                    >
                      Unlink
                    </button>
                  ) : <div />}
                  
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setModalType(null)}
                      className="px-3 py-1.5 text-xs text-editorial-text hover:bg-editorial-active uppercase tracking-[0.5px] font-bold"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="bg-editorial-text text-editorial-bg px-4 py-1.5 text-xs uppercase tracking-[0.5px] font-bold hover:opacity-90"
                    >
                      Insert
                    </button>
                  </div>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
