import React, { useState } from 'react';
import { Calculator, Sparkles, Delete, Check } from 'lucide-react';
import { sounds } from '../../services/soundEffects';

export const SmartCalculator: React.FC = () => {
  const [display, setDisplay] = useState('0');
  const [explanation, setExplanation] = useState('Calculadora Científica con soporte de explicaciones socráticas.');

  const handleBtn = (val: string) => {
    sounds.playTap();
    if (display === '0') {
      setDisplay(val);
    } else {
      setDisplay(prev => prev + val);
    }
  };

  const handleClear = () => {
    sounds.playTap();
    setDisplay('0');
    setExplanation('Pantalla borrada.');
  };

  const handleCalculate = () => {
    sounds.playSuccess();
    try {
      const sanitized = display.replace(/×/g, '*').replace(/÷/g, '/');
      const result = Function(`'use strict'; return (${sanitized})`)();
      setDisplay(String(result));
      setExplanation(`Resultado exacto: ${result}. Recuerda comprobar siempre el orden de las operaciones (PEMDAS).`);
    } catch {
      setExplanation('Expresión matemática incompleta o con error de sintaxis.');
    }
  };

  const buttons = [
    'C', '(', ')', '÷',
    '7', '8', '9', '×',
    '4', '5', '6', '-',
    '1', '2', '3', '+',
    '0', '.', '=', 'π'
  ];

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-6 max-w-xl mx-auto w-full space-y-4 text-white animate-in fade-in duration-300">
      <div className="liquid-glass rounded-3xl p-4 border border-emerald-400/30 flex items-center justify-between shadow-lg">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-300 shadow-md">
            <Calculator className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-white">Calculadora Inteligente</h3>
            <p className="text-xs text-slate-300">Operaciones científicas con desglose didáctico.</p>
          </div>
        </div>
      </div>

      <div className="liquid-glass rounded-3xl p-5 border border-white/20 shadow-2xl space-y-2">
        <div className="text-right font-mono text-3xl md:text-4xl font-bold tracking-tight text-white overflow-x-auto select-all">
          {display}
        </div>
        <p className="text-xs text-emerald-300 font-medium pt-1 border-t border-white/10">
          💡 {explanation}
        </p>
      </div>

      <div className="grid grid-cols-4 gap-2.5 pt-1">
        {buttons.map((btn) => (
          <button
            key={btn}
            onClick={() => {
              if (btn === 'C') handleClear();
              else if (btn === '=') handleCalculate();
              else if (btn === 'π') handleBtn('3.14159');
              else handleBtn(btn);
            }}
            className={`py-3.5 rounded-2xl font-bold text-sm md:text-base transition-all cursor-pointer active:scale-95 shadow-md ${
              btn === '='
                ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-emerald-500/30'
                : ['÷', '×', '-', '+'].includes(btn)
                ? 'bg-sky-500/20 border border-sky-400/30 text-sky-300 hover:bg-sky-500/30'
                : btn === 'C'
                ? 'bg-rose-500/20 border border-rose-400/30 text-rose-300 hover:bg-rose-500/30'
                : 'liquid-glass-interactive border border-white/10 hover:bg-white/15 text-white'
            }`}
          >
            {btn}
          </button>
        ))}
      </div>
    </div>
  );
};
