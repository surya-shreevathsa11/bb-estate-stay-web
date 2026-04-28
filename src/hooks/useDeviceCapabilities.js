import { useMemo } from 'react'

function detectCapabilities() {
  const reducedMotion = window.matchMedia(
    '(prefers-reduced-motion: reduce)',
  ).matches
  const mobile = window.matchMedia('(max-width: 767px)').matches
  const coarsePointer = window.matchMedia('(pointer: coarse)').matches
  const memory = navigator.deviceMemory || 8
  const cores = navigator.hardwareConcurrency || 8
  const lowEndDevice = reducedMotion || memory <= 4 || cores <= 4 || coarsePointer

  return {
    reducedMotion,
    mobile,
    lowEndDevice,
  }
}

export function useDeviceCapabilities() {
  return useMemo(detectCapabilities, [])
}
