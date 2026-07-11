import { motion } from "framer-motion";
import { BarChart3, CircleCheckBig, CircleX } from "lucide-react";
import type { Proposal } from "../types";
import ResultBar from "../components/ui/ResultBar";

interface Props {
  proposals: Proposal[];
}

const mockResults = [
  { yes: 128, no: 34 },
  { yes: 95, no: 12 },
  { yes: 67, no: 45 },
  { yes: 210, no: 28 },
  { yes: 83, no: 61 },
];

export default function Results({ proposals }: Props) {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <h1 className="mb-3 flex items-center gap-2 text-3xl font-extrabold text-text">
          <BarChart3 className="h-7 w-7" />
          Voting Results
        </h1>
        <p className="mb-10 text-muted">
          Historical results of all past and active proposals.
        </p>
      </motion.div>

      <div className="space-y-4">
        {proposals.map((proposal, i) => {
          const result = mockResults[i % mockResults.length];
          const total = result.yes + result.no;
          const passed = result.yes > result.no;

          return (
            <motion.div
              key={proposal.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: i * 0.06 }}
              className="card"
            >
              <div className="mb-1 flex items-center justify-between">
                <h3 className="font-semibold text-text">{proposal.title}</h3>
                <span
                  className={`inline-flex items-center gap-1 rounded-lg px-2 py-0.5 text-xs font-medium ${
                    passed
                      ? "bg-success/10 text-success border border-success/20"
                      : "bg-error/10 text-error border border-error/20"
                  }`}
                >
                  {passed ? <CircleCheckBig className="h-3 w-3" /> : <CircleX className="h-3 w-3" />}
                  {passed ? "Passed" : "Rejected"}
                </span>
              </div>
              <p className="mb-4 text-xs text-muted">
                {total} total votes · by {proposal.author}
              </p>
              <ResultBar label="Yes" count={result.yes} total={total} color="bg-success" />
              <div className="mt-2" />
              <ResultBar label="No" count={result.no} total={total} color="bg-error" />
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
