import React, { useState } from 'react';
import { 
  FolderLock, 
  FileText, 
  Table, 
  Presentation, 
  Sparkles, 
  BookOpen, 
  Mail, 
  Calendar,
  Video,
  GraduationCap,
  MapPin,
  Play,
  Plus,
  Search,
  ExternalLink,
  Download,
  Trash2,
  CheckCircle2,
  Lock,
  Save
} from 'lucide-react';
import { ZentrySubPageScaffold } from '../shell/ZentrySubPageScaffold';
import { sounds } from '../../services/soundEffects';
import type { WorkspaceAppInfo } from '../../types/zentry';
import { MarkdownView } from '../ui/MarkdownView';

interface Props {
  appInfo: WorkspaceAppInfo;
  onBack: () => void;
  isDark: boolean;
}

export const ZentryEmbeddedAppScreen: React.FC<Props> = ({ appInfo, onBack, isDark }) => {
  // Google Docs state
  const [docTitle, setDocTitle] = useState('Ensayo Escolar - Zentry Cloud');
  const [docContent, setDocContent] = useState(
    '# Tarea de Ciencias Naturales\n\n## 1. El ciclo del agua\nEl agua se evapora de los océanos, sube a la atmósfera y forma las nubes.\n\n## 2. Conclusiones\nEs vital cuidar los ríos y lagunas.'
  );

  // Google Sheets state
  const [sheetData, setSheetData] = useState<string[][]>([
    ['Materia', 'Nota 1', 'Nota 2', 'Promedio'],
    ['Matemáticas', '18', '19', '18.5'],
    ['Comunicación', '17', '18', '17.5'],
    ['Ciencia', '20', '19', '19.5'],
    ['Historia', '16', '18', '17.0']
  ]);

  // Google Drive state
  const [driveFiles, setDriveFiles] = useState([
    { id: '1', name: 'Ensayo_Historia.docx', type: 'doc', size: '24 KB', date: 'Hoy' },
    { id: '2', name: 'Calificaciones_2026.xlsx', type: 'sheet', size: '18 KB', date: 'Ayer' },
    { id: '3', name: 'Dibujo_Dragon_ArtAttack.png', type: 'image', size: '1.2 MB', date: '18 Ago' },
    { id: '4', name: 'Proyecto_Fotosintesis.pdf', type: 'pdf', size: '420 KB', date: '15 Ago' }
  ]);

  // Gmail school inbox state
  const [emails, setEmails] = useState([
    { id: '1', sender: 'Colegio Zentry - Tutoría', subject: 'Reporte semanal de avance escolar', preview: 'Felicitaciones por completar todas las misiones...', time: '10:30 AM', read: false },
    { id: '2', sender: 'Profesor de Matemáticas', subject: 'Material para la clase de Geometría', preview: 'Adjunto la guía de ejercicios prácticos...', time: 'Ayer', read: true }
  ]);

  // Classroom state
  const [assignments, setAssignments] = useState([
    { id: '1', course: 'Ciencia y Tecnología', title: 'Experimento del frijol en algodón', due: 'Mañana, 11:59 PM', done: false },
    { id: '2', course: 'Matemática', title: 'Problemas de fracciones equivalentes', due: 'Viernes', done: true },
    { id: '3', course: 'Comunicación', title: 'Redacción de fábula corta', due: 'Próximo Lunes', done: false }
  ]);

  const handleCellChange = (r: number, c: number, val: string) => {
    const next = sheetData.map((row, ri) =>
      ri === r ? row.map((cell, ci) => (ci === c ? val : cell)) : row
    );
    setSheetData(next);
  };

  return (
    <ZentrySubPageScaffold title={appInfo.name} kicker="ESPACIO PRODUCTIVO" onBack={onBack} isDark={isDark}>
      <div className="max-w-3xl mx-auto w-full h-full flex flex-col space-y-3 overflow-hidden">
        {/* Sub-Header bar */}
        <div className="flex items-center justify-between pb-2 border-b border-white/10">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-indigo-500/20 text-indigo-400">
              <Lock className="w-3.5 h-3.5" />
            </span>
            <span className="text-xs font-bold text-slate-300">
              Entorno Escolar Zentry • Nube Segura
            </span>
          </div>

          <button
            onClick={() => {
              sounds.playTap();
              window.open(appInfo.url, '_blank');
            }}
            className="text-[11px] font-semibold text-slate-400 hover:text-white flex items-center gap-1 cursor-pointer transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>Abrir en web externa</span>
          </button>
        </div>

        {/* 1. GOOGLE DOCS IN-APP SUITE */}
        {appInfo.type === 'docs' && (
          <div className={(isDark ? 'zentry-veil-dark ' : 'zentry-veil-light ') + 'flex-1 flex flex-col rounded-[24px] p-4 space-y-3 overflow-hidden border border-white/20'}>
            <div className="flex items-center justify-between gap-2 border-b border-white/10 pb-2">
              <input
                type="text"
                value={docTitle}
                onChange={(e) => setDocTitle(e.target.value)}
                className="bg-transparent text-xs md:text-sm font-bold text-blue-400 focus:outline-none flex-1"
              />
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    sounds.playSuccess();
                    alert('Documento guardado en tu Zentry Cloud Vault.');
                  }}
                  className="px-3 py-1 rounded-full bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center gap-1 cursor-pointer zentry-press"
                >
                  <Save className="w-3 h-3" />
                  <span>Guardar</span>
                </button>
              </div>
            </div>

            <textarea
              value={docContent}
              onChange={(e) => setDocContent(e.target.value)}
              className="flex-1 w-full p-3 rounded-[16px] bg-black/20 text-xs md:text-sm font-sans focus:outline-none resize-none border border-white/10 leading-relaxed"
            />
          </div>
        )}

        {/* 2. GOOGLE SHEETS IN-APP SUITE */}
        {appInfo.type === 'sheets' && (
          <div className={(isDark ? 'zentry-veil-dark ' : 'zentry-veil-light ') + 'flex-1 flex flex-col rounded-[24px] p-4 space-y-3 overflow-hidden border border-white/20'}>
            <div className="flex items-center justify-between border-b border-white/10 pb-2">
              <span className="text-xs font-bold text-emerald-400">📊 Hoja de Cálculo Escolar</span>
              <button
                onClick={() => {
                  sounds.playSuccess();
                  setSheetData([...sheetData, ['Nueva Fila', '0', '0', '0']]);
                }}
                className="px-3 py-1 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-1 cursor-pointer zentry-press"
              >
                <Plus className="w-3 h-3" />
                <span>Agregar Fila</span>
              </button>
            </div>

            <div className="flex-1 overflow-auto rounded-[16px] border border-white/10 bg-black/20">
              <table className="w-full text-xs text-left border-collapse">
                <thead>
                  <tr className="bg-white/10 text-slate-300">
                    {sheetData[0].map((header, ci) => (
                      <th key={ci} className="p-2.5 border border-white/10 font-bold">
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {sheetData.slice(1).map((row, ri) => (
                    <tr key={ri} className="hover:bg-white/5 transition-colors">
                      {row.map((cell, ci) => (
                        <td key={ci} className="p-1 border border-white/10">
                          <input
                            type="text"
                            value={cell}
                            onChange={(e) => handleCellChange(ri + 1, ci, e.target.value)}
                            className="w-full bg-transparent px-2 py-1 text-xs focus:outline-none focus:bg-white/10 rounded"
                          />
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 3. GOOGLE DRIVE IN-APP CLOUD VAULT */}
        {appInfo.type === 'drive' && (
          <div className={(isDark ? 'zentry-veil-dark ' : 'zentry-veil-light ') + 'flex-1 flex flex-col rounded-[24px] p-4 space-y-3 overflow-hidden border border-white/20'}>
            <div className="flex items-center justify-between border-b border-white/10 pb-2">
              <span className="text-xs font-bold text-amber-400">📁 Archivos en Zentry Cloud Vault</span>
              <span className="text-[11px] text-slate-400">Espacio Usado: 2.4 MB</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 overflow-y-auto pr-1">
              {driveFiles.map((file) => (
                <div
                  key={file.id}
                  className="p-3 rounded-[16px] bg-white/10 border border-white/15 flex items-center justify-between hover:bg-white/15 transition-all shadow-sm"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <FolderLock className="w-5 h-5 text-amber-400 shrink-0" />
                    <div className="min-w-0">
                      <div className="text-xs font-bold truncate">{file.name}</div>
                      <div className="text-[10px] text-slate-400">{file.size} • {file.date}</div>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      sounds.playSuccess();
                      alert(`Descargando ${file.name} desde tu almacenamiento cloud`);
                    }}
                    className="p-1.5 rounded-full hover:bg-white/20 text-slate-300"
                  >
                    <Download className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 4. GMAIL SCHOOL INBOX */}
        {appInfo.type === 'gmail' && (
          <div className={(isDark ? 'zentry-veil-dark ' : 'zentry-veil-light ') + 'flex-1 flex flex-col rounded-[24px] p-4 space-y-3 overflow-hidden border border-white/20'}>
            <div className="text-xs font-bold text-rose-400 border-b border-white/10 pb-2">
              ✉️ Bandeja de Entrada Escolar
            </div>

            <div className="space-y-2 overflow-y-auto pr-1">
              {emails.map((m) => (
                <div
                  key={m.id}
                  className="p-3.5 rounded-[18px] bg-white/10 border border-white/15 space-y-1 hover:bg-white/15 transition-all cursor-pointer"
                >
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span className="text-rose-300">{m.sender}</span>
                    <span className="text-[10px] text-slate-400">{m.time}</span>
                  </div>
                  <div className="text-xs font-semibold">{m.subject}</div>
                  <div className="text-[11px] text-slate-400 truncate">{m.preview}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 5. GOOGLE CLASSROOM */}
        {appInfo.type === 'classroom' && (
          <div className={(isDark ? 'zentry-veil-dark ' : 'zentry-veil-light ') + 'flex-1 flex flex-col rounded-[24px] p-4 space-y-3 overflow-hidden border border-white/20'}>
            <div className="text-xs font-bold text-emerald-400 border-b border-white/10 pb-2">
              🎓 Tareas y Entregas de Classroom
            </div>

            <div className="space-y-2 overflow-y-auto pr-1">
              {assignments.map((item) => (
                <div
                  key={item.id}
                  className="p-3.5 rounded-[18px] bg-white/10 border border-white/15 flex items-center justify-between hover:bg-white/15 transition-all"
                >
                  <div>
                    <div className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">{item.course}</div>
                    <div className="text-xs font-bold">{item.title}</div>
                    <div className="text-[10px] text-slate-400">Entrega: {item.due}</div>
                  </div>
                  <button
                    onClick={() => {
                      sounds.playSuccess();
                      setAssignments(assignments.map((a) => a.id === item.id ? { ...a, done: !a.done } : a));
                    }}
                    className={(item.done ? 'bg-emerald-600 text-white ' : 'bg-white/10 text-slate-400 ') + 'px-3 py-1.5 rounded-full text-[11px] font-bold flex items-center gap-1 cursor-pointer zentry-press'}
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>{item.done ? 'Entregado' : 'Pendiente'}</span>
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 6. OTHER APPS FALLBACK / EMBEDDED PORTAL */}
        {!['docs', 'sheets', 'drive', 'gmail', 'classroom'].includes(appInfo.type) && (
          <div className={(isDark ? 'zentry-veil-dark ' : 'zentry-veil-light ') + 'flex-1 flex flex-col items-center justify-center rounded-[24px] p-8 text-center space-y-3 border border-white/20'}>
            <div className="p-4 rounded-full bg-white/10 border border-white/20">
              <Sparkles className="w-8 h-8 text-indigo-400" />
            </div>
            <div className="text-sm font-bold">{appInfo.name} Protegido por Zentry</div>
            <div className="text-xs text-slate-400 max-w-sm">
              Esta aplicación se ejecuta en una capa protegida que filtra contenido inapropiado y regula el tiempo de uso.
            </div>
            <button
              onClick={() => window.open(appInfo.url, '_blank')}
              className="px-5 py-2.5 rounded-full bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md flex items-center gap-1.5 cursor-pointer zentry-press"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Acceder al Servicio Oficial</span>
            </button>
          </div>
        )}
      </div>
    </ZentrySubPageScaffold>
  );
};
