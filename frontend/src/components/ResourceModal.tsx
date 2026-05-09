"use client";
import { useState } from "react";
import { Resource, ResourceFormData } from "@/types";
import * as api from "@/lib/api";

interface Props { resource?: Resource | null; onSave(): void; onClose(): void; }

export default function ResourceModal({ resource, onSave, onClose }: Props) {
  const [title, setTitle] = useState(resource?.title ?? "");
  const [url,   setUrl]   = useState(resource?.url ?? "");
  const [desc,  setDesc]  = useState(resource?.description ?? "");
  const [tags,  setTags]  = useState(resource?.tags.join(", ") ?? "");
  const [err,   setErr]   = useState("");
  const [busy,  setBusy]  = useState(false);

  const save = async () => {
    if (!title.trim()) { setErr("Title is required."); return; }
    setBusy(true); setErr("");
    try {
      const data: ResourceFormData = { title, url, description: desc.trim() || undefined, tags: tags.split(",").map(t=>t.trim()).filter(Boolean) };
      resource ? await api.updateResource(resource.id, data) : await api.createResource(data);
      onSave();
    } catch (e: any) { setErr(e.message); }
    finally { setBusy(false); }
  };

  return (
    <div className="backdrop" onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div className="modal">
        <div className="modal-head">
          <h3 style={{ fontFamily:"var(--disp)", fontSize:"1.1rem" }}>{resource ? "Edit Resource" : "Add Resource"}</h3>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <div className="modal-body">
          <div className="field"><label className="label">Title *</label><input className="input" placeholder="How React Reconciliation Works" value={title} onChange={e=>setTitle(e.target.value)} /></div>
          <div className="field"><label className="label">URL </label><input className="input" type="url" placeholder="https://…" value={url} onChange={e=>setUrl(e.target.value)} /></div>
          <div className="field"><label className="label">Description</label><textarea className="input" placeholder="A short note…" value={desc} onChange={e=>setDesc(e.target.value)} /></div>
          <div className="field"><label className="label">Tags (comma separated)</label><input className="input" placeholder="design, learning, tools" value={tags} onChange={e=>setTags(e.target.value)} /></div>
          {err && <div className="alert alert-err">{err}</div>}
        </div>
        <div className="modal-foot">
          <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={save} disabled={busy}>
            {busy && <span className="spinner" />}{resource ? "Save Changes" : "Add Resource"}
          </button>
        </div>
      </div>
    </div>
  );
}
