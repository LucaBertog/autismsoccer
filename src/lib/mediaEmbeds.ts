export type MediaEmbedKind = 'video' | 'portrait' | 'tweet' | 'audio' | 'spotify'

export type MediaEmbed = {
  provider: string
  kind: MediaEmbedKind
  src: string
  originalUrl: string
  tweetId?: string
}

const NON_CHANNEL_TWITCH = new Set([
  'videos',
  'directory',
  'downloads',
  'settings',
  'friends',
  'subscriptions',
  'inventory',
  'drops',
  'wallet',
  'search',
  'clips',
  'clip',
  'turbo',
  'prime',
  'p',
  'popout',
  'embed',
  'login',
  'signup',
  'jobs',
])

function parseHttpUrl(raw: string): URL | null {
  try {
    const url = new URL(raw.trim())
    if (url.protocol !== 'http:' && url.protocol !== 'https:') return null
    return url
  } catch {
    return null
  }
}

function hostOf(url: URL): string {
  return url.hostname.replace(/^www\./, '').toLowerCase()
}

function youtubeStartSeconds(url: URL): number | null {
  const raw = url.searchParams.get('t') ?? url.searchParams.get('start') ?? url.hash.match(/t=([^&]+)/)?.[1]
  if (!raw) return null
  if (/^\d+$/.test(raw)) return Number(raw)
  const match = raw.match(/^(?:(\d+)h)?(?:(\d+)m)?(?:(\d+)s)?$/i)
  if (!match) return null
  const hours = Number(match[1] ?? 0)
  const minutes = Number(match[2] ?? 0)
  const seconds = Number(match[3] ?? 0)
  const total = hours * 3600 + minutes * 60 + seconds
  return total > 0 ? total : null
}

function youtubeEmbed(videoId: string, original: URL, kind: MediaEmbedKind = 'video'): MediaEmbed {
  const src = new URL(`https://www.youtube-nocookie.com/embed/${videoId}`)
  src.searchParams.set('rel', '0')
  src.searchParams.set('modestbranding', '1')
  const start = youtubeStartSeconds(original)
  if (start) src.searchParams.set('start', String(start))
  return {
    provider: 'YouTube',
    kind,
    src: src.toString(),
    originalUrl: original.toString(),
  }
}

function twitchParent(): string {
  if (typeof window === 'undefined') return 'localhost'
  return window.location.hostname || 'localhost'
}

function twitchPlayer(params: Record<string, string>, original: URL): MediaEmbed {
  const src = new URL('https://player.twitch.tv/')
  for (const [key, value] of Object.entries(params)) src.searchParams.set(key, value)
  src.searchParams.set('parent', twitchParent())
  src.searchParams.set('autoplay', 'false')
  return {
    provider: 'Twitch',
    kind: 'video',
    src: src.toString(),
    originalUrl: original.toString(),
  }
}

function twitchClip(slug: string, original: URL): MediaEmbed {
  const src = new URL('https://clips.twitch.tv/embed')
  src.searchParams.set('clip', slug)
  src.searchParams.set('parent', twitchParent())
  src.searchParams.set('autoplay', 'false')
  return {
    provider: 'Twitch',
    kind: 'video',
    src: src.toString(),
    originalUrl: original.toString(),
  }
}

