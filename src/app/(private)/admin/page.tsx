"use client";

import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line
} from "recharts";
import { Users, Layers, Ticket, TrendingUp } from "lucide-react";

// Mock Data for statistics
const hourlyData = [
  { hour: "08:00", tickets: 12 },
  { hour: "09:00", tickets: 25 },
  { hour: "10:00", tickets: 45 },
  { hour: "11:00", tickets: 38 },
  { hour: "12:00", tickets: 20 },
  { hour: "13:00", tickets: 15 },
  { hour: "14:00", tickets: 30 },
  { hour: "15:00", tickets: 40 },
  { hour: "16:00", tickets: 22 },
];

const dailyData = [
  { day: "Lun", count: 120 },
  { day: "Mar", count: 150 },
  { day: "Mie", count: 180 },
  { day: "Jue", count: 140 },
  { day: "Vie", count: 160 },
  { day: "Sab", count: 90 },
];

export default function AdminDashboard() {
  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-8">
      <header>
        <h1 className="text-[24px] font-bold text-[#1F2937] border-none mb-0.5">Dashboard General</h1>
        <p className="text-[#6B7280] text-[14px]">Resumen de actividad y demanda en tiempo real.</p>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 flex-shrink-0">
        <StatCard icon={<Ticket className="text-[#14A1FA]" />} label="Turnos Hoy" value="245" change="+12%" />
        <StatCard icon={<Users className="text-[#10B981]" />} label="Operadores" value="8/12" />
        <StatCard icon={<Layers className="text-[#F59E0B]" />} label="Colas Activas" value="5" />
        <StatCard icon={<TrendingUp className="text-[#8054FF]" />} label="Demanda Pico" value="10:30hs" />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 flex-grow min-h-0 pb-4">
        <div className="bg-white p-6 rounded-[24px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 flex flex-col">
          <h2 className="text-[15px] font-bold text-[#1F2937] mb-6 flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-[#14A1FA]" />
            Demanda por Hora
          </h2>
          <div className="flex-grow min-h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={hourlyData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                <XAxis dataKey="hour" axisLine={false} tickLine={false} tick={{fontSize: 11, fontWeight: 600, fill: '#9CA3AF'}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fontSize: 11, fontWeight: 600, fill: '#9CA3AF'}} />
                <Tooltip 
                  cursor={{fill: '#f9fafb'}} 
                  contentStyle={{
                    borderRadius: '16px', 
                    border: '1px solid #f3f4f6', 
                    boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.05)',
                    fontSize: '12px',
                    fontWeight: 'bold'
                  }} 
                />
                <Bar dataKey="tickets" fill="url(#colorTickets)" radius={[6, 6, 0, 0]} />
                <defs>
                  <linearGradient id="colorTickets" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#14A1FA" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#8054FF" stopOpacity={0.8}/>
                  </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-[24px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 flex flex-col">
          <h2 className="text-[15px] font-bold text-[#1F2937] mb-6 flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-[#8054FF]" />
            Volumen Semanal
          </h2>
          <div className="flex-grow min-h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={dailyData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{fontSize: 11, fontWeight: 600, fill: '#9CA3AF'}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fontSize: 11, fontWeight: 600, fill: '#9CA3AF'}} />
                <Tooltip 
                  contentStyle={{
                    borderRadius: '16px', 
                    border: '1px solid #f3f4f6', 
                    boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.05)',
                    fontSize: '12px',
                    fontWeight: 'bold'
                  }} 
                />
                <Line 
                  type="monotone" 
                  dataKey="count" 
                  stroke="#8054FF" 
                  strokeWidth={4} 
                  dot={{r: 4, fill: '#fff', strokeWidth: 2, stroke: '#8054FF'}} 
                  activeDot={{r: 6, fill: '#8054FF', stroke: '#fff', strokeWidth: 2}} 
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, change }: any) {
  return (
    <div className="bg-white p-5 rounded-[20px] shadow-[0_4px_20px_rgba(0,0,0,0.02)] border border-gray-100 flex items-center justify-between group hover:border-[#8054FF]/30 transition-all">
      <div className="space-y-1">
        <p className="text-[11px] font-bold uppercase text-[#9CA3AF] tracking-wider">{label}</p>
        <p className="text-[26px] font-bold text-[#1F2937] leading-none">{value}</p>
        {change && (
          <div className="flex items-center gap-1">
            <span className="text-[10px] font-bold text-[#10B981] bg-[#10B981]/10 px-1.5 py-0.5 rounded-md">{change}</span>
            <span className="text-[10px] font-medium text-[#9CA3AF]">vs ayer</span>
          </div>
        )}
      </div>
      <div className="p-3.5 bg-gray-50 rounded-xl group-hover:bg-[#8054FF]/5 group-hover:text-[#8054FF] transition-colors">
        {icon}
      </div>
    </div>
  );
}
