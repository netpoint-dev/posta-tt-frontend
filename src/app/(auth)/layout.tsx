import Image from "next/image";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50/50 p-4 font-sans antialiased">
      <div className="w-full max-w-[400px] flex flex-col items-center py-8">
        <header className="mb-4 flex flex-col items-center select-none">
          <Image src="/posta_logo.svg" alt="P.O.S.-TA" width={160} height={40} className="mb-1 h-auto w-[140px]" priority />
          <Image src="/tuturno_logo.svg" alt="TuTurno" width={160} height={40} className="h-auto w-[140px]" priority />
        </header>
        <div className="w-full bg-white p-6 sm:p-8 rounded-[24px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100">
          {children}
        </div>
      </div>
    </main>
  );
}
