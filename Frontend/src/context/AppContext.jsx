import { createContext, useEffect, useState } from "react";
import { getPets } from "../services/api";

export const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [pets, setPets] = useState([]);
  const [currentPet, setCurrentPet] = useState(null);
  const [isPetLoading, setIsPetLoading] = useState(true);

  // Theme
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem("smartPawTheme") || "light";
  });

  useEffect(() => {
    localStorage.setItem("smartPawTheme", theme);

    document.documentElement.classList.toggle(
      "dark",
      theme === "dark",
    );
  }, [theme]);

  const toggleTheme = () => {
    setTheme((currentTheme) =>
      currentTheme === "light" ? "dark" : "light",
    );
  };

  // User
  const [currentUser, setCurrentUser] = useState(() => {
    const storedUser = localStorage.getItem("smartPawUser");

    if (!storedUser) {
      return null;
    }

    try {
      return JSON.parse(storedUser);
    } catch {
      localStorage.removeItem("smartPawUser");
      return null;
    }
  });

  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return Boolean(localStorage.getItem("smartPawToken"));
  });

  // Load pets
  useEffect(() => {
    const loadPets = async () => {
      if (!isAuthenticated) {
        setPets([]);
        setCurrentPet(null);
        setIsPetLoading(false);
        return;
      }

      try {
        setIsPetLoading(true);

        const data = await getPets();

        if (Array.isArray(data) && data.length > 0) {
          const formattedPets = data.map((pet) => ({
            ...pet,
            id: pet._id,
          }));

          setPets(formattedPets);

          // Restore previously selected pet if it still exists
          const savedPetId =
            localStorage.getItem("smartPawCurrentPetId");

          const savedPet = savedPetId
            ? formattedPets.find(
                (pet) => pet.id === savedPetId,
              )
            : null;

          setCurrentPet(savedPet || formattedPets[0]);
        } else {
          setPets([]);
          setCurrentPet(null);
          localStorage.removeItem("smartPawCurrentPetId");
        }
      } catch (error) {
        console.error("Failed to load pets:", error);
        setPets([]);
        setCurrentPet(null);
      } finally {
        setIsPetLoading(false);
      }
    };

    loadPets();
  }, [isAuthenticated]);

  // Select current pet
  const selectPet = (pet) => {
    if (!pet) {
      setCurrentPet(null);
      localStorage.removeItem("smartPawCurrentPetId");
      return;
    }

    const formattedPet = {
      ...pet,
      id: pet._id || pet.id,
    };

    setCurrentPet(formattedPet);

    if (formattedPet.id) {
      localStorage.setItem(
        "smartPawCurrentPetId",
        formattedPet.id,
      );
    }
  };

  // Add pet to global state
  const addPet = (pet) => {
    const formattedPet = {
      ...pet,
      id: pet._id || pet.id,
    };

    setPets((currentPets) => [
      ...currentPets,
      formattedPet,
    ]);

    selectPet(formattedPet);
  };

  // Update pet in global state
  const updatePet = (updatedPet) => {
    const formattedPet = {
      ...updatedPet,
      id: updatedPet._id || updatedPet.id,
    };

    setPets((currentPets) =>
      currentPets.map((pet) =>
        pet.id === formattedPet.id
          ? formattedPet
          : pet,
      ),
    );

    setCurrentPet((currentPetValue) => {
      if (
        currentPetValue?.id === formattedPet.id
      ) {
        return formattedPet;
      }

      return currentPetValue;
    });
  };

  // Delete pet from global state
  const removePet = (petId) => {
    setPets((currentPets) => {
      const remainingPets = currentPets.filter(
        (pet) => pet.id !== petId,
      );

      setCurrentPet((currentPetValue) => {
        if (currentPetValue?.id !== petId) {
          return currentPetValue;
        }

        if (remainingPets.length === 0) {
          localStorage.removeItem(
            "smartPawCurrentPetId",
          );
          return null;
        }

        const nextPet = remainingPets[0];

        localStorage.setItem(
          "smartPawCurrentPetId",
          nextPet.id,
        );

        return nextPet;
      });

      return remainingPets;
    });

    const savedPetId =
      localStorage.getItem("smartPawCurrentPetId");

    if (savedPetId === petId) {
      localStorage.removeItem("smartPawCurrentPetId");
    }
  };

  // Login
  const login = async (email, password) => {
    const response = await fetch(
      "http://localhost:5000/api/auth/login",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
        }),
      },
    );

    const result = await response.json();

    if (!response.ok) {
      throw new Error(
        result.message || "Failed to login.",
      );
    }

    const { token, user } = result.data;

    localStorage.setItem("smartPawToken", token);

    localStorage.setItem(
      "smartPawUser",
      JSON.stringify(user),
    );

    localStorage.removeItem(
      "smartPawCurrentPetId",
    );

    setCurrentUser(user);
    setIsAuthenticated(true);
  };

  // Logout
  const logout = () => {
    localStorage.removeItem("smartPawToken");
    localStorage.removeItem("smartPawUser");
    localStorage.removeItem(
      "smartPawCurrentPetId",
    );

    setCurrentUser(null);
    setIsAuthenticated(false);
    setPets([]);
    setCurrentPet(null);
  };

  return (
    <AppContext.Provider
      value={{
        // User
        currentUser,
        isAuthenticated,
        login,
        logout,

        // Pets
        pets,
        currentPet,
        setCurrentPet: selectPet,
        selectPet,
        addPet,
        updatePet,
        removePet,
        isPetLoading,

        // Theme
        theme,
        setTheme,
        toggleTheme,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}