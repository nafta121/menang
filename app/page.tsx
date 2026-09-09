"use client";

import { useMemo, useState } from "react";

type Shift = "P" | "S" | "M" | "Mid" | "L" | "CT";
type Employee = { name: string; initials: string; role: "Senior" | "Junior"; color: string; shifts: Shift[] };

const employees: Employee[] = [
  { name: "Tunik", initials: "TU", role: "Senior", color: "purple", shifts: ["P", "S", "M", "L", "P", "S", "M"] },
  { name: "Risma", initials: "RI", role: "Senior", color: "blue", shifts: ["S", "M", "L", "P", "S", "M", "L"] },
  { name: "Dwi", initials: "DW", role: "Senior", color: "orange", shifts: ["M", "L", "P", "S", "M", "L", "P"] },
  { name: "Dinda", initials: "DI", role: "Senior", color: "rose", shifts: ["L", "P", "S", "M", "L", "P", "S"] },
  { name: "Bela", initials: "BE", role: "Junior", color: "green", shifts: ["P", "S", "L", "P", "S", "M", "L"] },
  { name: "Vina", initials: "VI", role: "Junior", color: "yellow", shifts: ["S", "L", "P", "S", "M", "L", "P"] },
  { name: "Alfi", initials: "AL", role: "Junior", color: "pink", shifts: ["M", "P", "S", "L", "P", "S", "M"] },
];
const days = ["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"];
const dates = [4, 5, 6, 7, 8, 9, 10];
const labels: Record<Shift, string> = { P: "Pagi", S: "Siang", M: "Malam", Mid: "Middle", L: "Libur", CT: "Cuti" };

export default function Home() {
  const [activeWeek, setActiveWeek] = useState(0);
  const [tab, setTab] = useState("Jadwal");
  const [selected, setSelected] = useState<{ employee: Employee; day: number; shift: Shift } | null>(null);
  const [generated, setGenerated] = useState(false);
  const shiftFilled = useMemo(() => generated ? "100%" : "94%", [generated]);

  return <main className="app-shell">
    <header className="topbar">
      <div className="brand"><div className="brand-mark">S</div><span>ShiftKu</span></div>
      <button className="icon-button" aria-label="Notifikasi"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M18 9a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4"/></svg><i /></button>
    </header>

    <section className="page-heading">
      <div><p className="eyebrow">Jadwal tim</p><h1>Selamat pagi, Admin <span>👋</span></h1></div>
      <button className="month-button">Mei 2026 <svg viewBox="0 0 24 24"><path d="m7 10 5 5 5-5"/></svg></button>
    </section>

    <section className="stats" aria-label="Ringkasan jadwal">
      <article><div className="stat-icon team"><svg viewBox="0 0 24 24"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></svg></div><div><b>7</b><span>Karyawan aktif</span></div></article>
      <article><div className="stat-icon calendar"><svg viewBox="0 0 24 24"><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M16 3v4M8 3v4M3 10h18"/></svg></div><div><b>{shiftFilled}</b><span>Shift terisi</span></div></article>
      <article><div className="stat-icon shield"><svg viewBox="0 0 24 24"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10ZM9 12l2 2 4-4"/></svg></div><div><b>0</b><span>Pelanggaran aktif</span></div></article>
    </section>

    <section className="quick-actions"><button onClick={() => setSelected({ employee: employees[0], day: 2, shift: "CT" })}><span className="action-icon purple">＋</span><span>Request<br/>Cuti</span></button><button onClick={() => setGenerated(true)}><span className="action-icon blue"><svg viewBox="0 0 24 24"><path d="M12 3v18M3 12h18"/></svg></span><span>Generate<br/>Jadwal</span></button><button><span className="action-icon gray"><svg viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8zM14 2v6h6M8 13h8M8 17h5"/></svg></span><span>Export<br/>PDF</span></button></section>

    <section className="schedule-section">
      <div className="section-title"><div><h2>Jadwal Mingguan</h2><p>4 – 10 Mei 2026</p></div><button className="view-all">Lihat semua <span>›</span></button></div>
      <div className="week-nav"><button aria-label="Minggu sebelumnya" onClick={() => setActiveWeek(Math.max(0, activeWeek - 1))}>‹</button><div><span className={activeWeek === 0 ? "active-dot" : ""}/><span className={activeWeek === 1 ? "active-dot" : ""}/><span className={activeWeek === 2 ? "active-dot" : ""}/></div><button aria-label="Minggu berikutnya" onClick={() => setActiveWeek(Math.min(2, activeWeek + 1))}>›</button></div>
      <div className="schedule-card">
        <div className="schedule-grid heading"><div>Karyawan</div>{days.map((day, i) => <div key={day} className={i > 4 ? "weekend" : ""}>{day}<small>{dates[i] + activeWeek * 7}</small></div>)}</div>
        {employees.map((employee) => <div className="schedule-grid row" key={employee.name}><div className="employee"><span className={`avatar ${employee.color}`}>{employee.initials}</span><span><b>{employee.name}</b><small>{employee.role}</small></span></div>{employee.shifts.map((shift, day) => <button aria-label={`${employee.name}, ${days[day]}, ${labels[shift]}`} onClick={() => setSelected({ employee, day, shift })} className={`shift ${shift.toLowerCase()}`} key={day}>{shift}</button>)}</div>)}
      </div>
      <div className="legend">{(["P", "S", "M", "Mid", "L", "CT"] as Shift[]).map(s => <span key={s}><i className={`legend-dot ${s.toLowerCase()}`}/>{s}</span>)}</div>
    </section>

    <section className="tip"><div className="tip-icon">✦</div><div><b>Jadwal lebih adil, tim lebih bahagia</b><p>Generate jadwal otomatis dengan aturan yang selalu terjaga.</p></div><button>×</button></section>

    <nav className="bottom-nav">{[["Jadwal", "▣"], ["Request", "▤"], ["Laporan", "◔"], ["Profil", "◯"]].map(([name, icon]) => <button className={tab === name ? "nav-active" : ""} key={name} onClick={() => setTab(name)}><span>{icon}</span>{name}</button>)}</nav>

    {selected && <div className="sheet-overlay" onClick={() => setSelected(null)}><aside className="bottom-sheet" onClick={e => e.stopPropagation()}><div className="grabber"/><button className="close-sheet" onClick={() => setSelected(null)}>×</button><p className="eyebrow">DETAIL SHIFT</p><h2>{selected.employee.name} · {days[selected.day]}, {dates[selected.day]} Mei</h2><div className={`detail-shift ${selected.shift.toLowerCase()}`}>{selected.shift}<span>{labels[selected.shift]}</span></div><p className="sheet-copy">Shift ini dapat diperbarui melalui request dan akan divalidasi otomatis.</p><button className="primary-button">Edit shift</button></aside></div>}
  </main>;
}
