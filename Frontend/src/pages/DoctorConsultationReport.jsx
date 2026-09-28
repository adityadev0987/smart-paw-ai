import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, BadgeCheck, ClipboardList, PawPrint, Stethoscope } from "lucide-react";
import { useAppContext } from "../hooks/useAppContext";
import { getConsultationById, submitDoctorConsultationReport } from "../services/api";
import ConsultationReportView from "./ConsultationReportView";

const fields = [
  ["summary", "Consultation summary", "Summarize the consultation and outcome.", true, "summary"],
  ["symptomsDiscussed", "Symptoms / history", "History discussed during the consultation.", true, "assessment"],
  ["observations", "Clinical observations", "Clinical findings and examination observations.", true, "assessment"],
  ["diagnosis", "Diagnosis / assessment", "Professional assessment based on the consultation.", true, "assessment"],
  ["treatment", "Treatment / medication plan", "Treatment provided or recommended.", true, "treatment"],
  ["medicines", "Medication", "Medicine name and strength, if prescribed.", false, "treatment"],
  ["dosageInstructions", "Medication dosage", "Dose per administration.", false, "treatment"],
  ["frequency", "Frequency", "How often the medicine should be given.", false, "treatment"],
  ["medicationDuration", "Medication duration", "How long to continue treatment.", false, "treatment"],
  ["homeCare", "Additional instructions / home care", "Care instructions for the owner at home.", false, "care"],
  ["dietHydration", "Diet / hydration advice", "Diet and hydration recommendations.", false, "care"],
  ["followUp", "Follow-up recommendation", "Recommended follow-up date or plan.", false, "care"],
  ["emergencyInstructions", "Warning / emergency instructions", "Signs that require urgent veterinary attention.", false, "care"],
  ["advice", "Recommendations", "Other professional recommendations.", false, "care"],
  ["additionalNotes", "Doctor's additional notes", "Additional clinical notes.", false, "closing"],
  ["finalRemarks", "Final remarks", "Closing statement for the owner.", false, "closing"],
];

