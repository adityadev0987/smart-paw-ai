import { useEffect, useRef, useState } from "react";
import {
  Activity,
  ChevronDown,
  Dumbbell,
  Heart,
  Info,
  PawPrint,
  Ruler,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { useAppContext } from "../hooks/useAppContext";

const breeds = [
  {
    id: 1,
    name: "Golden Retriever",
    size: "Large",
    temperament: "Friendly, intelligent, and active",
    lifespan: "10–12 years",
    exercise: "High",
    description:
      "Golden Retrievers are friendly and active dogs that need regular exercise, mental stimulation, and social interaction.",
  },
  {
    id: 2,
    name: "Labrador Retriever",
    size: "Large",
    temperament: "Friendly, outgoing, and playful",
    lifespan: "10–12 years",
    exercise: "High",
    description:
      "Labrador Retrievers are energetic and social dogs that enjoy exercise, training, and spending time with their families.",
  },
  {
    id: 3,
    name: "German Shepherd",
    size: "Large",
    temperament: "Loyal, confident, and intelligent",
    lifespan: "9–13 years",
    exercise: "High",
    description:
      "German Shepherds are intelligent and loyal dogs that benefit from regular physical activity and structured training.",
  },
];

function BreedInsights() {
  const { currentPet } = useAppContext();

  const [selectedBreed, setSelectedBreed] = useState(breeds[0]);
  const [isBreedOpen, setIsBreedOpen] = useState(false);
  const [petBreedMatched, setPetBreedMatched] = useState(false);

  const dropdownRef = useRef(null);

  useEffect(() => {
    if (!currentPet?.breed) {
      return;
    }

    const normalizedPetBreed = currentPet.breed.trim().toLowerCase();

    const matchedBreed = breeds.find(
      (breed) =>
        breed.name.trim().toLowerCase() === normalizedPetBreed,
    );

    if (matchedBreed) {
      setSelectedBreed(matchedBreed);
      setPetBreedMatched(true);
    } else {
      setPetBreedMatched(false);
    }
  }, [currentPet?.breed]);

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target)
      ) {
        setIsBreedOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, []);

  const handleBreedSelect = (breed) => {
    setSelectedBreed(breed);
    setPetBreedMatched(false);
    setIsBreedOpen(false);
  };

  const overviewItems = [
    {
      label: "Size",
      value: selectedBreed.size,
      icon: Ruler,
    },
    {
      label: "Lifespan",
      value: selectedBreed.lifespan,
      icon: Heart,
    },
    {
      label: "Exercise",
      value: selectedBreed.exercise,
      icon: Dumbbell,
    },
    {
      label: "Temperament",
      value: selectedBreed.temperament,
      icon: Sparkles,
    },
  ];

  return (
    <section className="relative min-h-[calc(100vh-4rem)] overflow-hidden bg-white px-4 py-8 transition-colors duration-300 dark:bg-[#0B0F14] sm:px-6 lg:px-8">
      {/* Background glow */}
      <div className="pointer-events-none absolute -left-32 top-20 h-72 w-72 rounded-full bg-orange-500/10 blur-3xl dark:bg-orange-500/5" />
      <div className="pointer-events-none absolute -right-32 top-96 h-80 w-80 rounded-full bg-orange-500/5 blur-3xl" />

      <div className="relative mx-auto max-w-5xl">
        {/* Header */}
        <div className="mb-8">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-orange-200 bg-orange-50 px-3 py-1.5 text-xs font-semibold text-orange-600 dark:border-orange-500/20 dark:bg-orange-500/10 dark:text-orange-400">
            <PawPrint size={14} />
            Breed Guide
          </div>

          <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl dark:text-white">
            Breed Insights
          </h1>

          <p className="mt-3 max-w-2xl text-sm leading-6 text-gray-600 sm:text-base dark:text-gray-400">
            Explore breed characteristics, care requirements, and
            general information to better understand your pet.
          </p>
        </div>

        {/* Current Pet */}
        {currentPet && (
          <div className="mb-6 overflow-hidden rounded-2xl border border-orange-200/70 bg-gradient-to-br from-orange-50 to-white p-5 shadow-sm dark:border-orange-500/20 dark:from-orange-500/10 dark:to-[#111820]">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-orange-500 text-white shadow-md shadow-orange-500/20">
                  <PawPrint size={23} />
                </div>

                <div>
                  <p className="text-[11px] font-bold uppercase tracking-wider text-orange-500">
                    Current Pet
                  </p>

                  <h2 className="mt-0.5 text-lg font-bold text-gray-900 dark:text-white">
                    {currentPet.name}
                  </h2>

                  <p className="mt-0.5 text-sm text-gray-600 dark:text-gray-400">
                    {currentPet.breed} • {currentPet.age} years old
                  </p>
                </div>
              </div>

              {petBreedMatched && (
                <div className="inline-flex w-fit items-center gap-2 rounded-full border border-green-200 bg-green-50 px-3 py-1.5 text-xs font-semibold text-green-600 dark:border-green-500/20 dark:bg-green-500/10 dark:text-green-400">
                  <ShieldCheck size={14} />
                  Breed matched
                </div>
              )}
            </div>

            {!petBreedMatched && (
              <div className="mt-4 flex gap-2 rounded-xl border border-gray-200 bg-white/70 p-3 dark:border-gray-700 dark:bg-[#111820]/70">
                <Info
                  size={16}
                  className="mt-0.5 shrink-0 text-gray-400"
                />

                <p className="text-xs leading-5 text-gray-500 dark:text-gray-400">
                  Breed-specific insights are not available for this
                  breed yet. You can explore the available breeds below.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Breed selector */}
        <div className="mb-6 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition-colors dark:border-gray-800 dark:bg-[#111820]">
          <div className="mb-3 flex items-center gap-2">
            <Sparkles size={17} className="text-orange-500" />

            <label className="text-sm font-semibold text-gray-800 dark:text-gray-200">
              Choose a breed
            </label>
          </div>

          <div ref={dropdownRef} className="relative">
            <button
              type="button"
              onClick={() =>
                setIsBreedOpen((current) => !current)
              }
              className="flex w-full items-center justify-between rounded-xl border border-gray-200 bg-gray-50 px-4 py-3.5 text-left text-sm text-gray-900 outline-none transition hover:border-orange-300 focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 dark:border-gray-700 dark:bg-[#18212B] dark:text-gray-100 dark:hover:border-orange-500/40"
              aria-haspopup="listbox"
              aria-expanded={isBreedOpen}
            >
              <div className="flex min-w-0 items-center gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-orange-500/10 text-orange-500">
                  <PawPrint size={17} />
                </div>

                <div className="min-w-0">
                  <span className="font-semibold">
                    {selectedBreed.name}
                  </span>

                  {currentPet &&
                    selectedBreed.name.toLowerCase() ===
                      currentPet.breed?.trim().toLowerCase() && (
                      <span className="ml-2 rounded-full bg-orange-100 px-2 py-1 text-[10px] font-bold text-orange-600 dark:bg-orange-500/10 dark:text-orange-400">
                        Your pet
                      </span>
                    )}
                </div>
              </div>

              <ChevronDown
                size={18}
                className={`shrink-0 text-gray-400 transition-transform duration-200 ${
                  isBreedOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {isBreedOpen && (
              <div
                className="absolute left-0 right-0 top-full z-30 mt-2 overflow-hidden rounded-xl border border-gray-200 bg-white p-1.5 shadow-xl dark:border-gray-700 dark:bg-[#111820]"
                role="listbox"
              >
                {breeds.map((breed) => {
                  const isSelected = selectedBreed.id === breed.id;

                  const isPetBreed =
                    currentPet?.breed?.trim().toLowerCase() ===
                    breed.name.trim().toLowerCase();

                  return (
                    <button
                      key={breed.id}
                      type="button"
                      onClick={() => handleBreedSelect(breed)}
                      className={`flex w-full items-center justify-between rounded-lg px-3 py-3 text-left text-sm transition ${
                        isSelected
                          ? "bg-orange-50 font-semibold text-orange-600 dark:bg-orange-500/10 dark:text-orange-400"
                          : "text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-800"
                      }`}
                      role="option"
                      aria-selected={isSelected}
                    >
                      <div className="flex min-w-0 items-center gap-3">
                        <PawPrint
                          size={16}
                          className={
                            isSelected
                              ? "text-orange-500"
                              : "text-gray-400"
                          }
                        />

                        <span>{breed.name}</span>

                        {isPetBreed && (
                          <span className="shrink-0 rounded-full bg-gray-100 px-2 py-1 text-[10px] font-medium text-gray-500 dark:bg-gray-800 dark:text-gray-400">
                            Your pet
                          </span>
                        )}
                      </div>

                      {isSelected && (
                        <span className="ml-2 text-sm font-bold text-orange-500">
                          ✓
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Main breed card */}
        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-[#111820]">
          {/* Card header */}
          <div className="border-b border-gray-100 bg-gradient-to-r from-orange-50/80 to-white p-5 sm:p-6 dark:border-gray-800 dark:from-orange-500/5 dark:to-[#111820]">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="flex items-start gap-4">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-orange-500 text-white shadow-lg shadow-orange-500/20">
                  <PawPrint size={28} />
                </div>

                <div>
                  <p className="text-[11px] font-bold uppercase tracking-wider text-orange-500">
                    Breed Overview
                  </p>

                  <h2 className="mt-1 text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
                    {selectedBreed.name}
                  </h2>

                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    General characteristics and care needs
                  </p>
                </div>
              </div>

              <span className="w-fit rounded-full border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-gray-600 dark:border-gray-700 dark:bg-[#18212B] dark:text-gray-300">
                {selectedBreed.size} Breed
              </span>
            </div>
          </div>

          {/* Description */}
          <div className="p-5 sm:p-6">
            <div className="rounded-xl border border-orange-100 bg-orange-50/60 p-4 dark:border-orange-500/10 dark:bg-orange-500/5">
              <div className="flex gap-3">
                <Info
                  size={18}
                  className="mt-0.5 shrink-0 text-orange-500"
                />

                <p className="text-sm leading-6 text-gray-600 dark:text-gray-300">
                  {selectedBreed.description}
                </p>
              </div>
            </div>

            {/* Overview grid */}
            <div className="mt-6">
              <div className="mb-3 flex items-center gap-2">
                <Activity size={17} className="text-orange-500" />

                <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                  Key Information
                </h3>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {overviewItems.map((item) => {
                  const Icon = item.icon;

                  return (
                    <div
                      key={item.label}
                      className="group rounded-xl border border-gray-100 bg-gray-50 p-4 transition hover:border-orange-200 hover:bg-orange-50/50 dark:border-gray-800 dark:bg-[#18212B] dark:hover:border-orange-500/20 dark:hover:bg-orange-500/5"
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white text-orange-500 shadow-sm dark:bg-[#111820]">
                          <Icon size={17} />
                        </div>

                        <div className="min-w-0">
                          <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500">
                            {item.label}
                          </p>

                          <p className="mt-1 text-sm font-semibold leading-5 text-gray-900 dark:text-gray-100">
                            {item.value}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Disclaimer */}
        <div className="mt-6 flex gap-3 rounded-2xl border border-gray-200 bg-gray-50 p-4 dark:border-gray-800 dark:bg-[#111820]">
          <ShieldCheck
            size={17}
            className="mt-0.5 shrink-0 text-gray-400"
          />

          <p className="text-xs leading-5 text-gray-500 dark:text-gray-400">
            Breed information is general educational guidance.
            Individual pets can have different needs based on age,
            health history, environment, and behavior. Consult a
            qualified veterinarian for concerns about your pet's health.
          </p>
        </div>
      </div>
    </section>
  );
}

export default BreedInsights;