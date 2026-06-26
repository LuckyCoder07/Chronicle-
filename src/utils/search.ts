import { Post } from "../types";

/**
 * A client-side search utility to filter posts by title, content, author, or tags.
 * Supports tokenized queries and ranks results based on matching criteria.
 */
export function searchPosts(posts: Post[], query: string): Post[] {
  if (!query || !query.trim()) return posts;

  const searchTokens = query
    .toLowerCase()
    .split(/\s+/)
    .filter(token => token.length > 0);

  if (searchTokens.length === 0) return posts;

  return posts
    .map(post => {
      let score = 0;
      const titleLower = post.title.toLowerCase();
      const contentLower = post.content.toLowerCase();
      const authorLower = post.authorName.toLowerCase();
      const tagsLower = post.tags.map(t => t.toLowerCase());

      // Calculate matching score for each token
      for (const token of searchTokens) {
        // Exact matches in title have highest weight
        if (titleLower.includes(token)) {
          score += 10;
          if (titleLower.startsWith(token)) score += 5; // Start match bonus
        }

        // Tag matches have high weight
        if (tagsLower.some(tag => tag.includes(token))) {
          score += 8;
        }

        // Content matches have medium weight
        if (contentLower.includes(token)) {
          score += 3;
        }

        // Author name matches
        if (authorLower.includes(token)) {
          score += 5;
        }
      }

      return { post, score };
    })
    .filter(item => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .map(item => item.post);
}
