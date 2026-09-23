export function AmbientBackground({ dense = false }: { dense?: boolean }) {
  return (
    <div className="ambient" aria-hidden>
      <div className="ambient__blob" />
      <div className="ambient__blob" />
      <div className="ambient__blob" />
      {dense && <div className="ambient__blob" />}
    </div>
  )
}
