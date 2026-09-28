import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Activity, CalendarDays, CheckCircle2, Clock3, ExternalLink, PawPrint, Stethoscope, UserRound } from "lucide-react";
import { useAppContext } from "../hooks/useAppContext";
import { getDoctorConsultations, updateDoctorConsultationStatus, updateDoctorPresence, updateDoctorProfile } from "../services/api";

const API_ORIGIN = import.meta.env.VITE_API_ORIGIN || "http://localhost:5000";
const weekdays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const statusStyle = { ASSIGNED: "bg-blue-50 text-blue-700", PENDING: "bg-blue-50 text-blue-700", ACCEPTED: "bg-amber-50 text-amber-700", IN_PROGRESS: "bg-emerald-50 text-emerald-700", COMPLETED: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300", CANCELLED: "bg-rose-50 text-rose-700" };
const statusLabel = (status = "") => status.replaceAll("_", " ").toLowerCase().replace(/\b\w/g, (letter) => letter.toUpperCase());
const dateLabel = (value) => value ? new Date(value).toLocaleDateString([], { year: "numeric", month: "short", day: "numeric" }) : "Date pending";

export default function DoctorDashboard() {
  const { currentUser, theme } = useAppContext();
  const [items, setItems] = useState([]);
  const [stats, setStats] = useState({});
  const [selectedId, setSelectedId] = useState("");
  const [error, setError] = useState("");
  const [profile, setProfile] = useState(() => ({
    availableDays: currentUser?.doctorProfile?.availableDays || [],
    start: currentUser?.doctorProfile?.timeSlots?.[0]?.start || "09:00",
    end: currentUser?.doctorProfile?.timeSlots?.[0]?.end || "17:00",
    isAcceptingConsultations: currentUser?.doctorProfile?.isAcceptingConsultations || false,
    profilePhoto: currentUser?.doctorProfile?.profilePhoto || "",
    clinicName: currentUser?.doctorProfile?.clinicName || "",
    qualification: currentUser?.doctorProfile?.qualification || "",
    registrationNumber: currentUser?.doctorProfile?.registrationNumber || "",
    specialization: (currentUser?.doctorProfile?.specialization || []).join(", "),
    experience: currentUser?.doctorProfile?.experience || 0,
  }));
  const [savingProfile, setSavingProfile] = useState(false);
  const [isOnline, setIsOnline] = useState(false);
  const selected = items.find((item) => item._id === selectedId);
  const isDark = theme === "dark";

  const refresh = useCallback(async () => {
    try {
      const result = await getDoctorConsultations();
      setItems(result.consultations || []);
      setStats(result.stats || {});
      setError("");
    } catch (err) { setError(err.message || "Unable to load your consultation dashboard."); }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(refresh, 0);
    updateDoctorPresence(true).then(() => setIsOnline(true)).catch(() => setIsOnline(false));
    const interval = window.setInterval(refresh, 20000);
    return () => { window.clearTimeout(timer); window.clearInterval(interval); updateDoctorPresence(false).catch(() => {}); };
  }, [refresh]);

  const updateStatus = async (id, status) => {
    try {
      const result = await updateDoctorConsultationStatus(id, status);
      setItems((current) => current.map((item) => item._id === id ? result.consultation : item));
      await refresh();
    } catch (err) { setError(err.message || "Unable to update consultation status."); }
  };
  const saveProfile = async (event) => {
    event.preventDefault(); setSavingProfile(true); setError("");
    try {
      await updateDoctorProfile({
        profilePhoto: profile.profilePhoto,
        clinicName: profile.clinicName,
        qualification: profile.qualification,
        registrationNumber: profile.registrationNumber,
        specialization: profile.specialization,
        experience: Number(profile.experience),
        availableDays: profile.availableDays,
        timeSlots: [{ start: profile.start, end: profile.end }],
        isAcceptingConsultations: profile.isAcceptingConsultations,
      });
      await refresh();
    } catch (err) { setError(err.message || "Unable to save your profile and availability."); }
    finally { setSavingProfile(false); }
  };
  const toggleDay = (day) => setProfile((current) => ({ ...current, availableDays: current.availableDays.includes(day) ? current.availableDays.filter((value) => value !== day) : [...current.availableDays, day] }));

  return <main className={`min-h-[calc(100vh-4rem)] px-4 py-8 sm:px-6 lg:px-8 ${isDark ? "bg-[#0b0f14] text-slate-100" : "bg-[#f7f8fa] text-slate-900 dark:text-slate-100"}`}>
    <div className="mx-auto max-w-7xl">
      <header className="mb-7 flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div><p className="flex items-center gap-2 text-sm font-bold text-orange-600"><Stethoscope size={17} /> SMART PAW AI · VETERINARY CARE</p><h1 className="mt-2 text-3xl font-black tracking-tight">Doctor dashboard</h1><p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Welcome, {currentUser?.name}. Review your requests and consultation schedule.</p></div><span className={`inline-flex w-fit items-center gap-2 rounded-full px-3 py-2 text-xs font-bold ${isOnline ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300"}`}><span className={`h-2 w-2 rounded-full ${isOnline ? "bg-emerald-500" : "bg-slate-400"}`} />{isOnline ? "Online" : "Offline"}</span></header>
      {error && <p role="alert" className="mb-4 rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}

      <div className="mb-6 grid grid-cols-2 gap-3 md:grid-cols-5">{[["Pending requests", stats.pending, Clock3], ["Today", stats.today, CalendarDays], ["Upcoming", stats.upcoming, Activity], ["Active", stats.active, Stethoscope], ["Completed", stats.completed, CheckCircle2]].map(([label, value, Icon]) => <div key={label} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-[#111820]"><div className="flex items-center justify-between text-xs font-semibold text-slate-500 dark:text-slate-400"><span>{label}</span><Icon size={17} className="text-orange-500" /></div><p className="mt-2 text-2xl font-black">{value ?? 0}</p></div>)}</div>

      <form onSubmit={saveProfile} className="mb-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-[#111820]"><div className="flex flex-wrap items-center justify-between gap-3"><div><h2 className="font-extrabold">Doctor profile & availability</h2><p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Only matching open time slots receive automatic assignments.</p></div><label className="flex items-center gap-2 text-sm font-bold"><input type="checkbox" checked={profile.isAcceptingConsultations} onChange={(e) => setProfile({ ...profile, isAcceptingConsultations: e.target.checked })} className="accent-orange-500" />Accepting consultations</label></div>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{[["clinicName", "Clinic / veterinary center name"], ["qualification", "Qualification"], ["registrationNumber", "Doctor registration number"], ["profilePhoto", "Profile photo URL"], ["specialization", "Specializations, comma separated"]].map(([key, label]) => <input key={key} aria-label={label} placeholder={label} value={profile[key] || ""} onChange={(e) => setProfile({ ...profile, [key]: e.target.value })} className="rounded-xl border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-[#18212b] dark:text-white" />)}<input aria-label="Experience" type="number" min="0" placeholder="Experience in years" value={profile.experience ?? ""} onChange={(e) => setProfile({ ...profile, experience: e.target.value })} className="rounded-xl border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-[#18212b] dark:text-white" /></div>
        <div className="mt-4 flex flex-wrap items-center gap-2">{weekdays.map((day) => <button type="button" key={day} onClick={() => toggleDay(day)} className={`rounded-full border px-3 py-1.5 text-xs font-bold ${profile.availableDays.includes(day) ? "border-orange-500 bg-orange-500 text-white" : "border-slate-200 text-slate-500 dark:border-slate-700 dark:text-slate-400"}`}>{day}</button>)}<label className="ml-auto flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">Hours <input aria-label="Availability start time" type="time" value={profile.start} onChange={(e) => setProfile({ ...profile, start: e.target.value })} className="rounded-lg border border-slate-200 p-1.5 text-slate-800 dark:border-slate-700 dark:bg-[#18212b] dark:text-white" /><span>to</span><input aria-label="Availability end time" type="time" value={profile.end} onChange={(e) => setProfile({ ...profile, end: e.target.value })} className="rounded-lg border border-slate-200 p-1.5 text-slate-800 dark:border-slate-700 dark:bg-[#18212b] dark:text-white" /></label><button disabled={savingProfile} className="rounded-lg bg-slate-900 px-4 py-2 text-xs font-bold text-white disabled:opacity-50">{savingProfile ? "Saving…" : "Save profile & availability"}</button></div>
      </form>

      <div className="grid gap-5 lg:grid-cols-[minmax(320px,0.9fr)_minmax(0,1.4fr)]">
        <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-[#111820]"><div className="mb-3 flex items-center justify-between"><h2 className="font-extrabold">Consultation requests & schedule</h2><button onClick={refresh} className="text-xs font-bold text-orange-600">Refresh</button></div>{items.length === 0 ? <div className="rounded-xl bg-slate-50 p-7 text-center dark:bg-slate-900"><Stethoscope className="mx-auto text-slate-300" /><p className="mt-3 text-sm font-bold">No assigned consultations</p><p className="mt-1 text-xs leading-5 text-slate-500 dark:text-slate-400">Requests assigned to your availability will appear here.</p></div> : <div className="space-y-2">{items.map((item) => <button key={item._id} onClick={() => setSelectedId(item._id)} className={`w-full rounded-xl border p-3 text-left transition ${selectedId === item._id ? "border-orange-300 bg-orange-50/50 dark:bg-orange-500/10" : "border-slate-100 hover:border-slate-300 dark:border-slate-800 dark:hover:border-slate-700"}`}><div className="flex items-center gap-3"><PetAvatar pet={item.petId} /><div className="min-w-0 flex-1"><div className="flex justify-between gap-2"><p className="truncate text-sm font-extrabold">{item.petId?.name || "Pet"}</p><span className={`h-fit rounded-full px-2 py-1 text-[10px] font-bold ${statusStyle[item.status] || statusStyle.PENDING}`}>{statusLabel(item.status)}</span></div><p className="mt-1 truncate text-xs text-slate-500 dark:text-slate-400">{item.userId?.name || "Pet owner"} · {item.primaryConcern}</p><p className="mt-1 text-[11px] text-slate-400">{dateLabel(item.requestedDate)} · {item.requestedTime || "Time pending"}</p></div></div></button>)}</div>}</section>

        {selected ? <ConsultationOverview consultation={selected} busyAction={updateStatus} /> : <section className="flex min-h-64 items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center dark:border-slate-700 dark:bg-[#111820]"><div><CalendarDays className="mx-auto text-slate-300" /><p className="mt-3 font-bold">Select a scheduled consultation</p><p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Review its details and open the dedicated consultation page.</p></div></section>}
      </div>
    </div>
  </main>;
}

function ConsultationOverview({ consultation, busyAction }) {
  const pet = consultation.petId || {};
  const canAccept = ["ASSIGNED", "PENDING"].includes(consultation.status);
  const canStart = consultation.status === "ACCEPTED";
  return <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-[#111820]"><header className="flex flex-wrap items-center justify-between gap-3"><div className="flex items-center gap-3"><PetAvatar pet={pet} large /><div><h2 className="text-xl font-black">{pet.name || "Pet"}</h2><p className="text-sm text-slate-500 dark:text-slate-400">Owner {consultation.userId?.name || "—"} · {consultation.userId?.email || ""}</p></div></div><span className={`rounded-full px-3 py-1.5 text-xs font-bold ${statusStyle[consultation.status] || statusStyle.PENDING}`}>{statusLabel(consultation.status)}</span></header>
    <dl className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-3">{[["Species", pet.species], ["Breed", pet.breed], ["Age", pet.age == null ? "—" : `${pet.age} years`], ["Gender", pet.gender], ["Concern", consultation.primaryConcern], ["Appointment", `${dateLabel(consultation.requestedDate)} · ${consultation.requestedTime || "Time pending"}`]].map(([label, value]) => <div key={label} className="rounded-xl bg-slate-50 p-3 dark:bg-slate-900"><dt className="text-[10px] font-bold uppercase text-slate-400">{label}</dt><dd className="mt-1 truncate text-sm font-semibold">{value || "—"}</dd></div>)}</dl>
    <div className="mt-4 rounded-xl bg-orange-50 p-4 dark:bg-orange-950/30"><p className="text-xs font-black uppercase tracking-wide text-orange-700 dark:text-orange-300">Reported symptoms</p><p className="mt-1 whitespace-pre-wrap text-sm leading-6 text-slate-700 dark:text-slate-200">{consultation.symptoms}</p><p className="mt-2 text-xs text-slate-500 dark:text-slate-400">{consultation.severity} · {consultation.duration} · {consultation.aiRiskLevel} AI risk</p></div>
    <div className="mt-5 flex flex-wrap gap-2">{canAccept && <button onClick={() => busyAction(consultation._id, "ACCEPTED")} className="rounded-xl border border-orange-200 px-4 py-2 text-sm font-bold text-orange-700">Accept consultation</button>}{canStart && <button onClick={() => busyAction(consultation._id, "IN_PROGRESS")} className="rounded-xl border border-orange-200 px-4 py-2 text-sm font-bold text-orange-700">Start consultation</button>}<Link to={`/doctor/consultations/${consultation._id}`} className="inline-flex items-center gap-2 rounded-xl bg-orange-500 px-4 py-2 text-sm font-bold text-white">Open consultation <ExternalLink size={15} /></Link>{consultation.report?.submittedAt && <Link to={`/doctor/consultations/${consultation._id}/report`} className="rounded-xl border border-emerald-200 px-4 py-2 text-sm font-bold text-emerald-700">View final report</Link>}</div>
  </section>;
}

function PetAvatar({ pet = {}, large = false }) {
  const [failed, setFailed] = useState(false);
  const photo = !failed && pet.profilePhoto ? (pet.profilePhoto.startsWith("http") ? pet.profilePhoto : `${API_ORIGIN}${pet.profilePhoto}`) : "";
  return photo ? <img src={photo} onError={() => setFailed(true)} alt={pet.name || "Pet"} className={`${large ? "h-14 w-14" : "h-11 w-11"} shrink-0 rounded-xl object-cover`} /> : <div className={`${large ? "h-14 w-14" : "h-11 w-11"} flex shrink-0 items-center justify-center rounded-xl bg-orange-100 text-orange-600`}>{pet.name ? <PawPrint size={large ? 25 : 20} /> : <UserRound size={large ? 25 : 20} />}</div>;
}
