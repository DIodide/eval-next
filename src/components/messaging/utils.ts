import { format } from "date-fns";

export function formatLastSeen(date: Date) {
  const now = new Date();
  const diffInMinutes = Math.floor(
    (now.getTime() - new Date(date).getTime()) / (1000 * 60),
  );

  if (diffInMinutes < 1) return "Just now";
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
  if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
  return format(new Date(date), "MMM d");
}

export function getGameIcon(game: string) {
  const icons: Record<string, string> = {
    VALORANT: "🎯",
    "Overwatch 2": "⚡",
    "Rocket League": "🚀",
    "League of Legends": "⚔️",
    "Super Smash Bros. Ultimate": "🥊",
  };
  return icons[game] ?? "🎮";
}

export function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("");
}
