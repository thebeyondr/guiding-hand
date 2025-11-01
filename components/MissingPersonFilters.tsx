"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { JAMAICAN_PARISHES } from "@/lib/constants";
import { motion } from "motion/react";

interface MissingPersonFiltersProps {
  searchName: string;
  parish: string;
  onSearchChange: (value: string) => void;
  onParishChange: (value: string) => void;
}

export function MissingPersonFilters({
  searchName,
  parish,
  onSearchChange,
  onParishChange,
}: MissingPersonFiltersProps) {
  const hasActiveFilters = searchName || (parish && parish !== "all");

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.2 }}
      className="mb-8"
    >
      <div className="grid md:grid-cols-2 gap-4 mb-4">
        <Input
          id="search"
          type="text"
          placeholder="Search by name…"
          value={searchName}
          onChange={(e) => onSearchChange(e.target.value)}
          autoFocus
          className="text-base focus-visible:ring-4 focus-visible:ring-blue-500/60 focus-visible:border-blue-500"
          aria-label="Search missing persons by name"
        />

        <Select value={parish} onValueChange={onParishChange}>
          <SelectTrigger
            id="parish"
            className="text-base focus-visible:ring-4 focus-visible:ring-blue-500/60 focus-visible:border-blue-500"
            aria-label="Filter by parish"
          >
            <SelectValue placeholder="All parishes" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all" className="text-base">
              All parishes
            </SelectItem>
            {JAMAICAN_PARISHES.map((p) => (
              <SelectItem key={p} value={p} className="text-base">
                {p}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {hasActiveFilters && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              onSearchChange("");
              onParishChange("all");
            }}
          >
            Clear filters
          </Button>
        </motion.div>
      )}
    </motion.div>
  );
}

