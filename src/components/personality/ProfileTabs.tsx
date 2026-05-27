"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { Timeline } from "@/components/personality/Timeline";
import { Gallery } from "@/components/personality/Gallery";
import type {
  Personality,
  TimelineEvent,
  VideoEntry,
  SourceEntry,
} from "@/types/database.types";
import {
  BookOpen,
  Trophy,
  Clock,
  Image as ImageIcon,
  Video,
  FileText,
  ExternalLink,
} from "lucide-react";

type TabId =
  | "biographie"
  | "realisations"
  | "chronologie"
  | "galerie"
  | "videos"
  | "sources";

interface Tab {
  id: TabId;
  label: string;
  icon: React.ElementType;
}

const TABS: Tab[] = [
  { id: "biographie", label: "Biographie", icon: BookOpen },
  { id: "realisations", label: "Réalisations", icon: Trophy },
  { id: "chronologie", label: "Chronologie", icon: Clock },
  { id: "galerie", label: "Galerie", icon: ImageIcon },
  { id: "videos", label: "Vidéos", icon: Video },
  { id: "sources", label: "Sources", icon: FileText },
];

interface ProfileTabsProps {
  personality: Personality;
  timelineEvents: TimelineEvent[];
}

function RenderFormattedText({ text }: { text: string }) {
  const isHtml = /<[a-z][\s\S]*>/i.test(text);

  if (isHtml) {
    return (
      <div
        className="prose-profile max-w-none text-[15px] leading-[1.85] text-noir/85 [&>p]:mb-5 [&>p:first-child]:first-letter:float-left [&>p:first-child]:first-letter:mr-2 [&>p:first-child]:first-letter:font-serif [&>p:first-child]:first-letter:text-5xl [&>p:first-child]:first-letter:font-bold [&>p:first-child]:first-letter:text-primary [&>p:first-child]:first-letter:leading-none"
        dangerouslySetInnerHTML={{ __html: text }}
      />
    );
  }

  const paragraphs = text.split("\n\n");

  return (
    <div className="prose-profile space-y-5 max-w-none">
      {paragraphs.map((paragraph, i) => {
        const lines = paragraph.split("\n");
        const isList = lines.every(
          (line) => line.startsWith("- ") || line.trim() === ""
        );

        if (isList) {
          return (
            <ul key={i} className="space-y-2 pl-0">
              {lines
                .filter((line) => line.startsWith("- "))
                .map((line, j) => (
                  <li
                    key={j}
                    className="flex gap-3 text-[15px] leading-[1.75] text-noir/85"
                  >
                    <span className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                    <span>{line.replace(/^- /, "")}</span>
                  </li>
                ))}
            </ul>
          );
        }

        return (
          <p
            key={i}
            className={cn(
              "text-[15px] leading-[1.85] text-noir/85",
              i === 0 && "first-letter:float-left first-letter:mr-2 first-letter:font-serif first-letter:text-5xl first-letter:font-bold first-letter:text-primary first-letter:leading-none"
            )}
          >
            {paragraph}
          </p>
        );
      })}
    </div>
  );
}

function EmptyTabContent({ message, icon: Icon }: { message: string; icon: React.ElementType }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gris-clair text-gris-moyen">
        <Icon className="h-6 w-6" />
      </div>
      <p className="max-w-sm text-sm leading-relaxed text-gris-moyen">{message}</p>
    </div>
  );
}

function SourceTypeBadge({ type }: { type: SourceEntry["type"] }) {
  const labels: Record<SourceEntry["type"], string> = {
    livre: "Livre",
    article: "Article",
    documentaire: "Documentaire",
    archive: "Archive",
    web: "Web",
  };

  return (
    <span className="inline-flex items-center rounded-full bg-primary-light px-2.5 py-0.5 text-[11px] font-semibold text-primary uppercase tracking-wide">
      {labels[type]}
    </span>
  );
}

