import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, CalendarDays, FileText, PawPrint, Send, UserRound } from "lucide-react";
import { connectConsultationSocket } from "../services/consultationSocket";
import { getConsultationById, getConsultationMessages, getDoctorConsultations, sendConsultationMessage, updateDoctorConsultationStatus } from "../services/api";

const API_ORIGIN = import.meta.env.VITE_API_ORIGIN || "http://localhost:5000";
const statusStyle = { ASSIGNED: "bg-blue-50 text-blue-700", PENDING: "bg-blue-50 text-blue-700", ACCEPTED: "bg-amber-50 text-amber-700", IN_PROGRESS: "bg-emerald-50 text-emerald-700", COMPLETED: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300", CANCELLED: "bg-rose-50 text-rose-700" };
const statusLabel = (status = "") => status.replaceAll("_", " ").toLowerCase().replace(/\b\w/g, (letter) => letter.toUpperCase());
const dateLabel = (date) => date ? new Date(date).toLocaleDateString([], { month: "short", day: "numeric", year: "numeric" }) : "Date pending";

export default function DoctorConsultationDetail() {
  const { consultationId } = useParams();
  const navigate = useNavigate();
  const [consultation, setConsultation] = useState(null);
  const [history, setHistory] = useState([]);
  const [messages, setMessages] = useState([]);
  const [draft, setDraft] = useState("");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const endRef = useRef(null);

  const refreshConsultation = useCallback(async () => {
    try { const result = await getConsultationById(consultationId); setConsultation(result.consultation); setError(""); }
    catch (err) { setError(err.message || "Unable to load this consultation."); }
    finally { setLoading(false); }
  }, [consultationId]);
  const refreshMessages = useCallback(async () => {
    try { const result = await getConsultationMessages(consultationId); setMessages(result.messages || []); }
    catch (err) { setError(err.message || "Unable to load this conversation."); }
  }, [consultationId]);
  const refreshHistory = useCallback(async () => {
    try { const result = await getDoctorConsultations(); setHistory(result.consultations || []); }
    catch (err) { setError(err.message || "Unable to load consultation history."); }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => { refreshConsultation(); refreshMessages(); refreshHistory(); }, 0);
    const socket = connectConsultationSocket();
    socket.on("connect", () => socket.emit("consultation:join", consultationId));
    socket.on("chat:message", (message) => setMessages((current) => current.some((item) => item._id === message._id) ? current : [...current, message]));
    socket.on("consultation:updated", (updated) => {
      if (String(updated?._id) === String(consultationId)) setConsultation(updated);
      refreshHistory();
    });
    const poll = window.setInterval(() => { refreshConsultation(); refreshMessages(); refreshHistory(); }, 12000);
    return () => { window.clearTimeout(timer); window.clearInterval(poll); socket.disconnect(); };
  }, [consultationId, refreshConsultation, refreshMessages, refreshHistory]);
  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  const updateStatus = async (status) => {
    setBusy(true); setError("");
    try { const result = await updateDoctorConsultationStatus(consultationId, status); setConsultation(result.consultation); await refreshHistory(); }
    catch (err) { setError(err.message || "Unable to update consultation status."); }
    finally { setBusy(false); }
  };
  const sendMessage = async (event) => {
    event.preventDefault();
    if (!draft.trim()) return;
    setBusy(true); setError("");
    try {
      const result = await sendConsultationMessage(consultationId, draft.trim());
      setMessages((current) => current.some((item) => item._id === result.message._id) ? current : [...current, result.message]);
      setDraft("");
    } catch (err) { setError(err.message || "Unable to send your message."); }
    finally { setBusy(false); }
  };

  if (loading) return <main className="min-h-[calc(100vh-4rem)] bg-slate-50 p-8 dark:bg-[#0b0f14]"><p className="mx-auto max-w-6xl text-sm text-slate-500">Loading consultation…</p></main>;
  if (!consultation) return <main className="min-h-[calc(100vh-4rem)] bg-slate-50 p-8 dark:bg-[#0b0f14]"><section className="mx-auto max-w-3xl rounded-2xl bg-white p-6 dark:bg-[#111820]"><p role="alert">{error || "Consultation not found or not assigned to your account."}</p><Link to="/doctor/dashboard" className="mt-4 inline-block text-sm font-bold text-orange-600">Back to dashboard</Link></section></main>;

  const pet = consultation.petId || {};
  const doctorCanChat = consultation.status === "IN_PROGRESS";
  return <main className="min-h-[calc(100vh-4rem)] bg-slate-50 px-3 py-5 text-slate-900 dark:bg-[#0b0f14] dark:text-slate-100 sm:px-5 lg:px-7">
    <div className="mx-auto max-w-[1440px]">
      <Link to="/doctor/dashboard" className="mb-4 inline-flex items-center gap-2 text-sm font-bold text-orange-600"><ArrowLeft size={16} /> Doctor dashboard</Link>
      {error && <p role="alert" className="mb-3 rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}
      <div className="grid min-h-[calc(100vh-10rem)] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-[#111820] lg:grid-cols-[300px_minmax(0,1fr)]">
        <aside className="border-b border-slate-200 dark:border-slate-800 lg:border-b-0 lg:border-r">
          <div className="border-b border-slate-100 p-4 dark:border-slate-800"><p className="text-xs font-black uppercase tracking-widest text-orange-600">Doctor workspace</p><h1 className="mt-1 text-lg font-black">Consultation history</h1><p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Past and scheduled patient conversations</p></div>
          <div className="max-h-[35vh] overflow-y-auto lg:max-h-[calc(100vh-14rem)]">{history.map((item) => <Link key={item._id} to={`/doctor/consultations/${item._id}`} className={`block border-b border-slate-100 p-3 transition dark:border-slate-800 ${item._id === consultationId ? "bg-orange-50 dark:bg-orange-500/10" : "hover:bg-slate-50 dark:hover:bg-slate-900"}`}><div className="flex items-start gap-3"><PetAvatar pet={item.petId} /><div className="min-w-0 flex-1"><div className="flex items-start justify-between gap-2"><p className="truncate text-sm font-extrabold">{item.petId?.name || "Pet"}</p><span className={`shrink-0 rounded-full px-2 py-1 text-[9px] font-bold ${statusStyle[item.status] || statusStyle.PENDING}`}>{statusLabel(item.status)}</span></div><p className="mt-1 truncate text-xs text-slate-600 dark:text-slate-300">{item.userId?.name || "Pet owner"}</p><p className="mt-1 text-[11px] text-slate-400">{dateLabel(item.requestedDate)} · {item.requestedTime || "Time pending"}</p>{item.report?.submittedAt && <p className="mt-1 inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700"><FileText size={11} /> Report available</p>}</div></div></Link>)}{history.length === 0 && <p className="p-5 text-sm text-slate-500">No consultations yet.</p>}</div>
        </aside>

        <section className="flex min-h-[650px] min-w-0 flex-col">
          <header className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 p-4 dark:border-slate-800 sm:px-6"><div className="flex min-w-0 items-center gap-3"><PetAvatar pet={pet} large /><div className="min-w-0"><h2 className="truncate text-lg font-black">{pet.name || "Pet"} <span className="font-medium text-slate-400">· {pet.species || "Pet"}{pet.breed ? ` / ${pet.breed}` : ""}</span></h2><p className="truncate text-xs text-slate-500 dark:text-slate-400">Owner {consultation.userId?.name || "—"} · {dateLabel(consultation.requestedDate)} at {consultation.requestedTime || "time pending"}</p></div></div><span className={`rounded-full px-3 py-1.5 text-xs font-bold ${statusStyle[consultation.status] || statusStyle.PENDING}`}>{statusLabel(consultation.status)}</span></header>
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 bg-slate-50/70 px-4 py-3 dark:border-slate-800 dark:bg-slate-900/30 sm:px-6"><div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400"><CalendarDays size={14} /> Consultation {dateLabel(consultation.requestedDate)} · {consultation.requestedTime}</div><div className="flex flex-wrap gap-2">{["ASSIGNED", "PENDING"].includes(consultation.status) && <button disabled={busy} onClick={() => updateStatus("ACCEPTED")} className="rounded-lg border border-orange-200 px-3 py-1.5 text-xs font-bold text-orange-700">Accept</button>}{consultation.status === "ACCEPTED" && <button disabled={busy} onClick={() => updateStatus("IN_PROGRESS")} className="rounded-lg bg-orange-500 px-3 py-1.5 text-xs font-bold text-white">Start consultation</button>}{doctorCanChat && <button onClick={() => navigate(`/doctor/consultations/${consultationId}/report`)} className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-bold dark:border-slate-700">End consultation</button>}{["IN_PROGRESS", "COMPLETED"].includes(consultation.status) && (consultation.report?.submittedAt ? <Link to={`/doctor/consultations/${consultationId}/report`} className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white">View final report</Link> : <Link to={`/doctor/consultations/${consultationId}/report`} className="rounded-lg border border-emerald-200 px-3 py-1.5 text-xs font-bold text-emerald-700">Final report</Link>)}</div></div>

          <div className="flex-1 space-y-3 overflow-y-auto bg-[#f8fafc] p-4 dark:bg-[#0d131a] sm:px-6">{messages.length ? messages.map((message) => <article key={message._id} className={`flex ${message.senderRole === "doctor" ? "justify-end" : "justify-start"}`}><div className={`max-w-[min(82%,680px)] rounded-2xl px-4 py-3 shadow-sm ${message.senderRole === "doctor" ? "rounded-br-md bg-orange-500 text-white" : "rounded-bl-md border border-slate-100 bg-white text-slate-800 dark:border-slate-800 dark:bg-[#18212b] dark:text-slate-100"}`}><p className="whitespace-pre-wrap text-sm leading-6">{message.message}</p><p className={`mt-1.5 text-[10px] ${message.senderRole === "doctor" ? "text-orange-100" : "text-slate-400"}`}>{message.senderId?.name || (message.senderRole === "doctor" ? "Doctor" : "Pet owner")} · {new Date(message.createdAt).toLocaleString()}</p></div></article>) : <div className="grid min-h-64 place-items-center"><p className="text-center text-sm text-slate-400">{doctorCanChat ? "No messages yet. Send the first message to start the conversation." : "The chat becomes available when the consultation is started."}</p></div>}</div>

          <footer className="border-t border-slate-100 p-4 dark:border-slate-800 sm:px-6">{doctorCanChat ? <form onSubmit={sendMessage} className="flex items-end gap-2"><textarea rows="2" maxLength={4000} value={draft} onChange={(event) => setDraft(event.target.value)} placeholder="Write a message to the pet owner…" className="min-h-12 min-w-0 flex-1 resize-y rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-orange-400 dark:border-slate-700 dark:bg-[#0d131a]" /><button disabled={busy || !draft.trim()} className="inline-flex h-12 shrink-0 items-center gap-2 rounded-xl bg-orange-500 px-4 text-sm font-bold text-white disabled:opacity-50"><Send size={16} /> Send</button></form> : <p className="text-center text-xs text-slate-500">{consultation.status === "COMPLETED" ? "This consultation is complete. Its chat history remains available." : "Accept and start this consultation to enable chat."}</p>}</footer>
        </section>
      </div>
    </div>
  </main>;
}

function PetAvatar({ pet = {}, large = false }) {
  const [failed, setFailed] = useState(false);
  const image = pet.profilePhoto ? (pet.profilePhoto.startsWith("http") ? pet.profilePhoto : `${API_ORIGIN}${pet.profilePhoto}`) : "";
  return image && !failed ? <img src={image} onError={() => setFailed(true)} alt={pet.name || "Pet"} className={`${large ? "h-14 w-14" : "h-11 w-11"} shrink-0 rounded-xl object-cover`} /> : <div className={`${large ? "h-14 w-14" : "h-11 w-11"} flex shrink-0 items-center justify-center rounded-xl bg-orange-100 text-orange-600`}>{pet.name ? <PawPrint size={large ? 25 : 20} /> : <UserRound size={large ? 25 : 20} />}</div>;
}
