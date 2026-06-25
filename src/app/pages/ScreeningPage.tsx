import React, { useEffect, useMemo, useState } from "react";
import { Brain, Loader2, Search, Sparkles } from "lucide-react";
import { supabase } from "../../lib/supabase";
import { c, FONT } from "../../styles/theme";

type Resume = {
  id: string;
  name?: string;
  file_name?: string;
  file_url?: string;
  storage_path?: string;
  job_id?: string | null;
  score?: number;
  matched_skills?: string;
  missing_skills?: string;
  analysis?: string;
  status?: string;
  candidate_email?: string;
};

type Job = {
  id: string;
  title?: string;
  role?: string;
  eligibility?: string;
  description?: string;
  skills?: string;
};

type Candidate = {
  id?: string | number;
  name: string;
  role: string;
  score: number;
  status: string;
  time?: string;
  fileName?: string;
  matchedSkills?: string[];
  missingSkills?: string[];
  semanticScore?: number;
  keywordScore?: number;
};

type ScreeningPageProps = {
  onScreeningComplete?: (results: Candidate[]) => void;
};

export default function ScreeningPage({ onScreeningComplete }: ScreeningPageProps) {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [selectedJobId, setSelectedJobId] = useState("");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

async function fetchData() {

  const {
    data: { user },
  } = await supabase.auth.getUser();


  if (!user) return;


  const { data: jobsData, error: jobsError } = await supabase
    .from("jobs")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });


  const { data: resumesData, error: resumesError } = await supabase
    .from("resumes")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });


  if (jobsError) {
    console.error("Jobs error:", jobsError.message);
  }

  if (resumesError) {
    console.error("Resumes error:", resumesError.message);
  }


  setJobs(jobsData || []);
  setResumes(resumesData || []);


  if (jobsData && jobsData.length > 0 && !selectedJobId) {
    setSelectedJobId(jobsData[0].id);
  }
}
async function runAIScreening() {
  if (!selectedJobId) {
    alert("Please select a job first.");
    return;
  }

  const selectedJob = jobs.find((job) => job.id === selectedJobId);

  if (!selectedJob) {
    alert("Selected job not found.");
    return;
  }

  const resumesForJob = resumes.filter(
    (resume) => resume.job_id === selectedJobId
  );

  if (resumesForJob.length === 0) {
    alert("No resumes found for this job.");
    return;
  }

  const resumesWithUrls = resumesForJob.map((resume) => {
    let finalUrl = resume.file_url || "";

    if (!finalUrl && resume.storage_path) {
      const { data } = supabase.storage
        .from("resumes")
        .getPublicUrl(resume.storage_path);

      finalUrl = data.publicUrl;
    }

    return {
      id: resume.id,
      file_name: resume.file_name || "",
      file_url: finalUrl,
    };
  });

  const missingUrl = resumesWithUrls.some((resume) => !resume.file_url);

  if (missingUrl) {
    alert("Some resumes do not have file URLs. Check Supabase storage path.");
    return;
  }

  setLoading(true);

  try {
   const scanResponse = await fetch(
  `${import.meta.env.VITE_API_URL}/screen-resumes-ai`,
  {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      job_id: selectedJob.id,
      job_title: selectedJob.title || selectedJob.role || "",
      job_description: `${selectedJob.description || ""} ${
        selectedJob.eligibility || ""
      } ${selectedJob.skills || ""}`,
      resumes: resumesWithUrls,
    }),
  }
);
  const data = await scanResponse.json();

console.log("AI backend response:", data);

if (!scanResponse.ok) {
  throw new Error(data.detail || "Backend AI screening failed");
}

    for (const result of data.results) {
      const { error } = await supabase
        .from("resumes")
        .update({
          score: result.score,
          matched_skills: result.matched_skills,
          missing_skills: result.missing_skills,
          analysis: result.analysis,
          status: result.status,
        })
        .eq("id", result.id);

      if (error) {
        console.error("Supabase update error:", error.message);
      }
    }
    const candidateResults: Candidate[] = data.results.map((result: any) => {
  const originalResume = resumesForJob.find((r) => r.id === result.id);

  return {
    id: result.id,
    name: originalResume?.name || originalResume?.file_name || "Unnamed Candidate",
    role: selectedJob.title || selectedJob.role || "Candidate",
    score: result.score,
    status: result.status,
    fileName: originalResume?.file_name || "",
    matchedSkills: result.matched_skills
      ? result.matched_skills.split(",").map((s: string) => s.trim())
      : [],
    missingSkills: result.missing_skills
      ? result.missing_skills.split(",").map((s: string) => s.trim())
      : [],
    time: new Date().toLocaleString(),
  };
});

