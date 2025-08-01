"use client";

import { useEffect, useState } from "react";
import { ChevronRight, List } from "lucide-react";

interface TableOfContentsItem {
  id: string;
  text: string;
  level: number;
}

interface EnhancedTableOfContentsProps {
  items: TableOfContentsItem[];
  variant?: "sidebar" | "inline";
  title?: string;
  sticky?: boolean;
}

export function EnhancedTableOfContents({
  items,
  variant = "sidebar",
  title = "Table of Contents",
  sticky = false,
}: EnhancedTableOfContentsProps) {
  const [activeId, setActiveId] = useState<string>("");

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      { rootMargin: "-80px 0px -80px 0px" },
    );

    items.forEach((item) => {
      const element = document.getElementById(item.id);
      if (element) {
        observer.observe(element);
      }
    });

    return () => observer.disconnect();
  }, [items]);

  const handleClick = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  const getIndentClass = (level: number) => {
    switch (level) {
      case 1:
        return "ml-0";
      case 2:
        return "ml-4";
      case 3:
        return "ml-8";
      case 4:
        return "ml-12";
      default:
        return "ml-0";
    }
  };

  const getTextSize = (level: number) => {
    switch (level) {
      case 1:
        return "text-sm font-semibold";
      case 2:
        return "text-sm";
      case 3:
        return "text-xs";
      case 4:
        return "text-xs";
      default:
        return "text-sm";
    }
  };

  return (
    <div
      className={`${variant === "sidebar" ? "p-6" : "p-4"} ${sticky ? "sticky top-20" : ""}`}
    >
      <div className="mb-4 flex items-center gap-2">
        <List className="h-5 w-5 text-cyan-400" />
        <h3 className="font-orbitron text-lg font-bold text-white">{title}</h3>
      </div>
      <nav className="space-y-2">
        {items.map((item) => (
          <button
            key={item.id}
            onClick={() => handleClick(item.id)}
            className={`block w-full cursor-pointer rounded px-2 py-1 text-left transition-colors duration-200 ${getIndentClass(item.level)} ${getTextSize(item.level)} ${
              activeId === item.id
                ? "border-l-2 border-cyan-400 bg-cyan-400/10 text-cyan-400"
                : "text-gray-400 hover:bg-gray-800/50 hover:text-cyan-300"
            } `}
          >
            <div className="flex items-center gap-2">
              <ChevronRight className="h-3 w-3 flex-shrink-0" />
              <span className="font-rajdhani">{item.text}</span>
            </div>
          </button>
        ))}
      </nav>
    </div>
  );
}
