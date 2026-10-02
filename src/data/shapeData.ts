import { COUNTRIES } from '../game/countries'
import { countryPath, matchShapes, type ShapeCountry, type WorldTopology } from '../game/shapes'

export const SHAPE_WIDTH = 400
export const SHAPE_HEIGHT = 300

let loaded: ShapeCountry[] | null = null
let loading: Promise<ShapeCountry[]> | null = null
const pathCache = new Map<string, string>()

/** Loads the world-atlas TopoJSON (a separate ~750 KB chunk) once and matches it to countries. */
export function loadShapes(): Promise<ShapeCountry[]> {
  loading ??= import('world-atlas/countries-50m.json').then(
    (mod) => {
      loaded = matchShapes(mod.default as unknown as WorldTopology, COUNTRIES)
      return loaded
    },
    (err: unknown) => {
      loading = null // allow a retry
      throw err
    },
  )
  return loading
}

export function getLoadedShapes(): ShapeCountry[] | null {
  return loaded
}

/** Projected SVG path for a country, computed once and cached. */
export function shapePath(shape: ShapeCountry): string {
  const key = shape.country.cca2
  let d = pathCache.get(key)
  if (d === undefined) {
    d = countryPath(shape.feature, SHAPE_WIDTH, SHAPE_HEIGHT, 12)
    pathCache.set(key, d)
  }
  return d
}
