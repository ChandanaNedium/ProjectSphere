"use client"

import { useState, useEffect } from "react";
import {
  CheckCircle,
  XCircle,
  Clock,
  MessageSquare,
  User,
  BookOpen,
  Filter,
} from "lucide-react";
import Sidebar from "@/components/Sidebar";
import {
  SAMPLE_PROJECTS,
  getUploadedProjects,
  type Project,
} from "@/lib/projects";

type ReviewStatus = "pending" | "approved" | "rejected";

interface Submission extends Project {
  reviewStatus: ReviewStatus;
  reviewComment?: string;
}

const DOMAIN_COLORS: Record<string, string> = {
  "AI & ML": "#60a5fa",
  Blockchain: "#c084fc",
  IoT: "#34d399",
  "Data Science": "#fbbf24",
  Cybersecurity: "#f87171",
  Mobile: "#2dd4bf",
  Healthcare: "#fb923c",
  Education: "#a78bfa",
  "Web Development": "#38bdf8",
};

const REVIEW_KEY = "ps_review_statuses";

function loadReviews(): Record<
  string,
  { status: ReviewStatus; comment: string }
> {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(localStorage.getItem(REVIEW_KEY) || "{}");
  } catch {
    return {};
  }
}
function saveReview(id: string, status: ReviewStatus, comment: string) {
  const all = loadReviews()
  all[id] = { status, comment }
  localStorage.setItem(REVIEW_KEY, JSON.stringify(all))
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("storage"))
  }
}

