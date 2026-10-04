import {
  Bell,
  Search,
  ChevronDown,
  Menu,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";

interface TopbarProps {
  onMenuClick: () => void;
}

function Topbar({ onMenuClick }: TopbarProps) {
  const { user } = useAuth();

  const initials = user?.email
    ? user.email.substring(0, 2).toUpperCase()
    : "AD";

  return (
    <header className="fixed left-0 right-0 top-0 z-40 h-[72px] border-b border-slate-200 bg-white lg:left-[260px]">

      <div className="flex h-full items-center justify-between px-4 sm:px-6 lg:px-7">

        {/* Left */}

        <div className="flex min-w-0 items-center gap-3 sm:gap-4">

          {/* Mobile Menu */}

          <button
            type="button"
            onClick={onMenuClick}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg p-2 text-slate-500 hover:bg-slate-100 lg:hidden"
            aria-label="Open menu"
          >
            <Menu size={21} />
          </button>

          {/* School Name - Mobile */}

          <div className="flex items-center gap-2 lg:hidden">

            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-600 shadow-md shadow-blue-600/20">
              <span className="text-sm font-bold text-white">
                🎓
              </span>
            </div>

            <div>
              <h1 className="text-base font-bold tracking-tight text-slate-900">
                School<span className="text-blue-600">MS</span>
              </h1>

              <p className="text-[8px] font-medium uppercase tracking-wider text-slate-400">
                Management System
              </p>
            </div>

          </div>

          {/* Search - Desktop Only */}

          <div className="relative hidden w-[320px] lg:block">

            <Search
              size={18}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              type="text"
              placeholder="Search anything..."
              className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
            />

            <span className="absolute right-3 top-1/2 hidden -translate-y-1/2 rounded border border-slate-200 bg-white px-1.5 py-0.5 text-[10px] font-medium text-slate-400 xl:block">
              Ctrl K
            </span>

          </div>

        </div>

        {/* Right */}

        <div className="flex shrink-0 items-center gap-2 sm:gap-5">

          {/* Notification */}

          <button
            type="button"
            className="relative rounded-xl p-2.5 text-slate-500 transition hover:bg-slate-50 hover:text-slate-700"
          >
            <Bell size={20} />

            <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white" />
          </button>

          <div className="h-8 w-px bg-slate-200" />

          {/* Profile */}

          <button
            type="button"
            className="flex items-center gap-2 rounded-xl px-1.5 py-1.5 transition hover:bg-slate-50 sm:gap-3 sm:px-2"
          >

            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-600">
              {initials}
            </div>

            <div className="hidden text-left sm:block">

              <p className="max-w-[160px] truncate text-sm font-semibold text-slate-800">
                {user?.email}
              </p>

              <p className="text-xs text-slate-400">
                Administrator
              </p>

            </div>

            <ChevronDown
              size={16}
              className="text-slate-400"
            />

          </button>

        </div>

      </div>
    </header>
  );
}

export default Topbar;