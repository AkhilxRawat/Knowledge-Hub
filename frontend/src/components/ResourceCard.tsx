"use client";
import { useState } from "react";
import { Resource } from "@/types";

interface Props { resource: Resource; onEdit(r: Resource): void; onDelete(r: Resource): void; onTagClick(t: string): void; activeTag?: string; }

const getDomain = (url: string) => { try { return new URL(url).hostname.replace("www.", ""); } catch { return url; } };
const fmtDate   = (iso: string)  => new Date(iso).toLocaleDateString("en-US", { month:"short", day:"numeric", year:"numeric" });

export default function ResourceCard({ resource: r, onEdit, onDelete, onTagClick, activeTag }: Props) {
  const [hov, setHov] = useState(false);
  return (
    <div className="card" style={{ boxShadow: hov?"0 5px 20px rgba(17,16,9,.1)":undefined, transform: hov?"translateY(-2px)":undefined }}
      onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)}>
      <div style={{ display:"flex", justifyContent:"space-between" }}>
        <span style={{ fontSize:".63rem", letterSpacing:".08em", textTransform:"uppercase", color:"var(--muted)" }}>{getDomain(r.url)}</span>
        <span style={{ fontSize:".63rem", color:"var(--muted)" }}>{fmtDate(r.created_at)}</span>
      </div>
      <a href={r.url} target="_blank" rel="noopener noreferrer"
        style={{ fontFamily:"var(--disp)", fontSize:"1.08rem", lineHeight:1.25, color:"var(--ink)", textDecoration:"none", display:"block", transition:"color .12s" }}
        onMouseEnter={e=>((e.target as HTMLElement).style.color="var(--accent)")}
        onMouseLeave={e=>((e.target as HTMLElement).style.color="var(--ink)")}>
        {r.title}
      </a>
      {r.description && <p style={{ fontSize:".77rem", color:"var(--muted)", lineHeight:1.6, display:"-webkit-box", WebkitLineClamp:2, WebkitBoxOrient:"vertical", overflow:"hidden" }}>{r.description}</p>}
      {r.tags.length > 0 && (
        <div style={{ display:"flex", flexWrap:"wrap", gap:".38rem" }}>
          {r.tags.map(t => <span key={t} className={`tag${activeTag===t?" on":""}`} onClick={()=>onTagClick(t)}>{t}</span>)}
        </div>
      )}
      <div style={{ display:"flex", gap:".45rem", paddingTop:".7rem", marginTop:"auto", borderTop:"1px solid var(--border)", alignItems:"center" }}>
        <button className="btn btn-ghost btn-sm" onClick={()=>onEdit(r)}>Edit</button>
        <button className="btn btn-danger btn-sm" onClick={()=>onDelete(r)}>Delete</button>
        <a href={r.url} target="_blank" rel="noopener noreferrer" style={{ marginLeft:"auto", fontSize:".66rem", color:"var(--muted)", textDecoration:"none", transition:"color .12s" }}
          onMouseEnter={e=>((e.target as HTMLElement).style.color="var(--accent)")}
          onMouseLeave={e=>((e.target as HTMLElement).style.color="var(--muted)")}>Visit →</a>
      </div>
    </div>
  );
}
