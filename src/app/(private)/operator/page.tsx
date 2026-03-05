"use client";

import { useEffect, useState } from "react";
import { socket } from "@/lib/socket";
import Cookies from "js-cookie";
import { apiFetch } from "@/lib/api";
import {
  Bell,
  CheckCircle2,
  ArrowRightCircle,
  Layers,
  History,
  Clock,
  ChevronDown
} from "lucide-react";

interface Ticket {
  id: number;
  ticket_number: string;
  queue_uuid: string;
  status: string;
  full_name?: string;
  dni?: string;
  created_at: string;
}

interface Queue {
  uuid: string;
  prefix: string;
  name: string;
}

export default function OperatorPage() {
  const [currentTicket, setCurrentTicket] = useState<Ticket | null>(null);
  const [availableQueues, setAvailableQueues] = useState<Queue[]>([]);
  const [selectedQueues, setSelectedQueues] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [calling, setCalling] = useState(false);
  
  // History State
  const [history, setHistory] = useState<Ticket[]>([]);
  const [historyCursor, setHistoryCursor] = useState<string | null>(null);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [hasMoreHistory, setHasMoreHistory] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = Cookies.get("access_token");
        const userData = Cookies.get("user");
        
        if (userData) {
          const user = JSON.parse(userData);
          socket.emit("join_operator", { operator_uuid: user.uuid });
        }

        const [queuesRes, historyRes] = await Promise.all([
          apiFetch("/queues", { headers: { "Authorization": `Bearer ${token}` } }),
          apiFetch("/tickets/history?limit=5", { headers: { "Authorization": `Bearer ${token}` } })
        ]);
        
        const queuesData = await queuesRes.json();
        const historyData = await historyRes.json();
        
        setAvailableQueues(queuesData);
        setSelectedQueues(queuesData.map((q: any) => q.uuid));
        
        setHistory(historyData.items);
        setHistoryCursor(historyData.next_cursor);
        setHasMoreHistory(!!historyData.next_cursor);
      } catch (err) {
        console.error("Failed to fetch initial data", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    const handleTicketCompleted = (ticket: Ticket) => {
      setHistory(prev => [ticket, ...prev]);
    };

    socket.on("ticket_completed", handleTicketCompleted);

    return () => {
      socket.off("ticket_completed", handleTicketCompleted);
    };
  }, []);

  const fetchMoreHistory = async () => {
    if (loadingHistory || !hasMoreHistory || !historyCursor) return;
    
    setLoadingHistory(true);
    try {
      const token = Cookies.get("access_token");
      const res = await apiFetch(`/tickets/history?limit=5&cursor=${historyCursor}`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      const data = await res.json();
      
      setHistory(prev => [...prev, ...data.items]);
      setHistoryCursor(data.next_cursor);
      setHasMoreHistory(!!data.next_cursor);
    } catch (err) {
      console.error("Failed to fetch more history", err);
    } finally {
      setLoadingHistory(false);
    }
  };

  const handleCallNext = async () => {
    if (selectedQueues.length === 0) return;
    setCalling(true);
    try {
      const token = Cookies.get("access_token");
      const res = await apiFetch("/tickets/call", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ queue_uuids: selectedQueues }),
      });
      const data = await res.json();
      setCurrentTicket(data);
    } catch (err) {
      console.error("Failed to call next ticket", err);
    } finally {
      setCalling(false);
    }
  };

  const handleAnnounce = () => {
    if (!currentTicket) return;
    socket.emit("announce_ticket", { ticket: currentTicket });
  };

  const handleComplete = async () => {
    if (!currentTicket) return;
    try {
      const token = Cookies.get("access_token");
      await apiFetch(`/tickets/${currentTicket.id}/complete`, {
        method: "POST",
        headers: { "Authorization": `Bearer ${token}` }
      });
      setCurrentTicket(null);
    } catch (err) {
      console.error("Failed to complete ticket", err);
    }
  };

  const toggleQueue = (uuid: string) => {
    setSelectedQueues(prev =>
      prev.includes(uuid) ? prev.filter(q => q !== uuid) : [...prev, uuid]
    );
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-[#6B7280] space-y-4">
      <div className="animate-pulse flex items-center gap-3">
        <Layers size={24} className="text-[#9CA3AF]" />
        <span className="text-xl font-bold">Cargando panel...</span>
      </div>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6 font-sans">
      <div className="lg:col-span-2 space-y-6">
        {/* Queue Selection */}
        <section className="bg-white p-5 rounded-[24px] shadow-[0_8px_30px_rgb(0,0,0,0.02)] border border-gray-100">
          <header className="flex items-center gap-2.5 mb-4 text-[#1F2937]">
            <div className="bg-gray-50 p-2 rounded-xl text-[#9CA3AF]">
              <Layers size={18} />
            </div>
            <h2 className="text-[16px] font-bold">Mis Secciones</h2>
          </header>
          <div className="flex flex-wrap gap-2">
            {availableQueues.map(queue => (
              <button
                key={queue.uuid}
                onClick={() => toggleQueue(queue.uuid)}
                className={`
                  px-4 py-2 rounded-xl text-[13px] font-bold transition-all duration-300 border
                  ${selectedQueues.includes(queue.uuid)
                    ? "bg-[#8054FF]/10 text-[#8054FF] border-[#8054FF]/20 ring-2 ring-[#8054FF]/5 shadow-sm"
                    : "bg-white text-[#6B7280] border-gray-100 hover:border-gray-200 hover:bg-gray-50"}
                `}
              >
                {queue.prefix} - {queue.name}
              </button>
            ))}
          </div>
        </section>

        {/* Main Control Area */}
        <div className="flex flex-col items-center justify-center p-6 sm:p-10 bg-white rounded-[32px] shadow-[0_8px_30px_rgb(0,0,0,0.03)] border border-gray-100 min-h-[380px]">
          {currentTicket ? (
            <div className="w-full flex flex-col md:flex-row items-center justify-between gap-8 bg-gray-50/50 rounded-[28px] p-8 border border-gray-100/50">
              <div className="flex flex-col">
                <h2 className="text-[14px] font-bold text-[#9CA3AF] mb-1 uppercase tracking-wider">Atendiendo Turno</h2>
                <div className="text-6xl lg:text-8xl font-black text-[#1F2937] leading-none tracking-tighter">
                  {currentTicket.ticket_number}
                </div>

                {(currentTicket.full_name || currentTicket.dni) && (
                  <div className="mt-4 flex flex-col gap-0.5 text-[#374151] border-t border-gray-100/80 pt-4">
                    {currentTicket.full_name && (
                      <span className="text-2xl font-bold capitalize tracking-tight">{currentTicket.full_name}</span>
                    )}
                    {currentTicket.dni && (
                      <span className="text-[14px] font-medium text-[#9CA3AF] uppercase tracking-widest">DNI: {currentTicket.dni}</span>
                    )}
                  </div>
                )}
              </div>

              <div className="flex flex-col gap-3 w-full max-w-[240px] shrink-0">
                <button
                  onClick={handleAnnounce}
                  className="w-full bg-white border border-gray-200 text-[#4B5563] py-3 rounded-xl font-bold text-[14px] flex items-center justify-center gap-2.5 hover:bg-gray-50 hover:text-[#1F2937] active:scale-[0.98] transition-all shadow-sm"
                >
                  <Bell size={18} className="text-[#9CA3AF]" />
                  Llamar de nuevo
                </button>
                <button
                  onClick={handleComplete}
                  className="w-full bg-gradient-to-r from-[#14A1FA] to-[#8C52FF] text-white py-4 rounded-xl font-bold text-[15px] flex items-center justify-center gap-2.5 hover:opacity-90 active:scale-[0.98] transition-all shadow-[0_8px_20px_rgba(140,82,255,0.2)]"
                >
                  <CheckCircle2 size={20} />
                  Finalizado
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 w-full max-w-md">
              <div className="p-6 bg-gray-50 rounded-full inline-flex items-center justify-center text-[#D1D5DB]">
                <ArrowRightCircle size={60} strokeWidth={1.5} />
              </div>
              <div className="space-y-1">
                <h2 className="text-2xl font-bold text-[#1F2937]">Panel de Espera</h2>
                <p className="text-[#6B7280] font-medium text-[15px]">Selecciona tus secciones y llama al siguiente.</p>
              </div>
              <div className="space-y-3">
                <button
                  onClick={handleCallNext}
                  disabled={calling || selectedQueues.length === 0}
                  className={`
                    w-full py-4 rounded-xl font-bold text-[16px] flex items-center justify-center transition-all duration-300
                    ${calling || selectedQueues.length === 0
                      ? "bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200"
                      : "bg-gradient-to-r from-[#14A1FA] to-[#8C52FF] text-white hover:opacity-90 shadow-lg shadow-blue-500/10 active:scale-[0.98]"}
                  `}
                >
                  {calling ? "Llamando..." : "Siguiente Turno"}
                </button>
                {selectedQueues.length === 0 && (
                  <p className="text-[12px] text-[#EF4444] font-bold uppercase tracking-wider">Debe seleccionar al menos una sección.</p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* History Section */}
      <aside className="lg:col-span-1">
        <div className="bg-white rounded-[24px] shadow-[0_8px_30px_rgb(0,0,0,0.02)] border border-gray-100 flex flex-col h-full max-h-[500px]">
          <header className="p-4 border-b border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-2.5 text-[#1F2937]">
              <div className="bg-gray-50 p-2 rounded-xl text-[#9CA3AF]">
                <History size={18} />
              </div>
              <h2 className="text-[15px] font-bold">Historial</h2>
            </div>
            <span className="bg-gray-50 text-[#9CA3AF] text-[10px] font-bold px-2 py-1 rounded-lg uppercase tracking-wider">
              Hoy
            </span>
          </header>

          <div className="flex-grow overflow-y-auto p-3 custom-scrollbar">
            {history.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <div className="bg-gray-50 p-3 rounded-full text-[#D1D5DB] mb-2">
                  <Clock size={28} strokeWidth={1.5} />
                </div>
                <p className="text-[#9CA3AF] text-[13px] font-medium px-4">No has atendido turnos todavía.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {history.map((ticket) => (
                  <div 
                    key={ticket.id} 
                    className="p-3 bg-gray-50/50 rounded-xl border border-gray-100 hover:border-gray-200 transition-all group"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[16px] font-black text-[#1F2937] tracking-tight">
                        {ticket.ticket_number}
                      </span>
                      <span className="text-[10px] font-bold text-[#9CA3AF] bg-white px-1.5 py-0.5 rounded-md border border-gray-100">
                        {new Date(ticket.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    {ticket.full_name && (
                      <p className="text-[12px] font-bold text-[#4B5563] truncate capitalize">{ticket.full_name}</p>
                    )}
                    {ticket.dni && (
                      <p className="text-[10px] font-medium text-[#9CA3AF] uppercase tracking-widest mt-0.5">DNI: {ticket.dni}</p>
                    )}
                  </div>
                ))}
                
                {hasMoreHistory && (
                  <button
                    onClick={fetchMoreHistory}
                    disabled={loadingHistory}
                    className="w-full py-2 flex items-center justify-center gap-2 text-[#8054FF] text-[12px] font-bold hover:bg-[#8054FF]/5 rounded-lg transition-all"
                  >
                    {loadingHistory ? (
                      <div className="w-3 h-3 border-2 border-[#8054FF]/30 border-t-[#8054FF] rounded-full animate-spin" />
                    ) : (
                      <>
                        Cargar más <ChevronDown size={14} />
                      </>
                    )}
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </aside>
    </div>
  );
}
