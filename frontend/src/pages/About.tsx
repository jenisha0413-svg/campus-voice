import { motion } from "framer-motion";
import { Info, Users, ShieldCheck, GraduationCap } from "lucide-react";

const team = [
  { name: "Blockchain Lead", role: "Smart contract development", icon: ShieldCheck },
  { name: "Frontend Lead", role: "User interface & experience", icon: GraduationCap },
  { name: "Backend Lead", role: "Off-chain infrastructure", icon: Users },
];

const faqs = [
  {
    q: "What is Campus Voice?",
    a: "Campus Voice is a decentralized governance platform that lets students propose ideas and vote on campus matters. Every vote is recorded on the Solana blockchain — transparent, immutable, and verifiable.",
  },
  {
    q: "Why blockchain?",
    a: "Blockchain ensures that no one can tamper with votes. Every record is cryptographically secured and publicly auditable, bringing trust to student governance.",
  },
  {
    q: "Do I need cryptocurrency?",
    a: "No. You just need a Phantom wallet and a small amount of SOL for transaction fees (fractions of a cent). You can get free SOL on the devnet.",
  },
  {
    q: "Can I vote more than once?",
    a: "No. Each wallet can only vote once per proposal. This is enforced on-chain via a Program Derived Address (PDA).",
  },
];

export default function About() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <h1 className="mb-3 flex items-center gap-2 text-3xl font-extrabold text-text">
          <Info className="h-7 w-7" />
          About Campus Voice
        </h1>
        <p className="mb-12 max-w-2xl text-muted">
          A decentralized student governance platform built on Solana for transparent, verifiable campus voting.
        </p>
      </motion.div>

      <div className="mb-16">
        <h2 className="mb-6 text-xl font-bold text-text">Frequently Asked Questions</h2>
        <div className="space-y-3">
          {faqs.map((faq, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: i * 0.08 }}
              className="card"
            >
              <h3 className="mb-2 font-semibold text-text">{faq.q}</h3>
              <p className="text-sm leading-relaxed text-muted">{faq.a}</p>
            </motion.div>
          ))}
        </div>
      </div>

      <div>
        <h2 className="mb-6 text-xl font-bold text-text">Our Team</h2>
        <div className="grid gap-4 sm:grid-cols-3">
          {team.map((member, i) => {
            const Icon = member.icon;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: i * 0.08 }}
                className="card text-center"
              >
                <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-primary-50">
                  <Icon className="h-6 w-6 text-primary-500" />
                </div>
                <p className="font-semibold text-text">{member.name}</p>
                <p className="mt-1 text-xs text-muted">{member.role}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
