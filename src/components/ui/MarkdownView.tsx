import React from 'react';

interface Props {
  content: string;
  className?: string;
  isDark?: boolean;
}

export const MarkdownView: React.FC<Props> = ({ content, className = '', isDark = false }) => {
  if (!content) return null;

  const lines = content.split('\n');

  return (
    <div className={`space-y-2 text-xs md:text-sm leading-relaxed ${isDark ? 'text-slate-100' : 'text-slate-800'} ${className}`}>
      {lines.map((line, idx) => {
        const trimmed = line.trim();
        if (!trimmed) return <div key={idx} className="h-1" />;

        if (trimmed.startsWith('# ')) {
          return (
            <h1 key={idx} className="text-base md:text-lg font-bold text-indigo-400 mt-2 mb-1">
              {formatInline(trimmed.substring(2))}
            </h1>
          );
        }
        if (trimmed.startsWith('## ')) {
          return (
            <h2 key={idx} className="text-sm md:text-base font-bold text-sky-400 mt-2 mb-1">
              {formatInline(trimmed.substring(3))}
            </h2>
          );
        }
        if (trimmed.startsWith('### ')) {
          return (
            <h3 key={idx} className="text-xs md:text-sm font-bold text-purple-400 mt-1">
              {formatInline(trimmed.substring(4))}
            </h3>
          );
        }
        if (trimmed.startsWith('* ') || trimmed.startsWith('- ')) {
          return (
            <div key={idx} className="flex items-start gap-2 pl-2">
              <span className="text-indigo-400 font-bold mt-0.5">•</span>
              <span className="flex-1">{formatInline(trimmed.substring(2))}</span>
            </div>
          );
        }

        const numMatch = trimmed.match(/^(\d+)\.\s+(.*)/);
        if (numMatch) {
          return (
            <div key={idx} className="flex items-start gap-2 pl-2">
              <span className="text-sky-400 font-bold">{numMatch[1]}.</span>
              <span className="flex-1">{formatInline(numMatch[2])}</span>
            </div>
          );
        }

        return <p key={idx}>{formatInline(trimmed)}</p>;
      })}
    </div>
  );
};

function formatInline(text: string): React.ReactNode[] {
  const parts: React.ReactNode[] = [];
  let remaining = text;
  let keyIdx = 0;

  while (remaining.length > 0) {
    const boldMatch = remaining.match(/\*\*(.*?)\*\*/);
    const codeMatch = remaining.match(/`(.*?)`/);

    let firstMatchIndex = -1;
    let matchType = '';
    let matchText = '';
    let fullMatch = '';

    if (boldMatch && boldMatch.index !== undefined) {
      firstMatchIndex = boldMatch.index;
      matchType = 'bold';
      matchText = boldMatch[1];
      fullMatch = boldMatch[0];
    }

    if (codeMatch && codeMatch.index !== undefined) {
      if (firstMatchIndex === -1 || codeMatch.index < firstMatchIndex) {
        firstMatchIndex = codeMatch.index;
        matchType = 'code';
        matchText = codeMatch[1];
        fullMatch = codeMatch[0];
      }
    }

    if (firstMatchIndex === -1) {
      parts.push(remaining);
      break;
    }

    if (firstMatchIndex > 0) {
      parts.push(remaining.substring(0, firstMatchIndex));
    }

    if (matchType === 'bold') {
      parts.push(<strong key={keyIdx++} className="font-bold text-indigo-300">{matchText}</strong>);
    } else if (matchType === 'code') {
      parts.push(<code key={keyIdx++} className="px-1.5 py-0.5 rounded bg-black/20 font-mono text-[11px] text-amber-300">{matchText}</code>);
    }

    remaining = remaining.substring(firstMatchIndex + fullMatch.length);
  }

  return parts;
}
