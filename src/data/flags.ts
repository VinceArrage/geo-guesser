// URLs of flag-icons SVGs (4:3), keyed by lowercase ISO alpha-2 code.
const modules = import.meta.glob<string>('../../node_modules/flag-icons/flags/4x3/*.svg', {
  eager: true,
  query: '?url',
  import: 'default',
})

const FLAG_URLS = new Map<string, string>()
for (const [path, url] of Object.entries(modules)) {
  const code = /([a-z0-9-]+)\.svg$/.exec(path)?.[1]
  if (code) FLAG_URLS.set(code, url)
}

export function flagUrl(cca2: string): string | undefined {
  return FLAG_URLS.get(cca2.toLowerCase())
}

/** Starts downloading and decoding an image so it shows instantly later. */
export function preloadImage(url: string): void {
  const img = new Image()
  img.src = url
  img.decode().catch(() => {
    // Decoding can fail for detached images in some browsers; the fetch still warms the cache.
  })
}
