import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./components/layout/Navbar";
import Footer from "./components/layout/Footer";
import Home from "./pages/Home";
import ProposalPage from "./pages/ProposalPage";
import Results from "./pages/Results";
import About from "./pages/About";
import proposalsData from "./data/proposals.json";
import type { Proposal } from "./types";

const proposals = proposalsData as Proposal[];

function AppContent() {

  return (
    <div className="flex min-h-screen flex-col bg-bg">
      <Navbar />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/proposal/:id" element={<ProposalPage />} />
          <Route path="/results" element={<Results proposals={proposals} />} />
          <Route path="/about" element={<About />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}