export function ProfileTabs({
  personality,
  timelineEvents,
}: ProfileTabsProps) {
  const [activeTab, setActiveTab] = useState<TabId>("biographie");
  const activeTabData = TABS.find((t) => t.id === activeTab)!;

  return (
    <div className="overflow-hidden rounded-2xl border border-gris-bordure/80 bg-blanc shadow-[0_8px_40px_-16px_rgba(15,15,18,0.12)]">
      {/* Tab navigation */}
      <div className="sticky top-0 z-10 border-b border-gris-bordure/80 bg-blanc/95 backdrop-blur-md">
        <nav
          className="flex gap-1 overflow-x-auto p-2 scrollbar-hide"
          aria-label="Onglets"
        >
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "flex shrink-0 items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition-all duration-200",
                  isActive
                    ? "bg-noir text-white shadow-sm"
                    : "text-gris-moyen hover:bg-gris-clair hover:text-noir"
                )}
              >
                <Icon className="h-4 w-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab content */}
      <div className="px-6 py-8 sm:px-8 sm:py-10 lg:px-10">
        <div className="mb-6 flex items-center gap-3 border-b border-gris-bordure/60 pb-5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-light text-primary">
            <activeTabData.icon className="h-5 w-5" />
          </div>
          <div>
            <h2 className="font-serif text-xl font-bold text-noir">
              {activeTabData.label}
            </h2>
            <p className="text-sm text-gris-moyen">
              {personality.full_name}
            </p>
          </div>
        </div>

        <div className="animate-in">
          {activeTab === "biographie" && (
            personality.full_bio ? (
              <RenderFormattedText text={personality.full_bio} />
            ) : (
              <EmptyTabContent icon={BookOpen} message="Biographie non disponible pour le moment." />
            )
          )}

          {activeTab === "realisations" && (
            personality.achievements ? (
              <RenderFormattedText text={personality.achievements} />
            ) : (
              <EmptyTabContent icon={Trophy} message="Réalisations non disponibles pour le moment." />
            )
          )}

          {activeTab === "chronologie" && (
            timelineEvents.length > 0 ? (
              <Timeline events={timelineEvents} />
            ) : (
              <EmptyTabContent icon={Clock} message="Chronologie non disponible pour le moment." />
            )
          )}

          {activeTab === "galerie" && (
            personality.gallery_urls.length > 0 ? (
              <Gallery
                urls={personality.gallery_urls}
                alt={personality.full_name}
              />
            ) : (
              <EmptyTabContent icon={ImageIcon} message="Aucune photo disponible dans la galerie." />
            )
          )}

          {activeTab === "videos" && (
            personality.video_urls.length > 0 ? (
              <VideoGrid videos={personality.video_urls} />
            ) : (
              <EmptyTabContent icon={Video} message="Aucune vidéo disponible pour le moment." />
            )
          )}

          {activeTab === "sources" && (
            personality.sources.length > 0 ? (
              <SourcesList sources={personality.sources} />
            ) : (
              <EmptyTabContent icon={FileText} message="Aucune source référencée pour le moment." />
            )
          )}
        </div>
      </div>
    </div>
  );
}

function VideoGrid({ videos }: { videos: VideoEntry[] }) {
  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
      {videos.map((video, index) => (
        <div
          key={index}
          className="overflow-hidden rounded-xl border border-gris-bordure/80 bg-gris-clair/30"
        >
          <div className="aspect-video overflow-hidden bg-noir">
            <iframe
              src={`https://www.youtube.com/embed/${video.youtube_id}`}
              title={video.title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="h-full w-full"
            />
          </div>
          <div className="space-y-1 p-4">
            <h4 className="text-sm font-semibold text-noir">{video.title}</h4>
            {video.description && (
              <p className="text-xs leading-relaxed text-gris-moyen">
                {video.description}
              </p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

function SourcesList({ sources }: { sources: SourceEntry[] }) {
  return (
    <div className="max-w-none space-y-3">
      {sources.map((source, index) => (
        <div
          key={index}
          className="group flex items-start justify-between gap-4 rounded-xl border border-gris-bordure/80 bg-gris-clair/20 p-4 transition-colors hover:border-primary/30 hover:bg-primary-light/30"
        >
          <div className="flex min-w-0 items-start gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blanc text-gris-moyen group-hover:text-primary transition-colors">
              <FileText className="h-4 w-4" />
            </div>
            <div className="min-w-0 space-y-1.5">
              <p className="text-sm font-medium text-noir">{source.title}</p>
              <SourceTypeBadge type={source.type} />
            </div>
          </div>
          {source.url && (
            <a
              href={source.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-gris-bordure bg-blanc text-gris-moyen transition-all hover:border-primary hover:bg-primary hover:text-white"
              aria-label={`Ouvrir ${source.title}`}
            >
              <ExternalLink className="h-4 w-4" />
            </a>
          )}
        </div>
      ))}
    </div>
  );
}
