"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Input } from "@/components/ui/input";
import { useState, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Search, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface MissingPersonSearchProps {
  onSelect: (personId: Id<"missingPersons">) => void;
  selectedId?: Id<"missingPersons"> | null;
}

export function MissingPersonSearch({ onSelect, selectedId }: MissingPersonSearchProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [showResults, setShowResults] = useState(false);

  // Get all missing persons
  const missingPersons = useQuery(api.missingPersons.list, {});

  // Filter and sort by search term
  const filteredPersons = useMemo(() => {
    if (!missingPersons || !searchTerm.trim()) {
      return [];
    }

    const term = searchTerm.toLowerCase().trim();
    return missingPersons
      .filter((person) => person.status === "missing")
      .filter((person) => person.name.toLowerCase().includes(term))
      .slice(0, 5); // Limit to 5 results
  }, [missingPersons, searchTerm]);

  const selectedPerson = useMemo(() => {
    if (!selectedId || !missingPersons) return null;
    return missingPersons.find((p) => p._id === selectedId);
  }, [selectedId, missingPersons]);

  const handleSelect = (personId: Id<"missingPersons">) => {
    onSelect(personId);
    setSearchTerm("");
    setShowResults(false);
  };

  if (selectedPerson) {
    return (
      <div className="space-y-3">
        <Card className="bg-blue-400/50 border border-blue-500/50 shadow-none">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <CheckCircle2 className="size-4 text-primary" />
                  <CardTitle className="text-sm text-black dark:text-white font-medium">Referencing Missing Person Report</CardTitle>
                </div>
                <CardDescription className="text-lg text-black dark:text-white font-medium">{selectedPerson.name}</CardDescription>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onSelect(null as any)}
                className="text-xs cursor-pointer text-black dark:text-white hover:text-foreground hover:bg-blue-500/80"
              >
                Change
              </Button>
            </div>
          </CardHeader>
          <CardContent className="text-sm space-y-1">
            <p>
              <span className="font-medium">Location:</span> {selectedPerson.lastKnownLocationParish}
              {selectedPerson.lastKnownLocationCity && `, ${selectedPerson.lastKnownLocationCity}`}
            </p>
            {selectedPerson.dateOfBirth && (
              <p>
                <span className="font-medium">Date of Birth:</span> {selectedPerson.dateOfBirth}
              </p>
            )}
            {selectedPerson.height && (
              <p>
                <span className="font-medium">Height:</span> {selectedPerson.height}
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Search for missing person by name..."
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setShowResults(true);
          }}
          onFocus={() => setShowResults(true)}
          className="pl-9 text-base"
        />
      </div>

      {showResults && searchTerm.trim() && (
        <div className="border rounded-md bg-background shadow-md max-h-64 overflow-y-auto">
          {filteredPersons.length === 0 ? (
            <div className="p-4 text-sm text-center text-muted-foreground">
              No matching missing persons found
            </div>
          ) : (
            <div className="divide-y">
              {filteredPersons.map((person) => (
                <button
                  key={person._id}
                  onClick={() => handleSelect(person._id)}
                  className="w-full text-left p-3 hover:bg-accent transition-colors"
                >
                  <div className="font-medium">{person.name}</div>
                  <div className="text-sm text-muted-foreground">
                    {person.lastKnownLocationParish}
                    {person.lastKnownLocationCity && `, ${person.lastKnownLocationCity}`}
                  </div>
                  {person.dateOfBirth && (
                    <div className="text-xs text-muted-foreground mt-1">
                      DOB: {person.dateOfBirth}
                    </div>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
