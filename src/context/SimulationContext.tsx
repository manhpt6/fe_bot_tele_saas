import React, { createContext, useContext, useState, useEffect } from 'react';
import { SaasPlan } from '../api/saasApi';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

interface SimulationContextType {
  isSimulating: boolean;
  simulatedPlan: SaasPlan | null;
  startSimulation: (plan: SaasPlan) => void;
  stopSimulation: () => void;
  switchSimulatedPlan: (plan: SaasPlan) => void;
}

const SimulationContext = createContext<SimulationContextType | undefined>(undefined);

export const SimulationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [simulatedPlan, setSimulatedPlan] = useState<SaasPlan | null>(() => {
    const saved = localStorage.getItem('saas_simulated_plan');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return null;
      }
    }
    return null;
  });

  const isSimulating = Boolean(simulatedPlan);
  const navigate = useNavigate();

  const startSimulation = (plan: SaasPlan) => {
    setSimulatedPlan(plan);
    localStorage.setItem('saas_simulated_plan', JSON.stringify(plan));
    toast.success(`Đã kích hoạt Chế độ Mô phỏng cho ${plan.name}!`);
    navigate('/dashboard');
  };

  const stopSimulation = () => {
    setSimulatedPlan(null);
    localStorage.removeItem('saas_simulated_plan');
    toast('Đã thoát Chế độ Mô phỏng.', { icon: '👋' });
    navigate('/saas/plans');
  };

  const switchSimulatedPlan = (plan: SaasPlan) => {
    setSimulatedPlan(plan);
    localStorage.setItem('saas_simulated_plan', JSON.stringify(plan));
    toast.success(`Đã chuyển sang mô phỏng ${plan.name}!`);
  };

  return (
    <SimulationContext.Provider
      value={{
        isSimulating,
        simulatedPlan,
        startSimulation,
        stopSimulation,
        switchSimulatedPlan,
      }}
    >
      {children}
    </SimulationContext.Provider>
  );
};

export const useSimulation = (): SimulationContextType => {
  const context = useContext(SimulationContext);
  if (!context) {
    throw new Error('useSimulation must be used within a SimulationProvider');
  }
  return context;
};
