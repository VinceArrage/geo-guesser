import 'leaflet/dist/leaflet.css'
import type { LatLngBoundsExpression, LatLngTuple } from 'leaflet'
import { useEffect } from 'react'
import { CircleMarker, MapContainer, Polyline, TileLayer, useMap, useMapEvents } from 'react-leaflet'
import { nearestCopy } from '../game/cities'
import type { CityReveal } from '../hooks/useCityRound'
import type { LatLng } from '../utils/haversine'

// Esri's label-free light gray basemap (borders and coastlines only), so city names aren't given away.
// Keyless label-free OpenStreetMap styles (CARTO *_nolabels, Stadia) now require an API key.
const TILE_URL =
  'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}'
const ATTRIBUTION = 'Tiles &copy; <a href="https://www.esri.com/">Esri</a> &mdash; Esri, HERE, Garmin'

const WORLD_BOUNDS: LatLngBoundsExpression = [
  [-56, -170],
  [74, 190],
]

const toTuple = (p: LatLng): LatLngTuple => [p.lat, p.lng]

interface CityMapProps {
  reveal: CityReveal | null
  /** Changes whenever a new city is shown; the view resets to the whole world. */
  questionId: number
  onGuess: (point: LatLng) => void
}

export function CityMap({ reveal, questionId, onGuess }: CityMapProps) {
  // The answer is drawn on the copy of the world nearest the guess, so the line takes the short way round.
  const answer = reveal ? nearestCopy(reveal.guess, reveal.city) : null

  return (
    <MapContainer
      className="city-map"
      bounds={WORLD_BOUNDS}
      zoomSnap={0.25}
      minZoom={0}
      maxZoom={10}
      doubleClickZoom={false}
      attributionControl
    >
      <TileLayer url={TILE_URL} attribution={ATTRIBUTION} maxNativeZoom={16} />
      <GuessHandler onGuess={onGuess} />
      <ViewController questionId={questionId} reveal={reveal} />
      {reveal && answer && (
        <>
          <Polyline positions={[toTuple(reveal.guess), toTuple(answer)]} pathOptions={{ color: '#1b2230', weight: 2, dashArray: '6 6' }} />
          <CircleMarker center={toTuple(reveal.guess)} radius={7} pathOptions={{ color: '#fff', weight: 2, fillColor: '#2f6fde', fillOpacity: 1 }} />
          <CircleMarker center={toTuple(answer)} radius={8} pathOptions={{ color: '#fff', weight: 2, fillColor: '#1f9d55', fillOpacity: 1 }} />
        </>
      )}
    </MapContainer>
  )
}

function GuessHandler({ onGuess }: { onGuess: (point: LatLng) => void }) {
  useMapEvents({
    click(e) {
      onGuess({ lat: e.latlng.lat, lng: e.latlng.lng })
    },
  })
  return null
}

function ViewController({ questionId, reveal }: { questionId: number; reveal: CityReveal | null }) {
  const map = useMap()

  // New city: back to the whole world.
  useEffect(() => {
    map.fitBounds(WORLD_BOUNDS, { animate: false })
  }, [map, questionId])

  // Leaflet only tracks window resizes; also refit when the container itself
  // changes size (layout breakpoints, phone rotation).
  useEffect(() => {
    const observer = new ResizeObserver(() => {
      map.invalidateSize({ animate: false })
      map.fitBounds(WORLD_BOUNDS, { animate: false })
    })
    observer.observe(map.getContainer())
    return () => observer.disconnect()
  }, [map])

  // Guess made: frame both the guess and the answer. Instant rather than animated,
  // so the whole 1s reveal is spent showing the result.
  useEffect(() => {
    if (!reveal) return
    const answer = nearestCopy(reveal.guess, reveal.city)
    map.fitBounds([toTuple(reveal.guess), toTuple(answer)], { padding: [48, 48], maxZoom: 6, animate: false })
  }, [map, reveal])

  return null
}
