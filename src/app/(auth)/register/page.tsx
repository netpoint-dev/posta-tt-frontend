"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { UserPlus, User, Lock, Eye, EyeOff } from "lucide-react";
import { apiFetch } from "@/lib/api";

export default function RegisterPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await apiFetch("/auth/register", {
        method: "POST",
        body: JSON.stringify({ full_name: fullName, username, password }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.detail || "Error en el registro");
      }

      router.push("/login");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full">
      <div className="mb-6">
        <h2 className="text-[24px] font-bold text-[#1F2937] border-none mb-0.5">Registro</h2>
        <p className="text-[#6B7280] text-[14px]">Ingrese sus datos para crear una cuenta.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-4">
          <div>
            <label className="block text-[14px] font-bold text-[#374151] mb-1.5">Nombre Completo</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                <User className="h-[18px] w-[18px] text-[#9CA3AF]" />
              </div>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 focus:border-[#8054FF] focus:ring-4 focus:ring-[#8054FF]/10 focus:outline-none transition-all text-[#1F2937] placeholder:text-[#9CA3AF] font-medium text-[14px] bg-white"
                placeholder="Juan Pérez"
              />
            </div>
          </div>

          <div>
            <label className="block text-[14px] font-bold text-[#374151] mb-1.5">Usuario</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                <User className="h-[18px] w-[18px] text-[#9CA3AF]" />
              </div>
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 focus:border-[#8054FF] focus:ring-4 focus:ring-[#8054FF]/10 focus:outline-none transition-all text-[#1F2937] placeholder:text-[#9CA3AF] font-medium text-[14px] bg-white"
                placeholder="Usuario"
              />
            </div>
          </div>

          <div>
            <label className="block text-[14px] font-bold text-[#374151] mb-1.5">Contraseña</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                <Lock className="h-[18px] w-[18px] text-[#9CA3AF]" />
              </div>
              <input
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-gray-200 focus:border-[#8054FF] focus:ring-4 focus:ring-[#8054FF]/10 focus:outline-none transition-all text-[#1F2937] placeholder:text-[#9CA3AF] font-medium tracking-widest text-[14px] bg-white"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-[#9CA3AF] hover:text-[#4B5563] transition-colors"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
          </div>
        </div>

        {error && (
          <div className="p-3 bg-red-50 text-red-600 rounded-xl text-xs font-bold border border-red-100">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-gradient-to-r from-[#14A1FA] to-[#8C52FF] text-white py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-50 mt-4 text-[15px]"
        >
          {loading ? "Registrando..." : (
            <>
              Registrarse <UserPlus className="w-5 h-5 ml-1" />
            </>
          )}
        </button>
      </form>

      <div className="mt-6 pt-5 border-t border-gray-100">
        <Link href="/login" className="block text-center text-[14px] font-medium text-[#9CA3AF] hover:text-[#4B5563] transition-colors">
          ¿Ya tienes cuenta? <span className="text-[#8054FF] font-bold hover:underline">Inicia sesión</span>
        </Link>
      </div>
    </div>
  );
}
