import Image from "next/image";
import Link from "next/link";
import { Monitor, Printer, LogIn, ChevronRight } from "lucide-react";

export default function Home() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50/50 p-4 font-sans antialiased">
      <div className="w-full max-w-[400px] flex flex-col items-center py-8">
        {/* Header with Logos */}
        <header className="mb-4 flex flex-col items-center select-none">
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

        {/* Selection Card */}
        <div className="w-full bg-white p-6 sm:p-8 rounded-[24px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100">
          <div className="mb-6 text-center sm:text-left">
            <h2 className="text-[24px] font-bold text-[#1F2937] border-none mb-0.5">Bienvenido</h2>
            <p className="text-[#6B7280] text-[14px]">Seleccione un portal para continuar.</p>
          </div>

          <div className="space-y-3">
            <PortalOption 
              href="/monitor" 
              icon={<Monitor className="w-5 h-5 text-[#14A1FA]" />} 
              title="Monitor" 
              description="Visualización para el público"
            />
            <PortalOption 
              href="/totem" 
              icon={<Printer className="w-5 h-5 text-[#8C52FF]" />} 
              title="Tótem" 
              description="Retiro de nuevos turnos"
            />
            
            <div className="pt-3 mt-3 border-t border-gray-100">
              <PortalOption 
                href="/login" 
                icon={<LogIn className="w-5 h-5 text-[#4B5563]" />} 
                title="Acceso Staff" 
                description="Operadores y Administradores"
              />
            </div>
          </div>

          <div className="mt-8 pt-4 border-t border-gray-100">
            <p className="text-center text-[12px] font-medium text-[#9CA3AF]">
              Sistema de Gestión de Turnos • v1.0
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}

function PortalOption({ href, icon, title, description }: { 
  href: string; 
  icon: React.ReactNode; 
  title: string; 
  description: string;
}) {
  return (
    <Link 
      href={href}
      className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 hover:border-[#8054FF]/30 hover:bg-[#8054FF]/5 transition-all group active:scale-[0.98]"
    >
      <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-gray-50 group-hover:bg-white transition-colors">
        {icon}
      </div>
      <div className="flex-1">
        <h3 className="text-[15px] font-bold text-[#374151] group-hover:text-[#1F2937]">
          {title}
        </h3>
        <p className="text-[12px] text-[#6B7280] leading-tight">
          {description}
        </p>
      </div>
      <ChevronRight className="w-4 h-4 text-[#9CA3AF] group-hover:text-[#8054FF] transition-colors" />
    </Link>
  );
}
