import { createPortal } from 'react-dom'
import Button from './Button'
import Input from './Input'

function SignInModal({
  open,
  step,
  status,
  googleStatus,
  googleButtonRef,
  googleClientConfigured,
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

  const pinBusy = status === 'loading'
  const googleBusy = googleStatus === 'loading'

  return createPortal(
    <div className="modal-backdrop" role="presentation" onClick={onClose}>
      <section
        className="signin-modal"
        role="dialog"
        aria-modal="true"
        onClick={(event) => event.stopPropagation()}
      >
        <h3>Sign In To Book Rooms</h3>
        <p className="signin-copy">
          Sign in with Google or verify your email with a one-time PIN to continue
          booking.
        </p>

        <div className="signin-google-wrap">
          {!googleClientConfigured ? (
            <p className="form-message muted">
              Google sign-in is not configured for this site build. Use email PIN
              below, or set <code className="signin-env-hint">VITE_GOOGLE_CLIENT_ID</code>{' '}
              to match your API&apos;s OAuth client.
            </p>
          ) : (
            <>
              <div
                ref={googleButtonRef}
                className="signin-google-btn-wrap"
                aria-busy={googleBusy ? 'true' : 'false'}
              />
              {googleBusy ? (
                <p className="form-message">Signing in with Google…</p>
              ) : null}
            </>
          )}
        </div>

        <p className="signin-divider" role="separator">
          or use email PIN
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
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={6}
              value={form.pin}
              onChange={(event) => onUpdateField('pin', event.target.value)}
              required
            />
          )}
          {message && (
            <p className={`form-message ${status === 'error' || googleStatus === 'error' ? 'error' : 'ok'}`}>
              {message}
            </p>
          )}
          <div className="signin-actions">
            <Button variant="outline" type="button" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={!canSubmit || googleBusy}>
              {pinBusy
                ? 'Please wait...'
                : step === 'requestPin'
                  ? 'Send PIN'
                  : 'Verify PIN'}
            </Button>
          </div>
        </form>
      </section>
    </div>,
    document.body,
  )
}

export default SignInModal
