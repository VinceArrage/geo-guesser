import rawCities from '../data/cities.json'
import { haversineKm, type LatLng } from '../utils/haversine'
import { cityScore } from './scoring'

export interface City extends LatLng {
  name: string
  country: string
}

export const CITIES: readonly City[] = rawCities

/** A city guess within this distance counts towards the round's "correct" total. */
export const CITY_CORRECT_KM = 500

export interface CityGuessResult {
  distanceKm: number
  points: number
  isCorrect: boolean
}

export function scoreCityGuess(guess: LatLng, city: LatLng): CityGuessResult {
  const distanceKm = haversineKm(guess, city)
  return { distanceKm, points: cityScore(distanceKm), isCorrect: distanceKm <= CITY_CORRECT_KM }
}

/**
 * Returns the copy of `target` (shifted by ±360° longitude) closest to `from`,
 * so a line drawn between them on a repeating map takes the short way round.
 */
export function nearestCopy(from: LatLng, target: LatLng): LatLng {
  let lng = target.lng
  while (lng - from.lng > 180) lng -= 360
  while (lng - from.lng < -180) lng += 360
  return { lat: target.lat, lng }
}
