import { useEffect, useId, useRef, useState } from 'react'

function profileIcon() {
  return (
    <svg className="nav-profile-icon" width="22" height="22" viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="currentColor"
        d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"
      />
    </svg>
  )
}

function UserProfileMenu({ onSignOut, className = '' }) {
  const menuId = useId()
  const rootRef = useRef(null)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    if (!open) return undefined
    const onPointerDown = (e) => {
      if (rootRef.current && !rootRef.current.contains(e.target)) {
        setOpen(false)
      }
    }
    const onKeyDown = (e) => {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('pointerdown', onPointerDown)
    window.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('pointerdown', onPointerDown)
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [open])

  const goToMyBookings = () => {
    setOpen(false)
    window.location.hash = '#my-bookings'
  }

  const handleSignOut = () => {
    setOpen(false)
    onSignOut?.()
  }

  return (
    <div className={`nav-profile-menu ${className}`.trim()} ref={rootRef}>
      <button
        type="button"
        className="nav-profile-toggle"
        onClick={() => setOpen((prev) => !prev)}
        aria-expanded={open}
        aria-haspopup="true"
        aria-controls={menuId}
        aria-label="Account menu"
      >
        {profileIcon()}
      </button>
      {open ? (
        <div id={menuId} className="nav-profile-dropdown" role="menu" aria-label="Account">
          <button type="button" className="nav-profile-menu-item" role="menuitem" onClick={goToMyBookings}>
            My Bookings
          </button>
          <button type="button" className="nav-profile-menu-item nav-profile-logout" role="menuitem" onClick={handleSignOut}>
            Logout
          </button>
        </div>
      ) : null}
    </div>
  )
}

export default UserProfileMenu
