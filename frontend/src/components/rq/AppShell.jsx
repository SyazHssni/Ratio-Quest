import { NavLink, Link, useLocation } from "react-router-dom";
import { Home, BookOpen, FlaskConical, Layers, Gamepad2, Award, GraduationCap, MoreHorizontal, Star, AlertTriangle } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../ui/dropdown-menu";
import { useProgress } from "../../context/ProgressContext";
import { RafiAvatar } from "./Rafi";

export const NAV = [
  { to: "/", label: "Home", icon: Home, id: "home" },
  { to: "/learn", label: "Learn", icon: BookOpen, id: "learn" },
  { to: "/lab", label: "Visual Lab", icon: FlaskConical, id: "lab" },
  { to: "/practice", label: "Practice", icon: Layers, id: "practice" },
  { to: "/games", label: "Games", icon: Gamepad2, id: "games" },
  { to: "/progress", label: "My Progress", icon: Award, id: "progress" },
  { to: "/teacher", label: "Teacher Corner", icon: GraduationCap, id: "teacher" },
];

const desktopClass = ({ isActive }) =>
  `relative inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-semibold min-h-[44px] transition-colors duration-150 ${
    isActive ? "bg-teal-50 text-teal-900 after:absolute after:left-3 after:right-3 after:-bottom-0.5 after:h-1 after:rounded-full after:bg-teal-600" : "text-slate-700 hover:bg-slate-100"
  }`;

export function AppShell({ children }) {
  const { progress, storageOk } = useProgress();
  const loc = useLocation();
  const moreActive = ["/progress", "/teacher"].some((p) => loc.pathname.startsWith(p));
  return (
    <div className="min-h-screen flex flex-col">
      <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:m-2 focus:p-3 focus:bg-white focus:rounded-xl" data-testid="skip-link">
        Skip to main content
      </a>
      <header className="no-print sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2 flex items-center justify-between gap-4">
          <Link to="/" className="flex items-center gap-2 min-h-[44px]" data-testid="brand-link" aria-label="Ratio Quest home">
            <RafiAvatar size={38} />
            <span className="font-heading text-xl font-bold text-slate-900">Ratio Quest</span>
          </Link>
          <nav aria-label="Main" className="hidden lg:flex items-center gap-1" data-testid="desktop-nav">
            {NAV.map((n) => (
              <NavLink key={n.id} to={n.to} end={n.to === "/"} className={desktopClass} data-testid={`nav-${n.id}`}>
                <n.icon size={18} aria-hidden="true" />
                {n.label}
              </NavLink>
            ))}
          </nav>
          <Link to="/progress" className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 border border-amber-300 px-3 py-1.5 font-bold text-slate-900 text-sm" data-testid="points-chip" aria-label={`${progress.points} points. View my progress`}>
            <Star size={16} className="text-amber-600" fill="#F59E0B" aria-hidden="true" /> {progress.points}
          </Link>
        </div>
        {!storageOk && (
          <div className="bg-orange-50 border-t border-orange-200 text-orange-900 text-sm font-semibold px-4 py-2 flex items-center gap-2 justify-center" role="status" data-testid="storage-warning">
            <AlertTriangle size={16} aria-hidden="true" /> Your progress may not be saved on this device. You can still keep learning.
          </div>
        )}
      </header>

      <main id="main" className="flex-1 w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-28 lg:pb-12">
        {children}
      </main>

      <nav aria-label="Main" className="no-print lg:hidden fixed bottom-0 inset-x-0 z-50 bg-white/95 backdrop-blur border-t border-slate-200 shadow-lg" data-testid="mobile-nav">
        <div className="flex justify-around items-stretch px-1">
          {NAV.slice(0, 5).map((n) => (
            <NavLink
              key={n.id}
              to={n.to}
              end={n.to === "/"}
              data-testid={`mnav-${n.id}`}
              className={({ isActive }) => `flex flex-col items-center justify-center min-h-[58px] min-w-[56px] px-1 text-[11px] font-semibold border-t-4 ${isActive ? "border-teal-600 text-teal-900" : "border-transparent text-slate-600"}`}
            >
              <n.icon size={22} aria-hidden="true" />
              {n.label === "Visual Lab" ? "Lab" : n.label}
            </NavLink>
          ))}
          <DropdownMenu>
            <DropdownMenuTrigger className={`flex flex-col items-center justify-center min-h-[58px] min-w-[56px] text-[11px] font-semibold border-t-4 ${moreActive ? "border-teal-600 text-teal-900" : "border-transparent text-slate-600"}`} data-testid="mnav-more">
              <MoreHorizontal size={22} aria-hidden="true" />
              More
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="mb-2">
              {NAV.slice(5).map((n) => (
                <DropdownMenuItem key={n.id} asChild>
                  <Link to={n.to} className="min-h-[44px] flex items-center gap-2 text-base" data-testid={`mnav-${n.id}`}>
                    <n.icon size={18} aria-hidden="true" /> {n.label}
                  </Link>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </nav>
    </div>
  );
}

export const PageTitle = ({ title, subtitle, testid }) => (
  <div className="mb-6 rq-enter">
    <h1 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 tracking-tight" data-testid={testid}>
      {title}
    </h1>
    {subtitle && <p className="mt-2 text-base md:text-lg text-slate-700 max-w-2xl">{subtitle}</p>}
  </div>
);
