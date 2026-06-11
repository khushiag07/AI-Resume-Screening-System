import React, { useEffect, useRef, useState } from "react";
import {
  Bell,
  Shield,
  User,
  Palette,
  Database,
  Save,
  Eye,
  Lock,
  Mail,
  Briefcase,
  CheckCircle,
  Camera,
  Trash2,
} from "lucide-react";

import { c, FONT } from "../../styles/theme";
import { supabase } from "../../lib/supabase";

type UserData = {
  id: string;
  email: string;
  fullName: string;
  avatarUrl: string;
};

export default function SettingsPage() {
  const fileRef = useRef<HTMLInputElement | null>(null);

  const [userData, setUserData] = useState<UserData>({
    id: "",
    email: "",
    fullName: "",
    avatarUrl: "",
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [saved, setSaved] = useState(false);

  const [emailAlerts, setEmailAlerts] = useState(true);
  const [resumeUploadAlerts, setResumeUploadAlerts] = useState(true);
  const [weeklyReports, setWeeklyReports] = useState(false);
  const [darkMode, setDarkMode] = useState(true);
  const [autoShortlist, setAutoShortlist] = useState(true);
  const [showBiasFlags, setShowBiasFlags] = useState(true);
  const [anonymizeCandidates, setAnonymizeCandidates] = useState(false);
  const [saveScreeningHistory, setSaveScreeningHistory] = useState(true);
  const [minScore, setMinScore] = useState(70);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    setLoading(true);

    const { data, error } = await supabase.auth.getUser();

    if (error || !data.user) {
      setLoading(false);
      return;
    }

    setUserData({
      id: data.user.id,
      email: data.user.email || "",
      fullName:
        data.user.user_metadata?.full_name ||
        data.user.user_metadata?.name ||
        "Recruiter",
      avatarUrl: data.user.user_metadata?.avatar_url || "",
    });

    setLoading(false);
  };

  const handleSaveProfile = async () => {
    if (!userData.id) return;

    setSaving(true);

    const { error } = await supabase.auth.updateUser({
      data: {
        full_name: userData.fullName,
        avatar_url: userData.avatarUrl,
      },
    });

    setSaving(false);

    if (error) {
      alert(error.message);
      return;
    }

    setSaved(true);
    setTimeout(() => setSaved(false), 2200);
  };

  const handleImageUpload = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];

    if (!file || !userData.id) return;

    if (!file.type.startsWith("image/")) {
      alert("Please upload an image file.");
      return;
    }

    const fileExt = file.name.split(".").pop();
    const fileName = `${userData.id}-${Date.now()}.${fileExt}`;
    const filePath = `avatars/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from("profiles")
      .upload(filePath, file, {
        upsert: true,
      });

    if (uploadError) {
      alert(uploadError.message);
      return;
    }

    const { data } = supabase.storage
      .from("profiles")
      .getPublicUrl(filePath);

    const avatarUrl = data.publicUrl;

    setUserData((prev) => ({
      ...prev,
      avatarUrl,
    }));

    const { error: updateError } = await supabase.auth.updateUser({
      data: {
        full_name: userData.fullName,
        avatar_url: avatarUrl,
      },
    });

    if (updateError) {
      alert(updateError.message);
      return;
    }

    setSaved(true);
    setTimeout(() => setSaved(false), 2200);
  };

  const removeImage = async () => {
    setUserData((prev) => ({
      ...prev,
      avatarUrl: "",
    }));

    const { error } = await supabase.auth.updateUser({
      data: {
        full_name: userData.fullName,
        avatar_url: "",
      },
    });

    if (error) {
      alert(error.message);
      return;
    }

    if (fileRef.current) fileRef.current.value = "";

    setSaved(true);
    setTimeout(() => setSaved(false), 2200);
  };

  const initials =
    userData.fullName
      .split(" ")
      .map((n) => n[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "U";

  if (loading) {
    return (
      <main
        className="min-h-screen flex items-center justify-center"
        style={{
          background: c.bg,
          color: c.text,
          fontFamily: FONT,
        }}
      >
        Loading settings...
      </main>
    );
  }

  return (
    <main
      className="min-h-screen px-8 py-7"
      style={{
        background: c.bg,
        color: c.text,
        fontFamily: FONT,
      }}
    >
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <p
              className="text-[10px] font-bold tracking-[0.22em] uppercase"
              style={{ color: c.amber }}
            >
              Account Settings
            </p>

            <h1 className="text-2xl font-bold mt-2 tracking-tight">
              Manage your workspace
            </h1>

            <p className="text-sm mt-1" style={{ color: c.textDim }}>
              Your name, email and profile photo are connected to your login
              account.
            </p>
          </div>

          <button
            onClick={handleSaveProfile}
            disabled={saving}
            className="h-10 px-4 rounded-xl flex items-center gap-2 text-sm font-semibold disabled:opacity-60"
            style={{
              background: c.amber,
              color: "#111827",
            }}
          >
            <Save size={16} />
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>

        {saved && (
          <div
            className="rounded-2xl px-4 py-3 flex items-center gap-3 border text-sm"
            style={{
              background: "rgba(34,197,94,0.12)",
              borderColor: "rgba(34,197,94,0.3)",
              color: c.emerald,
            }}
          >
            <CheckCircle size={18} />
            Profile updated successfully.
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <section
            className="rounded-3xl p-5 border"
            style={{
              background: c.surface,
              borderColor: c.border,
            }}
          >
            <div className="text-center">
              <div
                className="w-24 h-24 mx-auto rounded-full overflow-hidden flex items-center justify-center text-2xl font-bold"
                style={{
                  background: c.amberDim,
                  color: c.amber,
                  boxShadow: `0 0 28px ${c.amberGlow}`,
                }}
              >
                {userData.avatarUrl ? (
                  <img
                    src={userData.avatarUrl}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  initials
                )}
              </div>

              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />

              <div className="flex justify-center gap-2 mt-4">
                <button
                  onClick={() => fileRef.current?.click()}
                  className="px-3 py-2 rounded-xl text-xs flex items-center gap-2"
                  style={{
                    background: c.amber,
                    color: "#111827",
                  }}
                >
                  <Camera size={14} />
                  Upload DP
                </button>

                {userData.avatarUrl && (
                  <button
                    onClick={removeImage}
                    className="px-3 py-2 rounded-xl text-xs flex items-center gap-2 border"
                    style={{
                      background: c.bg,
                      color: c.textMid,
                      borderColor: c.border,
                    }}
                  >
                    <Trash2 size={14} />
                    Remove
                  </button>
                )}
              </div>

              <h2 className="text-lg font-bold mt-4">{userData.fullName}</h2>

              <p className="text-xs mt-1" style={{ color: c.textDim }}>
                Recruiter
              </p>
            </div>

            <div className="mt-6 space-y-3">
              <InfoBox
                icon={<Briefcase size={16} />}
                label="Role"
                value="Recruiter"
              />

              <InfoBox
                icon={<Mail size={16} />}
                label="Email"
                value={userData.email}
              />

              <InfoBox
                icon={<Lock size={16} />}
                label="Account"
                value="Logged In"
              />
            </div>
          </section>

          <div className="lg:col-span-2 space-y-5">
            <Card
              icon={<User size={20} />}
              title="Profile Information"
              description="This information comes from your logged-in account."
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InputBox
                  label="Full Name"
                  value={userData.fullName}
                  onChange={(v) =>
                    setUserData((prev) => ({
                      ...prev,
                      fullName: v,
                    }))
                  }
                />

                <InputBox
                  label="Email"
                  value={userData.email}
                  disabled
                  onChange={() => {}}
                />
              </div>
            </Card>

            <Card
              icon={<Bell size={20} />}
              title="Notifications"
              description="Control alerts and reports for this account."
            >
              <ToggleRow
                title="Email Alerts"
                description="Receive important hiring updates."
                checked={emailAlerts}
                onChange={setEmailAlerts}
              />

              <ToggleRow
                title="Resume Upload Alerts"
                description="Notify when candidates upload resumes."
                checked={resumeUploadAlerts}
                onChange={setResumeUploadAlerts}
              />

              <ToggleRow
                title="Weekly Reports"
                description="Receive weekly screening analytics."
                checked={weeklyReports}
                onChange={setWeeklyReports}
              />
            </Card>

            <Card
              icon={<Shield size={20} />}
              title="AI Screening & Privacy"
              description="Manage AI candidate screening rules."
            >
              <ToggleRow
                title="Auto Shortlist"
                description="Automatically shortlist strong candidates."
                checked={autoShortlist}
                onChange={setAutoShortlist}
              />

              <ToggleRow
                title="Show Bias Flags"
                description="Highlight possible biased screening signals."
                checked={showBiasFlags}
                onChange={setShowBiasFlags}
              />

              <ToggleRow
                title="Anonymize Candidates"
                description="Hide personal details while reviewing resumes."
                checked={anonymizeCandidates}
                onChange={setAnonymizeCandidates}
              />

              <ToggleRow
                title="Save Screening History"
                description="Keep screening results for analytics."
                checked={saveScreeningHistory}
                onChange={setSaveScreeningHistory}
              />

              <div className="pt-4">
                <div className="flex justify-between items-center mb-3">
                  <div>
                    <h4 className="text-sm font-semibold">
                      Minimum Shortlist Score
                    </h4>

                    <p className="text-xs mt-1" style={{ color: c.textDim }}>
                      Candidates above this score can be shortlisted.
                    </p>
                  </div>

                  <span
                    className="px-3 py-1 rounded-full text-sm font-bold"
                    style={{
                      background: c.amberDim,
                      color: c.amber,
                    }}
                  >
                    {minScore}%
                  </span>
                </div>

                <input
                  type="range"
                  min="0"
                  max="100"
                  value={minScore}
                  onChange={(e) => setMinScore(Number(e.target.value))}
                  className="w-full accent-yellow-400"
                />
              </div>
            </Card>

            <Card
              icon={<Palette size={20} />}
              title="Appearance"
              description="Control dashboard display preference."
            >
              <ToggleRow
                title="Dark Mode"
                description="Use dark professional dashboard theme."
                checked={darkMode}
                onChange={setDarkMode}
              />
            </Card>

            <Card
              icon={<Database size={20} />}
              title="Data Management"
              description="Account-based profile data using Supabase Auth."
            >
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <MiniFeature
                  icon={<Eye size={18} />}
                  title="Profile Sync"
                  text="Name and DP come from login account."
                />

                <MiniFeature
                  icon={<Lock size={18} />}
                  title="Auth Based"
                  text="Each user sees their own profile."
                />

                <MiniFeature
                  icon={<Database size={18} />}
                  title="Supabase Storage"
                  text="DP image is saved in bucket."
                />
              </div>
            </Card>
          </div>
        </div>
      </div>
    </main>
  );
}

function Card({
  icon,
  title,
  description,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <section
      className="rounded-3xl p-5 border"
      style={{
        background: c.surface,
        borderColor: c.border,
      }}
    >
      <div className="flex gap-3 mb-5">
        <div
          className="w-11 h-11 rounded-2xl flex items-center justify-center"
          style={{
            background: c.amberDim,
            color: c.amber,
          }}
        >
          {icon}
        </div>

        <div>
          <h3 className="text-base font-bold">{title}</h3>

          <p className="text-xs mt-1" style={{ color: c.textDim }}>
            {description}
          </p>
        </div>
      </div>

      <div className="space-y-4">{children}</div>
    </section>
  );
}

function InputBox({
  label,
  value,
  onChange,
  disabled = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}) {
  return (
    <label className="block">
      <span className="text-xs font-medium" style={{ color: c.textDim }}>
        {label}
      </span>

      <input
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
        className="w-full mt-2 px-3 py-2 rounded-xl border outline-none text-sm disabled:opacity-60"
        style={{
          background: c.bg,
          borderColor: c.border,
          color: c.text,
          fontFamily: FONT,
        }}
      />
    </label>
  );
}

function ToggleRow({
  title,
  description,
  checked,
  onChange,
}: {
  title: string;
  description: string;
  checked: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <div
      className="flex justify-between items-center gap-4 border-b pb-4 last:border-b-0 last:pb-0"
      style={{ borderColor: c.border }}
    >
      <div>
        <h4 className="text-sm font-semibold">{title}</h4>

        <p className="text-xs mt-1" style={{ color: c.textDim }}>
          {description}
        </p>
      </div>

      <button
        type="button"
        onClick={() => onChange(!checked)}
        className="w-12 h-7 rounded-full p-1 flex transition shrink-0"
        style={{
          background: checked ? c.amber : c.borderStrong,
          justifyContent: checked ? "flex-end" : "flex-start",
        }}
      >
        <span
          className="w-5 h-5 rounded-full"
          style={{
            background: checked ? "#111827" : c.textDim,
          }}
        />
      </button>
    </div>
  );
}

function InfoBox({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div
      className="rounded-2xl p-3 flex gap-3 items-center"
      style={{ background: c.bg }}
    >
      <div style={{ color: c.amber }}>{icon}</div>

      <div className="min-w-0">
        <p className="text-[11px]" style={{ color: c.textDim }}>
          {label}
        </p>

        <p className="text-xs font-semibold truncate">{value}</p>
      </div>
    </div>
  );
}

function MiniFeature({
  icon,
  title,
  text,
}: {
  icon: React.ReactNode;
  title: string;
  text: string;
}) {
  return (
    <div
      className="rounded-2xl p-4 border"
      style={{
        background: c.bg,
        borderColor: c.border,
      }}
    >
      <div style={{ color: c.amber }}>{icon}</div>

      <h4 className="text-sm font-bold mt-3">{title}</h4>

      <p className="text-xs mt-1" style={{ color: c.textDim }}>
        {text}
      </p>
    </div>
  );
}