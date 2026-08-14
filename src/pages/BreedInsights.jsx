import { useState } from "react";

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
  const [selectedBreed, setSelectedBreed] = useState(breeds[0]);

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
          Explore basic information about popular dog breeds and their care
          needs.
        </p>

        <div className="mt-6 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <label
            htmlFor="breed"
            className="text-sm font-medium text-gray-700"
          >
            Select a breed
          </label>

          <select
            id="breed"
            value={selectedBreed.id}
            onChange={(event) => {
              const breed = breeds.find(
                (item) => item.id === Number(event.target.value),
              );

              setSelectedBreed(breed);
            }}
            className="mt-2 w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
          >
            {breeds.map((breed) => (
              <option key={breed.id} value={breed.id}>
                {breed.name}
              </option>
            ))}
          </select>
        </div>

        <div className="mt-6 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <h2 className="text-xl font-semibold text-gray-900">
            {selectedBreed.name}
          </h2>

          <p className="mt-3 text-sm leading-6 text-gray-600">
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
      </div>
    </section>
  );
}

export default BreedInsights;