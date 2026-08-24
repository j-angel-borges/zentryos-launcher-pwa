import csv
import json

csv_filename = "D:/1_jose_angel/1_GitHub/Zentry/zentryos-worktrees/entertainment/curated_kids_content_200.csv"
html_filename = "D:/1_jose_angel/1_GitHub/Zentry/zentryos-worktrees/entertainment/curated_kids_content_200.html"

rows = []
with open(csv_filename, "r", encoding="utf-8-sig") as f:
    reader = csv.DictReader(f)
    for r in reader:
        rows.append(r)

json_data = json.dumps(rows, ensure_ascii=False)

html_content = f"""<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>ZentryOS Kids (2-5 años) — 200 Contenidos Curados</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800;900&display=swap" rel="stylesheet">
  <style>
    body {{ font-family: 'Plus Jakarta Sans', sans-serif; background-color: #0b0f19; color: #f1f5f9; }}
    .glass {{ background: rgba(255, 255, 255, 0.05); backdrop-filter: blur(16px); border: 1px solid rgba(255, 255, 255, 0.1); }}
    .badge-yt {{ background: rgba(239, 68, 68, 0.2); color: #f87171; border: 1px solid rgba(239, 68, 68, 0.4); }}
    .badge-tt {{ background: rgba(6, 182, 212, 0.2); color: #22d3ee; border: 1px solid rgba(6, 182, 212, 0.4); }}
    .badge-ig {{ background: rgba(236, 72, 153, 0.2); color: #f472b6; border: 1px solid rgba(236, 72, 153, 0.4); }}
    .badge-ytm {{ background: rgba(168, 85, 247, 0.2); color: #c084fc; border: 1px solid rgba(168, 85, 247, 0.4); }}
  </style>
</head>
<body class="min-h-screen p-4 md:p-8">
  <div class="max-w-7xl mx-auto space-y-6">
    <!-- Header -->
    <div class="glass p-6 rounded-3xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
      <div>
        <div class="flex items-center gap-3">
          <span class="text-3xl">👶🎬</span>
          <h1 class="text-2xl md:text-3xl font-black text-white">Hoja de Cálculo: 200 Contenidos Curados ZentryOS</h1>
        </div>
        <p class="text-sm text-slate-400 mt-1">Perfil 2 a 5 años (Toddlers) • 50 YouTube, 50 TikTok, 50 Instagram, 50 YouTube Music</p>
      </div>
      <div class="flex items-center gap-2">
        <a href="curated_kids_content_200.csv" download class="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center gap-2 transition-all shadow-lg">
          <span>📥 Descargar CSV</span>
        </a>
      </div>
    </div>

    <!-- Filters & Stats -->
    <div class="glass p-4 rounded-2xl flex flex-wrap items-center justify-between gap-4">
      <div class="flex flex-wrap items-center gap-2" id="platform-filters">
        <button onclick="setFilter('ALL')" class="filter-btn px-4 py-1.5 rounded-full text-xs font-bold bg-white/20 text-white border border-white/30" data-filter="ALL">Todos (200)</button>
        <button onclick="setFilter('YouTube')" class="filter-btn px-4 py-1.5 rounded-full text-xs font-bold bg-white/5 text-slate-400 border border-white/10 hover:text-white" data-filter="YouTube">YouTube (50)</button>
        <button onclick="setFilter('TikTok')" class="filter-btn px-4 py-1.5 rounded-full text-xs font-bold bg-white/5 text-slate-400 border border-white/10 hover:text-white" data-filter="TikTok">TikTok (50)</button>
        <button onclick="setFilter('Instagram')" class="filter-btn px-4 py-1.5 rounded-full text-xs font-bold bg-white/5 text-slate-400 border border-white/10 hover:text-white" data-filter="Instagram">Instagram (50)</button>
        <button onclick="setFilter('YouTube Music')" class="filter-btn px-4 py-1.5 rounded-full text-xs font-bold bg-white/5 text-slate-400 border border-white/10 hover:text-white" data-filter="YouTube Music">YouTube Music (50)</button>
      </div>
      <div class="w-full md:w-72">
        <input type="text" id="search-box" oninput="renderTable()" placeholder="🔍 Buscar por título, creador..." class="w-full px-4 py-2 rounded-xl bg-white/10 border border-white/20 text-xs text-white focus:outline-none focus:border-indigo-400" />
      </div>
    </div>

    <!-- Table Container -->
    <div class="glass rounded-3xl overflow-hidden shadow-2xl">
      <div class="overflow-x-auto">
        <table class="w-full text-left text-xs border-collapse">
          <thead>
            <tr class="bg-white/10 text-slate-300 font-extrabold uppercase tracking-wider border-b border-white/10">
              <th class="p-3.5">ID</th>
              <th class="p-3.5">Plataforma</th>
              <th class="p-3.5">Temática</th>
              <th class="p-3.5">Título</th>
              <th class="p-3.5">Creador</th>
              <th class="p-3.5">Edad</th>
              <th class="p-3.5">Enlace Directo</th>
              <th class="p-3.5">Código Embed</th>
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

    function setFilter(filter) {{
      currentFilter = filter;
      document.querySelectorAll('.filter-btn').forEach(btn => {{
        if (btn.getAttribute('data-filter') === filter) {{
          btn.className = "filter-btn px-4 py-1.5 rounded-full text-xs font-bold bg-white/20 text-white border border-white/30";
        }} else {{
          btn.className = "filter-btn px-4 py-1.5 rounded-full text-xs font-bold bg-white/5 text-slate-400 border border-white/10 hover:text-white";
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
          <td class="p-3.5 text-slate-300 font-semibold">${{it.creador}}</td>
          <td class="p-3.5 text-emerald-400 font-mono font-bold">${{it.edad_recomendada}}</td>
          <td class="p-3.5">
            <a href="${{it.url_directa}}" target="_blank" class="text-sky-400 hover:underline font-semibold flex items-center gap-1">
              <span>Abrir URL</span> ↗
            </a>
          </td>
          <td class="p-3.5 max-w-xs">
            <code class="bg-black/50 px-2 py-1 rounded text-[9px] text-amber-300 font-mono block truncate" title="${{it.codigo_embed.replace(/"/g, '&quot;')}}">${{it.url_embed}}</code>
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

print(f"Successfully generated HTML spreadsheet viewer in {html_filename}")