export default function ReviewSubmissionsPage() {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [filter, setFilter] = useState<ReviewStatus | "all">("all");
  const [selected, setSelected] = useState<Submission | null>(null);
  const [comment, setComment] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const reviews = loadReviews();
    const all = [...getUploadedProjects(), ...SAMPLE_PROJECTS];
    const subs: Submission[] = all.map((p) => ({
      ...p,
      reviewStatus: reviews[p.id]?.status ?? "pending",
      reviewComment: reviews[p.id]?.comment ?? "",
    }));
    setSubmissions(subs);
  }, []);

  const counts = {
    all: submissions.length,
    pending: submissions.filter((s) => s.reviewStatus === "pending").length,
    approved: submissions.filter((s) => s.reviewStatus === "approved").length,
    rejected: submissions.filter((s) => s.reviewStatus === "rejected").length,
  };

  const visible =
    filter === "all"
      ? submissions
      : submissions.filter((s) => s.reviewStatus === filter);

  function handleAction(status: ReviewStatus) {
    if (!selected) return;
    setSaving(true);
    saveReview(selected.id, status, comment);
    setSubmissions((prev) =>
      prev.map((s) =>
        s.id === selected.id
          ? { ...s, reviewStatus: status, reviewComment: comment }
          : s,
      ),
    );
    setTimeout(() => {
      setSaving(false);
      setSelected(null);
      setComment("");
    }, 500);
  }

  const statusStyle = (s: ReviewStatus) => {
    const map = {
      pending: {
        bg: "rgba(251,191,36,0.12)",
        color: "#fbbf24",
        label: "Pending",
      },
      approved: {
        bg: "rgba(52,211,153,0.12)",
        color: "#34d399",
        label: "Approved",
      },
      rejected: {
        bg: "rgba(248,113,113,0.12)",
        color: "#f87171",
        label: "Rejected",
      },
    };
    return map[s];
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "hsl(222,47%,6%)",
        color: "hsl(210,40%,96%)",
        fontFamily: "Inter,system-ui,sans-serif",
        display: "flex",
      }}
    >
      <Sidebar />
      <main
        style={{ flex: 1, padding: "32px", overflowY: "auto", minWidth: 0 }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 14,
            marginBottom: 8,
          }}
        >
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: 12,
              background: "rgba(52,211,153,0.12)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <CheckCircle style={{ width: 22, height: 22, color: "#34d399" }} />
          </div>
          <h1
            style={{ fontSize: 26, fontWeight: 800, letterSpacing: "-0.5px" }}
          >
            Review Submissions
          </h1>
        </div>
        <p
          style={{
            color: "rgba(255,255,255,0.45)",
            fontSize: 14,
            marginBottom: 28,
          }}
        >
          Review, approve, or reject student project submissions with feedback.
        </p>

        {/* Stats row */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4,1fr)",
            gap: 14,
            marginBottom: 28,
          }}
        >
          {(["all", "pending", "approved", "rejected"] as const).map((k) => {
            const cfg = {
              all: { c: "#60a5fa", label: "Total" },
              pending: { c: "#fbbf24", label: "Pending" },
              approved: { c: "#34d399", label: "Approved" },
              rejected: { c: "#f87171", label: "Rejected" },
            }[k];
            return (
              <button
                key={k}
                onClick={() => setFilter(k)}
                style={{
                  padding: "16px 20px",
                  borderRadius: 12,
                  border: `1px solid ${filter === k ? cfg.c + "55" : "rgba(255,255,255,0.07)"}`,
                  background:
                    filter === k ? `${cfg.c}12` : "rgba(255,255,255,0.03)",
                  cursor: "pointer",
                  textAlign: "left",
                }}
              >
                <div
                  style={{
                    fontSize: 24,
                    fontWeight: 800,
                    color: cfg.c,
                    marginBottom: 4,
                  }}
                >
                  {counts[k]}
                </div>
                <div style={{ fontSize: 12, color: "rgba(255,255,255,0.45)" }}>
                  {cfg.label}
                </div>
              </button>
            );
          })}
        </div>

        {/* Filter label */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            marginBottom: 16,
          }}
        >
          <Filter
            style={{ width: 14, height: 14, color: "rgba(255,255,255,0.35)" }}
          />
          <span style={{ fontSize: 13, color: "rgba(255,255,255,0.35)" }}>
            Showing:{" "}
            <b style={{ color: "rgba(255,255,255,0.7)" }}>
              {filter === "all"
                ? "All submissions"
                : filter.charAt(0).toUpperCase() + filter.slice(1)}
            </b>
          </span>
        </div>

        {/* Submission list */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {visible.map((sub) => {
            const st = statusStyle(sub.reviewStatus);
            return (
              <div
                key={sub.id}
                style={{
                  padding: "18px 20px",
                  borderRadius: 14,
                  background: "rgba(255,255,255,0.03)",
                  border: "1px solid rgba(255,255,255,0.07)",
                  display: "flex",
                  alignItems: "center",
                  gap: 18,
                  transition: "border-color 0.2s",
                }}
              >
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      fontWeight: 700,
                      fontSize: 15,
                      marginBottom: 4,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {sub.title}
                  </div>
                  <div
                    style={{
                      display: "flex",
                      gap: 12,
                      fontSize: 12,
                      color: "rgba(255,255,255,0.45)",
                    }}
                  >
                    <span
                      style={{ display: "flex", alignItems: "center", gap: 4 }}
                    >
                      <User style={{ width: 11, height: 11 }} />{" "}
                      {sub.students.join(", ")}
                    </span>
                    <span
                      style={{ display: "flex", alignItems: "center", gap: 4 }}
                    >
                      <BookOpen style={{ width: 11, height: 11 }} />{" "}
                      {sub.college}
                    </span>
                    <span
                      style={{
                        fontWeight: 700,
                        color: DOMAIN_COLORS[sub.domain] || "#60a5fa",
                      }}
                    >
                      {sub.domain}
                    </span>
                    {sub.github && (
                      <a
                        href={sub.github}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ color: "#93c5fd", textDecoration: "none" }}
                      >
                        GitHub repository
                      </a>
                    )}
                  </div>
                  {sub.reviewComment && (
                    <div
                      style={{
                        marginTop: 8,
                        fontSize: 12,
                        color: "rgba(255,255,255,0.35)",
                        display: "flex",
                        alignItems: "center",
                        gap: 5,
                      }}
                    >
                      <MessageSquare style={{ width: 11, height: 11 }} />{" "}
                      {sub.reviewComment}
                    </div>
                  )}
                </div>
                <span
                  style={{
                    padding: "5px 12px",
                    borderRadius: 6,
                    fontSize: 12,
                    fontWeight: 700,
                    background: st.bg,
                    color: st.color,
                    whiteSpace: "nowrap",
                  }}
                >
                  {st.label}
                </span>
                {sub.reviewStatus === "pending" && (
                  <button
                    onClick={() => {
                      setSelected(sub);
                      setComment("");
                    }}
                    style={{
                      padding: "8px 16px",
                      borderRadius: 8,
                      background: "rgba(59,130,246,0.12)",
                      border: "1px solid rgba(59,130,246,0.25)",
                      color: "#60a5fa",
                      fontSize: 13,
                      fontWeight: 600,
                      cursor: "pointer",
                    }}
                  >
                    Review
                  </button>
                )}
              </div>
            );
          })}
        </div>

        {/* Modal */}
        {selected && (
          <div
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(0,0,0,0.7)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 100,
              backdropFilter: "blur(4px)",
            }}
          >
            <div
              style={{
                background: "hsl(222,47%,9%)",
                border: "1px solid rgba(255,255,255,0.12)",
                borderRadius: 20,
                padding: "32px",
                width: "100%",
                maxWidth: 520,
                boxShadow: "0 24px 80px rgba(0,0,0,0.5)",
              }}
            >
              <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 6 }}>
                {selected.title}
              </h2>
              <p
                style={{
                  fontSize: 13,
                  color: "rgba(255,255,255,0.45)",
                  marginBottom: 20,
                }}
              >
                by {selected.students.join(", ")} · {selected.college}
              </p>
              <p
                style={{
                  fontSize: 14,
                  color: "rgba(255,255,255,0.6)",
                  marginBottom: 24,
                  lineHeight: 1.6,
                }}
              >
                {selected.description.slice(0, 200)}…
              </p>
              {selected.github && (
                <div
                  style={{
                    marginBottom: 20,
                    padding: "12px 14px",
                    borderRadius: 10,
                    background: "rgba(59,130,246,0.08)",
                    border: "1px solid rgba(59,130,246,0.18)",
                    fontSize: 13,
                  }}
                >
                  <a
                    href={selected.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: "#93c5fd" }}
                  >
                    Open GitHub repository
                  </a>
                  <span style={{ color: "rgba(255,255,255,0.45)" }}>
                    {" "}
                    to review the submitted implementation.
                  </span>
                </div>
              )}
              <label
                style={{
                  fontSize: 13,
                  fontWeight: 600,
                  color: "rgba(255,255,255,0.5)",
                  display: "block",
                  marginBottom: 8,
                }}
              >
                Feedback / Comment (optional)
              </label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Add your review notes here…"
                style={{
                  width: "100%",
                  minHeight: 90,
                  background: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(255,255,255,0.12)",
                  borderRadius: 10,
                  color: "white",
                  fontSize: 13,
                  padding: "12px",
                  resize: "vertical",
                  boxSizing: "border-box",
                }}
              />
              <div style={{ display: "flex", gap: 12, marginTop: 20 }}>
                <button
                  onClick={() => handleAction("approved")}
                  disabled={saving}
                  style={{
                    flex: 1,
                    padding: "12px",
                    borderRadius: 10,
                    background: "rgba(52,211,153,0.15)",
                    border: "1px solid rgba(52,211,153,0.3)",
                    color: "#34d399",
                    fontWeight: 700,
                    fontSize: 14,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 7,
                  }}
                >
                  <CheckCircle style={{ width: 16, height: 16 }} />{" "}
                  {saving ? "Saving…" : "Approve"}
                </button>
                <button
                  onClick={() => handleAction("rejected")}
                  disabled={saving}
                  style={{
                    flex: 1,
                    padding: "12px",
                    borderRadius: 10,
                    background: "rgba(248,113,113,0.12)",
                    border: "1px solid rgba(248,113,113,0.25)",
                    color: "#f87171",
                    fontWeight: 700,
                    fontSize: 14,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 7,
                  }}
                >
                  <XCircle style={{ width: 16, height: 16 }} />{" "}
                  {saving ? "Saving…" : "Reject"}
                </button>
                <button
                  onClick={() => {
                    setSelected(null);
                    setComment("");
                  }}
                  style={{
                    padding: "12px 20px",
                    borderRadius: 10,
                    background: "rgba(255,255,255,0.05)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    color: "rgba(255,255,255,0.5)",
                    fontWeight: 600,
                    fontSize: 14,
                    cursor: "pointer",
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
