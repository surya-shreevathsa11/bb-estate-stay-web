import { useMemo, useState } from 'react'
import {
  clearGuestToken,
  getGuestToken,
  requestGuestPin,
  setGuestToken,
  verifyGuestPin,
} from '../services/api'

const initialAuthForm = {
  name: '',
  email: '',
  pin: '',
}

function extractToken(payload) {
  return (
    payload?.token ||
    payload?.accessToken ||
    payload?.data?.token ||
    payload?.data?.accessToken ||
    null
  )
}

export function useGuestAuth() {
  const [open, setOpen] = useState(false)
  const [step, setStep] = useState('requestPin')
  const [status, setStatus] = useState('idle')
  const [message, setMessage] = useState('')
  const [form, setForm] = useState(initialAuthForm)
  const [signedIn, setSignedIn] = useState(Boolean(getGuestToken()))

  const canSubmit = useMemo(() => status !== 'loading', [status])

  const openModal = () => {
    setOpen(true)
    setMessage('')
  }

  const closeModal = () => {
    setOpen(false)
    setStep('requestPin')
    setStatus('idle')
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
    setStatus('loading')
    setMessage('')
    try {
      const response = await verifyGuestPin({
        email: form.email.trim(),
        name: form.name.trim(),
        pin: form.pin.trim(),
      })
      const token = extractToken(response)
      if (!token) {
        throw new Error('Verification succeeded but no token was returned.')
      }
      setGuestToken(token)
      setSignedIn(true)
      setStatus('success')
      setMessage('Signed in successfully. You can now book a room.')
      setOpen(false)
      window.dispatchEvent(new Event('guest-auth-changed'))
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
