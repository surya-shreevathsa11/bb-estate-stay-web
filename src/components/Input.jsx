function Input({ label, id, error, ...props }) {
  return (
    <label className="form-field" htmlFor={id}>
      <span>{label}</span>
      <input id={id} {...props} />
      {error && <small className="field-error">{error}</small>}
    </label>
  )
}

export default Input
