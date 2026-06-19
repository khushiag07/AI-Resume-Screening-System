import React from "react";
import { Star, CircleDot } from "lucide-react";

import { c, FONT, MONO } from "../../styles/theme";
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
  matchedSkills?: string[];
  missingSkills?: string[];
  similarityScore?: number;
  skillScore?: number;
  jobRole?: string;
  eligibility?: string;
  location?: string;
};

type CandidatePageProps = {
  uploadedCandidates: Candidate[];
};

export default function CandidatePage({
  uploadedCandidates,
}: CandidatePageProps) {
  const allCandidates = uploadedCandidates;

  const candidateStats = [
    {
      label: "Total Screened",
      value: allCandidates.length,
      delta: "backend results",
      icon: <CircleDot size={18} />,
      color: c.amber,
      dimColor: c.amberDim,
    },
    {
      label: "Shortlisted",
      value: allCandidates.filter(
        (candidate) => candidate.status === "Shortlisted"
      ).length,
      delta: "high match",
      icon: <Star size={18} />,
      color: c.emerald,
      dimColor: c.emeraldDim,
    },
    {
      label: "Under Review",
      value: allCandidates.filter(
        (candidate) => candidate.status === "Review"
      ).length,
      delta: "needs checking",
      icon: <CircleDot size={18} />,
      color: c.yellow,
      dimColor: c.yellowDim,
    },
  ];

  return (
    <div className="space-y-6 pb-24 lg:pb-8">
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
          Screened Candidates
        </h1>

        <p
          style={{
            color: c.textDim,
            fontFamily: FONT,
            fontSize: "14px",
            marginTop: "4px",
          }}
        >
          {allCandidates.length} candidates screened from uploaded resumes
        </p>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {candidateStats.map((s) => (
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
            </div>

            <div>
              <p
                style={{
                  fontFamily: MONO,
                  fontSize: "clamp(18px,4vw,24px)",
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

      {allCandidates.length === 0 ? (
        <Card className="p-8 text-center">
          <p style={{ color: c.textDim, fontFamily: FONT }}>
            No screened candidates yet. Go to Jobs → open a job → upload resumes
            → run screening.
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
          {allCandidates.map((candidate, index) => (
            <Card
              key={`${candidate.name}-${candidate.fileName || index}`}
              className="p-4 sm:p-5 transition-all duration-150"
              style={{ background: c.surface }}
            >
              <div className="flex items-start gap-3 overflow-hidden">
                <Avatar>
                  <AvatarFallback>
                    {candidate.name
                      .split(" ")
                      .map((n: string) => n[0])
                      .join("")
                      .slice(0, 2)}
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1 min-w-0">
                  <p
                    style={{
                      fontWeight: 600,
                      color: c.text,
                      fontSize: "15px",
                      fontFamily: FONT,
                    }}
                  >
                    #{index + 1} {candidate.name}
                  </p>

                  <p
                    className="truncate mt-0.5"
                    style={{
                      fontSize: "12px",
                      color: c.textDim,
                      fontFamily: FONT,
                    }}
                  >
                    Role: {candidate.jobRole || candidate.role}
                  </p>

                  <p
                    className="truncate mt-0.5"
                    style={{
                      fontSize: "12px",
                      color: c.textDim,
                      fontFamily: FONT,
                    }}
                  >
                    File: {candidate.fileName}
                  </p>
                </div>

                <div className="text-right">
                  <p
                    style={{
                      color:
                        candidate.score >= 75
                          ? c.emerald
                          : candidate.score >= 60
                          ? c.amber
                          : c.red,
                      fontFamily: MONO,
                      fontSize: "clamp(18px,4vw,24px)",
                      fontWeight: 600,
                    }}
                  >
                    {scoreDisplay(candidate.score)}
                  </p>

                  <StatusBadge status={candidate.status} />
                </div>
              </div>

              <div
                className="mt-4 pt-4"
                style={{ borderTop: `1px solid ${c.border}` }}
              >
                <div className="flex items-center gap-1.5 mb-3">
                  <CircleDot
                    size={11}
                    style={{
                      color:
                        candidate.score >= 75
                          ? c.emerald
                          : candidate.score >= 60
                          ? c.amber
                          : c.red,
                    }}
                  />

                  <span
                    style={{
                      fontSize: "12px",
                      color: c.textDim,
                      fontFamily: MONO,
                    }}
                  >
                    Final Match: {scoreDisplay(candidate.score)}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p
                      style={{
                        color: c.emerald,
                        fontFamily: FONT,
                        fontSize: "13px",
                        fontWeight: 600,
                      }}
                    >
                      Matched Skills
                    </p>

                    <div className="flex flex-wrap gap-2 mt-2">
                      {candidate.matchedSkills?.length ? (
                        candidate.matchedSkills.map((skill) => (
                          <span
                            key={skill}
                            className="px-3 py-1 rounded-full text-xs"
                            style={{
                              background: c.emeraldDim,
                              color: c.emerald,
                              fontFamily: MONO,
                            }}
                          >
                            {skill}
                          </span>
                        ))
                      ) : (
                        <p style={{ color: c.textDim, fontSize: "12px" }}>
                          No matched skills found
                        </p>
                      )}
                    </div>
                  </div>

                  <div>
                    <p
                      style={{
                        color: c.red,
                        fontFamily: FONT,
                        fontSize: "13px",
                        fontWeight: 600,
                      }}
                    >
                      Missing Skills
                    </p>

                    <div className="flex flex-wrap gap-2 mt-2">
                      {candidate.missingSkills?.length ? (
                        candidate.missingSkills.map((skill) => (
                          <span
                            key={skill}
                            className="px-3 py-1 rounded-full text-xs"
                            style={{
                              background: c.redDim,
                              color: c.red,
                              fontFamily: MONO,
                            }}
                          >
                            {skill}
                          </span>
                        ))
                      ) : (
                        <p style={{ color: c.textDim, fontSize: "12px" }}>
                          No missing skills
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap gap-4">
                  <p style={{ color: c.textDim, fontFamily: MONO, fontSize: "11px" }}>
                    Similarity: {candidate.similarityScore ?? 0}%
                  </p>

                  <p style={{ color: c.textDim, fontFamily: MONO, fontSize: "11px" }}>
                    Skill Score: {candidate.skillScore ?? 0}%
                  </p>

                  <p style={{ color: c.textDim, fontFamily: MONO, fontSize: "11px" }}>
                    {candidate.time}
                  </p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}