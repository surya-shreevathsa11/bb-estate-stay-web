import Button from './Button'
import Input from './Input'

function SignInModal({
  open,
  step,
  status,
  message,
  form,
  canSubmit,
  onClose,
  onUpdateField,
  onSendPin,
  onVerifyPin,
}) {
  if (!open) return null

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (step === 'requestPin') {
      await onSendPin()
      return
    }
    await onVerifyPin()
  }

  return (
    <div className="modal-backdrop" role="presentation" onClick={onClose}>
      <section
        className="signin-modal"
        role="dialog"
        aria-modal="true"
        onClick={(event) => event.stopPropagation()}
      >
        <h3>Sign In To Book Rooms</h3>
        <p className="signin-copy">
          Verify with email PIN to continue booking.
        </p>
        <form onSubmit={handleSubmit} className="signin-form">
          <Input
            id="signin-name"
            label="Full Name"
            value={form.name}
            onChange={(event) => onUpdateField('name', event.target.value)}
            required
          />
          <Input
            id="signin-email"
            type="email"
            label="Email Address"
            value={form.email}
            onChange={(event) => onUpdateField('email', event.target.value)}
            required
          />
          {step === 'verifyPin' && (
            <Input
              id="signin-pin"
              label="PIN"
              value={form.pin}
              onChange={(event) => onUpdateField('pin', event.target.value)}
              required
            />
          )}
          {message && (
            <p className={`form-message ${status === 'error' ? 'error' : 'ok'}`}>
              {message}
            </p>
          )}
          <div className="signin-actions">
            <Button variant="outline" type="button" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={!canSubmit}>
              {status === 'loading'
                ? 'Please wait...'
                : step === 'requestPin'
                  ? 'Send PIN'
                  : 'Verify PIN'}
            </Button>
          </div>
        </form>
      </section>
    </div>
  )
}

export default SignInModal
