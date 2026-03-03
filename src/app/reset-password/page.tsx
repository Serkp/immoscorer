"use client"

import { useEffect, useState } from "react"
import { createClient } from "@supabase/supabase-js"
import { useRouter } from "next/navigation"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function ResetPasswordPage() {
  const router = useRouter()
  const [phase, setPhase] = useState<"loading"|"request"|"set-password"|"done">("loading")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirm, setConfirm] = useState("")
  const [error, setError] = useState("")
  const [sent, setSent] = useState(false)

  useEffect(() => {
    // Supabase liest den Hash automatisch und setzt eine Session
    supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") {
        setPhase("set-password")
      }
    })

    // Fallback: Wenn nach 2 Sekunden kein Event — zeige Request-Form
    const t = setTimeout(() => {
      setPhase(p => p === "loading" ? "request" : p)
    }, 2000)

    return () => clearTimeout(t)
  }, [])

  const sendLink = async () => {
    setError("")
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: "https://immoscorer.vercel.app/reset-password"
    })
    if (error) return setError(error.message)
    setSent(true)
  }

  const savePassword = async () => {
    setError("")
    if (password.length < 8) return setError("Mindestens 8 Zeichen erforderlich.")
    if (password !== confirm) return setError("Passwörter stimmen nicht überein.")

    const { error } = await supabase.auth.updateUser({ password })
    if (error) return setError(error.message)
    setPhase("done")
    setTimeout(() => router.push("/analysis"), 2000)
  }

  const inputStyle: React.CSSProperties = {
    width: "100%", padding: "12px 16px", marginBottom: 12,
    background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: 8, color: "#EDEEF2", fontSize: 14, boxSizing: "border-box", outline: "none"
  }

  const btnStyle: React.CSSProperties = {
    width: "100%", padding: "13px 0", marginTop: 4,
    background: "linear-gradient(135deg, #7C6AFF, #4C9AFF)",
    border: "none", borderRadius: 8, color: "#fff", fontSize: 15, fontWeight: 600, cursor: "pointer"
  }

  const wrap: React.CSSProperties = {
    minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center",
    background: "#08090E"
  }

  const card: React.CSSProperties = {
    background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)",
    borderRadius: 16, padding: 40, width: "100%", maxWidth: 400, color: "#EDEEF2"
  }

  if (phase === "loading") return <div style={wrap}><p style={{color:"rgba(255,255,255,0.4)"}}>Wird geladen...</p></div>

  if (phase === "done") return <div style={wrap}><p style={{color:"#34D399",fontSize:18}}>✓ Passwort gespeichert. Weiterleitung...</p></div>

  return (
    <div style={wrap}>
      <div style={card}>
        <h2 style={{marginBottom:8,fontSize:22,fontWeight:600}}>Passwort zurücksetzen</h2>

        {phase === "request" && (
          sent
            ? <p style={{color:"#34D399",fontSize:14,marginTop:16}}>✓ E-Mail versendet. Prüfe dein Postfach.</p>
            : <>
                <p style={{color:"rgba(255,255,255,0.5)",fontSize:14,marginBottom:24}}>Gib deine E-Mail-Adresse ein.</p>
                <input style={inputStyle} type="email" placeholder="E-Mail-Adresse" value={email} onChange={e=>setEmail(e.target.value)} />
                {error && <p style={{color:"#F87171",fontSize:13,marginBottom:8}}>{error}</p>}
                <button style={btnStyle} onClick={sendLink}>Link anfordern</button>
              </>
        )}

        {phase === "set-password" && (
          <>
            <p style={{color:"rgba(255,255,255,0.5)",fontSize:14,marginBottom:24}}>Wähle ein neues Passwort.</p>
            <input style={inputStyle} type="password" placeholder="Neues Passwort (min. 8 Zeichen)" value={password} onChange={e=>setPassword(e.target.value)} />
            <input style={inputStyle} type="password" placeholder="Passwort bestätigen" value={confirm} onChange={e=>setConfirm(e.target.value)} />
            {error && <p style={{color:"#F87171",fontSize:13,marginBottom:8}}>{error}</p>}
            <button style={btnStyle} onClick={savePassword}>Passwort speichern</button>
          </>
        )}
      </div>
    </div>
  )
}
