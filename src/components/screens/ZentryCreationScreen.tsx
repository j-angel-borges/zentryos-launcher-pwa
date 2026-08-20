import React from 'react';
import { Palette, Globe, User } from 'lucide-react';
import type { ScreenId } from '../../types/zentry';
import { ZentrySubPageScaffold } from '../shell/ZentrySubPageScaffold';
import { sounds } from '../../services/soundEffects';

interface Props {
  onBack: () => void;
  onNavigate: (screen: ScreenId) => void;
  isDark: boolean;
}

export const ZentryCreationScreen: React.FC<Props> = ({ onBack, onNavigate, isDark }) => {
  const apps = [
    {
      name: 'Art-Attack (NeuroArt)',
      desc: 'Lienzo de dibujo y generación artística con IA',
      icon: Palette,
      screen: 'neuro_art' as ScreenId,
      color: 'from-pink-500 to-rose-600'
    },
    {
      name: 'Generador de Mundos',
      desc: 'Simulaciones planetarias y leyes físicas interactivas',
      icon: Globe,
      screen: 'world_generator' as ScreenId,
      color: 'from-amber-500 to-orange-600'
    },
    {
      name: 'Generador de Personajes',
      desc: 'Crea avatares y héroes para tus cuentos escolares',
      icon: User,
      screen: 'neuro_art' as ScreenId,
      color: 'from-purple-500 to-indigo-600'
    }
  ];

  return (
    <ZentrySubPageScaffold title="Espacio Creativo" kicker="CREAR" onBack={onBack} isDark={isDark}>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 h-full items-center">
        {apps.map((app) => {
          const Icon = app.icon;
          return (
            <div
              key={app.name}
              onClick={() => {
                sounds.playAppOpen();
                onNavigate(app.screen);
              }}
              className={(isDark ? 'zentry-veil-dark ' : 'zentry-veil-light ') + 'rounded-[28px] p-6 flex flex-col items-center text-center gap-3 cursor-pointer zentry-press group'}
            >
              <div className={'w-20 h-20 rounded-[22px] bg-gradient-to-br ' + app.color + ' flex items-center justify-center text-white shadow-xl group-hover:scale-105 transition-transform'}>
                <Icon className="w-10 h-10" />
              </div>
              <h3 className={(isDark ? 'text-white ' : 'text-[#1E293B] ') + 'text-base font-extrabold'}>
                {app.name}
              </h3>
              <p className={(isDark ? 'text-slate-300 ' : 'text-[#64748B] ') + 'text-xs leading-relaxed'}>
                {app.desc}
              </p>
            </div>
          );
        })}
      </div>
    </ZentrySubPageScaffold>
  );
};
