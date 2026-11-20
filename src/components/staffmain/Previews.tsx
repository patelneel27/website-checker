"use client";


import { motion } from "motion/react";
import type { FeatureId } from "@/config/staffmain";

// Drawn previews in StaffMain's own look, used for a feature without a real screenshot.

/** Drawn stand-in for a StaffMain screen that has no real screenshot yet. */
export function StaffmainPreview({ id }: { id: FeatureId }) {
  const P: Record<FeatureId, () => React.ReactNode> = { attendance: Attendance, rota: Rota, leave: Leave, records: Records, expenses: Expenses, reports: Attendance };
  const C = P[id];
  return <div className="absolute inset-0 p-6 font-sans text-[15px] text-[#1F2430]">{C()}</div>;
}

const Pill = ({ tone, children }: { tone: "green" | "amber" | "red" | "grey" | "blue"; children: React.ReactNode }) => {
  const c = {
    green: "bg-[#E7F8EE] text-[#067A3E]",
    amber: "bg-[#FFF4E0] text-[#A35400]",
    red: "bg-[#FDECEC] text-[#C4140A]",
    grey: "bg-[#F1F2F5] text-[#5B6275]",
    blue: "bg-[#EAF1FF] text-[#1362FB]",
  }[tone];
  return <span className={`rounded-full px-2.5 py-0.5 text-[13px] font-semibold ${c}`}>{children}</span>;
};

const Avatar = ({ initials, hue }: { initials: string; hue: number }) => (
  <span
    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[13px] font-bold text-white"
    style={{ background: `hsl(${hue} 65% 55%)` }}
  >
    {initials}
  </span>
);

const Row = ({ i, children }: { i: number; children: React.ReactNode }) => (
  <motion.div
    initial={{ opacity: 0, y: 8 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: 0.15 + i * 0.07 }}
    className="flex items-center gap-3 border-b border-black/5 py-2.5"
  >
    {children}
  </motion.div>
);

function Attendance() {
  const sites = [
    { name: "London", in: 12, of: 14 },
    { name: "Manchester", in: 8, of: 9 },
    { name: "Leeds", in: 5, of: 6 },
  ];
  const people = [
    { n: "Amira Khan", i: "AK", h: 150, site: "London", how: "QR", status: <Pill tone="green">In · 08:52</Pill> },
    { n: "Tom Fielding", i: "TF", h: 210, site: "Manchester", how: "NFC", status: <Pill tone="green">In · 08:57</Pill> },
    { n: "Priya Shah", i: "PS", h: 330, site: "London", how: "Location", status: <Pill tone="amber">Late · 09:14</Pill> },
    { n: "Dan Morris", i: "DM", h: 30, site: "Leeds", how: "–", status: <Pill tone="red">Missed</Pill> },
    { n: "Ella Brooks", i: "EB", h: 270, site: "Manchester", how: "–", status: <Pill tone="grey">On leave</Pill> },
  ];
  return (
    <>
      <div className="flex items-center justify-between">
        <p className="text-lg font-bold">Live attendance · Today</p>
        <span className="flex items-center gap-2 text-[13px] font-semibold text-[#067A3E]">
          <span className="h-2 w-2 animate-pulse rounded-full bg-[#0CCE6B]" /> Live
        </span>
      </div>
      <div className="mt-3 grid grid-cols-3 gap-3">
        {sites.map((s) => (
          <div key={s.name} className="rounded-xl border border-black/5 bg-[#F8F9FB] p-3">
            <p className="text-[13px] text-[#5B6275]">{s.name}</p>
            <p className="text-xl font-bold">
              {s.in}
              <span className="text-[14px] font-medium text-[#5B6275]"> / {s.of} in</span>
            </p>
          </div>
        ))}
      </div>
      <div className="mt-2">
        {people.map((p, i) => (
          <Row key={p.n} i={i}>
            <Avatar initials={p.i} hue={p.h} />
            <span className="flex-1 font-semibold">{p.n}</span>
            <span className="w-28 text-[13px] text-[#5B6275]">{p.site}</span>
            <span className="w-20 text-[13px] text-[#5B6275]">{p.how}</span>
            <span className="w-28 text-right">{p.status}</span>
          </Row>
        ))}
      </div>
    </>
  );
}

