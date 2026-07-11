import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Clock, ArrowRight, CircleCheckBig, CircleX, Clock3 } from "lucide-react";
import type { Proposal } from "../../types";

interface Props {
  proposal: Proposal;
  index?: number;
}

const categoryColors: Record<string, { bg: string; text: string; border: string }> = {
  "campus-life": { bg: "bg-blue-50", text: "text-blue-600", border: "border-blue-200" },
  infrastructure: { bg: "bg-purple-50", text: "text-purple-600", border: "border-purple-200" },
  academics: { bg: "bg-emerald-50", text: "text-emerald-600", border: "border-emerald-200" },
  finance: { bg: "bg-amber-50", text: "text-amber-600", border: "border-amber-200" },
  sustainability: { bg: "bg-green-50", text: "text-green-600", border: "border-green-200" },
};

function getStatus(endsAt: string) {
  const now = new Date();
  const end = new Date(endsAt);
  const diff = end.getTime() - now.getTime();
  const days = Math.ceil(diff / (1000 * 60 * 60 * 24));

  if (days <= 0) return { label: "Closed", color: "bg-gray-100 text-gray-500 border-gray-200", icon: CircleX };
  if (days <= 3) return { label: "Closing Soon", color: "bg-amber-50 text-amber-600 border-amber-200", icon: Clock3 };
  return { label: "Open", color: "bg-emerald-50 text-emerald-600 border-emerald-200", icon: CircleCheckBig };
}

export default function ProposalCard({ proposal, index = 0 }: Props) {
  const cat = categoryColors[proposal.category] || categoryColors["campus-life"];
  const status = getStatus(proposal.endsAt);
  const StatusIcon = status.icon;
  const daysLeft = Math.max(
    0,
    Math.ceil(
      (new Date(proposal.endsAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
    )
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.08 }}
    >
      <Link
        to={`/proposal/${proposal.id}`}
        className="card group block cursor-pointer"
      >
        <div className="mb-3 flex items-center gap-2">
          <span className={`inline-flex items-center rounded-lg border px-2.5 py-0.5 text-xs font-medium ${cat.bg} ${cat.text} ${cat.border}`}>
            {proposal.category.replace("-", " ")}
          </span>
          <span className={`inline-flex items-center gap-1 rounded-lg border px-2.5 py-0.5 text-xs font-medium ${status.color}`}>
            <StatusIcon className="h-3 w-3" />
            {status.label}
          </span>
        </div>

        <h3 className="mb-2 text-lg font-semibold text-text transition-colors group-hover:text-primary-500">
          {proposal.title}
        </h3>

        <p className="mb-4 line-clamp-2 text-sm leading-relaxed text-muted">
          {proposal.description}
        </p>

        <div className="flex items-center justify-between border-t border-border pt-3 text-xs text-muted">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" />
              {daysLeft > 0 ? `${daysLeft}d left` : "Ended"}
            </span>
            <span>by {proposal.author}</span>
          </div>
          <ArrowRight className="h-4 w-4 text-primary-500 opacity-0 transition-all duration-200 group-hover:opacity-100" />
        </div>
      </Link>
    </motion.div>
  );
}
