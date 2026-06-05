import React from "react";
import { c, FONT, MONO } from "../../../styles/theme";


type PrimaryBtnProps = {
  children: React.ReactNode;
  onClick?: () => void;
};

export default function PrimaryBtn({ children, onClick }: PrimaryBtnProps) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition-all duration-150"
      style={{
        fontWeight: 600,
        background: "linear-gradient(135deg, #F59E0B 0%, #D97706 100%)",
        color: "#070B13",
        fontFamily: FONT,
        boxShadow: `0 0 16px ${c.amberGlow}`,
      }}
    >
      {children}
    </button>
  );
}