"use client";

import { useState, useEffect } from "react";
import { X, Settings, Cookie } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { cookieConsent, ConsentState } from "@/lib/cookie-consent";

export function CookieConsent() {
  const [showBanner, setShowBanner] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [preferences, setPreferences] = useState<ConsentState>({
    necessary: true,
    analytics: false,
    marketing: false,
  });

  useEffect(() => {
    const hasConsent = cookieConsent.hasConsent();
    if (!hasConsent) {
      const timer = setTimeout(() => setShowBanner(true), 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAcceptAll = () => {
    cookieConsent.acceptAll();
    setShowBanner(false);
    window.location.reload();
  };

  const handleAcceptNecessary = () => {
    cookieConsent.acceptNecessary();
    setShowBanner(false);
  };

  const handleOpenSettings = () => {
    const current = cookieConsent.getConsent();
    if (current) {
      setPreferences(current);
    }
    setShowSettings(true);
  };

  const handleSavePreferences = () => {
    cookieConsent.saveConsent(preferences);
    setShowSettings(false);
    setShowBanner(false);
    window.location.reload();
  };

  if (!showBanner) return null;

  return (
    <>
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 shadow-2xl animate-in slide-in-from-bottom duration-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 bg-[#708A95]/10 rounded-full flex items-center justify-center">
                <Cookie className="w-5 h-5 text-[#708A95]" />
              </div>
            </div>

            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-semibold text-gray-900 mb-1">
                Cookies & Datenschutz
              </h3>
              <p className="text-xs text-gray-600 leading-relaxed">
                Wir verwenden Cookies, um Ihnen das beste Erlebnis auf unserer Website zu bieten.
                Notwendige Cookies sind für die Funktion der Website erforderlich. Analytics-Cookies helfen
                uns, die Nutzung zu verstehen und unseren Service zu verbessern.{" "}
                <a
                  href="/datenschutz"
                  className="text-[#708A95] hover:underline font-medium"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Mehr erfahren
                </a>
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
              <Button
                variant="outline"
                size="sm"
                onClick={handleOpenSettings}
                className="text-xs border-gray-300 hover:bg-gray-50"
              >
                <Settings className="w-3.5 h-3.5 mr-1.5" />
                Einstellungen
              </Button>
              <Button
                size="sm"
                onClick={handleAcceptAll}
                className="text-xs bg-[#708A95] hover:bg-[#62808A] text-white"
              >
                Alle akzeptieren
              </Button>
            </div>
          </div>
        </div>
      </div>

      <Dialog open={showSettings} onOpenChange={setShowSettings}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Cookie className="w-5 h-5 text-[#708A95]" />
              Cookie-Einstellungen
            </DialogTitle>
            <DialogDescription className="text-sm text-gray-600">
              Verwalten Sie Ihre Cookie-Präferenzen. Sie können Ihre Einstellungen jederzeit ändern.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            <div className="space-y-4">
              <div className="flex items-start justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
                <div className="flex-1 pr-4">
                  <div className="flex items-center gap-2 mb-1">
                    <Label htmlFor="necessary" className="font-semibold text-sm">
                      Notwendige Cookies
                    </Label>
                    <span className="text-xs bg-gray-200 text-gray-700 px-2 py-0.5 rounded">
                      Erforderlich
                    </span>
                  </div>
                  <p className="text-xs text-gray-600 leading-relaxed">
                    Diese Cookies sind für die grundlegende Funktionalität der Website erforderlich
                    und können nicht deaktiviert werden.
                  </p>
                </div>
                <Switch
                  id="necessary"
                  checked={true}
                  disabled
                  className="data-[state=checked]:bg-gray-400"
                />
              </div>

              <div className="flex items-start justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
                <div className="flex-1 pr-4">
                  <Label htmlFor="analytics" className="font-semibold text-sm mb-1 block">
                    Analytics-Cookies
                  </Label>
                  <p className="text-xs text-gray-600 leading-relaxed">
                    Helfen uns zu verstehen, wie Besucher mit der Website interagieren,
                    um unseren Service zu verbessern.
                  </p>
                </div>
                <Switch
                  id="analytics"
                  checked={preferences.analytics}
                  onCheckedChange={(checked) =>
                    setPreferences({ ...preferences, analytics: checked })
                  }
                  className="data-[state=checked]:bg-[#708A95]"
                />
              </div>

              <div className="flex items-start justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
                <div className="flex-1 pr-4">
                  <Label htmlFor="marketing" className="font-semibold text-sm mb-1 block">
                    Marketing-Cookies
                  </Label>
                  <p className="text-xs text-gray-600 leading-relaxed">
                    Werden verwendet, um Besuchern relevante Werbung und Marketing-Kampagnen anzuzeigen.
                  </p>
                </div>
                <Switch
                  id="marketing"
                  checked={preferences.marketing}
                  onCheckedChange={(checked) =>
                    setPreferences({ ...preferences, marketing: checked })
                  }
                  className="data-[state=checked]:bg-[#708A95]"
                />
              </div>
            </div>
          </div>

          <DialogFooter className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setShowSettings(false)}
              className="text-sm"
            >
              Abbrechen
            </Button>
            <Button
              onClick={handleSavePreferences}
              className="bg-[#708A95] hover:bg-[#62808A] text-white text-sm"
            >
              Einstellungen speichern
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
