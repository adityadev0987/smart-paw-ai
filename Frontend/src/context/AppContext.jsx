import {
  createContext,
  useEffect,
  useState,
} from "react";

import { getPets } from "../services/api";

export const AppContext = createContext(null);

const API_BASE_URL = "http://localhost:5000/api";

export function AppProvider({ children }) {
  // --------------------------------------------------
  // Pets
  // --------------------------------------------------

  const [pets, setPets] = useState([]);
  const [currentPet, setCurrentPet] = useState(null);
  const [isPetLoading, setIsPetLoading] = useState(true);

  // --------------------------------------------------
  // Theme
  // --------------------------------------------------

  const [theme, setTheme] = useState(() => {
    return (
      localStorage.getItem("smartPawTheme") || "light"
    );
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
      currentTheme === "light"
        ? "dark"
        : "light",
    );
  };

  // --------------------------------------------------
  // User
  // --------------------------------------------------

  const [currentUser, setCurrentUser] = useState(() => {
    const storedUser =
      localStorage.getItem("smartPawUser");

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

  const [isAuthenticated, setIsAuthenticated] =
    useState(() => {
      return Boolean(
        localStorage.getItem("smartPawToken"),
      );
    });

  const [isAuthChecking, setIsAuthChecking] =
    useState(true);

  // --------------------------------------------------
  // Clear authentication
  // --------------------------------------------------

  const clearAuthentication = () => {
    localStorage.removeItem("smartPawToken");
    localStorage.removeItem("smartPawUser");

    setCurrentUser(null);
    setIsAuthenticated(false);

    setPets([]);
    setCurrentPet(null);
  };

  // --------------------------------------------------
  // Verify stored token when app starts
  // --------------------------------------------------

  useEffect(() => {
    let isMounted = true;

    const verifyStoredToken = async () => {
      const token =
        localStorage.getItem("smartPawToken");

      // No token means user is logged out.
      if (!token) {
        if (!isMounted) return;

        setIsAuthenticated(false);
        setCurrentUser(null);
        setIsAuthChecking(false);

        return;
      }

      try {
        const response = await fetch(
          `${API_BASE_URL}/auth/me`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        if (!response.ok) {
          throw new Error(
            "Stored authentication token is invalid.",
          );
        }

        const result = await response.json();

        if (
          !result.success ||
          !result.data?.user
        ) {
          throw new Error(
            "Invalid authentication response.",
          );
        }

        if (!isMounted) return;

        const user = result.data.user;

        localStorage.setItem(
          "smartPawUser",
          JSON.stringify(user),
        );

        setCurrentUser(user);
        setIsAuthenticated(true);
      } catch (error) {
        console.warn(
          "Stored authentication is no longer valid.",
        );

        if (!isMounted) return;

        clearAuthentication();
      } finally {
        if (isMounted) {
          setIsAuthChecking(false);
        }
      }
    };

    verifyStoredToken();

    return () => {
      isMounted = false;
    };
  }, []);

  // --------------------------------------------------
  // Load pets
  // --------------------------------------------------

  useEffect(() => {
    const loadPets = async () => {
      if (isAuthChecking) {
        return;
      }

      if (!isAuthenticated) {
        setPets([]);
        setCurrentPet(null);
        setIsPetLoading(false);

        return;
      }

      try {
        setIsPetLoading(true);

        const data = await getPets();

        if (
          Array.isArray(data) &&
          data.length > 0
        ) {
          const formattedPets = data.map((pet) => ({
            ...pet,
            id: pet._id || pet.id,
          }));

          setPets(formattedPets);

          setCurrentPet((existingPet) => {
            if (!existingPet) {
              return formattedPets[0];
            }

            const updatedCurrentPet =
              formattedPets.find(
                (pet) =>
                  pet.id === existingPet.id ||
                  pet._id === existingPet._id,
              );

            return (
              updatedCurrentPet ||
              formattedPets[0]
            );
          });
        } else {
          setPets([]);
          setCurrentPet(null);
        }
      } catch (error) {
        console.error(
          "Failed to load pets:",
          error,
        );

        setPets([]);
        setCurrentPet(null);
      } finally {
        setIsPetLoading(false);
      }
    };

    loadPets();
  }, [isAuthenticated, isAuthChecking]);

  // --------------------------------------------------
  // Add pet
  // --------------------------------------------------

  const addPet = (pet) => {
    if (!pet) {
      return;
    }

    const formattedPet = {
      ...pet,
      id: pet._id || pet.id,
    };

    setPets((currentPets) => [
      ...currentPets,
      formattedPet,
    ]);

    setCurrentPet(formattedPet);
  };

  // --------------------------------------------------
  // Update pet in context
  // --------------------------------------------------

  const updatePetInContext = (updatedPet) => {
    if (!updatedPet) {
      return;
    }

    const petId =
      updatedPet._id || updatedPet.id;

    const formattedPet = {
      ...updatedPet,
      id: petId,
    };

    setPets((currentPets) =>
      currentPets.map((pet) => {
        const existingPetId =
          pet._id || pet.id;

        if (existingPetId === petId) {
          return {
            ...pet,
            ...formattedPet,
          };
        }

        return pet;
      }),
    );

    setCurrentPet((existingPet) => {
      if (!existingPet) {
        return formattedPet;
      }

      const existingPetId =
        existingPet._id || existingPet.id;

      if (existingPetId === petId) {
        return {
          ...existingPet,
          ...formattedPet,
        };
      }

      return existingPet;
    });
  };

  // --------------------------------------------------
  // Remove pet from context
  // --------------------------------------------------

  const removePetFromContext = (petId) => {
    if (!petId) {
      return;
    }

    setPets((currentPets) =>
      currentPets.filter((pet) => {
        const existingPetId =
          pet._id || pet.id;

        return existingPetId !== petId;
      }),
    );

    setCurrentPet((existingPet) => {
      if (!existingPet) {
        return null;
      }

      const existingPetId =
        existingPet._id || existingPet.id;

      if (existingPetId === petId) {
        return null;
      }

      return existingPet;
    });
  };

  // --------------------------------------------------
  // Login
  // --------------------------------------------------

  const login = async (
    email,
    password,
  ) => {
    const response = await fetch(
      `${API_BASE_URL}/auth/login`,
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

    let result;

    try {
      result = await response.json();
    } catch {
      throw new Error(
        "Invalid server response.",
      );
    }

    if (!response.ok) {
      throw new Error(
        result?.message ||
          "Failed to login.",
      );
    }

    if (
      !result?.success ||
      !result?.data?.token ||
      !result?.data?.user
    ) {
      throw new Error(
        "Invalid login response.",
      );
    }

    const {
      token,
      user,
    } = result.data;

    localStorage.setItem(
      "smartPawToken",
      token,
    );

    localStorage.setItem(
      "smartPawUser",
      JSON.stringify(user),
    );

    setCurrentUser(user);
    setIsAuthenticated(true);

    // Reset pet state.
    setPets([]);
    setCurrentPet(null);
    setIsPetLoading(true);

    return {
      token,
      user,
    };
  };

  // --------------------------------------------------
  // Logout
  // --------------------------------------------------

  const logout = () => {
    clearAuthentication();
  };

  // --------------------------------------------------
  // Refresh authentication manually
  // --------------------------------------------------

  const refreshAuthentication = async () => {
    const token =
      localStorage.getItem("smartPawToken");

    if (!token) {
      clearAuthentication();
      return false;
    }

    try {
      const response = await fetch(
        `${API_BASE_URL}/auth/me`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (!response.ok) {
        throw new Error(
          "Authentication expired.",
        );
      }

      const result = await response.json();

      if (
        !result.success ||
        !result.data?.user
      ) {
        throw new Error(
          "Invalid authentication response.",
        );
      }

      const user = result.data.user;

      localStorage.setItem(
        "smartPawUser",
        JSON.stringify(user),
      );

      setCurrentUser(user);
      setIsAuthenticated(true);

      return true;
    } catch (error) {
      clearAuthentication();
      return false;
    }
  };

  // --------------------------------------------------
  // Prevent UI flicker while checking auth
  // --------------------------------------------------

  if (isAuthChecking) {
    return null;
  }

  // --------------------------------------------------
  // Context
  // --------------------------------------------------

  return (
    <AppContext.Provider
      value={{
        // User
        currentUser,
        isAuthenticated,
        isAuthChecking,

        // Authentication
        login,
        logout,
        clearAuthentication,
        refreshAuthentication,

        // Pets
        pets,
        currentPet,
        setCurrentPet,
        addPet,
        updatePetInContext,
        removePetFromContext,
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