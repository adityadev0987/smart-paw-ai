import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  FileText,
  HeartPulse,
  ImagePlus,
  Loader2,
  PawPrint,
  ShieldCheck,
  Stethoscope,
  Trash2,
} from "lucide-react";
import { useAppContext } from "../hooks/useAppContext";
import {
  createConsultationAssessment,
  getConsultations,
  requestConsultation,
  getConsultationMessages,
  sendConsultationMessage,
  cancelConsultation,
  rescheduleConsultation,
} from "../services/api";
import { connectConsultationSocket } from "../services/consultationSocket";

const API_BASE_URL = "http://localhost:5000/api";
const MAX_PHOTOS = 5;
const MAX_PHOTO_SIZE = 5 * 1024 * 1024;
const concernOptions = [
  "Skin problem",
  "Digestive problem",
  "Injury",
  "Fever",
  "Appetite problem",
  "Breathing problem",
  "Behaviour change",
  "Other",
];
const initialConcern = {
  primaryConcern: "",
  symptoms: "",
  duration: "",
  severity: "",
  appetite: "Normal",
  waterIntake: "Normal",
  activityLevel: "Normal",
  additionalNotes: "",
};

function getHeaders() {
  const token = localStorage.getItem("smartPawToken");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

function imageUrl(url) {
  if (!url) return "";
  return url.startsWith("http") || url.startsWith("data:")
    ? url
    : `${API_BASE_URL.replace(/\/api$/, "")}${url}`;
}

function formatDate(value) {
  if (!value) return "Date not set";
  return new Date(value).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function statusLabel(status) {
  return (
    {
      AI_ASSESSMENT: "AI Assessment",
      PENDING: "Consultation Pending",
      ASSIGNED: "Doctor Assigned",
      ACCEPTED: "Accepted by Veterinarian",
      IN_PROGRESS: "Consultation In Progress",
      COMPLETED: "Consultation Completed",
      CANCELLED: "Cancelled",
    }[status] || status
  );
}

function riskColor(level) {
  return (
    {
      EMERGENCY:
        "border-red-300 bg-red-50 text-red-800 dark:border-red-900 dark:bg-red-950/40 dark:text-red-200",
      HIGH: "border-orange-300 bg-orange-50 text-orange-800 dark:border-orange-900 dark:bg-orange-950/40 dark:text-orange-200",
      MODERATE:
        "border-amber-300 bg-amber-50 text-amber-800 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-200",
      LOW: "border-emerald-300 bg-emerald-50 text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-200",
    }[level] ||
    "border-slate-200 bg-slate-50 text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
  );
}

export default function DoctorConsultation() {
  const { pets = [], isPetLoading, setCurrentPet } = useAppContext();
  const [searchParams] = useSearchParams();
  const preselectedPetId = searchParams.get("petId") || "";
  const [view, setView] = useState(preselectedPetId ? "concern" : "dashboard");
  const [selectedPetId, setSelectedPetId] = useState(preselectedPetId);
  const [history, setHistory] = useState([]);
  const [consultation, setConsultation] = useState(null);
  const [rescheduling, setRescheduling] = useState(false);
  const [concern, setConcern] = useState(initialConcern);
  const [photos, setPhotos] = useState([]);
  const photoPreviews = useRef([]);
  const [photoError, setPhotoError] = useState("");
  const [historyLoading, setHistoryLoading] = useState(true);
  const [working, setWorking] = useState(false);
  const [error, setError] = useState("");
  const [booking, setBooking] = useState({
    consultationType: "Video Consultation",
    requestedDate: "",
    requestedTime: "",
    ownerMessage: "",
  });

  const selectedPet = useMemo(
    () =>
      pets.find((pet) => String(pet._id || pet.id) === String(selectedPetId)),
    [pets, selectedPetId],
  );
  const minDate = new Date().toLocaleDateString("en-CA");

  const loadHistory = useCallback(async () => {
    try {
      setHistoryLoading(true);
      const data = await getConsultations();
      setHistory(Array.isArray(data?.consultations) ? data.consultations : []);
    } catch (loadError) {
      setError(loadError.message || "Unable to load consultation history.");
    } finally {
      setHistoryLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => loadHistory(), 0);
    return () => window.clearTimeout(timer);
  }, [loadHistory]);
  useEffect(() => {
    const timer = window.setInterval(() => loadHistory(), 20000);
    return () => window.clearInterval(timer);
  }, [loadHistory]);
  useEffect(() => {
    if (!preselectedPetId || !selectedPet) return undefined;
    const timer = window.setTimeout(() => setCurrentPet(selectedPet), 0);
    return () => window.clearTimeout(timer);
  }, [preselectedPetId, selectedPet, setCurrentPet]);
  useEffect(
    () => () =>
      photoPreviews.current.forEach((preview) => URL.revokeObjectURL(preview)),
    [],
  );

  function choosePhotos(event) {
    const files = Array.from(event.target.files || []);
    event.target.value = "";
    setPhotoError("");
    if (photos.length + files.length > MAX_PHOTOS) {
      setPhotoError(`Add up to ${MAX_PHOTOS} photos.`);
      return;
    }
    const invalid = files.find(
      (file) =>
        !["image/jpeg", "image/png", "image/webp"].includes(file.type) ||
        file.size > MAX_PHOTO_SIZE,
    );
    if (invalid) {
      setPhotoError(
        invalid.size > MAX_PHOTO_SIZE
          ? `${invalid.name} exceeds 5 MB.`
          : "Use a JPG, PNG, or WebP photo.",
      );
      return;
    }
    const added = files.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
    }));
    photoPreviews.current.push(...added.map((photo) => photo.preview));
    setPhotos((current) => [...current, ...added]);
  }

  function removePhoto(preview) {
    URL.revokeObjectURL(preview);
    photoPreviews.current = photoPreviews.current.filter(
      (item) => item !== preview,
    );
    setPhotos((current) =>
      current.filter((photo) => photo.preview !== preview),
    );
  }

  async function getHealthAssessment(event) {
    event.preventDefault();
    if (!selectedPetId) {
      setError("Select a pet before continuing.");
      return;
    }
    setError("");
    setWorking(true);
    setView("processing");
    try {
      const media = await Promise.all(
        photos.map(async ({ file }) => {
          const body = new FormData();
          body.append("image", file);
          const response = await fetch(
            `${API_BASE_URL}/uploads/community-image`,
            { method: "POST", headers: getHeaders(), body },
          );
          const uploaded = await response.json().catch(() => ({}));
          if (!response.ok)
            throw new Error(
              uploaded.message || "Unable to upload a health photo.",
            );
          if (!uploaded.imageUrl)
            throw new Error("Photo upload did not return an image.");
          return uploaded.imageUrl;
        }),
      );
      const data = await createConsultationAssessment({
        petId: selectedPetId,
        ...concern,
        media,
      });
      setConsultation(data.consultation);
      photos.forEach((photo) => URL.revokeObjectURL(photo.preview));
      photoPreviews.current = photoPreviews.current.filter(
        (preview) => !photos.some((photo) => photo.preview === preview),
      );
      setPhotos([]);
      setView("assessment");
      await loadHistory();
    } catch (submitError) {
      setError(submitError.message || "Unable to prepare the assessment.");
      setView("concern");
    } finally {
      setWorking(false);
    }
  }

  async function submitBooking(event) {
    event.preventDefault();
    if (!consultation?._id) return;
    setWorking(true);
    setError("");
    try {
      const data = rescheduling ? await rescheduleConsultation(consultation._id, booking) : await requestConsultation(consultation._id, booking);
      setConsultation(data.consultation);
      setView("confirmation");
      setRescheduling(false);
      await loadHistory();
    } catch (bookingError) {
      setError(bookingError.message || "Unable to request a consultation.");
    } finally {
      setWorking(false);
    }
  }

  function startConsultation() {
    setError("");
    setConsultation(null);
    setConcern(initialConcern);
    photos.forEach((photo) => URL.revokeObjectURL(photo.preview));
    photoPreviews.current.forEach((preview) => URL.revokeObjectURL(preview));
    photoPreviews.current = [];
    setPhotos([]);
    setSelectedPetId(preselectedPetId || "");
    setView(
      preselectedPetId &&
        pets.some((pet) => String(pet._id || pet.id) === preselectedPetId)
        ? "concern"
        : "pet-select",
    );
  }

  function selectPet(petId) {
    setSelectedPetId(petId);
    const pet = pets.find((item) => String(item._id || item.id) === String(petId));
    if (pet) setCurrentPet(pet);
  }

  const pageHeading = (
    <header className="mb-6 flex flex-wrap items-center justify-between gap-4">
      <div>
        <p className="text-xs font-black uppercase tracking-[.18em] text-orange-500">
          Pet profile · AI · Veterinary care
        </p>
        <h1 className="mt-1 text-3xl font-black tracking-tight">
          Doctor Consultation
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500 dark:text-slate-400">
          Get AI-assisted guidance and connect your pet's health information
          with a veterinary consultation.
        </p>
      </div>
      {view === "dashboard" && (
        <button
          type="button"
          onClick={startConsultation}
          className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-orange-500 px-5 py-3 text-sm font-black text-white shadow-sm transition hover:bg-orange-600"
        >
          <Stethoscope size={17} /> Start Consultation
        </button>
      )}
    </header>
  );

  return (
    <main className="mx-auto min-h-screen max-w-6xl px-4 py-8 sm:px-6">
      {view !== "dashboard" && view !== "processing" && (
        <button
          type="button"
          onClick={() => {
            setError("");
            setView(
              view === "concern" && !preselectedPetId
                ? "pet-select"
                : view === "booking"
                  ? "assessment"
                  : "dashboard",
            );
          }}
          className="mb-4 inline-flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-orange-500"
        >
          <ArrowLeft size={16} /> Back
        </button>
      )}
      {pageHeading}
      {error && (
        <div
          role="alert"
          className="mb-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/30 dark:text-red-200"
        >
          {error}
        </div>
      )}

      {view === "dashboard" && (
        <>
          <section className="mb-8 grid gap-5 rounded-3xl bg-gradient-to-br from-orange-500 to-amber-500 p-6 text-white shadow-sm sm:grid-cols-[1fr_auto] sm:items-center sm:p-8">
            <div>
              <div className="flex items-center gap-2 text-sm font-bold text-orange-100">
                <HeartPulse size={18} /> Smart Paw AI pre-consultation
              </div>
              <h2 className="mt-3 max-w-2xl text-2xl font-black sm:text-3xl">
                A clearer first step for your pet's health concern.
              </h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-orange-50">
                Start with your pet's profile, symptoms, and optional photos.
                Carry the resulting health snapshot into a structured veterinary
                request.
              </p>
            </div>
            <div className="hidden h-20 w-20 items-center justify-center rounded-3xl bg-white/15 sm:flex">
              <Stethoscope size={38} />
            </div>
          </section>
          <section>
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-black">Consultation History</h2>
                <p className="mt-1 text-sm text-slate-500">
                  Saved assessments and consultation requests for your pets.
                </p>
              </div>
            </div>
            {historyLoading ? (
              <div className="flex items-center justify-center rounded-2xl border border-slate-200 p-10 text-sm text-slate-500 dark:border-slate-800">
                <Loader2 className="mr-2 animate-spin" size={18} /> Loading
                consultation history…
              </div>
            ) : history.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-300 p-10 text-center dark:border-slate-700">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-50 text-orange-500 dark:bg-orange-500/10">
                  <FileText />
                </div>
                <p className="mt-3 font-bold">No consultations yet</p>
                <p className="mt-1 text-sm text-slate-500">
                  Your saved AI assessments and consultation requests will
                  appear here.
                </p>
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {history.map((item) => (
                  <ConsultationCard
                    key={item._id}
                    item={item}
                    onOpen={() => {
                      setConsultation(item);
                      setView("details");
                    }}
                  />
                ))}
              </div>
            )}
          </section>
        </>
      )}

      {view === "pet-select" && (
        <section>
          <StepHeading
            step="1"
            title="Select a pet"
            subtitle="We'll use the profile information already saved in Smart Paw AI."
          />
          <PetSelection
            pets={pets}
            loading={isPetLoading}
            selectedPetId={selectedPetId}
            onSelect={selectPet}
          />
          <div className="mt-5 flex justify-end">
            <button
              disabled={!selectedPetId}
              onClick={() => setView("concern")}
              className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-orange-500 px-5 py-3 text-sm font-black text-white disabled:cursor-not-allowed disabled:opacity-50"
            >
              Continue <ArrowRight size={17} />
            </button>
          </div>
        </section>
      )}

      {view === "concern" && (
        <form onSubmit={getHealthAssessment} className="space-y-5">
          <StepHeading
            step="2"
            title="Tell us what you’re noticing"
            subtitle="Pet details are attached from the selected profile. Describe what has changed recently."
          />
          {selectedPet && <PetBanner pet={selectedPet} />}
          <div className="grid gap-4 rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-[#0d131a] sm:grid-cols-2">
            <SelectField
              required
              label="Primary concern"
              value={concern.primaryConcern}
              options={concernOptions}
              onChange={(value) =>
                setConcern({ ...concern, primaryConcern: value })
              }
            />
            <SelectField
              required
              label="Duration"
              value={concern.duration}
              options={[
                "Today",
                "1-2 days",
                "3-7 days",
                "More than a week",
                "More than a month",
              ]}
              onChange={(value) => setConcern({ ...concern, duration: value })}
            />
            <SelectField
              required
              label="Severity"
              value={concern.severity}
              options={["Mild", "Moderate", "Severe"]}
              onChange={(value) => setConcern({ ...concern, severity: value })}
            />
            <SelectField
              required
              label="Appetite"
              value={concern.appetite}
              options={["Normal", "Reduced", "Not eating"]}
              onChange={(value) => setConcern({ ...concern, appetite: value })}
            />
            <SelectField
              required
              label="Water intake"
              value={concern.waterIntake}
              options={["Normal", "Increased", "Reduced"]}
              onChange={(value) =>
                setConcern({ ...concern, waterIntake: value })
              }
            />
            <SelectField
              required
              label="Activity level"
              value={concern.activityLevel}
              options={["Normal", "Less active", "Very weak"]}
              onChange={(value) =>
                setConcern({ ...concern, activityLevel: value })
              }
            />
            <TextArea
              className="sm:col-span-2"
              required
              label="What symptoms are you noticing?"
              value={concern.symptoms}
              rows={5}
              onChange={(value) => setConcern({ ...concern, symptoms: value })}
              placeholder="Describe what you have observed, when it happens, and whether it is changing."
            />
            <TextArea
              className="sm:col-span-2"
              label="Additional notes (optional)"
              value={concern.additionalNotes}
              rows={3}
              onChange={(value) =>
                setConcern({ ...concern, additionalNotes: value })
              }
              placeholder="Anything else that may help the assessment?"
            />
            <div className="sm:col-span-2">
              <label className="mb-2 block text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Health concern photos (optional)
              </label>
              <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-dashed border-slate-300 px-4 py-3 text-sm font-bold text-slate-600 hover:border-orange-400 hover:text-orange-500 dark:border-slate-700 dark:text-slate-300">
                <ImagePlus size={17} /> Add photos
                <input
                  className="sr-only"
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  multiple
                  onChange={choosePhotos}
                  disabled={photos.length >= MAX_PHOTOS}
                />
              </label>
              <p className="mt-1 text-xs text-slate-400">
                JPG, PNG or WebP · up to 5 photos · max 5 MB each
              </p>
              {photoError && (
                <p role="alert" className="mt-2 text-sm text-red-500">
                  {photoError}
                </p>
              )}
              {photos.length > 0 && (
                <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {photos.map((photo) => (
                    <div
                      key={photo.preview}
                      className="overflow-hidden rounded-xl border border-slate-200 dark:border-slate-700"
                    >
                      <div className="flex h-40 items-center justify-center bg-slate-50 p-2 dark:bg-slate-900">
                        <img
                          src={photo.preview}
                          alt={photo.file.name}
                          className="max-h-full max-w-full object-contain"
                        />
                      </div>
                      <div className="flex items-center justify-between gap-2 px-3 py-2">
                        <span className="truncate text-xs text-slate-500">
                          {photo.file.name}
                        </span>
                        <button
                          type="button"
                          onClick={() => removePhoto(photo.preview)}
                          aria-label={`Remove ${photo.file.name}`}
                          className="shrink-0 rounded-lg p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-500"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          <button
            disabled={working || !selectedPetId}
            className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-orange-500 px-5 py-3 text-sm font-black text-white shadow-sm hover:bg-orange-600 disabled:opacity-60 sm:w-auto"
          >
            <SparklesIcon /> Get AI Health Assessment
          </button>
        </form>
      )}

      {view === "processing" && (
        <section className="mx-auto max-w-xl rounded-3xl border border-slate-200 bg-white p-10 text-center shadow-sm dark:border-slate-800 dark:bg-[#0d131a]">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-orange-50 text-orange-500 dark:bg-orange-500/10">
            <Loader2 size={30} className="animate-spin" />
          </div>
          <h2 className="mt-5 text-xl font-black">
            Smart Paw AI is analyzing the information…
          </h2>
          <p className="mt-2 text-sm leading-6 text-slate-500">
            Reviewing the pet profile, reported symptoms, and safety signals.
            This may take a moment.
          </p>
        </section>
      )}

      {view === "assessment" && consultation && (
        <AssessmentView
          consultation={consultation}
          onBook={() => {
            setBooking({
              consultationType: "Video Consultation",
              requestedDate: "",
              requestedTime: "",
              ownerMessage: "",
            });
            setView("booking");
          }}
          onSave={async () => {
            await loadHistory();
            setView("dashboard");
          }}
        />
      )}

      {view === "booking" && consultation && (
        <form onSubmit={submitBooking} className="space-y-5">
          <StepHeading
            step="Veterinary care"
            title={rescheduling ? "Reschedule consultation" : "Request a consultation"}
            subtitle="Your pet profile, symptoms, photos, and AI health snapshot will be shared with this request."
          />
          <CaseSummary consultation={consultation} />
          <div className="grid gap-4 rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-[#0d131a] sm:grid-cols-2">
            <SelectField
              required
              label="Consultation type"
              value={booking.consultationType}
              options={["Video Consultation", "Chat Consultation"]}
              onChange={(value) =>
                setBooking({ ...booking, consultationType: value })
              }
            />
            <label className="block text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Preferred date
              <input
                required
                min={minDate}
                type="date"
                value={booking.requestedDate}
                onChange={(e) =>
                  setBooking({ ...booking, requestedDate: e.target.value })
                }
                className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-900 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100 dark:border-slate-700 dark:bg-[#111923] dark:text-white"
              />
            </label>
            <label className="block text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Preferred time
              <input
                required
                type="time"
                value={booking.requestedTime}
                onChange={(e) =>
                  setBooking({ ...booking, requestedTime: e.target.value })
                }
                className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-900 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100 dark:border-slate-700 dark:bg-[#111923] dark:text-white"
              />
            </label>
            <TextArea
              className="sm:col-span-2"
              label="Message for the veterinary team (optional)"
              value={booking.ownerMessage}
              rows={3}
              onChange={(value) =>
                setBooking({ ...booking, ownerMessage: value })
              }
            />
          </div>
          <button
            disabled={working}
            className="inline-flex min-h-12 items-center gap-2 rounded-xl bg-orange-500 px-5 py-3 text-sm font-black text-white disabled:opacity-60"
          >
            {working ? (
              <Loader2 size={17} className="animate-spin" />
            ) : (
              <CalendarDays size={17} />
            )}{" "}
            {rescheduling ? "Update Consultation Time" : "Request Consultation"}
          </button>
        </form>
      )}

      {view === "confirmation" && consultation && (
        <section className="mx-auto max-w-2xl rounded-3xl border border-emerald-200 bg-white p-6 shadow-sm dark:border-emerald-900 dark:bg-[#0d131a] sm:p-8">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10">
            <CheckCircle2 size={30} />
          </div>
          <h2 className="mt-4 text-2xl font-black">
            Consultation request submitted successfully.
          </h2>
          <p className="mt-2 text-sm text-slate-500">
            Your pet’s health information and snapshot are attached to this
            request.
          </p>
          <dl className="mt-6 grid gap-3 rounded-2xl bg-slate-50 p-4 text-sm dark:bg-slate-900 sm:grid-cols-2">
            <Fact label="Pet" value={consultation.petId?.name} />
            <Fact label="Concern" value={consultation.primaryConcern} />
            <Fact label="Date" value={formatDate(consultation.requestedDate)} />
            <Fact label="Time" value={consultation.requestedTime} />
            <Fact label="Type" value={consultation.consultationType} />
            <Fact label="Status" value={statusLabel(consultation.status)} />
          </dl>
          <button
            onClick={() => {
              setError("");
              setView("dashboard");
              loadHistory();
            }}
            className="mt-5 rounded-xl bg-orange-500 px-5 py-3 text-sm font-black text-white"
          >
            View Consultation History
          </button>
        </section>
      )}

      {view === "details" && consultation && (
        <ConsultationDetails
          consultation={consultation}
          onBook={() => { setRescheduling(false); setView("booking"); }}
          onReschedule={() => { setRescheduling(true); setBooking({ consultationType: consultation.consultationType || "Video Consultation", requestedDate: consultation.requestedDate ? new Date(consultation.requestedDate).toISOString().slice(0, 10) : "", requestedTime: consultation.requestedTime || "", ownerMessage: consultation.ownerMessage || "" }); setView("booking"); }}
          onUpdated={(updated) => { setConsultation(updated); setHistory((current) => current.map((item) => item._id === updated._id ? updated : item)); }}
          onCancelled={async () => { await cancelConsultation(consultation._id); await loadHistory(); setConsultation((current) => ({ ...current, status: "CANCELLED" })); }}
        />
      )}
    </main>
  );
}

function StepHeading({ step, title, subtitle }) {
  return (
    <div className="mb-4">
      <p className="text-xs font-black uppercase tracking-[.16em] text-orange-500">
        {step === "1" || step === "2" ? `Step ${step}` : step}
      </p>
      <h2 className="mt-1 text-2xl font-black">{title}</h2>
      <p className="mt-1 text-sm text-slate-500">{subtitle}</p>
    </div>
  );
}

function PetSelection({ pets, loading, selectedPetId, onSelect }) {
  if (loading)
    return (
      <div className="rounded-2xl border border-slate-200 p-8 text-center text-sm text-slate-500 dark:border-slate-800">
        <Loader2 className="mx-auto mb-2 animate-spin" />
        Loading your pets…
      </div>
    );
  if (!pets.length)
    return (
      <div className="rounded-2xl border border-dashed border-slate-300 p-8 text-center dark:border-slate-700">
        <PawPrint className="mx-auto text-orange-500" />
        <p className="mt-2 font-bold">Add a pet profile to start</p>
        <Link
          to="/pet-profile"
          className="mt-3 inline-flex rounded-xl bg-orange-500 px-4 py-2.5 text-sm font-bold text-white"
        >
          Open Pet Profile
        </Link>
      </div>
    );
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {pets.map((pet) => {
        const id = pet._id || pet.id;
        const selected = String(id) === String(selectedPetId);
        return (
          <button
            key={id}
            type="button"
            onClick={() => onSelect(id)}
            className={`overflow-hidden rounded-2xl border bg-white text-left transition dark:bg-[#0d131a] ${selected ? "border-orange-500 ring-2 ring-orange-100 dark:ring-orange-500/20" : "border-slate-200 hover:border-orange-300 dark:border-slate-800"}`}
          >
            <div className="flex h-36 items-center justify-center bg-orange-50 dark:bg-slate-900">
              {pet.profilePhoto ? (
                <img
                  src={imageUrl(pet.profilePhoto)}
                  alt={pet.name}
                  className="h-full w-full object-contain"
                />
              ) : (
                <PawPrint size={34} className="text-orange-400" />
              )}
            </div>
            <div className="p-4">
              <div className="flex items-center justify-between">
                <h3 className="font-black">{pet.name}</h3>
                <span
                  className={`h-4 w-4 rounded-full border-2 ${selected ? "border-orange-500 bg-orange-500 ring-2 ring-orange-100" : "border-slate-300 dark:border-slate-600"}`}
                />
              </div>
              <p className="mt-1 text-sm text-slate-500">
                {pet.species || "Pet"} · {pet.breed || "Breed not added"}
              </p>
              <p className="mt-1 text-xs text-slate-400">
                {pet.age ?? "Age not added"} years ·{" "}
                {pet.gender || "Gender not added"}
              </p>
            </div>
          </button>
        );
      })}
    </div>
  );
}

function PetBanner({ pet }) {
  return (
    <div className="flex items-center gap-4 rounded-2xl border border-orange-100 bg-orange-50 p-4 dark:border-orange-900/50 dark:bg-orange-500/10">
      <div className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-2xl bg-white text-orange-500 dark:bg-slate-900">
        {pet.profilePhoto ? (
          <img
            src={imageUrl(pet.profilePhoto)}
            alt={pet.name}
            className="h-full w-full object-contain"
          />
        ) : (
          <PawPrint />
        )}
      </div>
      <div>
        <p className="font-black">{pet.name}</p>
        <p className="text-xs text-slate-500">
          {[
            pet.species,
            pet.breed,
            pet.age != null ? `${pet.age} years` : "",
            pet.gender,
          ]
            .filter(Boolean)
            .join(" · ")}
        </p>
      </div>
      <ShieldCheck className="ml-auto text-orange-500" />
    </div>
  );
}

function SelectField({ label, value, options, onChange, required = false }) {
  return (
    <label className="block text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
      {label}
      <select
        required={required}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-900 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100 dark:border-slate-700 dark:bg-[#111923] dark:text-white"
      >
        <option value="">Select</option>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  );
}
function TextArea({
  label,
  value,
  onChange,
  required = false,
  rows = 3,
  className = "",
  placeholder = "",
}) {
  return (
    <label
      className={`block text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 ${className}`}
    >
      {label}
      <textarea
        required={required}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        rows={rows}
        placeholder={placeholder}
        className="mt-2 w-full resize-y rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-normal leading-6 text-slate-900 outline-none placeholder:text-slate-400 focus:border-orange-500 focus:ring-2 focus:ring-orange-100 dark:border-slate-700 dark:bg-[#111923] dark:text-white"
      />
    </label>
  );
}

function ConsultationCard({ item, onOpen }) {
  const pet = item.petId || {};
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-[#0d131a]">
      <div className="flex gap-3">
        <PetAvatar pet={pet} />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h3 className="font-black">{pet.name || "Pet"}</h3>
            <span className="rounded-full bg-orange-50 px-2.5 py-1 text-[10px] font-black text-orange-700 dark:bg-orange-500/10 dark:text-orange-300">
              {statusLabel(item.status)}
            </span>
          </div>
          <p className="mt-1 text-sm font-semibold text-slate-700 dark:text-slate-300">
            {item.primaryConcern}
          </p>
          <p className="mt-1 text-xs text-slate-400">
            {formatDate(item.requestedDate || item.createdAt)}
            {item.consultationType ? ` · ${item.consultationType}` : ""}
          </p>
        </div>
      </div>
      <p className="mt-3 line-clamp-2 text-sm leading-6 text-slate-500">
        {item.aiSummary || item.symptoms}
      </p>
      <button
        onClick={onOpen}
        className="mt-3 inline-flex items-center gap-1 text-sm font-black text-orange-600 hover:text-orange-700 dark:text-orange-400"
      >
        View Details <ArrowRight size={15} />
      </button>
    </article>
  );
}

function PetAvatar({ pet, size = "h-12 w-12" }) {
  return (
    <div
      className={`flex ${size} shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-orange-50 text-orange-500 dark:bg-orange-500/10`}
    >
      {pet?.profilePhoto ? (
        <img
          src={imageUrl(pet.profilePhoto)}
          alt={pet.name || "Pet"}
          className="h-full w-full object-contain"
        />
      ) : (
        <PawPrint size={20} />
      )}
    </div>
  );
}
function CaseSummary({ consultation }) {
  const pet = consultation.petId || {};
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-[#0d131a]">
      <div className="flex items-center gap-3">
        <PetAvatar pet={pet} />
        <div>
          <p className="font-black">
            {pet.name || "Pet"} · {consultation.primaryConcern}
          </p>
          <p className="text-xs text-slate-500">
            {[
              pet.species,
              pet.breed,
              pet.age != null ? `${pet.age} years` : "",
              pet.gender,
            ]
              .filter(Boolean)
              .join(" · ")}
          </p>
        </div>
      </div>
      <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-300">
        {consultation.symptoms}
      </p>
      <p className="mt-2 text-xs text-slate-500">
        {consultation.duration} · {consultation.severity} severity ·{" "}
        {consultation.aiRiskLevel} AI risk
      </p>
    </div>
  );
}

function AssessmentView({ consultation, onBook, onSave }) {
  const assessment = consultation.aiAssessment || {};
  return (
    <section className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <StepHeading
          step="AI pre-consultation"
          title="Preliminary AI assessment"
          subtitle="This is guidance to help prepare for veterinary care, not a diagnosis."
        />
        <span
          className={`rounded-full border px-3 py-1.5 text-xs font-black ${riskColor(consultation.aiRiskLevel)}`}
        >
          {consultation.aiRiskLevel}
        </span>
      </div>
      <CaseSummary consultation={consultation} />
      {consultation.aiRiskLevel === "EMERGENCY" && (
        <div className="flex gap-3 rounded-2xl border border-red-300 bg-red-50 p-4 text-red-800 dark:border-red-900 dark:bg-red-950/40 dark:text-red-200">
          <AlertTriangle className="shrink-0" />
          <div>
            <p className="font-black">Seek veterinary care promptly</p>
            <p className="mt-1 text-sm">
              The reported information includes a potentially urgent warning
              sign. Contact a veterinarian or emergency veterinary service now.
            </p>
          </div>
        </div>
      )}
      <div className="grid gap-4 lg:grid-cols-2">
        <section className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-[#0d131a]">
          <h3 className="font-black">Concern summary</h3>
          <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
            {assessment.summary || consultation.aiSummary}
          </p>
          <h4 className="mt-4 text-xs font-black uppercase tracking-wider text-slate-400">
            Possible areas of concern
          </h4>
          <ul className="mt-2 list-inside list-disc space-y-1 text-sm text-slate-600 dark:text-slate-300">
            {(assessment.possibleConcerns || []).map((text) => (
              <li key={text}>{text}</li>
            ))}
          </ul>
        </section>
        <section className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-[#0d131a]">
          <h3 className="font-black">Suggested next steps</h3>
          <ul className="mt-3 space-y-2 text-sm text-slate-600 dark:text-slate-300">
            {(assessment.recommendedActions || []).map((action) => (
              <li key={action} className="flex gap-2">
                <CheckCircle2
                  size={16}
                  className="mt-0.5 shrink-0 text-orange-500"
                />
                {action}
              </li>
            ))}
          </ul>
        </section>
      </div>
      <HealthSnapshot consultation={consultation} />
      {consultation.media?.length > 0 && (
        <PhotoGallery media={consultation.media} />
      )}
      <Disclaimer text={assessment.disclaimer} />
      <div className="flex flex-col-reverse gap-3 sm:flex-row">
        <button
          onClick={onSave}
          className="min-h-11 rounded-xl border border-slate-200 px-5 py-3 text-sm font-black dark:border-slate-700"
        >
          Save Assessment
        </button>
        <button
          onClick={onBook}
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-orange-500 px-5 py-3 text-sm font-black text-white hover:bg-orange-600"
        >
          <Stethoscope size={17} /> Consult a Veterinarian
        </button>
      </div>
    </section>
  );
}

function HealthSnapshot({ consultation }) {
  const snapshot = consultation.healthSnapshot || {};
  return (
    <section className="rounded-2xl border border-orange-200 bg-orange-50 p-5 dark:border-orange-900/60 dark:bg-orange-500/10">
      <div className="flex items-center gap-2 text-orange-700 dark:text-orange-300">
        <HeartPulse size={19} />
        <h3 className="font-black">Pet Health Snapshot</h3>
      </div>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <Fact label="Pet" value={snapshot.petName} />
        <Fact label="Concern" value={snapshot.primaryConcern} />
        <Fact label="Duration" value={snapshot.duration} />
        <Fact label="Severity" value={snapshot.severity} />
        <Fact label="Symptoms" value={snapshot.symptoms} />
        <Fact label="AI risk level" value={snapshot.aiRiskLevel} />
        <Fact label="Recommended action" value={snapshot.recommendedAction} />
      </div>
    </section>
  );
}

function ConsultationDetails({ consultation, onBook, onReschedule, onUpdated, onCancelled }) {
  const pet = consultation.petId || {};
  return (
    <section className="space-y-5">
      <div className="flex items-center gap-3">
        <PetAvatar pet={pet} size="h-16 w-16" />
        <div>
          <h2 className="text-2xl font-black">
            {pet.name || "Pet"} consultation
          </h2>
          <p className="text-sm text-slate-500">
            {consultation.primaryConcern} · {statusLabel(consultation.status)}
          </p>
        </div>
      </div>
      <CaseSummary consultation={consultation} />
      <HealthSnapshot consultation={consultation} />
      <section className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-[#0d131a]">
        <h3 className="font-black">Health concern details</h3>
        <dl className="mt-3 grid gap-3 sm:grid-cols-2">
          <Fact label="Duration" value={consultation.duration} />
          <Fact label="Severity" value={consultation.severity} />
          <Fact label="Appetite" value={consultation.appetite} />
          <Fact label="Water intake" value={consultation.waterIntake} />
          <Fact label="Activity" value={consultation.activityLevel} />
          <Fact label="Additional notes" value={consultation.additionalNotes} />
        </dl>
      </section>
      <section className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-[#0d131a]">
        <h3 className="font-black">Preliminary AI assessment</h3>
        <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
          {consultation.aiSummary}
        </p>
        <ul className="mt-3 space-y-2 text-sm text-slate-600 dark:text-slate-300">
          {consultation.aiAssessment?.recommendedActions?.map((action) => (
            <li key={action}>• {action}</li>
          ))}
        </ul>
      </section>
      {consultation.media?.length > 0 && (
        <PhotoGallery media={consultation.media} />
      )}
      {consultation.status !== "AI_ASSESSMENT" && (
        <section className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-[#0d131a]">
          <h3 className="font-black">Consultation request</h3>
          <dl className="mt-3 grid gap-3 sm:grid-cols-2">
            <Fact label="Type" value={consultation.consultationType} />
            <Fact label="Date" value={formatDate(consultation.requestedDate)} />
            <Fact label="Time" value={consultation.requestedTime} />
            <Fact label="Status" value={statusLabel(consultation.status)} />
            <Fact label="Message" value={consultation.ownerMessage} />
          </dl>
        </section>
      )}
      {consultation.veterinarianId && (
        <section className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-[#0d131a]">
          <h3 className="font-black">Assigned veterinarian</h3>
          <p className="mt-2 text-sm font-semibold">{consultation.veterinarianId?.name} · {consultation.veterinarianId?.doctorProfile?.qualification || "Veterinarian"}</p>
          <p className="mt-1 text-xs text-slate-500">{consultation.veterinarianId?.doctorProfile?.isOnline ? "Online now" : "Offline · will respond in your scheduled consultation"}</p>
          {consultation.veterinarianId?.doctorProfile?.specialization?.length > 0 && <p className="mt-1 text-xs text-slate-500">{consultation.veterinarianId.doctorProfile.specialization.join(" · ")}</p>}
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {[['Clinical observations', consultation.clinicalObservations], ['Advice', consultation.doctorAdvice || consultation.recommendations], ['Recommended care', consultation.recommendedCare], ['Follow-up instructions', consultation.followUpInstructions], ['Medication information', consultation.medicationInformation], ['Additional notes', consultation.doctorNotes]].filter(([, value]) => value).map(([label, value]) => <div key={label} className="rounded-xl bg-slate-50 p-3"><p className="text-xs font-bold text-slate-500">{label}</p><p className="mt-1 whitespace-pre-wrap text-sm">{value}</p></div>)}
          </div>
          {!consultation.doctorAdvice && !consultation.doctorNotes && <p className="mt-2 text-sm text-slate-500">Veterinarian notes will appear here when saved.</p>}
        </section>
      )}
      {consultation.veterinarianId && <OwnerConsultationChat consultation={consultation} onUpdated={onUpdated} />}
      {["ASSIGNED", "PENDING", "ACCEPTED"].includes(consultation.status) && <button onClick={onCancelled} className="rounded-xl border border-red-200 px-4 py-2 text-sm font-bold text-red-600">Cancel consultation</button>}
      {["ASSIGNED", "PENDING", "ACCEPTED"].includes(consultation.status) && <button onClick={onReschedule} className="rounded-xl border border-orange-200 px-4 py-2 text-sm font-bold text-orange-700">Reschedule</button>}
      <Disclaimer text={consultation.aiAssessment?.disclaimer} />
      {consultation.status === "AI_ASSESSMENT" && (
        <button
          onClick={onBook}
          className="rounded-xl bg-orange-500 px-5 py-3 text-sm font-black text-white"
        >
          Consult a Veterinarian
        </button>
      )}
    </section>
  );
}

function OwnerConsultationChat({ consultation, onUpdated }) {
  const [messages, setMessages] = useState([]);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const endRef = useRef(null);
  const refreshMessages = useCallback(async () => {
    try { const result = await getConsultationMessages(consultation._id); setMessages(result.messages || []); }
    catch (loadError) { setError(loadError.message || "Unable to load consultation chat."); }
  }, [consultation._id]);
  useEffect(() => {
    const loadTimer = window.setTimeout(refreshMessages, 0);
    const socket = connectConsultationSocket();
    socket.on("connect", () => socket.emit("consultation:join", consultation._id));
    socket.on("chat:message", (message) => setMessages((current) => current.some((item) => item._id === message._id) ? current : [...current, message]));
    socket.on("consultation:updated", (updated) => onUpdated(updated));
    const poll = window.setInterval(refreshMessages, 20000);
    return () => { window.clearTimeout(loadTimer); window.clearInterval(poll); socket.disconnect(); };
  }, [consultation._id, refreshMessages, onUpdated]);
  useEffect(() => endRef.current?.scrollIntoView({ behavior: "smooth" }), [messages]);
  const send = async (event) => {
    event.preventDefault(); if (!draft.trim()) return;
    setSending(true); setError("");
    try { const result = await sendConsultationMessage(consultation._id, draft.trim()); setMessages((current) => current.some((item) => item._id === result.message._id) ? current : [...current, result.message]); setDraft(""); }
    catch (sendError) { setError(sendError.message || "Unable to send your message."); }
    finally { setSending(false); }
  };
  return <section className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-[#0d131a]"><h3 className="font-black">Chat with your veterinarian</h3><div className="mt-3 max-h-80 space-y-2 overflow-y-auto rounded-xl bg-slate-50 p-3 dark:bg-slate-900">{messages.length ? messages.map((message) => <div key={message._id} className={`max-w-[88%] rounded-2xl px-3 py-2 text-sm ${message.senderRole === "owner" ? "ml-auto bg-orange-500 text-white" : "bg-white text-slate-700 shadow-sm"}`}><p>{message.message}</p><p className={`mt-1 text-[10px] ${message.senderRole === "owner" ? "text-orange-100" : "text-slate-400"}`}>{message.senderId?.name} · {new Date(message.createdAt).toLocaleString()}</p></div>) : <p className="py-10 text-center text-sm text-slate-400">No messages yet. Send your veterinarian a message here.</p>}<div ref={endRef} /></div>{error && <p role="alert" className="mt-2 text-xs text-red-600">{error}</p>}{consultation.status !== "COMPLETED" && consultation.status !== "CANCELLED" && <form onSubmit={send} className="mt-3 flex gap-2"><input value={draft} onChange={(event) => setDraft(event.target.value)} maxLength={4000} placeholder="Message your veterinarian…" className="min-w-0 flex-1 rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-orange-400" /><button disabled={sending || !draft.trim()} className="rounded-xl bg-orange-500 px-4 text-sm font-bold text-white disabled:opacity-50">{sending ? "Sending…" : "Send"}</button></form>}</section>;
}

function PhotoGallery({ media }) {
  return (
    <section>
      <h3 className="mb-3 font-black">Uploaded health photos</h3>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {media.map((url) => (
          <div
            key={url}
            className="flex h-48 items-center justify-center overflow-hidden rounded-xl border border-slate-200 bg-slate-50 p-2 dark:border-slate-700 dark:bg-slate-900"
          >
            <img
              src={imageUrl(url)}
              alt="Pet health concern"
              className="max-h-full max-w-full object-contain"
            />
          </div>
        ))}
      </div>
    </section>
  );
}
function Disclaimer({ text }) {
  return (
    <p className="rounded-xl bg-slate-100 p-3 text-xs leading-5 text-slate-600 dark:bg-slate-900 dark:text-slate-300">
      {text ||
        "This AI assessment is for preliminary guidance only and does not replace professional veterinary advice."}
    </p>
  );
}
function Fact({ label, value }) {
  return (
    <div className="min-w-0">
      <dt className="text-[10px] font-black uppercase tracking-wider text-slate-400">
        {label}
      </dt>
      <dd className="mt-1 break-words text-sm font-semibold">{value || "—"}</dd>
    </div>
  );
}
function SparklesIcon() {
  return <HeartPulse size={17} />;
}
