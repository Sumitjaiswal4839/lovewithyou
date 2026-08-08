/**
 * lib/compatibility.ts
 * Real Hobby & Interest Intersection Compatibility Calculator
 * Calculates accurate chemistry matching scores instead of static random numbers.
 */

export function calculateCompatibility(
  userA: { hobbies?: string[]; interests?: string[] },
  userB: { hobbies?: string[]; interests?: string[] }
): number {
  const hobbiesA = [...(userA.hobbies || []), ...(userA.interests || [])];
  const hobbiesB = [...(userB.hobbies || []), ...(userB.interests || [])];

  if (hobbiesA.length === 0 || hobbiesB.length === 0) {
    return 75; // Default baseline baseline chemistry score
  }

  const setA = new Set(hobbiesA.map((h) => h.toLowerCase().trim()));
  const setB = new Set(hobbiesB.map((h) => h.toLowerCase().trim()));

  let commonCount = 0;
  setA.forEach((hobby) => {
    if (setB.has(hobby)) {
      commonCount++;
    }
  });

  // Base score 65% + 10% per matching common hobby
  const score = 65 + commonCount * 10;

  // Cap max score at 99%
  return Math.min(score, 99);
}
