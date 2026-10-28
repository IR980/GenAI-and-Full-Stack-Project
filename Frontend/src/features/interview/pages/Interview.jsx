import { useEffect, useState } from "react";
import { Link, useParams } from "react-router";
import {
  getInterviewReportById,
  downloadTailoredResume,
} from "../services/interview.api";

function QuestionCard({ item, index, type }) {
  const [open, setOpen] = useState(false);
  const technical = type === "technical";

  return (
    <article
      className={`group overflow-hidden rounded-2xl border bg-white transition duration-300 hover:-translate-y-0.5 hover:shadow-lg ${
        technical
          ? "border-indigo-100 hover:border-indigo-300"
          : "border-violet-100 hover:border-violet-300"
      }`}
    >
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen(!open)}
        className="flex w-full items-start gap-4 p-5 text-left sm:p-6"
      >
        <span
          className={`grid h-11 w-11 shrink-0 place-items-center rounded-xl text-sm font-extrabold ${
            technical
              ? "bg-indigo-50 text-indigo-700"
              : "bg-violet-50 text-violet-700"
          }`}
        >
          {String(index + 1).padStart(2, "0")}
        </span>

        <span className="min-w-0 flex-1">
          <span className="block font-semibold leading-6 text-slate-800">
            {item.question}
          </span>
          <span className="mt-2 block text-xs font-medium text-slate-400">
            {open ? "Hide answer ↑" : "View intention and suggested answer ↓"}
          </span>
        </span>

        <span
          className={`grid h-8 w-8 shrink-0 place-items-center rounded-full text-xl transition ${
            open
              ? "rotate-45 bg-slate-100 text-slate-700"
              : "bg-slate-50 text-slate-400"
          }`}
        >
          +
        </span>
      </button>

      {open && (
        <div className="space-y-5 border-t border-slate-100 bg-slate-50/70 p-5 sm:p-6">
          <div>
            <p
              className={`mb-2 text-xs font-extrabold uppercase tracking-widest ${
                technical ? "text-indigo-600" : "text-violet-600"
              }`}
            >
              Interviewer's intention
            </p>
            <p className="text-sm leading-7 text-slate-600">
              {item.intention || "Understand your approach and reasoning."}
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-4 sm:p-5">
            <p className="mb-2 flex items-center gap-2 text-xs font-extrabold uppercase tracking-widest text-emerald-700">
              <span>✦</span> Suggested answer
            </p>
            <p className="whitespace-pre-line text-sm leading-7 text-slate-700">
              {item.answer || "Prepare a clear answer using relevant examples."}
            </p>
          </div>
        </div>
      )}
    </article>
  );
}

function SectionHeading({ number, eyebrow, title, description, color }) {
  return (
    <div className="mb-5">
      <div
        className={`mb-2 text-xs font-extrabold uppercase tracking-[0.2em] ${color}`}
      >
        {number} / {eyebrow}
      </div>
      <h2 className="text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
        {title}
      </h2>
      {description && (
        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
          {description}
        </p>
      )}
    </div>
  );
}

