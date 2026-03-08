"use client";

import Link from "next/link";
import Image from "next/image";
import { ShieldAlert, ArrowLeft } from "lucide-react";

export default function ForbiddenPage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50/50 p-4 font-sans antialiased">
      <div className="w-full max-w-[400px] flex flex-col items-center py-8">
        <header className="mb-8 flex flex-col items-center select-none">
          <Image
            src="/posta_logo.svg"
            alt="P.O.S.-TA"
            width={160}
            height={40}
            className="mb-1 h-auto w-[140px]"
            priority
          />
          <Image
            src="/tuturno_logo.svg"
            alt="TuTurno"
            width={160}
            height={40}
            className="h-auto w-[140px]"
            priority
          />
        </header>

        <div className="w-full bg-white p-8 rounded-[24px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 text-center">
          <div className="mb-6 flex justify-center">
            <div className="p-4 bg-red-50 rounded-full text-red-500">
              <ShieldAlert size={48} />
            </div>
          </div>

          <h2 className="text-[24px] font-bold text-[#1F2937] border-none mb-2">Acceso Denegado</h2>
          <p className="text-[#6B7280] text-[15px] mb-8">
            Lo sentimos, no tenés los permisos necesarios para acceder a este recurso. (Error 403)
          </p>

          <Link
            href="/"
            className="w-full bg-gradient-to-r from-[#14A1FA] to-[#8C52FF] text-white py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 hover:opacity-90 active:scale-[0.98] transition-all shadow-md text-[15px]"
          >
            <ArrowLeft size={18} />
            Volver al Inicio
          </Link>
        </div>

        <p className="mt-8 text-center text-[13px] font-medium text-[#9CA3AF]">
          Si creés que esto es un error, contactá al administrador.
        </p>
      </div>
    </main>
  );
}