onScreeningComplete?.(candidateResults);

    await fetchData();
    alert("AI Screening completed successfully.");
  } catch (error) {
    console.error("AI Screening error:", error);
    alert("AI Screening failed. Open console/backend terminal.");
  } finally {
    setLoading(false);
  }
}

  const filteredResumes = useMemo(() => {
    return resumes.filter((resume) => {
      const matchesJob = resume.job_id === selectedJobId;

      const matchesSearch = `${resume.name || ""} ${resume.file_name || ""}`
        .toLowerCase()
        .includes(search.toLowerCase());

      return matchesJob && matchesSearch;
    });
  }, [resumes, selectedJobId, search]);

  const selectedJob = jobs.find((job) => job.id === selectedJobId);

  return (
    <div
      className="min-h-screen w-full px-4 py-5 sm:px-6 lg:px-8 lg:py-8"
      style={{
        fontFamily: FONT,
        color: c.text,
      }}
    >
      <div className="mb-10 flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p
            className="text-sm font-semibold uppercase tracking-[0.25em]"
            style={{ color: c.amber }}
          >
            AI Resume Screening
          </p>

          <h1
            className="mt-2 text-2xl font-bold tracking-tight"
            style={{ color: c.text }}
          >
            Screening Center
          </h1>

          <p className="mt-2 max-w-2xl text-sm" style={{ color: c.textDim }}>
            Select a job, run AI screening, and  match scores, matched
            Select a job, run AI screening, and Can View match scores, matched
            skills, missing skills, and AI analysis 
          </p>
        </div>

        <button
          onClick={runAIScreening}
          disabled={loading}
          className="flex w-full items-center justify-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold sm:w-auto"
          style={{
            background: c.amber,
            color: "#050505",
            boxShadow: `0 0 28px ${c.amberGlow}`,
          }}
        >
          {loading ? (
            <Loader2 className="animate-spin" size={20} />
          ) : (
            <Brain size={20} />
          )}
          {loading ? "Screening..." : "Run AI Screening"}
        </button>
      </div>

      <div
        className="mb-8 rounded-2xl p-5"
        style={{
          background: c.surface,
          border: `1px solid ${c.border}`,
          boxShadow: "0 20px 80px rgba(0,0,0,0.25)",
        }}
      >
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm" style={{ color: c.textDim }}>
              Select Job
            </label>

            <select
              value={selectedJobId}
              onChange={(e) => setSelectedJobId(e.target.value)}
              className="w-full rounded-2xl px-4 py-3 outline-none"
              style={{
                background: "rgba(0,0,0,0.35)",
                color: c.text,
                border: `1px solid ${c.border}`,
              }}
            >
              {jobs.length === 0 ? (
                <option>No jobs found</option>
              ) : (
                jobs.map((job) => (
                  <option key={job.id} value={job.id}>
                    {job.title || job.role || "Untitled Job"}
                  </option>
                ))
              )}
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm" style={{ color: c.textDim }}>
              Search Resume
            </label>

            <div
              className="flex items-center gap-3 rounded-2xl px-4 py-3"
              style={{
                background: "rgba(0,0,0,0.35)",
                border: `1px solid ${c.border}`,
              }}
            >
              <Search size={18} style={{ color: c.textDim }} />

              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search candidate or file..."
                className="w-full bg-transparent outline-none"
                style={{ color: c.text }}
              />
            </div>
          </div>
        </div>

        {selectedJob && (
          <div
            className="mt-6 rounded-2xl p-5"
            style={{
              background: "rgba(255,255,255,0.04)",
              border: `1px solid ${c.border}`,
            }}
          >
            <div className="flex items-start gap-3">
              <Sparkles size={22} style={{ color: c.amber }} />

              <div>
                <h3 className="font-bold" style={{ color: c.text }}>
                  {selectedJob.title || selectedJob.role || "Untitled Job"}
                </h3>

                <p className="mt-1 text-sm" style={{ color: c.textDim }}>
                  AI will compare the complete job description with uploaded
                  resumes using semantic embeddings.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 gap-6">
        {filteredResumes.length === 0 ? (
          <div
            className="rounded-3xl p-10 text-center"
            style={{
              background: c.surface,
              border: `1px dashed ${c.border}`,
              color: c.textDim,
            }}
          >
            No resumes found for this job. Upload resumes first.
          </div>
        ) : (
          filteredResumes.map((resume) => (
            <div
              key={resume.id}
              className="rounded-2xl p-5"
              style={{
                background: c.surface,
                border: `1px solid ${c.border}`,
                boxShadow: "0 20px 80px rgba(0,0,0,0.22)",
              }}
            >
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <h3
                    className="text-base font-semibold"
                    style={{ color: c.text }}
                  >
                    {resume.name || resume.file_name || "Unnamed Candidate"}
                  </h3>

                  <p
                    className="mt-1 text-sm capitalize"
                    style={{ color: c.textDim }}
                  >
                    Status: {resume.status || "Pending"}
                  </p>
                </div>

                <div
                  className="rounded-xl px-4 py-2 text-lg font-bold"
                  style={{
                    background: "rgba(245,185,66,0.13)",
                    color: c.amber,
                    border: `1px solid ${c.amber}35`,
                  }}
                >
                  {resume.score !== null && resume.score !== undefined
                    ? `${resume.score}%`
                    : "Not Screened"}
                </div>
              </div>
              {resume.file_url && (
  <div className="mt-4 flex flex-wrap gap-3">
    <button
      onClick={() => window.open(resume.file_url, "_blank")}
      className="rounded-xl border border-white/10 px-4 py-2 text-xs font-semibold text-white"
    >
      View Resume
    </button>

    <a
      href={resume.file_url}
      download={resume.file_name || "resume"}
      className="rounded-xl bg-black-500 px-4 py-2 text-xs font-semibold text-white"
    >
      Download
    </a>
<button
  onClick={() => {
    const subject = encodeURIComponent("Interview Opportunity");

    const body = encodeURIComponent(`Hello,

Your resume has been shortlisted.

We would like to continue with the next step of our hiring process.

Regards,
Recruitment Team`);

    window.open(
      `https://mail.google.com/mail/?view=cm&fs=1&su=${subject}&body=${body}`,
      "_blank"
    );
  }}
  className="rounded-lg bg-black px-3 py-2 text-xs font-semibold text-white"
>
  Send Email
</button>
  </div>
)}

              <div className="mt-5 grid grid-cols-1 gap-4 lg:grid-cols-2">
                <div
                  className="rounded-xl p-3"
                  style={{
                    background: "rgba(0,0,0,0.23)",
                    border: `1px solid ${c.border}`,
                  }}
                >
                  <p className="text-sm" style={{ color: c.textDim }}>
                    Matched Skills
                  </p>

                  <p className="mt-2 text-sm text-green-300">
                    {resume.matched_skills ||
                      "Run AI Screening to get matched skills"}
                  </p>
                </div>

                <div
                  className="rounded-2xl p-4"
                  style={{
                    background: "rgba(0,0,0,0.23)",
                    border: `1px solid ${c.border}`,
                  }}
                >
                  <p className="text-sm" style={{ color: c.textDim }}>
                    Missing Skills
                  </p>

                  <p className="mt-2 text-xs text-red-300">
                    {resume.missing_skills ||
                      "Run AI Screening to get missing skills"}
                  </p>
                </div>
              </div>

              <div
                className="mt-5 rounded-2xl p-4"
                style={{
                  background: "rgba(255,255,255,0.035)",
                  border: `1px solid ${c.border}`,
                }}
              >
                <p className="text-sm" style={{ color: c.textDim }}>
                  AI Analysis
                </p>

                <p className="mt-2 whitespace-pre-line text-xs leading-6" style={{ color: c.text }}>
                  {resume.analysis || "No analysis generated yet."}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}