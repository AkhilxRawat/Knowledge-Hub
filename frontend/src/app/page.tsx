"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";

export default function AuthPage() {
  const [tab,  setTab]  = useState<"login" | "signup">("login");
  const [name, setName] = useState("");
  const [email,setEmail]= useState("");
  const [pass, setPass] = useState("");
  const [err,  setErr]  = useState("");
  const [busy, setBusy] = useState(false);
  const { user, login, signup } = useAuth();
  const router = useRouter();

  useEffect(() => { if (user) router.replace("/dashboard"); }, [user, router]);

  const switchTab = (t: "login" | "signup") => {
    setTab(t); setErr(""); setName(""); setEmail(""); setPass("");
  };

  const submit = async () => {
    setErr(""); setBusy(true);
    try {
      if (tab === "login") await login(email, pass);
      else {
        if (!name.trim()) { setErr("Name is required."); setBusy(false); return; }
        await signup(name, email, pass);
      }
      router.push("/dashboard");
    } catch (e: any) { setErr(e.message); }
    finally { setBusy(false); }
  };

  return (
    <div className="auth-wrap">
      {/* Left */}
      <div className="auth-left">
        <div style={{ position:"absolute", width:380, height:380, bottom:-140, left:-140, borderRadius:"50%", border:"1px solid rgba(244,239,230,.06)", pointerEvents:"none" }} />
        <div style={{ position:"absolute", width:240, height:240, bottom:-70, left:-70, borderRadius:"50%", border:"1px solid rgba(244,239,230,.05)", pointerEvents:"none" }} />
        <div>
          <div style={{ fontSize:".64rem", letterSpacing:".16em", textTransform:"uppercase", color:"rgba(244,239,230,.36)", marginBottom:"1.4rem" }}>Knowledge Hub</div>
          <h1 style={{ fontSize:"2.8rem", color:"#f4efe6", lineHeight:1.1 }}>
            Your personal<br/><span style={{ color:"#e06640" }}>library</span><br/>of ideas.
          </h1>
        </div>
        <p style={{ fontSize:".75rem", color:"rgba(244,239,230,.38)", lineHeight:1.85 }}>
          Save articles, notes, and links.<br/>Tag them. Search them.<br/>Never lose a great resource again.
        </p>
      </div>

      {/* Right */}
      <div className="auth-right">
        <div className="auth-form fu">
          <div className="auth-tabs">
            {(["login","signup"] as const).map(t => (
              <button key={t} className={`auth-tab${tab===t?" active":""}`} onClick={() => switchTab(t)}>
                {t === "login" ? "Sign In" : "Create Account"}
              </button>
            ))}
          </div>

          {tab === "signup" && (
            <div className="field">
              <label className="label">Name</label>
              <input className="input" placeholder="Name" value={name} onChange={e=>setName(e.target.value)} />
            </div>
          )}
          <div className="field">
            <label className="label">Email</label>
            <input className="input" type="email" placeholder="you@example.com" value={email} onChange={e=>setEmail(e.target.value)} />
          </div>
          <div className="field">
            <label className="label">Password</label>
            <input className="input" type="password" placeholder="••••••••" value={pass}
              onChange={e=>setPass(e.target.value)} onKeyDown={e=>e.key==="Enter"&&submit()} />
          </div>

          {err && <div className="alert alert-err">{err}</div>}

          <button className="btn btn-primary btn-full" onClick={submit} disabled={busy} style={{ marginTop:".4rem" }}>
            {busy && <span className="spinner" />}
            {tab === "login" ? "Sign In" : "Create Account"}
          </button>
        </div>
      </div>
    </div>
  );
}
