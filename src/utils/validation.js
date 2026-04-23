export function validateBooking(form) {
  const errors = {}

  if (!form.name.trim()) errors.name = 'Full name is required.'
  if (!form.email.trim()) errors.email = 'Email is required.'
  if (!/\S+@\S+\.\S+/.test(form.email)) errors.email = 'Enter a valid email.'
  if (!form.phone.trim()) errors.phone = 'Phone number is required.'
  if (!/^\d{10}$/.test(form.phone.replace(/\s+/g, ''))) {
    errors.phone = 'Enter a valid 10-digit phone number.'
  }
  if (!form.checkIn) errors.checkIn = 'Check-in date is required.'
  if (!form.checkOut) errors.checkOut = 'Check-out date is required.'
  if (form.checkIn && form.checkOut && form.checkIn >= form.checkOut) {
    errors.checkOut = 'Check-out must be after check-in.'
  }

  return errors
}
