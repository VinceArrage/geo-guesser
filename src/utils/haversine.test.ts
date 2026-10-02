import { describe, expect, it } from 'vitest'
import { haversineKm } from './haversine'

describe('haversineKm', () => {
  it('is zero for identical points', () => {
    expect(haversineKm({ lat: 48.8566, lng: 2.3522 }, { lat: 48.8566, lng: 2.3522 })).toBe(0)
  })

  it('matches known city distances', () => {
    const paris = { lat: 48.8566, lng: 2.3522 }
    const london = { lat: 51.5074, lng: -0.1278 }
    const newYork = { lat: 40.7128, lng: -74.006 }
    const sydney = { lat: -33.8688, lng: 151.2093 }
    expect(haversineKm(paris, london)).toBeCloseTo(344, -1)
    expect(haversineKm(london, newYork)).toBeCloseTo(5570, -1)
    expect(haversineKm(london, sydney)).toBeCloseTo(16990, -2)
  })

  it('is symmetric', () => {
    const a = { lat: 35.6762, lng: 139.6503 }
    const b = { lat: -23.5505, lng: -46.6333 }
    expect(haversineKm(a, b)).toBeCloseTo(haversineKm(b, a), 9)
  })

  it('handles the antimeridian and antipodes', () => {
    expect(haversineKm({ lat: 0, lng: 179.5 }, { lat: 0, lng: -179.5 })).toBeCloseTo(111.2, 0)
    expect(haversineKm({ lat: 0, lng: 0 }, { lat: 0, lng: 180 })).toBeCloseTo(Math.PI * 6371, 3)
  })
})
