import { useMemo, useState } from 'react'
import { requestPublicQuote } from '../services/api'
import { validateBooking } from '../utils/validation'

const initialState = {
  name: '',
  email: '',
  phone: '',
  checkIn: '',
  checkOut: '',
  guests: '2',
  specialRequests: '',
}

export function useBooking() {
  const [form, setForm] = useState(initialState)
  const [errors, setErrors] = useState({})
  const [status, setStatus] = useState('idle')
  const [message, setMessage] = useState('')

  const canSubmit = useMemo(() => status !== 'loading', [status])

  const updateField = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }))
    }
  }

  const submitBooking = async () => {
    const nextErrors = validateBooking(form)
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) return false

    setStatus('loading')
    setMessage('')

    try {
      await requestPublicQuote({
        name: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        checkIn: form.checkIn,
        checkOut: form.checkOut,
        adults: Number(form.guests),
        children: 0,
        specialRequests: form.specialRequests.trim(),
      })

      setStatus('success')
      setMessage('Request sent. We will respond within 24 hours.')
      return true
    } catch (error) {
      setStatus('error')
      setMessage(error.message || 'Unable to submit your request.')
      return false
    }
  }

  return {
    form,
    errors,
    status,
    message,
    canSubmit,
    updateField,
    submitBooking,
  }
}
