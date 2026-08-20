import { useEffect, useState } from "react";
import { useAppContext } from "../hooks/useAppContext";
import { updatePet } from "../services/api";

function PetProfile() {
  const {
    pets = [],
    currentPet,
    setCurrentPet,
    isPetLoading,
  } = useAppContext();

  const [petData, setPetData] = useState(null);

  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    if (!currentPet) {
      setPetData(null);
      return;
    }

    setPetData({
      ...currentPet,
    });

    setError("");
    setSuccess("");
    setIsEditing(false);
  }, [currentPet]);

  const handlePetChange = (event) => {
    const selectedPet = pets.find(
      (pet) => pet._id === event.target.value,
    );

    if (!selectedPet) {
      return;
    }

    setCurrentPet(selectedPet);
    setError("");
    setSuccess("");
  };

  const handleChange = (event) => {
    const { name, value } = event.target;

    setPetData((currentPetData) => ({
      ...currentPetData,
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
      return;
    }

    if (!petData.breed?.trim()) {
      setError("Pet breed is required.");
      return;
    }

    if (
      petData.age === "" ||
      Number(petData.age) < 0
    ) {
      setError("Please enter a valid age.");
      return;
    }

    try {
      setIsSaving(true);
      setError("");
      setSuccess("");

      const updatedPet = await updatePet(
        currentPet._id,
        {
          name: petData.name.trim(),
          breed: petData.breed.trim(),
          age: Number(petData.age),
          gender: petData.gender,
        },
      );

      const normalizedPet = {
        ...updatedPet,
        id: updatedPet._id,
      };

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

  const handleCancel = () => {
    if (!currentPet) {
      return;
    }

    setPetData({
      ...currentPet,
    });

    setIsEditing(false);
    setError("");
    setSuccess("");
  };

  if (isPetLoading) {
    return (
      <section className="px-4 py-8">
        <div className="mx-auto max-w-2xl">
          <p className="text-sm font-semibold uppercase tracking-wider text-orange-500">
            Pet Information
          </p>

          <h1 className="mt-2 text-3xl font-bold text-gray-900">
            Pet Profile
          </h1>

          <div className="mt-6 rounded-2xl border border-gray-200 bg-white p-6 text-center shadow-sm">
            <p className="text-sm text-gray-500">
              Loading pet profile...
            </p>
          </div>
        </div>
      </section>
    );
  }

  if (!currentPet || !petData) {
    return (
      <section className="px-4 py-8">
        <div className="mx-auto max-w-2xl">
          <p className="text-sm font-semibold uppercase tracking-wider text-orange-500">
            Pet Information
          </p>

          <h1 className="mt-2 text-3xl font-bold text-gray-900">
            Pet Profile
          </h1>

          <div className="mt-6 rounded-2xl border border-red-100 bg-red-50 p-5">
            <p className="text-sm font-medium text-red-600">
              {error ||
                "No pet profile is available."}
            </p>
          </div>
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

        {/* Pet Selector */}
        {pets.length > 1 && (
          <div className="mt-6 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <label
              htmlFor="profilePet"
              className="text-sm font-semibold text-gray-700"
            >
              Select pet
            </label>

            <select
              id="profilePet"
              value={currentPet._id}
              onChange={handlePetChange}
              disabled={isEditing || isSaving}
              className="mt-2 w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-100 disabled:cursor-not-allowed disabled:bg-gray-50"
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

            <p className="mt-2 text-xs text-gray-500">
              Select the pet whose profile you want to manage.
            </p>
          </div>
        )}

        {/* Profile Card */}
        <div className="mt-6 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-orange-500">
                Current Pet
              </p>

              <h2 className="mt-1 text-xl font-semibold text-gray-900">
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
                  setError("");
                  setIsEditing(true);
                }}
                className="rounded-lg bg-orange-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-orange-600"
              >
                Edit
              </button>
            ) : (
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleCancel}
                  disabled={isSaving}
                  className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-600 transition hover:bg-gray-50 disabled:opacity-60"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={handleSave}
                  disabled={isSaving}
                  className="rounded-lg bg-orange-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isSaving
                    ? "Saving..."
                    : "Save"}
                </button>
              </div>
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
            {/* Name */}
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
                  className="mt-2 w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
                />
              ) : (
                <p className="mt-1 text-sm font-semibold text-gray-900">
                  {petData.name}
                </p>
              )}
            </div>

            {/* Breed */}
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
                  className="mt-2 w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
                />
              ) : (
                <p className="mt-1 text-sm font-semibold text-gray-900">
                  {petData.breed}
                </p>
              )}
            </div>

            {/* Age */}
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
                  className="mt-2 w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
                />
              ) : (
                <p className="mt-1 text-sm font-semibold text-gray-900">
                  {petData.age} years
                </p>
              )}
            </div>

            {/* Gender */}
            <div className="rounded-xl bg-gray-50 p-4">
              <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                Gender
              </p>

              {isEditing ? (
                <select
                  name="gender"
                  value={petData.gender}
                  onChange={handleChange}
                  className="mt-2 w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
                >
                  <option value="Male">
                    Male
                  </option>

                  <option value="Female">
                    Female
                  </option>
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