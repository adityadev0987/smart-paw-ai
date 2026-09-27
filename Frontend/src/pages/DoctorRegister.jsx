import { useState } from "react";
import { Link } from "react-router-dom";
import { Stethoscope } from "lucide-react";
import { useAppContext } from "../hooks/useAppContext";
import { registerDoctorAccount } from "../services/api";

const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

export default function DoctorRegister() {
  const { theme } = useAppContext();
  const isDark = theme === "dark";
  const [form, setForm] = useState({ name: "", email: "", password: "", registrationKey: "", qualification: "", specialization: "", experience: "", profilePhoto: "", availableDays: [], start: "09:00", end: "17:00" });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const inputClass = `mt-1.5 w-full rounded-xl border px-4 py-3 text-sm outline-none focus:border-orange-400 focus:ring-4 focus:ring-orange-100 ${isDark ? "border-slate-700 bg-[#18212b] text-white placeholder:text-slate-500" : "border-slate-200 bg-white text-slate-900"}`;
  const toggleDay = (day) => setForm((current) => ({ ...current, availableDays: current.availableDays.includes(day) ? current.availableDays.filter((item) => item !== day) : [...current.availableDays, day] }));
  const submit = async (event) => {
    event.preventDefault(); setError(""); setSuccess(""); setLoading(true);
    try {
      const { start, end, ...profile } = form;
      await registerDoctorAccount({ ...profile, experience: Number(profile.experience), timeSlots: [{ start, end }] });
      setSuccess("Veterinarian account created. Log in with these credentials to open your dashboard.");
    } catch (err) { setError(err.message || "Unable to create the veterinarian account."); }
    finally { setLoading(false); }
  };

  return (
    <main className={`min-h-[calc(100vh-4rem)] px-4 py-10 transition-colors ${isDark ? "bg-[#0b0f14] text-slate-100" : "bg-[#faf9f7] text-slate-900"}`}>
      <section className={`mx-auto max-w-2xl rounded-3xl border p-6 shadow-xl transition-colors sm:p-9 ${isDark ? "border-slate-800 bg-[#111820]" : "border-slate-200 bg-white"}`}>
        <div className="mb-6 flex items-center gap-3">
          <span className={`rounded-2xl p-3 ${isDark ? "bg-orange-500/10 text-orange-400" : "bg-orange-50 text-orange-600"}`}><Stethoscope /></span>
          <div><p className="text-xs font-black uppercase tracking-widest text-orange-600">Smart Paw AI</p><h1 className="text-2xl font-black">Veterinarian registration</h1></div>
        </div>
        <p className={`mb-6 text-sm leading-6 ${isDark ? "text-slate-400" : "text-slate-500"}`}>Doctor registration requires your organization’s registration key. Your availability starts disabled; turn it on from your doctor dashboard when your profile is ready.</p>
        <form onSubmit={submit} className="grid gap-4 sm:grid-cols-2">
          <label className="text-sm font-semibold">Full name<input required className={inputClass} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></label>
          <label className="text-sm font-semibold">Email<input required type="email" className={inputClass} value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></label>
          <label className="text-sm font-semibold">Password<input required minLength={6} type="password" className={inputClass} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} /></label>
          <label className="text-sm font-semibold">Registration key<input required type="password" className={inputClass} value={form.registrationKey} onChange={(e) => setForm({ ...form, registrationKey: e.target.value })} /></label>
          <label className="text-sm font-semibold">Qualification<input required className={inputClass} placeholder="BVSc, MVSc…" value={form.qualification} onChange={(e) => setForm({ ...form, qualification: e.target.value })} /></label>
          <label className="text-sm font-semibold">Specialization<input required className={inputClass} placeholder="General practice, dermatology…" value={form.specialization} onChange={(e) => setForm({ ...form, specialization: e.target.value })} /></label>
          <label className="text-sm font-semibold sm:col-span-2">Profile photo URL (optional)<input type="url" className={inputClass} placeholder="https://…" value={form.profilePhoto} onChange={(e) => setForm({ ...form, profilePhoto: e.target.value })} /></label>
          <label className="text-sm font-semibold">Experience (years)<input required min="0" type="number" className={inputClass} value={form.experience} onChange={(e) => setForm({ ...form, experience: e.target.value })} /></label>
          <div className="text-sm font-semibold">Working hours<div className="mt-1.5 flex gap-2"><input aria-label="Start time" type="time" className={`w-full rounded-xl border px-3 py-3 text-sm ${isDark ? "border-slate-700 bg-[#18212b] text-white" : "border-slate-200 bg-white text-slate-900"}`} value={form.start} onChange={(e) => setForm({ ...form, start: e.target.value })} /><input aria-label="End time" type="time" className={`w-full rounded-xl border px-3 py-3 text-sm ${isDark ? "border-slate-700 bg-[#18212b] text-white" : "border-slate-200 bg-white text-slate-900"}`} value={form.end} onChange={(e) => setForm({ ...form, end: e.target.value })} /></div></div>
          <fieldset className="sm:col-span-2"><legend className="mb-2 text-sm font-semibold">Working days</legend><div className="flex flex-wrap gap-2">{days.map((day) => <button type="button" key={day} onClick={() => toggleDay(day)} className={`rounded-full border px-3 py-2 text-xs font-bold ${form.availableDays.includes(day) ? "border-orange-500 bg-orange-500 text-white" : isDark ? "border-slate-700 text-slate-300" : "border-slate-200 text-slate-600"}`}>{day}</button>)}</div></fieldset>
          {error && <p className="sm:col-span-2 rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}
          {success && <p className="sm:col-span-2 rounded-xl bg-emerald-50 p-3 text-sm text-emerald-700">{success} <Link className="font-bold underline" to="/login">Log in</Link></p>}
          <button disabled={loading} className="sm:col-span-2 rounded-xl bg-orange-500 px-5 py-3 font-bold text-white disabled:opacity-60">{loading ? "Creating account…" : "Create veterinarian account"}</button>
        </form>
        <p className={`mt-5 text-sm ${isDark ? "text-slate-400" : "text-slate-500"}`}>Already registered? <Link className="font-bold text-orange-600" to="/login">Sign in</Link></p>
      </section>
    </main>
  );
}
