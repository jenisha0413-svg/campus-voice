interface Props {
  label: string;
  count: number;
  total: number;
  color: string;
}

export default function ResultBar({ label, count, total, color }: Props) {
  const percentage = total > 0 ? (count / total) * 100 : 0;

  return (
    <div className="flex items-center gap-3">
      <span className="w-10 text-sm font-medium text-muted">{label}</span>
      <div className="flex-1">
        <div className="h-2.5 overflow-hidden rounded-full bg-gray-100">
          <div
            className={`h-full rounded-full transition-all duration-500 ${color}`}
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>
      <span className="w-16 text-right text-sm font-semibold text-text">
        {percentage.toFixed(1)}%
      </span>
    </div>
  );
}
