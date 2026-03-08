import Image from "next/image";
import Link from "next/link";
import { Monitor, Printer, LogIn, ChevronRight } from "lucide-react";

export default function Home() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50/50 p-4 font-sans antialiased">
      <div className="w-full max-w-[600px] flex flex-col items-center py-12">
        {/* Header with Logos */}
        <header className="mb-8 flex flex-col items-center select-none gap-3">
          <Image
            src="/posta_logo.svg"
            alt="P.O.S.-TA"
            width={300}
            height={70}
            className="mb-2 h-auto w-[300px]"
            priority
          />
          <Image
            src="/tuturno_logo.svg"
            alt="TuTurno"
            width={300}
            height={70}
            className="h-auto w-[300px]"
            priority
          />
        </header>

        {/* Selection Card */}
        <div className="w-full bg-white p-8 sm:p-12 rounded-[40px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100">
          <div className="mb-8 text-center">
            <h2 className="text-4xl font-black text-[#1F2937] border-none mb-4 tracking-tight">Bienvenido</h2>
            <p className="text-xl text-[#6B7280] font-medium">Seleccioná un portal para continuar.</p>
          </div>

          <div className="space-y-4">
            <PortalOption
              href="/monitor"
              icon={<Monitor className="w-8 h-8 text-[#14A1FA]" />}
              title="Monitor"
              description="Visualización para el público"
            />
            <PortalOption
              href="/totem"
              icon={<Printer className="w-8 h-8 text-[#8C52FF]" />}
              title="Tótem"
              description="Retiro de nuevos turnos"
            />

            <div className="pt-6 mt-6 border-t border-gray-100">
              <PortalOption
                href="/login"
                icon={<LogIn className="w-8 h-8 text-[#4B5563]" />}
                title="Acceso Staff"
                description="Operadores y Administradores"
              />
            </div>
          </div>

          <div className="mt-16 pt-8 border-t border-gray-100">
            <p className="text-center text-xl font-medium text-[#9CA3AF]">
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
      className="flex items-center gap-6 p-6 rounded-3xl border-2 border-gray-100 hover:border-[#8054FF]/30 hover:bg-[#8054FF]/5 transition-all group active:scale-[0.98]"
    >
      <div className="flex items-center justify-center w-20 h-20 rounded-2xl bg-gray-50 group-hover:bg-white transition-colors">
        {icon}
      </div>
      <div className="flex-1">
        <h3 className="text-2xl font-bold text-[#374151] group-hover:text-[#1F2937] mb-2">
          {title}
        </h3>
        <p className="text-xl text-[#6B7280] font-medium leading-tight">
          {description}
        </p>
      </div>
      <ChevronRight className="w-6 h-6 text-[#9CA3AF] group-hover:text-[#8054FF] transition-colors" />
    </Link>
  );
}
