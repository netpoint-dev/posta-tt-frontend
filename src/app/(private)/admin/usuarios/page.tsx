"use client";

import { useEffect, useState } from "react";
import Cookies from "js-cookie";
import { UserCircle, Trash2, Edit, Check, X, ShieldAlert, RotateCcw } from "lucide-react";
import { apiFetch } from "@/lib/api";

interface User {
  uuid: string;
  username: string;
  full_name: string;
  role: "admin" | "operator";
  is_active: boolean;
}

export default function UsersAdminPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showInactive, setShowInactive] = useState(false);

  // Edit states
  const [editingUuid, setEditingUuid] = useState<string | null>(null);
  const [newRole, setNewRole] = useState<"admin" | "operator">("operator");

  const fetchUsers = async () => {
    try {
      const token = Cookies.get("access_token");
      const res = await apiFetch("/users", {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (!res.ok) throw new Error("Error cargando usuarios");
      const data = await res.json();
      setUsers(data);
    } catch (err) {
      console.error("Failed to fetch users", err);
      setError("No se pudieron cargar los usuarios.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleUpdateRole = async (uuid: string) => {
    try {
      const token = Cookies.get("access_token");
      const res = await apiFetch(`/users/${uuid}/role`, {
        method: "PATCH",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ role: newRole }),
      });

      if (res.ok) {
        setEditingUuid(null);
        fetchUsers();
      } else {
        const errorData = await res.json();
        alert(errorData.detail || "Error al actualizar rol");
      }
    } catch (err) {
      console.error("Failed to update role", err);
    }
  };

  const toggleStatus = async (uuid: string, currentStatus: boolean) => {
    const action = currentStatus ? "desactivar" : "reactivar";
    if (currentStatus && !confirm(`¿Seguro que deseas ${action} a este usuario?`)) return;

    try {
      const token = Cookies.get("access_token");
      const res = await apiFetch(`/users/${uuid}/status`, {
        method: "PATCH",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ is_active: !currentStatus }),
      });

      if (res.ok) {
        fetchUsers();
      } else {
        const errorData = await res.json();
        alert(errorData.detail || `Error al ${action} usuario`);
      }
    } catch (err) {
      console.error(`Failed to ${action} user`, err);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center py-20">
      <div className="w-8 h-8 border-4 border-[#8054FF]/20 border-t-[#8054FF] rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-8">
      <header className="flex justify-between items-end">
        <div>
          <h1 className="text-[24px] font-bold text-[#1F2937] border-none mb-0.5">Gestión de Usuarios</h1>
          <p className="text-[#6B7280] text-[14px]">Administrá el personal y sus permisos de acceso.</p>
        </div>
        <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-2xl border border-gray-100 shadow-sm">
          <label className="text-[12px] font-bold text-[#6B7280] cursor-pointer" htmlFor="showInactive">
            Mostrar inactivos
          </label>
          <input
            id="showInactive"
            type="checkbox"
            checked={showInactive}
            onChange={(e) => setShowInactive(e.target.checked)}
            className="w-4 h-4 text-[#8054FF] rounded border-gray-300 focus:ring-[#8054FF]"
          />
        </div>
      </header>

      {error && (
        <div className="bg-red-50 border border-red-100 text-red-600 p-4 rounded-2xl flex items-center gap-3">
          <ShieldAlert size={20} />
          <p className="text-sm font-bold">{error}</p>
        </div>
      )}

      <div className="bg-white rounded-[24px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 overflow-hidden flex flex-col min-h-0 pb-2">
        <div className="overflow-x-auto flex-grow">
          <table className="w-full text-left border-collapse min-w-[600px]">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-100/80">
                <th className="px-6 py-4 text-[11px] font-bold uppercase text-[#9CA3AF] tracking-widest">Usuario</th>
                <th className="px-6 py-4 text-[11px] font-bold uppercase text-[#9CA3AF] tracking-widest">Rol</th>
                <th className="px-6 py-4 text-[11px] font-bold uppercase text-[#9CA3AF] tracking-widest">Estado</th>
                <th className="px-6 py-4 text-[11px] font-bold uppercase text-[#9CA3AF] tracking-widest text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50/80">
              {users
                .filter(user => showInactive || user.is_active)
                .map(user => (
                  <tr key={user.uuid} className="group hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-gray-50 rounded-xl text-[#9CA3AF] group-hover:bg-white group-hover:text-[#8054FF] border border-transparent group-hover:border-gray-100 transition-all">
                          <UserCircle size={22} />
                        </div>
                        <div>
                          <p className="font-bold text-[14px] text-[#1F2937]">{user.full_name}</p>
                          <p className="text-[12px] font-medium text-[#9CA3AF]">@{user.username}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {editingUuid === user.uuid ? (
                        <div className="flex items-center gap-2">
                          <select
                            value={newRole}
                            onChange={(e) => setNewRole(e.target.value as "admin" | "operator")}
                            className="px-3 py-1.5 rounded-lg border border-gray-200 text-[12px] font-bold text-[#1F2937] focus:outline-none focus:border-[#8054FF]"
                          >
                            <option value="operator">Operator</option>
                            <option value="admin">Admin</option>
                          </select>
                          <button
                            onClick={() => handleUpdateRole(user.uuid)}
                            className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg"
                          >
                            <Check size={16} />
                          </button>
                          <button
                            onClick={() => setEditingUuid(null)}
                            className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg"
                          >
                            <X size={16} />
                          </button>
                        </div>
                      ) : (
                        <span className={`
                        px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider
                        ${user.role === "admin"
                            ? "bg-[#8054FF]/10 text-[#8054FF]"
                            : "bg-[#14A1FA]/10 text-[#14A1FA]"}
                      `}>
                          {user.role}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${user.is_active ? "bg-[#10B981]" : "bg-[#EF4444]"}`} />
                        <span className="text-[12px] font-bold text-[#6B7280]">{user.is_active ? "Activo" : "Inactivo"}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => {
                            setEditingUuid(user.uuid);
                            setNewRole(user.role);
                          }}
                          className="p-2.5 text-[#9CA3AF] hover:text-[#1F2937] hover:bg-white border border-transparent hover:border-gray-100 transition-all rounded-xl"
                        >
                          <Edit size={16} />
                        </button>

                        {user.is_active ? (
                          <button
                            onClick={() => toggleStatus(user.uuid, true)}
                            title="Desactivar usuario"
                            className="p-2.5 text-[#EF4444]/60 hover:text-[#EF4444] hover:bg-red-50 transition-all rounded-xl"
                          >
                            <Trash2 size={16} />
                          </button>
                        ) : (
                          <button
                            onClick={() => toggleStatus(user.uuid, false)}
                            title="Reactivar usuario"
                            className="p-2.5 text-[#10B981]/60 hover:text-[#10B981] hover:bg-green-50 transition-all rounded-xl"
                          >
                            <RotateCcw size={16} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
          {users.length === 0 && !error && (
            <div className="text-center py-20 bg-white">
              <p className="text-[#9CA3AF] font-bold italic">No se encontraron otros usuarios</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
