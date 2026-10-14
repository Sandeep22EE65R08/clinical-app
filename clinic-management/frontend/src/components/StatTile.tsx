import type { ReactNode } from 'react';

type Tone = 'blue' | 'green' | 'purple' | 'amber' | 'red';

interface Props {
  icon: string;
  label: string;
  value: ReactNode;
  tone?: Tone;
  sub?: ReactNode;
  trend?: number | null;
}

export default function StatTile({ icon, label, value, tone = 'blue', sub, trend }: Props) {
  const showTrend = trend !== undefined && trend !== null;
  const up = (trend ?? 0) >= 0;
  return (
    <div className="stat-tile">
      <div className="st-top">
        <div className={`stat-ico ${tone}`}>{icon}</div>
        {showTrend && (
          <span className={up ? 'trend-up' : 'trend-down'}>
            {up ? '▲' : '▼'} {Math.abs(trend as number)}%
          </span>
        )}
      </div>
      <div className="st-label">{label}</div>
      <div className="st-value">{value}</div>
      {sub && <div className="st-sub">{sub}</div>}
    </div>
  );
}