export function getMediaEmbed(rawUrl: string): MediaEmbed | null {
  const url = parseHttpUrl(rawUrl)
  if (!url) return null
  const host = hostOf(url)
  const path = url.pathname.replace(/\/+$/, '') || '/'

  if (host === 'youtu.be' || host === 'youtube.com' || host === 'm.youtube.com' || host === 'music.youtube.com' || host === 'youtube-nocookie.com') {
    const shorts = path.match(/^\/shorts\/([a-zA-Z0-9_-]{11})$/)
    if (shorts) return youtubeEmbed(shorts[1], url, 'portrait')

    const live = path.match(/^\/live\/([a-zA-Z0-9_-]{11})$/)
    if (live) return youtubeEmbed(live[1], url)

    const embed = path.match(/^\/embed\/([a-zA-Z0-9_-]{11})$/)
    if (embed) return youtubeEmbed(embed[1], url)

    const shortHost = path.match(/^\/([a-zA-Z0-9_-]{11})$/)
    if (host === 'youtu.be' && shortHost) return youtubeEmbed(shortHost[1], url)

    const videoId = url.searchParams.get('v')
    if (videoId && /^[a-zA-Z0-9_-]{11}$/.test(videoId)) return youtubeEmbed(videoId, url)

    const list = url.searchParams.get('list')
    if (list) {
      const src = new URL('https://www.youtube-nocookie.com/embed/videoseries')
      src.searchParams.set('list', list)
      src.searchParams.set('rel', '0')
      return {
        provider: 'YouTube',
        kind: 'video',
        src: src.toString(),
        originalUrl: url.toString(),
      }
    }
    return null
  }

  if (host === 'twitch.tv' || host === 'm.twitch.tv' || host === 'clips.twitch.tv') {
    if (host === 'clips.twitch.tv') {
      const slug = path.split('/').filter(Boolean)[0]
      if (slug && slug !== 'embed') return twitchClip(slug, url)
      return null
    }

    const video = path.match(/^\/videos\/(\d+)$/)
    if (video) return twitchPlayer({ video: video[1] }, url)

    const clip = path.match(/^\/[^/]+\/clip\/([A-Za-z0-9_-]+)$/)
    if (clip) return twitchClip(clip[1], url)

    const channel = path.match(/^\/([A-Za-z0-9_]{4,25})$/)
    if (channel && !NON_CHANNEL_TWITCH.has(channel[1].toLowerCase())) {
      return twitchPlayer({ channel: channel[1] }, url)
    }
    return null
  }

  if (
    host === 'x.com' ||
    host === 'twitter.com' ||
    host === 'mobile.twitter.com' ||
    host === 'fxtwitter.com' ||
    host === 'vxtwitter.com' ||
    host === 'fixupx.com'
  ) {
    const tweet = path.match(/\/status(?:es)?\/(\d+)/)
    if (!tweet) return null
    return {
      provider: 'X',
      kind: 'tweet',
      src: `https://twitter.com/i/status/${tweet[1]}`,
      originalUrl: url.toString(),
      tweetId: tweet[1],
    }
  }

  if (host === 'instagram.com' || host === 'instagr.am') {
    const post = path.match(/^\/(p|reel|reels)\/([A-Za-z0-9_-]+)/)
    if (!post) return null
    const type = post[1] === 'p' ? 'p' : 'reel'
    return {
      provider: 'Instagram',
      kind: 'portrait',
      src: `https://www.instagram.com/${type}/${post[2]}/embed`,
      originalUrl: url.toString(),
    }
  }

  if (host === 'tiktok.com' || host === 'm.tiktok.com' || host === 'vm.tiktok.com') {
    const video = path.match(/\/video\/(\d+)/)
    if (!video) return null
    return {
      provider: 'TikTok',
      kind: 'portrait',
      src: `https://www.tiktok.com/player/v1/${video[1]}`,
      originalUrl: url.toString(),
    }
  }

  if (host === 'open.spotify.com') {
    const match = path.match(/^\/(track|album|playlist|episode|show)\/([A-Za-z0-9]+)/)
    if (!match) return null
    const kind: MediaEmbedKind = match[1] === 'track' || match[1] === 'episode' ? 'audio' : 'spotify'
    return {
      provider: 'Spotify',
      kind,
      src: `https://open.spotify.com/embed/${match[1]}/${match[2]}?theme=0`,
      originalUrl: url.toString(),
    }
  }

  if (host === 'vimeo.com' || host === 'player.vimeo.com') {
    const id = path.match(/^\/(?:video\/)?(\d+)$/)
    if (!id) return null
    return {
      provider: 'Vimeo',
      kind: 'video',
      src: `https://player.vimeo.com/video/${id[1]}`,
      originalUrl: url.toString(),
    }
  }

  if (host === 'streamable.com') {
    const code = path.match(/^\/(?:e\/|o\/)?([a-zA-Z0-9]+)$/)
    if (!code || code[1] === 'e' || code[1] === 'o') return null
    return {
      provider: 'Streamable',
      kind: 'video',
      src: `https://streamable.com/e/${code[1]}`,
      originalUrl: url.toString(),
    }
  }

  if (host === 'kick.com') {
    const channel = path.match(/^\/([A-Za-z0-9_]{3,25})$/)
    if (!channel) return null
    return {
      provider: 'Kick',
      kind: 'video',
      src: `https://player.kick.com/${channel[1]}`,
      originalUrl: url.toString(),
    }
  }

  return null
}

const BARE_URL = /^https?:\/\/[^\s<>]+$/i

export function standaloneUrlFromElement(el: Element): string | null {
  const links = el.querySelectorAll('a[href]')
  if (links.length === 1) {
    const extra = Array.from(el.childNodes).some((node) => {
      if (node === links[0] || links[0].contains(node)) return false
      if (node.nodeType === Node.TEXT_NODE) return Boolean(node.textContent?.trim())
      if (node.nodeType === Node.ELEMENT_NODE) {
        const tag = (node as Element).tagName.toLowerCase()
        return tag !== 'br'
      }
      return false
    })
    if (!extra) {
      const href = links[0].getAttribute('href')
      return href && getMediaEmbed(href) ? href : null
    }
  }

  if (links.length > 0) return null
  const text = (el.textContent ?? '').trim()
  if (!BARE_URL.test(text)) return null
  const cleaned = text.replace(/[),.;!?]+$/, '')
  return getMediaEmbed(cleaned) ? cleaned : null
}
