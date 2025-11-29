import React from "react";

export type StatCardProps = {
  value: string | number;
  label: string;
};

const StatCard: React.FC<StatCardProps> = ({ value, label }) => {
  return (
    <div className="flex flex-col items-start justify-center gap-1 rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
      <div className="text-3xl font-semibold tracking-tight text-zinc-900">
        {value}
      </div>
      <div className="text-sm text-zinc-500">{label}</div>
    </div>
  );
};

export default StatCard;
