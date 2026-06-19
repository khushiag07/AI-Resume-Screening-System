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

type ThemeColors = {
  bg: string;
  surface: string;
  surfaceSoft: string;
  text: string;
  textDim: string;
  textMid: string;
  border: string;
  borderStrong: string;
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

const [darkMode, setDarkMode] = useState(() => {

  const savedTheme =
  localStorage.getItem(
    "resumeai-theme"
  );


  if(!savedTheme){
    localStorage.setItem(
      "resumeai-theme",
      "dark"
    );

    document.documentElement.classList.add(
      "dark"
    );

    return true;
  }


  return savedTheme === "dark";

});

  const [autoShortlist, setAutoShortlist] = useState(true);
  const [showBiasFlags, setShowBiasFlags] = useState(true);
  const [anonymizeCandidates, setAnonymizeCandidates] = useState(false);
  const [saveScreeningHistory, setSaveScreeningHistory] = useState(true);
  const [minScore, setMinScore] = useState(70);

  const theme: ThemeColors = darkMode
    ? {
        bg: c.bg,
        surface: c.surface,
        surfaceSoft: c.bg,
        text: c.text,
        textDim: c.textDim,
        textMid: c.textMid,
        border: c.border,
        borderStrong: c.borderStrong,
      }
    : {
        bg: "#F8FAFC",
        surface: "#FFFFFF",
        surfaceSoft: "#F1F5F9",
        text: "#0F172A",
        textDim: "#64748B",
        textMid: "#334155",
        border: "rgba(15,23,42,0.12)",
        borderStrong: "rgba(15,23,42,0.22)",
      };

  useEffect(() => {
    loadUser();
  }, []);
useEffect(() => {
  if (darkMode) {
    document.documentElement.classList.add("dark");

    localStorage.setItem(
      "resumeai-theme",
      "dark"
    );
  } else {
    document.documentElement.classList.remove("dark");

    localStorage.setItem(
      "resumeai-theme",
      "light"
    );
  }
}, [darkMode]);

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

    await supabase.auth.refreshSession();
    await loadUser();

    setSaved(true);
    setTimeout(() => setSaved(false), 2200);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
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

    const { data } = supabase.storage.from("profiles").getPublicUrl(filePath);

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

    await supabase.auth.refreshSession();
    await loadUser();

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

    await supabase.auth.refreshSession();
    await loadUser();

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
        className="flex min-h-screen items-center justify-center"
        style={{
          background: theme.bg,
          color: theme.text,
          fontFamily: FONT,
        }}
      >
        Loading settings...
      </main>
    );
  }

  return (
    <main
      className="min-h-screen px-4 py-5 pb-24 sm:px-6 lg:px-8 lg:py-7 lg:pb-8"
      style={{
        background: theme.bg,
        color: theme.text,
        fontFamily: FONT,
      }}
    >
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p
              className="text-[10px] font-bold uppercase tracking-[0.22em]"
              style={{ color: c.amber }}
            >
              Account Settings
            </p>

            <h1 className="mt-2 text-2xl font-bold tracking-tight">
              Manage your workspace
            </h1>

            <p className="mt-1 text-sm" style={{ color: theme.textDim }}>
              Your name, email and profile photo are connected to your login
              account.
            </p>
          </div>

          <button
            onClick={handleSaveProfile}
            disabled={saving}
            className="flex h-10 w-full items-center justify-center gap-2 rounded-xl px-4 text-sm font-semibold disabled:opacity-60 sm:w-auto"
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
            className="flex items-center gap-3 rounded-2xl border px-4 py-3 text-sm"
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

        <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
          <section
            className="rounded-3xl border p-5"
            style={{
              background: theme.surface,
              borderColor: theme.border,
            }}
          >
            <div className="text-center">
              <div
                className="mx-auto flex h-24 w-24 items-center justify-center overflow-hidden rounded-full text-2xl font-bold"
                style={{
                  background: c.amberDim,
                  color: c.amber,
                  boxShadow: `0 0 28px ${c.amberGlow}`,
                }}
              >
                {userData.avatarUrl ? (
                  <img
                    src={`${userData.avatarUrl}?v=${Date.now()}`}
                    alt="Profile"
                    className="h-full w-full object-cover"
                    onError={() =>
                      setUserData((prev) => ({
                        ...prev,
                        avatarUrl: "",
                      }))
                    }
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

              <div className="mt-4 flex justify-center gap-2">
                <button
                  onClick={() => fileRef.current?.click()}
                  className="flex items-center gap-2 rounded-xl px-3 py-2 text-xs"
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
                    className="flex items-center gap-2 rounded-xl border px-3 py-2 text-xs"
                    style={{
                      background: theme.surfaceSoft,
                      color: theme.textMid,
                      borderColor: theme.border,
                    }}
                  >
                    <Trash2 size={14} />
                    Remove
                  </button>
                )}
              </div>

              <h2 className="mt-4 text-lg font-bold">{userData.fullName}</h2>

              <p className="mt-1 text-xs" style={{ color: theme.textDim }}>
                Recruiter
              </p>
            </div>

            <div className="mt-6 space-y-3">
              <InfoBox
                icon={<Briefcase size={16} />}
                label="Role"
                value="Recruiter"
                theme={theme}
              />

              <InfoBox
                icon={<Mail size={16} />}
                label="Email"
                value={userData.email}
                theme={theme}
              />

              <InfoBox
                icon={<Lock size={16} />}
                label="Account"
                value="Logged In"
                theme={theme}
              />
            </div>
          </section>

          <div className="space-y-5 lg:col-span-2">
            <Card
              icon={<User size={20} />}
              title="Profile Information"
              description="This information comes from your logged-in account."
              theme={theme}
            >
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <InputBox
                  label="Full Name"
                  value={userData.fullName}
                  theme={theme}
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
                  theme={theme}
                  onChange={() => {}}
                />
              </div>
            </Card>

            <Card
              icon={<Bell size={20} />}
              title="Notifications"
              description="Control alerts and reports for this account."
              theme={theme}
            >
              <ToggleRow
                title="Email Alerts"
                description="Receive important hiring updates."
                checked={emailAlerts}
                onChange={setEmailAlerts}
                theme={theme}
              />

              <ToggleRow
                title="Resume Upload Alerts"
                description="Notify when candidates upload resumes."
                checked={resumeUploadAlerts}
                onChange={setResumeUploadAlerts}
                theme={theme}
              />

              <ToggleRow
                title="Weekly Reports"
                description="Receive weekly screening analytics."
                checked={weeklyReports}
                onChange={setWeeklyReports}
                theme={theme}
              />
            </Card>

            <Card
              icon={<Shield size={20} />}
              title="AI Screening & Privacy"
              description="Manage AI candidate screening rules."
              theme={theme}
            >
              <ToggleRow
                title="Auto Shortlist"
                description="Automatically shortlist strong candidates."
                checked={autoShortlist}
                onChange={setAutoShortlist}
                theme={theme}
              />

              <ToggleRow
                title="Show Bias Flags"
                description="Highlight possible biased screening signals."
                checked={showBiasFlags}
                onChange={setShowBiasFlags}
                theme={theme}
              />

              <ToggleRow
                title="Anonymize Candidates"
                description="Hide personal details while reviewing resumes."
                checked={anonymizeCandidates}
                onChange={setAnonymizeCandidates}
                theme={theme}
              />

              <ToggleRow
                title="Save Screening History"
                description="Keep screening results for analytics."
                checked={saveScreeningHistory}
                onChange={setSaveScreeningHistory}
                theme={theme}
              />

              <div className="pt-4">
                <div className="mb-3 flex items-center justify-between gap-3">
                  <div>
                    <h4 className="text-sm font-semibold">
                      Minimum Shortlist Score
                    </h4>

                    <p className="mt-1 text-xs" style={{ color: theme.textDim }}>
                      Candidates above this score can be shortlisted.
                    </p>
                  </div>

                  <span
                    className="rounded-full px-3 py-1 text-sm font-bold"
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
              theme={theme}
            >
              <ToggleRow
                title="Dark Mode"
                description={
                  darkMode
                    ? "Dark professional dashboard theme is active."
                    : "Light dashboard theme is active."
                }
                checked={darkMode}
                onChange={setDarkMode}
                theme={theme}
              />
            </Card>

            <Card
              icon={<Database size={20} />}
              title="Data Management"
              description="Account-based profile data using Supabase Auth."
              theme={theme}
            >
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <MiniFeature
                  icon={<Eye size={18} />}
                  title="Profile Sync"
                  text="Name and DP come from login account."
                  theme={theme}
                />

                <MiniFeature
                  icon={<Lock size={18} />}
                  title="Auth Based"
                  text="Each user sees their own profile."
                  theme={theme}
                />

                <MiniFeature
                  icon={<Database size={18} />}
                  title="Supabase Storage"
                  text="DP image is saved in bucket."
                  theme={theme}
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
  theme,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  children: React.ReactNode;
  theme: ThemeColors;
}) {
  return (
    <section
      className="rounded-3xl border p-5"
      style={{
        background: theme.surface,
        borderColor: theme.border,
        color: theme.text,
      }}
    >
      <div className="mb-5 flex gap-3">
        <div
          className="flex h-11 w-11 items-center justify-center rounded-2xl"
          style={{
            background: c.amberDim,
            color: c.amber,
          }}
        >
          {icon}
        </div>

        <div>
          <h3 className="text-base font-bold">{title}</h3>

          <p className="mt-1 text-xs" style={{ color: theme.textDim }}>
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
  theme,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  theme: ThemeColors;
}) {
  return (
    <label className="block">
      <span className="text-xs font-medium" style={{ color: theme.textDim }}>
        {label}
      </span>

      <input
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
        className="mt-2 w-full rounded-xl border px-3 py-2 text-sm outline-none disabled:opacity-60"
        style={{
          background: theme.surfaceSoft,
          borderColor: theme.border,
          color: theme.text,
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
  theme,
}: {
  title: string;
  description: string;
  checked: boolean;
  onChange: (value: boolean) => void;
  theme: ThemeColors;
}) {
  return (
    <div
      className="flex items-center justify-between gap-4 border-b pb-4 last:border-b-0 last:pb-0"
      style={{ borderColor: theme.border }}
    >
      <div>
        <h4 className="text-sm font-semibold">{title}</h4>

        <p className="mt-1 text-xs" style={{ color: theme.textDim }}>
          {description}
        </p>
      </div>

      <button
        type="button"
        onClick={() => onChange(!checked)}
        className="flex h-7 w-12 shrink-0 rounded-full p-1 transition"
        style={{
          background: checked ? c.amber : theme.borderStrong,
          justifyContent: checked ? "flex-end" : "flex-start",
        }}
      >
        <span
          className="h-5 w-5 rounded-full"
          style={{
            background: checked ? "#111827" : theme.textDim,
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
  theme,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  theme: ThemeColors;
}) {
  return (
    <div
      className="flex items-center gap-3 rounded-2xl p-3"
      style={{ background: theme.surfaceSoft }}
    >
      <div style={{ color: c.amber }}>{icon}</div>

      <div className="min-w-0">
        <p className="text-[11px]" style={{ color: theme.textDim }}>
          {label}
        </p>

        <p className="truncate text-xs font-semibold">{value}</p>
      </div>
    </div>
  );
}

function MiniFeature({
  icon,
  title,
  text,
  theme,
}: {
  icon: React.ReactNode;
  title: string;
  text: string;
  theme: ThemeColors;
}) {
  return (
    <div
      className="rounded-2xl border p-4"
      style={{
        background: theme.surfaceSoft,
        borderColor: theme.border,
      }}
    >
      <div style={{ color: c.amber }}>{icon}</div>

      <h4 className="mt-3 text-sm font-bold">{title}</h4>

      <p className="mt-1 text-xs" style={{ color: theme.textDim }}>
        {text}
      </p>
    </div>
  );
}