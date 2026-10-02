import { describe, expect, it } from 'vitest'
import { CITIES, CITY_CORRECT_KM, nearestCopy, scoreCityGuess } from './cities'

describe('city data', () => {
  it('has roughly 150 unique, valid cities', () => {
    expect(CITIES.length).toBeGreaterThanOrEqual(130)
    expect(CITIES.length).toBeLessThanOrEqual(200)
    const keys = new Set(CITIES.map((c) => `${c.name}|${c.country}`))
    expect(keys.size).toBe(CITIES.length)
    for (const c of CITIES) {
      expect(c.name).not.toBe('')
      expect(c.country).not.toBe('')
      expect(Math.abs(c.lat)).toBeLessThanOrEqual(90)
      expect(Math.abs(c.lng)).toBeLessThanOrEqual(180)
    }
  })

  it('covers every inhabited continent', () => {
    const inBox = (latMin: number, latMax: number, lngMin: number, lngMax: number) =>
      CITIES.some((c) => c.lat >= latMin && c.lat <= latMax && c.lng >= lngMin && c.lng <= lngMax)
    expect(inBox(15, 70, -170, -50)).toBe(true) // North America
    expect(inBox(-56, 12, -82, -34)).toBe(true) // South America
    expect(inBox(35, 70, -25, 40)).toBe(true) // Europe
    expect(inBox(-35, 37, -18, 52)).toBe(true) // Africa
    expect(inBox(0, 55, 60, 146)).toBe(true) // Asia
    expect(inBox(-47, -10, 112, 180)).toBe(true) // Oceania
  })
})

describe('scoreCityGuess', () => {
  const paris = { lat: 48.86, lng: 2.35 }

  it('gives full points for an exact guess', () => {
    expect(scoreCityGuess(paris, paris)).toEqual({ distanceKm: 0, points: 1000, isCorrect: true })
  })

  it('scores by haversine distance', () => {
    const london = { lat: 51.51, lng: -0.13 }
    const r = scoreCityGuess(london, paris)
    expect(r.distanceKm).toBeCloseTo(344, -1)
    expect(r.points).toBe(Math.round(1000 * (1 - r.distanceKm / 2000)))
    expect(r.isCorrect).toBe(true)
  })

  it('marks far guesses incorrect and scores 0 beyond 2000 km', () => {
    const r = scoreCityGuess({ lat: 40.71, lng: -74.01 }, paris)
    expect(r.points).toBe(0)
    expect(r.isCorrect).toBe(false)
    expect(scoreCityGuess({ lat: 48.86, lng: 2.35 + 7 }, paris).distanceKm).toBeGreaterThan(CITY_CORRECT_KM)
  })
})

describe('wrapped map copies', () => {
  it('scores a click on a repeated copy of the world the same as the original', () => {
    const suva = { lat: -18.14, lng: 178.44 }
    expect(scoreCityGuess({ lat: -18, lng: 178 - 360 }, suva).points).toBe(
      scoreCityGuess({ lat: -18, lng: 178 }, suva).points,
    )
  })

  it('picks the copy of a point that is closest across the antimeridian', () => {
    expect(nearestCopy({ lat: 0, lng: 175 }, { lat: -18, lng: -178 }).lng).toBe(182)
    expect(nearestCopy({ lat: 0, lng: -175 }, { lat: -18, lng: 178 }).lng).toBe(-182)
    expect(nearestCopy({ lat: 0, lng: 10 }, { lat: 0, lng: 20 }).lng).toBe(20)
  })
})