export default function DoctorConsultationReport() {
  const { consultationId } = useParams();
  const { currentUser } = useAppContext();
  const [consultation, setConsultation] = useState(null);
  const [values, setValues] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    let active = true;
    getConsultationById(consultationId)
      .then((result) => {
        if (!active) return;
        const item = result.consultation;
        setConsultation(item);
        if (item.report?.submittedAt) setSubmitted(true);
        else setValues({ summary: "", symptomsDiscussed: item.symptoms || "", observations: "", diagnosis: "", treatment: "", medicines: "", dosageInstructions: "", frequency: "", medicationDuration: "", homeCare: "", dietHydration: "", followUp: "", emergencyInstructions: "", advice: "", additionalNotes: "", finalRemarks: "" });
      })
      .catch((err) => { if (active) setError(err.message || "Unable to load this consultation."); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [consultationId]);

  const submit = async (event) => {
    event.preventDefault(); setSaving(true); setError("");
    try {
      const result = await submitDoctorConsultationReport(consultationId, values);
      setConsultation(result.consultation);
      setSubmitted(true);
    } catch (err) { setError(err.message || "Unable to save the final report."); }
    finally { setSaving(false); }
  };

  if (loading) return <main className="min-h-[calc(100vh-4rem)] bg-slate-50 p-8 dark:bg-[#0b0f14]"><p className="mx-auto max-w-5xl text-sm text-slate-500">Preparing report…</p></main>;
  if (!consultation) return <main className="min-h-screen bg-slate-50 p-8 dark:bg-[#0b0f14]"><p className="mx-auto max-w-3xl text-sm text-rose-600">{error || "Consultation not found."}</p></main>;
  if (submitted) return <ConsultationReportView consultationId={consultationId} backTo={`/doctor/consultations/${consultationId}`} allowDownload={false} />;

  const pet = consultation.petId || {};
  const doctor = consultation.veterinarianId?.doctorProfile || currentUser?.doctorProfile || {};
  const doctorName = consultation.veterinarianId?.name || currentUser?.name || "Doctor";
  const appointmentDate = consultation.requestedDate || consultation.createdAt;
  const inputStyle = "mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-sm text-slate-800 outline-none transition focus:border-orange-400 focus:ring-2 focus:ring-orange-100 dark:border-slate-700 dark:bg-[#0d131a] dark:text-slate-100 dark:focus:ring-orange-950";

  return <main className="min-h-[calc(100vh-4rem)] bg-slate-50 px-4 py-6 dark:bg-[#0b0f14] sm:px-6"><div className="mx-auto max-w-5xl">
    <Link to={`/doctor/consultations/${consultationId}`} className="mb-4 inline-flex items-center gap-2 text-sm font-bold text-orange-600"><ArrowLeft size={16} /> Cancel and return to chat</Link>
    <form onSubmit={submit} className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-[#111820]">
      <header className="bg-[#102338] px-5 py-6 text-white sm:px-8"><p className="flex items-center gap-2 text-xs font-black uppercase tracking-[.2em] text-orange-300"><Stethoscope size={15} /> Smart Paw AI · Veterinary Care</p><h1 className="mt-2 text-2xl font-black sm:text-3xl">Final Consultation Report</h1><p className="mt-2 text-sm text-slate-300">Complete the clinical assessment and care plan. Patient, owner, doctor, and visit details are populated from this consultation.</p></header>
      {error && <p role="alert" className="mx-5 mt-5 rounded-xl bg-red-50 p-3 text-sm text-red-700 sm:mx-8">{error}</p>}
      <div className="space-y-7 p-5 sm:p-8">
        <section><div className="mb-3 flex items-center gap-2"><PawPrint size={17} className="text-orange-500" /><h2 className="font-black">Visit and patient details</h2><span className="ml-auto inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700"><BadgeCheck size={13} />Auto populated</span></div><div className="grid gap-3 rounded-2xl bg-slate-50 p-4 dark:bg-slate-900 sm:grid-cols-2 lg:grid-cols-3">{[["Clinic / Veterinary Center", doctor.clinicName || "Smart Paw AI Veterinary Center"], ["Doctor", doctorName], ["Doctor ID / Registration", doctor.registrationNumber || "Not provided"], ["Consultation Date / Time", `${new Date(appointmentDate).toLocaleDateString()} · ${consultation.requestedTime || "Not recorded"}`], ["Consultation ID", consultation._id], ["Pet", pet.name], ["Species", pet.species], ["Breed", pet.breed], ["Age", pet.age == null ? "Not recorded" : `${pet.age} years`], ["Gender", pet.gender], ["Owner", consultation.userId?.name], ["Chief Complaint", consultation.primaryConcern]].map(([label, value]) => <div key={label} className="min-w-0"><p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">{label}</p><p className="mt-1 break-words text-sm font-semibold text-slate-800 dark:text-slate-100">{value || "—"}</p></div>)}</div></section>
        {[["summary", "Consultation summary"], ["assessment", "Clinical assessment"], ["treatment", "Treatment & prescription"], ["care", "Home care & follow-up"], ["closing", "Additional notes & final remarks"]].map(([group, heading]) => <section key={group}><div className="mb-3 flex items-center gap-2"><ClipboardList size={17} className="text-orange-500" /><h2 className="font-black">{heading}</h2></div><div className="grid gap-4 sm:grid-cols-2">{fields.filter(([, , , , section]) => section === group).map(([key, label, placeholder, required]) => { const requiredNow = required || (Boolean(values.medicines?.trim()) && ["dosageInstructions", "frequency", "medicationDuration"].includes(key)); return <label key={key} className={`block text-xs font-bold text-slate-600 dark:text-slate-300 ${["summary", "symptomsDiscussed", "observations", "diagnosis", "treatment", "homeCare", "emergencyInstructions", "additionalNotes", "finalRemarks"].includes(key) ? "sm:col-span-2" : ""}`}>{label}{requiredNow && <span className="ml-1 text-rose-500">*</span>}<textarea required={requiredNow} maxLength={key === "followUp" || key === "emergencyInstructions" || key === "dietHydration" ? 3000 : 5000} rows={key === "summary" || key === "diagnosis" || key === "treatment" ? 3 : 2} value={values[key] || ""} onChange={(event) => setValues((current) => ({ ...current, [key]: event.target.value }))} placeholder={placeholder} className={inputStyle} /></label>; })}</div></section>)}
        <section className="rounded-2xl border border-orange-100 bg-orange-50/70 p-4 dark:border-orange-900/50 dark:bg-orange-950/20"><p className="text-sm font-bold text-slate-800 dark:text-slate-100">Doctor's signature / final remarks</p><p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{doctorName}{doctor.registrationNumber ? ` · Registration ${doctor.registrationNumber}` : ""}</p><p className="mt-1 text-xs text-slate-500">Report generated on submission: {new Date().toLocaleString()}</p></section>
        <footer className="flex flex-wrap justify-end gap-3 border-t border-slate-100 pt-5 dark:border-slate-800"><Link to={`/doctor/consultations/${consultationId}`} className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-bold text-slate-600 dark:border-slate-700 dark:text-slate-300">Cancel</Link><button disabled={saving} className="rounded-xl bg-orange-500 px-6 py-3 text-sm font-black text-white shadow-sm hover:bg-orange-600 disabled:opacity-50">{saving ? "Saving report…" : "Save & Complete Consultation"}</button></footer>
      </div>
    </form>
  </div></main>;
}
