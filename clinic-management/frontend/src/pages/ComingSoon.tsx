export default function ComingSoon({ title, icon }: { title: string; icon: string }) {
  return (
    <div>
      <h1 className="page-title">{title}</h1>
      <div className="card" style={{ textAlign: 'center', padding: 48 }}>
        <div style={{ fontSize: 48 }}>{icon}</div>
        <h3 style={{ marginTop: 12 }}>Coming soon</h3>
        <p className="muted">This module is being built and will be available shortly.</p>
      </div>
    </div>
  );
}
