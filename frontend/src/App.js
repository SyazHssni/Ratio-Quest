import "@/App.css";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { MotionConfig } from "framer-motion";
import { ProgressProvider } from "./context/ProgressContext";
import { AppShell } from "./components/rq/AppShell";
import { ErrorBoundary } from "./components/rq/ErrorBoundary";
import { Toaster } from "./components/ui/sonner";
import HomePage from "./pages/HomePage";
import LearnPage from "./pages/LearnPage";
import LessonPage from "./pages/LessonPage";
import LabPage from "./pages/LabPage";
import PracticePage from "./pages/PracticePage";
import { GamesHub, ZonePage, GamePage } from "./pages/GamesPage";
import FinalPage from "./pages/FinalPage";
import ProgressPage from "./pages/ProgressPage";
import TeacherPage from "./pages/TeacherPage";
import NotFoundPage from "./pages/NotFoundPage";

function AppRoutes() {
  const loc = useLocation();
  return (
    <ErrorBoundary key={loc.pathname}>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/learn" element={<LearnPage />} />
        <Route path="/learn/:lessonId" element={<LessonPage />} />
        <Route path="/lab" element={<LabPage />} />
        <Route path="/practice" element={<PracticePage />} />
        <Route path="/games" element={<GamesHub />} />
        <Route path="/games/zone/:zoneId" element={<ZonePage />} />
        <Route path="/games/:gameId" element={<GamePage />} />
        <Route path="/final" element={<FinalPage />} />
        <Route path="/progress" element={<ProgressPage />} />
        <Route path="/teacher" element={<TeacherPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </ErrorBoundary>
  );
}

function App() {
  return (
    <MotionConfig reducedMotion="user">
      <ProgressProvider>
        <BrowserRouter>
          <AppShell>
            <AppRoutes />
          </AppShell>
        </BrowserRouter>
        <Toaster position="top-center" richColors />
      </ProgressProvider>
    </MotionConfig>
  );
}

export default App;
