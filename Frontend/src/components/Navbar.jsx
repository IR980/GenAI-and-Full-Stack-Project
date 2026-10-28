import { useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router";

export default function Navbar({ user, onLogout }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const profileRef = useRef(null);
  const location = useLocation();

  const userName =
    user?.name || user?.username || user?.fullName || "My Account";

  const userEmail = user?.email || "Interview preparation workspace";

  const initials = userName
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join("");

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 12);

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
    setProfileOpen(false);
  }, [location.pathname, location.hash]);

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setProfileOpen(false);
      }
    };

    const handleEscape = (event) => {
      if (event.key === "Escape") {
        setProfileOpen(false);
        setMobileOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  const navigation = [
    { label: "Home", href: "#home", icon: "⌂" },
    { label: "Generator", href: "#generator", icon: "✦" },
    { label: "My Reports", href: "#reports", icon: "▤" },
    { label: "Features", href: "#features", icon: "◈" },
  ];

  const handleNavigation = (event, href) => {
    event.preventDefault();
    setMobileOpen(false);
    setProfileOpen(false);

    const targetId = href.substring(1);

    // Support navigation from another page back to Home.
    if (location.pathname !== "/") {
      window.location.href = `/${href}`;
      return;
    }

    const target = document.getElementById(targetId);

    if (target) {
      target.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });

      window.history.replaceState(null, "", href);
    } else if (targetId === "home") {
      window.scrollTo({ top: 0, behavior: "smooth" });
      window.history.replaceState(null, "", "/");
    }
  };

  return (
    <header
      className={`sticky top-0 z-50 w-full transition-all duration-300 ${
        scrolled
          ? "border-b border-slate-200/70 bg-white/90 shadow-lg shadow-slate-900/5 backdrop-blur-xl"
          : "border-b border-slate-100 bg-white"
      }`}
    >
      <nav
        aria-label="Main navigation"
        className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8"
      >
        <div className="flex h-19 items-center justify-between gap-4">
          {/* Brand */}
          <Link
            to="/"
            onClick={() => {
              setMobileOpen(false);
              setProfileOpen(false);
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
            className="group flex shrink-0 items-center gap-3"
            aria-label="AI Interview home"
          >
            <span className="grid h-11 w-11 place-items-center rounded-2xl bg-linear-to-br from-indigo-600 via-indigo-600 to-violet-600 text-xl font-black text-white shadow-lg shadow-indigo-500/25 transition duration-300 group-hover:-rotate-6 group-hover:scale-105">
              AI
            </span>

            <span className="hidden sm:block">
              <span className="block text-[17px] font-extrabold tracking-tight text-slate-900">
                Interview<span className="text-indigo-600">AI</span>
              </span>
              <span className="mt-0.5 block text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">
                Career preparation
              </span>
            </span>
          </Link>

          {/* Desktop navigation */}
          <div className="hidden items-center gap-1 rounded-2xl border border-slate-100 bg-slate-50/80 p-1.5 lg:flex">
            {navigation.map((item) => (
              <a
                key={item.label}
                href={item.href}
                onClick={(event) => handleNavigation(event, item.href)}
                className="group flex items-center gap-2 rounded-xl px-3.5 py-2.5 text-[13px] font-semibold text-slate-600 transition duration-200 hover:bg-white hover:text-indigo-700 hover:shadow-sm xl:px-4"
              >
                <span className="text-base text-slate-400 transition group-hover:text-indigo-600">
                  {item.icon}
                </span>
                {item.label}
              </a>
            ))}
          </div>

          {/* Right side */}
          <div className="flex items-center gap-2 sm:gap-3">
            <a
              href="#generator"
              onClick={(event) => handleNavigation(event, "#generator")}
              className="hidden items-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 text-sm font-bold text-white shadow-md shadow-indigo-600/20 transition duration-200 hover:-translate-y-0.5 hover:bg-indigo-700 hover:shadow-lg sm:inline-flex"
            >
              <span className="text-base">+</span>
              New Report
            </a>

            {/* Profile dropdown */}
            <div ref={profileRef} className="relative">
              <button
                type="button"
                onClick={() => setProfileOpen((prev) => !prev)}
                aria-expanded={profileOpen}
                aria-label="Open account menu"
                className={`flex items-center gap-2 rounded-2xl border p-1.5 pr-2.5 transition ${
                  profileOpen
                    ? "border-indigo-200 bg-indigo-50"
                    : "border-slate-200 bg-white hover:border-indigo-200 hover:bg-slate-50"
                }`}
              >
                <span className="grid h-9 w-9 place-items-center rounded-xl bg-linear-to-br from-indigo-500 to-violet-600 text-xs font-extrabold text-white">
                  {initials || "U"}
                </span>

                <span className="hidden max-w-24 text-left md:block">
                  <span className="block truncate text-xs font-bold text-slate-800">
                    {userName}
                  </span>
                  <span className="mt-0.5 block text-[10px] text-slate-400">
                    My account
                  </span>
                </span>

                <svg
                  viewBox="0 0 20 20"
                  fill="none"
                  className={`hidden h-4 w-4 text-slate-400 transition-transform md:block ${
                    profileOpen ? "rotate-180" : ""
                  }`}
                  aria-hidden="true"
                >
                  <path
                    d="m5 7.5 5 5 5-5"
                    stroke="currentColor"
                    strokeWidth="1.7"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>

              {profileOpen && (
                <div className="absolute right-0 top-full mt-3 w-72 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl shadow-slate-900/10">
                  <div className="bg-linear-to-br from-indigo-50 to-violet-50 p-4">
                    <div className="flex items-center gap-3">
                      <span className="grid h-12 w-12 place-items-center rounded-2xl bg-linear-to-br from-indigo-600 to-violet-600 text-sm font-extrabold text-white">
                        {initials || "U"}
                      </span>

                      <div className="min-w-0">
                        <p className="truncate text-sm font-extrabold text-slate-900">
                          {userName}
                        </p>
                        <p className="mt-1 truncate text-xs text-slate-500">
                          {userEmail}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="p-2">
                    <a
                      href="#reports"
                      onClick={(event) => handleNavigation(event, "#reports")}
                      className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-slate-600 transition hover:bg-indigo-50 hover:text-indigo-700"
                    >
                      <span className="text-lg">▤</span>
                      My interview reports
                    </a>

                    <a
                      href="#generator"
                      onClick={(event) => handleNavigation(event, "#generator")}
                      className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-slate-600 transition hover:bg-indigo-50 hover:text-indigo-700"
                    >
                      <span className="text-lg">✦</span>
                      Generate new report
                    </a>

                    <div className="my-2 border-t border-slate-100" />

                    <button
                      type="button"
                      onClick={() => {
                        setProfileOpen(false);
                        onLogout?.();
                      }}
                      className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-semibold text-red-600 transition hover:bg-red-50"
                    >
                      <span className="text-lg">↪</span>
                      Sign out
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Mobile menu button */}
            <button
              type="button"
              onClick={() => setMobileOpen((prev) => !prev)}
              aria-label={mobileOpen ? "Close menu" : "Open menu"}
              aria-expanded={mobileOpen}
              className="grid h-11 w-11 place-items-center rounded-xl border border-slate-200 bg-white text-slate-700 transition hover:border-indigo-200 hover:bg-indigo-50 lg:hidden"
            >
              {mobileOpen ? (
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  className="h-6 w-6"
                  aria-hidden="true"
                >
                  <path
                    d="m6 6 12 12M18 6 6 18"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
              ) : (
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  className="h-6 w-6"
                  aria-hidden="true"
                >
                  <path
                    d="M4 7h16M4 12h16M4 17h16"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Mobile navigation panel */}
        <div
          className={`grid transition-all duration-300 ease-in-out lg:hidden ${
            mobileOpen
              ? "grid-rows-[1fr] pb-4 opacity-100"
              : "grid-rows-[0fr] opacity-0"
          }`}
        >
          <div className="overflow-hidden">
            <div className="rounded-2xl border border-slate-200 bg-white p-2 shadow-sm">
              {navigation.map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  onClick={(event) => handleNavigation(event, item.href)}
                  className="flex items-center gap-3 rounded-xl px-4 py-3.5 text-sm font-semibold text-slate-700 transition hover:bg-indigo-50 hover:text-indigo-700"
                >
                  <span className="grid h-9 w-9 place-items-center rounded-xl bg-slate-50 text-lg text-indigo-600">
                    {item.icon}
                  </span>
                  {item.label}
                  <span className="ml-auto text-slate-400">→</span>
                </a>
              ))}

              <a
                href="#generator"
                onClick={(event) => handleNavigation(event, "#generator")}
                className="mt-2 flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-3.5 text-sm font-bold text-white transition hover:bg-indigo-700"
              >
                <span>+</span>
                Generate interview report
              </a>
            </div>
          </div>
        </div>
      </nav>
    </header>
  );
}
