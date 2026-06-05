
import { c, FONT, MONO } from "../../styles/theme";


export function scoreDisplay(score: number) {
  const color = score >= 85 ? c.emerald : score >= 70 ? c.amber : c.red;

  return (
    <span
      className="tabular-nums"
      style={{
        fontWeight: 600,
        color,
        fontFamily: MONO,
        fontSize: "13px",
      }}
    >
      {score}%
    </span>
  );
}
