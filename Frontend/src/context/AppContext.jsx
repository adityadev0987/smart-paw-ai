import { createContext, useEffect, useState } from "react";
import { getPets } from "../services/api";

export const AppContext = createContext(null);

export function AppProvider({ children }) {
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
    const loadPet = async () => {
      if (!isAuthenticated) {
        setCurrentPet(null);
        setIsPetLoading(false);
        return;
      }

      try {
        setIsPetLoading(true);

        const data = await getPets();

        if (data.length > 0) {
          const mongoPet = data[0];

          setCurrentPet({
            ...mongoPet,
            id: mongoPet._id,
          });
        } else {
          setCurrentPet(null);
        }
      } catch (error) {
        console.error("Failed to load pet:", error);
        setCurrentPet(null);
      } finally {
        setIsPetLoading(false);
      }
    };

    loadPet();
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
    setCurrentPet(null);
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        isAuthenticated,
        login,
        logout,
        currentPet,
        setCurrentPet,
        isPetLoading,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}