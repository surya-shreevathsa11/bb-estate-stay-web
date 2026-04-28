import { useEffect } from 'react'

export function usePageVisibility(onVisibilityChange) {
  useEffect(() => {
    const handler = () => onVisibilityChange(!document.hidden)
    document.addEventListener('visibilitychange', handler)
    return () => document.removeEventListener('visibilitychange', handler)
  }, [onVisibilityChange])
}
