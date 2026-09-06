import { useEffect } from "react";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Redirect, Route, Switch, useLocation } from "wouter";
import { useAuth } from "./_core/hooks/useAuth";
import ErrorBoundary from "./components/ErrorBoundary";
import KioskExperience from "./components/KioskExperience";
import LiveJoinPage from "./pages/LiveJoinPage";
import LoginLandingPage from "./pages/LoginLandingPage";
import MosaicDashboard from "./components/MosaicDashboard";
import RoadmapPage from "./pages/RoadmapPage";
import RoleLoginPage from "./pages/RoleLoginPage";
import StudentAnalytics from "./pages/StudentAnalytics";
import StudentDashboard from "./pages/StudentDashboard";
import StudentPracticePage from "./pages/StudentPracticePage";
import TutorPerksPage from "./pages/TutorPerksPage";
import CreateQuizPage from "./pages/CreateQuizPage";
import StudentQuizReview from "./pages/StudentQuizReview";
import QuizHubPage from "./pages/QuizHubPage";
import ClassDetailsPage from "./pages/ClassDetailsPage";
import { ThemeProvider } from "./contexts/ThemeContext";
import { useGsapInteractions } from "./hooks/useGsapInteractions";

function GsapInteractions() {
  useGsapInteractions();
  return null;
}

function AmbientBackground() {
  return (
    <div className="mosaic-ambient" aria-hidden="true">
      <div className="mosaic-ambient__blob mosaic-ambient__blob--coral" />
      <div className="mosaic-ambient__blob mosaic-ambient__blob--sky" />
      <div className="mosaic-ambient__blob mosaic-ambient__blob--mint" />
    </div>
  );
}

function SessionRedirector() {
  const auth = useAuth();
  const [location, navigate] = useLocation();
  useEffect(() => {
    if (location !== "/" || auth.loading || !auth.user) return;
    const savedIntent = localStorage.getItem("mosaic-role-intent");
    const role = savedIntent === "teacher" || auth.user.role === "admin" || auth.user.role === "educator" ? "teacher" : "student";
    localStorage.removeItem("mosaic-role-intent");
    localStorage.removeItem("mosaic-role-intent-at");
    navigate(role === "teacher" ? "/teacher" : "/student");
  }, [auth.loading, auth.user, location, navigate]);
  return null;
}

function Router() {
  return <><SessionRedirector /><Switch>
    <Route path="/" component={LoginLandingPage} />
    <Route path="/teacher" component={MosaicDashboard} />
    <Route path="/educator"><Redirect to="/teacher" /></Route>
    <Route path="/teacher/quiz/create" component={CreateQuizPage} />
    <Route path="/teacher/quiz" component={QuizHubPage} />
    <Route path="/teacher/class" component={ClassDetailsPage} />
    <Route path="/login/educator"><Redirect to="/" /></Route>
    <Route path="/login/student"><Redirect to="/" /></Route>
    <Route path="/login/tutor"><RoleLoginPage role="tutor" /></Route>
    <Route path="/tutor/perks" component={TutorPerksPage} />
    <Route path="/student" component={StudentDashboard} />
    <Route path="/student/analytics" component={StudentAnalytics} />
    <Route path="/student/review" component={StudentQuizReview} />
    <Route path="/student/quiz" component={QuizHubPage} />
    <Route path="/student/practice" component={StudentPracticePage} />
    <Route path="/kiosk" component={KioskExperience} />
    <Route path="/join/:code" component={LiveJoinPage} />
    <Route path="/roadmap" component={RoadmapPage} />
    <Route component={LoginLandingPage} />
  </Switch></>;
}

export default function App() {
  return <ErrorBoundary><ThemeProvider defaultTheme="light"><TooltipProvider><GsapInteractions /><AmbientBackground /><Toaster /><Router /></TooltipProvider></ThemeProvider></ErrorBoundary>;
}
