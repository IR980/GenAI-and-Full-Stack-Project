import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router";
import { useAuth } from "../../auth/hooks/useAuth";
import Navbar from "../../../components/Navbar";
import {
  generateInterviewReport,
  getAllInterviewReports,
} from "../services/interview.api";

const MAX_FILE_SIZE = 5 * 1024 * 1024;

const FEATURES = [
  {
    icon: "📄",
    title: "Resume analysis",
    description: "Identify your strengths and relevant experience.",
  },
  {
    icon: "🎯",
    title: "Job match score",
    description: "Understand how closely your profile fits the role.",
  },
  {
    icon: "💡",
    title: "Interview questions",
    description: "Practice technical and behavioral questions.",
  },
  {
    icon: "🗺️",
    title: "Preparation roadmap",
    description: "Get a structured plan to prepare effectively.",
  },
];

const STEPS = [
  {
    number: "01",
    title: "Upload your resume",
    description: "Share your experience in PDF format.",
  },
  {
    number: "02",
    title: "Add your target role",
    description: "Provide the job description and your introduction.",
  },
  {
    number: "03",
    title: "Get your AI report",
    description: "Review your match score and preparation plan.",
  },
];

function formatDate(date) {
  if (!date) return "Date unavailable";

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return "Date unavailable";
  }

  return parsedDate.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function getScoreColor(score) {
  if (score >= 75) return "text-emerald-600";
  if (score >= 50) return "text-amber-600";
  return "text-rose-600";
}

function getReportTitle(report) {
  return (
    report.title ||
    report.jobTitle ||
    report.jobDescription?.split("\n")[0]?.slice(0, 65) ||
    "Interview preparation report"
  );
}

function FeatureCard({ icon, title, description }) {
  return (
    <div className="group rounded-2xl border border-slate-200 bg-white p-5 transition duration-300 hover:-translate-y-1 hover:border-indigo-200 hover:shadow-lg hover:shadow-indigo-100/50">
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-50 text-2xl transition group-hover:bg-indigo-100">
        {icon}
      </div>

      <h3 className="font-bold text-slate-900">{title}</h3>

      <p className="mt-2 text-sm leading-6 text-slate-500">{description}</p>
    </div>
  );
}