function Rota() {
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const staff = [
    { n: "Amira", shifts: ["9–5", "9–5", "", "9–5", "9–5", "", ""], c: "#DCE8FF" },
    { n: "Tom", shifts: ["", "12–8", "12–8", "12–8", "", "10–4", ""], c: "#E7F8EE" },
    { n: "Priya", shifts: ["7–3", "7–3", "7–3", "", "", "", "10–4"], c: "#FFF1D6" },
    { n: "Dan", shifts: ["", "", "2–10", "2–10", "2–10", "2–10", ""], c: "#F3E8FF" },
    { n: "Ella", shifts: ["9–5", "", "9–5", "", "9–5", "", ""], c: "#DCE8FF" },
  ];
  return (
    <>
      <div className="flex items-center justify-between">
        <p className="text-lg font-bold">Weekly rota · 19–25 May</p>
        <span className="rounded-lg bg-[#16181D] px-3 py-1.5 text-[13px] font-semibold text-white">Copy last week</span>
      </div>
      <div className="mt-4 grid grid-cols-[5rem_repeat(7,1fr)] gap-1.5 text-center">
        <span />
        {days.map((d) => (
          <span key={d} className="text-[13px] font-semibold text-[#5B6275]">
            {d}
          </span>
        ))}
        {staff.map((s, r) => (
          <div key={s.n} className="contents">
            <span className="flex items-center text-left font-semibold">{s.n}</span>
            {s.shifts.map((sh, c) => (
              <motion.span
                key={c}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 + (r * 7 + c) * 0.02 }}
                className="flex h-11 items-center justify-center rounded-lg text-[13px] font-semibold"
                style={{ background: sh ? s.c : "#F6F7F9", color: sh ? "#1F2430" : "transparent" }}
              >
                {sh || "·"}
              </motion.span>
            ))}
          </div>
        ))}
      </div>
      <p className="mt-4 text-[13px] text-[#5B6275]">Drag a shift to move it. Staff are notified on their phone.</p>
    </>
  );
}

function Leave() {
  const offDays = [12, 13, 14, 15, 16];
  return (
    <div className="grid h-full grid-cols-[1.1fr_1fr] gap-5">
      <div>
        <p className="text-lg font-bold">Leave requests</p>
        {[
          { n: "Priya Shah", i: "PS", h: 330, d: "12–16 May · 5 days", t: "Holiday" },
          { n: "Tom Fielding", i: "TF", h: 210, d: "2 Jun · 1 day", t: "Appointment" },
        ].map((r, i) => (
          <motion.div
            key={r.n}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.15 + i * 0.1 }}
            className="mt-3 rounded-xl border border-black/5 bg-[#F8F9FB] p-3"
          >
            <div className="flex items-center gap-3">
              <Avatar initials={r.i} hue={r.h} />
              <div className="leading-tight">
                <p className="font-semibold">{r.n}</p>
                <p className="text-[13px] text-[#5B6275]">
                  {r.t} · {r.d}
                </p>
              </div>
            </div>
            <div className="mt-3 flex gap-2">
              <span className="flex-1 rounded-lg bg-[#17A94A] py-1.5 text-center text-[13px] font-bold text-white">Approve</span>
              <span className="flex-1 rounded-lg bg-white py-1.5 text-center text-[13px] font-semibold text-[#5B6275] ring-1 ring-black/10">Decline</span>
            </div>
          </motion.div>
        ))}
        <p className="mt-3 text-[13px] text-[#5B6275]">Priya has 14 of 28 days left this year.</p>
        <div className="mt-3 flex items-center gap-2 rounded-xl bg-[#FDECEC] px-3 py-2 text-[13px] font-semibold text-[#C4140A]">
          Next bank holiday: Monday 26 May
        </div>
      </div>
      <div>
        <p className="text-lg font-bold">May</p>
        <div className="mt-3 grid grid-cols-7 gap-1 text-center text-[12px]">
          {["M", "T", "W", "T", "F", "S", "S"].map((d, i) => (
            <span key={i} className="font-semibold text-[#5B6275]">
              {d}
            </span>
          ))}
          {Array.from({ length: 31 }, (_, i) => i + 1).map((d) => {
            const bank = d === 5 || d === 26;
            const off = offDays.includes(d);
            return (
              <span
                key={d}
                className={`flex h-8 items-center justify-center rounded-md ${
                  bank ? "bg-[#FDECEC] font-bold text-[#C4140A]" : off ? "bg-[#DCE8FF] font-semibold text-[#1362FB]" : "text-[#1F2430]"
                }`}
              >
                {d}
              </span>
            );
          })}
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          <Pill tone="red">Bank holiday</Pill>
          <Pill tone="blue">Priya off</Pill>
        </div>
      </div>
    </div>
  );
}

