import React, { useEffect, useMemo, useState } from "react";
import { Brain, Loader2, Search, Sparkles } from "lucide-react";
import { supabase } from "../../lib/supabase";
import { c, FONT } from "../../styles/theme";
import * as pdfjsLib from "pdfjs-dist";

type Resume = {
 id:string;
 name?:string;
 file_name?:string;
 file_url?:string;
 job_id?:string | null;

 score?:number;
 matched_skills?:string;
 missing_skills?:string;
 analysis?:string;
 status?:string;
};

type Job = {
  id: string;
  title?: string;
  description?: string;
  skills?: string;
};

const SKILL_LIBRARY = [
  "python",
  "sql",
  "machine learning",
  "deep learning",
  "react",
  "node",
  "typescript",
  "javascript",
  "power bi",
  "excel",
  "pandas",
  "numpy",
  "tensorflow",
  "pytorch",
  "docker",
  "aws",
  "nlp",
  "fastapi",
  "supabase",
];

export default function ScreeningPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [selectedJobId, setSelectedJobId] = useState("");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);
  async function extractPdfText(url:string){

const response =
await fetch(url);

const blob =
await response.blob();

const buffer =
await blob.arrayBuffer();


const pdf = await pdfjsLib.getDocument({ data: buffer }).promise;
let text="";
for(
let i=1;
i<=pdf.numPages;
i++
){

const page =
await pdf.getPage(i);


const content =
await page.getTextContent();


const pageText =
content.items
.map((item:any)=>item.str)
.join(" ");


text += pageText;

}


return text;

}

  async function fetchData() {
    const { data: jobsData, error: jobsError } = await supabase
      .from("jobs")
      .select("*")
      .order("created_at", { ascending: false });

    const { data: resumesData, error: resumesError } = await supabase
      .from("resumes")
      .select("*")
      .order("created_at", { ascending: false });

    if (jobsError) console.error("Jobs error:", jobsError.message);
    if (resumesError) console.error("Resumes error:", resumesError.message);

    setJobs(jobsData || []);
    setResumes(resumesData || []);

    if (jobsData && jobsData.length > 0 && !selectedJobId) {
      setSelectedJobId(jobsData[0].id);
    }
  }

  function getJobSkills(job: Job) {
    const text = `${job.title || ""} ${job.description || ""} ${
      job.skills || ""
    }`.toLowerCase();

    return SKILL_LIBRARY.filter((skill) => text.includes(skill));
  }
function analyzeResume(
resumeText:string,
job:Job
){

const text =
resumeText.toLowerCase();


const jobSkills =
getJobSkills(job);


const matched =
jobSkills.filter(
skill =>
text.includes(skill)
);


const missing =
jobSkills.filter(
skill =>
!text.includes(skill)
);



const score =
jobSkills.length
?
Math.round(
matched.length /
jobSkills.length
*100
)
:
0;



return {
score,
matched,
missing,
analysis:
`Matched ${matched.length}/${jobSkills.length}
required skills.`

};

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
      (resume) => resume.job_id === selectedJobId || !resume.job_id
    );

    if (resumesForJob.length === 0) {
      alert("No resumes found for this job.");
      return;
    }

    setLoading(true);

    for (const resume of resumesForJob) {
const resumeText =
await extractPdfText(
resume.file_url!
);


const result =
analyzeResume(
resumeText,
selectedJob
);

      const { error } = await supabase
        .from("resumes")
        .update({
          score: result.score,
       matched_skills: result.matched.join(", "),
missing_skills: result.missing.join(", "),
          analysis: result.analysis,
          status: resume.status || "pending",
        })
        .eq("id", resume.id);

      if (error) console.error("Screening update error:", error.message);
    }


await fetchData();

setLoading(false);

alert("AI Screening completed successfully.");

}
  const filteredResumes = useMemo(() => {
    return resumes.filter((resume) => {
      const matchesJob =
        resume.job_id === selectedJobId || !resume.job_id || !selectedJobId;

      const matchesSearch = `${resume.name || ""} ${resume.file_name || ""}`
        .toLowerCase()
        .includes(search.toLowerCase());

      return matchesJob && matchesSearch;
    });
  }, [resumes, selectedJobId, search]);
  const selectedJob =
jobs.find(
(job)=>job.id===selectedJobId
);

  return (
    <div
      className="min-h-screen px-8 py-8"
      style={{
        fontFamily: FONT,
        color: c.text,
      }}
    >
      {/* Header */}
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
            Select a job, run AI screening, and save real match scores, matched
            skills, missing skills, and AI analysis into Supabase.
          </p>
        </div>

        <button
          onClick={runAIScreening}
          disabled={loading}
          className="flex items-center justify-center gap-2"
rounded-xl px-4 py-2
text-sm font-semibold
          style={{
            background: c.amber,
            color: "#050505",
            boxShadow: `0 0 28px ${c.amberGlow}`,
          }}
        >
          {loading ? <Loader2 className="animate-spin" size={20} /> : <Brain size={20} />}
          {loading ? "Screening..." : "Run AI Screening"}
        </button>
      </div>

      {/* Control Panel */}
      <div
        className="mb-8 rounded-2xl p-5"
        style={{
          background: c.surface ,
          border: `1px solid ${c.border}`,
          boxShadow: "0 20px 80px rgba(0,0,0,0.25)",
        }}
      >
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm" style={{ color: c.textDim}}>
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
                    {job.title || "Untitled Job"}
                  </option>
                ))
              )}
            </select>
          </div>

          <div>
            <label className="mt-2 max-w-2xl text-xs" style={{ color: c.textDim }}>
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
                  {selectedJob.title || "Untitled Job"}
                </h3>

                <p className="mt-1 text-sm" style={{ color: c.textDim }}>
                  Required skills detected:{" "}
                  {getJobSkills(selectedJob).length > 0
                    ? getJobSkills(selectedJob).join(", ")
                    : "No skills detected from job description yet"}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Resume Results */}
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
            No resumes found. Upload resumes first.
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
                  <h3 className="text-base font-semibold" style={{ color: c.text }}>
                    {resume.name || resume.file_name || "Unnamed Candidate"}
                  </h3>

                  <p className="mt-1 text-sm capitalize" style={{ color: c.textDim }}>
                    Status: {resume.status || "pending"}
                  </p>
                </div>

                <div
                  className="
rounded-xl px-4 py-2
text-lg font-bold
"
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

              <div className="mt-5 grid grid-cols-1 gap-4 lg:grid-cols-2">
                <div
                  className="rounded-xl p-3"
                  style={{
                    background: "rgba(0,0,0,0.23)",
                    border: `1px solid ${c.border}`,
                  }}
                >
                  <p className="text-sm" style={{ color:c.textDim }}>
                    Matched Skills
                  </p>

                  <p className="mt-2 text-sm text-green-300">
                    {resume.matched_skills || "Run AI Screening to get matched skills"}
                  </p>
                </div>

                <div
                  className="rounded-2xl p-4"
                  style={{
                    background: "rgba(0,0,0,0.23)",
                    border: `1px solid ${c.border}`,
                  }}
                >
                  <p className="text-sm" style={{ color: c.textDim}}>
                    Missing Skills
                  </p>

                  <p className="mt-2 text-xs text-red-300">
                    {resume.missing_skills || "Run AI Screening to get missing skills"}
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
                <p className="text-sm" style={{ color: c.textDim}}>
                  AI Analysis
                </p>

                <p className="mt-2 text-xs leading-6" style={{ color: c.text }}>
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