import { Card } from "../components/ui/card";
import { c, FONT, MONO } from "../../styles/theme";

export default function AnalyticsPage() {
  const bars = [68, 82, 55, 91, 74, 88, 63, 79, 94, 71, 85, 60];
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  return (
    <div className="space-y-6">
      <div>
        <h1 style={{ color: c.text, fontFamily: FONT, fontSize: "22px", fontWeight: 700 }}>
          Analytics
        </h1>
        <p style={{ color: c.textDim, fontFamily: FONT, fontSize: "14px" }}>
          Hiring pipeline performance and AI screening metrics.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <p style={{ fontSize: "13px", fontWeight: 600, color: c.text, fontFamily: FONT }}>
            Monthly Applications
          </p>

          <div className="flex items-end gap-1.5 h-36 mt-6">
            {bars.map((h, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1.5">
                <div
                  className="w-full rounded-sm"
                  style={{
                    height: `${(h / 100) * 128}px`,
                    background: "linear-gradient(to top, #D97706, #F59E0B)",
                  }}
                />
                <span style={{ fontSize: "10px", color: c.textDim, fontFamily: MONO }}>
                  {months[i]}
                </span>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-6 flex flex-col gap-4">
          <p style={{ fontSize: "13px", fontWeight: 600, color: c.text, fontFamily: FONT }}>
            Screening Funnel
          </p>

          {[
            { label: "Applied", count: 1284, pct: 100, color: "rgba(255,255,255,0.15)" },
            { label: "AI Screened", count: 947, pct: 73, color: c.indigo },
            { label: "Shortlisted", count: 312, pct: 24, color: c.amber },
            { label: "Interviewed", count: 89, pct: 7, color: "#C084FC" },
            { label: "Offered", count: 24, pct: 2, color: c.emerald },
          ].map((s) => (
            <div key={s.label} className="flex items-center gap-3">
              <span style={{ fontSize: "11px", color: c.textDim, fontFamily: MONO, width: "80px" }}>
                {s.label}
              </span>

              <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.06)" }}>
                <div className="h-full rounded-full" style={{ width: `${s.pct}%`, background: s.color }} />
              </div>

              <span style={{ fontSize: "11px", fontWeight: 600, color: c.textMid, fontFamily: MONO }}>
                {s.count}
              </span>
            </div>
          ))}
        </Card>
      </div>
    </div>
  );
}