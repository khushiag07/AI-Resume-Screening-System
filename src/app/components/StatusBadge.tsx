
import { c, FONT, MONO } from "../../styles/theme";


export default function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { bg: string; color: string }> = {
    shortlisted: { bg: c.emeraldDim, color: c.emerald },
    screening: { bg: c.amberDim, color: c.amber },
    review: { bg: c.yellowDim, color: c.yellow },
    rejected: { bg: c.redDim, color: c.red },
    uploaded: { bg: c.indigoDim, color: c.indigo },
    active: { bg: c.emeraldDim, color: c.emerald },
    paused: { bg: "rgba(255,255,255,0.05)", color: c.textDim },
  };

  const style = map[status] ?? {
    bg: "rgba(255,255,255,0.05)",
    color: c.textDim,
  };

  return (
    <span
      className="px-2.5 py-0.5 rounded-full text-xs capitalize"
      style={{
        fontWeight: 500,
        background: style.bg,
        color: style.color,
        fontFamily: MONO,
      }}
    >
      {status}
    </span>
  );
}