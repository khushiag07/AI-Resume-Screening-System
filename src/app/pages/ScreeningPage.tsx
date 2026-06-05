import React, { useState } from "react";
import {
  Upload,
  FileSearch,
  Clock,
  CheckCircle,
  XCircle,
} from "lucide-react";

import { Card } from "../components/ui/card";
import { c, FONT, MONO } from "../../styles/theme";

export default function ScreeningPage() {
  const [dragging, setDragging] = useState(false);
  const [uploaded, setUploaded] = useState<string[]>([]);

  const handleFiles = (files: File[]) => {
    const fileNames = files.map((file) => file.name);
    setUploaded((prev) => [...prev, ...fileNames]);
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <div className="flex items-center gap-2.5">
          <h1
            style={{
              color: c.text,
              fontFamily: FONT,
              fontSize: "22px",
              fontWeight: 700,
            }}
          >
            AI Screening
          </h1>

          <span
            className="px-2 py-0.5 rounded"
            style={{
              fontSize: "9px",
              fontWeight: 700,
              background: "linear-gradient(135deg, #F59E0B 0%, #D97706 100%)",
              color: "#070B13",
              fontFamily: MONO,
            }}
          >
            AI
          </span>
        </div>

        <p
          style={{
            color: c.textDim,
            fontFamily: FONT,
            fontSize: "14px",
            marginTop: "4px",
          }}
        >
          Upload resumes and let the AI screen and rank candidates automatically.
        </p>
      </div>

      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          handleFiles(Array.from(e.dataTransfer.files));
        }}
        className="flex flex-col items-center justify-center gap-4 rounded-2xl cursor-pointer transition-all px-8 py-16"
        style={{
          border: `2px dashed ${
            dragging ? c.amber : "rgba(255,255,255,0.1)"
          }`,
          background: dragging ? c.amberDim : "rgba(255,255,255,0.02)",
        }}
      >
        <div
          className="w-14 h-14 rounded-2xl flex items-center justify-center"
          style={{
            background: c.amberDim,
            boxShadow: `0 0 24px ${c.amberGlow}`,
          }}
        >
          <Upload size={22} style={{ color: c.amber }} />
        </div>

        <div className="text-center">
          <p
            style={{
              fontWeight: 600,
              color: c.text,
              fontSize: "15px",
              fontFamily: FONT,
            }}
          >
            Drop resumes here to screen
          </p>

          <p
            style={{
              fontSize: "12px",
              color: c.textDim,
              fontFamily: FONT,
              marginTop: "4px",
            }}
          >
            PDF, DOC, DOCX supported · Up to 50 files at once
          </p>
        </div>

        <label
          className="px-5 py-2 rounded-lg text-sm cursor-pointer transition-all"
          style={{
            fontWeight: 600,
            background: "linear-gradient(135deg, #F59E0B 0%, #D97706 100%)",
            color: "#070B13",
            fontFamily: FONT,
          }}
        >
          Browse files
          <input
            type="file"
            className="hidden"
            multiple
            accept=".pdf,.doc,.docx"
            onChange={(e) => {
              handleFiles(Array.from(e.target.files ?? []));
              e.target.value = "";
            }}
          />
        </label>
      </div>

      {uploaded.length > 0 && (
        <Card>
          <div
            className="flex items-center justify-between px-5 py-3.5"
            style={{ borderBottom: `1px solid ${c.border}` }}
          >
            <span
              style={{
                fontSize: "13px",
                fontWeight: 600,
                color: c.text,
                fontFamily: FONT,
              }}
            >
              Processing Queue{" "}
              <span style={{ color: c.amber }}>({uploaded.length})</span>
            </span>

            <button
              onClick={() => setUploaded([])}
              style={{
                fontSize: "11px",
                color: c.textDim,
                fontFamily: FONT,
              }}
              className="hover:underline"
            >
              Clear all
            </button>
          </div>

          <div className="divide-y" style={{ borderColor: c.border }}>
            {uploaded.map((name, i) => (
              <div
                key={`${name}-${i}`}
                className="flex items-center gap-3 px-5 py-3 transition-colors"
              >
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                  style={{ background: c.amberDim }}
                >
                  <FileSearch size={14} style={{ color: c.amber }} />
                </div>

                <span
                  className="text-sm flex-1 truncate"
                  style={{ color: c.textMid, fontFamily: FONT }}
                >
                  {name}
                </span>

                {i === 0 ? (
                  <span
                    className="flex items-center gap-1"
                    style={{
                      fontSize: "11px",
                      color: c.amber,
                      fontFamily: MONO,
                      fontWeight: 500,
                    }}
                  >
                    <Clock size={11} /> Processing
                  </span>
                ) : (
                  <span
                    className="flex items-center gap-1"
                    style={{
                      fontSize: "11px",
                      color: c.emerald,
                      fontFamily: MONO,
                      fontWeight: 500,
                    }}
                  >
                    <CheckCircle size={11} /> Queued
                  </span>
                )}

                <button
                  onClick={() =>
                    setUploaded((prev) => prev.filter((_, index) => index !== i))
                  }
                  style={{ color: c.textDim }}
                  className="hover:text-red-400 transition-colors"
                >
                  <XCircle size={14} />
                </button>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}