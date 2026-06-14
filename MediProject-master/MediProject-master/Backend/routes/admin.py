"""
Simple read-only admin DB viewer — accessible at http://localhost:8000/admin
Shows all tables and their rows as an HTML page. No auth (dev only).
"""
from fastapi import APIRouter
from fastapi.responses import HTMLResponse
import sqlite3, os

router = APIRouter()
DB_PATH = os.path.join(os.path.dirname(__file__), "..", "medilocker.db")


def _get_tables():
    conn = sqlite3.connect(DB_PATH)
    cur = conn.cursor()
    cur.execute("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'")
    tables = [r[0] for r in cur.fetchall()]
    result = {}
    for table in tables:
        cur.execute(f"PRAGMA table_info({table})")
        cols = [r[1] for r in cur.fetchall()]
        cur.execute(f"SELECT * FROM {table}")
        rows = cur.fetchall()
        result[table] = {"cols": cols, "rows": rows}
    conn.close()
    return result


@router.get("/admin", response_class=HTMLResponse, include_in_schema=False)
def admin_viewer():
    tables = _get_tables()

    tab_btns = "".join(
        f'<button class="tab-btn" onclick="show(\'{t}\')" id="btn-{t}">{t} '
        f'<span class="count">{len(d["rows"])}</span></button>'
        for t, d in tables.items()
    )

    panels = ""
    for t, d in tables.items():
        if not d["cols"]:
            panels += f'<div class="panel" id="panel-{t}"><p class="empty">No columns.</p></div>'
            continue
        header = "".join(f"<th>{c}</th>" for c in d["cols"])
        if d["rows"]:
            body = "".join(
                "<tr>" + "".join(f"<td>{cell}</td>" for cell in row) + "</tr>"
                for row in d["rows"]
            )
        else:
            body = f'<tr><td colspan="{len(d["cols"])}" class="empty">No rows yet.</td></tr>'
        panels += f'''
        <div class="panel" id="panel-{t}">
          <div class="panel-head">
            <span>{t}</span>
            <span class="row-count">{len(d["rows"])} rows</span>
          </div>
          <div class="table-wrap">
            <table><thead><tr>{header}</tr></thead><tbody>{body}</tbody></table>
          </div>
        </div>'''

    first = list(tables.keys())[0] if tables else ""

    html = f"""<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>MediLocker — DB Viewer</title>
<style>
  :root{{--accent:#005b96;--bg:#f0f5fb;--panel:#fff;--border:#e2eaf3;--muted:#5b6775;--text:#0f172a;}}
  *{{box-sizing:border-box;margin:0;padding:0;}}
  body{{font-family:Inter,system-ui,sans-serif;background:var(--bg);color:var(--text);display:flex;height:100vh;overflow:hidden;}}
  /* Sidebar */
  .sidebar{{width:220px;background:var(--panel);border-right:1px solid var(--border);display:flex;flex-direction:column;overflow-y:auto;flex-shrink:0;}}
  .sidebar-head{{padding:20px 18px 14px;border-bottom:1px solid var(--border);}}
  .sidebar-head h1{{font-size:1rem;font-weight:700;color:var(--accent);}}
  .sidebar-head p{{font-size:0.75rem;color:var(--muted);margin-top:3px;}}
  .tab-btn{{display:flex;justify-content:space-between;align-items:center;width:100%;padding:11px 18px;border:none;background:transparent;cursor:pointer;font-size:0.88rem;color:var(--text);text-align:left;border-left:3px solid transparent;transition:background .15s;}}
  .tab-btn:hover{{background:#f0f5fb;}}
  .tab-btn.active{{background:#d7e8ff;color:var(--accent);font-weight:600;border-left-color:var(--accent);}}
  .count{{background:#e2eaf3;color:var(--muted);font-size:0.72rem;padding:2px 7px;border-radius:999px;}}
  .tab-btn.active .count{{background:var(--accent);color:#fff;}}
  /* Main */
  .main{{flex:1;display:flex;flex-direction:column;overflow:hidden;}}
  .topbar{{padding:14px 24px;background:var(--panel);border-bottom:1px solid var(--border);display:flex;justify-content:space-between;align-items:center;}}
  .topbar h2{{font-size:1rem;font-weight:600;}}
  .refresh-btn{{padding:7px 18px;border:1.5px solid var(--accent);background:transparent;color:var(--accent);border-radius:10px;cursor:pointer;font-size:0.85rem;font-weight:600;transition:background .15s;}}
  .refresh-btn:hover{{background:var(--accent);color:#fff;}}
  .content{{flex:1;overflow-y:auto;padding:24px;}}
  /* Panels */
  .panel{{display:none;}}
  .panel.active{{display:block;}}
  .panel-head{{display:flex;justify-content:space-between;align-items:center;margin-bottom:14px;}}
  .panel-head span{{font-size:1rem;font-weight:700;}}
  .row-count{{font-size:0.8rem;color:var(--muted);background:#f0f5fb;padding:3px 12px;border-radius:999px;}}
  .table-wrap{{overflow-x:auto;background:var(--panel);border-radius:14px;border:1px solid var(--border);}}
  table{{border-collapse:collapse;width:100%;font-size:0.85rem;}}
  thead tr{{background:#f8faff;}}
  th{{padding:12px 14px;text-align:left;color:var(--muted);font-weight:600;font-size:0.78rem;text-transform:uppercase;letter-spacing:.04em;border-bottom:1px solid var(--border);white-space:nowrap;}}
  td{{padding:11px 14px;border-bottom:1px solid #f0f4f8;color:var(--text);max-width:280px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}}
  tr:last-child td{{border-bottom:none;}}
  tr:hover td{{background:#f8faff;}}
  .empty{{color:var(--muted);text-align:center;padding:32px;font-size:0.9rem;}}
  .badge{{font-size:0.7rem;padding:2px 8px;border-radius:6px;background:#e3f5e9;color:#1d6d3e;font-weight:600;}}
</style>
</head>
<body>
<div class="sidebar">
  <div class="sidebar-head">
    <h1>🗄️ MediLocker DB</h1>
    <p>Live database viewer</p>
  </div>
  {tab_btns}
</div>
<div class="main">
  <div class="topbar">
    <h2 id="current-table">—</h2>
    <button class="refresh-btn" onclick="location.reload()">⟳ Refresh</button>
  </div>
  <div class="content">
    {panels}
  </div>
</div>
<script>
  function show(name){{
    document.querySelectorAll('.panel').forEach(p=>p.classList.remove('active'));
    document.querySelectorAll('.tab-btn').forEach(b=>b.classList.remove('active'));
    const panel=document.getElementById('panel-'+name);
    const btn=document.getElementById('btn-'+name);
    if(panel) panel.classList.add('active');
    if(btn) btn.classList.add('active');
    document.getElementById('current-table').textContent=name;
  }}
  // Auto-refresh every 5 seconds
  setInterval(()=>{{
    const active=document.querySelector('.tab-btn.active');
    const name=active?active.id.replace('btn-',''):'';
    fetch(location.href).then(r=>r.text()).then(html=>{{
      const parser=new DOMParser();
      const doc=parser.parseFromString(html,'text/html');
      document.querySelector('.sidebar').innerHTML=doc.querySelector('.sidebar').innerHTML;
      document.querySelector('.content').innerHTML=doc.querySelector('.content').innerHTML;
      if(name) show(name);
    }});
  }},5000);
  show('{first}');
</script>
</body>
</html>"""
    return HTMLResponse(content=html)
