/**
 * Keyword search in transcript
 */

import type { WordTimestamp } from './runWhisper';

export interface SearchResult {
  wordIndex: number;
  word: WordTimestamp;
  context: string; // Surrounding words
  timestamp: number;
}

/**
 * Search for keyword in transcript
 */
export function searchKeyword(
  keyword: string,
  words: WordTimestamp[],
  contextWords: number = 5
): SearchResult[] {
  const results: SearchResult[] = [];
  const searchTerm = keyword.toLowerCase().replace(/[^a-z0-9]/g, '');

  words.forEach((word, index) => {
    const wordClean = word.word.toLowerCase().replace(/[^a-z0-9]/g, '');
    
    if (wordClean.includes(searchTerm)) {
      // Get context (words before and after)
      const start = Math.max(0, index - contextWords);
      const end = Math.min(words.length, index + contextWords + 1);
      const contextWords_ = words.slice(start, end);
      const context = contextWords_.map(w => w.word).join(' ');

      results.push({
        wordIndex: index,
        word,
        context,
        timestamp: word.start,
      });
    }
  });

  return results;
}

/**
 * Search multiple keywords
 */
export function searchMultipleKeywords(
  keywords: string[],
  words: WordTimestamp[]
): Map<string, SearchResult[]> {
  const results = new Map<string, SearchResult[]>();

  for (const keyword of keywords) {
    results.set(keyword, searchKeyword(keyword, words));
  }

  return results;
}

