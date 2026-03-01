export const calculatePriority = (note) => {
  let score = 0;

  if (note.isPinned) score += 5;
  if (note.tags?.length) score += note.tags.length;
  if (note.content?.length > 200) score += 2;

  return score;
};
