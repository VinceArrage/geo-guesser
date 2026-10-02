import { geoArea } from 'd3-geo'
import { describe, expect, it } from 'vitest'
import atlas from 'world-atlas/countries-50m.json'
import { COUNTRIES } from './countries'
import { MIN_SHAPE_AREA_KM2, countryPath, mainLandmass, matchShapes, type CountryFeature, type WorldTopology } from './shapes'

const topology = atlas as unknown as WorldTopology
const shapes = matchShapes(topology, COUNTRIES)
const byCode = new Map(shapes.map((s) => [s.country.cca2, s]))

function partCount(f: CountryFeature) {
  return f.geometry.type === 'Polygon' ? 1 : f.geometry.coordinates.length
}

describe('matchShapes', () => {
  it('maps ISO numeric codes to the right world-atlas features', () => {
    const expected: Record<string, string> = {
      FR: 'France',
      DE: 'Germany',
      BR: 'Brazil',
      US: 'United States of America',
      AU: 'Australia',
      JP: 'Japan',
      ZA: 'South Africa',
      AF: 'Afghanistan',
    }
    for (const [code, name] of Object.entries(expected)) {
      expect(byCode.get(code)?.feature.properties?.name).toBe(name)
    }
  })

  it('finds a shape for every country above the size threshold', () => {
    const missing = COUNTRIES.filter((c) => c.area >= MIN_SHAPE_AREA_KM2 && !byCode.has(c.cca2)).map((c) => c.name)
    expect(missing).toEqual([])
  })

  it('skips countries below the size threshold', () => {
    for (const s of shapes) expect(s.country.area).toBeGreaterThanOrEqual(MIN_SHAPE_AREA_KM2)
    for (const tiny of ['VA', 'MC', 'SG', 'MT', 'LU']) expect(byCode.has(tiny)).toBe(false)
    expect(shapes.length).toBeGreaterThan(140)
  })
})

describe('mainLandmass', () => {
  const raw = (code: string) => {
    const c = COUNTRIES.find((x) => x.cca2 === code)
    const f = matchShapes(topology, COUNTRIES, 0).find((s) => s.country === c)
    if (!f) throw new Error(`No shape for ${code}`)
    return f.feature
  }

  it('drops distant overseas territories but keeps the mainland', () => {
    const france = byCode.get('FR')?.feature
    if (!france) throw new Error('France missing')
    // French Guiana (~53°W) is gone; Corsica stays.
    const lngs = (france.geometry as { coordinates: number[][][][] }).coordinates.flat(2).map((p) => p[0] as number)
    expect(Math.min(...lngs)).toBeGreaterThan(-10)
    expect(geoArea(france)).toBeGreaterThan(0)
  })

  it('shows the contiguous USA without Hawaii', () => {
    const usa = byCode.get('US')?.feature
    if (!usa) throw new Error('USA missing')
    const lats = (usa.geometry as { coordinates: number[][][][] }).coordinates.flat(2).map((p) => p[1] as number)
    expect(Math.min(...lats)).toBeGreaterThan(23)
  })

  it('keeps detached parts that are large relative to the mainland', () => {
    const square = (lng: number, size: number) => [
      [
        [lng, 0],
        [lng, size],
        [lng + size, size],
        [lng + size, 0],
        [lng, 0],
      ],
    ]
    const f: CountryFeature = {
      type: 'Feature',
      properties: {},
      geometry: { type: 'MultiPolygon', coordinates: [square(0, 10), square(100, 5), square(-100, 1)] },
    }
    // The 5° square is 25% of the main one and kept despite the distance; the 1° one is dropped.
    expect(partCount(mainLandmass(f))).toBe(2)
  })

  it('leaves single-polygon countries untouched', () => {
    const f = raw('BO')
    expect(f.geometry.type).toBe('Polygon')
    expect(mainLandmass(f)).toBe(f)
  })

  it('keeps nearby islands of archipelagos', () => {
    expect(partCount(byCode.get('ID')?.feature as CountryFeature)).toBeGreaterThan(50)
    expect(partCount(byCode.get('JP')?.feature as CountryFeature)).toBeGreaterThan(4)
  })
})

describe('countryPath', () => {
  it('produces a path that fills the frame', () => {
    const f = byCode.get('IT')?.feature
    if (!f) throw new Error('Italy missing')
    const d = countryPath(f, 400, 300, 10)
    expect(d.startsWith('M')).toBe(true)
    const nums = (d.match(/-?\d+(\.\d+)?/g) ?? []).map(Number)
    const xs = nums.filter((_, i) => i % 2 === 0)
    const ys = nums.filter((_, i) => i % 2 === 1)
    expect(Math.min(...xs)).toBeGreaterThanOrEqual(9)
    expect(Math.max(...ys)).toBeLessThanOrEqual(291)
    // Fitted: one dimension reaches the padded edge.
    const spansWidth = Math.max(...xs) - Math.min(...xs) > 370
    const spansHeight = Math.max(...ys) - Math.min(...ys) > 270
    expect(spansWidth || spansHeight).toBe(true)
  })

  it('renders every eligible country without errors', () => {
    for (const s of shapes) expect(countryPath(s.feature, 400, 300).length).toBeGreaterThan(20)
  })
})
