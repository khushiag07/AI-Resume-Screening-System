import { useState, useRef, useEffect } from "react";
import {
  LayoutDashboard,
  Briefcase,
  Users,
  FileSearch,
  BarChart3,
  Settings,
  Search,
  Bell,
  ChevronDown,
  LogOut,
  CreditCard,
  UserCircle,
  X,
  Zap,
} from "lucide-react";

const FONT = "'Plus Jakarta Sans', sans-serif";

type NavItem = {
  id: string;
  label: string;
  icon: React.ReactNode;
  highlight?: boolean;
};

const navItems: NavItem[] = [
  { id: "dashboard", label: "Dashboard", icon: <LayoutDashboard size={14} /> },
  { id: "jobs", label: "Jobs", icon: <Briefcase size={14} /> },
  { id: "candidates", label: "Candidates", icon: <Users size={14} /> },
  { id: "screening", label: "Screening", icon: <FileSearch size={14} />, highlight: true },
  { id: "analytics", label: "Analytics", icon: <BarChart3 size={14} /> },
  { id: "settings", label: "Settings", icon: <Settings size={14} /> },
];

const notifications = [
  { id: 1, text: "New application from Sarah Chen — Senior Engineer", time: "2m ago", unread: true },
  { id: 2, text: "Resume screening complete for Job #2841", time: "14m ago", unread: true },
  { id: 3, text: "3 candidates moved to final round", time: "1h ago", unread: true },
  { id: 4, text: "Interview scheduled: Marcus Lee @ 3:00 PM", time: "2h ago", unread: false },
];

type NavbarProps = {
  activePage: string;
  onNavigate: (page: string) => void;
};

