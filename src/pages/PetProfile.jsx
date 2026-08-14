import { useState } from "react";
import { pets } from "../data/pets";

function PetProfile() {
  const pet = pets[0];

  const [isEditing, setIsEditing] = useState(false);
  const [petData, setPetData] = useState(pet);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setPetData((currentPet) => ({
      ...currentPet,
      [name]: value,
    }));
  };

  return (
    <section className="px-4 py-8">
      <div className="mx-auto max-w-2xl">
        <p className="text-sm font-semibold uppercase tracking-wider text-orange-500">
          Pet Information
        </p>

        <h1 className="mt-2 text-3xl font-bold text-gray-900">
          Pet Profile
        </h1>

        <p className="mt-3 text-base leading-7 text-gray-600">
          View and manage your pet's basic information.
        </p>

        <div className="mt-6 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                {petData.name}
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                {petData.breed}
              </p>
            </div>

            <button
              type="button"
              onClick={() => setIsEditing(!isEditing)}
              className="rounded-lg bg-orange-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-orange-600"
            >
              {isEditing ? "Done" : "Edit"}
            </button>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <div className="rounded-xl bg-gray-50 p-4">
              <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                Name
              </p>

              {isEditing ? (
                <input
                  type="text"
                  name="name"
                  value={petData.name}
                  onChange={handleChange}
                  className="mt-2 w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:border-orange-500"
                />
              ) : (
                <p className="mt-1 text-sm font-semibold text-gray-900">
                  {petData.name}
                </p>
              )}
            </div>

            <div className="rounded-xl bg-gray-50 p-4">
              <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                Breed
              </p>

              {isEditing ? (
                <input
                  type="text"
                  name="breed"
                  value={petData.breed}
                  onChange={handleChange}
                  className="mt-2 w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:border-orange-500"
                />
              ) : (
                <p className="mt-1 text-sm font-semibold text-gray-900">
                  {petData.breed}
                </p>
              )}
            </div>

            <div className="rounded-xl bg-gray-50 p-4">
              <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                Age
              </p>

              {isEditing ? (
                <input
                  type="number"
                  name="age"
                  value={petData.age}
                  onChange={handleChange}
                  className="mt-2 w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:border-orange-500"
                />
              ) : (
                <p className="mt-1 text-sm font-semibold text-gray-900">
                  {petData.age} years
                </p>
              )}
            </div>

            <div className="rounded-xl bg-gray-50 p-4">
              <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                Gender
              </p>

              {isEditing ? (
                <select
                  name="gender"
                  value={petData.gender}
                  onChange={handleChange}
                  className="mt-2 w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:border-orange-500"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                </select>
              ) : (
                <p className="mt-1 text-sm font-semibold text-gray-900">
                  {petData.gender}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default PetProfile;