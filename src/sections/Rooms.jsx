import SectionWrapper from '../components/SectionWrapper'
import { useAvailability } from '../hooks/useAvailability'

function Rooms() {
  const { rooms, loading, error } = useAvailability()

  return (
    <SectionWrapper id="rooms" title="Estate Rooms" tone="cream">
      {loading && <p>Loading room inventory...</p>}
      {error && <p className="form-message error">{error}</p>}
      {!loading && !error && (
        <div className="rooms-grid">
          {(rooms.length > 0 ? rooms : [{ id: 'default', name: 'Estate Suite' }]).map(
            (room, index) => (
              <article key={room.id || room.roomId || index} className="room-card">
                <h3>{room.name || room.roomName || `Room ${index + 1}`}</h3>
                <p>
                  {room.description ||
                    'Warm wooden interiors, estate-facing windows, and quiet evenings.'}
                </p>
              </article>
            ),
          )}
        </div>
      )}
    </SectionWrapper>
  )
}

export default Rooms
