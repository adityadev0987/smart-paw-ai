import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, Download } from "lucide-react";
import { getConsultationById, getConsultationReportPdf } from "../services/api";

const reportSections = [
  ["Patient & visit", [["Clinic / veterinary center", "clinicName"], ["Doctor", "doctorName"], ["Registration number", "doctorRegistrationNumber"], ["Consultation date", "consultationDate"], ["Consultation ID", "consultationId"], ["Pet", "petName"], ["Species", "species"], ["Breed", "breed"], ["Age", "age"], ["Gender", "gender"], ["Owner", "ownerName"], ["Chief complaint", "chiefComplaint"]]],
  ["Clinical assessment", [["Symptoms / history", "symptomsDiscussed"], ["Clinical observations", "observations"], ["Diagnosis / assessment", "diagnosis"], ["Consultation summary", "summary"]]],
  ["Treatment plan", [["Treatment", "treatment"], ["Medication", "medicines"], ["Dosage", "dosageInstructions"], ["Frequency", "frequency"], ["Duration", "medicationDuration"], ["Recommendations", "advice"]]],
  ["Care & follow-up", [["Home care", "homeCare"], ["Diet / hydration advice", "dietHydration"], ["Follow-up", "followUp"], ["Warning / emergency instructions", "emergencyInstructions"], ["Additional notes", "additionalNotes"], ["Final remarks", "finalRemarks"]]],
];

export default function ConsultationReportView({ consultationId: providedId, backTo = "/consultations", embedded = false, allowDownload = true }) {
  const { consultationId: routeId } = useParams();
  const consultationId = providedId || routeId;
  const [consultation, setConsultation] = useState(null);
  const [pdfUrl, setPdfUrl] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    let objectUrl = "";
    getConsultationById(consultationId)
      .then(async (result) => {
        if (!active) return;
        setConsultation(result.consultation);
        if (!allowDownload) return;
        try {
          const blob = await getConsultationReportPdf(consultationId);
          if (!active) return;
          objectUrl = URL.createObjectURL(blob);
          setPdfUrl(objectUrl);
        } catch {
          if (active) setPdfUrl("");
        }
      })
      .catch((loadError) => { if (active) setError(loadError.message || "Unable to load the final report."); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; if (objectUrl) URL.revokeObjectURL(objectUrl); };
  }, [allowDownload, consultationId]);

  const report = consultation?.report;
  if (loading) return <main className="min-h-[calc(100vh-4rem)] bg-slate-50 p-8 dark:bg-[#0b0f14]"><p className="mx-auto max-w-5xl text-sm text-slate-500">Loading final report…</p></main>;
  if (error || !report?.submittedAt) return <main className="min-h-[calc(100vh-4rem)] bg-slate-50 px-4 py-8 dark:bg-[#0b0f14]"><section className="mx-auto max-w-3xl rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-[#111820]"><p role="alert" className="text-sm text-rose-600">{error || "The final report is not available yet."}</p><Link to={backTo} className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-orange-600"><ArrowLeft size={15} />Back</Link></section></main>;

  return <main className="min-h-[calc(100vh-4rem)] bg-slate-50 px-4 py-6 dark:bg-[#0b0f14] sm:px-6"><div className={`mx-auto ${embedded ? "max-w-5xl" : "max-w-4xl"}`}>
    {!embedded && <Link to={backTo} className="mb-4 inline-flex items-center gap-2 text-sm font-bold text-orange-600"><ArrowLeft size={16} />Back to consultations</Link>}
    <article className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-[#111820]">
      <header className="flex flex-wrap items-center justify-between gap-4 bg-[#102338] p-6 text-white"><div><p className="text-xs font-black uppercase tracking-[0.2em] text-orange-300">Smart Paw AI · Veterinary Care</p><h1 className="mt-2 text-2xl font-black">Final Consultation Report</h1><p className="mt-2 text-sm text-slate-300">{report.clinicName || "Veterinary Center"}</p><div className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-xs text-slate-300"><span>Report date: {new Date(report.submittedAt).toLocaleString()}</span><span>Consultation ID: {consultationId}</span></div></div>{allowDownload && (pdfUrl ? <a href={pdfUrl} download={`smart-paw-report-${consultationId}.pdf`} className="inline-flex items-center gap-2 rounded-xl bg-orange-500 px-4 py-3 text-sm font-bold text-white hover:bg-orange-600"><Download size={16} />Download PDF</a> : <span className="text-xs text-slate-300">PDF is not available yet</span>)}</header>
      <div className="space-y-6 p-5 sm:p-8">{reportSections.map(([section, fields]) => <section key={section}><h2 className="border-b border-orange-200 pb-2 text-sm font-black uppercase tracking-wide text-orange-700 dark:border-orange-900 dark:text-orange-300">{section}</h2><dl className="mt-4 grid gap-x-6 gap-y-4 sm:grid-cols-2">{fields.filter(([, key]) => report[key] !== undefined && report[key] !== null && String(report[key]).trim()).map(([label, key]) => <div key={key} className="min-w-0"><dt className="text-[10px] font-bold uppercase tracking-wide text-slate-400">{label}</dt><dd className="mt-1 whitespace-pre-wrap break-words text-sm leading-6 text-slate-800 dark:text-slate-100">{key === "consultationDate" ? new Date(report[key]).toLocaleString() : report[key]}</dd></div>)}</dl></section>)}<div className="border-t border-slate-200 pt-4 dark:border-slate-700"><p className="text-sm font-bold">{report.doctorName}</p><p className="mt-1 text-xs text-slate-500">Veterinarian · Electronically prepared through Smart Paw AI</p></div></div>
    </article>
  </div></main>;
}
