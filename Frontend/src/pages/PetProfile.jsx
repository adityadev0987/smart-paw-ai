import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  Camera,
  ChevronDown,
  ClipboardList,
  Edit3,
  HeartPulse,
  Plus,
  Save,
  Sparkles,
  Stethoscope,
  Trash2,
  UsersRound,
  X,
} from "lucide-react";

import { useAppContext } from "../hooks/useAppContext";
import {
  createPet,
  updatePet as apiUpdatePet,
  deletePet as apiDeletePet,
} from "../services/api";

const emptyPet = {
  name: "",
  species: "Cat",
  breed: "",
  bio: "",
  age: "",
  dateOfBirth: "",
  gender: "",
  reproductiveStatus: "",
  parentName: "",
  weight: {
    value: "",
    unit: "kg",
  },
  color: "",
  microchipId: "",

  medical: {
    healthStatus: "Healthy",
    conditions: [],
    previousIllnesses: [],
    allergies: [],
    surgeries: [],
    previousHospitalizations: [],
    medications: [],
    supplements: [],
  },

  preventiveCare: {
    vaccinations: [],
    parasitePrevention: {
      flea: {},
      tick: {},
      deworming: {},
      heartworm: {},
    },
  },

  nutrition: {
    foodType: "",
    foodBrand: "",
    feedingAmount: "",
    mealsPerDay: "",
    feedingSchedule: "",
    treats: "",
    humanFood: "",
    recentDietChange: "",
    waterIntake: "",
    waterNotes: "",
  },

  behavior: {
    temperament: [],
    behavioralConcerns: [],
    separationAnxiety: false,
    aggression: false,
    excessiveVocalization: false,
    notes: "",
  },

  lifestyle: {
    activityLevel: "",
    exerciseType: "",
    exerciseDuration: "",
    exerciseFrequency: "",
    housing: "",
    indoorOutdoor: "",
    otherPets: false,
    otherPetsDetails: "",
    childrenAtHome: false,
    travelFrequency: "",
    environmentalChanges: "",
    exposureNotes: "",
  },

  groomingDental: {
    groomingFrequency: "",
    bathingFrequency: "",
    brushingFrequency: "",
    nailTrimmingFrequency: "",
    earCleaningFrequency: "",
    skinCoatIssues: "",
    toothBrushing: "",
    dentalCleaningFrequency: "",
    dentalProblems: "",
    badBreath: false,
  },

  healthMonitoring: {
    baseline: {
      appetite: "",
      energy: "",
      sleep: "",
      urination: "",
      bowelMovements: "",
      breathing: "",
      behavior: "",
    },
    observations: [],
  },

  reproductiveFamily: {
    pregnancyHistory: "",
    reproductiveComplications: "",
    geneticConditions: [],
    familyHistory: "",
  },

  emergency: {
    primaryVet: {
      name: "",
      clinic: "",
      phone: "",
    },
    emergencyVet: {
      name: "",
      clinic: "",
      phone: "",
    },
    emergencyNotes: "",
  },
};

const photoStorageKey = "smartPawPetPhotos";

function normalizePet(pet) {
  return {
    ...emptyPet,
    ...pet,

    weight: {
      ...emptyPet.weight,
      ...(pet?.weight || {}),
    },

    medical: {
      ...emptyPet.medical,
      ...(pet?.medical || {}),
    },

    preventiveCare: {
      ...emptyPet.preventiveCare,
      ...(pet?.preventiveCare || {}),
      parasitePrevention: {
        ...emptyPet.preventiveCare.parasitePrevention,
        ...(pet?.preventiveCare?.parasitePrevention || {}),
      },
    },

    nutrition: {
      ...emptyPet.nutrition,
      ...(pet?.nutrition || {}),
    },

    behavior: {
      ...emptyPet.behavior,
      ...(pet?.behavior || {}),
    },

    lifestyle: {
      ...emptyPet.lifestyle,
      ...(pet?.lifestyle || {}),
    },

    groomingDental: {
      ...emptyPet.groomingDental,
      ...(pet?.groomingDental || {}),
    },

    healthMonitoring: {
      ...emptyPet.healthMonitoring,
      ...(pet?.healthMonitoring || {}),
      baseline: {
        ...emptyPet.healthMonitoring.baseline,
        ...(pet?.healthMonitoring?.baseline || {}),
      },
    },

    reproductiveFamily: {
      ...emptyPet.reproductiveFamily,
      ...(pet?.reproductiveFamily || {}),
    },

    emergency: {
      ...emptyPet.emergency,
      ...(pet?.emergency || {}),
      primaryVet: {
        ...emptyPet.emergency.primaryVet,
        ...(pet?.emergency?.primaryVet || {}),
      },
      emergencyVet: {
        ...emptyPet.emergency.emergencyVet,
        ...(pet?.emergency?.emergencyVet || {}),
      },
    },
  };
}

function formatAge(age, dateOfBirth) {
  if (age !== undefined && age !== null && String(age).trim() !== "") {
    return `${age} ${Number(age) === 1 ? "Year" : "Years"}`;
  }

  if (dateOfBirth) {
    const birth = new Date(dateOfBirth);

    if (!Number.isNaN(birth.getTime())) {
      const now = new Date();

      let years = now.getFullYear() - birth.getFullYear();

      const monthDiff = now.getMonth() - birth.getMonth();

      if (
        monthDiff < 0 ||
        (monthDiff === 0 && now.getDate() < birth.getDate())
      ) {
        years--;
      }

      return `${Math.max(years, 0)} ${
        Math.max(years, 0) === 1 ? "Year" : "Years"
      }`;
    }
  }

  return "Not added";
}

function getDisplayPetId(pet, index = 0) {
  if (pet?.displayPetId) return pet.displayPetId;
  if (pet?.petId) return pet.petId;

  const species = String(pet?.species || "PET")
    .replace(/[^a-zA-Z]/g, "")
    .toUpperCase()
    .slice(0, 3)
    .padEnd(3, "X");

  const breed = String(pet?.breed || "PET")
    .replace(/[^a-zA-Z]/g, "")
    .toUpperCase()
    .slice(0, 6)
    .padEnd(3, "X");

  const number = String(index + 1).padStart(2, "0");

  return `${species}${breed}${number}`;
}

function getPetInitials(name) {
  const words = String(name || "Pet")
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (words.length === 1) {
    return words[0].slice(0, 2).toUpperCase();
  }

  return `${words[0][0]}${words[words.length - 1][0]}`.toUpperCase();
}

function getParentName(pet, currentUser) {
  const parent = pet?.parent;

  const candidates = [
    typeof parent === "object" ? parent?.name : parent,
    pet?.parentName,
    pet?.owner?.name,
    pet?.ownerName,
    pet?.user?.name,
    currentUser?.name,
  ];

  return candidates.find(
    (value) => typeof value === "string" && value.trim(),
  );
}

function getPetBio(pet) {
  const candidates = [
    pet?.bio,
    pet?.about,
    pet?.description,
    pet?.behavior?.notes,
  ];

  return candidates.find(
    (value) => typeof value === "string" && value.trim(),
  );
}

function formatDate(date) {
  if (!date) return "No date";

  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) return date;

  return parsed.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function InputField({
  label,
  value,
  onChange,
  placeholder = "",
  type = "text",
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.12em] text-zinc-500 dark:text-zinc-400">
        {label}
      </span>

      <input
        type={type}
        value={value ?? ""}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="w-full rounded-xl border border-zinc-200 bg-white px-3.5 py-2.5 text-sm text-zinc-900 outline-none transition placeholder:text-zinc-400 focus:border-orange-400 focus:ring-2 focus:ring-orange-100 dark:border-zinc-700 dark:bg-[#111820] dark:text-zinc-100 dark:placeholder:text-zinc-500 dark:focus:border-orange-500 dark:focus:ring-orange-950/40"
      />
    </label>
  );
}

