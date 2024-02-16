import { createContext, useEffect, useState } from "react";

type EmbedModeType = boolean;

export const EmbedModeContext = createContext<
  [EmbedModeType, (embedMode: EmbedModeType) => void]
>([false, () => {}]);

type EmbedModeProviderProps = {
  children: React.ReactNode;
};

const useEmbedMode = () => {
  const [isEmbedMode, setIsEmbedMode] = useState<boolean>(false);

  useEffect(() => {
    const localEmbedMode = window.localStorage.getItem("embedMode") === "true";
    window.localStorage.setItem("embedMode", String(localEmbedMode || false));
    setIsEmbedMode(localEmbedMode || false);
  }, []);

  return [isEmbedMode, setIsEmbedMode] as const;
};

export const EmbedModeProvider: React.FC<EmbedModeProviderProps> = ({
  children,
}) => {
  const [isEmbedMode, setIsEmbedMode] = useEmbedMode();

  useEffect(() => {
    window.localStorage.setItem("embedMode", String(isEmbedMode));
  }, [isEmbedMode]);

  return (
    <EmbedModeContext.Provider value={[isEmbedMode, setIsEmbedMode]}>
      {children}
    </EmbedModeContext.Provider>
  );
};
