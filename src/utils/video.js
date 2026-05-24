const HERO_VIDEO_ASSETS = {
  desktop: '/drone-hero.mp4',
  mobile: '/drone-hero.mp4',
  poster: '/og-bbestatestay.jpeg',
}

export function getHeroVideoSources(isMobile) {
  return {
    src: isMobile ? HERO_VIDEO_ASSETS.mobile : HERO_VIDEO_ASSETS.desktop,
    poster: HERO_VIDEO_ASSETS.poster,
  }
}

export { HERO_VIDEO_ASSETS }