function SelectField({ label, value, onChange, options = [] }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.12em] text-zinc-500 dark:text-zinc-400">
        {label}
      </span>

      <select
        value={value ?? ""}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-xl border border-zinc-200 bg-white px-3.5 py-2.5 text-sm text-zinc-900 outline-none transition focus:border-orange-400 focus:ring-2 focus:ring-orange-100 dark:border-zinc-700 dark:bg-[#111820] dark:text-zinc-100 dark:focus:border-orange-500 dark:focus:ring-orange-950/40"
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

/* -------------------------------------------------------------------------- */
/* MEDICAL RECORDS                                                            */
/* -------------------------------------------------------------------------- */

function MedicalPaper({ pet, petIndex, currentUser, onBack, onSave }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(normalizePet(pet));
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");

  useEffect(() => {
    setDraft(normalizePet(pet));
  }, [pet]);

  const updateMedical = (field, value) => {
    setDraft((current) => ({
      ...current,
      medical: {
        ...current.medical,
        [field]: value,
      },
    }));
  };

  const updatePreventive = (field, value) => {
    setDraft((current) => ({
      ...current,
      preventiveCare: {
        ...current.preventiveCare,
        [field]: value,
      },
    }));
  };

  const updateParasite = (type, field, value) => {
    setDraft((current) => ({
      ...current,
      preventiveCare: {
        ...current.preventiveCare,
        parasitePrevention: {
          ...current.preventiveCare?.parasitePrevention,
          [type]: {
            ...current.preventiveCare?.parasitePrevention?.[type],
            [field]: value,
          },
        },
      },
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    setSaveError("");

    try {
      await onSave(draft);
      setEditing(false);
    } catch (error) {
      console.error("Medical record save failed:", error);
      setSaveError(
        error?.message || "Medical records save nahi ho paye.",
      );
    } finally {
      setSaving(false);
    }
  };

  const conditions = draft.medical?.conditions || [];
  const allergies = draft.medical?.allergies || [];
  const previousIllnesses = draft.medical?.previousIllnesses || [];
  const medications = draft.medical?.medications || [];
  const surgeries = draft.medical?.surgeries || [];
  const vaccinations = draft.preventiveCare?.vaccinations || [];
  const parasitePrevention =
    draft.preventiveCare?.parasitePrevention || {};

  return (
    <div className="min-h-[calc(100vh-80px)] bg-zinc-100 px-3 py-6 dark:bg-[#0b0f14] sm:px-6 lg:px-10">
      <div className="mx-auto max-w-5xl">
        {/* Icon-only top controls */}
        <div className="mb-5 flex items-center justify-between">
          <button
            onClick={onBack}
            title="Back to Pet ID"
            aria-label="Back to Pet ID"
            className="flex h-10 w-10 items-center justify-center rounded-full border border-zinc-200 bg-white text-zinc-600 shadow-sm transition hover:border-orange-300 hover:text-orange-600 dark:border-zinc-700 dark:bg-[#111820] dark:text-zinc-300"
          >
            <ArrowLeft size={18} />
          </button>

          <button
            onClick={() => {
              if (editing) {
                setDraft(normalizePet(pet));
              }

              setEditing((current) => !current);
            }}
            title={editing ? "Cancel editing" : "Edit medical records"}
            aria-label={editing ? "Cancel editing" : "Edit medical records"}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-orange-300 bg-white text-orange-600 shadow-sm transition hover:bg-orange-50 dark:border-orange-700 dark:bg-[#111820] dark:text-orange-400"
          >
            {editing ? <X size={18} /> : <Edit3 size={18} />}
          </button>
        </div>

        <article className="mx-auto w-full max-w-[820px] bg-[#fffdf8] px-5 py-7 shadow-2xl ring-1 ring-black/10 sm:px-12 sm:py-12">
          <header className="border-b-2 border-orange-500 pb-6">
            <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-start">
              <div>
                <p className="text-sm font-black uppercase tracking-[0.28em] text-orange-600">
                  Smart Paw AI
                </p>

                <h1 className="mt-2 text-3xl font-black tracking-tight text-zinc-900 sm:text-4xl">
                  Medical Record
                </h1>

                <p className="mt-1 text-sm text-zinc-500">
                  Digital companion medical document
                </p>
              </div>

              <div className="border border-zinc-300 px-4 py-3 text-right">
                <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-zinc-500">
                  Pet ID
                </p>

                <p className="mt-1 font-mono text-sm font-black text-zinc-900">
                  {getDisplayPetId(pet, petIndex)}
                </p>
              </div>
            </div>
          </header>

          <section className="grid grid-cols-1 gap-x-5 gap-y-5 border-b border-zinc-300 py-7 sm:grid-cols-2 lg:grid-cols-3">
            <PaperInfo label="Pet Name" value={pet.name || "Not added"} />
            <PaperInfo label="Species" value={pet.species || "Not added"} />
            <PaperInfo label="Breed" value={pet.breed || "Not added"} />

            <PaperInfo
              label="Age"
              value={formatAge(pet.age, pet.dateOfBirth)}
            />

            <PaperInfo label="Gender" value={pet.gender || "Not added"} />

            <PaperInfo
              label="Reproductive Status"
              value={pet.reproductiveStatus || "Not added"}
            />

            <PaperInfo
              label="Parent"
              value={getParentName(pet, currentUser) || "Not added"}
            />

            <PaperInfo
              label="Weight"
              value={
                pet.weight?.value
                  ? `${pet.weight.value} ${pet.weight.unit || "kg"}`
                  : "Not added"
              }
            />

            <PaperInfo label="Color" value={pet.color || "Not added"} />
          </section>

          <section className="py-7">
            <DocumentHeading
              icon={<HeartPulse size={18} />}
              title="Medical History"
            />

            {editing ? (
              <div className="space-y-5">
                <SelectField
                  label="Current Health Status"
                  value={draft.medical?.healthStatus}
                  onChange={(value) =>
                    updateMedical("healthStatus", value)
                  }
                  options={[
                    "Healthy",
                    "Monitoring",
                    "Under Treatment",
                    "Critical",
                    "Unknown",
                  ]}
                />

                <MedicalArrayEditor
                  title="Conditions"
                  values={conditions}
                  placeholder="Enter condition"
                  addLabel="Add Condition"
                  onAdd={(value) =>
                    updateMedical("conditions", [
                      ...conditions,
                      value,
                    ])
                  }
                  onRemove={(index) =>
                    updateMedical(
                      "conditions",
                      conditions.filter(
                        (_, itemIndex) => itemIndex !== index,
                      ),
                    )
                  }
                />

                <MedicalArrayEditor
                  title="Allergies / Sensitivities"
                  values={allergies}
                  placeholder="Enter allergy or sensitivity"
                  addLabel="Add Allergy"
                  emptyOption
                  onAdd={(value) =>
                    updateMedical(
                      "allergies",
                      allergies.filter(
                        (item) => item !== "No known allergies",
                      ).concat(value),
                    )
                  }
                  onRemove={(index) =>
                    updateMedical(
                      "allergies",
                      allergies.filter(
                        (_, itemIndex) => itemIndex !== index,
                      ),
                    )
                  }
                />

                <MedicalArrayEditor
                  title="Previous Illnesses"
                  values={previousIllnesses}
                  placeholder="Illness name or description"
                  addLabel="Add Previous Illness"
                  onAdd={(value) =>
                    updateMedical("previousIllnesses", [
                      ...previousIllnesses,
                      value,
                    ])
                  }
                  onRemove={(index) =>
                    updateMedical(
                      "previousIllnesses",
                      previousIllnesses.filter(
                        (_, itemIndex) => itemIndex !== index,
                      ),
                    )
                  }
                />

                <MedicationEditor
                  values={medications}
                  onChange={(value) =>
                    updateMedical("medications", value)
                  }
                />

                <SurgeryEditor
                  values={surgeries}
                  onChange={(value) =>
                    updateMedical("surgeries", value)
                  }
                />
              </div>
            ) : (
              <div className="space-y-5 text-sm text-zinc-800">
                <PaperRow
                  label="Health Status"
                  value={draft.medical?.healthStatus || "Not added"}
                />

                <PaperList label="Conditions" values={conditions} />
                <PaperList label="Allergies" values={allergies} />

                <PaperList
                  label="Previous Illnesses"
                  values={previousIllnesses}
                />

                <PaperList
                  label="Medications"
                  values={medications}
                />

                <PaperList label="Surgeries" values={surgeries} />
              </div>
            )}
          </section>

          <section className="border-t border-zinc-300 py-7">
            <DocumentHeading
              icon={<ClipboardList size={18} />}
              title="Vaccination Record"
            />

            {editing ? (
              <div className="space-y-4">
                {vaccinations.map((vaccination, index) => (
                  <div
                    key={vaccination?._id || index}
                    className="border border-zinc-300 bg-white p-4"
                  >
                    <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-3">
                      <InputField
                        label="Vaccine"
                        value={vaccination?.vaccine}
                        onChange={(value) => {
                          const next = [...vaccinations];

                          next[index] = {
                            ...next[index],
                            vaccine: value,
                          };

                          updatePreventive("vaccinations", next);
                        }}
                      />

                      <InputField
                        label="Date Given"
                        type="date"
                        value={vaccination?.dateGiven}
                        onChange={(value) => {
                          const next = [...vaccinations];

                          next[index] = {
                            ...next[index],
                            dateGiven: value,
                          };

                          updatePreventive("vaccinations", next);
                        }}
                      />

                      <InputField
                        label="Next Due"
                        type="date"
                        value={vaccination?.nextDueDate}
                        onChange={(value) => {
                          const next = [...vaccinations];

                          next[index] = {
                            ...next[index],
                            nextDueDate: value,
                          };

                          updatePreventive("vaccinations", next);
                        }}
                      />
                    </div>

                    <button
                      onClick={() =>
                        updatePreventive(
                          "vaccinations",
                          vaccinations.filter(
                            (_, itemIndex) => itemIndex !== index,
                          ),
                        )
                      }
                      className="mt-3 inline-flex items-center gap-1.5 text-xs font-bold text-red-600"
                    >
                      <Trash2 size={14} />
                      Remove
                    </button>
                  </div>
                ))}

                <button
                  onClick={() =>
                    updatePreventive("vaccinations", [
                      ...vaccinations,
                      {
                        vaccine: "",
                        dateGiven: "",
                        nextDueDate: "",
                        notes: "",
                      },
                    ])
                  }
                  className="inline-flex items-center gap-2 border border-dashed border-orange-400 px-4 py-2.5 text-sm font-bold text-orange-600"
                >
                  <Plus size={16} />
                  Add Vaccination
                </button>
              </div>
            ) : vaccinations.length ? (
              <div className="overflow-hidden border border-zinc-300">
                <div className="hidden grid-cols-3 border-b border-zinc-300 bg-zinc-100 px-4 py-3 text-xs font-black uppercase tracking-wider text-zinc-600 dark:border-zinc-700 dark:bg-[#18212b] dark:text-zinc-300 sm:grid">
                  <span>Vaccine</span>
                  <span>Date Given</span>
                  <span>Next Due</span>
                </div>

                {vaccinations.map((vaccination, index) => (
                  <div
                    key={vaccination?._id || index}
                    className="grid gap-2 border-b border-zinc-200 px-4 py-3 text-sm text-zinc-800 last:border-b-0 dark:border-zinc-700 sm:grid-cols-3 sm:gap-0"
                  >
                    <span className="text-xs font-black uppercase tracking-wider text-zinc-500 dark:text-zinc-400 sm:hidden">
                      Vaccine
                    </span>
                    <span>
                      {vaccination?.vaccine || "â€”"}
                    </span>

                    <span className="text-xs font-black uppercase tracking-wider text-zinc-500 dark:text-zinc-400 sm:hidden">
                      Date Given
                    </span>
                    <span>
                      {formatDate(vaccination?.dateGiven)}
                    </span>

                    <span className="text-xs font-black uppercase tracking-wider text-zinc-500 dark:text-zinc-400 sm:hidden">
                      Next Due
                    </span>
                    <span>
                      {formatDate(vaccination?.nextDueDate)}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyDocumentText text="No vaccination records added yet." />
            )}
          </section>

          <section className="border-t border-zinc-300 py-7">
            <DocumentHeading
              icon={<Stethoscope size={18} />}
              title="Parasite Prevention"
            />

            {editing && (
              <p className="mb-4 text-xs text-zinc-500">
                Track product and dates for each prevention type.
              </p>
            )}

            <div className="grid gap-3 sm:grid-cols-2">
              {[
                "flea",
                "tick",
                "deworming",
                "heartworm",
              ].map((type) => (
                <div
                  key={type}
                  className="border border-zinc-300 px-4 py-3"
                >
                  <p className="text-xs font-black uppercase tracking-wider text-zinc-500">
                    {type}
                  </p>

                  {editing ? (
                    <div className="mt-3 space-y-3">
                      <InputField
                        label="Product / Status"
                        value={parasitePrevention[type]?.product}
                        onChange={(value) =>
                          updateParasite(type, "product", value)
                        }
                        placeholder="Protected or product name"
                      />

                      <div className="grid gap-3 sm:grid-cols-2">
                        <InputField
                          label="Last Given"
                          type="date"
                          value={parasitePrevention[type]?.lastGiven}
                          onChange={(value) =>
                            updateParasite(type, "lastGiven", value)
                          }
                        />

                        <InputField
                          label="Next Due"
                          type="date"
                          value={parasitePrevention[type]?.nextDue}
                          onChange={(value) =>
                            updateParasite(type, "nextDue", value)
                          }
                        />
                      </div>
                    </div>
                  ) : (
                    <>
                      <p className="mt-1 text-sm font-semibold text-zinc-800">
                        {parasitePrevention[type]?.product || "Not recorded"}
                      </p>

                      <p className="mt-1 text-xs text-zinc-500">
                        Last given: {formatDate(parasitePrevention[type]?.lastGiven)}
                      </p>
                    </>
                  )}
                </div>
              ))}
            </div>
          </section>

          {/* Save at very bottom â€” NOT sticky/floating */}
          {editing && (
            <div className="mt-8 border-t-2 border-zinc-900 pt-7">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs text-zinc-500">
                    Review the medical record before saving.
                  </p>

                  {saveError && (
                    <p className="mt-2 text-xs font-semibold text-red-600">
                      {saveError}
                    </p>
                  )}
                </div>

                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="inline-flex items-center gap-2 bg-orange-500 px-5 py-3 text-sm font-black text-white shadow-md transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <Save size={17} />
                  {saving ? "Saving..." : "Save"}
                </button>
              </div>
            </div>
          )}

          <footer className="mt-10 border-t-2 border-zinc-900 pt-5 text-center">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-zinc-500">
              {pet.name ? `${pet.name}'s Medical Record` : "Pet Medical Record"}
            </p>

            <p className="mt-1 text-[11px] text-zinc-400">
              Keep this record updated with your pet's veterinary history.
            </p>
          </footer>
        </article>
      </div>
    </div>
  );
}

function PetIdCard({
  pet,
  petIndex,
  pets,
  currentUser,
  photo,
  onPhotoChange,
  onSelectPet,
  onOpenMedical,
  onEdit,
  onAddPet,
  addingPet,
  newPet,
  setNewPet,
  onSaveNewPet,
  onCancelAdd,
}) {
  const displayPetId = getDisplayPetId(pet, petIndex);
  const petBio = getPetBio(pet);
  const weight = pet.weight?.value
    ? `${pet.weight.value} ${pet.weight.unit || "kg"}`
    : "Not added";

  return (
    <div className="min-h-[calc(100vh-80px)] bg-zinc-50 px-4 py-8 dark:bg-[#0b0f14] sm:px-6 lg:px-10">
      <div className="mx-auto max-w-5xl">
        {addingPet ? (
          <AddPetPanel
            newPet={newPet}
            setNewPet={setNewPet}
            onSave={onSaveNewPet}
            onCancel={onCancelAdd}
          />
        ) : (
          <div className="overflow-hidden rounded-[28px] border border-zinc-200 bg-white shadow-xl shadow-zinc-300/30 dark:border-zinc-700 dark:bg-[#111820] dark:shadow-black/30">
            <section className="overflow-hidden bg-white dark:bg-[#111820] lg:hidden">
              <div className="h-1.5 bg-orange-500" />

              <div className="p-4 sm:p-5">
                <div className="flex items-start justify-between gap-3 border-b border-zinc-200 pb-4 dark:border-zinc-700">
                  <div className="min-w-0">
                    <p className="text-[10px] font-black uppercase tracking-[0.16em] text-zinc-400">
                      Pet ID
                    </p>
                    <p className="mt-1 break-all font-mono text-sm font-black tracking-wide text-zinc-900 dark:text-zinc-100">
                      {displayPetId}
                    </p>
                  </div>

                  <div className="flex shrink-0 items-center gap-2">
                    <PetSelector
                      pets={pets}
                      currentIndex={petIndex}
                      onSelect={onSelectPet}
                    />
                    <button
                      onClick={onAddPet}
                      title="Add new pet"
                      aria-label="Add new pet"
                      className="flex h-10 w-10 items-center justify-center rounded-full border border-orange-400 bg-white text-orange-600 shadow-sm transition hover:bg-orange-50 dark:bg-[#111820]"
                    >
                      <Plus size={18} />
                    </button>
                  </div>
                </div>

                <div className="mt-5 grid grid-cols-[112px_minmax(0,1fr)] items-start gap-4 sm:grid-cols-[144px_minmax(0,1fr)] sm:gap-5">
                  <div className="group relative w-fit">
                    <div className="flex h-28 w-28 items-center justify-center overflow-hidden rounded-3xl border-4 border-white bg-orange-50 shadow-lg ring-2 ring-orange-400/70 dark:border-zinc-700 dark:bg-orange-950/20 sm:h-36 sm:w-36">
                      {photo ? (
                        <img
                          src={photo}
                          alt={pet.name || "Pet"}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="text-center">
                          <div className="text-3xl font-black text-orange-500">
                            {getPetInitials(pet.name)}
                          </div>
                          <p className="mt-1 text-[9px] font-bold uppercase tracking-wider text-zinc-400">
                            Pet Photo
                          </p>
                        </div>
                      )}
                    </div>

                    <label
                      title="Change pet photo"
                      className="absolute -bottom-2 -right-2 flex h-9 w-9 cursor-pointer items-center justify-center rounded-full border-2 border-white bg-orange-500 text-white shadow-lg dark:border-[#111820]"
                    >
                      <Camera size={15} />
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={onPhotoChange}
                      />
                    </label>
                  </div>

                  <div className="min-w-0 pt-1">
                    <p className="break-words text-2xl font-black leading-tight text-zinc-900 dark:text-white sm:text-3xl">
                      {pet.name || "Unnamed Pet"}
                    </p>
                    <p className="mt-1 break-words text-sm font-semibold leading-5 text-zinc-500 dark:text-zinc-400">
                      {pet.breed || "Breed not added"}
                    </p>
                    <p className="mt-3 break-words text-xs leading-5 text-zinc-500 dark:text-zinc-400">
                      {[pet.species, formatAge(pet.age, pet.dateOfBirth), pet.gender]
                        .filter((value) => value && value !== "Not added")
                        .join(" • ") || "Pet details not added"}
                    </p>
                    <p className="mt-1 break-words text-xs font-semibold text-zinc-500 dark:text-zinc-400">
                      {pet.reproductiveStatus || "Status not added"}
                    </p>
                  </div>
                </div>

                <div className="mt-6 grid grid-cols-2 gap-2 border-y border-zinc-200 py-4 dark:border-zinc-700">
                  <ProfileInfo label="Weight" value={weight} />
                  <ProfileInfo label="Color" value={pet.color} />
                </div>

                <div className="mt-5 border-b border-zinc-200 pb-5 dark:border-zinc-700">
                  <p className="text-[10px] font-black uppercase tracking-[0.18em] text-zinc-400">
                    About
                  </p>
                  <p className="mt-2 break-words text-sm leading-6 text-zinc-500 dark:text-zinc-400">
                    {petBio || "Add a short bio from Edit Profile."}
                  </p>
                </div>

                <div className="mt-5">
                  <p className="text-[10px] font-black uppercase tracking-[0.18em] text-zinc-400">
                    Parent
                  </p>
                  <p className="mt-1 break-words text-sm font-bold text-zinc-900 dark:text-zinc-100">
                    {getParentName(pet, currentUser) || "Not added"}
                  </p>
                </div>

                <button
                  onClick={onEdit}
                  title="Edit pet profile"
                  aria-label="Edit pet profile"
                  className="mt-5 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-orange-500 px-5 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-orange-600"
                >
                  <Edit3 size={16} />
                  Edit Profile
                </button>
              </div>

              <div className="border-t border-zinc-200 px-4 py-3 dark:border-zinc-700">
                <button
                  type="button"
                  onClick={onOpenMedical}
                  className="group flex min-h-11 w-full items-center justify-between rounded-xl px-2 text-sm font-black text-orange-600 transition hover:bg-orange-50 dark:text-orange-400 dark:hover:bg-orange-500/10"
                >
                  <span className="inline-flex items-center gap-2">
                    <ClipboardList size={17} />
                    Medical Records
                  </span>
                  <ArrowRight
                    size={17}
                    className="transition group-hover:translate-x-1"
                  />
                </button>
                <Link
                  to="/community"
                  className="group mt-1 flex min-h-11 w-full items-center justify-between rounded-xl px-2 text-sm font-black text-orange-600 transition hover:bg-orange-50 dark:text-orange-400 dark:hover:bg-orange-500/10"
                >
                  <span className="inline-flex items-center gap-2">
                    <UsersRound size={17} />
                    Community
                  </span>
                  <ArrowRight
                    size={17}
                    className="transition group-hover:translate-x-1"
                  />
                </Link>
              </div>
            </section>

            <section className="hidden overflow-hidden bg-white dark:bg-[#111820] lg:block">

              <div className="grid gap-8 p-5 sm:p-8 lg:grid-cols-[240px_minmax(0,1fr)] lg:gap-10">
                <div className="order-2 lg:order-1">
                  <div className="group relative mx-auto w-fit lg:mx-0">
                    <div className="flex h-44 w-44 items-center justify-center overflow-hidden rounded-3xl border-4 border-white bg-orange-50 shadow-lg ring-2 ring-orange-400/70 dark:border-zinc-700 dark:bg-orange-950/20">
                      {photo ? (
                        <img
                          src={photo}
                          alt={pet.name || "Pet"}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="text-center">
                          <div className="text-4xl font-black text-orange-500">
                            {getPetInitials(pet.name)}
                          </div>
                          <p className="mt-1 text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                            Pet Photo
                          </p>
                        </div>
                      )}
                    </div>

                    <label
                      title="Change pet photo"
                      className="absolute -bottom-2 -right-2 flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border-2 border-white bg-orange-500 text-white shadow-lg dark:border-[#111820]"
                    >
                      <Camera size={16} />
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={onPhotoChange}
                      />
                    </label>
                  </div>

                  <div className="mt-6 text-center lg:text-left">
                    <p className="text-[10px] font-black uppercase tracking-[0.18em] text-orange-500">
                      Pet Name
                    </p>
                    <h2 className="mt-1 break-words text-3xl font-black tracking-tight text-zinc-900 dark:text-white">
                      {pet.name || "Unnamed Pet"}
                    </h2>
                    <p className="mt-1 break-words text-sm font-semibold text-zinc-500 dark:text-zinc-400">
                      {pet.breed || "Breed not added"}
                    </p>

                    <div className="mt-5 border-t border-zinc-200 pt-4 text-left dark:border-zinc-700">
                      <p className="text-[10px] font-black uppercase tracking-[0.18em] text-zinc-400">
                        Bio
                      </p>
                      <p className="mt-2 break-words text-sm leading-6 text-zinc-500 dark:text-zinc-400">
                        {petBio || "Add a short bio from Edit Profile."}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="order-1 flex min-w-0 flex-col lg:order-2">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <p className="text-xs font-black uppercase tracking-[0.2em] text-orange-500">
                        Pet Profile
                      </p>
                      <p className="mt-2 text-[10px] font-black uppercase tracking-[0.16em] text-zinc-400">
                        Pet ID
                      </p>
                      <p className="mt-1 break-all font-mono text-lg font-black tracking-wide text-zinc-900 dark:text-zinc-100">
                        {displayPetId}
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 sm:justify-end">
                      <PetSelector
                        pets={pets}
                        currentIndex={petIndex}
                        onSelect={onSelectPet}
                      />
                      <button
                        onClick={onAddPet}
                        title="Add new pet"
                        aria-label="Add new pet"
                        className="flex h-10 w-10 items-center justify-center rounded-full border border-orange-400 bg-white text-orange-600 shadow-sm transition hover:bg-orange-50 dark:bg-[#111820]"
                      >
                        <Plus size={18} />
                      </button>
                    </div>
                  </div>

                  <div className="mt-7 grid grid-cols-2 gap-3 sm:grid-cols-3">
                    <ProfileInfo label="Species" value={pet.species} />
                    <ProfileInfo label="Age" value={formatAge(pet.age, pet.dateOfBirth)} />
                    <ProfileInfo label="Gender" value={pet.gender} />
                    <ProfileInfo label="Status" value={pet.reproductiveStatus} />
                    <ProfileInfo label="Parent" value={getParentName(pet, currentUser)} />
                    <ProfileInfo label="Weight" value={weight} />
                    <ProfileInfo label="Color" value={pet.color} />
                    <ProfileInfo label="Breed" value={pet.breed} />
                  </div>

                  <div className="mt-auto flex flex-col gap-3 pt-7 sm:flex-row sm:items-center sm:justify-between">
                    <button
                      onClick={onEdit}
                      title="Edit pet profile"
                      aria-label="Edit pet profile"
                      className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl bg-orange-500 px-5 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-orange-600"
                    >
                      <Edit3 size={16} />
                      Edit Profile
                    </button>

                    <button
                      onClick={onOpenMedical}
                      className="group inline-flex min-h-10 items-center justify-center gap-2 text-sm font-black text-orange-600 transition hover:text-orange-700 dark:text-orange-400 dark:hover:text-orange-300"
                    >
                      <ClipboardList size={17} />
                      Medical Records
                      <ArrowRight size={17} className="transition group-hover:translate-x-1" />
                    </button>

                    <Link
                      to="/community"
                      className="group inline-flex min-h-10 items-center justify-center gap-2 text-sm font-black text-orange-600 transition hover:text-orange-700 dark:text-orange-400 dark:hover:text-orange-300"
                    >
                      <UsersRound size={17} />
                      Community
                      <ArrowRight size={17} className="transition group-hover:translate-x-1" />
                    </Link>
                  </div>
                </div>
              </div>
            </section>

          </div>
        )}
      </div>
    </div>
  );
}

function PetSelector({ pets, currentIndex, onSelect }) {
  if (!pets.length) return null;

  return (
    <label className="relative inline-flex items-center gap-2">
      <span className="text-xs font-black uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
        Pet
      </span>

      <div className="relative">
        <select
          value={currentIndex}
          onChange={(event) =>
            onSelect(Number(event.target.value))
          }
          className="appearance-none rounded-xl border border-zinc-200 bg-white py-2.5 pl-3 pr-9 text-sm font-bold text-zinc-800 shadow-sm outline-none focus:border-orange-400 dark:border-zinc-700 dark:bg-[#111820] dark:text-zinc-100"
        >
          {pets.map((pet, index) => (
            <option
              key={pet._id || pet.id || index}
              value={index}
            >
              {pet.name || `Pet ${index + 1}`}
            </option>
          ))}
        </select>

        <ChevronDown
          size={16}
          className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400"
        />
      </div>
    </label>
  );
}

function ProfileInfo({ label, value }) {
  return (
    <div className="min-w-0 rounded-2xl border border-zinc-200 bg-zinc-50 p-3 dark:border-zinc-700 dark:bg-[#18212b]">
      <p className="text-[10px] font-black uppercase tracking-[0.14em] text-zinc-400">
        {label}
      </p>
      <p className="mt-1 break-words text-sm font-bold text-zinc-900 dark:text-zinc-100">
        {value || "Not added"}
      </p>
    </div>
  );
}

function AddPetPanel({
  newPet,
  setNewPet,
  onSave,
  onCancel,
}) {
  return (
    <div className="w-full max-w-2xl rounded-2xl border border-zinc-200 bg-white p-5 shadow-xl dark:border-zinc-700 dark:bg-[#111820] sm:p-7">
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.18em] text-orange-500">
            Smart Paw AI
          </p>

          <h2 className="mt-1 text-2xl font-black text-zinc-900 dark:text-white">
            Add New Pet
          </h2>
        </div>

        <button
          onClick={onCancel}
          title="Close"
          aria-label="Close"
          className="rounded-full p-2 text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
        >
          <X size={19} />
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <PetBasicFields
          pet={newPet}
          update={(field, value) =>
            setNewPet((current) => ({
              ...current,
              [field]: value,
            }))
          }
        />
      </div>

      <div className="mt-6 flex justify-end gap-2">
        <button
          onClick={onCancel}
          className="rounded-xl border border-zinc-300 px-4 py-2.5 text-sm font-bold text-zinc-700 dark:border-zinc-700 dark:text-zinc-300"
        >
          Cancel
        </button>

        <button
          onClick={onSave}
          className="inline-flex items-center gap-2 rounded-xl bg-orange-500 px-5 py-2.5 text-sm font-black text-white hover:bg-orange-600"
        >
          <Plus size={16} />
          Create Pet
        </button>
      </div>
    </div>
  );
}

function ProfileEditor({
  pet,
  onSave,
  onCancel,
  onDelete,
}) {
  const [draft, setDraft] = useState(normalizePet(pet));
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setDraft(normalizePet(pet));
  }, [pet]);

  const update = (field, value) => {
    setDraft((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const handleSave = async () => {
    setSaving(true);

    try {
      await onSave(draft);
    } catch (error) {
      console.error("Pet profile save failed:", error);
      window.alert("Pet profile save nahi ho paya.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-80px)] bg-zinc-50 px-4 py-8 dark:bg-[#0b0f14] sm:px-6 lg:px-10">
      <div className="mx-auto max-w-3xl">
        <div className="mb-5 flex items-center justify-between gap-3">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.2em] text-orange-500">
              Smart Paw AI
            </p>

            <h1 className="mt-1 text-2xl font-black text-zinc-900 dark:text-white">
              Edit Pet Profile
            </h1>
          </div>

          <button
            onClick={onCancel}
            title="Close"
            aria-label="Close"
            className="rounded-full border border-zinc-200 bg-white p-2.5 text-zinc-500 dark:border-zinc-700 dark:bg-[#111820]"
          >
            <X size={18} />
          </button>
        </div>

        <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-xl dark:border-zinc-700 dark:bg-[#111820] sm:p-7">
          <div className="grid gap-4 sm:grid-cols-2">
            <PetBasicFields
              pet={draft}
              update={update}
              includeDetails
            />
          </div>

          <label className="mt-5 block">
            <span className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.12em] text-zinc-500 dark:text-zinc-400">
              Bio
            </span>
            <textarea
              value={draft.bio ?? ""}
              onChange={(event) => update("bio", event.target.value)}
              placeholder="Add a short bio about your pet"
              rows={4}
              className="w-full resize-y rounded-xl border border-zinc-200 bg-white px-3.5 py-2.5 text-sm text-zinc-900 outline-none transition placeholder:text-zinc-400 focus:border-orange-400 focus:ring-2 focus:ring-orange-100 dark:border-zinc-700 dark:bg-[#111820] dark:text-zinc-100 dark:placeholder:text-zinc-500 dark:focus:border-orange-500 dark:focus:ring-orange-950/40"
            />
          </label>

          <div className="mt-7 flex flex-wrap items-center justify-between gap-3 border-t border-zinc-200 pt-6 dark:border-zinc-700">
            <button
              onClick={onDelete}
              className="inline-flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-bold text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20"
            >
              <Trash2 size={16} />
              Delete Pet
            </button>

            <div className="flex gap-2">
              <button
                onClick={onCancel}
                className="rounded-xl border border-zinc-300 px-4 py-2.5 text-sm font-bold text-zinc-700 dark:border-zinc-700 dark:text-zinc-300"
              >
                Cancel
              </button>

              <button
                onClick={handleSave}
                disabled={saving}
                className="inline-flex items-center gap-2 rounded-xl bg-orange-500 px-5 py-2.5 text-sm font-black text-white hover:bg-orange-600 disabled:opacity-60"
              >
                <Save size={16} />
                {saving ? "Saving..." : "Save Profile"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* DOCUMENT HELPERS                                                           */
/* -------------------------------------------------------------------------- */

function PaperInfo({ label, value }) {
  return (
    <div>
      <p className="text-[10px] font-black uppercase tracking-[0.14em] text-zinc-500">
        {label}
      </p>

      <p className="mt-1 text-sm font-bold text-zinc-900">
        {value}
      </p>
    </div>
  );
}

function PaperRow({ label, value }) {
  return (
    <div className="flex flex-col gap-1 border-b border-zinc-200 pb-3 sm:flex-row sm:justify-between">
      <span className="font-bold">{label}</span>
      <span>{value}</span>
    </div>
  );
}

function PaperList({ label, values = [] }) {
  return (
    <div>
      <p className="mb-2 font-bold">{label}</p>

      {values.length ? (
        <div className="flex flex-wrap gap-2">
          {values.map((value, index) => (
            <span
              key={`${String(value)}-${index}`}
              className="border border-zinc-300 bg-white px-3 py-1.5 text-xs font-semibold"
            >
              {typeof value === "string"
                ? value
                : value?.name ||
                  value?.procedure ||
                  JSON.stringify(value)}
            </span>
          ))}
        </div>
      ) : (
        <EmptyDocumentText
          text={`No ${label.toLowerCase()} recorded.`}
        />
      )}
    </div>
  );
}

function EmptyDocumentText({ text }) {
  return (
    <p className="text-sm italic text-zinc-400">
      {text}
    </p>
  );
}

function DocumentHeading({ icon, title }) {
  return (
    <div className="mb-5 flex items-center gap-2 text-zinc-900">
      <span className="text-orange-600">{icon}</span>

      <h2 className="text-lg font-black uppercase tracking-[0.08em]">
        {title}
      </h2>
    </div>
  );
}

function MedicalArrayEditor({
  title,
  values,
  placeholder,
  addLabel,
  emptyOption = false,
  onAdd,
  onRemove,
}) {
  const [value, setValue] = useState("");
  const [error, setError] = useState("");
  const hasNoKnownAllergies = values.includes("No known allergies");

  const handleAdd = () => {
    const trimmedValue = value.trim();

    if (!trimmedValue) {
      setError(`Please enter ${title.toLowerCase()}.`);
      return;
    }

    onAdd(trimmedValue);
    setValue("");
    setError("");
  };

  const handleEmptyOption = (checked) => {
    if (checked) {
      onAdd("No known allergies");
      setValue("");
      setError("");
      return;
    }

    const index = values.indexOf("No known allergies");

    if (index >= 0) onRemove(index);
  };

  return (
    <div className="border-t border-zinc-200 pt-5 first:border-t-0 first:pt-0 dark:border-zinc-700">
      <div className="mb-3 flex items-center justify-between gap-3">
        <p className="text-sm font-bold text-zinc-800">
          {title}
        </p>
      </div>

      <div className="flex flex-wrap gap-2" aria-live="polite">
        {values.length ? (
          values.map((value, index) => (
            <span
              key={`${String(value)}-${index}`}
              className="inline-flex items-center gap-2 border border-zinc-300 bg-white px-3 py-1.5 text-xs font-semibold"
            >
              {typeof value === "string"
                ? value
                : value?.name ||
                  value?.procedure ||
                  JSON.stringify(value)}

              <button
                onClick={() => onRemove(index)}
                title="Remove"
                aria-label="Remove"
              >
                <X
                  size={13}
                  className="text-red-500"
                />
              </button>
            </span>
          ))
        ) : (
          <span className="text-xs italic text-zinc-400">
            Nothing recorded.
          </span>
        )}
      </div>

      <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-start">
        <input
          value={value}
          onChange={(event) => {
            setValue(event.target.value);
            if (error) setError("");
          }}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              handleAdd();
            }
          }}
          placeholder={placeholder}
          className="min-w-0 flex-1 rounded-xl border border-zinc-200 bg-white px-3.5 py-2.5 text-sm text-zinc-900 outline-none transition placeholder:text-zinc-400 focus:border-orange-400 focus:ring-2 focus:ring-orange-100 dark:border-zinc-700 dark:bg-[#111820] dark:text-zinc-100"
        />

        <button
          type="button"
          onClick={handleAdd}
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-orange-500 px-4 py-2.5 text-sm font-bold text-white hover:bg-orange-600"
        >
          <Plus size={15} />
          {addLabel}
        </button>
      </div>

      {emptyOption && (
        <label className="mt-3 inline-flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-300">
          <input
            type="checkbox"
            checked={hasNoKnownAllergies}
            onChange={(event) =>
              handleEmptyOption(event.target.checked)
            }
            className="h-4 w-4 accent-orange-500"
          />
          No known allergies
        </label>
      )}

      {error && (
        <p className="mt-2 text-xs font-semibold text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}

function MedicationEditor({ values, onChange }) {
  const [draft, setDraft] = useState({
    name: "",
    dose: "",
    frequency: "",
  });
  const [error, setError] = useState("");

  const addMedication = () => {
    if (!draft.name.trim()) {
      setError("Please enter a medication name.");
      return;
    }

    onChange([
      ...values,
      {
        name: draft.name.trim(),
        dose: draft.dose.trim(),
        frequency: draft.frequency.trim(),
      },
    ]);
    setDraft({ name: "", dose: "", frequency: "" });
    setError("");
  };

  return (
    <div className="border-t border-zinc-200 pt-5 dark:border-zinc-700">
      <p className="mb-3 text-sm font-bold text-zinc-800">
        Current Medications
      </p>

      <div className="space-y-2">
        {values.map((medication, index) => {
          const item =
            typeof medication === "string"
              ? { name: medication }
              : medication || {};

          return (
            <div
              key={medication?._id || index}
              className="flex flex-col gap-2 rounded-xl border border-zinc-200 bg-white p-3 sm:flex-row sm:items-center sm:justify-between dark:border-zinc-700 dark:bg-[#111820]"
            >
              <p className="min-w-0 text-sm font-semibold text-zinc-800 dark:text-zinc-100">
                <span className="break-words">{item.name || "Unnamed medication"}</span>
                {(item.dose || item.frequency) && (
                  <span className="block text-xs font-normal text-zinc-500">
                    {[item.dose, item.frequency].filter(Boolean).join(" • ")}
                  </span>
                )}
              </p>

              <button
                type="button"
                onClick={() =>
                  onChange(values.filter((_, itemIndex) => itemIndex !== index))
                }
                className="inline-flex min-h-9 items-center gap-1.5 self-start text-xs font-bold text-red-600 sm:self-auto"
              >
                <Trash2 size={14} />
                Remove
              </button>
            </div>
          );
        })}
      </div>

      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        <InputField
          label="Medication Name"
          value={draft.name}
          onChange={(value) => setDraft((current) => ({ ...current, name: value }))}
          placeholder="Medication name"
        />
        <InputField
          label="Dosage"
          value={draft.dose}
          onChange={(value) => setDraft((current) => ({ ...current, dose: value }))}
          placeholder="e.g. 10 mg"
        />
        <InputField
          label="Frequency"
          value={draft.frequency}
          onChange={(value) => setDraft((current) => ({ ...current, frequency: value }))}
          placeholder="e.g. Once daily"
        />
      </div>

      <button
        type="button"
        onClick={addMedication}
        className="mt-3 inline-flex min-h-11 items-center gap-2 rounded-xl border border-orange-400 px-4 py-2.5 text-sm font-bold text-orange-600 hover:bg-orange-50"
      >
        <Plus size={15} />
        Add Medication
      </button>

      {error && <p className="mt-2 text-xs font-semibold text-red-600">{error}</p>}
    </div>
  );
}

function SurgeryEditor({ values, onChange }) {
  const [draft, setDraft] = useState({ procedure: "", date: "" });
  const [error, setError] = useState("");

  const addSurgery = () => {
    if (!draft.procedure.trim()) {
      setError("Please enter a surgery name.");
      return;
    }

    onChange([
      ...values,
      { procedure: draft.procedure.trim(), date: draft.date || undefined },
    ]);
    setDraft({ procedure: "", date: "" });
    setError("");
  };

  return (
    <div className="border-t border-zinc-200 pt-5 dark:border-zinc-700">
      <p className="mb-3 text-sm font-bold text-zinc-800">
        Previous Surgeries
      </p>

      <div className="space-y-2">
        {values.map((surgery, index) => {
          const item =
            typeof surgery === "string"
              ? { procedure: surgery }
              : surgery || {};

          return (
            <div
              key={surgery?._id || index}
              className="flex flex-col gap-2 rounded-xl border border-zinc-200 bg-white p-3 sm:flex-row sm:items-center sm:justify-between dark:border-zinc-700 dark:bg-[#111820]"
            >
              <p className="min-w-0 text-sm font-semibold text-zinc-800 dark:text-zinc-100">
                <span className="break-words">{item.procedure || "Unnamed surgery"}</span>
                {item.date && (
                  <span className="block text-xs font-normal text-zinc-500">
                    {formatDate(item.date)}
                  </span>
                )}
              </p>

              <button
                type="button"
                onClick={() =>
                  onChange(values.filter((_, itemIndex) => itemIndex !== index))
                }
                className="inline-flex min-h-9 items-center gap-1.5 self-start text-xs font-bold text-red-600 sm:self-auto"
              >
                <Trash2 size={14} />
                Remove
              </button>
            </div>
          );
        })}
      </div>

      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        <InputField
          label="Surgery Name"
          value={draft.procedure}
          onChange={(value) => setDraft((current) => ({ ...current, procedure: value }))}
          placeholder="Procedure name"
        />
        <InputField
          label="Date"
          type="date"
          value={draft.date}
          onChange={(value) => setDraft((current) => ({ ...current, date: value }))}
        />
      </div>

      <button
        type="button"
        onClick={addSurgery}
        className="mt-3 inline-flex min-h-11 items-center gap-2 rounded-xl border border-orange-400 px-4 py-2.5 text-sm font-bold text-orange-600 hover:bg-orange-50"
      >
        <Plus size={15} />
        Add Surgery
      </button>

      {error && <p className="mt-2 text-xs font-semibold text-red-600">{error}</p>}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* PAGE                                                                       */
/* -------------------------------------------------------------------------- */

export default function PetProfile() {
  const {
    pets,
    currentPet,
    currentUser,
    setCurrentPet,
    addPet,
    updatePetInContext,
    removePetFromContext,
  } = useAppContext();

  const [view, setView] = useState("card");
  const [editingProfile, setEditingProfile] =
    useState(false);

  const [addingPet, setAddingPet] = useState(false);

  const [newPet, setNewPet] = useState({
    name: "",
    species: "Cat",
    breed: "",
    age: "",
    gender: "",
    parentName: "",
    color: "",
    reproductiveStatus: "",
  });

  const [photo, setPhoto] = useState("");

  const activePet = currentPet || pets[0] || null;

  const activePetIndex = useMemo(() => {
    if (!activePet) return 0;

    const index = pets.findIndex(
      (pet) =>
        String(pet._id || pet.id) ===
        String(activePet._id || activePet.id),
    );

    return Math.max(index, 0);
  }, [activePet, pets]);

  useEffect(() => {
    if (!activePet) return;

    try {
      const savedPhotos = JSON.parse(
        localStorage.getItem(photoStorageKey) || "{}",
      );

      const petKey = activePet._id || activePet.id;

      setPhoto(savedPhotos[petKey] || "");
    } catch {
      setPhoto("");
    }
  }, [activePet]);

  const handlePhotoChange = (event) => {
    const file = event.target.files?.[0];

    if (!file || !activePet) return;

    const reader = new FileReader();

    reader.onload = () => {
      const photoData = reader.result;

      setPhoto(photoData);

      const petKey =
        activePet._id || activePet.id;

      try {
        const savedPhotos = JSON.parse(
          localStorage.getItem(photoStorageKey) || "{}",
        );

        savedPhotos[petKey] = photoData;

        localStorage.setItem(
          photoStorageKey,
          JSON.stringify(savedPhotos),
        );
      } catch {
        // Ignore photo storage errors.
      }
    };

    reader.readAsDataURL(file);
  };

  const handleSelectPet = (index) => {
    const selectedPet = pets[index];

    if (!selectedPet) return;

    setCurrentPet(selectedPet);

    setView("card");
    setEditingProfile(false);
    setAddingPet(false);
  };

  const handleCreatePet = async () => {
    if (!newPet.name.trim()) {
      window.alert("Please enter pet name.");
      return;
    }

    try {
      const created = await createPet({
        ...newPet,
        age: newPet.age
          ? Number(newPet.age)
          : undefined,
      });

      const normalized = normalizePet(
        created?.pet || created,
      );

      addPet(normalized);

      setNewPet({
        name: "",
        species: "Cat",
        breed: "",
        age: "",
        gender: "",
        parentName: "",
        color: "",
        reproductiveStatus: "",
      });

      setAddingPet(false);
      setEditingProfile(false);
      setView("card");
    } catch (error) {
      console.error("Create pet failed:", error);
      window.alert("Pet create nahi ho paya.");
    }
  };

  /*
   * FIX:
   * API update function and Context update function have
   * different names now.
   *
   * This ensures database + React state both update.
   */
  const handleUpdatePet = async (draft) => {
    const petId = activePet?._id || activePet?.id;

    if (!petId) {
      window.alert("Pet ID nahi mila.");
      return;
    }

    const updatedResponse = await apiUpdatePet(
      petId,
      draft,
    );

    const updated = normalizePet(
      updatedResponse?.pet ||
        updatedResponse?.data ||
        updatedResponse,
    );

    updatePetInContext(updated);

    setEditingProfile(false);
    setView("card");
  };

  const handleMedicalSave = async (draft) => {
    const petId = activePet?._id || activePet?.id;

    if (!petId) {
      window.alert("Pet ID nahi mila.");
      return;
    }

    const updatedResponse = await apiUpdatePet(
      petId,
      draft,
    );

    const updated = normalizePet(
      updatedResponse?.pet ||
        updatedResponse?.data ||
        updatedResponse,
    );

    updatePetInContext(updated);
  };

  const handleDeletePet = async () => { 
  if (!activePet) return; 
 
  const confirmed = window.confirm( 
    `Delete ${activePet.name || "this pet"}? This cannot be undone.`, 
  ); 
 
  if (!confirmed) return; 
 
  const petId = 
    activePet._id || activePet.id; 
 
  try { 
    await apiDeletePet(petId); 
 
    if (typeof removePetFromContext === "function") { 
      removePetFromContext(petId); 
    } 
 
    setEditingProfile(false); 
    setView("card"); 
  } catch (error) { 
    console.error("Delete pet failed:", error); 
    window.alert("Pet delete nahi ho paya."); 
  } 
};

  if (!activePet && !addingPet) {
    return (
      <div className="min-h-[calc(100vh-80px)] bg-zinc-50 px-4 py-10 dark:bg-[#0b0f14]">
        <div className="mx-auto max-w-md rounded-2xl border border-zinc-200 bg-white p-7 text-center shadow-xl dark:border-zinc-700 dark:bg-[#111820]">
          <Sparkles
            className="mx-auto text-orange-500"
            size={38}
          />

          <h1 className="mt-4 text-2xl font-black text-zinc-900 dark:text-white">
            No Pet Added
          </h1>

          <p className="mt-2 text-sm text-zinc-500">
            Add your first pet to create a Smart Paw AI
            identity card.
          </p>

          <button
            onClick={() => setAddingPet(true)}
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-orange-500 px-5 py-3 text-sm font-black text-white hover:bg-orange-600"
          >
            <Plus size={17} />
            Add First Pet
          </button>
        </div>
      </div>
    );
  }

  if (view === "medical" && activePet) {
    return (
      <MedicalPaper
        pet={activePet}
        petIndex={activePetIndex}
        currentUser={currentUser}
        onBack={() => setView("card")}
        onSave={handleMedicalSave}
      />
    );
  }

  if (editingProfile && activePet) {
    return (
      <ProfileEditor
        pet={activePet}
        onCancel={() => setEditingProfile(false)}
        onSave={handleUpdatePet}
        onDelete={handleDeletePet}
      />
    );
  }

  return (
    <PetIdCard
      pet={activePet || emptyPet}
      petIndex={activePetIndex}
      pets={pets}
      currentUser={currentUser}
      photo={photo}
      onPhotoChange={handlePhotoChange}
      onSelectPet={handleSelectPet}
      onOpenMedical={() => setView("medical")}
      onEdit={() => setEditingProfile(true)}
      onAddPet={() => setAddingPet(true)}
      addingPet={addingPet}
      newPet={newPet}
      setNewPet={setNewPet}
      onSaveNewPet={handleCreatePet}
      onCancelAdd={() => setAddingPet(false)}
    />
  );
}

const petFieldOptions = {
  species: ["Cat", "Dog", "Bird", "Rabbit", "Other"],
  gender: ["Male", "Female", "Unknown"],
  reproductiveStatus: ["Intact", "Neutered", "Spayed", "Unknown"],
  weightUnit: ["kg", "lb"],
};

function PetBasicFields({ pet, update, includeDetails = false }) {
  const fields = [
    ["name", "Pet Name"],
    ["species", "Species", "select", petFieldOptions.species],
    ["breed", "Breed / Type"],
    ["age", "Age", "number"],
    ...(includeDetails ? [["dateOfBirth", "Date of Birth", "date"]] : []),
    ["gender", "Gender", "select", petFieldOptions.gender],
    [
      "reproductiveStatus",
      "Reproductive Status",
      "select",
      petFieldOptions.reproductiveStatus,
    ],
    ["parentName", "Parent Name"],
    ["color", "Color"],
    ...(includeDetails ? [["microchipId", "Microchip ID"]] : []),
  ];

  return (
    <>
      {fields.map(([field, label, type = "text", options]) =>
        type === "select" ? (
          <SelectField
            key={field}
            label={label}
            value={pet[field]}
            onChange={(value) => update(field, value)}
            options={options}
          />
        ) : (
          <InputField
            key={field}
            label={label}
            type={type}
            value={pet[field]}
            onChange={(value) => update(field, value)}
          />
        ),
      )}

      {includeDetails && (
        <>
          <InputField
            label="Weight"
            type="number"
            value={pet.weight?.value}
            onChange={(value) =>
              update("weight", { ...pet.weight, value })
            }
          />

          <SelectField
            label="Weight Unit"
            value={pet.weight?.unit}
            onChange={(value) =>
              update("weight", { ...pet.weight, unit: value })
            }
            options={petFieldOptions.weightUnit}
          />
        </>
      )}
    </>
  );
}
