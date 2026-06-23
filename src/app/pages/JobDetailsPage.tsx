import React, { useEffect, useRef, useState } from "react";
import { ArrowLeft, Upload, X } from "lucide-react";
import { supabase } from "../../lib/supabase";


export default function JobDetailsPage({
  job,
  onBack,
  onUpdateJob,
  onScreeningComplete,
}: any) {
  const fileRef = useRef<HTMLInputElement | null>(null);
  const [loading, setLoading] = useState(false);
  const [resumes, setResumes] = useState<any[]>([]);

  const fetchResumes = async () => {
    const { data, error } = await supabase
      .from("resumes")
      .select("*")
      .eq("job_id", job.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.log("Fetch resumes error:", error.message);
      return;
    }

   setResumes(
  (data || []).map((resume) => ({
    id: resume.id,
    fileName: resume.file_name,
    fileUrl: resume.file_url,
    fileType: resume.file_type,
    status: resume.status || "Ready",
  }))
);
  };

  useEffect(() => {
    fetchResumes();
  }, [job.id]);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    for (const file of files) {
      const cleanFileName = file.name.replace(/\s+/g, "_");
      const filePath = `${job.id}/${Date.now()}_${cleanFileName}`;

      const { error: uploadError } = await supabase.storage
        .from("resumes")
        .upload(filePath, file);

      if (uploadError) {
        console.log("Resume upload error:", uploadError.message);
        continue;
      }

      const { data: urlData } = supabase.storage
        .from("resumes")
        .getPublicUrl(filePath);

      const { error: insertError } = await supabase.from("resumes").insert({
        job_id: job.id,
        file_name: file.name,
        file_url: urlData.publicUrl,
        file_type: file.type || "application/pdf",
        status: "Ready",
      });

      if (insertError) {
        console.log("Resume DB insert error:", insertError.message);
      }
    }

    await fetchResumes();
    e.target.value = "";
  };

  const removeResume = async (id: string) => {
    const { error } = await supabase.from("resumes").delete().eq("id", id);

    if (error) {
      console.log("Delete resume error:", error.message);
      return;
    }

    setResumes((prev) => prev.filter((resume) => resume.id !== id));
  };
const runScreening = async () => {
  if (resumes.length === 0) return;

  setLoading(true);

  try {
    const results = [];

    for (const resume of resumes) {
      if (!resume.fileUrl) {
        console.log("Missing file URL for:", resume.fileName);
        continue;
      }

      const response = await fetch(resume.fileUrl);
      const blob = await response.blob();

      const file = new File([blob], resume.fileName, {
        type: resume.fileType || "application/pdf",
      });

      const formData = new FormData();
      formData.append("file", file);
      formData.append("job_description", job.description || "");

      const scanResponse = await fetch("http://127.0.0.1:8000/scan-resume", {
        method: "POST",
        body: formData,
      });

      if (!scanResponse.ok) {
        const errorText = await scanResponse.text();
        console.log("Backend error:", errorText);
        continue;
      }

      const data = await scanResponse.json();

      await supabase
        .from("resumes")
        .update({
          status: data.status || "Needs Review",
          score: data.score || 0,
          matched_skills: data.matchedSkills || [],
          missing_skills: data.missingSkills || [],
          analysis: data.analysis || "",
        })
        .eq("id", resume.id);

      results.push({
        id: resume.id,
        name: data.name || resume.fileName.replace(".pdf", "").replace(".docx", ""),
        role: job.role || "Candidate",
        score: data.score || 0,
        status: data.status || "Needs Review",
        fileName: resume.fileName,
        matchedSkills: data.matchedSkills || [],
        missingSkills: data.missingSkills || [],
        semanticScore: data.semanticScore || 0,
        keywordScore: data.keywordScore || 0,
        time: data.time,
      });
    }

    await fetchResumes();
    onScreeningComplete(results);
  } catch (error) {
    console.error("Screening failed:", error);
    alert("Screening failed. Make sure backend is running.");
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="p-6 text-white">
      <button onClick={onBack} className="mb-6 flex items-center gap-2">
        <ArrowLeft size={18} />
        Back
      </button>

      <div className="rounded-2xl bg-[#111827] p-6 border border-white/10 mb-6">
        <h1 className="text-3xl font-bold">{job.role}</h1>

        <p className="text-gray-400 mt-2">Eligibility: {job.eligibility}</p>

        <p className="text-gray-400">Location: {job.location}</p>

        <p className="mt-4 text-sm text-gray-300 whitespace-pre-line">
          {job.description}
        </p>
      </div>

      <div className="rounded-2xl bg-[#111827] p-6 border border-white/10">
        <div className="flex justify-between items-center mb-5">
          <h2 className="text-xl font-bold">Uploaded Resumes</h2>

          <button
            onClick={() => fileRef.current?.click()}
            className="flex items-center gap-2 rounded-xl bg-amber-500 px-4 py-2 text-black font-semibold"
          >
            <Upload size={18} />
            Upload Resumes
          </button>

          <input
            ref={fileRef}
            type="file"
            multiple
            accept=".pdf,.doc,.docx"
            onChange={handleUpload}
            className="hidden"
          />
        </div>

        {resumes.length === 0 ? (
          <p className="text-gray-400">No resumes uploaded yet.</p>
        ) : (
          <div className="space-y-3">
            {resumes.map((resume: any) => (
              <div
                key={resume.id}
                className="flex justify-between items-center rounded-xl bg-black/30 p-4 border border-white/10"
              >
                <div>
                  <p>{resume.fileName}</p>

                 {resume.fileUrl && (
  <div className="mt-2 flex gap-3">
    <a
      href={resume.fileUrl}
      target="_blank"
      rel="noreferrer"
      className="text-sm text-amber-400"
    >
      View Resume
    </a>

    <a
      href={resume.fileUrl}
      download={resume.fileName}
      className="text-sm text-green-400"
    >
      Download
    </a>
  </div>
)}

                  <p className="text-sm text-gray-400">{resume.status}</p>
                </div>

                <button onClick={() => removeResume(resume.id)}>
                  <X size={18} className="text-red-400" />
                </button>
              </div>
            ))}
          </div>
        )}

        <button
          onClick={runScreening}
          disabled={loading || resumes.length === 0}
          className="mt-6 rounded-xl bg-green-500 px-5 py-2 text-black font-semibold disabled:opacity-50"
        >
          {loading ? "Screening..." : "Run Screening"}
        </button>
      </div>
    </div>
  );
}