"use client";

import { useEffect, useState } from "react";
import { Volume2, Clock } from "lucide-react";
import { socket } from "@/lib/socket";
import { apiFetch } from "@/lib/api";

interface Ticket {
  id: number;
  ticket_number: string;
  full_name?: string;
  queue_uuid: string;
}

interface Queue {
  uuid: string;
  name: string;
}

interface SocketTicketData {
  ticket: Ticket;
}

function LiveClock() {
  const [time, setTime] = useState<Date | null>(null);

  useEffect(() => {
    setTime(new Date());
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  if (!time) {
    // Preserve layout during SSR
    return <span className="text-[#1F2937] font-black text-2xl tracking-tight opacity-0">00:00</span>;
  }

  return (
    <span className="text-[#1F2937] font-black text-2xl tracking-tight">
      {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
    </span>
  );
}

export default function MonitorPage() {
  const [callingTickets, setCallingTickets] = useState<Ticket[]>([]);
  const [pendingTickets, setPendingTickets] = useState<Ticket[]>([]);
  const [queues, setQueues] = useState<Record<string, string>>({});

  // Track recently called tickets for blinking animation (7 seconds)
  const [recentlyCalled, setRecentlyCalled] = useState<Set<number>>(new Set());
  // Track recently completed tickets for pop-out animation
  const [recentlyCompleted, setRecentlyCompleted] = useState<Set<number>>(new Set());

  useEffect(() => {
    // Initial fetch of current state
    const fetchState = async () => {
      try {
        const [stateRes, queuesRes] = await Promise.all([
          apiFetch("/tickets/queue/state"),
          apiFetch("/queues")
        ]);

        const stateData = await stateRes.json();
        const queuesData: Queue[] = await queuesRes.json();
        const queueMap = queuesData.reduce((acc, q) => ({ ...acc, [q.uuid]: q.name }), {});
        setQueues(queueMap);
        console.log("QUEUES:", queuesData)

        setCallingTickets(stateData.calling_tickets || []);
        setPendingTickets(stateData.pending_tickets || []);
      } catch (err) {
        console.error("Failed to fetch state", err);
      }
    };

    const onConnect = () => {
      socket.emit("join_monitors");
    };

    fetchState();

    if (socket.connected) onConnect();
    socket.on("connect", onConnect);

    socket.on("ticket_called", (data: SocketTicketData | Ticket) => {
      const calledTicket = "ticket" in data ? data.ticket : data;
      setCallingTickets(prev => [calledTicket, ...prev.filter(t => t.id !== calledTicket.id)]);
      setPendingTickets(prev => prev.filter(t => t.id !== calledTicket.id));

      // Add to recently called for 7 seconds (14 blink cycles)
      setRecentlyCalled(prev => new Set(prev).add(calledTicket.id));
      setTimeout(() => {
        setRecentlyCalled(prev => {
          const next = new Set(prev);
          next.delete(calledTicket.id);
          return next;
        });
      }, 7000);
    });

    socket.on("ticket_completed", (data: SocketTicketData | Ticket) => {
      const completedTicket = "ticket" in data ? data.ticket : data;

      // Add to recently completed for animation
      setRecentlyCompleted(prev => new Set(prev).add(completedTicket.id));

      // Delay actual removal to allow animation to play
      setTimeout(() => {
        setCallingTickets(prev => prev.filter(t => t.id !== completedTicket.id));
        setRecentlyCompleted(prev => {
          const next = new Set(prev);
          next.delete(completedTicket.id);
          return next;
        });
      }, 500); // 500ms matches pop-out animation duration
    });

    socket.on("ticket_created", (data: SocketTicketData | Ticket) => {
      const newTicket = "ticket" in data ? data.ticket : data;
      setPendingTickets(prev => [...prev, newTicket]);
    });

    socket.on("announce_ticket", (data: SocketTicketData | Ticket) => {
      const announcedTicket = "ticket" in data ? data.ticket : data;

      // Add to recently called for 7 seconds (14 blink cycles) to re-trigger blink
      setRecentlyCalled(prev => new Set(prev).add(announcedTicket.id));
      setTimeout(() => {
        setRecentlyCalled(prev => {
          const next = new Set(prev);
          next.delete(announcedTicket.id);
          return next;
        });
      }, 7000);
    });

    return () => {
      socket.off("connect", onConnect);
      socket.off("ticket_called");
      socket.off("ticket_completed");
      socket.off("ticket_created");
      socket.off("announce_ticket");
    };
  }, []);

  return (
    <div className="flex flex-col h-screen bg-[#F3F4F6] font-sans relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-blue-400/10 rounded-full blur-[120px]" />
        <div className="absolute top-[40%] -right-[10%] w-[30%] h-[50%] bg-purple-400/10 rounded-full blur-[120px]" />
      </div>

      {/* Upper Third - Marquee Ticker */}
      <header className="h-20 z-20 overflow-hidden shrink-0 flex items-center bg-white/40 backdrop-blur-2xl border-b border-white/30 shadow-[0_10px_40px_rgba(0,0,0,0.03)]">
        {/* Fixed Title Label */}
        <div className="h-full bg-[#1F2937] text-white px-10 flex items-center justify-center z-30 shadow-[10px_0_30px_rgba(0,0,0,0.2)]">
          <div className="flex items-center gap-3">
            <Clock className="w-6 h-6 text-blue-400" />
            <span className="text-xl font-black uppercase tracking-[0.2em]">Próximos</span>
          </div>
        </div>

        {/* Marquee Content */}
        <div className="flex-grow relative h-full flex items-center overflow-hidden">
          {pendingTickets.length > 0 ? (
            <div className="animate-marquee flex items-center gap-16">
              {/* Copy 1 */}
              <div className="flex items-center gap-16 shrink-0">
                {pendingTickets.map((ticket, i) => (
                  <div key={`${ticket.id}-${i}`} className="flex items-center gap-4 shrink-0">
                    <span className="text-[#9CA3AF] font-black text-xs uppercase tracking-widest bg-gray-200/50 px-3 py-1 rounded-lg">
                      {queues[ticket.queue_uuid] || 'Cola'}
                    </span>
                    <span className="text-[#1F2937] font-black text-4xl tracking-tighter">
                      {ticket.ticket_number}
                    </span>
                    {ticket.full_name && (
                      <div className="text-[#6B7280] font-bold text-2xl border-l border-gray-300 pl-4 capitalize">
                        {ticket.full_name}
                      </div>
                    )}
                    <span className="text-3xl">|</span>
                  </div>
                ))}
              </div>
              {/* Copy 2 (identical for seamless loop) */}
              <div className="flex items-center gap-16 shrink-0">
                {pendingTickets.map((ticket, i) => (
                  <div key={`${ticket.id}-${i}-copy`} className="flex items-center gap-4 shrink-0">
                    <span className="text-[#9CA3AF] font-black text-xs uppercase tracking-widest bg-gray-200/50 px-3 py-1 rounded-lg">
                      {queues[ticket.queue_uuid] || 'Cola'}
                    </span>
                    <span className="text-[#1F2937] font-black text-4xl tracking-tighter">
                      {ticket.ticket_number}
                    </span>
                    {ticket.full_name && (
                      <div className="text-[#6B7280] font-bold text-2xl border-l border-gray-300 pl-4 capitalize">
                        {ticket.full_name}
                      </div>
                    )}
                    <span className="text-3xl">|</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="w-full flex justify-center items-center h-full">
              <span className="text-[#9CA3AF] text-xl font-black uppercase tracking-[0.3em] animate-pulse-soft">
                No hay turnos en espera
              </span>
            </div>
          )}
        </div>
      </header>

      {/* Main Content Area - Grid of calling tickets */}
      <main className="flex-grow px-10 py-6 z-10 overflow-hidden">
        {callingTickets.length > 0 ? (
          <div className={`grid gap-6 h-full transition-all duration-500 ${callingTickets.length === 1 ? 'grid-cols-1' :
            callingTickets.length <= 2 ? 'grid-cols-2' :
              callingTickets.length <= 4 ? 'grid-cols-2' :
                callingTickets.length <= 6 ? 'grid-cols-3' :
                  'grid-cols-4'
            }`}>
            {callingTickets.map((ticket, index) => {
              const count = callingTickets.length;
              let numSize = "text-[12vh]";
              let nameSize = "text-[4vh]";
              let cardPadding = "p-12";
              let cardGap = "gap-8";

              if (count > 1) {
                numSize = "text-[10vh]";
                nameSize = "text-[3.5vh]";
                cardPadding = "p-10";
              }
              if (count > 2) {
                numSize = "text-[8vh]";
                nameSize = "text-[3vh]";
                cardPadding = "p-8";
                cardGap = "gap-4";
              }
              if (count > 4) {
                numSize = "text-[6vh]";
                nameSize = "text-[2.5vh]";
                cardPadding = "p-6";
              }
              if (count > 6) {
                numSize = "text-[5vh]";
                nameSize = "text-[2vh]";
                cardPadding = "p-4";
              }

              const isRecentlyCalled = recentlyCalled.has(ticket.id);
              const isRecentlyCompleted = recentlyCompleted.has(ticket.id);

              const animationClass = isRecentlyCompleted
                ? "animate-pop-out"
                : isRecentlyCalled
                  ? "animate-blink-intense"
                  : "animate-[bounce-subtle_6s_ease-in-out_infinite]";

              return (
                <div
                  key={`${ticket.id}-${index}`}
                  className={`flex flex-col justify-between items-center ${cardGap} rounded-[48px] ${cardPadding} transition-all duration-500 bg-white/90 backdrop-blur-md shadow-[0_20px_50px_rgba(0,0,0,0.08)] border-2 border-white overflow-hidden ${animationClass}`}
                >
                  <div className="self-end justify-self-start bg-[#8C52FF] text-white text-xl font-black px-6 py-2 rounded-full uppercase tracking-widest shadow-lg shadow-purple-500/20 shrink-0">
                    Llamando Ahora
                  </div>

                  <div className="flex flex-col items-center justify-center gap-2 min-h-0 w-full flex-grow">
                    <span className={`font-black tracking-tighter leading-none transition-all duration-500 ${numSize} text-[#4B5563] truncate w-full text-center`}>
                      {ticket.ticket_number}
                    </span>

                    {ticket.full_name && (
                      <span className={`font-bold text-center truncate w-full tracking-tight transition-all ${nameSize} text-[#6B7280]`}>
                        {ticket.full_name}
                      </span>
                    )}
                  </div>
                  {/* Queue Badge in Grid */}
                  <span className="px-4 py-1.5 rounded-xl text-2xl font-black uppercase tracking-wider bg-[#14A1FA]/10 text-[#14A1FA] shrink-0">
                    {queues[ticket.queue_uuid] || 'Sección'}
                  </span>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-[#9CA3AF] bg-white/40 backdrop-blur-md rounded-[56px] border border-white/60 p-12">
            <div className="p-10 bg-white/80 rounded-full shadow-inner mb-8">
              <Volume2 className="w-24 h-24 opacity-30" strokeWidth={1} />
            </div>
            <h2 className="text-3xl font-black text-[#1F2937] tracking-tight mb-2">Pantalla de Espera</h2>
            <p className="text-lg font-bold opacity-60">Tu número aparecerá acá cuando seas llamado.</p>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="h-16 shrink-0 px-10 flex items-center justify-between z-10 bg-white/40 backdrop-blur-2xl border-t border-white/30">
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse shadow-[0_0_12px_rgba(34,197,94,0.5)]"></div>
        </div>
        <div className="flex flex-col">
          <LiveClock />
        </div>
      </footer>
    </div>
  );
}