function Records() {
  return (
    <div className="grid h-full grid-cols-[1fr_1.25fr] gap-5">
      <div className="rounded-xl border border-black/5 bg-[#F8F9FB] p-4">
        <span className="flex h-16 w-16 items-center justify-center rounded-full bg-[hsl(150_65%_55%)] text-xl font-bold text-white">AK</span>
        <p className="mt-3 text-lg font-bold">Amira Khan</p>
        <p className="text-[13px] text-[#5B6275]">Store manager · London</p>
        <dl className="mt-4 space-y-2 text-[13px]">
          {[
            ["Started", "3 March 2023"],
            ["Contract", "Full time, 37.5 h"],
            ["Manager", "Sarah Lee"],
            ["Holiday", "28 days"],
          ].map(([k, v]) => (
            <div key={k} className="flex justify-between gap-2">
              <dt className="text-[#5B6275]">{k}</dt>
              <dd className="font-semibold">{v}</dd>
            </div>
          ))}
        </dl>
      </div>
      <div>
        <p className="text-lg font-bold">Documents</p>
        {[
          { n: "Employment contract.pdf", s: <Pill tone="green">Signed</Pill> },
          { n: "Right to work · Passport", s: <Pill tone="amber">Expires in 30 days</Pill> },
          { n: "P45.pdf", s: <Pill tone="grey">Stored</Pill> },
          { n: "First aid certificate", s: <Pill tone="green">Valid to 2027</Pill> },
        ].map((d, i) => (
          <Row key={d.n} i={i}>
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#EAF1FF] text-[#1362FB]" aria-hidden="true">
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8l-5-5Z" />
                <path d="M14 3v5h5" />
              </svg>
            </span>
            <span className="flex-1 font-semibold">{d.n}</span>
            {d.s}
          </Row>
        ))}
        <p className="mt-3 flex items-center gap-2 text-[13px] text-[#5B6275]">
          <svg viewBox="0 0 24 24" className="h-4 w-4 text-[#067A3E]" fill="none" stroke="currentColor" strokeWidth="2.4" aria-hidden="true">
            <path d="M12 3 5 6v5.5c0 4.2 2.9 7.8 7 9.5 4.1-1.7 7-5.3 7-9.5V6l-7-3Z" />
          </svg>
          Stored securely. Only HR and managers can see them.
        </p>
      </div>
    </div>
  );
}

function Expenses() {
  const rows = [
    { n: "Train to Leeds", who: "Tom Fielding", amt: "£86.40", s: <Pill tone="amber">To approve</Pill> },
    { n: "Client lunch", who: "Amira Khan", amt: "£42.10", s: <Pill tone="green">Approved</Pill> },
    { n: "Hotel, 1 night", who: "Priya Shah", amt: "£129.00", s: <Pill tone="green">Approved</Pill> },
    { n: "Mileage, 142 miles", who: "Dan Morris", amt: "£63.90", s: <Pill tone="green">Approved</Pill> },
    { n: "Stationery", who: "Ella Brooks", amt: "£18.20", s: <Pill tone="grey">Paid</Pill> },
  ];
  return (
    <>
      <div className="flex items-center justify-between">
        <p className="text-lg font-bold">Expenses · May</p>
        <span className="rounded-lg bg-[#E7F8EE] px-3 py-1.5 text-[13px] font-bold text-[#067A3E]">£235.00 ready for payroll</span>
      </div>
      <div className="mt-2">
        {rows.map((r, i) => (
          <Row key={r.n} i={i}>
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#F1F2F5] text-[#5B6275]" aria-hidden="true">
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round">
                <path d="M6 3h12v18l-3-2-3 2-3-2-3 2V3Z" />
              </svg>
            </span>
            <span className="flex-1 leading-tight">
              <span className="block font-semibold">{r.n}</span>
              <span className="block text-[13px] text-[#5B6275]">{r.who} · receipt attached</span>
            </span>
            <span className="w-20 text-right font-bold">{r.amt}</span>
            <span className="w-28 text-right">{r.s}</span>
          </Row>
        ))}
      </div>
    </>
  );
}