function Home() {
  const navigate = useNavigate();
  const { user, handleLogout } = useAuth();

  const fileInputRef = useRef(null);

  const [jobDescription, setJobDescription] = useState("");
  const [selfDescription, setSelfDescription] = useState("");
  const [resume, setResume] = useState(null);

  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const [reports, setReports] = useState([]);
  const [reportsLoading, setReportsLoading] = useState(true);
  const [reportsError, setReportsError] = useState("");

  const [dragging, setDragging] = useState(false);

  useEffect(() => {
    let active = true;

    async function loadReports() {
      setReportsLoading(true);
      setReportsError("");

      try {
        const response = await getAllInterviewReports();

        if (active) {
          setReports(response?.interviewReports || []);
        }
      } catch (err) {
        if (active) {
          setReportsError(
            err?.response?.data?.message ||
              "Could not load your previous reports.",
          );
        }
      } finally {
        if (active) {
          setReportsLoading(false);
        }
      }
    }

    loadReports();

    return () => {
      active = false;
    };
  }, []);

  const handleFile = (file) => {
    setError("");
    setSuccessMessage("");

    if (!file) return;

    const isPdf =
      file.type === "application/pdf" ||
      file.name.toLowerCase().endsWith(".pdf");

    if (!isPdf) {
      setResume(null);
      setError("Please select a resume in PDF format.");
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      setResume(null);
      setError("Your resume must be 5 MB or smaller.");
      return;
    }

    if (file.size === 0) {
      setResume(null);
      setError("The selected PDF is empty. Please choose another file.");
      return;
    }

    setResume(file);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setSuccessMessage("");

    if (!resume) {
      setError("Please upload your resume in PDF format.");
      return;
    }

    if (!jobDescription.trim()) {
      setError("Please enter the job description.");
      return;
    }

    if (!selfDescription.trim()) {
      setError("Please introduce yourself and describe your experience.");
      return;
    }

    setLoading(true);

    try {
      const response = await generateInterviewReport({
        jobDescription: jobDescription.trim(),
        selfDescription: selfDescription.trim(),
        resumeFile: resume,
      });

      const reportId = response?.interviewReport?._id;

      if (!reportId) {
        throw new Error(
          response?.message ||
            "The server did not return a valid interview report.",
        );
      }

      navigate(`/interview/${reportId}`);
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Could not generate your report. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleLogoutClick = async () => {
    try {
      await handleLogout();
      navigate("/login");
    } catch {
      setError("Could not log out. Please try again.");
    }
  };

  const clearForm = () => {
    setJobDescription("");
    setSelfDescription("");
    setResume(null);
    setError("");
    setSuccessMessage("");

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const openReport = (report) => {
    if (!report?._id) return;

    navigate(`/interview/${report._id}`);
  };

  const scrollToGenerator = () => {
    document.getElementById("generator")?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  return (
    <div className="min-h-screen bg-[#f7f8fc] text-slate-900">
      <Navbar user={user} onLogout={handleLogoutClick} />

      <main className="relative min-h-screen overflow-hidden">
        {/* Decorative background */}
        <div className="pointer-events-none fixed inset-0 overflow-hidden">
          <div className="absolute -top-40 left-1/4 h-96 w-96 rounded-full bg-indigo-200/30 blur-3xl" />
          <div className="absolute right-0 top-96 h-80 w-80 rounded-full bg-violet-200/25 blur-3xl" />
          <div className="absolute bottom-0 left-0 h-80 w-80 rounded-full bg-blue-100/30 blur-3xl" />
        </div>

        <div className="relative mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          {/* Hero */}
          <header
            id="home"
            className="mb-14 grid scroll-mt-28 items-center gap-10 lg:grid-cols-[1.3fr_0.7fr]"
          >
            <div>
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-indigo-100 bg-white px-4 py-2 text-xs font-bold uppercase tracking-wider text-indigo-700 shadow-sm">
                <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-500" />
                AI-powered career preparation
              </div>

              <h1 className="max-w-3xl text-4xl font-black leading-tight tracking-tight sm:text-5xl lg:text-6xl">
                Prepare for your next interview
                <span className="mt-1 block bg-linear-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">
                  with confidence.
                </span>
              </h1>

              <p className="mt-6 max-w-2xl text-base leading-8 text-slate-600 sm:text-lg">
                Turn your resume and target job description into a personalized
                interview strategy with AI-powered insights, relevant questions,
                and an actionable preparation roadmap.
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={scrollToGenerator}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-indigo-200 transition hover:-translate-y-0.5 hover:bg-indigo-700"
                >
                  Generate my report
                  <span aria-hidden="true">→</span>
                </button>

                <a
                  href="#reports"
                  className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-6 py-3.5 text-sm font-bold text-slate-700 transition hover:border-indigo-200 hover:bg-indigo-50"
                >
                  View previous reports
                </a>
              </div>

              <div className="mt-8 flex flex-wrap gap-3 text-sm text-slate-600">
                {["Resume analysis", "Match score", "Interview roadmap"].map(
                  (item) => (
                    <span
                      key={item}
                      className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-2"
                    >
                      <span className="font-bold text-emerald-600">✓</span>
                      {item}
                    </span>
                  ),
                )}
              </div>
            </div>

            {/* Hero illustration card */}
            <div className="hidden lg:block">
              <div className="relative mx-auto max-w-md rounded-3xl border border-white bg-white p-7 shadow-2xl shadow-indigo-100/70">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-widest text-slate-400">
                      Your preparation
                    </p>
                    <h2 className="mt-2 text-2xl font-extrabold">
                      One step ahead
                    </h2>
                  </div>

                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50 text-3xl">
                    ✦
                  </div>
                </div>

                <div className="mt-7 space-y-4">
                  {STEPS.map((step) => (
                    <div
                      key={step.number}
                      className="flex items-center gap-4 rounded-2xl bg-slate-50 p-4"
                    >
                      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-600 text-sm font-bold text-white">
                        {step.number}
                      </span>

                      <div>
                        <p className="font-bold text-slate-900">{step.title}</p>
                        <p className="mt-1 text-sm text-slate-500">
                          {step.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-5 rounded-2xl bg-linear-to-r from-indigo-600 to-violet-600 p-5 text-white">
                  <p className="font-bold">
                    Your next opportunity starts here.
                  </p>
                  <p className="mt-1 text-sm text-indigo-100">
                    Prepare with a clear plan, not guesswork.
                  </p>
                </div>
              </div>
            </div>
          </header>

          {/* Main generator */}
          <section
            id="generator"
            className="grid scroll-mt-28 items-start gap-8 lg:grid-cols-[minmax(0,1fr)_310px]"
          >
            <div className="overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-xl shadow-slate-200/40">
              <div className="border-b border-slate-100 bg-linear-to-r from-white to-indigo-50/70 px-6 py-7 sm:px-9">
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-indigo-600 text-2xl text-white shadow-lg shadow-indigo-200">
                    ✦
                  </div>

                  <div>
                    <h2 className="text-xl font-extrabold sm:text-2xl">
                      Create your interview report
                    </h2>
                    <p className="mt-2 text-sm leading-6 text-slate-500">
                      Provide the details below to generate your personalized
                      interview preparation report.
                    </p>
                  </div>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-7 p-6 sm:p-9">
                {/* Error message */}
                {error && (
                  <div
                    role="alert"
                    className="flex items-start gap-3 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700"
                  >
                    <span className="text-lg">⚠</span>
                    <div className="flex-1">{error}</div>
                    <button
                      type="button"
                      onClick={() => setError("")}
                      className="font-bold text-rose-500 hover:text-rose-700"
                      aria-label="Dismiss error"
                    >
                      ×
                    </button>
                  </div>
                )}

                {successMessage && (
                  <div
                    role="status"
                    className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700"
                  >
                    {successMessage}
                  </div>
                )}

                {/* Resume upload */}
                <div>
                  <div className="mb-3 flex items-center justify-between gap-3">
                    <label
                      htmlFor="resume"
                      className="text-sm font-bold text-slate-800"
                    >
                      Upload your resume
                      <span className="ml-1 text-rose-500">*</span>
                    </label>

                    <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-500">
                      PDF · Max 5 MB
                    </span>
                  </div>

                  <div
                    onDragOver={(event) => {
                      event.preventDefault();
                      setDragging(true);
                    }}
                    onDragLeave={(event) => {
                      event.preventDefault();
                      setDragging(false);
                    }}
                    onDrop={(event) => {
                      event.preventDefault();
                      setDragging(false);
                      handleFile(event.dataTransfer.files?.[0]);
                    }}
                    onClick={() => fileInputRef.current?.click()}
                    className={`cursor-pointer rounded-2xl border-2 border-dashed p-7 text-center transition sm:p-9 ${
                      dragging
                        ? "border-indigo-500 bg-indigo-50"
                        : resume
                          ? "border-emerald-300 bg-emerald-50/50"
                          : "border-slate-300 bg-slate-50/70 hover:border-indigo-400 hover:bg-indigo-50/50"
                    }`}
                  >
                    <input
                      ref={fileInputRef}
                      id="resume"
                      type="file"
                      accept=".pdf,application/pdf"
                      className="hidden"
                      onChange={(event) => {
                        handleFile(event.target.files?.[0]);
                        event.target.value = "";
                      }}
                    />

                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-3xl shadow-sm">
                      {resume ? "📄" : "☁️"}
                    </div>

                    {resume ? (
                      <>
                        <p className="mt-4 break-all font-bold text-slate-800">
                          {resume.name}
                        </p>
                        <p className="mt-1 text-sm text-emerald-700">
                          Ready to upload · {(resume.size / 1024).toFixed(0)} KB
                        </p>
                        <button
                          type="button"
                          onClick={(event) => {
                            event.stopPropagation();
                            setResume(null);
                          }}
                          className="mt-3 text-sm font-bold text-rose-600 hover:text-rose-700"
                        >
                          Remove file
                        </button>
                      </>
                    ) : (
                      <>
                        <p className="mt-4 font-bold text-slate-800">
                          Drop your resume here or{" "}
                          <span className="text-indigo-600">browse files</span>
                        </p>
                        <p className="mt-2 text-sm text-slate-500">
                          Upload a PDF so the AI can analyze your experience and
                          skills.
                        </p>
                      </>
                    )}
                  </div>
                </div>

                {/* Job description */}
                <div>
                  <div className="mb-3 flex items-center justify-between gap-3">
                    <label
                      htmlFor="jobDescription"
                      className="text-sm font-bold text-slate-800"
                    >
                      Job description
                      <span className="ml-1 text-rose-500">*</span>
                    </label>
                    <span className="text-xs text-slate-400">Required</span>
                  </div>

                  <textarea
                    id="jobDescription"
                    value={jobDescription}
                    onChange={(event) => setJobDescription(event.target.value)}
                    placeholder="Paste the job description here, including responsibilities, required skills, and qualifications..."
                    rows={7}
                    required
                    maxLength={20000}
                    className="w-full resize-y rounded-2xl border border-slate-200 bg-white px-4 py-4 text-sm leading-7 text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100"
                  />

                  <div className="mt-2 text-right text-xs text-slate-400">
                    {jobDescription.length.toLocaleString()} / 20,000 characters
                  </div>
                </div>

                {/* Self introduction */}
                <div>
                  <div className="mb-3 flex items-center justify-between gap-3">
                    <label
                      htmlFor="selfDescription"
                      className="text-sm font-bold text-slate-800"
                    >
                      Introduce yourself
                      <span className="ml-1 text-rose-500">*</span>
                    </label>
                    <span className="text-xs text-slate-400">Required</span>
                  </div>

                  <textarea
                    id="selfDescription"
                    value={selfDescription}
                    onChange={(event) => setSelfDescription(event.target.value)}
                    placeholder="Describe your education, experience, technical skills, projects, achievements, and career goals..."
                    rows={5}
                    required
                    maxLength={10000}
                    className="w-full resize-y rounded-2xl border border-slate-200 bg-white px-4 py-4 text-sm leading-7 text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100"
                  />

                  <div className="mt-2 text-right text-xs text-slate-400">
                    {selfDescription.length.toLocaleString()} / 10,000
                    characters
                  </div>
                </div>

                {/* Submit actions */}
                <div className="border-t border-slate-100 pt-6">
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex w-full items-center justify-center gap-3 rounded-xl bg-linear-to-r from-indigo-600 to-violet-600 px-6 py-4 font-bold text-white shadow-lg shadow-indigo-200 transition hover:-translate-y-0.5 hover:shadow-xl hover:shadow-indigo-200/70 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
                  >
                    {loading ? (
                      <>
                        <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                        Generating your report...
                      </>
                    ) : (
                      <>
                        Generate interview report
                        <span aria-hidden="true">→</span>
                      </>
                    )}
                  </button>

                  <div className="mt-4 flex items-start justify-center gap-2 text-center text-xs leading-5 text-slate-500">
                    <span>🔒</span>
                    <span>
                      Your report is generated from the information you provide.
                      Review AI-generated suggestions before relying on them.
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={clearForm}
                    disabled={loading}
                    className="mt-4 w-full rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-500 transition hover:bg-slate-100 hover:text-slate-800 disabled:opacity-50"
                  >
                    Clear form
                  </button>
                </div>
              </form>
            </div>

            {/* Feature sidebar */}
            <aside id="features" className="scroll-mt-28 space-y-5">
              <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="mb-5 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-xl">
                    ✨
                  </div>
                  <div>
                    <h2 className="font-extrabold">What you'll receive</h2>
                    <p className="mt-1 text-xs text-slate-500">
                      A personalized preparation guide
                    </p>
                  </div>
                </div>

                <div className="space-y-5">
                  {FEATURES.map((feature) => (
                    <div key={feature.title} className="flex gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-50 text-xl">
                        {feature.icon}
                      </div>

                      <div>
                        <h3 className="text-sm font-bold text-slate-800">
                          {feature.title}
                        </h3>
                        <p className="mt-1 text-xs leading-5 text-slate-500">
                          {feature.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="overflow-hidden rounded-3xl bg-linear-to-br from-indigo-600 to-violet-700 p-6 text-white shadow-xl shadow-indigo-200/50">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-white/15 text-2xl">
                  🚀
                </div>

                <h2 className="text-xl font-extrabold">
                  Small steps. Better preparation.
                </h2>

                <p className="mt-3 text-sm leading-6 text-indigo-100">
                  Understand your skill gaps, practice relevant questions, and
                  work through your preparation plan one day at a time.
                </p>

                <button
                  type="button"
                  onClick={scrollToGenerator}
                  className="mt-5 rounded-xl bg-white px-4 py-3 text-sm font-bold text-indigo-700 transition hover:bg-indigo-50"
                >
                  Start preparing →
                </button>
              </div>

              <div className="rounded-2xl border border-indigo-100 bg-indigo-50/70 p-5">
                <p className="text-sm font-bold text-indigo-900">
                  💡 Preparation tip
                </p>
                <p className="mt-2 text-sm leading-6 text-indigo-800/80">
                  Use specific examples from your projects and experience.
                  Practice explaining not just what you did, but why you chose
                  your approach.
                </p>
              </div>
            </aside>
          </section>

          {/* Feature cards */}
          <section className="mt-16">
            <div className="mb-7 max-w-2xl">
              <p className="text-xs font-bold uppercase tracking-widest text-indigo-600">
                Your preparation toolkit
              </p>
              <h2 className="mt-3 text-2xl font-black tracking-tight sm:text-3xl">
                Everything you need to prepare smarter
              </h2>
              <p className="mt-3 leading-7 text-slate-500">
                Turn your application into a practical, structured interview
                preparation experience.
              </p>
            </div>

            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
              {FEATURES.map((feature) => (
                <FeatureCard key={feature.title} {...feature} />
              ))}
            </div>
          </section>

          {/* Previous reports */}
          <section id="reports" className="mt-16 scroll-mt-28">
            <div className="mb-7 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-indigo-600">
                  Your workspace
                </p>
                <h2 className="mt-2 text-2xl font-black tracking-tight sm:text-3xl">
                  Previous reports
                </h2>
                <p className="mt-2 text-sm leading-6 text-slate-500">
                  Revisit your saved interview preparation reports.
                </p>
              </div>

              <button
                type="button"
                onClick={scrollToGenerator}
                className="inline-flex items-center justify-center gap-2 self-start rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-700 transition hover:border-indigo-200 hover:bg-indigo-50 sm:self-auto"
              >
                <span aria-hidden="true">＋</span>
                New report
              </button>
            </div>

            {reportsLoading ? (
              <div className="rounded-3xl border border-slate-200 bg-white p-10 text-center">
                <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-indigo-200 border-t-indigo-600" />
                <p className="mt-4 text-sm text-slate-500">
                  Loading your reports...
                </p>
              </div>
            ) : reportsError ? (
              <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-800">
                {reportsError}
              </div>
            ) : reports.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-slate-300 bg-white px-6 py-12 text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-50 text-3xl">
                  📑
                </div>

                <h3 className="mt-5 text-lg font-extrabold">No reports yet</h3>

                <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
                  Your generated reports will appear here. Create your first
                  report to start preparing for your next interview.
                </p>

                <button
                  type="button"
                  onClick={scrollToGenerator}
                  className="mt-6 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-indigo-700"
                >
                  Create your first report
                </button>
              </div>
            ) : (
              <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                {reports.map((report) => {
                  const score = Number(report.matchScore);
                  const hasScore = Number.isFinite(score);

                  return (
                    <article
                      key={report._id}
                      className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-indigo-200 hover:shadow-xl hover:shadow-indigo-100/50"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-2xl">
                          📋
                        </div>

                        {hasScore && (
                          <div className="rounded-xl bg-slate-50 px-3 py-2 text-right">
                            <p
                              className={`text-xl font-black ${getScoreColor(score)}`}
                            >
                              {score}%
                            </p>
                            <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                              Match score
                            </p>
                          </div>
                        )}
                      </div>

                      <h3 className="mt-5 line-clamp-2 font-extrabold leading-6 text-slate-900">
                        {getReportTitle(report)}
                      </h3>

                      <p className="mt-2 text-xs text-slate-500">
                        Created {formatDate(report.createdAt)}
                      </p>

                      <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4">
                        <span className="text-xs font-medium text-slate-500">
                          AI interview report
                        </span>

                        <button
                          type="button"
                          onClick={() => openReport(report)}
                          className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-bold text-indigo-600 transition hover:bg-indigo-50"
                        >
                          View report
                          <span
                            className="transition group-hover:translate-x-1"
                            aria-hidden="true"
                          >
                            →
                          </span>
                        </button>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </section>

          {/* Footer */}
          <footer className="mt-16 border-t border-slate-200 py-8">
            <div className="flex flex-col items-center justify-between gap-4 text-center sm:flex-row sm:text-left">
              <div>
                <p className="font-extrabold">
                  Interview<span className="text-indigo-600">AI</span>
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  Your personal interview preparation assistant.
                </p>
              </div>

              <p className="text-xs text-slate-400">
                © {new Date().getFullYear()} InterviewAI. Prepare with purpose.
              </p>
            </div>
          </footer>
        </div>
      </main>
    </div>
  );
}

export default Home;
