import { geoArea, geoAzimuthalEqualArea, geoCentroid, geoDistance, geoPath } from 'd3-geo'
import type { Feature, MultiPolygon, Polygon, Position } from 'geojson'
import { feature } from 'topojson-client'
import type { GeometryCollection, Topology } from 'topojson-specification'
import type { Country } from './countries'

/** Countries smaller than this (km²) are too small to recognise from their outline. */
export const MIN_SHAPE_AREA_KM2 = 20_000
/** Detached parts at least this fraction of the main landmass are always kept (e.g. Alaska). */
const KEEP_PART_AREA_RATIO = 0.2
/** Smaller detached parts are kept only if within this distance of a kept part (e.g. Corsica, Bioko). */
const KEEP_PART_DISTANCE_KM = 800
const EARTH_RADIUS_KM = 6371
const MAX_VERTEX_SAMPLES = 400

export type CountryFeature = Feature<Polygon | MultiPolygon>

export interface ShapeCountry {
  country: Country
  feature: CountryFeature
}

export type WorldTopology = Topology<{ countries: GeometryCollection }>

/** Maps world-atlas features (keyed by ISO numeric id) onto country metadata. */
export function matchShapes(
  topology: WorldTopology,
  countries: readonly Country[],
  minAreaKm2 = MIN_SHAPE_AREA_KM2,
): ShapeCountry[] {
  const collection = feature(topology, topology.objects.countries)
  const byId = new Map<string, CountryFeature>()
  for (const f of collection.features) {
    const type = f.geometry.type
    if (f.id === undefined || (type !== 'Polygon' && type !== 'MultiPolygon')) continue
    const id = String(f.id).padStart(3, '0')
    // Some ids are shared by a country and a minor territory (036: Australia and
    // Ashmore and Cartier Is.); the country is always the larger feature.
    const existing = byId.get(id)
    if (!existing || geoArea(f) > geoArea(existing)) byId.set(id, f as CountryFeature)
  }

  const result: ShapeCountry[] = []
  for (const country of countries) {
    if (!country.ccn3 || country.area < minAreaKm2) continue
    const f = byId.get(country.ccn3)
    if (f) result.push({ country, feature: mainLandmass(f) })
  }
  return result
}

function polygonsOf(f: CountryFeature): Position[][][] {
  return f.geometry.type === 'Polygon' ? [f.geometry.coordinates] : f.geometry.coordinates
}

function sampleVertices(rings: Position[][]): Position[] {
  const outer = rings[0] ?? []
  const step = Math.max(1, Math.floor(outer.length / MAX_VERTEX_SAMPLES))
  return outer.filter((_, i) => i % step === 0)
}

/**
 * Drops far-flung overseas parts (French Guiana, Hawaii, Canary Islands…) that
 * would shrink the recognisable mainland to a dot, while keeping large or
 * nearby parts (Alaska, Tasmania, Sicily, island archipelagos).
 */
export function mainLandmass(f: CountryFeature): CountryFeature {
  const polygons = polygonsOf(f)
  if (polygons.length <= 1) return f

  const parts = polygons
    .map((coords) => ({ coords, area: geoArea({ type: 'Polygon', coordinates: coords }) }))
    .sort((a, b) => b.area - a.area)
  const largest = parts[0]
  if (!largest) return f

  const maxRadians = KEEP_PART_DISTANCE_KM / EARTH_RADIUS_KM
  const kept = [largest]
  const keptSamples: Position[] = sampleVertices(largest.coords)

  for (const part of parts.slice(1)) {
    const center = geoCentroid({ type: 'Polygon', coordinates: part.coords }) as [number, number]
    const isLarge = part.area >= largest.area * KEEP_PART_AREA_RATIO
    const isNear = keptSamples.some((p) => geoDistance(center, p as [number, number]) <= maxRadians)
    if (isLarge || isNear) {
      kept.push(part)
      keptSamples.push(...sampleVertices(part.coords))
    }
  }

  return {
    ...f,
    geometry: { type: 'MultiPolygon', coordinates: kept.map((p) => p.coords) },
  }
}

/**
 * SVG path for a country, drawn with an equal-area projection centred on the
 * country itself and fitted to fill the given frame.
 */
export function countryPath(f: CountryFeature, width: number, height: number, padding = 8): string {
  const [lng, lat] = geoCentroid(f)
  const projection = geoAzimuthalEqualArea()
    .rotate([-lng, -lat])
    .fitExtent(
      [
        [padding, padding],
        [width - padding, height - padding],
      ],
      f,
    )
  return geoPath(projection)(f) ?? ''
}
