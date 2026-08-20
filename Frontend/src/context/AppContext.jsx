import { createContext, useEffect, useState } from "react";
import { getPets } from "../services/api";

export const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [pets, setPets] = useState([]);
  const [currentPet, setCurrentPet] = useState(null);
  const [isPetLoading, setIsPetLoading] = useState(true);

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
          setCurrentPet(formattedPets[0]);
        } else {
          setPets([]);
          setCurrentPet(null);
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

  const login = (user, token) => {
    localStorage.setItem("smartPawToken", token);
    localStorage.setItem("smartPawUser", JSON.stringify(user));

    setCurrentUser(user);
    setIsAuthenticated(true);
  };

  const logout = () => {
    localStorage.removeItem("smartPawToken");
    localStorage.removeItem("smartPawUser");

    setCurrentUser(null);
    setIsAuthenticated(false);
    setPets([]);
    setCurrentPet(null);
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        isAuthenticated,
        login,
        logout,
        pets,
        currentPet,
        setCurrentPet,
        isPetLoading,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}