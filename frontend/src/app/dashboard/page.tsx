"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import * as api from "@/lib/api";
import { Resource } from "@/types";
import ResourceCard from "@/components/ResourceCard";
import ResourceModal from "@/components/ResourceModal";

type Modal = { type:"add" } | { type:"edit"; resource:Resource } | null;

export default function Dashboard() {
  const { user, logout, loading: authLoading } = useAuth();
  const router = useRouter();

  const [resources, setResources] = useState<Resource[]>([]);
  const [loading,   setLoading]   = useState(true);
  const [err,       setErr]       = useState("");
  const [search,    setSearch]    = useState("");
  const [activeTag, setActiveTag] = useState("");
  const [modal,     setModal]     = useState<Modal>(null);
  const timer = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => { if (!authLoading && !user) router.replace("/"); }, [user, authLoading, router]);

  const load = useCallback(async (s: string, t: string) => {
    setLoading(true); setErr("");
    try { setResources(await api.getResources(s || undefined, t || undefined)); }
    catch (e: any) { setErr(e.message); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { if (user) load(search, activeTag); }, [user, activeTag]);

  const handleSearch = (v: string) => {
    setSearch(v);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => load(v, activeTag), 350);
  };

  const handleTag  = (t: string) => setActiveTag(p => p === t ? "" : t);
  const handleSaved = async () => { setModal(null); await load(search, activeTag); };
 const handleDelete = async (r: Resource) => {
    await api.deleteResource(r.id);
    await load(search, activeTag);
  };

 const allTags = Array.from(new Set(resources.flatMap(r => r.tags)));
  if (authLoading) return null;

  return (
    <>
      <header className="header">
        <div className="header-inner">
          <div style={{ display:"flex", alignItems:"baseline", gap:".5rem" }}>
            <span style={{ fontFamily:"var(--disp)", fontSize:"1.3rem", color:"#f4efe6" }}>Knowledge Hub</span>
            <span style={{ fontSize:".58rem", letterSpacing:".14em", textTransform:"uppercase", color:"rgba(244,239,230,.3)" }}>Personal Library</span>
          </div>
          <div style={{ display:"flex", alignItems:"center", gap:"1.1rem" }}>
            <span style={{ fontSize:".72rem", color:"rgba(244,239,230,.45)" }}>{user?.name}</span>
            <button className="btn btn-ghost btn-sm"
              style={{ color:"rgba(244,239,230,.65)", borderColor:"rgba(244,239,230,.15)" }}
              onClick={() => { logout(); router.push("/"); }}>Sign Out</button>
          </div>
        </div>
      </header>

      <main className="dash">
        <div className="controls">
          <div className="search-wrap">
            <span className="search-icon">⌕</span>
            <input className="input" style={{ paddingLeft:"2.1rem" }} placeholder="Search by title…"
              value={search} onChange={e => handleSearch(e.target.value)} />
          </div>
          <button className="btn btn-primary" onClick={() => setModal({ type:"add" })}>+ Add Resource</button>
        </div>

        {allTags.length > 0 && (
          <div className="tags-row">
            <span className="tags-label">Filter:</span>
            {allTags.map(t => <span key={t} className={`tag${activeTag===t?" on":""}`} onClick={() => handleTag(t)}>{t}</span>)}
            {activeTag && <span className="tag clear" onClick={() => setActiveTag("")}>✕ Clear</span>}
          </div>
        )}

        {err && <div className="alert alert-err" style={{ marginBottom:"1rem" }}>{err}</div>}
        <p className="count">{loading ? "Loading…" : `${resources.length} resource${resources.length!==1?"s":""}${search||activeTag?" found":""}`}</p>

        {loading ? (
          <div style={{ display:"flex", justifyContent:"center", padding:"4rem" }}>
            <span className="spinner" style={{ width:28, height:28 }} />
          </div>
        ) : resources.length === 0 ? (
          <div className="empty">
            <h2>{search || activeTag ? "No results." : "Your library is empty."}</h2>
            <p>{search || activeTag ? "Try a different search or tag." : "Save articles, videos, and links to revisit."}</p>
            {!search && !activeTag && <button className="btn btn-primary" onClick={() => setModal({ type:"add" })}>Add your first resource</button>}
          </div>
        ) : (
          <div className="grid">
            {resources.map(r => (
              <ResourceCard key={r.id} resource={r}
                onEdit={res => setModal({ type:"edit", resource:res })}
                onDelete={handleDelete}
                onTagClick={handleTag}
                activeTag={activeTag} />
            ))}
          </div>
        )}
      </main>

      {modal?.type === "add"  && <ResourceModal onSave={handleSaved} onClose={() => setModal(null)} />}
      {modal?.type === "edit" && <ResourceModal resource={modal.resource} onSave={handleSaved} onClose={() => setModal(null)} />}
    </>
  );
}
