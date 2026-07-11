import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Filter } from "lucide-react";
import proposalsData from "../data/proposals.json";
import type { Proposal } from "../types";
import ProposalList from "../components/proposals/ProposalList";
import Hero from "../components/layout/Hero";
import StatsSection from "../components/layout/StatsSection";

const proposals = proposalsData as Proposal[];
const categories = ["all", "campus-life", "infrastructure", "academics", "finance", "sustainability"] as const;

export default function Home() {
  const [category, setCategory] = useState<string>("all");

  const filtered = useMemo(
    () => category === "all" ? proposals : proposals.filter((p) => p.category === category),
    [category]
  );

  return (
    <div>
      <Hero />
      <StatsSection />

      <section id="proposals" className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <h2 className="mb-2 flex items-center gap-2 text-2xl font-bold text-text">
            <Filter className="h-6 w-6" />
            Active Proposals
          </h2>
          <p className="mb-8 text-muted">
            Browse current proposals and cast your vote
          </p>

          <div className="mb-8 flex flex-wrap gap-2">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={`rounded-xl px-4 py-2 text-sm font-medium transition-all duration-200 ${
                  category === cat
                    ? "bg-primary-500 text-white shadow-sm shadow-primary-500/20"
                    : "border border-border bg-surface text-muted hover:border-primary-200 hover:bg-primary-50 hover:text-primary-500"
                }`}
              >
                {cat === "all" ? "All" : cat.replace("-", " ")}
              </button>
            ))}
          </div>

          <ProposalList proposals={filtered} />
        </motion.div>
      </section>
    </div>
  );
}
