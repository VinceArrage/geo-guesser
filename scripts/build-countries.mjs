// Trims the mledoze/countries dataset (npm: world-countries) into src/data/countries.json.
// Run with `npm run data:countries` after upgrading world-countries.
import { writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import countries from 'world-countries'

const trimmed = countries
  .filter((c) => c.independent === true || c.unMember === true)
  .map((c) => ({
    name: c.name.common,
    cca2: c.cca2,
    ccn3: c.ccn3 || null,
    region: c.region,
    subregion: c.subregion || c.region,
    latlng: c.latlng,
    area: c.area,
  }))
  .sort((a, b) => a.name.localeCompare(b.name))

const out = fileURLToPath(new URL('../src/data/countries.json', import.meta.url))
writeFileSync(out, JSON.stringify(trimmed, null, 0).replace(/},{/g, '},\n{') + '\n')
console.log(`Wrote ${trimmed.length} countries to ${out}`)
