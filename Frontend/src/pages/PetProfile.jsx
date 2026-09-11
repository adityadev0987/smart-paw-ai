import { useEffect, useMemo, useState } from "react";
import {
  Activity,
  AlertTriangle,
  Apple,
  Baby,
  CheckCircle2,
  ClipboardList,
  Edit3,
  Heart,
  Home,
  Info,
  MapPin,
  Pill,
  Plus,
  Save,
  Scissors,
  ShieldCheck,
  Sparkles,
  Stethoscope,
  Syringe,
  Trash2,
  UserRound,
  X,
} from "lucide-react";

import { useAppContext } from "../hooks/useAppContext";
import {
  createPet,
  updatePet,
  deletePet,
} from "../services/api";

const sections = [
  {
    id: "general",
    label: "General",
    icon: UserRound,
  },
  {
    id: "medical",
    label: "Medical",
    icon: Stethoscope,
  },
  {
    id: "preventive",
    label: "Preventive Care",
    icon: Syringe,
  },
  {
    id: "nutrition",
    label: "Nutrition",
    icon: Apple,
  },
  {
    id: "behavior",
    label: "Behavior",
    icon: Heart,
  },
  {
    id: "lifestyle",
    label: "Lifestyle",
    icon: Home,
  },
  {
    id: "grooming",
    label: "Grooming & Dental",
    icon: Scissors,
  },
  {
    id: "monitoring",
    label: "Health Monitoring",
    icon: Activity,
  },
  {
    id: "reproductive",
    label: "Reproductive & Family",
    icon: Baby,
  },
  {
    id: "emergency",
    label: "Emergency",
    icon: AlertTriangle,
  },
];

