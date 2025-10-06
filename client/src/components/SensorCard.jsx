export default function SensorCard({ label, value, unit, status = 'ok' }) {
  return (
    <div className={`sensor-card ${status}`}>
      <div className="sensor-label">{label}</div>
      <div className="sensor-value">
        <span>{value ?? '--'}</span>
        {unit && <small>{unit}</small>}
      </div>
    </div>
  )
}
