"use client";

import { Skeleton } from "@/components/ui/skeleton";
import {
  CheckCircle,
  AlertCircle,
  FileText,
  Sparkles,
} from "lucide-react";

interface TalentAnalysisSectionProps {
  title: string;
  icon: "overview" | "pros" | "cons";
  content?: string | string[];
  isLoading?: boolean;
}

const iconMap = {
  overview: FileText,
  pros: CheckCircle,
  cons: AlertCircle,
};

const colorMap = {
  overview: {
    bg: "bg-cyan-500/10",
    border: "border-cyan-500/30",
    text: "text-cyan-400",
    iconBg: "bg-cyan-500/20",
  },
  pros: {
    bg: "bg-emerald-500/10",
    border: "border-emerald-500/30",
    text: "text-emerald-400",
    iconBg: "bg-emerald-500/20",
  },
  cons: {
    bg: "bg-amber-500/10",
    border: "border-amber-500/30",
    text: "text-amber-400",
    iconBg: "bg-amber-500/20",
  },
};

export function TalentAnalysisSection({
  title,
  icon,
  content,
  isLoading = false,
}: TalentAnalysisSectionProps) {
  const Icon = iconMap[icon];
  const colors = colorMap[icon];

  if (isLoading) {
    return (
      <div className={`rounded-xl border ${colors.border} ${colors.bg} p-4`}>
        <div className="mb-3 flex items-center gap-2">
          <div className={`rounded-lg ${colors.iconBg} p-2`}>
            <Sparkles className={`h-4 w-4 ${colors.text} animate-pulse`} />
          </div>
          <Skeleton className="h-5 w-32 bg-gray-700" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-4 w-full bg-gray-700" />
          <Skeleton className="h-4 w-5/6 bg-gray-700" />
          <Skeleton className="h-4 w-4/5 bg-gray-700" />
        </div>
      </div>
    );
  }

  const isEmpty =
    !content ||
    (Array.isArray(content) && content.length === 0) ||
    (typeof content === "string" && content.trim() === "");

  return (
    <div className={`rounded-xl border ${colors.border} ${colors.bg} p-4`}>
      <div className="mb-3 flex items-center gap-2">
        <div className={`rounded-lg ${colors.iconBg} p-2`}>
          <Icon className={`h-4 w-4 ${colors.text}`} />
        </div>
        <h4 className={`font-semibold ${colors.text}`}>{title}</h4>
      </div>

      {isEmpty ? (
        <p className="text-sm italic text-gray-500">
          No information available
        </p>
      ) : Array.isArray(content) ? (
        <ul className="space-y-2">
          {content.map((item, index) => (
            <li
              key={index}
              className="flex items-start gap-2 text-sm text-gray-300"
            >
              <span className={`mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full ${colors.text.replace("text-", "bg-")}`} />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm leading-relaxed text-gray-300">{content}</p>
      )}
    </div>
  );
}
