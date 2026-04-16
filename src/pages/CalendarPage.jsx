// ─── CALENDAR PAGE ────────────────────────────────────────────────────────────

// import { useState } from "react";
import { STATUSES } from '../data/constants.js';
import { statusBg, statusColor } from '../utils/eventUtils.js';
import Icon from '../components/Icon.jsx';
import EventMiniCard from '../components/EventMiniCard.jsx';
import { fmtDate } from "../utils/dateUtils.js";

function CalendarPage({ events, venues, calendarDate, setCalendarDate, calendarView, setCalendarView, setModal, currentUser }) {
  const year        = calendarDate.getFullYear();
  const month       = calendarDate.getMonth();
  const firstDay    = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrev  = new Date(year, month, 0).getDate();
  const todayStr    = fmtDate(new Date());

  const cells = [];
  for (let i = firstDay - 1; i >= 0; i--)      cells.push({ day: daysInPrev - i, current: false });
  for (let i = 1; i <= daysInMonth; i++)         cells.push({ day: i, current: true });
  while (cells.length < 42)                     cells.push({ day: cells.length - firstDay - daysInMonth + 1, current: false });

  const getEventsForDay = (day, isCurrent) => {
    if (!isCurrent) return [];
    const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    return events.filter((e) => e.date === dateStr && (e.status === STATUSES.APPROVED || e.status === STATUSES.PENDING));
  };

  const monthEvents = events.filter((e) => {
    const d = new Date(e.date);
    return d.getFullYear() === year && d.getMonth() === month;
  });

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h1 style={{ fontFamily: "'Syne',sans-serif", fontSize: 26, fontWeight: 800, color: "#f1f5f9" }}>Calendar</h1>
        <div style={{ display: "flex", background: "rgba(255,255,255,0.04)", borderRadius: 10, padding: 4, gap: 2 }}>
          {["month", "week"].map((v) => (
            <button key={v} className={`btn tab${calendarView === v ? " active" : ""}`} onClick={() => setCalendarView(v)}>
              {v.charAt(0).toUpperCase() + v.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className="card" style={{ padding: 24 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <button className="btn" onClick={() => setCalendarDate(new Date(year, month - 1, 1))} style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 8, padding: "6px 12px", color: "#94a3b8" }}><Icon name="chevronLeft" size={16} /></button>
          <h2 style={{ fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: 18 }}>
            {calendarDate.toLocaleDateString("en", { month: "long", year: "numeric" })}
            <span style={{ fontSize: 12, color: "#475569", fontWeight: 400, marginLeft: 10 }}>{monthEvents.length} events</span>
          </h2>
          <button className="btn" onClick={() => setCalendarDate(new Date(year, month + 1, 1))} style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 8, padding: "6px 12px", color: "#94a3b8" }}><Icon name="chevronRight" size={16} /></button>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 4, marginBottom: 4 }}>
          {["Sun","Mon","Tue","Wed","Thu","Fri","Sat"].map((d) => (
            <div key={d} style={{ textAlign: "center", fontSize: 11, fontWeight: 600, color: "#475569", padding: "6px 0" }}>{d}</div>
          ))}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 4 }}>
          {cells.map((cell, i) => {
            const dayEvents = getEventsForDay(cell.day, cell.current);
            const isToday = cell.current && `${year}-${String(month + 1).padStart(2, "0")}-${String(cell.day).padStart(2, "0")}` === todayStr;
            return (
              <div key={i} className={`cal-day${isToday ? " today" : ""}${!cell.current ? " other-month" : ""}`}>
                <div style={{ fontSize: 12, fontWeight: isToday ? 700 : 400, color: isToday ? "#c084fc" : cell.current ? "#e2e8f0" : "#334155", marginBottom: 4 }}>{cell.day}</div>
                {dayEvents.slice(0, 2).map((ev) => (
                  <div key={ev.id} onClick={() => setModal({ type: "viewEvent", event: ev })}
                    style={{ fontSize: 9, background: statusBg(ev.status), color: statusColor(ev.status), borderRadius: 3, padding: "2px 5px", marginBottom: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", cursor: "pointer" }}>
                    {ev.title}
                  </div>
                ))}
                {dayEvents.length > 2 && <div style={{ fontSize: 9, color: "#475569" }}>+{dayEvents.length - 2} more</div>}
              </div>
            );
          })}
        </div>
      </div>

      <div className="card" style={{ padding: 24 }}>
        <h3 style={{ fontWeight: 700, fontSize: 14, marginBottom: 16 }}>This Month's Events ({monthEvents.length})</h3>
        {monthEvents.length === 0
          ? <div style={{ color: "#475569", fontSize: 13, textAlign: "center", padding: 20 }}>No events this month</div>
          : <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(280px,1fr))", gap: 12 }}>
              {monthEvents.map((ev) => <EventMiniCard key={ev.id} event={ev} onClick={() => setModal({ type: "viewEvent", event: ev })} />)}
            </div>
        }
      </div>
    </div>
  );
}

export default CalendarPage;
