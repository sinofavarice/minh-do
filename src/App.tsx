import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { Placeholder } from "./pages/Placeholder";
import { Portfolio } from "./pages/Portfolio";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/archive" element={<Placeholder title="archive" />} />
        <Route path="/info" element={<Placeholder title="info" />} />
        <Route path="/about" element={<Navigate to="/info" replace />} />
        {/* / and /work share one mounted Portfolio — no remount jank */}
        <Route path="*" element={<Portfolio />} />
      </Routes>
    </BrowserRouter>
  );
}
