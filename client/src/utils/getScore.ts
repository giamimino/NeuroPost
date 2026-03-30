function getScore(id: number, wordData: any) {
  let score = 0;
  if (wordData[id].title) score += 3;
  if (wordData[id].description) score += 1;
  return score;
}

export { getScore };
