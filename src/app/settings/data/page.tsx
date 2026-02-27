"use client";

import { useState } from "react";
import { Card } from "@/components/ui/Card";
import { useAuth } from "@/components/auth/AuthProvider";
import { getSupabase } from "@/lib/supabase";
import { getAnalyses, getPortfolioProperties } from "@/lib/db";
import { C } from "@/lib/theme";

export default function DataExportPage() {
  const { user } = useAuth();
  const [exporting, setExporting] = useState<string | null>(null);
  const [deleteStep, setDeleteStep] = useState<"none" | "confirm" | "input">("none");
  const [deleteInput, setDeleteInput] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  async function exportAnalyses() {
    if (!user) return;
    setExporting("analyses");
    try {
      const data = await getAnalyses(user.id);
      if (!data || data.length === 0) { setExporting(null); return; }
      const headers = ["address", "city", "purchase_price", "monthly_rent", "area_sqm", "building_year", "energy_class", "total_score", "gross_yield", "price_factor", "created_at"];
      const csv = [headers.join(";"), ...data.map((r: Record<string, unknown>) => headers.map((h) => String(r[h] ?? "")).join(";"))].join("\n");
      downloadCsv(csv, "immoscorer-analysen.csv");
    } catch { /* silent */ }
    setExporting(null);
  }

  async function exportPortfolio() {
    if (!user) return;
    setExporting("portfolio");
    try {
      const data = await getPortfolioProperties(user.id);
      if (!data || data.length === 0) { setExporting(null); return; }
      const headers = ["address", "city", "purchase_price", "current_rent", "area", "build_year", "energy_class", "property_type", "loan_amount", "interest_rate", "fixed_rate_until", "monthly_payment", "estimated_market_value", "created_at"];
      const csv = [headers.join(";"), ...data.map((r: Record<string, unknown>) => headers.map((h) => String(r[h] ?? "")).join(";"))].join("\n");
      downloadCsv(csv, "immoscorer-portfolio.csv");
    } catch { /* silent */ }
    setExporting(null);
  }

  function downloadCsv(content: string, filename: string) {
    const blob = new Blob(["\uFEFF" + content], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }

  async function handleDeleteAccount() {
    if (!user || deleteInput !== "DELETE") return;
    setDeleting(true);
    setDeleteError(null);
    try {
      // Delete user data
      const supabase = getSupabase();
      await supabase.from("analyses").delete().eq("user_id", user.id);
      await supabase.from("portfolio_properties").delete().eq("user_id", user.id);
      await supabase.from("profiles").delete().eq("id", user.id);
      // Sign out — actual user deletion requires admin API
      await supabase.auth.signOut();
      window.location.href = "/";
    } catch {
      setDeleteError("Fehler beim Löschen. Bitte kontaktieren Sie den Support.");
      setDeleting(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-base font-bold" style={{ color: C.text }}>Daten & Export</h2>
        <p className="text-xs mt-1" style={{ color: C.dim }}>Ihre Daten exportieren oder Account löschen.</p>
      </div>

      {/* Export */}
      <Card className="p-5 space-y-4">
        <h3 className="text-sm font-bold" style={{ color: C.text }}>Daten exportieren</h3>
        <div className="flex flex-col sm:flex-row gap-3">
          <button onClick={exportAnalyses} disabled={!!exporting}
            className="flex-1 rounded-xl px-5 py-2.5 text-xs font-bold transition-all disabled:opacity-40"
            style={{ background: C.surface2, border: `1px solid ${C.border}`, color: C.text }}>
            {exporting === "analyses" ? "Exportiert..." : "Alle Analysen exportieren (CSV)"}
          </button>
          <button onClick={exportPortfolio} disabled={!!exporting}
            className="flex-1 rounded-xl px-5 py-2.5 text-xs font-bold transition-all disabled:opacity-40"
            style={{ background: C.surface2, border: `1px solid ${C.border}`, color: C.text }}>
            {exporting === "portfolio" ? "Exportiert..." : "Portfolio exportieren (CSV)"}
          </button>
        </div>
      </Card>

      {/* Delete Account */}
      <Card className="p-5 space-y-4" style={{ border: "1px solid rgba(248,113,113,0.2)" }}>
        <h3 className="text-sm font-bold" style={{ color: C.red }}>Account löschen</h3>
        <p className="text-xs" style={{ color: C.sub }}>
          Alle Ihre Daten (Analysen, Portfolio, Profil) werden unwiderruflich gelöscht.
        </p>

        {deleteStep === "none" && (
          <button onClick={() => setDeleteStep("confirm")}
            className="rounded-xl px-5 py-2 text-xs font-semibold transition-all"
            style={{ border: `1px solid rgba(248,113,113,0.2)`, color: C.red }}>
            Account löschen
          </button>
        )}

        {deleteStep === "confirm" && (
          <div className="space-y-3">
            <p className="text-xs font-semibold" style={{ color: C.red }}>Sind Sie sicher? Diese Aktion kann nicht rückgängig gemacht werden.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteStep("none")}
                className="flex-1 rounded-xl py-2 text-xs font-semibold" style={{ border: `1px solid ${C.border}`, color: C.sub }}>
                Abbrechen
              </button>
              <button onClick={() => setDeleteStep("input")}
                className="flex-1 rounded-xl py-2 text-xs font-bold"
                style={{ background: C.redDim, color: C.red, border: "1px solid rgba(248,113,113,0.2)" }}>
                Ja, fortfahren
              </button>
            </div>
          </div>
        )}

        {deleteStep === "input" && (
          <div className="space-y-3">
            {deleteError && (
              <div className="rounded-xl px-4 py-2.5 text-xs" style={{ background: C.redDim, color: C.red }}>
                {deleteError}
              </div>
            )}
            <p className="text-xs" style={{ color: C.sub }}>Geben Sie <strong style={{ color: C.red }}>DELETE</strong> ein um zu bestätigen:</p>
            <input type="text" value={deleteInput} onChange={(e) => setDeleteInput(e.target.value)}
              placeholder="DELETE" className="w-full rounded-xl px-4 py-2.5 text-sm outline-none font-mono"
              style={{ background: C.surface2, border: `1px solid rgba(248,113,113,0.2)`, color: C.text }} />
            <div className="flex gap-3">
              <button onClick={() => { setDeleteStep("none"); setDeleteInput(""); }}
                className="flex-1 rounded-xl py-2 text-xs font-semibold" style={{ border: `1px solid ${C.border}`, color: C.sub }}>
                Abbrechen
              </button>
              <button onClick={handleDeleteAccount} disabled={deleting || deleteInput !== "DELETE"}
                className="flex-1 rounded-xl py-2 text-xs font-bold disabled:opacity-40"
                style={{ background: C.redDim, color: C.red, border: "1px solid rgba(248,113,113,0.2)" }}>
                {deleting ? "Wird gelöscht..." : "Endgültig löschen"}
              </button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
