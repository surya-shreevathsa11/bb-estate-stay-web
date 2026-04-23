import Button from '../components/Button'
import Input from '../components/Input'
import SectionWrapper from '../components/SectionWrapper'
import Textarea from '../components/Textarea'
import { useAvailability } from '../hooks/useAvailability'
import { useBooking } from '../hooks/useBooking'

function Booking() {
  const { rooms, loading: roomsLoading } = useAvailability()
  const { form, errors, status, message, canSubmit, updateField, submitBooking } =
    useBooking()

  const onSubmit = async (event) => {
    event.preventDefault()
    await submitBooking()
  }

  return (
    <SectionWrapper
      id="booking"
      title="Reserve Your Stay"
      subtitle="We host only one group at a time. The estate is yours."
      tone="cream"
    >
      <div className="booking-grid">
        <aside className="booking-aside">
          <p>Exclusive Estate Occupancy</p>
          <ul>
            <li>Capacity: Up to 10 Guests</li>
            <li>Minimum Stay: 2 Nights</li>
            <li>Check-in: 2:00 PM · Check-out: 11:00 AM</li>
            <li>{roomsLoading ? 'Checking available room types...' : `${rooms.length || 1} room type(s) currently listed`}</li>
          </ul>
        </aside>
        <form className="booking-form" onSubmit={onSubmit}>
          <Input id="name" label="Full Name" value={form.name} error={errors.name} onChange={(e) => updateField('name', e.target.value)} />
          <Input id="email" type="email" label="Email Address" value={form.email} error={errors.email} onChange={(e) => updateField('email', e.target.value)} />
          <Input id="phone" label="Phone Number" value={form.phone} error={errors.phone} onChange={(e) => updateField('phone', e.target.value)} />
          <div className="split-fields">
            <Input id="checkIn" type="date" label="Check-In Date" value={form.checkIn} error={errors.checkIn} onChange={(e) => updateField('checkIn', e.target.value)} />
            <Input id="checkOut" type="date" label="Check-Out Date" value={form.checkOut} error={errors.checkOut} onChange={(e) => updateField('checkOut', e.target.value)} />
          </div>
          <label className="form-field" htmlFor="guests">
            <span>Number Of Guests</span>
            <select id="guests" value={form.guests} onChange={(e) => updateField('guests', e.target.value)}>
              {Array.from({ length: 10 }).map((_, idx) => (
                <option key={idx + 1} value={idx + 1}>
                  {idx + 1}
                </option>
              ))}
            </select>
          </label>
          <Textarea id="specialRequests" rows="3" label="Special Requests" value={form.specialRequests} onChange={(e) => updateField('specialRequests', e.target.value)} />
          <Button type="submit" disabled={!canSubmit}>
            {status === 'loading' ? 'Requesting Availability...' : 'Request Availability'}
          </Button>
          {message && (
            <p className={`form-message ${status === 'success' ? 'ok' : 'error'}`}>
              {message}
            </p>
          )}
          <p className="booking-note">
            We will respond within 24 hours to confirm availability and share
            detailed pricing.
          </p>
        </form>
      </div>
    </SectionWrapper>
  )
}

export default Booking
