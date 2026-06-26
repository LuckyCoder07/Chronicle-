import { useState } from 'react';
import { subscribeEmail } from '../lib/db';

export function Newsletter() {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setLoading(true);
      setError('');
      try {
        await subscribeEmail(email);
        setSubscribed(true);
        setEmail('');
      } catch (err) {
        console.error("Subscription error:", err);
        setError("Something went wrong. Please try again.");
      } finally {
        setLoading(false);
      }
    }
  };

  if (subscribed) {
    return (
      <div className="bg-editorial-panel p-[30px] md:p-[40px] border border-editorial-border text-center flex flex-col items-center justify-center min-h-[200px]">
        <div className="w-12 h-12 rounded-full bg-editorial-active flex items-center justify-center mb-4 text-editorial-text">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
        </div>
        <h3 className="font-serif font-bold text-[20px] text-editorial-text mb-2">You're Subscribed!</h3>
        <p className="text-[14px] text-editorial-muted">
          Thank you for joining our newsletter. Expect great content soon.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-editorial-panel p-[30px] md:p-[40px] border border-editorial-border text-center">
      <h3 className="font-serif font-bold text-[24px] text-editorial-text mb-3">Subscribe to Chronicle</h3>
      <p className="text-[14px] text-editorial-muted mb-6 max-w-md mx-auto leading-relaxed">
        Get the latest posts delivered right to your inbox. No spam, ever.
      </p>
      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
        <input 
          type="email" 
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Your email address" 
          required
          disabled={loading}
          className="flex-1 bg-editorial-panel border border-editorial-border px-4 py-3 text-[14px] outline-none focus:border-editorial-text transition-colors placeholder:text-editorial-muted/50 font-sans disabled:opacity-50" 
        />
        <button 
          type="submit"
          disabled={loading}
          className="bg-editorial-text text-editorial-bg text-[12px] font-bold uppercase tracking-[1px] px-8 py-3 hover:bg-opacity-90 transition-opacity whitespace-nowrap disabled:opacity-50 flex items-center justify-center min-w-[120px]"
        >
          {loading ? "Subscribing..." : "Subscribe"}
        </button>
      </form>
      {error && (
        <p className="text-[12px] text-red-500 mt-3 font-sans">{error}</p>
      )}
    </div>
  );
}

export function SidebarNewsletter() {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setLoading(true);
      setError('');
      try {
        await subscribeEmail(email);
        setSubscribed(true);
        setEmail('');
      } catch (err) {
        console.error("Subscription error:", err);
        setError("Failed to subscribe.");
      } finally {
        setLoading(false);
      }
    }
  };

  if (subscribed) {
    return (
      <div className="bg-editorial-panel p-[30px] border-t border-b border-editorial-border text-center flex flex-col items-center justify-center min-h-[200px]">
        <div className="w-10 h-10 rounded-full bg-editorial-active flex items-center justify-center mb-4 text-editorial-text">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
        </div>
        <h3 className="font-serif font-bold text-[16px] text-editorial-text mb-2">Subscribed!</h3>
      </div>
    );
  }

  return (
    <div className="bg-editorial-panel p-[30px] border-t border-b border-editorial-border mt-10">
      <h3 className="font-serif font-bold text-[18px] text-editorial-text mb-3">Subscribe</h3>
      <p className="text-[13px] text-editorial-muted mb-6 leading-relaxed">
        The latest stories, directly to your inbox.
      </p>
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <input 
          type="email" 
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email address" 
          required
          disabled={loading}
          className="w-full bg-editorial-panel border border-editorial-border px-3 py-3 text-[13px] outline-none focus:border-editorial-text transition-colors placeholder:text-editorial-muted/50 disabled:opacity-50" 
        />
        <button 
          type="submit"
          disabled={loading}
          className="w-full bg-editorial-text text-editorial-bg text-[11px] font-bold uppercase tracking-[1px] py-3 hover:bg-opacity-90 transition-opacity disabled:opacity-50"
        >
          {loading ? "Subscribing..." : "Subscribe"}
        </button>
      </form>
      {error && (
        <p className="text-[11px] text-red-500 mt-2 font-sans">{error}</p>
      )}
    </div>
  );
}
