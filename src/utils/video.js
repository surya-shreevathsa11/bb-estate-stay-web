import droneSampleVideo from '../assets/Drone(sample).mp4'

const HERO_VIDEO_ASSETS = {
  desktop: droneSampleVideo,
  mobile: droneSampleVideo,
  poster: '',
}

export function getHeroVideoSources(isMobile) {
  return {
    src: isMobile ? HERO_VIDEO_ASSETS.mobile : HERO_VIDEO_ASSETS.desktop,
    poster: HERO_VIDEO_ASSETS.poster,
  }
}

export { HERO_VIDEO_ASSETS }