export default function Interview() {
  const { interviewId } = useParams();

  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [completedTasks, setCompletedTasks] = useState({});
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    let active = true;

    async function loadReport() {
      setLoading(true);
      setError("");

      try {
        const data = await getInterviewReportById(interviewId);

        if (active) {
          setReport(data?.interviewReport ?? data);
        }
      } catch (err) {
        if (active) {
          setError(
            err.response?.data?.message ||
              "Could not load this interview report.",
          );
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    if (interviewId) loadReport();

    return () => {
      active = false;
    };
  }, [interviewId]);

  const handleDownload = async () => {
    setDownloading(true);
    setError("");

    try {
      const blob = await downloadTailoredResume(interviewId);
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");

      link.href = url;
      link.download = `tailored_resume_${interviewId}.pdf`;

      document.body.appendChild(link);
      link.click();
      link.remove();

      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Could not generate the tailored resume PDF.",
      );
    } finally {
      setDownloading(false);
    }
  };

  if (loading) {
    return (
      <main className="grid min-h-screen place-items-center bg-slate-50 px-4">
        <div className="text-center">
          <div className="mx-auto mb-5 h-12 w-12 animate-spin rounded-full border-4 border-indigo-100 border-t-indigo-600" />
          <h2 className="font-bold text-slate-800">
            Preparing your interview report
          </h2>
          <p className="mt-2 text-sm text-slate-500">
            Loading your personalized insights...
          </p>
        </div>
      </main>
    );
  }

  if (error && !report) {
    return (
      <main className="grid min-h-screen place-items-center bg-slate-50 px-4">
        <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-xl">
          <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-red-50 text-3xl">
            !
          </div>
          <h1 className="mt-5 text-2xl font-extrabold text-slate-900">
            Report unavailable
          </h1>
          <p className="mt-3 text-sm leading-6 text-red-600">{error}</p>
          <Link
            to="/"
            className="mt-6 inline-flex rounded-xl bg-indigo-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-indigo-700"
          >
            ← Back to Home
          </Link>
        </div>
      </main>
    );
  }

  const score = Math.max(0, Math.min(100, Number(report?.matchScore) || 0));

  const technical = report?.technicalQuestion || [];
  const behavioral = report?.behavioralQuestion || [];
  const gaps = report?.skillGap || [];
  const roadmap = report?.preparationPlan || [];

  const taskCount = roadmap.reduce(
    (sum, day) => sum + (day.tasks?.length || 0),
    0,
  );

  const doneCount = Object.values(completedTasks).filter(Boolean).length;
  const progress = taskCount ? Math.round((doneCount / taskCount) * 100) : 0;

  const severityClass = (severity) => {
    if (severity === "high") {
      return "bg-red-50 text-red-700 ring-red-100";
    }
    if (severity === "medium") {
      return "bg-amber-50 text-amber-700 ring-amber-100";
    }
    return "bg-emerald-50 text-emerald-700 ring-emerald-100";
  };

  return (
    <main className="min-h-screen bg-[#f6f7fb] px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        {/* Navigation */}
        <nav className="mb-7 flex flex-wrap items-center justify-between gap-4">
          <Link
            to="/"
            className="inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-bold text-slate-600 transition hover:bg-white hover:text-indigo-700"
          >
            <span>←</span> All reports
          </Link>

          <button
            type="button"
            onClick={handleDownload}
            disabled={downloading}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-slate-900/10 transition hover:-translate-y-0.5 hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <span>↓</span>
            {downloading ? "Preparing PDF..." : "Download tailored resume"}
          </button>
        </nav>

        {error && (
          <div
            role="alert"
            className="mb-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
          >
            {error}
          </div>
        )}

        {/* Hero */}
        <header className="relative mb-7 overflow-hidden rounded-4xl bg-linear-to-br from-indigo-700 via-indigo-600 to-violet-700 p-6 text-white shadow-xl shadow-indigo-900/10 sm:p-10 lg:p-12">
          <div className="pointer-events-none absolute -right-16 -top-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-24 right-1/3 h-56 w-56 rounded-full bg-violet-300/20 blur-3xl" />

          <div className="relative">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-2 text-xs font-bold tracking-wide text-indigo-50 backdrop-blur">
              <span>✦</span> AI-POWERED CAREER INSIGHTS
            </span>

            <h1 className="mt-5 max-w-3xl text-3xl font-black leading-tight tracking-tight sm:text-4xl lg:text-5xl">
              {report?.title || "Your Interview Preparation Report"}
            </h1>

            <p className="mt-4 max-w-2xl text-sm leading-7 text-indigo-100 sm:text-base">
              Understand your job match, strengthen your skills, practice
              interview questions, and follow your personalized preparation
              plan.
            </p>

            <div className="mt-7 flex flex-wrap gap-3">
              {[
                `${technical.length} technical questions`,
                `${behavioral.length} behavioral questions`,
                `${roadmap.length} roadmap days`,
              ].map((label) => (
                <span
                  key={label}
                  className="rounded-xl border border-white/15 bg-white/10 px-4 py-2.5 text-sm font-semibold backdrop-blur"
                >
                  {label}
                </span>
              ))}
            </div>

            <div className="mt-8 flex flex-wrap gap-3">
              <a
                href="#technical"
                className="rounded-xl bg-white px-5 py-3 text-sm font-extrabold text-indigo-700 transition hover:bg-indigo-50"
              >
                Practice questions ↓
              </a>
              <a
                href="#roadmap"
                className="rounded-xl border border-white/30 bg-white/10 px-5 py-3 text-sm font-bold text-white transition hover:bg-white/20"
              >
                View preparation plan
              </a>
            </div>
          </div>
        </header>

        {/* Overview cards */}
        <section className="mb-10 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <article className="rounded-2xl border border-indigo-100 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
            <p className="text-sm font-semibold text-slate-500">
              Job match score
            </p>
            <div className="mt-4 flex items-center gap-4">
              <div
                className="grid h-20 w-20 shrink-0 place-items-center rounded-full"
                style={{
                  background: `conic-gradient(#6366f1 ${score}%, #e0e7ff ${score}% 100%)`,
                }}
              >
                <div className="grid h-15.5 w-15.5 place-items-center rounded-full bg-white">
                  <span className="text-xl font-black text-indigo-700">
                    {score}%
                  </span>
                </div>
              </div>
              <div>
                <p className="font-bold text-slate-800">
                  {score >= 80
                    ? "Strong match"
                    : score >= 60
                      ? "Good potential"
                      : "Room to grow"}
                </p>
                <p className="mt-1 text-xs leading-5 text-slate-500">
                  Based on your generated report
                </p>
              </div>
            </div>
          </article>

          <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-slate-500">
                Technical questions
              </p>
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-indigo-50 text-lg text-indigo-600">
                {"</>"}
              </span>
            </div>
            <p className="mt-5 text-4xl font-black text-slate-900">
              {technical.length}
            </p>
            <a
              href="#technical"
              className="mt-3 inline-block text-xs font-bold text-indigo-600 hover:text-indigo-800"
            >
              Start practicing →
            </a>
          </article>

          <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-slate-500">
                Behavioral questions
              </p>
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-violet-50 text-lg text-violet-600">
                ◉
              </span>
            </div>
            <p className="mt-5 text-4xl font-black text-slate-900">
              {behavioral.length}
            </p>
            <a
              href="#behavioral"
              className="mt-3 inline-block text-xs font-bold text-violet-600 hover:text-violet-800"
            >
              Build confidence →
            </a>
          </article>

          <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-slate-500">
                Preparation progress
              </p>
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-emerald-50 text-lg text-emerald-600">
                ✓
              </span>
            </div>
            <p className="mt-5 text-4xl font-black text-slate-900">
              {progress}%
            </p>
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full rounded-full bg-linear-to-r from-emerald-500 to-teal-400 transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="mt-2 text-xs text-slate-500">
              {doneCount} of {taskCount} tasks completed
            </p>
          </article>
        </section>

        {/* Skill gap analysis */}
        <section className="mb-11 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <span className="text-xs font-extrabold uppercase tracking-[0.2em] text-amber-600">
                YOUR NEXT STEPS
              </span>
              <h2 className="mt-2 text-2xl font-extrabold text-slate-900">
                Skill gap analysis
              </h2>
              <p className="mt-2 text-sm leading-6 text-slate-500">
                Prioritize areas that may need additional preparation.
              </p>
            </div>
            <span className="rounded-xl bg-amber-50 px-4 py-2 text-sm font-bold text-amber-700">
              {gaps.length} areas identified
            </span>
          </div>

          {gaps.length ? (
            <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {gaps.map((gap, index) => (
                <div
                  key={`${gap.skill}-${index}`}
                  className="flex items-center gap-3 rounded-2xl border border-slate-100 bg-slate-50/80 p-4 transition hover:border-slate-200 hover:bg-white"
                >
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-white text-lg shadow-sm">
                    {gap.severity === "high"
                      ? "!"
                      : gap.severity === "medium"
                        ? "↗"
                        : "✓"}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="wrap-break-word text-sm font-bold text-slate-800">
                      {gap.skill}
                    </p>
                    <span
                      className={`mt-1 inline-flex rounded-full px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wider ring-1 ring-inset ${severityClass(gap.severity)}`}
                    >
                      {gap.severity || "low"} priority
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="mt-6 rounded-2xl border border-dashed border-slate-200 p-8 text-center">
              <p className="font-semibold text-slate-700">
                No skill gaps listed
              </p>
              <p className="mt-1 text-sm text-slate-500">
                Continue practicing and review the questions below.
              </p>
            </div>
          )}
        </section>

        {/* Technical questions */}
        <section id="technical" className="mb-12 scroll-mt-6">
          <SectionHeading
            number="01"
            eyebrow="Technical round"
            title="Technical interview questions"
            description="Test your fundamentals and practice explaining your technical decisions clearly."
            color="text-indigo-600"
          />

          <div className="space-y-4">
            {technical.length ? (
              technical.map((item, index) => (
                <QuestionCard
                  key={`technical-${index}`}
                  item={item}
                  index={index}
                  type="technical"
                />
              ))
            ) : (
              <p className="rounded-2xl border border-dashed border-slate-300 bg-white p-6 text-sm text-slate-500">
                No technical questions were returned for this report.
              </p>
            )}
          </div>
        </section>

        {/* Behavioral questions */}
        <section id="behavioral" className="mb-12 scroll-mt-6">
          <SectionHeading
            number="02"
            eyebrow="Behavioral round"
            title="Behavioral interview questions"
            description="Prepare examples about teamwork, challenges, communication, and problem-solving."
            color="text-violet-600"
          />

          <div className="space-y-4">
            {behavioral.length ? (
              behavioral.map((item, index) => (
                <QuestionCard
                  key={`behavioral-${index}`}
                  item={item}
                  index={index}
                  type="behavioral"
                />
              ))
            ) : (
              <p className="rounded-2xl border border-dashed border-slate-300 bg-white p-6 text-sm text-slate-500">
                No behavioral questions were returned for this report.
              </p>
            )}
          </div>
        </section>

        {/* Preparation roadmap */}
        <section id="roadmap" className="mb-12 scroll-mt-6">
          <SectionHeading
            number="03"
            eyebrow="Your action plan"
            title="Preparation roadmap"
            description="Complete each task as you progress. Your progress is tracked in this page session."
            color="text-emerald-600"
          />

          <div className="mb-5 rounded-2xl border border-emerald-100 bg-linear-to-r from-emerald-50 to-teal-50 p-5">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="font-bold text-emerald-950">
                  Your preparation journey
                </p>
                <p className="mt-1 text-sm text-emerald-800">
                  {doneCount} of {taskCount} tasks complete
                </p>
              </div>
              <span className="text-2xl font-black text-emerald-700">
                {progress}%
              </span>
            </div>
            <div className="mt-4 h-2.5 overflow-hidden rounded-full bg-white">
              <div
                className="h-full rounded-full bg-emerald-500 transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {roadmap.length ? (
            <div className="space-y-4">
              {roadmap.map((day, index) => {
                const tasks = day.tasks || [];
                const dayDone = tasks.filter(
                  (_, i) => completedTasks[`${day.day}-${i}`],
                ).length;
                const dayProgress = tasks.length
                  ? Math.round((dayDone / tasks.length) * 100)
                  : 0;

                return (
                  <article
                    key={`${day.day}-${index}`}
                    className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:shadow-md"
                  >
                    <div className="flex flex-wrap items-center gap-4 border-b border-slate-100 p-5 sm:p-6">
                      <div className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-emerald-50 text-emerald-700">
                        <div className="text-center">
                          <span className="block text-[10px] font-bold uppercase tracking-widest">
                            Day
                          </span>
                          <span className="text-xl font-black">{day.day}</span>
                        </div>
                      </div>

                      <div className="min-w-0 flex-1">
                        <h3 className="text-base font-extrabold text-slate-900">
                          {day.focus || `Preparation day ${day.day}`}
                        </h3>
                        <p className="mt-1 text-sm text-slate-500">
                          {dayDone} of {tasks.length} tasks completed
                        </p>
                      </div>

                      <span className="rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-extrabold text-emerald-700">
                        {dayProgress}%
                      </span>
                    </div>

                    <div className="space-y-2 p-4 sm:p-6">
                      {tasks.map((task, i) => {
                        const key = `${day.day}-${i}`;
                        const checked = !!completedTasks[key];

                        return (
                          <label
                            key={key}
                            className={`flex cursor-pointer items-start gap-3 rounded-xl border p-3.5 transition ${
                              checked
                                ? "border-emerald-100 bg-emerald-50/70"
                                : "border-transparent hover:border-slate-200 hover:bg-slate-50"
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={checked}
                              onChange={() =>
                                setCompletedTasks((prev) => ({
                                  ...prev,
                                  [key]: !prev[key],
                                }))
                              }
                              className="mt-1 h-4 w-4 shrink-0 accent-emerald-600"
                            />
                            <span
                              className={`text-sm leading-6 ${
                                checked
                                  ? "text-emerald-800 line-through"
                                  : "text-slate-600"
                              }`}
                            >
                              {task}
                            </span>
                          </label>
                        );
                      })}
                    </div>
                  </article>
                );
              })}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center">
              <p className="font-semibold text-slate-700">
                No preparation roadmap available
              </p>
              <p className="mt-2 text-sm text-slate-500">
                Review your interview questions while you plan your next steps.
              </p>
            </div>
          )}
        </section>

        <footer className="border-t border-slate-200 py-8 text-center">
          <p className="text-sm font-semibold text-slate-600">
            Built for your next career opportunity
          </p>
          <p className="mt-2 text-xs text-slate-400">
            AI-generated suggestions are a starting point. Personalize your
            answers with your own experience.
          </p>
          <Link
            to="/"
            className="mt-4 inline-flex text-sm font-bold text-indigo-600 hover:text-indigo-800"
          >
            ← Return to dashboard
          </Link>
        </footer>
      </div>
    </main>
  );
}
