import csv
import json

csv_file = "D:/1_jose_angel/1_GitHub/Zentry/zentryos-worktrees/entertainment/curated_kids_content_200.csv"

rows = []
with open(csv_file, "r", encoding="utf-8-sig") as f:
    reader = csv.DictReader(f)
    for r in reader:
        if r["plataforma"] == "TikTok":
            handle = r["creador"].replace("@", "")
            vid_id = r["url_embed"].split("/")[-1]
            title = r["titulo"]
            # Generate official TikTok oEmbed standard HTML
            r["codigo_embed"] = f'<blockquote class="tiktok-embed" cite="{r["url_directa"]}" data-video-id="{vid_id}" data-embed-from="oembed" style="max-width:605px;min-width:325px;"><section><a target="_blank" title="@{handle}" href="https://www.tiktok.com/@{handle}?refer=embed">@{handle}</a><p>{title}</p><a target="_blank" title="♬ Sonido Original" href="https://www.tiktok.com">♬ Sonido Original - @{handle}</a></section></blockquote><script async src="https://www.tiktok.com/embed.js"></script>'
        rows.append(r)

fieldnames = list(rows[0].keys())
with open(csv_file, "w", newline="", encoding="utf-8-sig") as f:
    writer = csv.DictWriter(f, fieldnames=fieldnames)
    writer.writeheader()
    for row in rows:
        writer.writerow(row)

print("Updated CSV with official TikTok oEmbed format!")
