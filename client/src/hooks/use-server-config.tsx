import { createContext, useContext, useEffect, useState, ReactNode } from "react";

// Capacitor imports - these will be undefined in web environment
let Preferences: any;

// Dynamically import Capacitor modules if available
const initCapacitor = async () => {
  try {
    const { Preferences: PreferencesModule } = await import('@capacitor/preferences');
    Preferences = PreferencesModule;
  } catch (error) {
    // Capacitor not available (web environment)
  }
};

interface ServerConfigContextType {
  serverUrl: string;
  isNativeApp: boolean;
  isConfigured: boolean;
  setServerUrl: (url: string) => void;
  getApiUrl: (path: string) => string;
}

const ServerConfigContext = createContext<ServerConfigContextType | null>(null);

export function ServerConfigProvider({ children }: { children: ReactNode }) {
  const [serverUrl, setServerUrlState] = useState("");
  const [isNativeApp, setIsNativeApp] = useState(false);
  const [isConfigured, setIsConfigured] = useState(false);

  useEffect(() => {
    const initialize = async () => {
      await initCapacitor();
      const isNative = !!Preferences && typeof window !== 'undefined' && 
                       (window as any).Capacitor?.isNativePlatform();
      setIsNativeApp(isNative);
      
      if (isNative && Preferences) {
        try {
          const { value } = await Preferences.get({ key: 'serverUrl' });
          if (value) {
            setServerUrlState(value);
            setIsConfigured(true);
          }
        } catch (error) {
          console.error('Failed to load server URL:', error);
        }
      } else {
        // For web environment, use current origin
        setServerUrlState(window.location.origin);
        setIsConfigured(true);
      }
    };

    initialize();
  }, []);

  const setServerUrl = async (url: string) => {
    setServerUrlState(url);
    setIsConfigured(true);
    
    if (isNativeApp && Preferences) {
      try {
        await Preferences.set({
          key: 'serverUrl',
          value: url,
        });
      } catch (error) {
        console.error('Failed to save server URL:', error);
      }
    }
  };

  const getApiUrl = (path: string) => {
    const baseUrl = isNativeApp ? serverUrl : '';
    return `${baseUrl}${path}`;
  };

  return (
    <ServerConfigContext.Provider
      value={{
        serverUrl,
        isNativeApp,
        isConfigured,
        setServerUrl,
        getApiUrl,
      }}
    >
      {children}
    </ServerConfigContext.Provider>
  );
}

export function useServerConfig() {
  const context = useContext(ServerConfigContext);
  if (!context) {
    throw new Error("useServerConfig must be used within a ServerConfigProvider");
  }
  return context;
}