import React, { useState } from 'react';
import { ZentrySubPageScaffold } from '../shell/ZentrySubPageScaffold';
import { sounds } from '../../services/soundEffects';

interface Props {
  onBack: () => void;
  isDark: boolean;
}

export const ZentryCalculatorScreen: React.FC<Props> = ({ onBack, isDark }) => {
  const [display, setDisplay] = useState('0');
  const [note, setNote] = useState('Calculadora Escolar Zentry');

  const handleBtn = (val: string) => {
    sounds.playTap();
    if (display === '0') setDisplay(val);
    else setDisplay((prev) => prev + val);
  };

  const handleClear = () => {
    sounds.playTap();
    setDisplay('0');
    setNote('Pantalla borrada');
  };

  const handleCalc = () => {
    sounds.playSuccess();
    try {
      const sanitized = display.replace(/×/g, '*').replace(/÷/g, '/');
      const res = Function(`'use strict'; return (${sanitized})`)();
      setDisplay(String(res));
      setNote('Resultado exacto: ' + res + '. Verifica siempre el orden de operaciones (PEMDAS).');
    } catch {
      setNote('Error en la expresión matemática');
    }
  };

  const keys = ['C', '(', ')', '÷', '7', '8', '9', '×', '4', '5', '6', '-', '1', '2', '3', '+', '0', '.', '=', 'π'];

  return (
    <ZentrySubPageScaffold title="Calculadora" kicker="HERRAMIENTA" onBack={onBack} isDark={isDark}>
      <div className="max-w-sm mx-auto w-full space-y-4">
        <div className={(isDark ? 'zentry-veil-dark ' : 'zentry-veil-light ') + 'rounded-[24px] p-4 text-right space-y-1'}>
          <div className="text-2xl md:text-3xl font-black font-mono tracking-tight select-all">
            {display}
          </div>
          <div className="text-[10px] text-sky-400 font-semibold">{note}</div>
        </div>

        <div className="grid grid-cols-4 gap-2">
          {keys.map((k) => (
            <button
              key={k}
              onClick={() => {
                if (k === 'C') handleClear();
                else if (k === '=') handleCalc();
                else if (k === 'π') handleBtn('3.14159');
                else handleBtn(k);
              }}
              className={
                k === '='
                  ? 'bg-[#6366F1] text-white py-3 rounded-2xl font-black text-base shadow-md cursor-pointer zentry-press'
                  : ['÷', '×', '-', '+'].includes(k)
                  ? 'bg-sky-500/20 text-sky-400 py-3 rounded-2xl font-bold text-sm cursor-pointer zentry-press'
                  : k === 'C'
                  ? 'bg-rose-500/20 text-rose-400 py-3 rounded-2xl font-bold text-sm cursor-pointer zentry-press'
                  : (isDark ? 'bg-white/10 hover:bg-white/15 text-white ' : 'bg-white/70 hover:bg-white/90 text-[#1E293B] ') + 'py-3 rounded-2xl font-bold text-sm shadow-sm cursor-pointer zentry-press'
              }
            >
              {k}
            </button>
          ))}
        </div>
      </div>
    </ZentrySubPageScaffold>
  );
};
