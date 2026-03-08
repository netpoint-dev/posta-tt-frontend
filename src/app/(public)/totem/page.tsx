"use client";

import { apiFetch, getApiUrl } from "@/lib/api";
import { useEffect, useState } from "react";
import Image from "next/image";
import { Printer, ChevronRight, Zap, AlertTriangle } from "lucide-react";
import { useBarcodeScanner } from "@/lib/useBarcodeScanner";

interface Queue {
  uuid: string;
  prefix: string;
  name: string;
  description: string;
}

interface ClientInfo {
  dni: string;
  full_name: string
}

export default function TotemPage() {
  const [queues, setQueues] = useState<Queue[]>([]);
  const [selectedQueue, setSelectedQueue] = useState<Queue | null>(null);
  const [loading, setLoading] = useState(true);
  const [printing, setPrinting] = useState(false);
  const [ticketResult, setTicketResult] = useState<{ ticket_number: string } | null>(null);
  const [showWarningToast, setShowWarningToast] = useState(false);


  const scanDni = (code: string) => {
    let splitCode = code.split("@")
    let clientInfo: ClientInfo = { dni: splitCode[4], full_name: `${splitCode[1]}, ${splitCode[2]}` }
    handlePrint(clientInfo)
  }
  // Usamos el hook pasando la lógica de lo que queremos hacer
  useBarcodeScanner(scanDni);

  useEffect(() => {
    const fetchQueues = async () => {
      try {
        const res = await apiFetch("/queues");
        const data = await res.json();

        setQueues(data);
      } catch (err) {
        console.error("Failed to fetch queues", err);
      } finally {
        setLoading(false);
      }
    };

    fetchQueues();
  }, []);

  const handlePrint = async (clientInfo?: ClientInfo) => {
    if (!selectedQueue) {
      setShowWarningToast(true);
      setTimeout(() => setShowWarningToast(false), 3000);
      return;
    }

    setPrinting(true);
    let body = {
      queue_uuid: selectedQueue.uuid,
      ...(clientInfo?.dni && { dni: clientInfo.dni }),
      ...(clientInfo?.full_name && { full_name: clientInfo.full_name })
    }
    try {
      console.log(body);

      const res = await apiFetch("/tickets/", {
        method: "POST",
        body: JSON.stringify(body),
      });
      const data = await res.json();
      setTicketResult(data);
      // Reset after some time
      setTimeout(() => {
        setTicketResult(null);
        setSelectedQueue(null);
      }, 3000);
    } catch (err) {
      console.error("Failed to print ticket", err);
    } finally {
      setPrinting(false);
    }
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#F9FAFB] text-center p-8 space-y-6">
      <div className="bg-white p-6 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] animate-pulse">
        <Image src="/tuturno_logo.svg" alt="TuTurno" width={200} height={50} className="h-auto w-[160px] opacity-70" />
      </div>
      <div className="text-3xl font-bold text-[#6B7280] animate-pulse">
        Iniciando terminal...
      </div>
    </div>
  );

  if (ticketResult) return (
    <div className="flex flex-col items-center justify-center min-h-screen text-center p-12 bg-[#F9FAFB]">
      <div className="animate-[fade-in-up_0.5s_ease-out]">
        <h2 className="text-5xl font-black mb-10 text-[#6B7280] uppercase tracking-widest">Su turno es</h2>
        <div className="bg-[#EFECE6] text-[#4D4B48] text-[16rem] font-bold px-24 py-16 rounded-[64px] shadow-[0_20px_60px_rgba(128,84,255,0.15)] ring-[12px] ring-[#8054FF]/5 mb-16 leading-none flex items-center justify-center animate-[pulse_3s_ease-in-out_infinite]">
          {ticketResult.ticket_number}
        </div>
        <p className="text-4xl text-[#9CA3AF] font-bold leading-relaxed">
          Por favor, retirá tu ticket<br />y aguardá a ser llamado en el monitor.
        </p>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col min-h-screen p-12 max-w-7xl mx-auto bg-[#F9FAFB] relative">
      {/* Toast Alert */}
      <div
        className={`fixed top-20 left-1/2 transform -translate-x-1/2 z-50 transition-all duration-300 pointer-events-none ${showWarningToast
          ? "opacity-100 translate-y-0"
          : "opacity-0 -translate-y-4"
          }`}
      >
        <div className="bg-orange-100 border-l-4 border-orange-500 text-orange-700 p-4 rounded-xl shadow-2xl flex items-center gap-6">
          <AlertTriangle className="w-10 h-10 shrink-0" />
          <p className="font-bold text-3xl">Debes elegir una sección primero</p>
        </div>
      </div>

      {process.env.NODE_ENV === 'development' && (
        <button
          onClick={() => scanDni('00815727812@PEREZ@JUAN DANIEL@M@48291020@B@15/03/01@30/02/2020@20482910202')}
          className="absolute top-8 right-8 p-4 bg-yellow-100 text-yellow-500 rounded-2xl hover:bg-yellow-200 transition-all hover:scale-105 shadow-sm"
          title="Simular DNI"
        >
          <Zap size={32} />
        </button>
      )}
      <header className="mb-16 flex flex-col items-center text-center">
        <Image
          src="/tuturno_logo.svg"
          alt="TuTurno"
          width={240}
          height={60}
          className="h-auto w-[200px] p-4 mb-6"
          priority
        />
        <h1 className="text-6xl font-black text-[#1F2937] mb-4 tracking-tight">¡Bienvenido!</h1>
        <p className="text-4xl text-[#6B7280] font-medium">Seleccioná el área de atención</p>
      </header>

      <div className="grid md:grid-cols-2 gap-10 flex-grow mb-16">
        {queues.map((queue) => (
          <button
            key={queue.uuid}
            onClick={() => setSelectedQueue(queue)}
            className={`
              flex flex-col justify-center items-center text-center p-14 rounded-[40px] border-4 transition-all duration-300
              ${selectedQueue?.uuid === queue.uuid
                ? "bg-white border-[#8054FF] ring-[6px] ring-[#8054FF]/10 shadow-[0_20px_50px_rgba(128,84,255,0.2)] scale-[1.02] transform"
                : "bg-white border-transparent shadow-[0_10px_40px_rgba(0,0,0,0.03)] hover:border-[#8054FF]/20 hover:shadow-xl hover:-translate-y-1"}
            `}
          >
            <span className={`text-9xl font-black mb-6 tracking-tighter ${selectedQueue?.uuid === queue.uuid ? "text-[#1F2937]" : "text-[#4B5563]"}`}>
              {queue.prefix}
            </span>
            <span className={`text-4xl font-bold uppercase tracking-wider mb-3 ${selectedQueue?.uuid === queue.uuid ? "text-[#1F2937]" : "text-[#374151]"}`}>
              {queue.name}
            </span>
            <span className={`text-2xl mt-4 max-w-[80%] leading-snug ${selectedQueue?.uuid === queue.uuid ? "text-[#6B7280] font-bold" : "text-[#9CA3AF] font-medium"}`}>
              {queue.description}
            </span>
          </button>
        ))}
      </div>

      <footer className="h-44 flex items-center justify-center px-4">
        <button
          onClick={() => handlePrint()}
          disabled={!selectedQueue || printing}
          className={`
            w-full h-full rounded-[40px] text-[40px] font-black uppercase tracking-widest flex items-center justify-center gap-8 transition-all duration-300 transform
            ${!selectedQueue || printing
              ? "bg-[#E5E7EB] text-[#9CA3AF] cursor-not-allowed shadow-none"
              : "bg-gradient-to-r from-[#00AEEF] via-[#7B2FF7] to-[#9200E6] text-white shadow-[0_20px_50px_rgba(123,47,247,0.3)] hover:scale-[1.02] active:scale-[0.98]"
            }
          `}
        >
          {printing ? "Imprimiendo..." : (
            <>
              <Printer size={72} strokeWidth={2.5} />
              Imprimir Ticket
              <ChevronRight size={72} strokeWidth={2.5} className="ml-4 opacity-50" />
            </>
          )}
        </button>
      </footer>
    </div>
  );
}
