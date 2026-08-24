import csv
import json

csv_filename = "D:/1_jose_angel/1_GitHub/Zentry/zentryos-worktrees/entertainment/curated_kids_content_200.csv"
tsv_filename = "D:/1_jose_angel/1_GitHub/Zentry/zentryos-worktrees/entertainment/curated_kids_content_200_google_sheets.tsv"
html_filename = "D:/1_jose_angel/1_GitHub/Zentry/zentryos-worktrees/entertainment/curated_kids_content_200.html"

rows = []
with open(csv_filename, "r", encoding="utf-8-sig") as f:
    reader = csv.DictReader(f)
    for r in reader:
        rows.append(r)

# Generate TSV
fieldnames = ["id", "plataforma", "tematica", "titulo", "creador", "url_directa", "url_embed", "codigo_embed", "edad_recomendada", "descripcion"]

with open(tsv_filename, "w", newline="", encoding="utf-8") as tsvfile:
    writer = csv.DictWriter(tsvfile, fieldnames=fieldnames, delimiter="\t")
    writer.writeheader()
    for row in rows:
        writer.writerow(row)

print(f"Generated TSV in {tsv_filename}")

# Generate updated HTML viewer with 1-click copy to Google Sheets clipboard
json_data = json.dumps(rows, ensure_ascii=False)

