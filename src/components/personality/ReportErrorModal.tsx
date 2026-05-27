"use client";

import { useState } from "react";
import { AlertTriangle, X, Check } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ReportErrorModalProps {
  personalityName: string;
}

export function ReportErrorModal({ personalityName }: ReportErrorModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;
    setSubmitted(true);
    setTimeout(() => {
      setIsOpen(false);
      setSubmitted(false);
      setMessage("");
    }, 2500);
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 text-sm text-gris-moyen hover:text-primary transition-colors"
      >
        <AlertTriangle className="h-4 w-4" />
        Signaler une erreur ou proposer une modification
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-noir/50"
            onClick={() => {
              if (!submitted) {
                setIsOpen(false);
              }
            }}
          />

          <div className="relative w-full max-w-lg rounded-xl bg-blanc p-6 shadow-2xl">
            <button
              onClick={() => setIsOpen(false)}
              className="absolute right-4 top-4 rounded-full p-1 hover:bg-gris-clair transition-colors"
            >
              <X className="h-5 w-5 text-gris-moyen" />
            </button>

            <div className="space-y-1 mb-6">
              <h3 className="font-serif text-xl font-semibold text-noir">
                Signaler une erreur
              </h3>
              <p className="text-sm text-gris-moyen">
                Concernant la fiche de{" "}
                <span className="font-medium text-noir">{personalityName}</span>
              </p>
            </div>

            {submitted ? (
              <div className="flex flex-col items-center py-8 text-center">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
                  <Check className="h-6 w-6 text-green-600" />
                </div>
                <p className="font-medium text-noir">
                  Merci pour votre signalement !
                </p>
                <p className="mt-1 text-sm text-gris-moyen">
                  Nous examinerons votre message dans les plus brefs délais.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label
                    htmlFor="report-message"
                    className="block text-sm font-medium text-noir mb-1.5"
                  >
                    Votre message
                  </label>
                  <textarea
                    id="report-message"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Décrivez l'erreur ou la modification souhaitée..."
                    rows={5}
                    className="w-full resize-none rounded-lg border border-gris-bordure p-3 text-sm text-noir placeholder:text-gris-moyen focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                    required
                  />
                </div>
                <div className="flex justify-end gap-3">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => setIsOpen(false)}
                  >
                    Annuler
                  </Button>
                  <Button type="submit" disabled={!message.trim()}>
                    Envoyer
                  </Button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}
