import PrimaryBtn from "../components/ui/PrimaryBtn";
import { Card } from "../components/ui/card";
import { c, FONT, MONO } from "../../styles/theme";

export default function SettingsPage() {
  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 style={{ color: c.text, fontFamily: FONT, fontSize: "22px", fontWeight: 700 }}>
          Settings
        </h1>
        <p style={{ color: c.textDim, fontFamily: FONT, fontSize: "14px" }}>
          Manage your workspace, team, and AI configuration.
        </p>
      </div>

      {[
        { section: "Profile", fields: ["Full Name", "Email", "Role"] },
        { section: "AI Screening", fields: ["Minimum Match Score", "Auto-reject Below", "Screening Model"] },
      ].map((s) => (
        <Card key={s.section}>
          <div className="px-6 py-4" style={{ borderBottom: `1px solid ${c.border}` }}>
            <p style={{ fontWeight: 600, color: c.text, fontSize: "13px", fontFamily: FONT }}>
              {s.section}
            </p>
          </div>

          <div className="p-6 space-y-4">
            {s.fields.map((field) => (
              <div key={field} className="flex items-center justify-between">
                <label style={{ fontSize: "13px", color: c.textDim, fontFamily: FONT }}>
                  {field}
                </label>

                <input
                  className="rounded-lg px-3 py-1.5 text-sm outline-none w-52"
                  style={{
                    fontFamily: MONO,
                    color: c.textMid,
                    background: "rgba(255,255,255,0.04)",
                    border: `1px solid ${c.border}`,
                  }}
                />
              </div>
            ))}
          </div>
        </Card>
      ))}

      <PrimaryBtn>Save Changes</PrimaryBtn>
    </div>
  );
}