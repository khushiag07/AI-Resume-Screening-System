import React, { useEffect, useMemo, useState } from "react";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

import {
  Briefcase,
  FileText,
  Star,
  CheckCircle,
  XCircle,
  Clock,
  Brain,
  TrendingUp,
} from "lucide-react";

import { supabase } from "../../lib/supabase";

type Job = {
  id: string;
  title?: string;
  created_at?: string;
};

type Resume = {
  id: string;
  name?: string;
  file_name?: string;
  score?: number | string | null;
  status?: string | null;
  missing_skills?: string[] | string | null;
  created_at?: string;
};

const card =
  "rounded-2xl border border-white/10 bg-white/[0.045] p-4 sm:p-6 lg:p-7 shadow-[0_10px_40px_rgba(0,0,0,0.22)] backdrop-blur-xl";

export default function AnalyticsPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  async function fetchAnalytics() {
    setLoading(true);

    const { data: jobData } = await supabase
      .from("jobs")
      .select("*")
      .order("created_at", { ascending: false });

    const { data: resumeData } = await supabase
      .from("resumes")
      .select("*")
      .order("created_at", { ascending: false });

    setJobs(jobData || []);
    setResumes(resumeData || []);
    setLoading(false);
  }

  const totalJobs = jobs.length;
  const totalResumes = resumes.length;

  const shortlisted = resumes.filter(
    (r) => r.status?.toLowerCase() === "shortlisted"
  ).length;

  const rejected = resumes.filter(
    (r) => r.status?.toLowerCase() === "rejected"
  ).length;

  const pending = resumes.filter(
    (r) => !r.status || r.status.toLowerCase() === "pending"
  ).length;

  const averageScore = useMemo(() => {
    const scored = resumes.filter(
      (r) => r.score !== null && r.score !== undefined
    );

    if (!scored.length) return 0;

    return Math.round(
      scored.reduce((sum, r) => sum + Number(r.score), 0) / scored.length
    );
  }, [resumes]);

  const monthlyApplications = useMemo(() => {
    const months = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];

    const data = months.map((m) => ({
      month: m,
      applications: 0,
    }));

    resumes.forEach((r) => {
      if (!r.created_at) return;

      const month = new Date(r.created_at).getMonth();
      data[month].applications++;
    });

    return data;
  }, [resumes]);

  const screeningFunnel = [
    { label: "Applied", value: totalResumes },
    {
      label: "AI Screened",
      value: resumes.filter(
        (r) => r.score !== null && r.score !== undefined
      ).length,
    },
    { label: "Shortlisted", value: shortlisted },
    { label: "Rejected", value: rejected },
    { label: "Pending", value: pending },
  ];

  const scoreDistribution = useMemo(() => {
    const data = [
      { range: "0-20%", count: 0 },
      { range: "20-40%", count: 0 },
      { range: "40-60%", count: 0 },
      { range: "60-80%", count: 0 },
      { range: "80-100%", count: 0 },
    ];

    resumes.forEach((r) => {
      const s = Number(r.score || 0);

      if (s <= 20) data[0].count++;
      else if (s <= 40) data[1].count++;
      else if (s <= 60) data[2].count++;
      else if (s <= 80) data[3].count++;
      else data[4].count++;
    });

    return data;
  }, [resumes]);

  const skillGap = useMemo(() => {
    const map: Record<string, number> = {};

    resumes.forEach((r) => {
      let skills: string[] = [];

      if (Array.isArray(r.missing_skills)) {
        skills = r.missing_skills;
      } else if (typeof r.missing_skills === "string") {
        skills = r.missing_skills
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean);
      }

      skills.forEach((s) => {
        map[s] = (map[s] || 0) + 1;
      });
    });

    return Object.entries(map)
      .map(([skill, count]) => ({ skill, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 6);
  }, [resumes]);

  const topCandidates = [...resumes]
    .sort((a, b) => Number(b.score || 0) - Number(a.score || 0))
    .slice(0, 5);

  if (loading) {
    return <div className="p-10 text-white">Loading Analytics...</div>;
  }

  return (
    <div className="min-h-screen space-y-6 px-4 py-5 pb-24 text-white sm:px-6 lg:px-8 lg:py-10 lg:pb-8 lg:space-y-12">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-amber-300 sm:text-sm sm:tracking-[0.25em]">
            AI Hiring Intelligence
          </p>

          <h1 className="mt-2 text-2xl font-black tracking-tight sm:text-4xl">
            Analytics Dashboard
          </h1>

          <p className="mt-2 text-sm text-white/50 sm:text-base">
            Real-time insights from jobs, resumes, AI scores, status and skill
            gaps.
          </p>
        </div>

        <button
          onClick={fetchAnalytics}
          className="w-full rounded-2xl border border-amber-300/30 bg-amber-300/10 px-5 py-3 text-sm font-semibold text-amber-200 hover:bg-amber-300/20 sm:w-auto"
        >
          Refresh Data
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
        <StatCard title="Total Jobs" value={totalJobs} icon={<Briefcase />} />
        <StatCard
          title="Total Resumes"
          value={totalResumes}
          icon={<FileText />}
        />
        <StatCard
          title="Average Score"
          value={`${averageScore}%`}
          icon={<Star />}
        />
        <StatCard
          title="Shortlisted"
          value={shortlisted}
          icon={<CheckCircle />}
        />
        <StatCard title="Rejected" value={rejected} icon={<XCircle />} />
        <StatCard title="Pending" value={pending} icon={<Clock />} />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3 lg:gap-8">
        <div className={`${card} lg:col-span-2`}>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
            <div className="w-fit rounded-2xl bg-amber-300/15 p-3 text-amber-300">
              <Brain size={24} />
            </div>

            <div className="min-w-0 flex-1">
              <h2 className="text-lg font-bold sm:text-xl">
                AI Screening Summary
              </h2>

              <p className="mt-2 text-sm text-white/55 sm:text-base">
                Your system has {totalJobs} jobs and {totalResumes} uploaded
                resumes. Average AI match score is {averageScore}%.
              </p>

              <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
                <MiniStat
                  label="AI Screened"
                  value={
                    resumes.filter(
                      (r) => r.score !== null && r.score !== undefined
                    ).length
                  }
                />

                <MiniStat
                  label="High Match"
                  value={
                    resumes.filter((r) => Number(r.score || 0) >= 80).length
                  }
                />

                <MiniStat
                  label="Decision Made"
                  value={shortlisted + rejected}
                />
              </div>
            </div>
          </div>
        </div>

        <div className={card}>
          <div className="flex items-center gap-3">
            <TrendingUp className="text-amber-300" />
            <h3 className="font-bold">Hiring Health</h3>
          </div>

          <div className="mt-5">
            <div className="mb-2 flex justify-between text-sm text-white/60">
              <span>Average Match</span>
              <span>{averageScore}%</span>
            </div>

            <div className="h-3 overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full rounded-full bg-amber-300"
                style={{ width: `${Math.min(averageScore, 100)}%` }}
              />
            </div>

            <p className="mt-4 text-sm text-white/45">
              Higher score means resumes match better with job descriptions.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 lg:gap-8">
        <ChartCard
          title="Monthly Applications"
          subtitle="Resume uploads grouped by month using real created_at dates."
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={monthlyApplications}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
              <XAxis dataKey="month" stroke="rgba(255,255,255,0.55)" />
              <YAxis allowDecimals={false} stroke="rgba(255,255,255,0.55)" />
              <Tooltip />
              <Bar
                dataKey="applications"
                fill="#f59e0b"
                radius={[10, 10, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <div className={card}>
          <h3 className="text-lg font-bold">Screening Funnel</h3>

          <p className="mb-6 mt-1 text-sm text-white/45">
            Real hiring pipeline based on resume status and AI score.
          </p>

          <div className="space-y-5">
            {screeningFunnel.map((item, index) => {
              const percent = totalResumes
                ? Math.round((item.value / totalResumes) * 100)
                : 0;

              return (
                <div key={item.label}>
                  <div className="mb-2 flex items-center justify-between text-sm">
                    <span className="text-white/50">{item.label}</span>
                    <span className="font-bold text-white/75">
                      {item.value} ({percent}%)
                    </span>
                  </div>

                  <div className="h-3 overflow-hidden rounded-full bg-white/10">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${percent}%`,
                        background:
                          index === 0
                            ? "#64748b"
                            : index === 1
                            ? "#818cf8"
                            : index === 2
                            ? "#f59e0b"
                            : index === 3
                            ? "#fb7185"
                            : "#34d399",
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 lg:gap-8">
        <ChartCard
          title="Match Score Distribution"
          subtitle="Histogram showing how candidates scored in AI screening."
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={scoreDistribution}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
              <XAxis dataKey="range" stroke="rgba(255,255,255,0.55)" />
              <YAxis allowDecimals={false} stroke="rgba(255,255,255,0.55)" />
              <Tooltip />
              <Bar dataKey="count" fill="#f59e0b" radius={[10, 10, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard
          title="Top Skills Gap"
          subtitle="Most common missing skills from uploaded resumes."
        >
          {skillGap.length === 0 ? (
            <EmptyText text="No missing skills data available yet." />
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={skillGap} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                <XAxis
                  type="number"
                  allowDecimals={false}
                  stroke="rgba(255,255,255,0.55)"
                />
                <YAxis
                  dataKey="skill"
                  type="category"
                  width={90}
                  stroke="rgba(255,255,255,0.55)"
                />
                <Tooltip />
                <Bar dataKey="count" fill="#a78bfa" radius={[0, 10, 10, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </ChartCard>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 lg:gap-8">
        <div className={card}>
          <h3 className="text-lg font-bold">Top Scoring Candidates</h3>

          <p className="mb-5 mt-1 text-sm text-white/45">
            Candidates ranked by highest AI match score.
          </p>

          <div className="space-y-4">
            {topCandidates.length === 0 ? (
              <EmptyText text="No candidate scores available." />
            ) : (
              topCandidates.map((candidate, index) => {
                const score = Number(candidate.score || 0);

                return (
                  <div
                    key={candidate.id}
                    className="rounded-2xl border border-white/10 bg-white/[0.04] p-4"
                  >
                    <div className="mb-3 flex items-center justify-between gap-3">
                      <div className="flex min-w-0 items-center gap-3">
                        <div
                          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-xs font-bold"
                          style={{
                            background:
                              index === 0
                                ? "rgba(245,158,11,0.18)"
                                : "rgba(255,255,255,0.08)",
                            color:
                              index === 0
                                ? "#F59E0B"
                                : "rgba(255,255,255,0.6)",
                          }}
                        >
                          #{index + 1}
                        </div>

                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold">
                            {candidate.name ||
                              candidate.file_name ||
                              "Unnamed Candidate"}
                          </p>

                          <p className="text-xs capitalize text-white/40">
                            {candidate.status || "pending"}
                          </p>
                        </div>
                      </div>

                      <span className="shrink-0 text-lg font-black text-amber-200">
                        {score}%
                      </span>
                    </div>

                    <div className="h-2.5 overflow-hidden rounded-full bg-white/10">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${Math.min(score, 100)}%`,
                          background:
                            score >= 80
                              ? "#34d399"
                              : score >= 60
                              ? "#f59e0b"
                              : "#fb7185",
                        }}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        <div className={card}>
          <h3 className="text-lg font-bold">Recent Uploaded Resumes</h3>

          <p className="mb-5 mt-1 text-sm text-white/45">
            Latest resumes added to your system.
          </p>

          <div className="space-y-3">
            {resumes.slice(0, 5).length === 0 ? (
              <EmptyText text="No resumes uploaded yet." />
            ) : (
              resumes.slice(0, 5).map((resume: Resume) => (
                <div
                  key={resume.id}
                  className="flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3"
                >
                  <div className="min-w-0">
                    <p className="truncate font-semibold">
                      {resume.name || resume.file_name || "Unnamed Resume"}
                    </p>

                    <p className="text-xs capitalize text-white/40">
                      {resume.status || "pending"}
                    </p>
                  </div>

                  <span className="shrink-0 text-sm font-bold text-amber-200">
                    {Number(resume.score || 0)}%
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({
  title,
  value,
  icon,
}: {
  title: string;
  value: string | number;
  icon: React.ReactNode;
}) {
  return (
    <div
      className={`${card} transition hover:-translate-y-1 hover:bg-white/[0.07]`}
    >
      <div className="w-fit rounded-2xl bg-white/10 p-2.5 text-amber-300 sm:p-3">
        {icon}
      </div>

      <p className="mt-3 text-xs text-white/45 sm:mt-5 sm:text-sm">{title}</p>

      <h2 className="mt-1 text-xl font-black sm:text-3xl">{value}</h2>
    </div>
  );
}

function MiniStat({
  label,
  value,
}: {
  label: string;
  value: string | number;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
      <p className="text-xs text-white/40">{label}</p>
      <h3 className="mt-1 text-2xl font-black">{value}</h3>
    </div>
  );
}

function ChartCard({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <div className={card}>
      <h3 className="text-base font-bold sm:text-lg">{title}</h3>
      <p className="mb-4 mt-1 text-xs text-white/45 sm:mb-5 sm:text-sm">
        {subtitle}
      </p>

      <div className="mt-5 h-64 sm:h-80">{children}</div>
    </div>
  );
}

function EmptyText({ text }: { text: string }) {
  return (
    <div className="flex min-h-[120px] items-center justify-center rounded-2xl border border-dashed border-white/10 p-4 text-center text-sm text-white/35">
      {text}
    </div>
  );
}