html_content = f"""<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>ZentryOS Kids (2-5 años) — Hoja de Cálculo Google Sheets</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800;900&display=swap" rel="stylesheet">
  <style>
    body {{ font-family: 'Plus Jakarta Sans', sans-serif; background-color: #080d1a; color: #f1f5f9; }}
    .glass {{ background: rgba(255, 255, 255, 0.05); backdrop-filter: blur(18px); border: 1px solid rgba(255, 255, 255, 0.12); }}
    .badge-yt {{ background: rgba(239, 68, 68, 0.25); color: #fca5a5; border: 1px solid rgba(239, 68, 68, 0.5); }}
    .badge-tt {{ background: rgba(6, 182, 212, 0.25); color: #67e8f9; border: 1px solid rgba(6, 182, 212, 0.5); }}
    .badge-ig {{ background: rgba(236, 72, 153, 0.25); color: #f9a8d4; border: 1px solid rgba(236, 72, 153, 0.5); }}
    .badge-ytm {{ background: rgba(168, 85, 247, 0.25); color: #d8b4fe; border: 1px solid rgba(168, 85, 247, 0.5); }}
  </style>
</head>
<body class="min-h-screen p-3 sm:p-6 md:p-8">
  <div class="max-w-7xl mx-auto space-y-6">
    <!-- Header -->
    <div class="glass p-6 sm:p-8 rounded-3xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-2xl">
      <div>
        <div class="flex items-center gap-3">
          <span class="text-3xl sm:text-4xl animate-bounce">📊👶✨</span>
          <h1 class="text-xl sm:text-2xl md:text-3xl font-black text-white tracking-tight">ZentryOS Kids — 200 Contenidos para Google Sheets</h1>
        </div>
        <p class="text-xs sm:text-sm text-slate-300 mt-1.5">
          200 Contenidos reales y verificados (2 a 5 años) • 50 YouTube, 50 TikTok, 50 Instagram, 50 YouTube Music
        </p>
      </div>

      <!-- Action Buttons -->
      <div class="flex flex-wrap items-center gap-3">
        <button onclick="copyForGoogleSheets()" id="btn-copy" class="px-5 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs flex items-center gap-2 transition-all shadow-lg hover:scale-105 active:scale-95 cursor-pointer">
          <span id="copy-icon">📋</span>
          <span id="copy-text">Copiar para Google Sheets (1-Click)</span>
        </button>

        <a href="https://sheets.new" target="_blank" class="px-5 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xs flex items-center gap-2 transition-all shadow-lg hover:scale-105 active:scale-95">
          <span>🚀 Abrir Google Sheets (sheets.new)</span>
        </a>

        <a href="curated_kids_content_200.csv" download class="px-4 py-2.5 rounded-2xl bg-white/10 hover:bg-white/20 text-slate-200 font-bold text-xs flex items-center gap-2 transition-all border border-white/20">
          <span>📥 Descargar CSV</span>
        </a>
      </div>
    </div>

    <!-- Quick Instructions Box -->
    <div class="glass p-4 rounded-2xl border border-emerald-500/30 bg-emerald-950/20 flex items-center justify-between text-xs text-emerald-300">
      <div class="flex items-center gap-2">
        <span class="text-base">💡</span>
        <span><strong>Cómo pegar en Google Sheets:</strong> Haz clic en <em>"Copiar para Google Sheets"</em>, luego abre <a href="https://sheets.new" target="_blank" class="underline font-bold text-white">sheets.new</a>, selecciona la celda <strong>A1</strong> y presiona <kbd class="bg-black/40 px-1.5 py-0.5 rounded border border-emerald-400/40 text-white font-mono">Ctrl + V</kbd>. ¡Todas las 200 filas y columnas se ordenan al instante!</span>
      </div>
    </div>

    <!-- Stats & Filters -->
    <div class="glass p-4 rounded-2xl flex flex-wrap items-center justify-between gap-4">
      <div class="flex flex-wrap items-center gap-2" id="platform-filters">
        <button onclick="setFilter('ALL')" class="filter-btn px-4 py-2 rounded-xl text-xs font-bold bg-white/20 text-white border border-white/30 cursor-pointer transition-all" data-filter="ALL">Todos (200)</button>
        <button onclick="setFilter('YouTube')" class="filter-btn px-4 py-2 rounded-xl text-xs font-bold bg-white/5 text-slate-300 border border-white/10 hover:text-white cursor-pointer transition-all" data-filter="YouTube">YouTube (50)</button>
        <button onclick="setFilter('TikTok')" class="filter-btn px-4 py-2 rounded-xl text-xs font-bold bg-white/5 text-slate-300 border border-white/10 hover:text-white cursor-pointer transition-all" data-filter="TikTok">TikTok (50)</button>
        <button onclick="setFilter('Instagram')" class="filter-btn px-4 py-2 rounded-xl text-xs font-bold bg-white/5 text-slate-300 border border-white/10 hover:text-white cursor-pointer transition-all" data-filter="Instagram">Instagram (50)</button>
        <button onclick="setFilter('YouTube Music')" class="filter-btn px-4 py-2 rounded-xl text-xs font-bold bg-white/5 text-slate-300 border border-white/10 hover:text-white cursor-pointer transition-all" data-filter="YouTube Music">YouTube Music (50)</button>
      </div>
      <div class="w-full md:w-80">
        <input type="text" id="search-box" oninput="renderTable()" placeholder="🔍 Buscar por título, creador o temática..." class="w-full px-4 py-2 rounded-xl bg-white/10 border border-white/20 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-indigo-400" />
      </div>
    </div>

    <!-- Table Container -->
    <div class="glass rounded-3xl overflow-hidden shadow-2xl">
      <div class="overflow-x-auto max-h-[70vh]">
        <table class="w-full text-left text-xs border-collapse">
          <thead class="sticky top-0 z-20">
            <tr class="bg-slate-900/90 backdrop-blur-md text-slate-300 font-extrabold uppercase tracking-wider border-b border-white/10">
              <th class="p-3.5">ID</th>
              <th class="p-3.5">Plataforma</th>
              <th class="p-3.5">Temática</th>
              <th class="p-3.5">Título</th>
              <th class="p-3.5">Creador</th>
              <th class="p-3.5">Edad</th>
              <th class="p-3.5">Enlace Directo</th>
              <th class="p-3.5">Embed Link</th>
              <th class="p-3.5">Descripción Pedagógica</th>
            </tr>
          </thead>
          <tbody id="table-body" class="divide-y divide-white/5 text-slate-300 font-medium">
            <!-- Rendered by JS -->
          </tbody>
        </table>
      </div>
    </div>
  </div>

  <script>
    const items = {json_data};
    let currentFilter = 'ALL';

    function copyForGoogleSheets() {{
      const headers = ["ID", "Plataforma", "Temática", "Título", "Creador", "Enlace Directo", "Embed Link", "Código Embed", "Edad Recomendada", "Descripción"];
      const tsvLines = [headers.join("\\t")];

      items.forEach(it => {{
        const row = [
          it.id,
          it.plataforma,
          it.tematica,
          it.titulo.replace(/\\t|\\n/g, ' '),
          it.creador.replace(/\\t|\\n/g, ' '),
          it.url_directa,
          it.url_embed,
          it.codigo_embed.replace(/\\t|\\n/g, ' '),
          it.edad_recomendada,
          it.descripcion.replace(/\\t|\\n/g, ' ')
        ];
        tsvLines.push(row.join("\\t"));
      }});

      const fullTsv = tsvLines.join("\\n");
      navigator.clipboard.writeText(fullTsv).then(() => {{
        const btnText = document.getElementById('copy-text');
        const btnIcon = document.getElementById('copy-icon');
        btnText.innerText = "¡Copiado! Pégalo con Ctrl+V en Google Sheets";
        btnIcon.innerText = "✅";
        setTimeout(() => {{
          btnText.innerText = "Copiar para Google Sheets (1-Click)";
          btnIcon.innerText = "📋";
        }}, 3500);
      }}).catch(err => {{
        alert("Por favor selecciona y descarga el archivo CSV o TSV para importar.");
      }});
    }}

    function setFilter(filter) {{
      currentFilter = filter;
      document.querySelectorAll('.filter-btn').forEach(btn => {{
        if (btn.getAttribute('data-filter') === filter) {{
          btn.className = "filter-btn px-4 py-2 rounded-xl text-xs font-bold bg-white/20 text-white border border-white/30 cursor-pointer transition-all";
        }} else {{
          btn.className = "filter-btn px-4 py-2 rounded-xl text-xs font-bold bg-white/5 text-slate-300 border border-white/10 hover:text-white cursor-pointer transition-all";
        }}
      }});
      renderTable();
    }}

    function getBadgeClass(platform) {{
      if (platform === 'YouTube') return 'badge-yt';
      if (platform === 'TikTok') return 'badge-tt';
      if (platform === 'Instagram') return 'badge-ig';
      return 'badge-ytm';
    }}

    function renderTable() {{
      const query = document.getElementById('search-box').value.toLowerCase().trim();
      const filtered = items.filter(it => {{
        if (currentFilter !== 'ALL' && it.plataforma !== currentFilter) return false;
        if (query) {{
          const txt = (it.titulo + ' ' + it.creador + ' ' + it.tematica + ' ' + it.descripcion).toLowerCase();
          return txt.includes(query);
        }}
        return true;
      }});

      const tbody = document.getElementById('table-body');
      tbody.innerHTML = filtered.map((it, idx) => `
        <tr class="hover:bg-white/5 transition-colors">
          <td class="p-3.5 font-mono text-slate-400 font-bold">${{it.id}}</td>
          <td class="p-3.5">
            <span class="px-2.5 py-1 rounded-full text-[10px] font-black ${{getBadgeClass(it.plataforma)}}">${{it.plataforma}}</span>
          </td>
          <td class="p-3.5 font-bold text-white">${{it.tematica}}</td>
          <td class="p-3.5 font-bold text-indigo-300 max-w-xs">${{it.titulo}}</td>
          <td class="p-3.5 text-slate-200 font-semibold">${{it.creador}}</td>
          <td class="p-3.5 text-emerald-400 font-mono font-bold">${{it.edad_recomendada}}</td>
          <td class="p-3.5">
            <a href="${{it.url_directa}}" target="_blank" class="text-sky-400 hover:underline font-semibold flex items-center gap-1">
              <span>Abrir</span> ↗
            </a>
          </td>
          <td class="p-3.5 max-w-xs">
            <code class="bg-black/60 px-2 py-1 rounded text-[9px] text-amber-300 font-mono block truncate" title="${{it.codigo_embed.replace(/"/g, '&quot;')}}">${{it.url_embed}}</code>
          </td>
          <td class="p-3.5 text-[11px] text-slate-400 max-w-sm leading-relaxed">${{it.descripcion}}</td>
        </tr>
      `).join('');
    }}

    renderTable();
  </script>
</body>
</html>
"""

with open(html_filename, "w", encoding="utf-8") as f:
    f.write(html_content)

print("Updated HTML viewer with 1-click Google Sheets copy!")
