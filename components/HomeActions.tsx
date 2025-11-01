"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { UserPlus, CheckCircle } from "lucide-react";
import { motion } from "motion/react";

export function HomeActions() {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.1 }}
      className="grid sm:grid-cols-2 gap-3 mb-6 pb-6 border-b"
    >
      <Button asChild className="w-full h-11">
        <Link href="/report" className="flex items-center justify-center gap-2">
          <UserPlus className="size-4" />
          Report Missing Person
        </Link>
      </Button>
      <Button asChild variant="outline" className="w-full h-11">
        <Link href="/found" className="flex items-center justify-center gap-2">
          <CheckCircle className="size-4" />
          Report Found Person
        </Link>
      </Button>
    </motion.div>
  );
}

