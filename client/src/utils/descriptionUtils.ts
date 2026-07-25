/**
 * Checks if a task description contains more than two sentences or is long enough to warrant a "See full description" toggle.
 * A sentence ends with standard sentence punctuation (. ! ?) followed by space or end-of-string, or line breaks.
 */
export const hasMoreThanTwoSentences = (description?: string): boolean => {
  if (!description) return false;
  const trimmed = description.trim();
  if (!trimmed) return false;

  // Split by sentence terminators (. ! ? \n)
  const sentences = trimmed
    .split(/(?:[.!?]+(?:\s+|$))|\n+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0);

  // Return true if sentence count > 2 or overall character length > 120
  return sentences.length > 2 || trimmed.length > 120;
};