const emptyPet = {
  name: "",
  species: "Dog",
  breed: "",
  age: "",
  dateOfBirth: "",
  gender: "Male",
  reproductiveStatus: "Unknown",

  weight: {
    value: "",
    unit: "kg",
  },

  color: "",
  microchipId: "",

  acquisition: {
    date: "",
    source: "Unknown",
  },

  medical: {
    healthStatus: "Unknown",
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
      flea: {
        product: "",
        lastGiven: "",
        nextDue: "",
      },
      tick: {
        product: "",
        lastGiven: "",
        nextDue: "",
      },
      deworming: {
        product: "",
        lastGiven: "",
        nextDue: "",
      },
      heartworm: {
        product: "",
        lastGiven: "",
        nextDue: "",
      },
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
    recentDietChange: false,
    waterIntake: "Unknown",
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
    activityLevel: "Unknown",
    exerciseType: "",
    exerciseDuration: "",
    exerciseFrequency: "",
    housing: "Unknown",
    indoorOutdoor: "Unknown",
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
    toothBrushing: false,
    dentalCleaningFrequency: "",
    dentalProblems: "",
    badBreath: false,
  },

  healthMonitoring: {
    baseline: {
      appetite: "Unknown",
      energy: "Unknown",
      sleep: "Unknown",
      urination: "Unknown",
      bowelMovements: "Unknown",
      breathing: "Unknown",
      behavior: "Unknown",
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

function normalizePet(pet) {
  return {
    ...emptyPet,
    ...pet,

    id: pet?._id || pet?.id,

    weight: {
      ...emptyPet.weight,
      ...(pet?.weight || {}),
    },

    acquisition: {
      ...emptyPet.acquisition,
      ...(pet?.acquisition || {}),
    },

    medical: {
      ...emptyPet.medical,
      ...(pet?.medical || {}),
      conditions: pet?.medical?.conditions || [],
      previousIllnesses:
        pet?.medical?.previousIllnesses || [],
      allergies: pet?.medical?.allergies || [],
      surgeries: pet?.medical?.surgeries || [],
      previousHospitalizations:
        pet?.medical?.previousHospitalizations || [],
      medications: pet?.medical?.medications || [],
      supplements: pet?.medical?.supplements || [],
    },

    preventiveCare: {
      ...emptyPet.preventiveCare,
      ...(pet?.preventiveCare || {}),
      vaccinations:
        pet?.preventiveCare?.vaccinations || [],
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
      temperament: pet?.behavior?.temperament || [],
      behavioralConcerns:
        pet?.behavior?.behavioralConcerns || [],
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
      observations:
        pet?.healthMonitoring?.observations || [],
    },

    reproductiveFamily: {
      ...emptyPet.reproductiveFamily,
      ...(pet?.reproductiveFamily || {}),
      geneticConditions:
        pet?.reproductiveFamily?.geneticConditions || [],
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

function Field({
  label,
  name,
  value,
  onChange,
  type = "text",
  placeholder = "",
  min,
  options,
  disabled = false,
}) {
  return (
    <div>
      <label
        htmlFor={name}
        className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400"
      >
        {label}
      </label>

      {options ? (
        <select
          id={name}
          name={name}
          value={value ?? ""}
          onChange={onChange}
          disabled={disabled}
          className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-900 outline-none transition focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 disabled:cursor-not-allowed disabled:opacity-60 dark:border-white/10 dark:bg-[#18212B] dark:text-white"
        >
          {options.map((option) => (
            <option
              key={option.value}
              value={option.value}
            >
              {option.label}
            </option>
          ))}
        </select>
      ) : (
        <input
          id={name}
          name={name}
          type={type}
          value={value ?? ""}
          onChange={onChange}
          placeholder={placeholder}
          min={min}
          disabled={disabled}
          className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-orange-500 focus:bg-white focus:ring-4 focus:ring-orange-500/10 disabled:cursor-not-allowed disabled:opacity-60 dark:border-white/10 dark:bg-[#18212B] dark:text-white dark:placeholder:text-slate-500 dark:focus:bg-[#18212B]"
        />
      )}
    </div>
  );
}

function TextArea({
  label,
  value,
  onChange,
  placeholder = "",
  rows = 4,
  disabled = false,
}) {
  return (
    <div>
      <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
        {label}
      </label>

      <textarea
        value={value ?? ""}
        onChange={onChange}
        rows={rows}
        placeholder={placeholder}
        disabled={disabled}
        className="mt-2 w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-orange-500 focus:bg-white focus:ring-4 focus:ring-orange-500/10 disabled:cursor-not-allowed disabled:opacity-60 dark:border-white/10 dark:bg-[#18212B] dark:text-white dark:placeholder:text-slate-500 dark:focus:bg-[#18212B]"
      />
    </div>
  );
}

function Toggle({
  label,
  checked,
  onChange,
  disabled = false,
}) {
  return (
    <label className="flex cursor-pointer items-center justify-between gap-4 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 dark:border-white/10 dark:bg-[#18212B]">
      <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">
        {label}
      </span>

      <button
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={`relative h-6 w-11 rounded-full transition ${
          checked
            ? "bg-orange-500"
            : "bg-slate-300 dark:bg-slate-700"
        } disabled:cursor-not-allowed disabled:opacity-60`}
      >
        <span
          className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow-sm transition ${
            checked ? "left-6" : "left-1"
          }`}
        />
      </button>
    </label>
  );
}

function SectionCard({
  title,
  description,
  icon: Icon,
  children,
}) {
  return (
    <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm dark:border-white/10 dark:bg-[#111820]">
      <div className="border-b border-slate-100 bg-gradient-to-r from-orange-50/70 to-white p-5 dark:border-white/10 dark:from-orange-500/5 dark:to-[#111820] sm:p-6">
        <div className="flex items-start gap-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-orange-500/10 text-orange-500">
            <Icon size={21} />
          </div>

          <div>
            <h2 className="text-lg font-extrabold text-slate-900 dark:text-white">
              {title}
            </h2>

            {description && (
              <p className="mt-1 text-sm leading-5 text-slate-500 dark:text-slate-400">
                {description}
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="p-5 sm:p-6">{children}</div>
    </div>
  );
}

function PetProfile() {
  const {
    pets = [],
    currentPet,
    setCurrentPet,
    addPet,
    removePet,
    isPetLoading,
  } = useAppContext();

  const [petData, setPetData] = useState(null);
  const [activeSection, setActiveSection] =
    useState("general");

  const [isEditing, setIsEditing] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [newPet, setNewPet] = useState({
    name: "",
    species: "Dog",
    breed: "",
    age: "",
    gender: "Male",
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    if (!currentPet) {
      setPetData(null);
      return;
    }

    setPetData(normalizePet(currentPet));
    setError("");
    setSuccess("");
    setIsEditing(false);
  }, [currentPet]);

  const completion = useMemo(() => {
    if (!petData) return 0;

    const checks = [
      petData.name,
      petData.species,
      petData.breed,
      petData.age !== "",
      petData.gender,
      petData.weight?.value,
      petData.color,
      petData.medical?.healthStatus !== "Unknown",
      petData.medical?.conditions?.length,
      petData.medical?.allergies?.length,
      petData.nutrition?.foodType,
      petData.nutrition?.foodBrand,
      petData.lifestyle?.activityLevel !== "Unknown",
      petData.groomingDental?.groomingFrequency,
      petData.healthMonitoring?.baseline?.appetite !==
        "Unknown",
      petData.emergency?.primaryVet?.name,
    ];

    return Math.round(
      (checks.filter(Boolean).length / checks.length) *
        100,
    );
  }, [petData]);

  const handlePetChange = (event) => {
    const selectedPet = pets.find(
      (pet) => pet._id === event.target.value,
    );

    if (!selectedPet) return;

    setCurrentPet(selectedPet);
    setActiveSection("general");
    setError("");
    setSuccess("");
  };

  const updateRootField = (name, value) => {
    setPetData((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const updateNestedField = (
    section,
    name,
    value,
  ) => {
    setPetData((current) => ({
      ...current,
      [section]: {
        ...current[section],
        [name]: value,
      },
    }));
  };

  const updateDeepField = (
    section,
    subsection,
    name,
    value,
  ) => {
    setPetData((current) => ({
      ...current,
      [section]: {
        ...current[section],
        [subsection]: {
          ...current[section]?.[subsection],
          [name]: value,
        },
      },
    }));
  };

  const handleNewPetChange = (event) => {
    const { name, value } = event.target;

    setNewPet((current) => ({
      ...current,
      [name]: value,
    }));

    setError("");
    setSuccess("");
  };

  const handleSave = async () => {
    if (!currentPet?._id || !petData) {
      setError("Pet information is not available.");
      return;
    }

    if (!petData.name?.trim()) {
      setError("Pet name is required.");
      setActiveSection("general");
      return;
    }

    if (!petData.breed?.trim()) {
      setError("Pet breed is required.");
      setActiveSection("general");
      return;
    }

    if (
      petData.age === "" ||
      Number(petData.age) < 0
    ) {
      setError("Please enter a valid age.");
      setActiveSection("general");
      return;
    }

    try {
      setIsSaving(true);
      setError("");
      setSuccess("");

      const payload = {
        ...petData,
        id: undefined,
        _id: undefined,
        __v: undefined,

        age: Number(petData.age),

        weight: {
          ...petData.weight,
          value:
            petData.weight?.value === ""
              ? undefined
              : Number(petData.weight.value),
        },

        nutrition: {
          ...petData.nutrition,
          mealsPerDay:
            petData.nutrition?.mealsPerDay === ""
              ? undefined
              : Number(
                  petData.nutrition.mealsPerDay,
                ),
        },
      };

      delete payload.id;
      delete payload._id;
      delete payload.__v;

      const updatedPet = await updatePet(
        currentPet._id,
        payload,
      );

      const normalizedPet =
        normalizePet(updatedPet);

      setCurrentPet(normalizedPet);
      setPetData(normalizedPet);
      setIsEditing(false);
      setSuccess(
        "Pet profile updated successfully.",
      );
    } catch (error) {
      console.error(
        "Failed to update pet:",
        error,
      );

      setError(
        error.message ||
          "Failed to update pet information.",
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddPet = async () => {
    if (!newPet.name.trim()) {
      setError("Pet name is required.");
      return;
    }

    if (!newPet.breed.trim()) {
      setError("Pet breed is required.");
      return;
    }

    if (
      newPet.age === "" ||
      Number(newPet.age) < 0
    ) {
      setError("Please enter a valid age.");
      return;
    }

    try {
      setIsSaving(true);
      setError("");
      setSuccess("");

      const createdPet = await createPet({
        name: newPet.name.trim(),
        species: newPet.species,
        breed: newPet.breed.trim(),
        age: Number(newPet.age),
        gender: newPet.gender,
      });

      const normalizedPet =
        normalizePet(createdPet);

      if (addPet) {
        addPet(normalizedPet);
      } else {
        setCurrentPet(normalizedPet);
      }

      setNewPet({
        name: "",
        species: "Dog",
        breed: "",
        age: "",
        gender: "Male",
      });

      setIsAdding(false);
      setActiveSection("general");
      setSuccess(
        "New pet added successfully.",
      );
    } catch (error) {
      console.error(
        "Failed to create pet:",
        error,
      );

      setError(
        error.message ||
          "Failed to add new pet.",
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    if (!currentPet) return;

    setPetData(normalizePet(currentPet));
    setIsEditing(false);
    setError("");
    setSuccess("");
  };

  const handleCancelAdd = () => {
    setIsAdding(false);

    setNewPet({
      name: "",
      species: "Dog",
      breed: "",
      age: "",
      gender: "Male",
    });

    setError("");
    setSuccess("");
  };

  // Delete current pet
  const handleDeletePet = async () => {
    if (!currentPet?._id) {
      setError(
        "Pet information is not available.",
      );
      return;
    }

    const confirmed = window.confirm(
      `Are you sure you want to delete ${currentPet.name}? This action cannot be undone.`,
    );

    if (!confirmed) return;

    try {
      setIsSaving(true);
      setError("");
      setSuccess("");

      await deletePet(currentPet._id);

      removePet(currentPet._id);

      setIsEditing(false);
      setActiveSection("general");

      setSuccess(
        `${currentPet.name} has been deleted successfully.`,
      );
    } catch (error) {
      console.error(
        "Failed to delete pet:",
        error,
      );

      setError(
        error.message ||
          "Failed to delete pet.",
      );
    } finally {
      setIsSaving(false);
    }
  };

  const addArrayItem = (
    section,
    field,
    value,
  ) => {
    if (!value?.trim()) return;

    setPetData((current) => ({
      ...current,
      [section]: {
        ...current[section],
        [field]: [
          ...(current[section]?.[field] || []),
          value.trim(),
        ],
      },
    }));
  };

  const removeArrayItem = (
    section,
    field,
    index,
  ) => {
    setPetData((current) => ({
      ...current,
      [section]: {
        ...current[section],
        [field]: current[section][field].filter(
          (_, itemIndex) =>
            itemIndex !== index,
        ),
      },
    }));
  };

  if (isPetLoading) {
    return (
      <section className="min-h-[calc(100vh-4rem)] bg-white px-4 py-8 dark:bg-[#0B0F14] sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="h-8 w-48 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />

          <div className="mt-3 h-5 w-80 max-w-full animate-pulse rounded bg-slate-100 dark:bg-slate-800/70" />

          <div className="mt-8 h-64 animate-pulse rounded-3xl bg-slate-100 dark:bg-[#111820]" />
        </div>
      </section>
    );
  }

  return (
    <main className="relative min-h-[calc(100vh-4rem)] overflow-hidden bg-white px-4 py-8 text-slate-900 transition-colors duration-300 dark:bg-[#0B0F14] dark:text-white sm:px-6 sm:py-10 lg:px-8">
      <div className="pointer-events-none absolute -left-40 top-20 h-96 w-96 rounded-full bg-orange-500/10 blur-3xl dark:bg-orange-500/5" />

      <div className="pointer-events-none absolute -right-40 top-[500px] h-96 w-96 rounded-full bg-orange-500/5 blur-3xl" />

      <div className="relative mx-auto max-w-6xl">
        {/* Header */}
        <header className="mb-7 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-orange-200 bg-orange-50 px-3 py-1.5 text-xs font-bold text-orange-600 dark:border-orange-500/20 dark:bg-orange-500/10 dark:text-orange-400">
              <PawPrintIcon />
              Smart Pet Health Profile
            </div>

            <h1 className="text-3xl font-black tracking-tight sm:text-4xl lg:text-5xl">
              Know your pet.{" "}
              <span className="text-orange-500">
                Care smarter.
              </span>
            </h1>

            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-500 dark:text-slate-400 sm:text-base">
              Keep your pet's health, lifestyle,
              nutrition and care information organized
              for more personalized Smart Paw AI
              assistance.
            </p>
          </div>

          {!isAdding && (
            <button
              type="button"
              onClick={() => {
                setIsAdding(true);
                setIsEditing(false);
                setError("");
                setSuccess("");
              }}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-orange-500 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-orange-500/20 transition hover:bg-orange-600"
            >
              <Plus size={17} />
              Add New Pet
            </button>
          )}
        </header>

        {/* Messages */}
        {success && (
          <div className="mb-6 flex items-start gap-3 rounded-2xl border border-green-200 bg-green-50 p-4 dark:border-green-500/20 dark:bg-green-500/10">
            <CheckCircle2
              size={18}
              className="mt-0.5 shrink-0 text-green-600 dark:text-green-400"
            />

            <p className="text-sm font-semibold text-green-700 dark:text-green-400">
              {success}
            </p>
          </div>
        )}

        {error && (
          <div className="mb-6 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 dark:border-red-500/20 dark:bg-red-500/10">
            <AlertTriangle
              size={18}
              className="mt-0.5 shrink-0 text-red-500"
            />

            <p className="text-sm font-semibold text-red-600 dark:text-red-400">
              {error}
            </p>
          </div>
        )}

        {/* Add Pet */}
        {isAdding && (
          <div className="mb-7 overflow-hidden rounded-3xl border border-orange-200 bg-white shadow-sm dark:border-orange-500/20 dark:bg-[#111820]">
            <div className="border-b border-slate-100 bg-orange-50/60 p-5 dark:border-white/10 dark:bg-orange-500/5 sm:p-6">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-500 text-white">
                    <Plus size={22} />
                  </div>

                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-orange-500">
                      New Pet
                    </p>

                    <h2 className="mt-1 text-xl font-black">
                      Create pet profile
                    </h2>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleCancelAdd}
                  disabled={isSaving}
                  className="rounded-xl p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-white/10"
                >
                  <X size={19} />
                </button>
              </div>
            </div>

            <div className="grid gap-5 p-5 sm:grid-cols-2 lg:grid-cols-4 sm:p-6">
              <Field
                label="Pet Name"
                name="name"
                value={newPet.name}
                onChange={handleNewPetChange}
                placeholder="e.g. Bruno"
                disabled={isSaving}
              />

              <Field
                label="Species"
                name="species"
                value={newPet.species}
                onChange={handleNewPetChange}
                options={[
                  {
                    value: "Dog",
                    label: "Dog",
                  },
                  {
                    value: "Cat",
                    label: "Cat",
                  },
                  {
                    value: "Other",
                    label: "Other",
                  },
                ]}
                disabled={isSaving}
              />

              <Field
                label="Breed"
                name="breed"
                value={newPet.breed}
                onChange={handleNewPetChange}
                placeholder="e.g. Labrador"
                disabled={isSaving}
              />

              <Field
                label="Age"
                name="age"
                type="number"
                min="0"
                value={newPet.age}
                onChange={handleNewPetChange}
                placeholder="Years"
                disabled={isSaving}
              />

              <Field
                label="Gender"
                name="gender"
                value={newPet.gender}
                onChange={handleNewPetChange}
                options={[
                  {
                    value: "Male",
                    label: "Male",
                  },
                  {
                    value: "Female",
                    label: "Female",
                  },
                ]}
                disabled={isSaving}
              />
            </div>

            <div className="flex flex-col-reverse gap-3 border-t border-slate-100 p-5 dark:border-white/10 sm:flex-row sm:justify-end sm:p-6">
              <button
                type="button"
                onClick={handleCancelAdd}
                disabled={isSaving}
                className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-bold text-slate-700 dark:border-white/10 dark:text-slate-300"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleAddPet}
                disabled={isSaving}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-orange-500 px-5 py-3 text-sm font-bold text-white hover:bg-orange-600 disabled:opacity-60"
              >
                <Plus size={17} />
                {isSaving
                  ? "Creating..."
                  : "Create Pet"}
              </button>
            </div>
          </div>
        )}

        {/* Current Pet */}
        {currentPet && petData && (
          <>
            {/* Pet Identity */}
            <section className="mb-6 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm dark:border-white/10 dark:bg-[#111820]">
              <div className="relative p-5 sm:p-6">
                <div className="absolute -right-16 -top-20 h-48 w-48 rounded-full bg-orange-500/10 blur-3xl" />

                <div className="relative flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-orange-500 text-white shadow-lg shadow-orange-500/20">
                      <PawPrintIcon size={31} />
                    </div>

                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="text-2xl font-black">
                          {petData.name}
                        </h2>

                        <span className="rounded-full bg-orange-500/10 px-2.5 py-1 text-xs font-bold text-orange-500">
                          {petData.species}
                        </span>
                      </div>

                      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                        {petData.breed} •{" "}
                        {petData.gender} •{" "}
                        {petData.age} years
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col gap-3 sm:flex-row">
                    {pets.length > 1 && (
                      <select
                        value={currentPet._id}
                        onChange={handlePetChange}
                        disabled={
                          isEditing || isSaving
                        }
                        className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold outline-none focus:border-orange-500 dark:border-white/10 dark:bg-[#18212B] dark:text-white"
                      >
                        {pets.map((pet) => (
                          <option
                            key={pet._id}
                            value={pet._id}
                          >
                            {pet.name} • {pet.breed}
                          </option>
                        ))}
                      </select>
                    )}

                    {!isEditing ? (
                      <div className="flex flex-col gap-2 sm:flex-row">
                        <button
                          type="button"
                          onClick={() => {
                            setIsEditing(true);
                            setError("");
                            setSuccess("");
                          }}
                          className="inline-flex items-center justify-center gap-2 rounded-xl bg-orange-500 px-5 py-3 text-sm font-bold text-white hover:bg-orange-600"
                        >
                          <Edit3 size={16} />
                          Edit Profile
                        </button>

                        <button
                          type="button"
                          onClick={handleDeletePet}
                          disabled={isSaving}
                          className="inline-flex items-center justify-center gap-2 rounded-xl border border-red-200 bg-red-50 px-5 py-3 text-sm font-bold text-red-600 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-400 dark:hover:bg-red-500/15"
                        >
                          <Trash2 size={16} />
                          {isSaving
                            ? "Deleting..."
                            : "Delete Pet"}
                        </button>
                      </div>
                    ) : (
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={handleCancel}
                          disabled={isSaving}
                          className="rounded-xl border border-slate-200 px-4 py-3 text-sm font-bold dark:border-white/10"
                        >
                          Cancel
                        </button>

                        <button
                          type="button"
                          onClick={handleSave}
                          disabled={isSaving}
                          className="inline-flex items-center gap-2 rounded-xl bg-orange-500 px-5 py-3 text-sm font-bold text-white hover:bg-orange-600 disabled:opacity-60"
                        >
                          <Save size={16} />
                          {isSaving
                            ? "Saving..."
                            : "Save Changes"}
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Completion */}
                <div className="relative mt-6">
                  <div className="mb-2 flex items-center justify-between text-xs font-bold">
                    <span className="text-slate-500 dark:text-slate-400">
                      Health profile completion
                    </span>

                    <span className="text-orange-500">
                      {completion}%
                    </span>
                  </div>

                  <div className="h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                    <div
                      className="h-full rounded-full bg-orange-500 transition-all duration-500"
                      style={{
                        width: `${completion}%`,
                      }}
                    />
                  </div>
                </div>
              </div>
            </section>

            {/* Section Navigation */}
            <div className="mb-6 overflow-x-auto rounded-2xl border border-slate-200 bg-white p-2 shadow-sm dark:border-white/10 dark:bg-[#111820]">
              <div className="flex min-w-max gap-1">
                {sections.map((section) => {
                  const Icon = section.icon;

                  const active =
                    activeSection ===
                    section.id;

                  return (
                    <button
                      key={section.id}
                      type="button"
                      onClick={() =>
                        setActiveSection(
                          section.id,
                        )
                      }
                      className={`inline-flex items-center gap-2 rounded-xl px-3 py-2.5 text-xs font-bold transition sm:px-4 ${
                        active
                          ? "bg-orange-500 text-white shadow-sm"
                          : "text-slate-500 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-white/5 dark:hover:text-white"
                      }`}
                    >
                      <Icon size={15} />
                      {section.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* GENERAL */}
            {activeSection === "general" && (
              <SectionCard
                title="General Information"
                description="Basic identity and physical information about your pet."
                icon={UserRound}
              >
                <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                  <Field
                    label="Pet Name"
                    value={petData.name}
                    onChange={(e) =>
                      updateRootField(
                        "name",
                        e.target.value,
                      )
                    }
                    disabled={!isEditing}
                  />

                  <Field
                    label="Species"
                    value={petData.species}
                    onChange={(e) =>
                      updateRootField(
                        "species",
                        e.target.value,
                      )
                    }
                    options={[
                      {
                        value: "Dog",
                        label: "Dog",
                      },
                      {
                        value: "Cat",
                        label: "Cat",
                      },
                      {
                        value: "Other",
                        label: "Other",
                      },
                    ]}
                    disabled={!isEditing}
                  />

                  <Field
                    label="Breed"
                    value={petData.breed}
                    onChange={(e) =>
                      updateRootField(
                        "breed",
                        e.target.value,
                      )
                    }
                    disabled={!isEditing}
                  />

                  <Field
                    label="Age"
                    type="number"
                    min="0"
                    value={petData.age}
                    onChange={(e) =>
                      updateRootField(
                        "age",
                        e.target.value,
                      )
                    }
                    disabled={!isEditing}
                  />

                  <Field
                    label="Date of Birth"
                    type="date"
                    value={
                      petData.dateOfBirth
                        ? String(
                            petData.dateOfBirth,
                          ).slice(0, 10)
                        : ""
                    }
                    onChange={(e) =>
                      updateRootField(
                        "dateOfBirth",
                        e.target.value,
                      )
                    }
                    disabled={!isEditing}
                  />

                  <Field
                    label="Gender"
                    value={petData.gender}
                    onChange={(e) =>
                      updateRootField(
                        "gender",
                        e.target.value,
                      )
                    }
                    options={[
                      {
                        value: "Male",
                        label: "Male",
                      },
                      {
                        value: "Female",
                        label: "Female",
                      },
                    ]}
                    disabled={!isEditing}
                  />

                  <Field
                    label="Reproductive Status"
                    value={
                      petData.reproductiveStatus
                    }
                    onChange={(e) =>
                      updateRootField(
                        "reproductiveStatus",
                        e.target.value,
                      )
                    }
                    options={[
                      {
                        value: "Unknown",
                        label: "Unknown",
                      },
                      {
                        value: "Intact",
                        label: "Intact",
                      },
                      {
                        value: "Neutered",
                        label: "Neutered",
                      },
                      {
                        value: "Spayed",
                        label: "Spayed",
                      },
                    ]}
                    disabled={!isEditing}
                  />

                  <Field
                    label="Weight"
                    type="number"
                    min="0"
                    value={
                      petData.weight?.value
                    }
                    onChange={(e) =>
                      updateNestedField(
                        "weight",
                        "value",
                        e.target.value,
                      )
                    }
                    disabled={!isEditing}
                  />

                  <Field
                    label="Weight Unit"
                    value={
                      petData.weight?.unit
                    }
                    onChange={(e) =>
                      updateNestedField(
                        "weight",
                        "unit",
                        e.target.value,
                      )
                    }
                    options={[
                      {
                        value: "kg",
                        label: "Kilograms (kg)",
                      },
                      {
                        value: "lb",
                        label: "Pounds (lb)",
                      },
                    ]}
                    disabled={!isEditing}
                  />

                  <Field
                    label="Color / Coat"
                    value={petData.color}
                    onChange={(e) =>
                      updateRootField(
                        "color",
                        e.target.value,
                      )
                    }
                    disabled={!isEditing}
                  />

                  <Field
                    label="Microchip ID"
                    value={
                      petData.microchipId
                    }
                    onChange={(e) =>
                      updateRootField(
                        "microchipId",
                        e.target.value,
                      )
                    }
                    disabled={!isEditing}
                  />

                  <Field
                    label="Acquisition Source"
                    value={
                      petData.acquisition
                        ?.source
                    }
                    onChange={(e) =>
                      updateNestedField(
                        "acquisition",
                        "source",
                        e.target.value,
                      )
                    }
                    options={[
                      {
                        value: "Unknown",
                        label: "Unknown",
                      },
                      {
                        value: "Adopted",
                        label: "Adopted",
                      },
                      {
                        value: "Breeder",
                        label: "Breeder",
                      },
                      {
                        value: "Rescue",
                        label: "Rescue",
                      },
                      {
                        value: "Stray",
                        label: "Stray",
                      },
                      {
                        value: "Other",
                        label: "Other",
                      },
                    ]}
                    disabled={!isEditing}
                  />
                </div>
              </SectionCard>
            )}

            {/* MEDICAL */}
            {activeSection === "medical" && (
              <SectionCard
                title="Medical History"
                description="Conditions, allergies, previous illnesses, procedures and medicines."
                icon={Stethoscope}
              >
                <div className="grid gap-5 sm:grid-cols-2">
                  <Field
                    label="Current Health Status"
                    value={
                      petData.medical
                        .healthStatus
                    }
                    onChange={(e) =>
                      updateNestedField(
                        "medical",
                        "healthStatus",
                        e.target.value,
                      )
                    }
                    options={[
                      {
                        value: "Unknown",
                        label: "Unknown",
                      },
                      {
                        value: "Healthy",
                        label: "Healthy",
                      },
                      {
                        value: "Minor Concern",
                        label: "Minor Concern",
                      },
                      {
                        value: "Chronic Condition",
                        label: "Chronic Condition",
                      },
                      {
                        value: "Under Treatment",
                        label: "Under Treatment",
                      },
                    ]}
                    disabled={!isEditing}
                  />

                  <Field
                    label="Previous Hospitalizations"
                    value={
                      petData.medical
                        .previousHospitalizations?.join(
                          ", ",
                        ) || ""
                    }
                    onChange={(e) =>
                      updateNestedField(
                        "medical",
                        "previousHospitalizations",
                        e.target.value
                          .split(",")
                          .map((item) =>
                            item.trim(),
                          )
                          .filter(Boolean),
                      )
                    }
                    placeholder="Separate with commas"
                    disabled={!isEditing}
                  />
                </div>

                <div className="mt-5 grid gap-5 lg:grid-cols-2">
                  <ArrayEditor
                    title="Known Conditions"
                    icon={Activity}
                    items={
                      petData.medical
                        .conditions
                    }
                    onAdd={(value) =>
                      addArrayItem(
                        "medical",
                        "conditions",
                        value,
                      )
                    }
                    onRemove={(index) =>
                      removeArrayItem(
                        "medical",
                        "conditions",
                        index,
                      )
                    }
                    disabled={!isEditing}
                    placeholder="e.g. Hip dysplasia"
                  />

                  <ArrayEditor
                    title="Allergies"
                    icon={AlertTriangle}
                    items={
                      petData.medical
                        .allergies
                    }
                    onAdd={(value) =>
                      addArrayItem(
                        "medical",
                        "allergies",
                        value,
                      )
                    }
                    onRemove={(index) =>
                      removeArrayItem(
                        "medical",
                        "allergies",
                        index,
                      )
                    }
                    disabled={!isEditing}
                    placeholder="e.g. Chicken"
                  />

                  <ArrayEditor
                    title="Previous Illnesses"
                    icon={ClipboardList}
                    items={
                      petData.medical
                        .previousIllnesses
                    }
                    onAdd={(value) =>
                      addArrayItem(
                        "medical",
                        "previousIllnesses",
                        value,
                      )
                    }
                    onRemove={(index) =>
                      removeArrayItem(
                        "medical",
                        "previousIllnesses",
                        index,
                      )
                    }
                    disabled={!isEditing}
                    placeholder="e.g. Ear infection"
                  />
                </div>

                <div className="mt-5">
                  <RecordList
                    title="Current Medications"
                    icon={Pill}
                    records={
                      petData.medical
                        .medications
                    }
                    type="medication"
                    onChange={(records) =>
                      updateNestedField(
                        "medical",
                        "medications",
                        records,
                      )
                    }
                    disabled={!isEditing}
                  />
                </div>

                <div className="mt-5">
                  <RecordList
                    title="Surgeries / Procedures"
                    icon={Scissors}
                    records={
                      petData.medical
                        .surgeries
                    }
                    type="surgery"
                    onChange={(records) =>
                      updateNestedField(
                        "medical",
                        "surgeries",
                        records,
                      )
                    }
                    disabled={!isEditing}
                  />
                </div>
              </SectionCard>
            )}

            {/* PREVENTIVE */}
            {activeSection === "preventive" && (
              <SectionCard
                title="Preventive Care"
                description="Vaccinations and parasite prevention records."
                icon={Syringe}
              >
                <RecordList
                  title="Vaccination Records"
                  icon={Syringe}
                  records={
                    petData.preventiveCare
                      .vaccinations
                  }
                  type="vaccination"
                  onChange={(records) =>
                    updateNestedField(
                      "preventiveCare",
                      "vaccinations",
                      records,
                    )
                  }
                  disabled={!isEditing}
                />

                <div className="mt-6">
                  <h3 className="mb-4 text-sm font-extrabold">
                    Parasite Prevention
                  </h3>

                  <div className="grid gap-5 sm:grid-cols-2">
                    {[
                      [
                        "flea",
                        "Flea Prevention",
                      ],
                      [
                        "tick",
                        "Tick Prevention",
                      ],
                      [
                        "deworming",
                        "Deworming",
                      ],
                      [
                        "heartworm",
                        "Heartworm",
                      ],
                    ].map(([key, label]) => (
                      <div
                        key={key}
                        className="rounded-2xl border border-slate-200 p-4 dark:border-white/10"
                      >
                        <h4 className="font-bold">
                          {label}
                        </h4>

                        <div className="mt-4 grid gap-4">
                          <Field
                            label="Product"
                            value={
                              petData
                                .preventiveCare
                                .parasitePrevention[
                                key
                              ]?.product
                            }
                            onChange={(e) =>
                              updateDeepField(
                                "preventiveCare",
                                "parasitePrevention",
                                key,
                                {
                                  ...petData
                                    .preventiveCare
                                    .parasitePrevention[
                                    key
                                  ],
                                  product:
                                    e.target
                                      .value,
                                },
                              )
                            }
                            disabled={
                              !isEditing
                            }
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </SectionCard>
            )}

            {/* NUTRITION */}
            {activeSection === "nutrition" && (
              <SectionCard
                title="Nutrition & Hydration"
                description="Food, feeding routine, treats and water intake."
                icon={Apple}
              >
                <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                  <Field
                    label="Food Type"
                    value={
                      petData.nutrition
                        .foodType
                    }
                    onChange={(e) =>
                      updateNestedField(
                        "nutrition",
                        "foodType",
                        e.target.value,
                      )
                    }
                    options={[
                      {
                        value: "",
                        label: "Select food type",
                      },
                      {
                        value: "Dry",
                        label: "Dry",
                      },
                      {
                        value: "Wet",
                        label: "Wet",
                      },
                      {
                        value: "Raw",
                        label: "Raw",
                      },
                      {
                        value: "Homemade",
                        label: "Homemade",
                      },
                      {
                        value: "Mixed",
                        label: "Mixed",
                      },
                      {
                        value: "Other",
                        label: "Other",
                      },
                    ]}
                    disabled={!isEditing}
                  />

                  <Field
                    label="Food Brand"
                    value={
                      petData.nutrition
                        .foodBrand
                    }
                    onChange={(e) =>
                      updateNestedField(
                        "nutrition",
                        "foodBrand",
                        e.target.value,
                      )
                    }
                    disabled={!isEditing}
                  />

                  <Field
                    label="Meals Per Day"
                    type="number"
                    min="0"
                    value={
                      petData.nutrition
                        .mealsPerDay
                    }
                    onChange={(e) =>
                      updateNestedField(
                        "nutrition",
                        "mealsPerDay",
                        e.target.value,
                      )
                    }
                    disabled={!isEditing}
                  />

                  <Field
                    label="Feeding Amount"
                    value={
                      petData.nutrition
                        .feedingAmount
                    }
                    onChange={(e) =>
                      updateNestedField(
                        "nutrition",
                        "feedingAmount",
                        e.target.value,
                      )
                    }
                    placeholder="e.g. 250g per meal"
                    disabled={!isEditing}
                  />

                  <Field
                    label="Feeding Schedule"
                    value={
                      petData.nutrition
                        .feedingSchedule
                    }
                    onChange={(e) =>
                      updateNestedField(
                        "nutrition",
                        "feedingSchedule",
                        e.target.value,
                      )
                    }
                    placeholder="e.g. 8 AM / 7 PM"
                    disabled={!isEditing}
                  />

                  <Field
                    label="Water Intake"
                    value={
                      petData.nutrition
                        .waterIntake
                    }
                    onChange={(e) =>
                      updateNestedField(
                        "nutrition",
                        "waterIntake",
                        e.target.value,
                      )
                    }
                    options={[
                      {
                        value: "Unknown",
                        label: "Unknown",
                      },
                      {
                        value: "Normal",
                        label: "Normal",
                      },
                      {
                        value: "Less Than Usual",
                        label:
                          "Less Than Usual",
                      },
                      {
                        value: "More Than Usual",
                        label:
                          "More Than Usual",
                      },
                    ]}
                    disabled={!isEditing}
                  />
                </div>

                <div className="mt-5 grid gap-5 sm:grid-cols-2">
                  <TextArea
                    label="Treats"
                    value={
                      petData.nutrition
                        .treats
                    }
                    onChange={(e) =>
                      updateNestedField(
                        "nutrition",
                        "treats",
                        e.target.value,
                      )
                    }
                    disabled={!isEditing}
                    placeholder="Treats and frequency"
                  />

                  <TextArea
                    label="Water Notes"
                    value={
                      petData.nutrition
                        .waterNotes
                    }
                    onChange={(e) =>
                      updateNestedField(
                        "nutrition",
                        "waterNotes",
                        e.target.value,
                      )
                    }
                    disabled={!isEditing}
                    placeholder="Anything unusual about drinking"
                  />
                </div>

                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  <Toggle
                    label="Recent diet change"
                    checked={
                      petData.nutrition
                        .recentDietChange
                    }
                    onChange={(value) =>
                      updateNestedField(
                        "nutrition",
                        "recentDietChange",
                        value,
                      )
                    }
                    disabled={!isEditing}
                  />
                </div>
              </SectionCard>
            )}

            {/* BEHAVIOR */}
            {activeSection === "behavior" && (
              <SectionCard
                title="Behavior"
                description="Temperament, behavioral concerns and notable habits."
                icon={Heart}
              >
                <div className="grid gap-5 lg:grid-cols-2">
                  <ArrayEditor
                    title="Temperament"
                    items={
                      petData.behavior
                        .temperament
                    }
                    onAdd={(value) =>
                      addArrayItem(
                        "behavior",
                        "temperament",
                        value,
                      )
                    }
                    onRemove={(index) =>
                      removeArrayItem(
                        "behavior",
                        "temperament",
                        index,
                      )
                    }
                    disabled={!isEditing}
                    placeholder="e.g. Friendly"
                  />

                  <ArrayEditor
                    title="Behavioral Concerns"
                    items={
                      petData.behavior
                        .behavioralConcerns
                    }
                    onAdd={(value) =>
                      addArrayItem(
                        "behavior",
                        "behavioralConcerns",
                        value,
                      )
                    }
                    onRemove={(index) =>
                      removeArrayItem(
                        "behavior",
                        "behavioralConcerns",
                        index,
                      )
                    }
                    disabled={!isEditing}
                    placeholder="e.g. Separation anxiety"
                  />
                </div>

                <div className="mt-5 grid gap-3 sm:grid-cols-3">
                  <Toggle
                    label="Separation anxiety"
                    checked={
                      petData.behavior
                        .separationAnxiety
                    }
                    onChange={(value) =>
                      updateNestedField(
                        "behavior",
                        "separationAnxiety",
                        value,
                      )
                    }
                    disabled={!isEditing}
                  />

                  <Toggle
                    label="Aggression"
                    checked={
                      petData.behavior
                        .aggression
                    }
                    onChange={(value) =>
                      updateNestedField(
                        "behavior",
                        "aggression",
                        value,
                      )
                    }
                    disabled={!isEditing}
                  />

                  <Toggle
                    label="Excessive vocalization"
                    checked={
                      petData.behavior
                        .excessiveVocalization
                    }
                    onChange={(value) =>
                      updateNestedField(
                        "behavior",
                        "excessiveVocalization",
                        value,
                      )
                    }
                    disabled={!isEditing}
                  />
                </div>

                <div className="mt-5">
                  <TextArea
                    label="Behavior Notes"
                    value={
                      petData.behavior
                        .notes
                    }
                    onChange={(e) =>
                      updateNestedField(
                        "behavior",
                        "notes",
                        e.target.value,
                      )
                    }
                    disabled={!isEditing}
                  />
                </div>
              </SectionCard>
            )}

            {/* LIFESTYLE */}
            {activeSection === "lifestyle" && (
              <SectionCard
                title="Lifestyle & Environment"
                description="Activity, housing, exercise and environmental factors."
                icon={Home}
              >
                <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                  <Field
                    label="Activity Level"
                    value={
                      petData.lifestyle
                        .activityLevel
                    }
                    onChange={(e) =>
                      updateNestedField(
                        "lifestyle",
                        "activityLevel",
                        e.target.value,
                      )
                    }
                    options={[
                      {
                        value: "Unknown",
                        label: "Unknown",
                      },
                      {
                        value: "Low",
                        label: "Low",
                      },
                      {
                        value: "Moderate",
                        label: "Moderate",
                      },
                      {
                        value: "High",
                        label: "High",
                      },
                      {
                        value: "Very High",
                        label: "Very High",
                      },
                    ]}
                    disabled={!isEditing}
                  />

                  <Field
                    label="Housing"
                    value={
                      petData.lifestyle
                        .housing
                    }
                    onChange={(e) =>
                      updateNestedField(
                        "lifestyle",
                        "housing",
                        e.target.value,
                      )
                    }
                    options={[
                      {
                        value: "Unknown",
                        label: "Unknown",
                      },
                      {
                        value: "Apartment",
                        label: "Apartment",
                      },
                      {
                        value: "House",
                        label: "House",
                      },
                      {
                        value: "Farm",
                        label: "Farm",
                      },
                      {
                        value: "Other",
                        label: "Other",
                      },
                    ]}
                    disabled={!isEditing}
                  />

                  <Field
                    label="Indoor / Outdoor"
                    value={
                      petData.lifestyle
                        .indoorOutdoor
                    }
                    onChange={(e) =>
                      updateNestedField(
                        "lifestyle",
                        "indoorOutdoor",
                        e.target.value,
                      )
                    }
                    options={[
                      {
                        value: "Unknown",
                        label: "Unknown",
                      },
                      {
                        value: "Indoor",
                        label: "Indoor",
                      },
                      {
                        value: "Outdoor",
                        label: "Outdoor",
                      },
                      {
                        value: "Both",
                        label: "Both",
                      },
                    ]}
                    disabled={!isEditing}
                  />

                  <Field
                    label="Exercise Type"
                    value={
                      petData.lifestyle
                        .exerciseType
                    }
                    onChange={(e) =>
                      updateNestedField(
                        "lifestyle",
                        "exerciseType",
                        e.target.value,
                      )
                    }
                    placeholder="Walking, running, play..."
                    disabled={!isEditing}
                  />

                  <Field
                    label="Exercise Duration"
                    value={
                      petData.lifestyle
                        .exerciseDuration
                    }
                    onChange={(e) =>
                      updateNestedField(
                        "lifestyle",
                        "exerciseDuration",
                        e.target.value,
                      )
                    }
                    placeholder="e.g. 30 minutes"
                    disabled={!isEditing}
                  />

                  <Field
                    label="Exercise Frequency"
                    value={
                      petData.lifestyle
                        .exerciseFrequency
                    }
                    onChange={(e) =>
                      updateNestedField(
                        "lifestyle",
                        "exerciseFrequency",
                        e.target.value,
                      )
                    }
                    placeholder="e.g. Daily"
                    disabled={!isEditing}
                  />
                </div>

                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  <Toggle
                    label="Other pets at home"
                    checked={
                      petData.lifestyle
                        .otherPets
                    }
                    onChange={(value) =>
                      updateNestedField(
                        "lifestyle",
                        "otherPets",
                        value,
                      )
                    }
                    disabled={!isEditing}
                  />

                  <Toggle
                    label="Children at home"
                    checked={
                      petData.lifestyle
                        .childrenAtHome
                    }
                    onChange={(value) =>
                      updateNestedField(
                        "lifestyle",
                        "childrenAtHome",
                        value,
                      )
                    }
                    disabled={!isEditing}
                  />
                </div>

                {petData.lifestyle
                  .otherPets && (
                  <div className="mt-5">
                    <TextArea
                      label="Other Pets Details"
                      value={
                        petData.lifestyle
                          .otherPetsDetails
                      }
                      onChange={(e) =>
                        updateNestedField(
                          "lifestyle",
                          "otherPetsDetails",
                          e.target.value,
                        )
                      }
                      disabled={!isEditing}
                    />
                  </div>
                )}

                <div className="mt-5 grid gap-5 sm:grid-cols-2">
                  <TextArea
                    label="Environmental Changes"
                    value={
                      petData.lifestyle
                        .environmentalChanges
                    }
                    onChange={(e) =>
                      updateNestedField(
                        "lifestyle",
                        "environmentalChanges",
                        e.target.value,
                      )
                    }
                    disabled={!isEditing}
                    placeholder="Recent move, new pet, new routine..."
                  />

                  <TextArea
                    label="Exposure Notes"
                    value={
                      petData.lifestyle
                        .exposureNotes
                    }
                    onChange={(e) =>
                      updateNestedField(
                        "lifestyle",
                        "exposureNotes",
                        e.target.value,
                      )
                    }
                    disabled={!isEditing}
                    placeholder="Outdoor exposure, chemicals, stray animals..."
                  />
                </div>
              </SectionCard>
            )}

            {/* GROOMING */}
            {activeSection === "grooming" && (
              <SectionCard
                title="Grooming & Dental"
                description="Coat, hygiene, nail, ear and dental care."
                icon={Scissors}
              >
                <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                  <Field
                    label="Grooming Frequency"
                    value={
                      petData.groomingDental
                        .groomingFrequency
                    }
                    onChange={(e) =>
                      updateNestedField(
                        "groomingDental",
                        "groomingFrequency",
                        e.target.value,
                      )
                    }
                    disabled={!isEditing}
                  />

                  <Field
                    label="Bathing Frequency"
                    value={
                      petData.groomingDental
                        .bathingFrequency
                    }
                    onChange={(e) =>
                      updateNestedField(
                        "groomingDental",
                        "bathingFrequency",
                        e.target.value,
                      )
                    }
                    disabled={!isEditing}
                  />

                  <Field
                    label="Brushing Frequency"
                    value={
                      petData.groomingDental
                        .brushingFrequency
                    }
                    onChange={(e) =>
                      updateNestedField(
                        "groomingDental",
                        "brushingFrequency",
                        e.target.value,
                      )
                    }
                    disabled={!isEditing}
                  />

                  <Field
                    label="Nail Trimming"
                    value={
                      petData.groomingDental
                        .nailTrimmingFrequency
                    }
                    onChange={(e) =>
                      updateNestedField(
                        "groomingDental",
                        "nailTrimmingFrequency",
                        e.target.value,
                      )
                    }
                    disabled={!isEditing}
                  />

                  <Field
                    label="Ear Cleaning"
                    value={
                      petData.groomingDental
                        .earCleaningFrequency
                    }
                    onChange={(e) =>
                      updateNestedField(
                        "groomingDental",
                        "earCleaningFrequency",
                        e.target.value,
                      )
                    }
                    disabled={!isEditing}
                  />

                  <Field
                    label="Dental Cleaning"
                    value={
                      petData.groomingDental
                        .dentalCleaningFrequency
                    }
                    onChange={(e) =>
                      updateNestedField(
                        "groomingDental",
                        "dentalCleaningFrequency",
                        e.target.value,
                      )
                    }
                    disabled={!isEditing}
                  />
                </div>

                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  <Toggle
                    label="Regular tooth brushing"
                    checked={
                      petData.groomingDental
                        .toothBrushing
                    }
                    onChange={(value) =>
                      updateNestedField(
                        "groomingDental",
                        "toothBrushing",
                        value,
                      )
                    }
                    disabled={!isEditing}
                  />

                  <Toggle
                    label="Bad breath"
                    checked={
                      petData.groomingDental
                        .badBreath
                    }
                    onChange={(value) =>
                      updateNestedField(
                        "groomingDental",
                        "badBreath",
                        value,
                      )
                    }
                    disabled={!isEditing}
                  />
                </div>

                <div className="mt-5 grid gap-5 sm:grid-cols-2">
                  <TextArea
                    label="Skin / Coat Issues"
                    value={
                      petData.groomingDental
                        .skinCoatIssues
                    }
                    onChange={(e) =>
                      updateNestedField(
                        "groomingDental",
                        "skinCoatIssues",
                        e.target.value,
                      )
                    }
                    disabled={!isEditing}
                  />

                  <TextArea
                    label="Dental Problems"
                    value={
                      petData.groomingDental
                        .dentalProblems
                    }
                    onChange={(e) =>
                      updateNestedField(
                        "groomingDental",
                        "dentalProblems",
                        e.target.value,
                      )
                    }
                    disabled={!isEditing}
                  />
                </div>
              </SectionCard>
            )}

            {/* MONITORING */}
            {activeSection === "monitoring" && (
              <SectionCard
                title="Health Monitoring"
                description="Record your pet's normal baseline so changes can be recognized."
                icon={Activity}
              >
                <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                  <Field
                    label="Normal Appetite"
                    value={
                      petData.healthMonitoring
                        .baseline.appetite
                    }
                    onChange={(e) =>
                      updateDeepField(
                        "healthMonitoring",
                        "baseline",
                        "appetite",
                        e.target.value,
                      )
                    }
                    options={[
                      {
                        value: "Unknown",
                        label: "Unknown",
                      },
                      {
                        value: "Normal",
                        label: "Normal",
                      },
                      {
                        value: "Low",
                        label: "Low",
                      },
                      {
                        value: "High",
                        label: "High",
                      },
                    ]}
                    disabled={!isEditing}
                  />

                  <Field
                    label="Normal Energy"
                    value={
                      petData.healthMonitoring
                        .baseline.energy
                    }
                    onChange={(e) =>
                      updateDeepField(
                        "healthMonitoring",
                        "baseline",
                        "energy",
                        e.target.value,
                      )
                    }
                    options={[
                      {
                        value: "Unknown",
                        label: "Unknown",
                      },
                      {
                        value: "Normal",
                        label: "Normal",
                      },
                      {
                        value: "Low",
                        label: "Low",
                      },
                      {
                        value: "High",
                        label: "High",
                      },
                    ]}
                    disabled={!isEditing}
                  />

                  <Field
                    label="Normal Sleep"
                    value={
                      petData.healthMonitoring
                        .baseline.sleep
                    }
                    onChange={(e) =>
                      updateDeepField(
                        "healthMonitoring",
                        "baseline",
                        "sleep",
                        e.target.value,
                      )
                    }
                    options={[
                      {
                        value: "Unknown",
                        label: "Unknown",
                      },
                      {
                        value: "Normal",
                        label: "Normal",
                      },
                      {
                        value: "Reduced",
                        label: "Reduced",
                      },
                      {
                        value: "Increased",
                        label: "Increased",
                      },
                    ]}
                    disabled={!isEditing}
                  />

                  <Field
                    label="Normal Urination"
                    value={
                      petData.healthMonitoring
                        .baseline.urination
                    }
                    onChange={(e) =>
                      updateDeepField(
                        "healthMonitoring",
                        "baseline",
                        "urination",
                        e.target.value,
                      )
                    }
                    options={[
                      {
                        value: "Unknown",
                        label: "Unknown",
                      },
                      {
                        value: "Normal",
                        label: "Normal",
                      },
                      {
                        value: "Abnormal",
                        label: "Abnormal",
                      },
                    ]}
                    disabled={!isEditing}
                  />

                  <Field
                    label="Normal Bowel Movements"
                    value={
                      petData.healthMonitoring
                        .baseline
                        .bowelMovements
                    }
                    onChange={(e) =>
                      updateDeepField(
                        "healthMonitoring",
                        "baseline",
                        "bowelMovements",
                        e.target.value,
                      )
                    }
                    options={[
                      {
                        value: "Unknown",
                        label: "Unknown",
                      },
                      {
                        value: "Normal",
                        label: "Normal",
                      },
                      {
                        value: "Abnormal",
                        label: "Abnormal",
                      },
                    ]}
                    disabled={!isEditing}
                  />

                  <Field
                    label="Normal Breathing"
                    value={
                      petData.healthMonitoring
                        .baseline.breathing
                    }
                    onChange={(e) =>
                      updateDeepField(
                        "healthMonitoring",
                        "baseline",
                        "breathing",
                        e.target.value,
                      )
                    }
                    options={[
                      {
                        value: "Unknown",
                        label: "Unknown",
                      },
                      {
                        value: "Normal",
                        label: "Normal",
                      },
                      {
                        value: "Abnormal",
                        label: "Abnormal",
                      },
                    ]}
                    disabled={!isEditing}
                  />
                </div>

                <div className="mt-6">
                  <RecordList
                    title="Health Observations"
                    icon={Activity}
                    records={
                      petData.healthMonitoring
                        .observations
                    }
                    type="observation"
                    onChange={(records) =>
                      updateNestedField(
                        "healthMonitoring",
                        "observations",
                        records,
                      )
                    }
                    disabled={!isEditing}
                  />
                </div>
              </SectionCard>
            )}

            {/* REPRODUCTIVE */}
            {activeSection === "reproductive" && (
              <SectionCard
                title="Reproductive & Family History"
                description="Reproductive history and known hereditary information."
                icon={Baby}
              >
                <div className="grid gap-5 sm:grid-cols-2">
                  <TextArea
                    label="Pregnancy History"
                    value={
                      petData.reproductiveFamily
                        .pregnancyHistory
                    }
                    onChange={(e) =>
                      updateNestedField(
                        "reproductiveFamily",
                        "pregnancyHistory",
                        e.target.value,
                      )
                    }
                    disabled={!isEditing}
                  />

                  <TextArea
                    label="Reproductive Complications"
                    value={
                      petData.reproductiveFamily
                        .reproductiveComplications
                    }
                    onChange={(e) =>
                      updateNestedField(
                        "reproductiveFamily",
                        "reproductiveComplications",
                        e.target.value,
                      )
                    }
                    disabled={!isEditing}
                  />

                  <TextArea
                    label="Family History"
                    value={
                      petData.reproductiveFamily
                        .familyHistory
                    }
                    onChange={(e) =>
                      updateNestedField(
                        "reproductiveFamily",
                        "familyHistory",
                        e.target.value,
                      )
                    }
                    disabled={!isEditing}
                  />

                  <ArrayEditor
                    title="Known Genetic Conditions"
                    items={
                      petData
                        .reproductiveFamily
                        .geneticConditions
                    }
                    onAdd={(value) =>
                      addArrayItem(
                        "reproductiveFamily",
                        "geneticConditions",
                        value,
                      )
                    }
                    onRemove={(index) =>
                      removeArrayItem(
                        "reproductiveFamily",
                        "geneticConditions",
                        index,
                      )
                    }
                    disabled={!isEditing}
                    placeholder="e.g. Hip dysplasia"
                  />
                </div>
              </SectionCard>
            )}

            {/* EMERGENCY */}
            {activeSection === "emergency" && (
              <SectionCard
                title="Emergency Information"
                description="Keep important veterinary contacts and critical notes ready."
                icon={AlertTriangle}
              >
                <div className="grid gap-5 lg:grid-cols-2">
                  <VetContactCard
                    title="Primary Veterinarian"
                    contact={
                      petData.emergency
                        .primaryVet
                    }
                    onChange={(field, value) =>
                      updateDeepField(
                        "emergency",
                        "primaryVet",
                        field,
                        value,
                      )
                    }
                    disabled={!isEditing}
                  />

                  <VetContactCard
                    title="Emergency Veterinarian"
                    contact={
                      petData.emergency
                        .emergencyVet
                    }
                    onChange={(field, value) =>
                      updateDeepField(
                        "emergency",
                        "emergencyVet",
                        field,
                        value,
                      )
                    }
                    disabled={!isEditing}
                  />
                </div>

                <div className="mt-5">
                  <TextArea
                    label="Emergency Notes"
                    value={
                      petData.emergency
                        .emergencyNotes
                    }
                    onChange={(e) =>
                      updateNestedField(
                        "emergency",
                        "emergencyNotes",
                        e.target.value,
                      )
                    }
                    disabled={!isEditing}
                    placeholder="Important allergies, conditions, special instructions..."
                  />
                </div>

                <div className="mt-5 flex gap-3 rounded-2xl border border-orange-200 bg-orange-50 p-4 dark:border-orange-500/20 dark:bg-orange-500/10">
                  <ShieldCheck
                    size={19}
                    className="mt-0.5 shrink-0 text-orange-500"
                  />

                  <p className="text-xs leading-5 text-slate-600 dark:text-slate-300">
                    Keep emergency information
                    accurate. Smart Paw AI can use
                    this information as context, but
                    it does not replace professional
                    veterinary care.
                  </p>
                </div>
              </SectionCard>
            )}

            {/* Bottom info */}
            <div className="mt-6 flex gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-white/10 dark:bg-[#111820]">
              <Info
                size={18}
                className="mt-0.5 shrink-0 text-orange-500"
              />

              <div>
                <p className="text-sm font-bold">
                  Build the profile gradually
                </p>

                <p className="mt-1 text-xs leading-5 text-slate-500 dark:text-slate-400">
                  You don't need to fill every field at
                  once. Add information as you learn
                  more about your pet.
                </p>
              </div>
            </div>
          </>
        )}

        {/* Empty state */}
        {!currentPet && !isAdding && (
          <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 px-6 py-16 text-center dark:border-white/10 dark:bg-[#111820]">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-orange-500/10 text-orange-500">
              <PawPrintIcon size={30} />
            </div>

            <h2 className="mt-5 text-xl font-black">
              No pet profile yet
            </h2>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500 dark:text-slate-400">
              Add your first pet to start building a
              personalized health profile.
            </p>

            <button
              type="button"
              onClick={() => setIsAdding(true)}
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-orange-500 px-5 py-3 text-sm font-bold text-white hover:bg-orange-600"
            >
              <Plus size={17} />
              Add Your First Pet
            </button>
          </div>
        )}
      </div>
    </main>
  );
}

function ArrayEditor({
  title,
  icon: Icon = Plus,
  items = [],
  onAdd,
  onRemove,
  disabled,
  placeholder,
}) {
  const [value, setValue] = useState("");

  const submit = () => {
    if (!value.trim()) return;

    onAdd(value);
    setValue("");
  };

  return (
    <div className="rounded-2xl border border-slate-200 p-4 dark:border-white/10">
      <div className="flex items-center gap-2">
        <Icon
          size={16}
          className="text-orange-500"
        />

        <h3 className="text-sm font-extrabold">
          {title}
        </h3>
      </div>

      <div className="mt-4 flex gap-2">
        <input
          value={value}
          onChange={(e) =>
            setValue(e.target.value)
          }
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              submit();
            }
          }}
          placeholder={placeholder}
          disabled={disabled}
          className="min-w-0 flex-1 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none focus:border-orange-500 dark:border-white/10 dark:bg-[#18212B] dark:text-white"
        />

        <button
          type="button"
          onClick={submit}
          disabled={disabled}
          className="rounded-xl bg-orange-500 px-3 text-white disabled:opacity-50"
        >
          <Plus size={17} />
        </button>
      </div>

      {items.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2">
          {items.map((item, index) => (
            <span
              key={`${item}-${index}`}
              className="inline-flex items-center gap-2 rounded-full bg-orange-500/10 px-3 py-1.5 text-xs font-bold text-orange-600 dark:text-orange-400"
            >
              {typeof item === "string"
                ? item
                : item.name ||
                  item.description}

              {!disabled && (
                <button
                  type="button"
                  onClick={() =>
                    onRemove(index)
                  }
                  className="text-orange-500 hover:text-red-500"
                >
                  <X size={13} />
                </button>
              )}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

function RecordList({
  title,
  icon: Icon,
  records = [],
  type,
  onChange,
  disabled,
}) {
  const addRecord = () => {
    if (type === "medication") {
      onChange([
        ...records,
        {
          name: "",
          dose: "",
          frequency: "",
          reason: "",
          startDate: "",
          endDate: "",
        },
      ]);

      return;
    }

    if (type === "surgery") {
      onChange([
        ...records,
        {
          procedure: "",
          date: "",
          reason: "",
          notes: "",
        },
      ]);

      return;
    }

    if (type === "vaccination") {
      onChange([
        ...records,
        {
          vaccine: "",
          dateGiven: "",
          nextDueDate: "",
          notes: "",
        },
      ]);

      return;
    }

    onChange([
      ...records,
      {
        date: new Date()
          .toISOString()
          .slice(0, 10),
        type: "",
        description: "",
      },
    ]);
  };

  const removeRecord = (index) => {
    onChange(
      records.filter(
        (_, itemIndex) =>
          itemIndex !== index,
      ),
    );
  };

  const updateRecord = (
    index,
    field,
    value,
  ) => {
    onChange(
      records.map(
        (record, itemIndex) =>
          itemIndex === index
            ? {
                ...record,
                [field]: value,
              }
            : record,
      ),
    );
  };

  return (
    <div className="rounded-2xl border border-slate-200 p-4 dark:border-white/10">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Icon
            size={16}
            className="text-orange-500"
          />

          <h3 className="text-sm font-extrabold">
            {title}
          </h3>
        </div>

        {!disabled && (
          <button
            type="button"
            onClick={addRecord}
            className="inline-flex items-center gap-1.5 rounded-lg bg-orange-500 px-3 py-2 text-xs font-bold text-white hover:bg-orange-600"
          >
            <Plus size={14} />
            Add
          </button>
        )}
      </div>

      {records.length === 0 ? (
        <p className="mt-4 text-xs text-slate-400">
          No records added yet.
        </p>
      ) : (
        <div className="mt-4 space-y-4">
          {records.map((record, index) => (
            <div
              key={
                record._id || index
              }
              className="relative rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-white/10 dark:bg-[#18212B]"
            >
              {!disabled && (
                <button
                  type="button"
                  onClick={() =>
                    removeRecord(index)
                  }
                  className="absolute right-3 top-3 rounded-lg p-2 text-slate-400 hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-500/10"
                >
                  <Trash2 size={15} />
                </button>
              )}

              {type === "medication" && (
                <div className="grid gap-4 pr-8 sm:grid-cols-2">
                  <Field
                    label="Medicine"
                    value={record.name}
                    onChange={(e) =>
                      updateRecord(
                        index,
                        "name",
                        e.target.value,
                      )
                    }
                    disabled={disabled}
                  />

                  <Field
                    label="Dose"
                    value={record.dose}
                    onChange={(e) =>
                      updateRecord(
                        index,
                        "dose",
                        e.target.value,
                      )
                    }
                    disabled={disabled}
                  />

                  <Field
                    label="Frequency"
                    value={
                      record.frequency
                    }
                    onChange={(e) =>
                      updateRecord(
                        index,
                        "frequency",
                        e.target.value,
                      )
                    }
                    disabled={disabled}
                  />

                  <Field
                    label="Reason"
                    value={record.reason}
                    onChange={(e) =>
                      updateRecord(
                        index,
                        "reason",
                        e.target.value,
                      )
                    }
                    disabled={disabled}
                  />

                  <Field
                    label="Start Date"
                    type="date"
                    value={
                      record.startDate
                        ? String(
                            record.startDate,
                          ).slice(0, 10)
                        : ""
                    }
                    onChange={(e) =>
                      updateRecord(
                        index,
                        "startDate",
                        e.target.value,
                      )
                    }
                    disabled={disabled}
                  />

                  <Field
                    label="End Date"
                    type="date"
                    value={
                      record.endDate
                        ? String(
                            record.endDate,
                          ).slice(0, 10)
                        : ""
                    }
                    onChange={(e) =>
                      updateRecord(
                        index,
                        "endDate",
                        e.target.value,
                      )
                    }
                    disabled={disabled}
                  />
                </div>
              )}

              {type === "surgery" && (
                <div className="grid gap-4 pr-8 sm:grid-cols-2">
                  <Field
                    label="Procedure"
                    value={
                      record.procedure
                    }
                    onChange={(e) =>
                      updateRecord(
                        index,
                        "procedure",
                        e.target.value,
                      )
                    }
                    disabled={disabled}
                  />

                  <Field
                    label="Date"
                    type="date"
                    value={
                      record.date
                        ? String(
                            record.date,
                          ).slice(0, 10)
                        : ""
                    }
                    onChange={(e) =>
                      updateRecord(
                        index,
                        "date",
                        e.target.value,
                      )
                    }
                    disabled={disabled}
                  />

                  <Field
                    label="Reason"
                    value={record.reason}
                    onChange={(e) =>
                      updateRecord(
                        index,
                        "reason",
                        e.target.value,
                      )
                    }
                    disabled={disabled}
                  />

                  <Field
                    label="Notes"
                    value={record.notes}
                    onChange={(e) =>
                      updateRecord(
                        index,
                        "notes",
                        e.target.value,
                      )
                    }
                    disabled={disabled}
                  />
                </div>
              )}

              {type === "vaccination" && (
                <div className="grid gap-4 pr-8 sm:grid-cols-2">
                  <Field
                    label="Vaccine"
                    value={
                      record.vaccine
                    }
                    onChange={(e) =>
                      updateRecord(
                        index,
                        "vaccine",
                        e.target.value,
                      )
                    }
                    disabled={disabled}
                  />

                  <Field
                    label="Date Given"
                    type="date"
                    value={
                      record.dateGiven
                        ? String(
                            record.dateGiven,
                          ).slice(0, 10)
                        : ""
                    }
                    onChange={(e) =>
                      updateRecord(
                        index,
                        "dateGiven",
                        e.target.value,
                      )
                    }
                    disabled={disabled}
                  />

                  <Field
                    label="Next Due Date"
                    type="date"
                    value={
                      record.nextDueDate
                        ? String(
                            record.nextDueDate,
                          ).slice(0, 10)
                        : ""
                    }
                    onChange={(e) =>
                      updateRecord(
                        index,
                        "nextDueDate",
                        e.target.value,
                      )
                    }
                    disabled={disabled}
                  />

                  <Field
                    label="Notes"
                    value={record.notes}
                    onChange={(e) =>
                      updateRecord(
                        index,
                        "notes",
                        e.target.value,
                      )
                    }
                    disabled={disabled}
                  />
                </div>
              )}

              {type === "observation" && (
                <div className="grid gap-4 pr-8 sm:grid-cols-2">
                  <Field
                    label="Date"
                    type="date"
                    value={
                      record.date
                        ? String(
                            record.date,
                          ).slice(0, 10)
                        : ""
                    }
                    onChange={(e) =>
                      updateRecord(
                        index,
                        "date",
                        e.target.value,
                      )
                    }
                    disabled={disabled}
                  />

                  <Field
                    label="Type"
                    value={record.type}
                    onChange={(e) =>
                      updateRecord(
                        index,
                        "type",
                        e.target.value,
                      )
                    }
                    placeholder="e.g. Appetite"
                    disabled={disabled}
                  />

                  <div className="sm:col-span-2">
                    <TextArea
                      label="Description"
                      value={
                        record.description
                      }
                      onChange={(e) =>
                        updateRecord(
                          index,
                          "description",
                          e.target.value,
                        )
                      }
                      disabled={disabled}
                      rows={3}
                    />
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function VetContactCard({
  title,
  contact,
  onChange,
  disabled,
}) {
  return (
    <div className="rounded-2xl border border-slate-200 p-5 dark:border-white/10">
      <div className="mb-4 flex items-center gap-2">
        <MapPin
          size={17}
          className="text-orange-500"
        />

        <h3 className="font-extrabold">
          {title}
        </h3>
      </div>

      <div className="grid gap-4">
        <Field
          label="Veterinarian Name"
          value={contact.name}
          onChange={(e) =>
            onChange(
              "name",
              e.target.value,
            )
          }
          disabled={disabled}
        />

        <Field
          label="Clinic"
          value={contact.clinic}
          onChange={(e) =>
            onChange(
              "clinic",
              e.target.value,
            )
          }
          disabled={disabled}
        />

        <Field
          label="Phone"
          value={contact.phone}
          onChange={(e) =>
            onChange(
              "phone",
              e.target.value,
            )
          }
          disabled={disabled}
        />
      </div>
    </div>
  );
}

function PawPrintIcon({ size = 14 }) {
  return <Sparkles size={size} />;
}

export default PetProfile;