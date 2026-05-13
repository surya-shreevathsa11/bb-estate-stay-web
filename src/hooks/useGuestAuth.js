import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  clearGuestToken,
  exchangeGoogleCredential,
  extractGuestAuthToken,
  getGoogleClientId,
  getGuestToken,
  requestGuestPin,
  setGuestToken,
  verifyGuestPin,
} from '../services/varaGuestAuth'
import { loadGoogleIdentityServices } from '../utils/loadGoogleIdentityServices'

const initialAuthForm = {
  name: '',
  email: '',
  pin: '',
}

export function useGuestAuth() {
  const [open, setOpen] = useState(false)
  const [step, setStep] = useState('requestPin')
  const [status, setStatus] = useState('idle')
  const [googleStatus, setGoogleStatus] = useState('idle')
  const [message, setMessage] = useState('')
  const [form, setForm] = useState(initialAuthForm)
  const [signedIn, setSignedIn] = useState(Boolean(getGuestToken()))
  const googleButtonRef = useRef(null)

  const googleClientConfigured = Boolean(getGoogleClientId())

  const canSubmit = useMemo(
    () => status !== 'loading' && googleStatus !== 'loading',
    [status, googleStatus],
  )

  const completeSignIn = useCallback((token) => {
    setGuestToken(token)
    setSignedIn(true)
    setStatus('idle')
    setGoogleStatus('idle')
    setOpen(false)
    setForm(initialAuthForm)
    setStep('requestPin')
    window.dispatchEvent(new Event('guest-auth-changed'))
  }, [])

  const onGoogleCredential = useCallback(
    async (response) => {
      if (!response?.credential) {
        setGoogleStatus('error')
        setMessage('Google did not return a valid credential.')
        return
      }
      setGoogleStatus('loading')
      setMessage('')
      try {
        const data = await exchangeGoogleCredential(response.credential)
        const token = extractGuestAuthToken(data)
        if (!token) {
          throw new Error('Sign-in succeeded but no token was returned.')
        }
        completeSignIn(token)
      } catch (error) {
        setGoogleStatus('error')
        setMessage(
          error?.message ||
            'Google sign-in failed. Please try again or use email PIN.',
        )
      }
    },
    [completeSignIn],
  )

  useEffect(() => {
    if (!open || !googleButtonRef.current || !googleClientConfigured) {
      return undefined
    }

    const el = googleButtonRef.current
    const clientId = getGoogleClientId()
    let cancelled = false

    ;(async () => {
      try {
        const google = await loadGoogleIdentityServices()
        if (cancelled || !googleButtonRef.current) return

        el.innerHTML = ''
        google.accounts.id.initialize({
          client_id: clientId,
          callback: (resp) => {
            if (!cancelled) onGoogleCredential(resp)
          },
        })

        requestAnimationFrame(() => {
          if (cancelled || !googleButtonRef.current) return
          const w = el.offsetWidth
          google.accounts.id.renderButton(el, {
            type: 'standard',
            theme: 'outline',
            size: 'large',
            text: 'signin_with',
            shape: 'rectangular',
            width: Math.min(400, Math.max(w || 320, 280)),
          })
        })
      } catch {
        if (!cancelled) {
          setGoogleStatus('error')
          setMessage(
            'Could not load Google Sign-In. Check your connection or use email PIN.',
          )
        }
      }
    })()

    return () => {
      cancelled = true
      el.innerHTML = ''
      if (window.google?.accounts?.id) {
        window.google.accounts.id.cancel()
      }
    }
  }, [open, googleClientConfigured, onGoogleCredential])

  const openModal = () => {
    setOpen(true)
    setMessage('')
    setGoogleStatus('idle')
  }

  const closeModal = () => {
    setOpen(false)
    setStep('requestPin')
    setStatus('idle')
    setGoogleStatus('idle')
    setMessage('')
    setForm(initialAuthForm)
  }

  const updateField = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  const sendPin = async () => {
    setStatus('loading')
    setMessage('')
    try {
      await requestGuestPin({
        email: form.email.trim(),
        name: form.name.trim(),
      })
      setStatus('success')
      setStep('verifyPin')
      setMessage('A 6-digit PIN has been sent to your email.')
      return true
    } catch (error) {
      setStatus('error')
      setMessage(error.message || 'Could not send PIN.')
      return false
    }
  }

  const verifyPin = async () => {
    const pin = form.pin.trim()
    if (!/^\d{6}$/.test(pin)) {
      setStatus('error')
      setMessage('Enter the 6-digit PIN from your email.')
      return false
    }

    setStatus('loading')
    setMessage('')
    try {
      const response = await verifyGuestPin({
        email: form.email.trim(),
        name: form.name.trim(),
        pin,
      })
      const token = extractGuestAuthToken(response)
      if (!token) {
        throw new Error('Verification succeeded but no token was returned.')
      }
      completeSignIn(token)
      return true
    } catch (error) {
      setStatus('error')
      setMessage(error.message || 'PIN verification failed.')
      return false
    }
  }

  const signOut = () => {
    clearGuestToken()
    setSignedIn(false)
    setStep('requestPin')
    setMessage('You have been signed out.')
    window.dispatchEvent(new Event('guest-auth-changed'))
  }

  return {
    open,
    step,
    status,
    googleStatus,
    googleButtonRef,
    googleClientConfigured,
    message,
    form,
    signedIn,
    canSubmit,
    openModal,
    closeModal,
    updateField,
    sendPin,
    verifyPin,
    signOut,
  }
}
