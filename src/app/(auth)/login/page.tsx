"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import Link from "next/link";
import { LogIn, User, Lock, Eye, EyeOff } from "lucide-react";
import { apiFetch } from "@/lib/api";
import { verifyAndDecodeToken } from "@/app/actions/authActions";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const token = Cookies.get("access_token");
      const userData = Cookies.get("user");

      if (token && userData) {
        try {
          const user = JSON.parse(userData);
          if (user.role === "admin") {
            router.push("/admin");
          } else {
            router.push("/operator");
          }
        } catch (e) {
          // If cookie is invalid, just stay on login page
        }
      }
    };
    checkAuth();
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await apiFetch("/auth/login", {
        method: "POST",
        body: JSON.stringify({ username, password }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.detail || "Error en el inicio de sesión");
      }

      const data = await res.json();
      Cookies.set("access_token", data.access_token, { expires: 1 });
      Cookies.set("user", JSON.stringify(data.user), { expires: 1 });

      const payload = await verifyAndDecodeToken(data.access_token);
      if (payload && payload.role === "admin") {
        router.push("/admin");
      } else {
        router.push("/operator");
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full">
      <div className="mb-6">
        <h2 className="text-[24px] font-bold text-[#1F2937] border-none mb-0.5">Bienvenido</h2>
        <p className="text-[#6B7280] text-[14px]">Ingresá tus credenciales para acceder.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-4">
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
          {loading ? "Iniciando..." : (
            <>
              Iniciar Sesión <LogIn className="w-5 h-5 ml-1" />
            </>
          )}
        </button>
      </form>

      <div className="mt-6 pt-5 border-t border-gray-100 space-y-3">
        <div className="text-center text-[14px] font-medium text-[#9CA3AF]">
          <span>
            ¿No tenés una cuenta?{" "}
          </span>
          <Link href="/register" className="hover:text-[#4B5563] transition-colors">
            <span className="text-[#8054FF] font-bold hover:underline">Registrarse</span>
          </Link>
        </div>
        <p className="text-center text-[12px] font-medium text-[#9CA3AF]">
          Si olvidaste tu contraseña, contactá con un administrador.
        </p>
      </div>
    </div>
  );
}
