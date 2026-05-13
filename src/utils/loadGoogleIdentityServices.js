const SCRIPT_SRC = 'https://accounts.google.com/gsi/client'

function finishLoad(resolve, reject) {
  if (window.google?.accounts?.id) {
    resolve(window.google)
    return
  }
  reject(new Error('Google Identity Services failed to initialize.'))
}

/**
 * Loads Google Identity Services once. Safe to call multiple times.
 * Only load after your origin is listed under Authorized JavaScript origins for the OAuth Web client.
 * @returns {Promise<typeof window.google>}
 */
export function loadGoogleIdentityServices() {
  if (typeof window === 'undefined') {
    return Promise.reject(
      new Error('Google Sign-In is only available in the browser.'),
    )
  }
  if (window.google?.accounts?.id) {
    return Promise.resolve(window.google)
  }

  const existing = document.querySelector(`script[src="${SCRIPT_SRC}"]`)
  if (existing) {
    return new Promise((resolve, reject) => {
      const onLoad = () => {
        existing.dataset.loaded = 'true'
        finishLoad(resolve, reject)
      }
      if (existing.dataset.loaded === 'true') {
        finishLoad(resolve, reject)
        return
      }
      existing.addEventListener('load', onLoad, { once: true })
      existing.addEventListener(
        'error',
        () => reject(new Error('Failed to load Google Identity Services.')),
        { once: true },
      )
    })
  }

  return new Promise((resolve, reject) => {
    const script = document.createElement('script')
    script.src = SCRIPT_SRC
    script.async = true
    script.defer = true
    script.onload = () => {
      script.dataset.loaded = 'true'
      finishLoad(resolve, reject)
    }
    script.onerror = () =>
      reject(new Error('Failed to load Google Identity Services.'))
    document.head.appendChild(script)
  })
}
