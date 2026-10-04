import { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

function AdminLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen overflow-x-hidden bg-slate-50">
      <Sidebar
        isOpen={isSidebarOpen}
        setIsOpen={setIsSidebarOpen}
      />

      <Topbar
        onMenuClick={() => setIsSidebarOpen(true)}
      />

      <main className="min-w-0 pt-[72px] lg:ml-[260px]">
        <div className="min-w-0 p-4 sm:p-6 lg:p-7">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

export default AdminLayout;