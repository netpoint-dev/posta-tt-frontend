"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Cookies from "js-cookie";
import Link from "next/link";
import Image from "next/image";
import {
  LayoutDashboard,
  Users,
  Layers,
  UserCircle,
  LogOut,
  X,
  Menu
} from "lucide-react";

interface User {
  full_name: string;
  role: string;
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<User | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    const token = Cookies.get("access_token");
    const userData = Cookies.get("user");

    if (!token || !userData) {
      router.push("/login");
      return;
    }

    try {
      const parsedUser = JSON.parse(userData) as User;
      setUser(parsedUser);

      // RBAC: Solo administradores
      if (parsedUser.role !== "admin") {
        router.push("/403");
      }
    } catch {
      router.push("/login");
    }
  }, [router]);

  const handleLogout = () => {
    Cookies.remove("access_token");
    Cookies.remove("user");
    router.push("/login");
  };

  if (!user || user.role !== "admin") return null;

  return (
    <div className="flex min-h-screen bg-gray-50/50 text-[#1F2937] font-sans antialiased">
      {/* Mobile Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 lg:hidden transition-opacity"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          bg-white border-r border-gray-100 flex flex-col transition-transform duration-300 ease-in-out
          fixed inset-y-0 left-0 z-50 w-[260px] shadow-[4px_0_24px_rgba(0,0,0,0.02)]
          lg:translate-x-0 lg:static lg:h-screen lg:sticky lg:top-0
          ${isSidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        `}
      >
        <div className="p-6 mb-2 flex items-center justify-between overflow-hidden flex-shrink-0">
          <Image src="/tuturno_logo.svg" alt="TuTurno" width={120} height={30} className="h-auto w-[110px]" priority />
          <button
            onClick={() => setIsSidebarOpen(false)}
            className="lg:hidden p-2 hover:bg-gray-50 rounded-xl text-[#9CA3AF] hover:text-[#8054FF] transition-all"
          >
            <X size={20} />
          </button>
        </div>

        <nav className="flex-grow px-4 space-y-1.5 overflow-y-auto overflow-x-hidden custom-scrollbar">
          <div className="px-3 mb-2 text-[11px] font-bold text-[#9CA3AF] uppercase tracking-widest">
            Menú Principal
          </div>
          <NavItem
            href="/admin"
            icon={<LayoutDashboard size={20} />}
            label="Dashboard"
            active={pathname === "/admin"}
            onClick={() => setIsSidebarOpen(false)}
          />
          <NavItem
            href="/admin/usuarios"
            icon={<Users size={20} />}
            label="Usuarios"
            active={pathname === "/admin/usuarios"}
            onClick={() => setIsSidebarOpen(false)}
          />
          <NavItem
            href="/admin/colas"
            icon={<Layers size={20} />}
            label="Colas"
            active={pathname === "/admin/colas"}
            onClick={() => setIsSidebarOpen(false)}
          />
        </nav>

        <div className="p-4 border-t border-gray-100 bg-white/50 flex-shrink-0">
          <div className="flex items-center gap-3 p-3 mb-2 rounded-2xl bg-gray-50/50 border border-gray-100/50">
            <div className="w-10 h-10 rounded-xl bg-white border border-gray-200 flex items-center justify-center flex-shrink-0 text-[#8054FF]">
              <UserCircle size={24} />
            </div>
            <div className="overflow-hidden">
              <p className="text-[14px] font-bold truncate text-[#1F2937]">{user.full_name}</p>
              <p className="text-[11px] font-medium text-[#9CA3AF] uppercase tracking-wider">Administrador</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 p-3 text-[#6B7280] hover:text-red-600 hover:bg-red-50 rounded-xl transition-all font-bold text-[13px]"
          >
            <LogOut size={20} />
            Cerrar Sesión
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-grow flex flex-col min-w-0 bg-gray-50/30">
        {/* Mobile Header */}
        <header
          className="lg:hidden bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between shadow-sm sticky top-0 z-30">
          <Image src="/tuturno_logo.svg" alt="TuTurno" width={110} height={28} className="h-auto" priority />
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="p-2 hover:bg-gray-50 rounded-xl text-[#9CA3AF] hover:text-[#8054FF] transition-all"
          >
            <Menu size={24} />
          </button>
        </header>

        <div className="flex-grow p-6 sm:p-8">
          <div className="max-w-[1200px] mx-auto">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}

interface NavItemProps {
  href: string;
  icon: React.ReactNode;
  label: string;
  active: boolean;
  onClick: () => void;
}

function NavItem({ href, icon, label, active, onClick }: NavItemProps) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={`
        flex items-center gap-3 p-3 rounded-xl transition-all group relative
        ${active
          ? "bg-gradient-to-r from-[#14A1FA] to-[#8C52FF] text-white shadow-[0_4px_12px_rgba(140,82,255,0.25)]"
          : "text-[#6B7280] hover:bg-gray-100/80 hover:text-[#1F2937]"}
      `}
    >
      <div className={`${active ? "text-white" : "group-hover:text-[#8054FF]"} transition-colors flex-shrink-0`}>
        {icon}
      </div>
      <span className="text-[14px] font-bold tracking-tight">{label}</span>
    </Link>
  );
}
