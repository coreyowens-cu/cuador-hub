"use client";
import { useState, useEffect, useRef } from "react";

const TIMELINE_STATUSES = ["planned","in-progress","completed","on-hold","cancelled"];
const TIMELINE_STATUS_COLORS = { "planned":"#8b7fc0","in-progress":"#c9a84c","completed":"#4d9e8e","on-hold":"#e07b6a","cancelled":"#666" };
const TIMELINE_CATEGORIES = ["Campaign","Initiative","Event","Launch","Milestone","Deliverable","Other"];

function fmtDate(d) {
  if (!d) return "";
  try { const dt = new Date(d + "T12:00:00"); return dt.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "2-digit" }); } catch { return d; }
}

export default function ProjectTimelinePage() {
  const [items, setItems] = useState([]);
  const [filter, setFilter] = useState("all");
  const [selected, setSelected] = useState(null);
  const [showAdd, setShowAdd] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const dragRef = useRef(null);

  useEffect(() => {
    try { const v = localStorage.getItem("shared_ns_ns-timeline"); if (v) setItems(JSON.parse(v)); } catch {}
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!loaded) return;
    try { localStorage.setItem("shared_ns_ns-timeline", JSON.stringify(items)); } catch {}
  }, [items, loaded]);

  const now = new Date();
  const months = [];
  for (let m = -1; m < 8; m++) {
    const d = new Date(now.getFullYear(), now.getMonth() + m, 1);
    months.push({ label: d.toLocaleString("en", { month: "short" }), year: d.getFullYear(), date: d, isCurrent: d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear() });
  }
  const rangeStart = months[0].date.getTime();
  const rangeEnd = new Date(months[months.length - 1].date.getFullYear(), months[months.length - 1].date.getMonth() + 1, 0, 23, 59, 59).getTime();
  const rangeDur = rangeEnd - rangeStart || 1;
  const todayPct = Math.max(0, Math.min(100, ((now.getTime() - rangeStart) / rangeDur) * 100));

  const dateToPercent = (ds) => {
    if (!ds) return 0;
    return Math.max(0, Math.min(100, ((new Date(ds + "T12:00:00").getTime() - rangeStart) / rangeDur) * 100));
  };
  const percentToDate = (pct) => new Date(rangeStart + (pct / 100) * rangeDur).toISOString().slice(0, 10);

  const sorted = [...items].sort((a, b) => new Date(a.startDate || 0) - new Date(b.startDate || 0));
  const filtered = filter === "all" ? sorted : sorted.filter(i => i.status === filter);

  const updateItem = (id, updates) => setItems(p => p.map(i => i.id === id ? { ...i, ...updates } : i));
  const deleteItem = (id) => { setItems(p => p.filter(i => i.id !== id)); if (selected === id) setSelected(null); };
  const addItem = (item) => { setItems(p => [...p, { ...item, id: `tl-${Date.now()}`, createdBy: "Team", createdAt: new Date().toISOString() }]); setShowAdd(false); };

  const startDrag = (e, id, handle) => {
    e.preventDefault(); e.stopPropagation();
    const track = e.currentTarget.closest(".po-ptl-track");
    if (!track) return;
    const rect = track.getBoundingClientRect();
    dragRef.current = { id, handle, rect };
    const onMove = (mv) => {
      if (!dragRef.current) return;
      const { id: eid, handle: h, rect: r } = dragRef.current;
      const pct = Math.max(0, Math.min(100, ((mv.clientX - r.left) / r.width) * 100));
      const nd = percentToDate(pct);
      setItems(p => p.map(item => {
        if (item.id !== eid) return item;
        if (h === "start") { if (pct >= dateToPercent(item.endDate)) return item; return { ...item, startDate: nd }; }
        else { if (pct <= dateToPercent(item.startDate)) return item; return { ...item, endDate: nd }; }
      }));
    };
    const onUp = () => { dragRef.current = null; window.removeEventListener("mousemove", onMove); window.removeEventListener("mouseup", onUp); };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
  };

  const selectedItem = items.find(i => i.id === selected);
  const BG = "#07070f"; const SURF = "#0d0d1a"; const SURF2 = "#111128";
  const BORDER = "rgba(255,255,255,.07)"; const BORDER2 = "rgba(255,255,255,.04)";
  const TEXT = "#ede8df"; const MUTED = "#8a87a8"; const DIM = "#6a6890"; const GOLD = "#c9a84c";
  const FL = { fontSize: 10, letterSpacing: ".1em", textTransform: "uppercase", color: MUTED, fontWeight: 600, marginBottom: 6, display: "block" };
  const FI = { width: "100%", padding: "7px 10px", borderRadius: 7, border: `1px solid ${BORDER}`, background: SURF2, color: TEXT, fontSize: 12, fontFamily: "inherit", boxSizing: "border-box" };

  return (
    <div style={{ minHeight: "100vh", background: BG, color: TEXT, fontFamily: "'DM Sans',sans-serif", display: "flex", flexDirection: "column" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 28px", borderBottom: `1px solid ${BORDER}`, background: SURF, flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{ fontSize: 16, fontWeight: 700, letterSpacing: ".14em", color: TEXT, textTransform: "uppercase" }}>C<span style={{ color: "#3bb54a" }}>Ú</span>RADOR</div>
          <div style={{ width: 1, height: 18, background: BORDER }} />
          <div style={{ fontSize: 13, color: MUTED, letterSpacing: ".06em" }}>📅 Project Timeline</div>
          <div style={{ fontSize: 10, color: MUTED, padding: "2px 8px", border: `1px solid ${BORDER2}`, borderRadius: 100 }}>{items.length} items</div>
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <select value={filter} onChange={e => setFilter(e.target.value)}
            style={{ padding: "5px 10px", borderRadius: 6, border: `1px solid ${BORDER}`, background: SURF2, color: TEXT, fontSize: 11, fontFamily: "inherit" }}>
            <option value="all">All Statuses</option>
            {TIMELINE_STATUSES.map(s => <option key={s} value={s}>{s.replace("-", " ").replace(/\b\w/g, c => c.toUpperCase())}</option>)}
          </select>
          <button onClick={() => setShowAdd(true)} style={{ padding: "5px 14px", borderRadius: 7, border: `1px solid rgba(201,168,76,.3)`, background: "rgba(201,168,76,.08)", color: GOLD, fontFamily: "inherit", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>+ Add Item</button>
          <button onClick={() => window.close()} style={{ padding: "5px 12px", borderRadius: 7, border: `1px solid ${BORDER}`, background: "transparent", color: MUTED, fontFamily: "inherit", fontSize: 12, cursor: "pointer" }}>Close</button>
        </div>
      </div>

      {/* Timeline + Detail */}
      <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>
        {/* Gantt */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
          {/* Month headers */}
          <div style={{ display: "flex", borderBottom: `1px solid ${BORDER}`, flexShrink: 0, background: "rgba(255,255,255,.02)" }}>
            <div style={{ width: 300, flexShrink: 0, padding: "10px 18px", fontSize: 10, color: MUTED, letterSpacing: ".1em", textTransform: "uppercase", fontWeight: 600, borderRight: `1px solid ${BORDER}` }}>Item</div>
            <div style={{ flex: 1, display: "flex" }}>
              {months.map((m, i) => (
                <div key={i} style={{ flex: 1, textAlign: "center", padding: "10px 0", fontSize: 10, color: m.isCurrent ? GOLD : MUTED, fontWeight: m.isCurrent ? 700 : 500, letterSpacing: ".06em", borderRight: i < months.length - 1 ? `1px solid ${BORDER2}` : "none" }}>
                  {m.label} {m.year !== now.getFullYear() ? `'${String(m.year).slice(2)}` : ""}
                </div>
              ))}
            </div>
          </div>
          {/* Rows */}
          <div style={{ flex: 1, overflowY: "auto" }}>
            {filtered.length === 0 && (
              <div style={{ padding: "80px 0", textAlign: "center" }}>
                <div style={{ fontSize: 40, opacity: .2, marginBottom: 14 }}>📅</div>
                <div style={{ fontSize: 14, color: MUTED }}>No items{filter !== "all" ? " matching filter" : " yet"}</div>
              </div>
            )}
            {filtered.map(item => {
              const sc = TIMELINE_STATUS_COLORS[item.status] || "#888";
              const isSelected = selected === item.id;
              const lp = dateToPercent(item.startDate);
              const rp = dateToPercent(item.endDate || item.startDate);
              const wp = Math.max(0.5, rp - lp);
              return (
                <div key={item.id} onClick={() => setSelected(s => s === item.id ? null : item.id)}
                  style={{ display: "flex", borderBottom: `1px solid ${BORDER2}`, cursor: "pointer", background: isSelected ? "rgba(201,168,76,.04)" : "transparent", minHeight: 52 }}
                  onMouseEnter={e => { if (!isSelected) e.currentTarget.style.background = "rgba(255,255,255,.02)"; }}
                  onMouseLeave={e => { e.currentTarget.style.background = isSelected ? "rgba(201,168,76,.04)" : "transparent"; }}>
                  <div style={{ width: 300, flexShrink: 0, padding: "12px 18px", borderRight: `1px solid ${BORDER}`, display: "flex", alignItems: "center", gap: 10, minHeight: "inherit" }}>
                    <div style={{ width: 9, height: 9, borderRadius: "50%", background: sc, flexShrink: 0 }} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 14, color: TEXT, fontWeight: 500, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{item.title}</div>
                      <div style={{ fontSize: 10, color: MUTED, marginTop: 2 }}>{item.category} · {item.owner || "Unassigned"}</div>
                    </div>
                  </div>
                  <div className="po-ptl-track" style={{ flex: 1, position: "relative", minHeight: "inherit", overflow: "hidden" }}>
                    <div style={{ position: "absolute", inset: 0, display: "flex", pointerEvents: "none" }}>
                      {months.map((_, i) => <div key={i} style={{ flex: 1, borderRight: i < months.length - 1 ? `1px solid rgba(255,255,255,.03)` : "none", background: i % 2 === 1 ? "rgba(255,255,255,.006)" : "transparent" }} />)}
                    </div>
                    <div style={{ position: "absolute", left: `${todayPct}%`, top: 0, bottom: 0, borderLeft: "1px dashed rgba(201,168,76,.35)", zIndex: 1, pointerEvents: "none" }} />
                    {item.startDate && item.endDate && (
                      <div style={{ position: "absolute", left: `${lp}%`, width: `${wp}%`, top: "50%", transform: "translateY(-50%)", height: 24, borderRadius: 5, background: `linear-gradient(90deg,${sc}55,${sc}99)`, border: `1px solid ${sc}77`, display: "flex", alignItems: "center", userSelect: "none", zIndex: 2 }}>
                        <div onMouseDown={e => startDrag(e, item.id, "start")} style={{ position: "absolute", left: -1, top: 0, bottom: 0, width: 10, cursor: "ew-resize", display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(0,0,0,.22)", borderRadius: "4px 0 0 4px", zIndex: 3 }}>
                          <div style={{ width: 2, height: 10, background: "rgba(255,255,255,.55)", borderRadius: 1 }} />
                        </div>
                        <div style={{ flex: 1, fontSize: 9, color: "#fff", padding: "0 13px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", opacity: .9 }}>{item.title}</div>
                        <div onMouseDown={e => startDrag(e, item.id, "end")} style={{ position: "absolute", right: -1, top: 0, bottom: 0, width: 10, cursor: "ew-resize", display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(0,0,0,.22)", borderRadius: "0 4px 4px 0", zIndex: 3 }}>
                          <div style={{ width: 2, height: 10, background: "rgba(255,255,255,.55)", borderRadius: 1 }} />
                        </div>
                      </div>
                    )}
                    {item.startDate && item.endDate && (
                      <div style={{ position: "absolute", bottom: 2, left: `${lp}%`, fontSize: 9, color: MUTED, pointerEvents: "none", whiteSpace: "nowrap", paddingLeft: 4 }}>
                        {fmtDate(item.startDate)} – {fmtDate(item.endDate)}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Detail panel */}
        {selectedItem && (
          <div style={{ width: 360, flexShrink: 0, borderLeft: `1px solid ${BORDER}`, display: "flex", flexDirection: "column", background: SURF, overflowY: "auto" }}>
            <div style={{ padding: "16px 20px", borderBottom: `1px solid ${BORDER}`, display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8 }}>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: 15, fontWeight: 600, color: TEXT, lineHeight: 1.3 }}>{selectedItem.title}</div>
                <div style={{ fontSize: 11, color: MUTED, marginTop: 4 }}>{selectedItem.category} · Added by {selectedItem.createdBy || "Team"}</div>
              </div>
              <button onClick={() => setSelected(null)} style={{ width: 26, height: 26, borderRadius: 6, border: `1px solid ${BORDER}`, background: "transparent", color: MUTED, cursor: "pointer", fontSize: 14, display: "grid", placeItems: "center", flexShrink: 0 }}>×</button>
            </div>
            <div style={{ padding: "16px 20px", display: "flex", flexDirection: "column", gap: 16 }}>
              <div>
                <label style={FL}>Status</label>
                <select value={selectedItem.status} onChange={e => updateItem(selectedItem.id, { status: e.target.value })}
                  style={{ ...FI, color: TIMELINE_STATUS_COLORS[selectedItem.status], fontWeight: 600 }}>
                  {TIMELINE_STATUSES.map(s => <option key={s} value={s}>{s.replace("-", " ").replace(/\b\w/g, c => c.toUpperCase())}</option>)}
                </select>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                <div>
                  <label style={FL}>Start Date</label>
                  <input type="date" value={selectedItem.startDate || ""} onChange={e => updateItem(selectedItem.id, { startDate: e.target.value })} style={FI} />
                </div>
                <div>
                  <label style={FL}>End Date</label>
                  <input type="date" value={selectedItem.endDate || ""} onChange={e => updateItem(selectedItem.id, { endDate: e.target.value })} style={FI} />
                </div>
              </div>
              <div>
                <label style={FL}>Owner</label>
                <input value={selectedItem.owner || ""} onChange={e => updateItem(selectedItem.id, { owner: e.target.value })} placeholder="Assign owner…" style={FI} />
              </div>
              <div>
                <label style={FL}>Estimated Cost</label>
                <input value={selectedItem.cost || ""} onChange={e => updateItem(selectedItem.id, { cost: e.target.value })} placeholder="$0.00" style={{ ...FI, color: GOLD, fontSize: 13, fontWeight: 600 }} />
              </div>
              <div>
                <label style={FL}>Description</label>
                <textarea value={selectedItem.description || ""} onChange={e => updateItem(selectedItem.id, { description: e.target.value })} placeholder="Add details…" rows={3} style={{ ...FI, resize: "vertical", lineHeight: 1.65 }} />
              </div>
              <div>
                <label style={FL}>Key Points</label>
                {(selectedItem.keyPoints || []).map((pt, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                    <div style={{ width: 18, height: 18, borderRadius: "50%", background: "rgba(201,168,76,.1)", border: "1px solid rgba(201,168,76,.25)", display: "grid", placeItems: "center", fontSize: 9, fontWeight: 700, color: GOLD, flexShrink: 0 }}>{i + 1}</div>
                    <div style={{ display: "flex", flex: 1, gap: 4 }}>
                      <input value={pt} onChange={e => { const kp = [...(selectedItem.keyPoints || [])]; kp[i] = e.target.value; updateItem(selectedItem.id, { keyPoints: kp }); }}
                        style={{ flex: 1, padding: "5px 8px", borderRadius: 6, border: `1px solid ${BORDER}`, background: SURF2, color: TEXT, fontSize: 12, fontFamily: "inherit" }} />
                      <button onClick={() => { const kp = (selectedItem.keyPoints || []).filter((_, j) => j !== i); updateItem(selectedItem.id, { keyPoints: kp }); }}
                        style={{ width: 24, height: 24, borderRadius: 5, border: "1px solid rgba(224,123,106,.3)", background: "transparent", color: "#e07b6a", cursor: "pointer", fontSize: 11, display: "grid", placeItems: "center" }}>×</button>
                    </div>
                  </div>
                ))}
                <button onClick={() => updateItem(selectedItem.id, { keyPoints: [...(selectedItem.keyPoints || []), ""] })}
                  style={{ fontSize: 11, padding: "5px 12px", borderRadius: 6, border: `1px dashed rgba(255,255,255,.12)`, background: "transparent", color: MUTED, cursor: "pointer", fontFamily: "inherit", width: "100%", marginTop: 4 }}>+ Add Key Point</button>
              </div>
              {selectedItem.linkedInitiative && (
                <div>
                  <label style={FL}>Linked To</label>
                  <div style={{ fontSize: 12, color: GOLD, padding: "6px 10px", background: "rgba(201,168,76,.06)", borderRadius: 7, border: "1px solid rgba(201,168,76,.15)" }}>{selectedItem.linkedInitiative}</div>
                </div>
              )}
              <button onClick={() => { if (confirm(`Delete "${selectedItem.title}"?`)) deleteItem(selectedItem.id); }}
                style={{ marginTop: 8, width: "100%", padding: "8px", borderRadius: 7, border: "1px solid rgba(224,123,106,.3)", background: "rgba(224,123,106,.06)", color: "#e07b6a", fontSize: 11, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>Delete Item</button>
            </div>
          </div>
        )}
      </div>

      {/* Add Modal */}
      {showAdd && (
        <div onClick={() => setShowAdd(false)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.7)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 999 }}>
          <div onClick={e => e.stopPropagation()} style={{ background: SURF, border: `1px solid ${BORDER}`, borderRadius: 16, width: 520, maxHeight: "90vh", overflowY: "auto", boxShadow: "0 24px 64px rgba(0,0,0,.6)" }}>
            <AddItemForm onClose={() => setShowAdd(false)} onAdd={addItem} BG={BG} SURF={SURF} SURF2={SURF2} BORDER={BORDER} TEXT={TEXT} MUTED={MUTED} GOLD={GOLD} />
          </div>
        </div>
      )}

      <style>{`* { box-sizing: border-box; } body { margin: 0; } ::-webkit-scrollbar { width: 5px; height: 5px; } ::-webkit-scrollbar-track { background: transparent; } ::-webkit-scrollbar-thumb { background: rgba(255,255,255,.1); border-radius: 3px; } input[type="date"]::-webkit-calendar-picker-indicator { filter: invert(.5); }`}</style>
    </div>
  );
}

function AddItemForm({ onClose, onAdd, BG, SURF, SURF2, BORDER, TEXT, MUTED, GOLD }) {
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("Campaign");
  const [status, setStatus] = useState("planned");
  const [startDate, setStartDate] = useState(new Date().toISOString().split("T")[0]);
  const [endDate, setEndDate] = useState("");
  const [owner, setOwner] = useState("");
  const [cost, setCost] = useState("");
  const [description, setDescription] = useState("");
  const FL = { fontSize: 10, letterSpacing: ".1em", textTransform: "uppercase", color: MUTED, fontWeight: 600, marginBottom: 5, display: "block" };
  const FI = { width: "100%", padding: "9px 12px", borderRadius: 8, border: `1px solid ${BORDER}`, background: SURF2, color: TEXT, fontSize: 13, fontFamily: "inherit", boxSizing: "border-box" };
  const submit = () => {
    if (!title.trim()) return;
    onAdd({ title: title.trim(), category, status, startDate, endDate, owner: owner.trim(), cost: cost.trim(), description: description.trim(), linkedInitiative: null, keyPoints: [] });
  };
  return (
    <div>
      <div style={{ padding: "20px 24px", borderBottom: `1px solid ${BORDER}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <div style={{ fontSize: 16, fontWeight: 600, color: TEXT }}>Add Timeline Item</div>
          <div style={{ fontSize: 12, color: MUTED, marginTop: 3 }}>This will be saved permanently to the project timeline</div>
        </div>
        <button onClick={onClose} style={{ width: 28, height: 28, borderRadius: 7, border: `1px solid ${BORDER}`, background: "transparent", color: MUTED, cursor: "pointer", fontSize: 16, display: "grid", placeItems: "center" }}>×</button>
      </div>
      <div style={{ padding: "20px 24px", display: "flex", flexDirection: "column", gap: 14 }}>
        <div><label style={FL}>Title *</label><input value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Packaging Redesign Launch" autoFocus style={FI} /></div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <div><label style={FL}>Category</label>
            <select value={category} onChange={e => setCategory(e.target.value)} style={FI}>
              {TIMELINE_CATEGORIES.map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div><label style={FL}>Status</label>
            <select value={status} onChange={e => setStatus(e.target.value)} style={FI}>
              {TIMELINE_STATUSES.map(s => <option key={s} value={s}>{s.replace("-", " ").replace(/\b\w/g, c => c.toUpperCase())}</option>)}
            </select>
          </div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <div><label style={FL}>Start Date</label><input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} style={FI} /></div>
          <div><label style={FL}>End Date</label><input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} style={FI} /></div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <div><label style={FL}>Owner</label><input value={owner} onChange={e => setOwner(e.target.value)} placeholder="Who's responsible?" style={FI} /></div>
          <div><label style={FL}>Estimated Cost</label><input value={cost} onChange={e => setCost(e.target.value)} placeholder="$0.00" style={{ ...FI, color: GOLD, fontWeight: 600 }} /></div>
        </div>
        <div><label style={FL}>Description</label><textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="Add details, deliverables, notes…" rows={3} style={{ ...FI, resize: "vertical", lineHeight: 1.65 }} /></div>
      </div>
      <div style={{ padding: "14px 24px", borderTop: `1px solid ${BORDER}`, display: "flex", justifyContent: "flex-end", gap: 8 }}>
        <button onClick={onClose} style={{ padding: "8px 16px", borderRadius: 8, border: `1px solid ${BORDER}`, background: "transparent", color: MUTED, fontFamily: "inherit", fontSize: 12, cursor: "pointer" }}>Cancel</button>
        <button disabled={!title.trim()} onClick={submit}
          style={{ padding: "8px 20px", borderRadius: 8, border: "none", background: title.trim() ? GOLD : "rgba(255,255,255,.06)", color: title.trim() ? BG : MUTED, fontSize: 12, fontWeight: 700, cursor: title.trim() ? "pointer" : "not-allowed", fontFamily: "inherit" }}>Add to Timeline</button>
      </div>
    </div>
  );
}
