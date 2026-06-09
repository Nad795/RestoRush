interface Props {
  label: string;
  value: string | number;
  color?: string; // tailwind text colour class
}

export function StatBadge({ label, value, color = 'text-white' }: Props) {
  return (
    <div className="flex flex-col items-center px-4 py-1">
      <span className="text-xs text-gray-400 uppercase tracking-wider">{label}</span>
      <span className={`text-xl font-bold ${color}`}>{value}</span>
    </div>
  );
}
