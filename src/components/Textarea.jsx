function Textarea({ label, id, error, ...props }) {
  return (
    <label className="form-field" htmlFor={id}>
      <span>{label}</span>
      <textarea id={id} {...props} />
      {error && <small className="field-error">{error}</small>}
    </label>
  )
}

export default Textarea
