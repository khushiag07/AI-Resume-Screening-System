import React, { useState } from "react";
import {
  Users,
  Briefcase,
  TrendingUp,
  Clock,
  MoreHorizontal,
  ArrowUpRight,
  Zap,
} from "lucide-react";

import { c, FONT, MONO } from "../../styles/theme";
import { recentCandidates } from "../../data/Candidate";
import { scoreDisplay } from "../utils/helpers";
import StatusBadge from "../components/StatusBadge";
import { Card } from "../components/ui/card";
import { Avatar, AvatarFallback } from "../components/ui/avatar";

type Candidate = {
  name: string;
  role: string;
  score: number;
  status: string;
  time?: string;
  fileName?: string;
};

type DashboardPageProps = {
  uploadedCandidates: Candidate[];
};

export default function DashboardPage({
  uploadedCandidates,
}: DashboardPageProps) {
  const [searchText, setSearchText] = useState("");

  const dashboardCandidates: Candidate[] = [
    ...uploadedCandidates,
    ...(recentCandidates as Candidate[]),
  ];

  const filteredCandidates = dashboardCandidates.filter((candidate) => {
    const query = searchText.trim().toLowerCase();

    if (!query) return true;

    return (
      candidate.name?.toLowerCase().includes(query) ||
      candidate.role?.toLowerCase().includes(query) ||
      candidate.status?.toLowerCase().includes(query) ||
      candidate.fileName?.toLowerCase().includes(query)
    );
  });

  const statsCards = [
    {
      label: "Active Jobs",
      value: "24",
      delta: "+3 this week",
      icon: <Briefcase size={18} />,
      color: c.indigo,
      dimColor: c.indigoDim,
    },
    {
      label: "Total Candidates",
      value: dashboardCandidates.length.toString(),
      delta: "+ uploaded resumes",
      icon: <Users size={18} />,
      color: c.amber,
      dimColor: c.amberDim,
    },
    {
      label: "Screened Today",
      value: uploadedCandidates.length.toString(),
      delta: "AI processed",
      icon: <Zap size={18} />,
      color: c.emerald,
      dimColor: c.emeraldDim,
    },
    {
      label: "Avg. Match Score",
      value: `${
        dashboardCandidates.length
          ? Math.round(
              dashboardCandidates.reduce(
                (sum, candidate) => sum + candidate.score,
                0
              ) / dashboardCandidates.length
            )
          : 0
      }%`,
      delta: "based on similarity",
      icon: <TrendingUp size={18} />,
      color: "#C084FC",
      dimColor: "rgba(192,132,252,0.12)",
    },
  ];

  return (

    <div className="min-h-screen w-full space-y-6 px-4 py-5 pb-24 sm:px-6 lg:px-8 lg:py-8 lg:pb-8">
      <div>
        <h1
          style={{
            color: c.text,
            fontFamily: FONT,
            fontSize: "clamp(20px, 5vw, 22px)",
            fontWeight: 700,
            letterSpacing: "-0.3px",
          }}
        >
          Dashboard
        </h1>

        <p
          style={{
            color: c.textDim,
            fontFamily: FONT,
            fontSize: "14px",
            marginTop: "4px",
          }}
        >
          Welcome back. Here's what's happening today.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        {statsCards.map((s) => (
       <Card 
  key={s.label}
  className="p-3 sm:p-5 flex flex-col gap-3"
>
            <div className="flex items-center justify-between">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{ background: s.dimColor, color: s.color }}
              >
                {s.icon}
              </div>

              <ArrowUpRight size={14} style={{ color: c.textDim }} />
            </div>

            <div>
              <p
                style={{
                  fontFamily: MONO,
                  fontSize: "clamp(18px, 4vw, 24px)",
                  fontWeight: 500,
                  color: c.text,
                  letterSpacing: "-0.5px",
                }}
              >
                {s.value}
              </p>

              <p
                style={{
                  fontFamily: FONT,
                  fontSize: "12px",
                  color: c.textDim,
                  marginTop: "2px",
                }}
              >
                {s.label}
              </p>
            </div>

            <p style={{ fontFamily: MONO, fontSize: "11px", color: s.color }}>
              {s.delta}
            </p>
          </Card>
        ))}
      </div>

      <Card>
        <div
          className="flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6"
          style={{ borderBottom: `1px solid ${c.border}` }}
        >
          <span
            style={{
              fontWeight: 600,
              color: c.text,
              fontFamily: FONT,
              fontSize: "14px",
            }}
          >
            Recent Uploaded Resumes
          </span>

          <input
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            placeholder="Search candidate..."
            style={{
              background: c.surface,
              border: `1px solid ${c.border}`,
              borderRadius: "8px",
              padding: "8px 12px",
              color: c.text,
              fontSize: "12px",
              fontFamily: FONT,
              outline: "none",
              width: "100%",
              maxWidth: "220px",
            }}
          />
        </div>

        <div className="w-full overflow-x-auto">
  <table className="min-w-[760px] w-full">
          <thead>
            <tr style={{ background: "rgba(0,0,0,0.2)" }}>
              {["Candidate", "Role Tag", "AI Match %", "Status", "Time", ""].map(
                (h) => (
                  <th
                    key={h}
                    className="text-left px-6 py-3"
                    style={{
                      fontSize: "10px",
                      fontWeight: 500,
                      color: c.textDim,
                      textTransform: "uppercase",
                      letterSpacing: "0.08em",
                      fontFamily: MONO,
                    }}
                  >
                    {h}
                  </th>
                )
              )}
            </tr>
          </thead>

          <tbody>
            {filteredCandidates.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  className="px-6 py-6 text-center"
                  style={{
                    color: c.textDim,
                    fontFamily: FONT,
                    fontSize: "13px",
                  }}
                >
                  No candidate found
                </td>
              </tr>
            ) : (
              filteredCandidates.map((candidate, index) => (
                <tr
                  key={`${candidate.name}-${candidate.role}-${
                    candidate.fileName || index
                  }`}
                  style={{ borderTop: `1px solid ${c.border}` }}
                  className="transition-colors"
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = c.surfaceHover;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "transparent";
                  }}
                >
                  <td className="px-6 py-3.5">
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarFallback>
                          {candidate.name
                            .split(" ")
                            .map((n: string) => n[0])
                            .join("")
                            .slice(0, 2)}
                        </AvatarFallback>
                      </Avatar>

                      <span
                        style={{
                          fontSize: "13px",
                          fontWeight: 500,
                          color: c.text,
                          fontFamily: FONT,
                        }}
                      >
                        {candidate.name}
                      </span>
                    </div>
                  </td>

                  <td
                    className="px-6 py-3.5"
                    style={{
                      fontSize: "13px",
                      color: c.textDim,
                      fontFamily: FONT,
                    }}
                  >
                    {candidate.role}
                  </td>

                  <td className="px-6 py-3.5">
                    {scoreDisplay(candidate.score)}
                  </td>

                  <td className="px-6 py-3.5">
                    <StatusBadge status={candidate.status || "Default"} />
                  </td>

                  <td className="px-6 py-3.5">
                    <div
                      className="flex items-center gap-1"
                      style={{
                        fontSize: "11px",
                        color: c.textDim,
                        fontFamily: MONO,
                      }}
                    >
                      <Clock size={11} />
                      {candidate.time}
                    </div>
                  </td>

                  <td className="px-6 py-3.5">
                    <button
                      style={{ color: c.textDim }}
                      className="hover:text-slate-300 transition-colors"
                    >
                      <MoreHorizontal size={15} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        
        </table>
        </div>
      </Card>
    </div>
  );
}