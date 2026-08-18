import { createContext, useEffect, useState } from "react";
import { getPets } from "../services/api";

export const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [currentPet, setCurrentPet] = useState(null);
  const [isPetLoading, setIsPetLoading] = useState(true);

  useEffect(() => {
    const loadPet = async () => {
      try {
        const data = await getPets();

        if (data.length > 0) {
          const mongoPet = data[0];

          setCurrentPet({
            ...mongoPet,
            id: mongoPet._id,
          });
        }
      } catch (error) {
        console.error("Failed to load pet:", error);
      } finally {
        setIsPetLoading(false);
      }
    };

    loadPet();
  }, []);

  return (
    <AppContext.Provider
      value={{
        currentPet,
        setCurrentPet,
        isPetLoading,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}