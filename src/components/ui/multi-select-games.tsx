"use client";

import React, { useState } from "react";
import { Check, ChevronsUpDown, Plus, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";

export interface Game {
  id: string;
  name: string;
  short_name: string;
  icon?: string | null;
  color?: string | null;
  is_custom?: boolean;
}

export interface CustomGame {
  name: string;
  short_name: string;
  icon?: string;
  color?: string;
}

interface MultiSelectGamesProps {
  availableGames: Game[];
  selectedGameIds: string[];
  customGames: CustomGame[];
  onSelectedGamesChange: (gameIds: string[]) => void;
  onCustomGamesChange: (customGames: CustomGame[]) => void;
  placeholder?: string;
  disabled?: boolean;
}

export function MultiSelectGames({
  availableGames,
  selectedGameIds,
  customGames,
  onSelectedGamesChange,
  onCustomGamesChange,
  placeholder = "Select games...",
  disabled = false,
}: MultiSelectGamesProps) {
  const [open, setOpen] = useState(false);
  const [showCustomGameForm, setShowCustomGameForm] = useState(false);
  const [customGameForm, setCustomGameForm] = useState<CustomGame>({
    name: "",
    short_name: "",
    icon: "",
    color: "",
  });
  const [iconUrlError, setIconUrlError] = useState<string>("");

  const selectedGames = availableGames.filter((game) =>
    selectedGameIds.includes(game.id)
  );

  // Validate URL function
  const validateIconUrl = (url: string): string => {
    if (!url || url.trim() === '') {
      return ''; // Empty is valid (optional field)
    }
    try {
      new URL(url.trim());
      return ''; // Valid URL
    } catch {
      return 'Please enter a valid URL (e.g., https://example.com/icon.png)';
    }
  };

  const handleGameSelect = (gameId: string) => {
    const newSelection = selectedGameIds.includes(gameId)
      ? selectedGameIds.filter((id) => id !== gameId)
      : [...selectedGameIds, gameId];
    onSelectedGamesChange(newSelection);
  };

  const handleAddCustomGame = () => {
    if (!customGameForm.name.trim() || !customGameForm.short_name.trim()) {
      return;
    }

    // Validate icon URL
    const iconError = validateIconUrl(customGameForm.icon ?? '');
    if (iconError) {
      setIconUrlError(iconError);
      return;
    }

    const newCustomGame: CustomGame = {
      name: customGameForm.name.trim(),
      short_name: customGameForm.short_name.trim(),
      icon: customGameForm.icon?.trim() ?? undefined,
      color: customGameForm.color?.trim() ?? undefined,
    };

    onCustomGamesChange([...customGames, newCustomGame]);
    setCustomGameForm({ name: "", short_name: "", icon: "", color: "" });
    setIconUrlError("");
    setShowCustomGameForm(false);
  };

  const handleRemoveCustomGame = (index: number) => {
    const updatedCustomGames = customGames.filter((_, i) => i !== index);
    onCustomGamesChange(updatedCustomGames);
  };

  return (
    <div className="space-y-3">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between bg-gray-800 border-gray-700 text-white hover:bg-gray-700"
            disabled={disabled}
          >
            {selectedGames.length > 0 || customGames.length > 0
              ? `${selectedGames.length + customGames.length} game(s) selected`
              : placeholder}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0 bg-gray-800 border-gray-700">
          <Command className="bg-gray-800">
            <CommandInput
              placeholder="Search games..."
              className="bg-gray-800 text-white border-none"
            />
            <CommandList>
              <CommandEmpty>
                <div className="py-6 text-center text-sm text-gray-400">
                  <p>No games found.</p>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setShowCustomGameForm(true)}
                    className="mt-2 bg-gray-700 hover:bg-gray-600 text-white border-gray-600"
                  >
                    <Plus className="h-3 w-3 mr-1" />
                    Add Custom Game
                  </Button>
                </div>
              </CommandEmpty>
              <CommandGroup>
                {availableGames.map((game) => (
                  <CommandItem
                    key={game.id}
                    value={game.name}
                    onSelect={() => handleGameSelect(game.id)}
                    className="text-white hover:bg-gray-700"
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        selectedGameIds.includes(game.id)
                          ? "opacity-100"
                          : "opacity-0"
                      )}
                    />
                    <div className="flex items-center gap-2">
                      {game.icon && (
                        <img
                          src={game.icon}
                          alt={game.name}
                          className="h-4 w-4"
                        />
                      )}
                      <span>{game.name}</span>
                      <span className="text-xs text-gray-400">
                        ({game.short_name})
                      </span>
                    </div>
                  </CommandItem>
                ))}
                <CommandItem
                  onSelect={() => setShowCustomGameForm(true)}
                  className="text-cyan-400 hover:bg-gray-700 cursor-pointer"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add Custom Game
                </CommandItem>
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      {/* Selected Games Display */}
      {(selectedGames.length > 0 || customGames.length > 0) && (
        <div className="space-y-2">
          <Label className="text-gray-300 text-sm">Selected Games:</Label>
          <div className="flex flex-wrap gap-2">
            {selectedGames.map((game) => (
              <Badge
                key={game.id}
                variant="outline"
                className="bg-blue-600/20 text-blue-400 border-blue-500 flex items-center gap-1"
              >
                {game.icon && (
                  <img src={game.icon} alt={game.name} className="h-3 w-3" />
                )}
                {game.name}
                <button
                  type="button"
                  onClick={() => handleGameSelect(game.id)}
                  className="ml-1 hover:text-red-400"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
            {customGames.map((game, index) => (
              <Badge
                key={`custom-${index}`}
                variant="outline"
                className="bg-purple-600/20 text-purple-400 border-purple-500 flex items-center gap-1"
              >
                {game.name}
                <span className="text-xs">({game.short_name})</span>
                <button
                  type="button"
                  onClick={() => handleRemoveCustomGame(index)}
                  className="ml-1 hover:text-red-400"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Custom Game Form */}
      {showCustomGameForm && (
        <div className="border border-gray-700 rounded-lg p-4 bg-gray-800/50">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-white font-medium">Add Custom Game</Label>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => {
                  setShowCustomGameForm(false);
                  setIconUrlError("");
                  setCustomGameForm({ name: "", short_name: "", icon: "", color: "" });
                }}
                className="text-gray-400 hover:text-white"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label htmlFor="custom-game-name" className="text-gray-300 text-sm">
                  Game Name *
                </Label>
                <Input
                  id="custom-game-name"
                  placeholder="e.g., League of Legends"
                  value={customGameForm.name}
                  onChange={(e) =>
                    setCustomGameForm((prev) => ({ ...prev, name: e.target.value }))
                  }
                  className="bg-gray-700 border-gray-600 text-white"
                />
              </div>
              
              <div className="space-y-1">
                <Label htmlFor="custom-game-short" className="text-gray-300 text-sm">
                  Short Name *
                </Label>
                <Input
                  id="custom-game-short"
                  placeholder="e.g., LoL"
                  value={customGameForm.short_name}
                  onChange={(e) =>
                    setCustomGameForm((prev) => ({ ...prev, short_name: e.target.value }))
                  }
                  className="bg-gray-700 border-gray-600 text-white"
                />
              </div>
              
              <div className="space-y-1">
                <Label htmlFor="custom-game-icon" className="text-gray-300 text-sm">
                  Icon URL (Optional)
                </Label>
                <Input
                  id="custom-game-icon"
                  placeholder="https://example.com/icon.png"
                  value={customGameForm.icon}
                  onChange={(e) => {
                    const value = e.target.value;
                    setCustomGameForm((prev) => ({ ...prev, icon: value }));
                    // Real-time validation
                    const error = validateIconUrl(value);
                    setIconUrlError(error);
                  }}
                  className={`bg-gray-700 border-gray-600 text-white ${
                    iconUrlError ? 'border-red-500 focus:border-red-500' : ''
                  }`}
                />
                {iconUrlError && (
                  <p className="text-red-400 text-xs mt-1">{iconUrlError}</p>
                )}
              </div>
              
              <div className="space-y-1">
                <Label htmlFor="custom-game-color" className="text-gray-300 text-sm">
                  Color (Optional)
                </Label>
                <Input
                  id="custom-game-color"
                  placeholder="#3B82F6"
                  value={customGameForm.color}
                  onChange={(e) =>
                    setCustomGameForm((prev) => ({ ...prev, color: e.target.value }))
                  }
                  className="bg-gray-700 border-gray-600 text-white"
                />
              </div>
            </div>
            
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  setShowCustomGameForm(false);
                  setIconUrlError("");
                  setCustomGameForm({ name: "", short_name: "", icon: "", color: "" });
                }}
                className="border-gray-600 text-gray-300 hover:bg-gray-700"
              >
                Cancel
              </Button>
              <Button
                type="button"
                size="sm"
                onClick={handleAddCustomGame}
                disabled={
                  !customGameForm.name.trim() || 
                  !customGameForm.short_name.trim() || 
                  !!iconUrlError
                }
                className="bg-cyan-600 hover:bg-cyan-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Plus className="h-3 w-3 mr-1" />
                Add Game
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 