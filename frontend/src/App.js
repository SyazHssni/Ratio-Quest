import "@/App.css";
import { BrowserRouter, Routes, Route, useLocation, Navigate } from "react-router-dom";
import { AnimatePresence, MotionConfig, motion, useReducedMotion } from "framer-motion";
import { ProgressProvider } from "./context/ProgressContext";
import { AudioProvider } from "./audio/AudioContext";
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
import Year6Page from "./pages/Year6Page";
import { CourseProvider } from "./context/CourseContext";

function AppRoutes() {
  const loc = useLocation();
  const reduceMotion = useReducedMotion();
  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={loc.pathname}
        initial={{ opacity: 0, y: reduceMotion ? 0 : 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: reduceMotion ? 0 : -5 }}
        transition={{ duration: reduceMotion ? 0.01 : 0.16, ease: "easeOut" }}
      >
        <ErrorBoundary key={loc.pathname}>
          <Routes location={loc}>
            <Route path="/" element={<HomePage />} />
            <Route path="/year-6" element={<Navigate to="/learn?year=6" replace />} />
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
      </motion.div>
    </AnimatePresence>
  );
}

function App() {
  return (
    <MotionConfig reducedMotion="user">
      <AudioProvider>
        <ProgressProvider>
          <BrowserRouter>
            <CourseProvider>
              <AppShell>
                <AppRoutes />
              </AppShell>
            </CourseProvider>
          </BrowserRouter>
          <Toaster position="top-center" richColors />
        </ProgressProvider>
      </AudioProvider>
    </MotionConfig>
  );
}

export default App;
