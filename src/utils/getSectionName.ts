export function getSectionName(wheels: {
  fl: boolean;
  fr: boolean;
  rl: boolean;
  rr: boolean;
}): string {
  const { fl, fr, rl, rr } = wheels;

  // 1. All
  if (fl && fr && rl && rr) return "All";

  // 2. Front
  if (fl && fr && !rl && !rr) return "Front";

  // 3. Rear
  if (!fl && !fr && rl && rr) return "Rear";

  // 4. Left
  if (fl && !fr && rl && !rr) return "Left";

  // 5. Right
  if (!fl && fr && !rl && rr) return "Right";

  // 6. Single corner
  if (fl && !fr && !rl && !rr) return "Front Left";
  if (!fl && fr && !rl && !rr) return "Front Right";
  if (!fl && !fr && rl && !rr) return "Rear Left";
  if (!fl && !fr && !rl && rr) return "Rear Right";

  // 7. Mixed
  return "Custom";
}
