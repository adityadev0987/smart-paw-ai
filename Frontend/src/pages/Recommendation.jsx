import { useMemo, useState } from "react";
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
    "All",
    "Nutrition",
    "Exercise",
    "Health",
    "Grooming",
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

  if (isPetLoading) {
    return (
      <section className="px-4 py-8">
        <div className="mx-auto max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-wider text-orange-500">
            Smart Pet Care
          </p>

          <h1 className="mt-2 text-3xl font-bold text-gray-900">
            Recommendations
          </h1>

          <div className="mt-6 rounded-2xl border border-gray-200 bg-white p-6 text-center shadow-sm">
            <p className="text-sm text-gray-500">
              Loading pet information...
            </p>
          </div>
        </div>
      </section>
    );
  }

  if (!currentPet) {
    return (
      <section className="px-4 py-8">
        <div className="mx-auto max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-wider text-orange-500">
            Smart Pet Care
          </p>

          <h1 className="mt-2 text-3xl font-bold text-gray-900">
            Recommendations
          </h1>

          <div className="mt-6 rounded-2xl border border-red-100 bg-red-50 p-5">
            <p className="text-sm text-red-600">
              Pet information is not available. Please add a
              pet before viewing recommendations.
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="px-4 py-8">
      <div className="mx-auto max-w-3xl">
        <p className="text-sm font-semibold uppercase tracking-wider text-orange-500">
          Smart Pet Care
        </p>

        <h1 className="mt-2 text-3xl font-bold text-gray-900">
          Recommendations
        </h1>

        <p className="mt-3 text-base leading-7 text-gray-600">
          Explore simple care recommendations for{" "}
          {currentPet.name}.
        </p>

        {/* Pet Selector */}
        {pets.length > 1 && (
          <div className="mt-6 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <label
              htmlFor="recommendationPet"
              className="text-sm font-semibold text-gray-700"
            >
              Select pet
            </label>

            <select
              id="recommendationPet"
              value={currentPet._id}
              onChange={handlePetChange}
              className="mt-2 w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
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
        )}

        {/* Pet Summary */}
        <div className="mt-6 rounded-2xl border border-orange-100 bg-orange-50 p-5">
          <p className="text-xs font-semibold uppercase tracking-wider text-orange-500">
            Recommendations for
          </p>

          <h2 className="mt-1 text-xl font-bold text-gray-900">
            {currentPet.name}
          </h2>

          <p className="mt-1 text-sm text-gray-600">
            {currentPet.breed} • {currentPet.age} years old •{" "}
            {currentPet.gender}
          </p>
        </div>

        {/* Categories */}
        <div className="mt-6 flex flex-wrap gap-2">
          {categories.map((category) => (
            <button
              key={category}
              type="button"
              onClick={() =>
                setSelectedCategory(category)
              }
              className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                selectedCategory === category
                  ? "bg-orange-500 text-white"
                  : "border border-gray-200 bg-white text-gray-600 hover:border-orange-300 hover:text-orange-500"
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Recommendations */}
        <div className="mt-6 space-y-4">
          {filteredRecommendations.map(
            (recommendation) => (
              <div
                key={recommendation.id}
                className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition hover:border-orange-200"
              >
                <div className="flex items-start justify-between gap-3">
                  <h2 className="text-lg font-semibold text-gray-900">
                    {recommendation.title}
                  </h2>

                  <span className="shrink-0 rounded-full bg-orange-50 px-3 py-1 text-xs font-medium text-orange-500">
                    {recommendation.category}
                  </span>
                </div>

                <p className="mt-3 text-sm leading-6 text-gray-600">
                  {recommendation.description}
                </p>
              </div>
            ),
          )}
        </div>

        {/* Disclaimer */}
        <div className="mt-6 rounded-2xl border border-gray-200 bg-gray-50 p-4">
          <p className="text-xs leading-5 text-gray-500">
            These recommendations are general informational
            guidance and are not a substitute for professional
            veterinary advice. Individual care needs can vary
            based on age, breed, health history, and other
            factors.
          </p>
        </div>
      </div>
    </section>
  );
}

export default Recommendation;