import { createContext, useState } from "react";
import { pets } from "../data/pets";

export const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [currentPet, setCurrentPet] = useState(pets[0]);

  return (
    <AppContext.Provider
      value={{
        currentPet,
        setCurrentPet,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}