import React, { useState, useEffect, useRef } from 'react';
import { 
  Folder, 
  Image as ImageIcon, 
  FileText, 
  Download, 
  Upload, 
  Search, 
  Trash2, 
  Eye, 
  X, 
  Sparkles, 
  BookOpen, 
  Plus, 
  ExternalLink,
  ChevronRight
} from 'lucide-react';
import { ZentrySubPageScaffold } from '../shell/ZentrySubPageScaffold';
import { sounds } from '../../services/soundEffects';
import { MarkdownView } from '../ui/MarkdownView';
import type { ScreenId } from '../../types/zentry';

interface Props {
  onBack: () => void;
  onNavigate?: (screen: ScreenId) => void;
  isDark: boolean;
}

interface LocalFileItem {
  id: string;
  name: string;
  type: 'redactor' | 'research' | 'image' | 'upload';
  date: string;
  size: string;
  content: string;
  previewUrl?: string;
}

export const ZentryFilesScreen: React.FC<Props> = ({ onBack, onNavigate, isDark }) => {
  const [filter, setFilter] = useState<'all' | 'redactor' | 'research' | 'image' | 'upload'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFile, setSelectedFile] = useState<LocalFileItem | null>(null);

  // Uploaded files stored locally
  const [uploadedFiles, setUploadedFiles] = useState<LocalFileItem[]>(() => {
    try {
      const saved = localStorage.getItem('zentry_user_uploaded_files');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Collect all real files from Zentry ecosystem
  const [allFiles, setAllFiles] = useState<LocalFileItem[]>([]);

  const refreshEcosystemFiles = () => {
    const files: LocalFileItem[] = [];

    // 1. Redactor Drafts
    try {
      const redactorData = localStorage.getItem('zentry_redactor_drafts');
      if (redactorData) {
        const drafts = JSON.parse(redactorData);
        drafts.forEach((d: any) => {
          files.push({
            id: `redactor_${d.id}`,
            name: `${d.title || 'Borrador sin título'}.md`,
            type: 'redactor',
            date: d.date || 'Reciente',
            size: `${(d.documentContent?.length || 100) / 1000 > 1 ? ((d.documentContent.length / 1000).toFixed(1) + ' KB') : '500 B'}`,
            content: d.documentContent || '# Documento'
          });
        });
      }
    } catch (e) {}

    // 2. Research Notebooks
    try {
      const researchData = localStorage.getItem('zentry_research_history');
      if (researchData) {
        const research = JSON.parse(researchData);
        research.forEach((r: any) => {
          files.push({
            id: `research_${r.id}`,
            name: `Investigación - ${r.topic || 'Tema'}.md`,
            type: 'research',
            date: r.date || 'Reciente',
            size: `${(r.fullReport?.length || 200) / 1000 > 1 ? ((r.fullReport.length / 1000).toFixed(1) + ' KB') : '1.2 KB'}`,
            content: r.fullReport || `# ${r.topic}`
          });
        });
      }
    } catch (e) {}

    // 3. User Uploaded Files
    uploadedFiles.forEach((u) => files.push(u));

    setAllFiles(files);
  };

  useEffect(() => {
    refreshEcosystemFiles();
  }, [uploadedFiles]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    sounds.playSuccess();
    const isImg = file.type.startsWith('image/');
    const reader = new FileReader();

    reader.onload = () => {
      const content = reader.result as string;
      const newFile: LocalFileItem = {
        id: `upload_${Date.now()}`,
        name: file.name,
        type: isImg ? 'image' : 'upload',
        date: new Date().toLocaleDateString('es-ES', { day: 'numeric', month: 'short' }),
        size: `${(file.size / 1024).toFixed(1)} KB`,
        content: isImg ? '' : content,
        previewUrl: isImg ? content : undefined
      };

      const updated = [newFile, ...uploadedFiles];
      setUploadedFiles(updated);
      try {
        localStorage.setItem('zentry_user_uploaded_files', JSON.stringify(updated));
      } catch (err) {}
    };

    if (isImg) {
      reader.readAsDataURL(file);
    } else {
      reader.readAsText(file);
    }
  };

  const handleDeleteFile = (file: LocalFileItem, e?: React.MouseEvent) => {
    e?.stopPropagation();
    sounds.playTap();

    if (!window.confirm(`¿Deseas eliminar "${file.name}"?`)) return;

    if (file.id.startsWith('upload_')) {
      const updated = uploadedFiles.filter((f) => f.id !== file.id);
      setUploadedFiles(updated);
      localStorage.setItem('zentry_user_uploaded_files', JSON.stringify(updated));
    } else if (file.id.startsWith('redactor_')) {
      const rawId = file.id.replace('redactor_', '');
      try {
        const saved = JSON.parse(localStorage.getItem('zentry_redactor_drafts') || '[]');
        const updated = saved.filter((d: any) => d.id !== rawId);
        localStorage.setItem('zentry_redactor_drafts', JSON.stringify(updated));
      } catch {}
    } else if (file.id.startsWith('research_')) {
      const rawId = file.id.replace('research_', '');
      try {
        const saved = JSON.parse(localStorage.getItem('zentry_research_history') || '[]');
        const updated = saved.filter((r: any) => r.id !== rawId);
        localStorage.setItem('zentry_research_history', JSON.stringify(updated));
      } catch {}
    }

    if (selectedFile?.id === file.id) {
      setSelectedFile(null);
    }
    refreshEcosystemFiles();
  };

  const handleDownloadFile = (file: LocalFileItem, e?: React.MouseEvent) => {
    e?.stopPropagation();
    sounds.playSuccess();

    if (file.previewUrl) {
      const a = document.createElement('a');
      a.href = file.previewUrl;
      a.download = file.name;
      a.click();
    } else {
      const blob = new Blob([file.content], { type: 'text/markdown;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = file.name;
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  const filteredFiles = allFiles.filter((f) => {
    if (filter !== 'all' && f.type !== filter) return false;
    if (searchQuery.trim() && !f.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const getIcon = (type: string) => {
    switch (type) {
      case 'redactor': return { Icon: FileText, color: 'text-emerald-400', badge: 'Redactor IA' };
      case 'research': return { Icon: BookOpen, color: 'text-sky-400', badge: 'Investigación' };
      case 'image': return { Icon: ImageIcon, color: 'text-pink-400', badge: 'Imagen' };
      default: return { Icon: Folder, color: 'text-amber-400', badge: 'Archivo' };
    }
  };

  return (
    <ZentrySubPageScaffold title="Archivos & Bóveda" kicker="ECOSISTEMA ZENTRY" onBack={onBack} isDark={isDark}>
      <div className="max-w-2xl mx-auto w-full h-full flex flex-col space-y-3 overflow-hidden">
        {/* Hidden File Input */}
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          onChange={handleFileUpload}
        />

        {/* Top Action Bar: Search & Upload */}
        <div className="flex items-center gap-2">
          <div className="flex-1 relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar en tus archivos y tareas..."
              className={(isDark ? 'bg-white/10 text-white placeholder-slate-400 border-white/20 ' : 'bg-white/80 text-[#1E293B] placeholder-slate-400 border-white/60 ') + 'w-full pl-9 pr-3 py-2 rounded-full border text-xs font-medium focus:outline-none shadow-sm'}
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          </div>

          <button
            onClick={() => fileInputRef.current?.click()}
            className="px-4 py-2 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-xs font-bold shadow-md flex items-center gap-1.5 cursor-pointer zentry-press shrink-0"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Subir Archivo</span>
          </button>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
          {[
            { id: 'all', label: `Todos (${allFiles.length})` },
            { id: 'redactor', label: 'Ensayos & Cuentos' },
            { id: 'research', label: 'Investigaciones' },
            { id: 'image', label: 'Imágenes & Dibujos' },
            { id: 'upload', label: 'Subidos' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                sounds.playTap();
                setFilter(tab.id as any);
              }}
              className={(filter === tab.id ? 'bg-indigo-600 text-white shadow-md ' : (isDark ? 'bg-white/10 text-slate-300 ' : 'bg-white/80 text-slate-600 ')) + 'px-3 py-1 rounded-full text-[11px] font-semibold transition-all cursor-pointer whitespace-nowrap zentry-press border border-white/10'}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Files Grid / List View */}
        <div className="flex-1 overflow-y-auto space-y-2 pr-1">
          {filteredFiles.length === 0 ? (
            <div className={(isDark ? 'zentry-veil-dark ' : 'zentry-veil-light ') + 'rounded-[24px] p-8 text-center space-y-2'}>
              <Folder className="w-8 h-8 text-slate-400 mx-auto" />
              <div className="text-xs font-bold">No hay archivos en esta sección</div>
              <div className="text-[11px] text-slate-400">
                Los cuentos que redactes con IA, tus investigaciones de ciencias y los archivos que subas aparecerán aquí automáticamente.
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {filteredFiles.map((file) => {
                const { Icon, color, badge } = getIcon(file.type);
                return (
                  <div
                    key={file.id}
                    onClick={() => {
                      sounds.playTap();
                      setSelectedFile(file);
                    }}
                    className={(isDark ? 'bg-white/10 hover:bg-white/15 border-white/15 ' : 'bg-white/85 hover:bg-white border-white/40 ') + 'p-3.5 rounded-[20px] border flex items-center justify-between cursor-pointer transition-all zentry-press shadow-sm group'}
                  >
                    <div className="flex items-center gap-2.5 min-w-0 flex-1">
                      <div className="p-2 rounded-xl bg-white/10 shrink-0">
                        <Icon className={'w-5 h-5 ' + color} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-xs font-bold truncate">{file.name}</div>
                        <div className="text-[10px] text-slate-400 flex items-center gap-1.5 mt-0.5">
                          <span className="px-1.5 py-0.2 rounded bg-white/10 font-semibold">{badge}</span>
                          <span>•</span>
                          <span>{file.size}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0 ml-2">
                      <button
                        onClick={(e) => handleDownloadFile(file, e)}
                        title="Descargar"
                        className="p-1.5 rounded-full hover:bg-white/20 text-slate-300 hover:text-emerald-400 cursor-pointer"
                      >
                        <Download className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={(e) => handleDeleteFile(file, e)}
                        title="Eliminar"
                        className="p-1.5 rounded-full hover:bg-red-500/20 text-slate-400 hover:text-red-400 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>

                      <ChevronRight className="w-4 h-4 text-slate-400" />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* File Detail Modal / Reader */}
        {selectedFile && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in">
            <div className={(isDark ? 'zentry-glass-dark text-white ' : 'zentry-glass-light text-[#1E293B] ') + 'w-full max-w-xl max-h-[85vh] rounded-[28px] p-5 shadow-2xl flex flex-col space-y-3 overflow-hidden border border-white/30'}>
              {/* Modal Header */}
              <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
                <div className="flex items-center gap-2 min-w-0">
                  <FileText className="w-4 h-4 text-indigo-400 shrink-0" />
                  <span className="text-xs font-bold truncate">{selectedFile.name}</span>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    onClick={() => handleDownloadFile(selectedFile)}
                    className="p-1.5 rounded-full hover:bg-white/10 text-emerald-400 cursor-pointer"
                    title="Descargar archivo"
                  >
                    <Download className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => handleDeleteFile(selectedFile)}
                    className="p-1.5 rounded-full hover:bg-red-500/20 text-red-400 cursor-pointer"
                    title="Eliminar archivo"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => setSelectedFile(null)}
                    className="p-1.5 rounded-full hover:bg-white/10 text-slate-400 hover:text-white cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Modal Body / Viewer */}
              <div className="flex-1 overflow-y-auto rounded-[20px] bg-black/20 p-4 border border-white/10">
                {selectedFile.previewUrl ? (
                  <img
                    src={selectedFile.previewUrl}
                    alt={selectedFile.name}
                    className="max-w-full max-h-96 mx-auto rounded-xl object-contain"
                  />
                ) : (
                  <MarkdownView content={selectedFile.content} isDark={isDark} />
                )}
              </div>

              {/* Action Footer */}
              <div className="flex items-center justify-end gap-2 pt-1">
                {selectedFile.type === 'redactor' && onNavigate && (
                  <button
                    onClick={() => {
                      sounds.playSuccess();
                      setSelectedFile(null);
                      onNavigate('redactor');
                    }}
                    className="px-4 py-1.5 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer zentry-press"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Continuar Escribiendo en Redactor</span>
                  </button>
                )}

                {selectedFile.type === 'research' && onNavigate && (
                  <button
                    onClick={() => {
                      sounds.playSuccess();
                      setSelectedFile(null);
                      onNavigate('deep_research');
                    }}
                    className="px-4 py-1.5 rounded-full bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer zentry-press"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Ver en Investigador AI</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </ZentrySubPageScaffold>
  );
};
