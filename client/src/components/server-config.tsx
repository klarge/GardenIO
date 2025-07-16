import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Settings, Wifi, Check, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// Capacitor imports - these will be undefined in web environment
let Preferences: any;
let CapacitorHttp: any;

// Dynamically import Capacitor modules if available
const initCapacitor = async () => {
  try {
    const { Preferences: PreferencesModule } = await import('@capacitor/preferences');
    const { CapacitorHttp: HttpModule } = await import('@capacitor/core');
    Preferences = PreferencesModule;
    CapacitorHttp = HttpModule;
  } catch (error) {
    // Capacitor not available (web environment)
  }
};

interface ServerConfigProps {
  onServerConfigured?: (serverUrl: string) => void;
  initialOpen?: boolean;
}

export function ServerConfig({ onServerConfigured, initialOpen = false }: ServerConfigProps) {
  const [isOpen, setIsOpen] = useState(initialOpen);
  const [serverUrl, setServerUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
  const [isCapacitorReady, setIsCapacitorReady] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const initialize = async () => {
      await initCapacitor();
      setIsCapacitorReady(!!Preferences);
      
      // Load saved server URL
      if (Preferences) {
        try {
          const { value } = await Preferences.get({ key: 'serverUrl' });
          if (value) {
            setServerUrl(value);
          }
        } catch (error) {
          console.error('Failed to load server URL:', error);
        }
      }
    };

    initialize();
  }, []);

  const isNativeApp = () => {
    return isCapacitorReady && typeof window !== 'undefined' && 
           (window as any).Capacitor?.isNativePlatform();
  };

  const testConnection = async (url: string) => {
    setConnectionStatus('testing');
    
    try {
      const cleanUrl = url.replace(/\/$/, ''); // Remove trailing slash
      const testUrl = `${cleanUrl}/api/health`;
      
      let response;
      if (isNativeApp() && CapacitorHttp) {
        // Use Capacitor HTTP for native apps
        response = await CapacitorHttp.request({
          method: 'GET',
          url: testUrl,
          headers: {},
          connectTimeout: 10000,
          readTimeout: 10000,
        });
      } else {
        // Use fetch for web
        response = await fetch(testUrl, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
          signal: AbortSignal.timeout(10000),
        });
      }

      if ((response.status || response.statusCode) === 200) {
        setConnectionStatus('success');
        return true;
      } else {
        setConnectionStatus('error');
        return false;
      }
    } catch (error) {
      console.error('Connection test failed:', error);
      setConnectionStatus('error');
      return false;
    }
  };

  const handleSave = async () => {
    if (!serverUrl.trim()) {
      toast({
        title: "Error",
        description: "Please enter a server URL",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    
    const cleanUrl = serverUrl.trim().replace(/\/$/, '');
    const isValid = await testConnection(cleanUrl);
    
    if (isValid) {
      if (Preferences) {
        try {
          await Preferences.set({
            key: 'serverUrl',
            value: cleanUrl,
          });
        } catch (error) {
          console.error('Failed to save server URL:', error);
        }
      }
      
      toast({
        title: "Success",
        description: "Server URL configured successfully!",
      });
      
      setIsOpen(false);
      onServerConfigured?.(cleanUrl);
    } else {
      toast({
        title: "Connection Failed",
        description: "Could not connect to the server. Please check the URL and try again.",
        variant: "destructive",
      });
    }
    
    setIsLoading(false);
  };

  const handleTest = async () => {
    if (!serverUrl.trim()) {
      toast({
        title: "Error",
        description: "Please enter a server URL",
        variant: "destructive",
      });
      return;
    }

    const cleanUrl = serverUrl.trim().replace(/\/$/, '');
    await testConnection(cleanUrl);
  };

  // Don't render the component if we're in a web environment
  if (!isNativeApp()) {
    return null;
  }

  return (
    <>
      <Button 
        variant="outline" 
        size="sm" 
        onClick={() => setIsOpen(true)}
        className="fixed top-4 right-4 z-50"
      >
        <Settings className="h-4 w-4 mr-2" />
        Server
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Wifi className="h-5 w-5" />
              Server Configuration
            </DialogTitle>
          </DialogHeader>
          
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">GardenIO Server URL</CardTitle>
              <CardDescription>
                Enter the URL of your GardenIO server instance
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="serverUrl">Server URL</Label>
                <Input
                  id="serverUrl"
                  placeholder="https://your-server.com:5000"
                  value={serverUrl}
                  onChange={(e) => setServerUrl(e.target.value)}
                  disabled={isLoading}
                />
                <p className="text-sm text-muted-foreground">
                  Example: https://192.168.1.100:5000 or https://gardenio.yourserver.com
                </p>
              </div>

              {connectionStatus !== 'idle' && (
                <div className="flex items-center gap-2 text-sm">
                  {connectionStatus === 'testing' && (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-primary border-t-transparent"></div>
                      Testing connection...
                    </>
                  )}
                  {connectionStatus === 'success' && (
                    <>
                      <Check className="h-4 w-4 text-green-500" />
                      <span className="text-green-600">Connection successful!</span>
                    </>
                  )}
                  {connectionStatus === 'error' && (
                    <>
                      <X className="h-4 w-4 text-red-500" />
                      <span className="text-red-600">Connection failed</span>
                    </>
                  )}
                </div>
              )}

              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  onClick={handleTest}
                  disabled={isLoading || !serverUrl.trim()}
                >
                  Test Connection
                </Button>
                <Button 
                  onClick={handleSave}
                  disabled={isLoading || !serverUrl.trim()}
                >
                  Save & Connect
                </Button>
              </div>
            </CardContent>
          </Card>
        </DialogContent>
      </Dialog>
    </>
  );
}