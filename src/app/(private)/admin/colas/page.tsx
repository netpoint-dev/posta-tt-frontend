"use client";

import { useEffect, useState } from "react";
import Cookies from "js-cookie";
import { Plus, Trash2, Layers, Clock } from "lucide-react";
import { apiFetch } from "@/lib/api";

interface Queue {
  uuid: string;
  prefix: string;
  name: string;
  description: string;
  estimated_time_per_ticket?: number;
}

export default function QueuesAdminPage() {
  const [queues, setQueues] = useState<Queue[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Form states
  const [newPrefix, setNewPrefix] = useState("");
  const [newName, setNewName] = useState("");
  const [newDesc, setNewDesc] = useState("");

  const fetchQueues = async () => {
    try {
      const token = Cookies.get("access_token");
      const res = await apiFetch("/queues", {
        headers: { "Authorization": `Bearer ${token}` }
      });
      const data = await res.json();
      setQueues(data);
    } catch (err) {
      console.error("Failed to fetch queues", err);
      setError("Error cargando las colas");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQueues();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = Cookies.get("access_token");
      const res = await apiFetch("/queues", {
        method: "POST",
        headers: { 
          "Authorization": `Bearer ${token}` 
        },
        body: JSON.stringify({
          prefix: newPrefix,
          name: newName,
          description: newDesc,
        }),
      });
      if (res.ok) {
        setNewPrefix("");
        setNewName("");
        setNewDesc("");
        fetchQueues();
      }
    } catch (err) {
      console.error("Failed to create queue", err);
    }
  };

  const handleDelete = async (uuid: string) => {
    if (!confirm("¿Seguro que quieres borrar esta cola?")) return;
    try {
      const token = Cookies.get("access_token");
      await apiFetch(`/queues/${uuid}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` }
      });
      fetchQueues();
    } catch (err) {
      console.error("Failed to delete queue", err);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center py-20">
      <div className="w-8 h-8 border-4 border-[#8054FF]/20 border-t-[#8054FF] rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-8">
      <header>
        <h1 className="text-[24px] font-bold text-[#1F2937] border-none mb-0.5">Gestión de Colas</h1>
        <p className="text-[#6B7280] text-[14px]">Administra las secciones y prefijos de atención.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* New Queue Form */}
        <section className="lg:col-span-4">
          <form onSubmit={handleCreate} className="bg-white p-6 rounded-[24px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 space-y-4">
            <h2 className="text-[16px] font-bold text-[#1F2937] mb-4 flex items-center gap-2">
              <Plus size={18} className="text-[#14A1FA]" /> Nueva Sección
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-[14px] font-bold text-[#374151] mb-1.5">Prefijo (Letra)</label>
                <input
                  type="text"
                  required
                  maxLength={1}
                  value={newPrefix}
                  onChange={(e) => setNewPrefix(e.target.value.toUpperCase())}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-[#8054FF] focus:ring-4 focus:ring-[#8054FF]/10 focus:outline-none transition-all text-[#1F2937] font-bold uppercase text-[14px]"
                  placeholder="Ej: A"
                />
              </div>
              <div>
                <label className="block text-[14px] font-bold text-[#374151] mb-1.5">Nombre</label>
                <input
                  type="text"
                  required
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-[#8054FF] focus:ring-4 focus:ring-[#8054FF]/10 focus:outline-none transition-all text-[#1F2937] font-medium text-[14px]"
                  placeholder="Ej: Caja"
                />
              </div>
              <div>
                <label className="block text-[14px] font-bold text-[#374151] mb-1.5">Descripción</label>
                <textarea
                  required
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-[#8054FF] focus:ring-4 focus:ring-[#8054FF]/10 focus:outline-none transition-all text-[#1F2937] font-medium text-[14px] min-h-[100px] resize-none"
                  placeholder="Ej: Atención general a clientes"
                />
              </div>
            </div>
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-[#14A1FA] to-[#8C52FF] text-white py-3.5 rounded-xl font-bold hover:opacity-90 active:scale-[0.98] transition-all shadow-md text-[15px]"
            >
              Crear Sección
            </button>
          </form>
        </section>

        {/* Queues List */}
        <section className="lg:col-span-8 overflow-y-auto pr-2 custom-scrollbar">
          <div className="grid grid-cols-1 gap-4">
            {queues.map((queue) => (
              <div key={queue.uuid} className="bg-white p-5 rounded-[24px] shadow-[0_4px_20px_rgba(0,0,0,0.02)] border border-gray-100 flex items-center justify-between group hover:border-[#8054FF]/30 transition-all">
                <div className="flex items-center gap-5">
                  <div className="text-[32px] font-black bg-gray-50 text-[#9CA3AF] w-20 h-20 flex items-center justify-center rounded-[20px] group-hover:bg-[#1F2937] group-hover:text-white transition-all border border-gray-100/50">
                    {queue.prefix}
                  </div>
                  <div>
                    <h3 className="text-[17px] font-bold text-[#1F2937] group-hover:text-[#8054FF] transition-colors">{queue.name}</h3>
                    <p className="text-[13px] font-medium text-[#6B7280] mb-2">{queue.description}</p>
                    <div className="flex items-center gap-4">
                      <span className="flex items-center gap-1.5 text-[11px] font-bold text-[#9CA3AF] uppercase tracking-wider bg-gray-50 px-2 py-1 rounded-lg">
                        <Clock size={12} className="text-[#14A1FA]" /> {queue.estimated_time_per_ticket || "---"}s est.
                      </span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => handleDelete(queue.uuid)}
                  className="p-3 text-[#9CA3AF] hover:text-[#EF4444] hover:bg-red-50 rounded-xl transition-all"
                >
                  <Trash2 size={20} />
                </button>
              </div>
            ))}
            {queues.length === 0 && (
              <div className="text-center py-20 bg-white rounded-[24px] border border-gray-100 shadow-[0_4px_20px_rgba(0,0,0,0.02)]">
                <p className="text-[#9CA3AF] font-bold">No hay colas configuradas</p>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
