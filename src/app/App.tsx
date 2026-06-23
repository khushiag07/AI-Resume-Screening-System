import React, { useEffect, useState } from "react";
import { Session } from "@supabase/supabase-js";
import { Navbar } from "./components/Navbar";
import AuthPage from "./pages/AuthPage";

import BillingPage from "./pages/BillingPage";
import PostJob, { Job } from "./pages/PostJob";
import DashboardPage from "./pages/Dashboardpage";
import CandidatePage from "./pages/CandidatePage";
import AnalyticsPage from "./pages/AnalyticsPage";
import SettingsPage from "./pages/SettingPage";
import ScreeningPage from "./pages/ScreeningPage";
import JobDetailsPage from "./pages/JobDetailsPage";

import { supabase } from "../lib/supabase";

const FONT = "'Plus Jakarta Sans', sans-serif";

const c = {
  bg: "#070B13",
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
  jobRole?: string;
  eligibility?: string;
  location?: string;
};

export default function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  const [showPostJob, setShowPostJob] = useState(false);
  const [activePage, setActivePage] = useState("dashboard");

  const [uploadedCandidates, setUploadedCandidates] = useState<Candidate[]>([]);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [jobs, setJobs] = useState<Job[]>([]);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setAuthLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setAuthLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);
  

 useEffect(() => {
    if (session) {
      fetchJobs();
    }
  }, [session]);

  const fetchJobs = async () => {
    if (!session?.user?.id) return;

    const { data, error } = await supabase
      .from("jobs")
      .select(`
        id,
        title,
        eligibility,
        location,
        description,
        created_at,
        candidates (
          id,
          score,
          status,
          resumes (
            id,
            file_name,
            file_url
          )
        )
      `)
      .eq("user_id", session.user.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.log("Fetch jobs error:", error.message);
      return;
    }

    const formattedJobs = (data || []).map((job: any) => ({
      id: job.id,
      role: job.title,
      eligibility: job.eligibility,
      location: job.location,
      description: job.description,
      resumes: [],
    }));

    setJobs(formattedJobs);
  };

  const updateJob = (updatedJob: Job) => {
    setJobs((prev) =>
      prev.map((job) => (job.id === updatedJob.id ? updatedJob : job))
    );

    setSelectedJob(updatedJob);
  };

  if (authLoading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center text-white"
        style={{
          background: c.bg,
          fontFamily: FONT,
        }}
      >
        Loading...
      </div>
    );
  }

  if (!session) {
    return <AuthPage />;
  }

  const pages: Record<string, React.ReactNode> = {
    dashboard: <DashboardPage uploadedCandidates={uploadedCandidates} />,

    jobs: (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">Job Profiles</h1>
            <p className="text-gray-400 mt-1">
              Manage all created screening jobs
            </p>
          </div>

          <button
            onClick={() => setShowPostJob(true)}
            className="rounded-xl bg-amber-500 px-5 py-3 text-black font-semibold hover:bg-amber-400"
          >
            + Post New Job
          </button>
        </div>

        {jobs.length === 0 ? (
          <div className="rounded-2xl border border-white/10 bg-[#111827] p-8 text-center text-gray-400">
            No jobs created yet. Click Post New Job to create one.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {jobs.map((job) => (
              <div
                key={job.id}
                onClick={() => {
                  setSelectedJob(job);
                  setActivePage("jobDetails");
                }}
                className="cursor-pointer rounded-2xl border border-white/10 bg-[#111827] p-5 hover:bg-[#162033] transition"
              >
                <h3 className="text-xl font-bold text-white">{job.role}</h3>

                <p className="text-gray-400 mt-1">
                  Eligibility: {job.eligibility}
                </p>

                <p className="text-gray-400 mt-1">
                  Location: {job.location}
                </p>

                <p className="text-sm text-gray-500 mt-4 line-clamp-3">
                  {job.description}
                </p>

                <div className="mt-5 flex items-center justify-between">
                  <span className="text-sm text-gray-400">
                    Resumes: {job.resumes?.length || 0}
                  </span>

                  <button className="rounded-xl bg-amber-500 px-4 py-2 text-black text-sm font-semibold">
                    Open Job
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {showPostJob && (
          <PostJob
            onClose={() => setShowPostJob(false)}
            onAddJob={(job: Job) => {
              setJobs((prev) => [job, ...prev]);
              setShowPostJob(false);
            }}
          />
        )}
      </div>
    ),

    candidates: <CandidatePage uploadedCandidates={uploadedCandidates} />,
screening: (
  <ScreeningPage
    onScreeningComplete={(results: Candidate[]) => {
      setUploadedCandidates(results);
      setActivePage("candidates");
    }}
  />
),
billing: <BillingPage />,

    analytics: <AnalyticsPage />,

    settings: <SettingsPage />,

    jobDetails:
      selectedJob && (
        <JobDetailsPage
          job={selectedJob}
          onBack={() => setActivePage("jobs")}
          onUpdateJob={updateJob}
          onScreeningComplete={(results: Candidate[]) => {
            setUploadedCandidates(results);
            setActivePage("candidates");
          }}
        />
      ),
  };

  return (
    <div
      className="min-h-screen"
      style={{
        background: c.bg,
        fontFamily: FONT,
      }}
    >
      <Navbar activePage={activePage} onNavigate={setActivePage} />

<main className="pt-16 max-sm:pt-20 max-sm:pb-24">
  <div className="max-w-7xl mx-auto px-6 py-8 max-sm:px-3 max-sm:py-4">
    

    {pages[activePage] ?? (
      <DashboardPage uploadedCandidates={uploadedCandidates} />
    )}
  </div>
</main>
    </div>
  );
}