export function Navbar({ activePage, onNavigate }: NavbarProps) {
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [notifOpen, setNotifOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(3);

  const notifRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setNotifOpen(false);
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) setProfileOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (searchOpen) searchRef.current?.focus();
  }, [searchOpen]);

  function handleNotifOpen() {
    setNotifOpen((v) => !v);
    setProfileOpen(false);
    if (!notifOpen) setUnreadCount(0);
  }

  function handleProfileOpen() {
    setProfileOpen((v) => !v);
    setNotifOpen(false);
  }

  return (
    <nav
      style={{ fontFamily: FONT }}
      className="fixed top-0 left-0 right-0 z-50 h-16"
    >
      {/* Glass bar */}
      <div
        className="h-full flex items-center px-6 gap-0"
        style={{
          background: "rgba(7, 11, 19, 0.92)",
          backdropFilter: "blur(16px)",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
          boxShadow: "0 1px 24px rgba(0,0,0,0.5)",
        }}
      >
        {/* Logo */}
        <button
          onClick={() => onNavigate("dashboard")}
          className="flex items-center gap-2.5 min-w-[200px] mr-2 group"
          aria-label="Go to dashboard"
        >
          <div
            className="flex items-center justify-center w-8 h-8 rounded-lg shrink-0"
            style={{ background: "linear-gradient(135deg, #F59E0B 0%, #D97706 100%)", boxShadow: "0 0 12px rgba(245,158,11,0.35)" }}
          >
            <Zap size={15} className="text-[#070B13]" strokeWidth={2.5} />
          </div>
          <span
            style={{ fontSize: "17px", fontWeight: 700, letterSpacing: "-0.4px", color: "#F1F5F9" }}
          >
            Resume<span style={{ color: "#F59E0B" }}>AI</span>
          </span>
        </button>

        {/* Separator */}
        <div className="h-5 w-px mx-4 shrink-0" style={{ background: "rgba(255,255,255,0.08)" }} />

        {/* Nav Items */}
        <div className="flex items-center gap-0.5 flex-1">
          {navItems.map((item) => {
            const isActive = activePage === item.id;
            if (item.highlight) {
              return (
                <button
                  key={item.id}
                  onClick={() => onNavigate(item.id)}
                  className="relative flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-sm transition-all duration-150"
                  style={{
                    fontWeight: 600,
                    background: isActive
                      ? "linear-gradient(135deg, #F59E0B 0%, #D97706 100%)"
                      : "rgba(245,158,11,0.1)",
                    color: isActive ? "#070B13" : "#F59E0B",
                    border: isActive ? "none" : "1px solid rgba(245,158,11,0.2)",
                    boxShadow: isActive ? "0 0 16px rgba(245,158,11,0.3)" : "none",
                  }}
                >
                  {item.icon}
                  {item.label}
                  {!isActive && (
                    <span
                      className="ml-0.5 px-1 py-0.5 rounded"
                      style={{ fontSize: "9px", fontWeight: 700, letterSpacing: "0.05em", background: "#F59E0B", color: "#070B13", lineHeight: 1 }}
                    >
                      AI
                    </span>
                  )}
                </button>
              );
            }
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className="relative flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm transition-all duration-150"
                style={{
                  fontWeight: isActive ? 600 : 400,
                  color: isActive ? "#F1F5F9" : "#64748B",
                  background: isActive ? "rgba(255,255,255,0.05)" : "transparent",
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    (e.currentTarget as HTMLElement).style.color = "#94A3B8";
                    (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.04)";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    (e.currentTarget as HTMLElement).style.color = "#64748B";
                    (e.currentTarget as HTMLElement).style.background = "transparent";
                  }
                }}
              >
                {item.icon}
                {item.label}
                {isActive && (
                  <span
                    className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-0.5 rounded-full"
                    style={{ background: "#F59E0B" }}
                  />
                )}
              </button>
            );
          })}
        </div>

        {/* Right side */}
        <div className="flex items-center gap-1.5 ml-4">
          {/* Search */}
          <div className="relative flex items-center">
            {searchOpen ? (
              <div
                className="flex items-center gap-2 rounded-lg px-3 py-1.5 w-52 transition-all"
                style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(245,158,11,0.3)" }}
              >
                <Search size={13} style={{ color: "#F59E0B" }} className="shrink-0" />
                <input
                  ref={searchRef}
                  value={searchValue}
                  onChange={(e) => setSearchValue(e.target.value)}
                  placeholder="Search candidates…"
                  className="bg-transparent outline-none text-sm w-full"
                  style={{ fontFamily: FONT, color: "#E8EDF5" }}
                />
                <button
                  onClick={() => { setSearchOpen(false); setSearchValue(""); }}
                  style={{ color: "#475569" }}
                  className="hover:text-slate-300 transition-colors"
                >
                  <X size={13} />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setSearchOpen(true)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-all duration-150"
                style={{ color: "#475569", fontWeight: 400 }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = "#94A3B8"; (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.04)"; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = "#475569"; (e.currentTarget as HTMLElement).style.background = "transparent"; }}
                aria-label="Open search"
              >
                <Search size={15} />
                <span className="hidden sm:block">Search</span>
              </button>
            )}
          </div>

          {/* Notifications */}
          <div ref={notifRef} className="relative">
            <button
              onClick={handleNotifOpen}
              className="relative p-2 rounded-lg transition-all duration-150"
              style={{
                color: notifOpen ? "#F59E0B" : "#475569",
                background: notifOpen ? "rgba(245,158,11,0.1)" : "transparent",
              }}
              onMouseEnter={(e) => { if (!notifOpen) { (e.currentTarget as HTMLElement).style.color = "#94A3B8"; (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.04)"; } }}
              onMouseLeave={(e) => { if (!notifOpen) { (e.currentTarget as HTMLElement).style.color = "#475569"; (e.currentTarget as HTMLElement).style.background = "transparent"; } }}
              aria-label="Notifications"
            >
              <Bell size={17} />
              {unreadCount > 0 && (
                <span
                  className="absolute top-1 right-1 flex items-center justify-center w-4 h-4 rounded-full"
                  style={{ fontSize: "9px", fontWeight: 700, background: "#F59E0B", color: "#070B13", lineHeight: 1 }}
                >
                  {unreadCount}
                </span>
              )}
            </button>

            {notifOpen && (
              <div
                className="absolute right-0 top-full mt-2 w-80 rounded-xl overflow-hidden z-50"
                style={{ background: "#0D1220", border: "1px solid rgba(255,255,255,0.08)", boxShadow: "0 8px 40px rgba(0,0,0,0.6)" }}
              >
                <div className="flex items-center justify-between px-4 py-3" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                  <span className="text-sm" style={{ fontWeight: 600, color: "#E8EDF5" }}>Notifications</span>
                  <span className="text-xs cursor-pointer hover:underline" style={{ color: "#F59E0B", fontWeight: 500 }}>Mark all read</span>
                </div>
                <div className="max-h-72 overflow-y-auto">
                  {notifications.map((n) => (
                    <div
                      key={n.id}
                      className="flex gap-3 px-4 py-3 cursor-pointer transition-colors"
                      style={{
                        borderBottom: "1px solid rgba(255,255,255,0.04)",
                        background: n.unread ? "rgba(245,158,11,0.04)" : "transparent",
                      }}
                      onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.04)"; }}
                      onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = n.unread ? "rgba(245,158,11,0.04)" : "transparent"; }}
                    >
                      <div className="mt-1.5 w-1.5 h-1.5 rounded-full shrink-0" style={{ background: n.unread ? "#F59E0B" : "transparent" }} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm leading-snug" style={{ fontWeight: n.unread ? 500 : 400, color: n.unread ? "#CBD5E1" : "#475569" }}>{n.text}</p>
                        <p className="text-xs mt-0.5" style={{ color: "#334155", fontFamily: "'DM Mono', monospace" }}>{n.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="px-4 py-2.5 text-center" style={{ background: "rgba(0,0,0,0.2)", borderTop: "1px solid rgba(255,255,255,0.04)" }}>
                  <span className="text-xs cursor-pointer hover:underline" style={{ color: "#F59E0B", fontWeight: 500 }}>View all notifications</span>
                </div>
              </div>
            )}
          </div>

          {/* Profile */}
          <div ref={profileRef} className="relative">
            <button
              onClick={handleProfileOpen}
              className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-lg transition-all duration-150"
              style={{ background: profileOpen ? "rgba(255,255,255,0.05)" : "transparent" }}
              onMouseEnter={(e) => { if (!profileOpen) (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.04)"; }}
              onMouseLeave={(e) => { if (!profileOpen) (e.currentTarget as HTMLElement).style.background = "transparent"; }}
            >
              <div
                className="w-7 h-7 rounded-full flex items-center justify-center shrink-0"
                style={{ background: "linear-gradient(135deg, #F59E0B 0%, #D97706 100%)", fontSize: "11px", fontWeight: 700, color: "#070B13" }}
              >
                AK
              </div>
              <div className="hidden sm:flex flex-col items-start">
                <span className="text-xs leading-none" style={{ fontWeight: 600, color: "#CBD5E1" }}>Alex Kim</span>
                <span className="text-xs leading-none mt-0.5" style={{ color: "#475569" }}>Admin</span>
              </div>
              <ChevronDown
                size={12}
                className="transition-transform duration-200"
                style={{ color: "#475569", transform: profileOpen ? "rotate(180deg)" : "rotate(0)" }}
              />
            </button>

            {profileOpen && (
              <div
                className="absolute right-0 top-full mt-2 w-52 rounded-xl overflow-hidden z-50"
                style={{ background: "#0D1220", border: "1px solid rgba(255,255,255,0.08)", boxShadow: "0 8px 40px rgba(0,0,0,0.6)" }}
              >
                <div className="px-4 py-3" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                  <p className="text-sm" style={{ fontWeight: 600, color: "#E8EDF5" }}>Alex Kim</p>
                  <p className="text-xs mt-0.5" style={{ color: "#475569" }}>alex.kim@company.com</p>
                </div>
                <div className="py-1">
                  {[
                    { icon: <UserCircle size={14} />, label: "Account" },
                    { icon: <CreditCard size={14} />, label: "Billing" },
                    { icon: <Settings size={14} />, label: "Settings" },
                  ].map((item) => (
                    <button
                      key={item.label}
                      className="w-full flex items-center gap-2.5 px-4 py-2 text-sm transition-colors"
                      style={{ fontWeight: 400, color: "#64748B" }}
                      onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = "#CBD5E1"; (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.04)"; }}
                      onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = "#64748B"; (e.currentTarget as HTMLElement).style.background = "transparent"; }}
                    >
                      <span style={{ color: "#334155" }}>{item.icon}</span>
                      {item.label}
                    </button>
                  ))}
                </div>
                <div className="py-1" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
                  <button
                    className="w-full flex items-center gap-2.5 px-4 py-2 text-sm transition-colors"
                    style={{ fontWeight: 400, color: "#EF4444" }}
                    onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "rgba(239,68,68,0.07)"; }}
                    onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "transparent"; }}
                  >
                    <LogOut size={14} />
                    Log out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
