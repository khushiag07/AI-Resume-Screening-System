import React, { useState } from "react";
import { X } from "lucide-react";
import { supabase } from "../../lib/supabase";

type UploadedResume = {
  id: string;
  fileName: string;
  status: "Ready" | "Screened";
  score?: number;
  fileUrl?: string;
};

export type Job = {
  id: string;
  role: string;
  eligibility: string;
  location: string;
  description: string;
  resumes: UploadedResume[];
};

type PostJobProps = {
  onClose: () => void;
  onAddJob: (job: Job) => void;
};

export default function PostJob({ onClose, onAddJob }: PostJobProps) {
  const [role, setRole] = useState("");
  const [eligibility, setEligibility] = useState("");
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
  e.preventDefault();

  if (!role || !eligibility || !location || !description) {
    setError("Please fill all required fields.");
    return;
  }

  const { data, error } = await supabase
    .from("jobs")
    .insert({
      title: role,
      eligibility: eligibility,
      location: location,
      description: description,
    })
    .select()
    .single();

  if (error) {
    console.log("Job save error:", error.message);
    setError(error.message);
    return;
  }

  const newJob: Job = {
    id: data.id,
    role: data.title,
    eligibility: data.eligibility,
    location: data.location,
    description: data.description,
    resumes: [],
  };

  onAddJob(newJob);
  onClose();
};


  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 py-6">
      <div className="max-h-[90vh] w-full max-w-[520px] overflow-y-auto rounded-2xl border border-white/10 bg-[#111827] p-4 text-white sm:p-6">
        <div className="flex justify-between items-center mb-5">
          <h2 className="text-xl font-bold sm:text-2xl">Create New Job</h2>

          <button onClick={onClose}>
            <X size={22} />
          </button>
        </div>

        {error && (
          <p className="mb-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 text-sm">
            {error}
          </p>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label>Role *</label>
            <input
              value={role}
              onChange={(e) => setRole(e.target.value)}
              placeholder="Senior Python Developer"
              className="w-full mt-2 p-3 rounded-xl bg-black/30 border border-white/10"
            />
          </div>

          <div>
            <label>Eligibility *</label>
            <input
              value={eligibility}
              onChange={(e) => setEligibility(e.target.value)}
              placeholder="B.Tech CSE / 2+ years experience"
              className="w-full mt-2 p-3 rounded-xl bg-black/30 border border-white/10"
            />
          </div>

          <div>
            <label>Location *</label>
            <input
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Jaipur / Remote / Bangalore"
              className="w-full mt-2 p-3 rounded-xl bg-black/30 border border-white/10"
            />
          </div>

          <div>
            <label>Job Description *</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Paste job description..."
              rows={5}
              className="w-full mt-2 p-3 rounded-xl bg-black/30 border border-white/10 resize-none"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-amber-500 text-black font-semibold py-3 rounded-xl hover:bg-amber-400"
          >
            Create Job
          </button>
        </form>
      </div>
    </div>
  );
}