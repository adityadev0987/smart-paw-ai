import { useMemo, useState } from "react";
import {
  Activity,
  Apple,
  Dumbbell,
  HeartPulse,
  PawPrint,
  Scissors,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { useAppContext } from "../hooks/useAppContext";

function Recommendation() {
  const {
    pets = [],
    currentPet,
    setCurrentPet,
    isPetLoading,
  } = useAppContext();

  const [selectedCategory, setSelectedCategory] =
    useState("All");

  const categories = [
    {
      name: "All",
      icon: Sparkles,
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
      name: "Health",
      icon: HeartPulse,
    },
    {
      name: "Grooming",
      icon: Scissors,
    },
  ];

  const recommendations = useMemo(() => {
    if (!currentPet) {
      return [];
    }

    const baseRecommendations = [
      {
        id: 1,
        category: "Nutrition",
        title: `Maintain a balanced diet for ${currentPet.name}`,
        description: `Provide ${currentPet.name} with age-appropriate food and make sure fresh drinking water is always available.`,
      },
      {
        id: 2,
        category: "Exercise",
        title: `Keep ${currentPet.name} active`,
        description: `Regular walks, play sessions, and suitable activities can help support ${currentPet.name}'s physical and mental stimulation.`,
      },
      {
        id: 3,
        category: "Health",
        title: "Keep vaccinations up to date",
        description:
          "Follow your veterinarian's vaccination schedule and keep important health records organized.",
      },
      {
        id: 4,
        category: "Grooming",
        title: `Follow a grooming routine for ${currentPet.name}`,
        description: `Regular brushing, nail care, and basic hygiene can help keep ${currentPet.name} comfortable.`,
      },
    ];

    if (currentPet.age < 1) {
      baseRecommendations.push({
        id: 5,
        category: "Health",
        title: "Pay attention to early-life care",
        description:
          "Young pets may have different vaccination, nutrition, socialization, and routine-care needs. Follow guidance from a qualified veterinarian.",
      });
    }

    if (currentPet.age >= 7) {
      baseRecommendations.push({
        id: 6,
        category: "Health",
        title: "Pay attention to age-related changes",
        description:
          "As pets get older, monitor changes in appetite, activity, behavior, and general well-being and discuss concerns with a qualified veterinarian.",
      });
    }

    if (
      currentPet.breed &&
      currentPet.breed.toLowerCase().includes("retriever")
    ) {
      baseRecommendations.push({
        id: 7,
        category: "Exercise",
        title: "Include regular activity",
        description:
          "Retrievers often benefit from regular physical activity and mental stimulation. Adjust activity to your pet's age and individual needs.",
      });
    }

    return baseRecommendations;
  }, [currentPet]);

  const filteredRecommendations =
    selectedCategory === "All"
      ? recommendations
      : recommendations.filter(
          (recommendation) =>
            recommendation.category === selectedCategory,
        );

  const handlePetChange = (event) => {
    const selectedPet = pets.find(
      (pet) => pet._id === event.target.value,
    );

    if (!selectedPet) {
      return;
    }

    setCurrentPet(selectedPet);
    setSelectedCategory("All");
  };

  const getCategoryIcon = (category) => {
    const categoryData = categories.find(
      (item) => item.name === category,
    );

    if (!categoryData) {
      return Sparkles;
    }

    return categoryData.icon;
  };

  const getCategoryStyles = (category) => {
    switch (category) {
      case "Nutrition":
        return {
          wrapper:
            "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400",
          badge:
            "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400",
        };

      case "Exercise":
        return {
          wrapper:
            "bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400",
          badge:
            "bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400",
        };

      case "Health":
        return {
          wrapper:
            "bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400",
          badge:
            "bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400",
        };

      case "Grooming":
        return {
          wrapper:
            "bg-purple-50 text-purple-600 dark:bg-purple-500/10 dark:text-purple-400",
          badge:
            "bg-purple-50 text-purple-600 dark:bg-purple-500/10 dark:text-purple-400",
        };

      default:
        return {
          wrapper:
            "bg-orange-50 text-orange-600 dark:bg-orange-500/10 dark:text-orange-400",
          badge:
            "bg-orange-50 text-orange-600 dark:bg-orange-500/10 dark:text-orange-400",
        };
    }
  };

  if (isPetLoading) {
    return (
      <div className="min-h-screen bg-slate-50 px-4 py-10 text-slate-900 dark:bg-[#0b0f14] dark:text-slate-100">
        <div className="mx-auto max-w-5xl">
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
        <div className="mx-auto max-w-5xl">
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
                  Please add a pet before viewing recommendations.
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
      {/* Soft background glow */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -left-32 top-20 h-72 w-72 rounded-full bg-orange-400/10 blur-3xl dark:bg-orange-500/10" />
        <div className="absolute -right-32 top-80 h-80 w-80 rounded-full bg-orange-300/10 blur-3xl dark:bg-orange-500/5" />
      </div>

      <main className="relative mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <section className="mb-8">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-orange-200 bg-orange-50 px-3 py-1.5 text-xs font-bold text-orange-600 dark:border-orange-500/20 dark:bg-orange-500/10 dark:text-orange-400">
            <Sparkles size={14} />
            SMART PET CARE
          </div>

          <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
            <div className="max-w-2xl">
              <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
                Recommendations
              </h1>

              <p className="mt-3 text-sm leading-6 text-slate-500 sm:text-base dark:text-slate-400">
                Simple, practical care guidance tailored around{" "}
                <span className="font-semibold text-slate-700 dark:text-slate-200">
                  {currentPet.name}
                </span>
                .
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

                <p className="text-sm font-bold text-slate-900 dark:text-white">
                  {currentPet.name}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Pet summary */}
        <section className="relative mb-6 overflow-hidden rounded-3xl border border-orange-100 bg-gradient-to-br from-orange-50 via-white to-white p-6 shadow-sm dark:border-orange-500/15 dark:from-orange-500/10 dark:via-[#111820] dark:to-[#111820]">
          <div className="absolute -right-12 -top-12 h-32 w-32 rounded-full bg-orange-300/20 blur-2xl dark:bg-orange-500/10" />

          <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-white text-orange-500 shadow-sm dark:bg-[#18212b] dark:text-orange-400">
              <PawPrint size={30} />
            </div>

            <div className="min-w-0">
              <p className="text-xs font-bold uppercase tracking-wider text-orange-500">
                Current pet
              </p>

              <h2 className="mt-1 text-2xl font-bold text-slate-900 dark:text-white">
                {currentPet.name}
              </h2>

              <div className="mt-2 flex flex-wrap gap-2">
                <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-600 shadow-sm dark:bg-[#18212b] dark:text-slate-300">
                  {currentPet.breed || "Unknown breed"}
                </span>

                <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-600 shadow-sm dark:bg-[#18212b] dark:text-slate-300">
                  {currentPet.age} years old
                </span>

                <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold capitalize text-slate-600 shadow-sm dark:bg-[#18212b] dark:text-slate-300">
                  {currentPet.gender}
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Pet selector */}
        {pets.length > 1 && (
          <section className="mb-6 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-[#111820]">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-bold">Switch pet</p>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                  Recommendations update automatically for the selected pet.
                </p>
              </div>

              <div className="relative sm:w-72">
                <PawPrint
                  size={17}
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-orange-500"
                />

                <select
                  id="recommendationPet"
                  value={currentPet._id}
                  onChange={handlePetChange}
                  className="w-full appearance-none rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-sm font-medium outline-none transition focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 dark:border-slate-700 dark:bg-[#18212b] dark:text-slate-100"
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
              </div>
            </div>
          </section>
        )}

        {/* Category filter */}
        <section className="mb-6">
          <div className="mb-3 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold">
                Care categories
              </h2>

              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                Filter recommendations by what you want to focus on.
              </p>
            </div>

            <span className="hidden text-xs font-semibold text-slate-400 sm:block">
              {filteredRecommendations.length} suggestions
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
                    setSelectedCategory(category.name)
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

        {/* Recommendation cards */}
        <section>
          {filteredRecommendations.length === 0 ? (
            <div className="flex min-h-[260px] flex-col items-center justify-center rounded-3xl border border-dashed border-slate-300 bg-white p-8 text-center dark:border-slate-700 dark:bg-[#111820]">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-orange-50 text-orange-500 dark:bg-orange-500/10 dark:text-orange-400">
                <Sparkles size={25} />
              </div>

              <h3 className="mt-4 font-bold">
                No recommendations found
              </h3>

              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                Try selecting another care category.
              </p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {filteredRecommendations.map((recommendation) => {
                const Icon = getCategoryIcon(
                  recommendation.category,
                );

                const styles = getCategoryStyles(
                  recommendation.category,
                );

                return (
                  <article
                    key={recommendation.id}
                    className="group rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-orange-200 hover:shadow-md dark:border-slate-800 dark:bg-[#111820] dark:hover:border-orange-500/20"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div
                        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${styles.wrapper}`}
                      >
                        <Icon size={20} />
                      </div>

                      <span
                        className={`rounded-full px-3 py-1 text-[11px] font-bold ${styles.badge}`}
                      >
                        {recommendation.category}
                      </span>
                    </div>

                    <h3 className="mt-5 text-base font-bold leading-6 text-slate-900 dark:text-white">
                      {recommendation.title}
                    </h3>

                    <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">
                      {recommendation.description}
                    </p>

                    <div className="mt-5 flex items-center gap-2 border-t border-slate-100 pt-4 text-xs font-semibold text-slate-400 dark:border-slate-800">
                      <CheckCircleIcon />
                      General care guidance
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>

        {/* Disclaimer */}
        <div className="mt-6 flex gap-3 rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-[#111820]">
          <ShieldCheck
            size={18}
            className="mt-0.5 shrink-0 text-orange-500"
          />

          <p className="text-xs leading-5 text-slate-500 dark:text-slate-400">
            These recommendations are general informational guidance and are
            not a substitute for professional veterinary advice. Individual
            care needs can vary based on age, breed, health history, and other
            factors.
          </p>
        </div>
      </main>
    </div>
  );
}

function CheckCircleIcon() {
  return (
    <span className="flex h-4 w-4 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400">
      ✓
    </span>
  );
}

export default Recommendation;