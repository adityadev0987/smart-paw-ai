import { useEffect, useState } from "react";
import { getPets, updatePet } from "../services/api";

function PetProfile() {
  const [pet, setPet] = useState(null);
  const [petData, setPetData] = useState(null);

  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const loadPet = async () => {
      try {
        setIsLoading(true);
        setError("");

        const pets = await getPets();

        if (pets.length === 0) {
          setError("No pet found.");
          return;
        }

        setPet(pets[0]);
        setPetData(pets[0]);
      } catch (error) {
        console.error("Failed to load pet:", error);
        setError("Failed to load pet information.");
      } finally {
        setIsLoading(false);
      }
    };

    loadPet();
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setPetData((currentPet) => ({
      ...currentPet,
      [name]: value,
    }));
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      setError("");
      setSuccess("");

      const updatedPet = await updatePet(pet._id, {
        name: petData.name,
        breed: petData.breed,
        age: Number(petData.age),
        gender: petData.gender,
      });

      setPet(updatedPet);
      setPetData(updatedPet);
      setIsEditing(false);
      setSuccess("Pet profile updated successfully.");
    } catch (error) {
      console.error("Failed to update pet:", error);
      setError("Failed to update pet information.");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <section className="px-4 py-8">
        <div className="mx-auto max-w-2xl">
          <p className="text-sm text-gray-500">
            Loading pet profile...
          </p>
        </div>
      </section>
    );
  }

  if (!pet || !petData) {
    return (
      <section className="px-4 py-8">
        <div className="mx-auto max-w-2xl">
          <p className="text-sm font-medium text-red-500">
            {error || "Pet profile could not be loaded."}
          </p>
        </div>
      </section>
    );
  }

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
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                {petData.name}
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                {petData.breed}
              </p>
            </div>

            {!isEditing ? (
              <button
                type="button"
                onClick={() => {
                  setSuccess("");
                  setIsEditing(true);
                }}
                className="rounded-lg bg-orange-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-orange-600"
              >
                Edit
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSave}
                disabled={isSaving}
                className="rounded-lg bg-orange-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSaving ? "Saving..." : "Save"}
              </button>
            )}
          </div>

          {success && (
            <div className="mt-4 rounded-xl border border-green-100 bg-green-50 p-3">
              <p className="text-sm font-medium text-green-600">
                {success}
              </p>
            </div>
          )}

          {error && (
            <div className="mt-4 rounded-xl border border-red-100 bg-red-50 p-3">
              <p className="text-sm font-medium text-red-500">
                {error}
              </p>
            </div>
          )}

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
                  min="0"
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