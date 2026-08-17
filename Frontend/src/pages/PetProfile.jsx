import { useEffect, useRef, useState } from "react";
import { useAppContext } from "../hooks/useAppContext";

function PetProfile() {
  const { currentPet, setCurrentPet } = useAppContext();

  const [isEditing, setIsEditing] = useState(false);
  const [petData, setPetData] = useState(currentPet);
  const [isGenderOpen, setIsGenderOpen] = useState(false);

  const genderDropdownRef = useRef(null);

  useEffect(() => {
    setPetData(currentPet);
  }, [currentPet]);

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (
        genderDropdownRef.current &&
        !genderDropdownRef.current.contains(event.target)
      ) {
        setIsGenderOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setPetData((currentPet) => ({
      ...currentPet,
      [name]: value,
    }));
  };

  const handleDone = () => {
    setCurrentPet(petData);
    setIsEditing(false);
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
          <div className="flex items-center justify-between gap-4">
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
              onClick={() => {
                if (isEditing) {
                  handleDone();
                } else {
                  setIsEditing(true);
                }
              }}
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
                  className="mt-2 w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
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
                  className="mt-2 w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
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
                  className="mt-2 w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
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
                <div ref={genderDropdownRef} className="relative mt-2">
                  <button
                    type="button"
                    onClick={() => setIsGenderOpen(!isGenderOpen)}
                    className="flex w-full items-center justify-between rounded-lg border border-gray-200 bg-white px-3 py-2 text-left text-sm text-gray-900 outline-none transition hover:border-gray-300 focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
                    aria-haspopup="listbox"
                    aria-expanded={isGenderOpen}
                  >
                    <span>{petData.gender}</span>

                    <span
                      className={`text-xs text-gray-400 transition-transform duration-200 ${
                        isGenderOpen ? "rotate-180" : ""
                      }`}
                    >
                      ▼
                    </span>
                  </button>

                  {isGenderOpen && (
                    <div className="absolute left-0 right-0 top-full z-20 mt-2 overflow-hidden rounded-xl border border-gray-200 bg-white p-1.5 shadow-lg">
                      {["Male", "Female"].map((gender) => (
                        <button
                          key={gender}
                          type="button"
                          onClick={() => {
                            setPetData((currentPet) => ({
                              ...currentPet,
                              gender,
                            }));
                            setIsGenderOpen(false);
                          }}
                          className={`flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-left text-sm transition ${
                            petData.gender === gender
                              ? "bg-orange-50 font-semibold text-orange-500"
                              : "text-gray-700 hover:bg-gray-50"
                          }`}
                        >
                          <span>{gender}</span>

                          {petData.gender === gender && (
                            <span className="font-bold">✓</span>
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
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