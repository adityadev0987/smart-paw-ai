import { useState } from "react";

const recommendations = [
  {
    id: 1,
    category: "Nutrition",
    title: "Maintain a balanced diet",
    description:
      "Provide your pet with age-appropriate food and make sure fresh drinking water is always available.",
  },
  {
    id: 2,
    category: "Exercise",
    title: "Keep your pet active",
    description:
      "Regular walks, play sessions, and simple activities can help maintain healthy physical and mental stimulation.",
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
    title: "Follow a regular grooming routine",
    description:
      "Regular brushing, nail care, and basic hygiene can help keep your pet comfortable and healthy.",
  },
];

function Recommendation() {
  const [selectedCategory, setSelectedCategory] = useState("All");

  const categories = ["All", "Nutrition", "Exercise", "Health", "Grooming"];

  const filteredRecommendations =
    selectedCategory === "All"
      ? recommendations
      : recommendations.filter(
          (recommendation) =>
            recommendation.category === selectedCategory,
        );

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
          Explore simple care recommendations to support your pet's everyday
          health and well-being.
        </p>

        <div className="mt-6 flex flex-wrap gap-2">
          {categories.map((category) => (
            <button
              key={category}
              type="button"
              onClick={() => setSelectedCategory(category)}
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

        <div className="mt-6 space-y-4">
          {filteredRecommendations.map((recommendation) => (
            <div
              key={recommendation.id}
              className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm"
            >
              <div className="flex items-start justify-between gap-3">
                <h2 className="text-lg font-semibold text-gray-900">
                  {recommendation.title}
                </h2>

                <span className="rounded-full bg-orange-50 px-3 py-1 text-xs font-medium text-orange-500">
                  {recommendation.category}
                </span>
              </div>

              <p className="mt-3 text-sm leading-6 text-gray-600">
                {recommendation.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default Recommendation;