"use client";

import { useState } from "react";
import { Link2, MessageCircle, Share2, Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface ShareButtonsProps {
  url: string;
  title: string;
}

export function ShareButtons({ url, title }: ShareButtonsProps) {
  const [copied, setCopied] = useState(false);

  const fullUrl = typeof window !== "undefined"
    ? `${window.location.origin}${url}`
    : url;

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(fullUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback silencieux
    }
  };

  const shareWhatsApp = () => {
    window.open(
      `https://wa.me/?text=${encodeURIComponent(`${title} ${fullUrl}`)}`,
      "_blank"
    );
  };

  const shareFacebook = () => {
    window.open(
      `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(fullUrl)}`,
      "_blank"
    );
  };

  const shareTwitter = () => {
    window.open(
      `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(fullUrl)}`,
      "_blank"
    );
  };

  const buttons = [
    { label: "WhatsApp", icon: MessageCircle, onClick: shareWhatsApp },
    { label: "Facebook", icon: Share2, onClick: shareFacebook },
    { label: "X", icon: Share2, onClick: shareTwitter },
    { label: copied ? "Copié !" : "Copier", icon: copied ? Check : Link2, onClick: copyToClipboard, active: copied },
  ];

  return (
    <div className="flex flex-wrap items-center gap-3">
      <span className="text-sm font-medium text-gris-moyen">Partager</span>
      <div className="flex flex-wrap items-center gap-2">
        {buttons.map(({ label, icon: Icon, onClick, active }) => (
          <button
            key={label}
            onClick={onClick}
            aria-label={label}
            title={label}
            className={cn(
              "group flex h-10 w-10 items-center justify-center rounded-full border border-gris-bordure bg-blanc text-gris-moyen transition-all duration-200",
              "hover:border-primary hover:bg-primary hover:text-white hover:shadow-md hover:shadow-primary/20",
              active && "border-primary bg-primary text-white"
            )}
          >
            <Icon className="h-4 w-4" />
          </button>
        ))}
      </div>
    </div>
  );
}
