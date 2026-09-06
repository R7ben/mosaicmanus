import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import QuizRunner, { fallbackQuiz } from "@/components/QuizRunner";

const practiceExit = { href: "/student", label: "← Back to dashboard" };

// The authenticated practice runner. Unlike /kiosk (unauthenticated
// shared-device join via class code + name), a signed-in student lands
// here directly with their own learner identity already known.
export default function StudentPracticePage() {
  const [, navigate] = useLocation();
  const dashboard = trpc.mosaic.studentDashboard.useQuery({ learnerId: "s6" });
  const kiosk = trpc.mosaic.kiosk.useQuery(
    { code: dashboard.data?.classroom.kioskCode ?? "pending" },
    { enabled: Boolean(dashboard.data?.classroom.kioskCode) }
  );

  if (dashboard.isLoading || !dashboard.data) return <div className="app-loading"><img src="/logo.png" alt="Mosaic Classroom" className="mosaic-mark" /><p>Opening your mission…</p></div>;

  const availableQuizzes = kiosk.data?.valid && kiosk.data.quizzes?.length ? kiosk.data.quizzes : [fallbackQuiz];
  return <QuizRunner learner={dashboard.data.learner} quizzes={availableQuizzes} onReturn={() => navigate("/student")} onRetry={() => void kiosk.refetch()} exit={practiceExit} />;
}
