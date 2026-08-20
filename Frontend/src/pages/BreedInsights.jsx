import { useEffect, useRef, useState } from "react";
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

  const [selectedBreed, setSelectedBreed] = useState(
    breeds[0],
  );

  const [isBreedOpen, setIsBreedOpen] = useState(false);

  const [petBreedMatched, setPetBreedMatched] =
    useState(false);

  const dropdownRef = useRef(null);

  useEffect(() => {
    if (!currentPet?.breed) {
      return;
    }

    const normalizedPetBreed =
      currentPet.breed.trim().toLowerCase();

    const matchedBreed = breeds.find(
      (breed) =>
        breed.name.trim().toLowerCase() ===
        normalizedPetBreed,
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

    document.addEventListener(
      "mousedown",
      handleOutsideClick,
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handleOutsideClick,
      );
    };
  }, []);

  const handleBreedSelect = (breed) => {
    setSelectedBreed(breed);
    setPetBreedMatched(false);
    setIsBreedOpen(false);
  };

  return (
    <section className="px-4 py-8">
      <div className="mx-auto max-w-3xl">
        <p className="text-sm font-semibold uppercase tracking-wider text-orange-500">
          Breed Guide
        </p>

        <h1 className="mt-2 text-3xl font-bold text-gray-900">
          Breed Insights
        </h1>

        <p className="mt-3 text-base leading-7 text-gray-600">
          Explore basic information about popular dog breeds
          and their general care needs.
        </p>

        {currentPet && (
          <div className="mt-6 rounded-2xl border border-orange-100 bg-orange-50 p-5">
            <p className="text-xs font-semibold uppercase tracking-wider text-orange-500">
              Current Pet
            </p>

            <h2 className="mt-1 text-xl font-bold text-gray-900">
              {currentPet.name}
            </h2>

            <p className="mt-1 text-sm text-gray-600">
              {currentPet.breed} • {currentPet.age} years
              old
            </p>

            {petBreedMatched && (
              <p className="mt-3 text-xs font-medium text-orange-600">
                Showing insights for your pet's breed.
              </p>
            )}

            {!petBreedMatched && (
              <p className="mt-3 text-xs leading-5 text-gray-500">
                Breed-specific insights are not available for
                this breed yet. You can select another breed
                below to explore the available guide.
              </p>
            )}
          </div>
        )}

        <div className="mt-6 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <label className="text-sm font-medium text-gray-700">
            Select a breed
          </label>

          <div
            ref={dropdownRef}
            className="relative mt-2"
          >
            <button
              type="button"
              onClick={() =>
                setIsBreedOpen((current) => !current)
              }
              className="flex w-full items-center justify-between rounded-xl border border-gray-200 bg-white px-4 py-3 text-left text-sm text-gray-900 outline-none transition hover:border-gray-300 focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
              aria-haspopup="listbox"
              aria-expanded={isBreedOpen}
            >
              <div>
                <span className="font-medium">
                  {selectedBreed.name}
                </span>

                {currentPet &&
                  selectedBreed.name ===
                    currentPet.breed && (
                    <span className="ml-2 rounded-full bg-orange-50 px-2 py-1 text-[10px] font-semibold text-orange-500">
                      Your pet
                    </span>
                  )}
              </div>

              <span
                className={`text-xs text-gray-400 transition-transform duration-200 ${
                  isBreedOpen ? "rotate-180" : ""
                }`}
              >
                ▼
              </span>
            </button>

            {isBreedOpen && (
              <div
                className="absolute left-0 right-0 top-full z-20 mt-2 overflow-hidden rounded-xl border border-gray-200 bg-white p-1.5 shadow-lg"
                role="listbox"
              >
                {breeds.map((breed) => {
                  const isSelected =
                    selectedBreed.id === breed.id;

                  const isPetBreed =
                    currentPet?.breed
                      ?.trim()
                      .toLowerCase() ===
                    breed.name.trim().toLowerCase();

                  return (
                    <button
                      key={breed.id}
                      type="button"
                      onClick={() =>
                        handleBreedSelect(breed)
                      }
                      className={`flex w-full items-center justify-between rounded-lg px-3 py-3 text-left text-sm transition ${
                        isSelected
                          ? "bg-orange-50 font-semibold text-orange-500"
                          : "text-gray-700 hover:bg-gray-50"
                      }`}
                      role="option"
                      aria-selected={isSelected}
                    >
                      <div className="flex min-w-0 items-center gap-2">
                        <span>{breed.name}</span>

                        {isPetBreed && (
                          <span className="shrink-0 rounded-full bg-gray-100 px-2 py-1 text-[10px] font-medium text-gray-500">
                            Your pet
                          </span>
                        )}
                      </div>

                      {isSelected && (
                        <span className="ml-2 text-sm font-bold">
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

        <div className="mt-6 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-orange-500">
                Breed Overview
              </p>

              <h2 className="mt-1 text-xl font-semibold text-gray-900">
                {selectedBreed.name}
              </h2>
            </div>

            <span className="shrink-0 rounded-full bg-gray-50 px-3 py-1 text-xs font-medium text-gray-500">
              {selectedBreed.size}
            </span>
          </div>

          <p className="mt-4 text-sm leading-6 text-gray-600">
            {selectedBreed.description}
          </p>

          <div className="mt-5 grid grid-cols-2 gap-4">
            <div className="rounded-xl bg-gray-50 p-4">
              <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                Size
              </p>

              <p className="mt-1 text-sm font-semibold text-gray-900">
                {selectedBreed.size}
              </p>
            </div>

            <div className="rounded-xl bg-gray-50 p-4">
              <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                Lifespan
              </p>

              <p className="mt-1 text-sm font-semibold text-gray-900">
                {selectedBreed.lifespan}
              </p>
            </div>

            <div className="rounded-xl bg-gray-50 p-4">
              <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                Exercise
              </p>

              <p className="mt-1 text-sm font-semibold text-gray-900">
                {selectedBreed.exercise}
              </p>
            </div>

            <div className="rounded-xl bg-gray-50 p-4">
              <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                Temperament
              </p>

              <p className="mt-1 text-sm font-semibold text-gray-900">
                {selectedBreed.temperament}
              </p>
            </div>
          </div>
        </div>

        <div className="mt-6 rounded-2xl border border-gray-200 bg-gray-50 p-4">
          <p className="text-xs leading-5 text-gray-500">
            Breed information is general educational guidance.
            Individual pets can have different needs based on
            age, health history, environment, and behavior.
            Consult a qualified veterinarian for concerns about
            your pet's health.
          </p>
        </div>
      </div>
    </section>
  );
}

export default BreedInsights;