import React from 'react';
import { useSimulation } from '../../context/SimulationContext';
import { useGetPublicPlansQuery } from '../../api/saasApi';
import { Gamepad2, X, Sparkles, RefreshCw, Layers, ShieldCheck } from 'lucide-react';

export const PlanSimulationBanner: React.FC = () => {
  const { isSimulating, simulatedPlan, stopSimulation, switchSimulatedPlan } = useSimulation();
  const { data: plans } = useGetPublicPlansQuery();

  if (!isSimulating || !simulatedPlan) return null;

  return (
    <div className="sticky top-0 z-50 bg-gradient-to-r from-purple-900/95 via-indigo-900/95 to-slate-900/95 backdrop-blur-md border-b border-purple-500/30 px-4 py-2.5 shadow-xl shadow-purple-950/40 animate-in slide-in-from-top-2 duration-300">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        {/* Left info badge */}
        <div className="flex items-center gap-2.5">
          <span className="p-1.5 rounded-lg bg-purple-500/20 text-purple-300 border border-purple-500/30 shrink-0">
            <Gamepad2 className="w-4 h-4 animate-pulse" />
          </span>
          <div>
            <span className="font-bold text-white uppercase tracking-wider">
              Chế Độ Mô Phỏng Shop:
            </span>{' '}
            <strong className="text-purple-300 text-sm font-extrabold ml-1">
              {simulatedPlan.name}
            </strong>{' '}
            <span className="text-slate-300 ml-1 hidden md:inline">
              (Hạn mức: {simulatedPlan.maxProducts || 'Vô hạn'} SP • {simulatedPlan.maxStaff} NV • {simulatedPlan.maxBots} Bot)
            </span>
          </div>
        </div>

        {/* Right Switcher & Exit button */}
        <div className="flex items-center gap-2 self-end sm:self-auto">
          {/* Quick Plan Switcher */}
          <div className="flex items-center gap-1.5 bg-slate-950/80 px-2.5 py-1 rounded-xl border border-slate-800">
            <span className="text-[11px] text-slate-400 font-medium">Đổi gói:</span>
            <select
              value={simulatedPlan.id}
              onChange={(e) => {
                const target = plans?.find((p) => p.id === Number(e.target.value));
                if (target) switchSimulatedPlan(target);
              }}
              className="bg-transparent text-purple-300 font-bold text-xs focus:outline-none cursor-pointer"
            >
              {plans?.map((p) => (
                <option key={p.id} value={p.id} className="bg-slate-900 text-white">
                  {p.name} ({Number(p.priceMonthly).toLocaleString('vi-VN')}đ)
                </option>
              ))}
            </select>
          </div>

          {/* Exit Simulation Button */}
          <button
            onClick={stopSimulation}
            className="flex items-center gap-1 px-3 py-1 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 font-bold text-xs transition"
          >
            <X className="w-3.5 h-3.5" /> Thoát Mô Phỏng
          </button>
        </div>
      </div>
    </div>
  );
};
