import rawCountries from '../data/countries.json'
import type { ChoiceOptions } from './choices'

export interface Country {
  name: string
  /** ISO 3166-1 alpha-2 code. */
  cca2: string
  /** ISO 3166-1 numeric code as a zero-padded string, matching world-atlas feature ids. */
  ccn3: string | null
  region: string
  subregion: string
  latlng: number[]
  /** Land area in km². */
  area: number
}

export const COUNTRIES: readonly Country[] = rawCountries

export const countryChoiceOptions: ChoiceOptions<Country> = {
  key: (c) => c.cca2,
  groups: [(c) => c.subregion, (c) => c.region],
}
