export default function StatCard({
  label, value, tone,
}: { label: string; value: string | number; tone?: 'green' | 'amber' }) {
  return (
    <div className="card stat">
      <div className="label">{label}</div>
      <div className={`value ${tone ?? ''}`}>{value}</div>
    </div>
  );
}
