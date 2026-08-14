import { useEffect, useRef, useState } from 'react'
import type { MediaEmbed } from '../lib/mediaEmbeds'

type MediaEmbedFrameProps = {
  embed: MediaEmbed
}

type TwitterWidgets = {
  widgets: {
    createTweet: (
      id: string,
      el: HTMLElement,
      opts?: Record<string, unknown>,
    ) => Promise<HTMLElement | undefined>
  }
}

declare global {
  interface Window {
    twttr?: TwitterWidgets
  }
}

let twitterScript: Promise<TwitterWidgets> | null = null

function loadTwitterWidgets(): Promise<TwitterWidgets> {
  if (window.twttr?.widgets) return Promise.resolve(window.twttr)
  if (twitterScript) return twitterScript

  twitterScript = new Promise((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>('script[data-twitter-wjs]')
    if (existing) {
      const wait = () => {
        if (window.twttr?.widgets) resolve(window.twttr)
        else window.setTimeout(wait, 50)
      }
      wait()
      return
    }

    const script = document.createElement('script')
    script.src = 'https://platform.twitter.com/widgets.js'
    script.async = true
    script.dataset.twitterWjs = 'true'
    script.onload = () => {
      if (window.twttr?.widgets) resolve(window.twttr)
      else reject(new Error('Twitter widgets unavailable'))
    }
    script.onerror = () => reject(new Error('Falha ao carregar o embed do X'))
    document.body.appendChild(script)
  })

  return twitterScript
}

function TweetEmbed({ embed }: { embed: MediaEmbed }) {
  const mountRef = useRef<HTMLDivElement>(null)
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    const node = mountRef.current
    const id = embed.tweetId
    if (!node || !id) return

    let cancelled = false
    node.replaceChildren()

    void loadTwitterWidgets()
      .then((twttr) => {
        if (cancelled || !mountRef.current) return
        return twttr.widgets.createTweet(id, mountRef.current, {
          theme: 'dark',
          dnt: true,
          lang: 'pt',
          align: 'center',
          width: '100%',
        })
      })
      .then((created) => {
        if (cancelled) return
        if (!created) setFailed(true)
      })
      .catch(() => {
        if (!cancelled) setFailed(true)
      })

    return () => {
      cancelled = true
    }
  }, [embed.tweetId])

  if (failed) {
    return (
      <a
        href={embed.originalUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="media-embed-fallback"
      >
        Abrir post no X
      </a>
    )
  }

  return <div ref={mountRef} className="media-embed-tweet" />
}

export function MediaEmbedFrame({ embed }: MediaEmbedFrameProps) {
  return (
    <figure className={`media-embed media-embed--${embed.kind}`}>
      {embed.kind === 'tweet' ? (
        <TweetEmbed embed={embed} />
      ) : (
        <div className="media-embed-frame">
          <iframe
            src={embed.src}
            title={`Conteúdo de ${embed.provider}`}
            loading="lazy"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
            allowFullScreen
            referrerPolicy="strict-origin-when-cross-origin"
          />
        </div>
      )}
      <figcaption>
        <a href={embed.originalUrl} target="_blank" rel="noopener noreferrer">
          Abrir no {embed.provider}
        </a>
      </figcaption>
    </figure>
  )
}
