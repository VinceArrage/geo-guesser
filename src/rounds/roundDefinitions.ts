import { lazy } from 'react'
import { loadShapes } from '../data/shapeData'
import { ComingSoonRound } from './ComingSoonRound'
import { FlagRound } from './FlagRound'
import { ShapeRound } from './ShapeRound'
import type { RoundDefinition } from './types'

// Leaflet is only needed for the city round, so it lives in its own chunk.
const loadCityRound = () => import('./CityRound')
const CityRound = lazy(() => loadCityRound().then((m) => ({ default: m.CityRound })))

/** Rounds are played in this order. Add, remove or reorder entries here. */
export const ROUNDS: readonly RoundDefinition[] = [
  {
    id: 'flags',
    name: 'Flags',
    description: 'Name the country from its flag.',
    durationSeconds: 10,
    component: FlagRound,
  },
  {
    id: 'shapes',
    name: 'Shapes',
    description: 'Name the country from its outline.',
    durationSeconds: 10,
    component: ShapeRound,
    preload: loadShapes,
  },
  {
    id: 'cities',
    name: 'Cities',
    description: 'Find the city on the map. The closer, the more points.',
    durationSeconds: 60,
    component: CityRound,
    preload: loadCityRound,
  },
  {
    id: 'round-4',
    name: 'Round 4',
    description: 'A new challenge is on its way.',
    durationSeconds: 60,
    component: ComingSoonRound,
  },
]
