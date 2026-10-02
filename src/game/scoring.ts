export const CHOICE_POINTS = 100
export const CITY_MAX_POINTS = 1000
export const CITY_ZERO_KM = 2000

/** Points for a multiple-choice answer. */
export function choiceScore(isCorrect: boolean): number {
  return isCorrect ? CHOICE_POINTS : 0
}

/** 1000 points at 0 km, falling linearly to 0 at CITY_ZERO_KM or more. */
export function cityScore(distanceKm: number): number {
  if (!Number.isFinite(distanceKm) || distanceKm >= CITY_ZERO_KM) return 0
  const clamped = Math.max(0, distanceKm)
  return Math.round(CITY_MAX_POINTS * (1 - clamped / CITY_ZERO_KM))
}
