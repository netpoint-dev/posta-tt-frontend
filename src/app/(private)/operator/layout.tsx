"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import Image from "next/image";
import {
  UserCircle,
  LogOut,
} from "lucide-react";

interface User {
  full_name: string;
  role: string;
}

export default function OperatorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);

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

      // RBAC: Solo operadores (y administradores pueden entrar para supervisar)
      if (parsedUser.role !== "operator" && parsedUser.role !== "admin") {
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

  if (!user || (user.role !== "operator" && user.role !== "admin")) return null;

  return (
    <div className="flex min-h-screen bg-gray-50/50 text-[#1F2937] font-sans antialiased">
      <div className="flex-grow flex flex-col min-w-0 bg-gray-50/30">
        {/* Horizontal Navbar para Operadores */}
        <header className="bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between shadow-sm sticky top-0 z-30">
          <div className="flex items-center gap-4">
            <Image 
              src="/tuturno_logo.svg" 
              alt="TuTurno" 
              width={110} 
              height={28} 
              className="h-auto" 
              priority 
            />
            <div className="h-6 w-[1px] bg-gray-200 hidden sm:block" />
            <span className="text-[12px] font-bold text-[#9CA3AF] uppercase tracking-widest hidden sm:block">
              Panel de Operador
            </span>
          </div>

          <div className="flex items-center gap-3 sm:gap-6">
            <div className="flex items-center gap-2 sm:gap-3 px-3 py-1.5 sm:px-4 sm:py-2 bg-gray-50 rounded-xl border border-gray-100/50">
              <UserCircle size={20} className="text-[#8054FF]" />
              <div className="hidden xs:block">
                <p className="text-[13px] font-bold text-[#374151] leading-none">
                  {user.full_name}
                </p>
                <p className="text-[10px] font-medium text-[#9CA3AF] uppercase tracking-wider mt-0.5">
                  {user.role === "admin" ? "Administrador" : "Operador"}
                </p>
              </div>
            </div>
            
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-3 py-2 text-[#6B7280] hover:text-red-600 hover:bg-red-50 rounded-xl transition-all font-bold text-[13px]"
              title="Cerrar Sesión"
            >
              <LogOut size={20} />
              <span className="hidden md:inline">Salir</span>
            </button>
          </div>
        </header>

        {/* Contenido Principal con mayor ancho */}
        <div className="flex-grow p-4 sm:p-6 lg:p-8">
          <div className="max-w-[1400px] mx-auto">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
