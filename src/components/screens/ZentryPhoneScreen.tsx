import React from 'react';
import { Phone, User, ShieldCheck } from 'lucide-react';
import { ZentrySubPageScaffold } from '../shell/ZentrySubPageScaffold';
import { sounds } from '../../services/soundEffects';

interface Props {
  onBack: () => void;
  isDark: boolean;
}

export const ZentryPhoneScreen: React.FC<Props> = ({ onBack, isDark }) => {
  const contacts = [
    { name: 'Mamá', phone: '+51 987 654 321', relation: 'Contacto Autorizado' },
    { name: 'Papá', phone: '+51 912 345 678', relation: 'Contacto Autorizado' },
    { name: 'Emergencias 105', phone: '105', relation: 'Policía Nacional del Perú' }
  ];

  return (
    <ZentrySubPageScaffold title="Teléfono Protegido" kicker="CONTACTOS FAMILIARES" onBack={onBack} isDark={isDark}>
      <div className="max-w-md mx-auto w-full space-y-4">
        <div className="p-3 rounded-[18px] bg-emerald-500/15 border border-emerald-500/30 flex items-center gap-2 text-xs font-semibold text-emerald-400">
          <ShieldCheck className="w-4 h-4" />
          <span>Solo se permiten llamadas a la lista blanca familiar.</span>
        </div>

        <div className="space-y-2.5">
          {contacts.map((c, idx) => (
            <div
              key={idx}
              onClick={() => {
                sounds.playTap();
                alert('Iniciando llamada segura a ' + c.name + ' (' + c.phone + ')');
              }}
              className={(isDark ? 'zentry-veil-dark ' : 'zentry-veil-light ') + 'rounded-[20px] p-3.5 flex items-center justify-between cursor-pointer zentry-press'}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold">
                  <User className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-bold">{c.name}</div>
                  <div className="text-[10px] text-slate-400">{c.relation}</div>
                </div>
              </div>
              <div className="p-2 rounded-full bg-emerald-500 text-white shadow-md">
                <Phone className="w-4 h-4" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </ZentrySubPageScaffold>
  );
};
