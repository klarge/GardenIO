import { Switch, Route } from "wouter";
import { queryClient, setApiUrlProvider } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Navigation } from "@/components/navigation";
import { AuthProvider } from "@/hooks/use-auth";
import { GardenProvider } from "@/hooks/use-garden";
import { ProtectedRoute } from "@/lib/protected-route";
import { ThemeProvider } from "@/lib/theme-provider";
import { ServerConfigProvider, useServerConfig } from "@/hooks/use-server-config";
import { ServerConfig } from "@/components/server-config";
import { useEffect } from "react";
import Dashboard from "@/pages/dashboard";
import PlantLibrary from "@/pages/plant-library";
import Timeline from "@/pages/timeline";
import Locations from "@/pages/locations";
import AuthPage from "@/pages/auth-page";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <ProtectedRoute path="/" component={Dashboard} />
      <ProtectedRoute path="/library" component={PlantLibrary} />
      <ProtectedRoute path="/timeline" component={Timeline} />
      <ProtectedRoute path="/locations" component={Locations} />
      <Route path="/auth" component={AuthPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function AppContent() {
  const { getApiUrl, isNativeApp, isConfigured } = useServerConfig();

  useEffect(() => {
    setApiUrlProvider(getApiUrl);
  }, [getApiUrl]);

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <GardenProvider>
            <TooltipProvider>
              <div className="min-h-screen bg-background text-foreground">
                <Navigation />
                <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                  <Router />
                </main>
                {isNativeApp && (
                  <ServerConfig 
                    initialOpen={!isConfigured}
                    onServerConfigured={() => {
                      // Refresh the page to reload with new server config
                      window.location.reload();
                    }}
                  />
                )}
              </div>
              <Toaster />
            </TooltipProvider>
          </GardenProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

function App() {
  return (
    <ServerConfigProvider>
      <AppContent />
    </ServerConfigProvider>
  );
}

export default App;
