import { useEffect, useMemo, useState } from "react";
import {
  Activity,
  AlertTriangle,
  Apple,
  CheckCircle2,
  Clock3,
  Dumbbell,
  HeartPulse,
  PawPrint,
  Scissors,
  ShieldCheck,
  Sparkles,
  Stethoscope,
  Target,
} from "lucide-react";
import { useAppContext } from "../hooks/useAppContext";

const HEALTH_CHECK_STORAGE_KEY = "smartPawLatestHealthCheck";

function Recommendation() {
  const {
    pets = [],
    currentPet,
    setCurrentPet,
    isPetLoading,
  } = useAppContext();

  const [selectedCategory, setSelectedCategory] =
    useState("All");

  const [latestHealthCheck, setLatestHealthCheck] =
    useState(null);

  useEffect(() => {
    const loadLatestHealthCheck = () => {
      try {
        const stored = localStorage.getItem(
          HEALTH_CHECK_STORAGE_KEY,
        );

        if (!stored) {
          setLatestHealthCheck(null);
          return;
        }

        const parsed = JSON.parse(stored);

        if (
          parsed?.petId &&
          currentPet?._id &&
          parsed.petId !== currentPet._id
        ) {
          setLatestHealthCheck(null);
          return;
        }

        setLatestHealthCheck(parsed);
      } catch (error) {
        console.error(
          "Failed to load latest health check:",
          error,
        );

        setLatestHealthCheck(null);
      }
    };

    loadLatestHealthCheck();

    window.addEventListener(
      "smartPawHealthCheckUpdated",
      loadLatestHealthCheck,
    );

    window.addEventListener(
      "storage",
      loadLatestHealthCheck,
    );

    return () => {
      window.removeEventListener(
        "smartPawHealthCheckUpdated",
        loadLatestHealthCheck,
      );

      window.removeEventListener(
        "storage",
        loadLatestHealthCheck,
      );
    };
  }, [currentPet?._id]);

  useEffect(() => {
    setSelectedCategory("All");
  }, [currentPet?._id]);

  const categories = [
    {
      name: "All",
      icon: Sparkles,
    },
    {
      name: "Health",
      icon: HeartPulse,
    },
    {
      name: "Nutrition",
      icon: Apple,
    },
    {
      name: "Exercise",
      icon: Dumbbell,
    },
    {
      name: "Grooming",
      icon: Scissors,
    },
    {
      name: "Preventive Care",
      icon: ShieldCheck,
    },
  ];

  const recommendations = useMemo(() => {
    if (!currentPet) {
      return [];
    }

    const result = [];
    let id = 1;

    const addRecommendation = ({
      category,
      priority = "LOW",
      title,
      description,
      action,
      source = "Pet Profile",
      icon = Sparkles,
    }) => {
      result.push({
        id: id++,
        category,
        priority,
        title,
        description,
        action,
        source,
        icon,
      });
    };

    /* =====================================================
       1. LATEST AI HEALTH CHECK
    ===================================================== */

    if (latestHealthCheck) {
      const severity = String(
        latestHealthCheck.severity ||
          latestHealthCheck.status ||
          "",
      ).toUpperCase();

      const urgent =
        latestHealthCheck.urgent === true ||
        severity === "URGENT";

      const assessment =
        latestHealthCheck.assessment ||
        latestHealthCheck.summary ||
        "";

      const healthCheckNextSteps =
        Array.isArray(
          latestHealthCheck.nextSteps,
        )
          ? latestHealthCheck.nextSteps
          : [];

      if (urgent) {
        addRecommendation({
          category: "Health",
          priority: "URGENT",
          title: "Recent health check needs urgent attention",
          description:
            assessment ||
            `The latest health check for ${currentPet.name} contains signs that require prompt veterinary attention.`,
          action:
            healthCheckNextSteps.length > 0
              ? healthCheckNextSteps[0]
              : "Seek veterinary care promptly and do not rely on home monitoring alone.",
          source: "Latest AI Health Check",
          icon: AlertTriangle,
        });
      } else {
        addRecommendation({
          category: "Health",
          priority: "ATTENTION",
          title: "Follow up on the latest health check",
          description:
            assessment ||
            `Your latest health check contains information that is worth monitoring for ${currentPet.name}.`,
          action:
            healthCheckNextSteps.length > 0
              ? healthCheckNextSteps[0]
              : "Continue monitoring the reported symptoms and seek veterinary advice if they persist or worsen.",
          source: "Latest AI Health Check",
          icon: Stethoscope,
        });
      }

      healthCheckNextSteps
        .slice(1)
        .forEach((step) => {
          addRecommendation({
            category: "Health",
            priority: urgent
              ? "URGENT"
              : "ATTENTION",
            title: "Recommended follow-up",
            description:
              "This action was suggested during the latest Smart Paw AI health assessment.",
            action: step,
            source: "Latest AI Health Check",
            icon: Target,
          });
        });
    }

    /* =====================================================
       2. PET PROFILE BASED RECOMMENDATIONS
    ===================================================== */

    const age = Number(currentPet.age);

    if (!Number.isNaN(age)) {
      if (age < 1) {
        addRecommendation({
          category: "Preventive Care",
          priority: "ATTENTION",
          title: "Focus on early-life preventive care",
          description:
            `${currentPet.name} is still young, so preventive care and development should receive extra attention.`,
          action:
            "Keep vaccinations, parasite prevention, nutrition, socialization, and routine veterinary visits on schedule.",
          source: "Pet Profile",
          icon: ShieldCheck,
        });
      }

      if (age >= 7) {
        addRecommendation({
          category: "Health",
          priority: "ATTENTION",
          title: "Monitor age-related changes",
          description:
            `At ${age} years old, changes in activity, appetite, mobility, sleep, or behavior are worth tracking more closely.`,
          action:
            "Record noticeable changes and discuss persistent or unusual changes with your veterinarian.",
          source: "Pet Profile",
          icon: Activity,
        });
      }
    }

    /* =====================================================
       3. WEIGHT
    ===================================================== */

    const weight =
      currentPet.weight?.value ??
      currentPet.weight;

    if (weight) {
      addRecommendation({
        category: "Nutrition",
        priority: "LOW",
        title: "Keep body condition on your radar",
        description:
          `${currentPet.name}'s profile contains a recorded weight of ${weight}${currentPet.weight?.unit ? ` ${currentPet.weight.unit}` : ""}.`,
        action:
          "Track weight periodically and look for gradual changes rather than relying on a single measurement.",
        source: "Pet Profile",
        icon: Apple,
      });
    }

    /* =====================================================
       4. ACTIVITY LEVEL
    ===================================================== */

    const activityLevel =
      currentPet.lifestyle?.activityLevel ||
      currentPet.activityLevel;

    if (
      activityLevel &&
      String(activityLevel).toLowerCase() ===
        "low"
    ) {
      addRecommendation({
        category: "Exercise",
        priority: "ATTENTION",
        title: "Build a more consistent activity routine",
        description:
          `${currentPet.name}'s profile currently shows a low activity level.`,
        action:
          "Add suitable short activity or play sessions and increase activity gradually according to age and health.",
        source: "Pet Profile",
        icon: Dumbbell,
      });
    }

    if (
      activityLevel &&
      String(activityLevel).toLowerCase() ===
        "high"
    ) {
      addRecommendation({
        category: "Exercise",
        priority: "LOW",
        title: "Balance activity with recovery",
        description:
          `${currentPet.name} has a high activity level recorded in the profile.`,
        action:
          "Maintain regular activity while allowing appropriate rest and monitoring for unusual fatigue, pain, or exercise intolerance.",
        source: "Pet Profile",
        icon: Dumbbell,
      });
    }

    /* =====================================================
       5. MEDICAL CONDITIONS
    ===================================================== */

    const conditions =
      currentPet.medical?.conditions || [];

    if (Array.isArray(conditions)) {
      conditions
        .filter(Boolean)
        .slice(0, 4)
        .forEach((condition) => {
          const conditionName =
            typeof condition === "string"
              ? condition
              : condition.name;

          if (!conditionName) return;

          addRecommendation({
            category: "Health",
            priority: "ATTENTION",
            title: `Keep ${conditionName} in your care plan`,
            description:
              `${currentPet.name}'s profile lists ${conditionName} as a current health condition.`,
            action:
              "Keep relevant veterinary instructions, medications, monitoring, and follow-up information up to date.",
            source: "Pet Profile",
            icon: HeartPulse,
          });
        });
    }

    /* =====================================================
       6. ALLERGIES
    ===================================================== */

    const allergies =
      currentPet.medical?.allergies || [];

    if (Array.isArray(allergies)) {
      allergies
        .filter(Boolean)
        .slice(0, 3)
        .forEach((allergy) => {
          const allergyName =
            typeof allergy === "string"
              ? allergy
              : allergy.name;

          if (!allergyName) return;

          addRecommendation({
            category: "Health",
            priority: "ATTENTION",
            title: `Remember ${allergyName} as a known sensitivity`,
            description:
              `${currentPet.name}'s profile lists ${allergyName} as an allergy or sensitivity.`,
            action:
              "Keep this information visible when discussing food, medication, grooming products, or treatment with a veterinarian.",
            source: "Pet Profile",
            icon: ShieldCheck,
          });
        });
    }

    /* =====================================================
       7. MEDICATIONS
    ===================================================== */

    const medications =
      currentPet.medical?.medications || [];

    if (Array.isArray(medications)) {
      medications
        .filter(Boolean)
        .slice(0, 3)
        .forEach((medication) => {
          const medicationName =
            typeof medication === "string"
              ? medication
              : medication.name;

          if (!medicationName) return;

          addRecommendation({
            category: "Health",
            priority: "ATTENTION",
            title: `Keep ${medicationName} information updated`,
            description:
              `${currentPet.name}'s profile contains a current medication record.`,
            action:
              "Keep dose, frequency, start/end dates, and veterinary instructions accurately recorded. Do not change medication without veterinary guidance.",
            source: "Pet Profile",
            icon: HeartPulse,
          });
        });
    }

    /* =====================================================
       8. NUTRITION PROFILE
    ===================================================== */

    const foodType =
      currentPet.nutrition?.foodType;

    const waterIntake =
      currentPet.nutrition?.waterIntake;

    if (!foodType) {
      addRecommendation({
        category: "Nutrition",
        priority: "ATTENTION",
        title: "Complete the nutrition section",
        description:
          `Nutrition details are incomplete for ${currentPet.name}.`,
        action:
          "Add food type, feeding amount, meals per day, treats, and other relevant nutrition information to the pet profile.",
        source: "Pet Profile",
        icon: Apple,
      });
    }

    if (
      waterIntake &&
      String(waterIntake).toLowerCase() !==
        "normal"
    ) {
      addRecommendation({
        category: "Nutrition",
        priority: "ATTENTION",
        title: "Keep water intake under observation",
        description:
          `${currentPet.name}'s profile records a water-intake pattern that is not marked as normal.`,
        action:
          "Continue observing drinking behavior and discuss persistent or significant changes with your veterinarian.",
        source: "Pet Profile",
        icon: Apple,
      });
    }

    /* =====================================================
       9. GROOMING
    ===================================================== */

    const grooming =
      currentPet.groomingDental || {};

    if (
      !grooming.toothBrushing &&
      !grooming.dentalCleaningFrequency
    ) {
      addRecommendation({
        category: "Grooming",
        priority: "LOW",
        title: "Add dental care to the routine",
        description:
          `No regular dental-care routine is recorded for ${currentPet.name}.`,
        action:
          "Add an appropriate dental-care routine and discuss professional dental care with your veterinarian when needed.",
        source: "Pet Profile",
        icon: Scissors,
      });
    }

    /* =====================================================
       10. PREVENTIVE CARE
    ===================================================== */

    const vaccinations =
      currentPet.preventiveCare?.vaccinations ||
      [];

    if (
      !Array.isArray(vaccinations) ||
      vaccinations.length === 0
    ) {
      addRecommendation({
        category: "Preventive Care",
        priority: "ATTENTION",
        title: "Add vaccination records",
        description:
          `No vaccination history is currently recorded for ${currentPet.name}.`,
        action:
          "Add available vaccination records and discuss the appropriate schedule with your veterinarian.",
        source: "Pet Profile",
        icon: ShieldCheck,
      });
    }

    /* =====================================================
       11. GENERAL BASELINE
    ===================================================== */

    if (result.length === 0) {
      addRecommendation({
        category: "Health",
        priority: "LOW",
        title: "Keep monitoring your pet's normal baseline",
        description:
          `There are no major personalized recommendations to highlight for ${currentPet.name} right now.`,
        action:
          "Continue routine veterinary care and monitor appetite, activity, weight, behavior, drinking, urination, and bowel movements.",
        source: "Pet Profile",
        icon: Activity,
      });
    }

    return result;
  }, [currentPet, latestHealthCheck]);

  const filteredRecommendations =
    selectedCategory === "All"
      ? recommendations
      : recommendations.filter(
          (recommendation) =>
            recommendation.category ===
            selectedCategory,
        );

  const urgentCount = recommendations.filter(
    (item) => item.priority === "URGENT",
  ).length;

  const attentionCount = recommendations.filter(
    (item) => item.priority === "ATTENTION",
  ).length;

  const handlePetChange = (event) => {
    const selectedPet = pets.find(
      (pet) => pet._id === event.target.value,
    );

    if (!selectedPet) return;

    setCurrentPet(selectedPet);
    setSelectedCategory("All");
  };

  const getPriorityConfig = (priority) => {
    switch (priority) {
      case "URGENT":
        return {
          label: "Urgent",
          wrapper:
            "border-red-200 bg-red-50 dark:border-red-500/20 dark:bg-red-500/10",
          icon:
            "bg-red-100 text-red-600 dark:bg-red-500/10 dark:text-red-400",
          badge:
            "bg-red-100 text-red-700 dark:bg-red-500/10 dark:text-red-400",
          dot: "bg-red-500",
        };

      case "ATTENTION":
        return {
          label: "Needs Attention",
          wrapper:
            "border-amber-200 bg-amber-50 dark:border-amber-500/20 dark:bg-amber-500/10",
          icon:
            "bg-amber-100 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400",
          badge:
            "bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400",
          dot: "bg-amber-500",
        };

      default:
        return {
          label: "Low Priority",
          wrapper:
            "border-emerald-200 bg-emerald-50 dark:border-emerald-500/20 dark:bg-emerald-500/10",
          icon:
            "bg-emerald-100 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400",
          badge:
            "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400",
          dot: "bg-emerald-500",
        };
    }
  };

  if (isPetLoading) {
    return (
      <div className="min-h-screen bg-slate-50 px-4 py-10 text-slate-900 dark:bg-[#0b0f14] dark:text-slate-100">
        <div className="mx-auto max-w-6xl">
          <div className="flex min-h-[320px] items-center justify-center rounded-3xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-[#111820]">
            <div className="text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-50 text-orange-500 dark:bg-orange-500/10 dark:text-orange-400">
                <PawPrint size={23} />
              </div>

              <p className="mt-4 text-sm font-medium text-slate-500 dark:text-slate-400">
                Loading pet information...
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!currentPet) {
    return (
      <div className="min-h-screen bg-slate-50 px-4 py-10 text-slate-900 dark:bg-[#0b0f14] dark:text-slate-100">
        <div className="mx-auto max-w-6xl">
          <div className="rounded-3xl border border-red-200 bg-red-50 p-6 dark:border-red-500/20 dark:bg-red-500/10">
            <div className="flex gap-3">
              <Activity
                size={20}
                className="mt-0.5 shrink-0 text-red-500"
              />

              <div>
                <p className="font-semibold text-red-700 dark:text-red-300">
                  Pet information is not available
                </p>

                <p className="mt-1 text-sm leading-6 text-red-600 dark:text-red-400">
                  Please add a pet before viewing personalized recommendations.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 transition-colors duration-300 dark:bg-[#0b0f14] dark:text-slate-100">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -left-32 top-20 h-72 w-72 rounded-full bg-orange-400/10 blur-3xl dark:bg-orange-500/10" />
        <div className="absolute -right-32 top-80 h-80 w-80 rounded-full bg-orange-300/10 blur-3xl dark:bg-orange-500/5" />
      </div>

      <main className="relative mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        {/* HEADER */}
        <section className="mb-7">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-orange-200 bg-orange-50 px-3 py-1.5 text-xs font-bold text-orange-600 dark:border-orange-500/20 dark:bg-orange-500/10 dark:text-orange-400">
            <Sparkles size={14} />
            PERSONALIZED CARE
          </div>

          <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
            <div className="max-w-3xl">
              <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
                Recommendations
              </h1>

              <p className="mt-3 text-sm leading-6 text-slate-500 sm:text-base dark:text-slate-400">
                Actionable care suggestions generated from{" "}
                <span className="font-semibold text-slate-700 dark:text-slate-200">
                  {currentPet.name}
                </span>
                's profile and latest health information.
              </p>
            </div>

            <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm dark:border-slate-800 dark:bg-[#111820]">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-50 text-orange-500 dark:bg-orange-500/10 dark:text-orange-400">
                <PawPrint size={19} />
              </div>

              <div>
                <p className="text-[11px] text-slate-400">
                  Recommendations for
                </p>

                <p className="text-sm font-bold">
                  {currentPet.name}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* PET SUMMARY */}
        <section className="relative mb-6 overflow-hidden rounded-3xl border border-orange-100 bg-gradient-to-br from-orange-50 via-white to-white p-6 shadow-sm dark:border-orange-500/15 dark:from-orange-500/10 dark:via-[#111820] dark:to-[#111820]">
          <div className="absolute -right-12 -top-12 h-32 w-32 rounded-full bg-orange-300/20 blur-2xl dark:bg-orange-500/10" />

          <div className="relative flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-white text-orange-500 shadow-sm dark:bg-[#18212b] dark:text-orange-400">
                <PawPrint size={29} />
              </div>

              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-orange-500">
                  Current pet
                </p>

                <h2 className="mt-1 text-2xl font-bold">
                  {currentPet.name}
                </h2>

                <div className="mt-2 flex flex-wrap gap-2">
                  <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-600 shadow-sm dark:bg-[#18212b] dark:text-slate-300">
                    {currentPet.species || "Pet"}
                  </span>

                  <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-600 shadow-sm dark:bg-[#18212b] dark:text-slate-300">
                    {currentPet.breed || "Unknown breed"}
                  </span>

                  {currentPet.age != null && (
                    <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-600 shadow-sm dark:bg-[#18212b] dark:text-slate-300">
                      {currentPet.age} years
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              <div className="rounded-xl border border-white/70 bg-white/80 px-4 py-3 text-center dark:border-slate-700 dark:bg-[#18212b]/80">
                <p className="text-lg font-bold text-slate-900 dark:text-white">
                  {recommendations.length}
                </p>
                <p className="text-[10px] font-semibold text-slate-400">
                  Total
                </p>
              </div>

              <div className="rounded-xl border border-white/70 bg-white/80 px-4 py-3 text-center dark:border-slate-700 dark:bg-[#18212b]/80">
                <p className="text-lg font-bold text-amber-500">
                  {attentionCount}
                </p>
                <p className="text-[10px] font-semibold text-slate-400">
                  Attention
                </p>
              </div>

              <div className="rounded-xl border border-white/70 bg-white/80 px-4 py-3 text-center dark:border-slate-700 dark:bg-[#18212b]/80">
                <p className="text-lg font-bold text-red-500">
                  {urgentCount}
                </p>
                <p className="text-[10px] font-semibold text-slate-400">
                  Urgent
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* HEALTH CHECK STATUS */}
        {latestHealthCheck ? (
          <section className="mb-6 rounded-3xl border border-orange-200 bg-white p-5 shadow-sm dark:border-orange-500/20 dark:bg-[#111820]">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-orange-50 text-orange-500 dark:bg-orange-500/10 dark:text-orange-400">
                  <Stethoscope size={19} />
                </div>

                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-sm font-bold">
                      Latest AI Health Check
                    </h3>

                    <span className="rounded-full bg-orange-500/10 px-2.5 py-1 text-[10px] font-bold text-orange-600 dark:text-orange-400">
                      PERSONALIZED
                    </span>
                  </div>

                  <p className="mt-1 text-xs leading-5 text-slate-500 dark:text-slate-400">
                    Recommendations above include information from the most recent health assessment.
                  </p>
                </div>
              </div>

              {latestHealthCheck.createdAt && (
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <Clock3 size={14} />

                  {new Date(
                    latestHealthCheck.createdAt,
                  ).toLocaleDateString()}
                </div>
              )}
            </div>
          </section>
        ) : (
          <section className="mb-6 rounded-3xl border border-dashed border-slate-300 bg-white p-5 dark:border-slate-700 dark:bg-[#111820]">
            <div className="flex gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                <Stethoscope size={19} />
              </div>

              <div>
                <h3 className="text-sm font-bold">
                  No recent AI Health Check
                </h3>

                <p className="mt-1 text-xs leading-5 text-slate-500 dark:text-slate-400">
                  These recommendations are currently based mainly on {currentPet.name}'s pet profile. Complete a health check to make them more health-context aware.
                </p>
              </div>
            </div>
          </section>
        )}

        {/* PET SELECTOR */}
        {pets.length > 1 && (
          <section className="mb-6 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-[#111820]">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-bold">
                  Switch pet
                </p>

                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                  Recommendations will update for the selected pet.
                </p>
              </div>

              <div className="relative sm:w-72">
                <PawPrint
                  size={17}
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-orange-500"
                />

                <select
                  value={currentPet._id}
                  onChange={handlePetChange}
                  className="w-full appearance-none rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-sm font-medium outline-none transition focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 dark:border-slate-700 dark:bg-[#18212b] dark:text-slate-100"
                >
                  {pets.map((pet) => (
                    <option
                      key={pet._id}
                      value={pet._id}
                    >
                      {pet.name} •{" "}
                      {pet.breed || "Unknown breed"}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </section>
        )}

        {/* CATEGORY FILTER */}
        <section className="mb-6">
          <div className="mb-3 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold">
                Personalized actions
              </h2>

              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                Focus on the area you want to review.
              </p>
            </div>

            <span className="hidden text-xs font-semibold text-slate-400 sm:block">
              {filteredRecommendations.length} recommendations
            </span>
          </div>

          <div className="flex gap-2 overflow-x-auto pb-1">
            {categories.map((category) => {
              const Icon = category.icon;
              const active =
                selectedCategory === category.name;

              return (
                <button
                  key={category.name}
                  type="button"
                  onClick={() =>
                    setSelectedCategory(
                      category.name,
                    )
                  }
                  className={`flex shrink-0 items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold transition ${
                    active
                      ? "bg-orange-500 text-white shadow-lg shadow-orange-500/20"
                      : "border border-slate-200 bg-white text-slate-600 hover:border-orange-300 hover:text-orange-500 dark:border-slate-700 dark:bg-[#111820] dark:text-slate-300 dark:hover:border-orange-500/40 dark:hover:text-orange-400"
                  }`}
                >
                  <Icon size={16} />
                  {category.name}
                </button>
              );
            })}
          </div>
        </section>

        {/* RECOMMENDATIONS */}
        <section>
          {filteredRecommendations.length === 0 ? (
            <div className="flex min-h-[260px] flex-col items-center justify-center rounded-3xl border border-dashed border-slate-300 bg-white p-8 text-center dark:border-slate-700 dark:bg-[#111820]">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-orange-50 text-orange-500 dark:bg-orange-500/10 dark:text-orange-400">
                <Sparkles size={25} />
              </div>

              <h3 className="mt-4 font-bold">
                No recommendations in this category
              </h3>

              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                Try another category.
              </p>
            </div>
          ) : (
            <div className="grid gap-4 lg:grid-cols-2">
              {filteredRecommendations.map(
                (recommendation) => {
                  const Icon =
                    recommendation.icon;

                  const priority =
                    getPriorityConfig(
                      recommendation.priority,
                    );

                  return (
                    <article
                      key={recommendation.id}
                      className="group overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-orange-200 hover:shadow-md dark:border-slate-800 dark:bg-[#111820] dark:hover:border-orange-500/20"
                    >
                      <div
                        className={`border-b px-5 py-3 ${priority.wrapper}`}
                      >
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex items-center gap-2">
                            <span
                              className={`h-2 w-2 rounded-full ${priority.dot}`}
                            />

                            <span className="text-[11px] font-bold">
                              {priority.label}
                            </span>
                          </div>

                          <span className="text-[10px] font-semibold opacity-70">
                            {recommendation.category}
                          </span>
                        </div>
                      </div>

                      <div className="p-5">
                        <div className="flex items-start justify-between gap-4">
                          <div
                            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${priority.icon}`}
                          >
                            <Icon size={20} />
                          </div>

                          <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-bold text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                            {recommendation.source}
                          </span>
                        </div>

                        <h3 className="mt-5 text-base font-bold leading-6 text-slate-900 dark:text-white">
                          {recommendation.title}
                        </h3>

                        <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">
                          {recommendation.description}
                        </p>

                        <div className="mt-5 rounded-2xl border border-orange-100 bg-orange-50/70 p-4 dark:border-orange-500/15 dark:bg-orange-500/5">
                          <div className="flex gap-3">
                            <Target
                              size={17}
                              className="mt-0.5 shrink-0 text-orange-500"
                            />

                            <div>
                              <p className="text-[10px] font-bold uppercase tracking-wider text-orange-600 dark:text-orange-400">
                                What to do
                              </p>

                              <p className="mt-1 text-sm leading-6 text-slate-700 dark:text-slate-300">
                                {recommendation.action}
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="mt-4 flex items-center gap-2 border-t border-slate-100 pt-4 text-[11px] font-semibold text-slate-400 dark:border-slate-800">
                          <CheckCircle2
                            size={14}
                            className="text-emerald-500"
                          />

                          Personalized from{" "}
                          {recommendation.source.toLowerCase()}
                        </div>
                      </div>
                    </article>
                  );
                },
              )}
            </div>
          )}
        </section>

        {/* FOOTER NOTE */}
        <div className="mt-6 flex gap-3 rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-[#111820]">
          <ShieldCheck
            size={18}
            className="mt-0.5 shrink-0 text-orange-500"
          />

          <p className="text-xs leading-5 text-slate-500 dark:text-slate-400">
            Recommendations are generated from the information available in
            {` ${currentPet.name}'s `}
            pet profile and, when available, the latest AI health assessment.
            They are intended for guidance and do not replace professional
            veterinary advice.
          </p>
        </div>
      </main>
    </div>
  );
}

export default Recommendation;