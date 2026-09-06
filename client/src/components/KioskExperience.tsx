import { useMemo, useState, type MouseEvent } from "react";
import { ArrowLeft, CheckCircle2, ChevronRight, CircleAlert, KeyRound, LockKeyhole, UserRound, WifiOff } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { leaveKiosk } from "@/lib/kioskExit";
import type { Learner } from "@shared/mosaic";
import QuizRunner, { fallbackQuiz } from "./QuizRunner";

function exitKiosk(event: MouseEvent<HTMLAnchorElement>) {
  if (typeof document === "undefined" || !document.fullscreenElement) return;
  event.preventDefault();
  void leaveKiosk({
    hasFullscreen: true,
    exitFullscreen: () => document.exitFullscreen(),
    navigate: () => window.location.assign("/"),
  });
}

const kioskExit = { href: "/", label: "← Exit kiosk", onClick: exitKiosk };

export default function KioskExperience() {
  const [code, setCode] = useState("");
  const [submittedCode, setSubmittedCode] = useState("");
  const [joinName, setJoinName] = useState("");
  const [learner, setLearner] = useState<Learner | null>(null);
  const kiosk = trpc.mosaic.kiosk.useQuery({ code: submittedCode || "pending" }, { enabled: Boolean(submittedCode) });
  const joinClass = trpc.mosaic.joinClass.useMutation({ onSuccess: (result) => { if (result.success) setLearner(result.learner); } });
  const hasRoster = kiosk.data?.valid;
  const intro = useMemo(() => ({ name: kiosk.data && "classroom" in kiosk.data ? kiosk.data.classroom?.name : "Your classroom", subject: kiosk.data && "classroom" in kiosk.data ? kiosk.data.classroom?.subject : "", teacherName: kiosk.data && "teacherName" in kiosk.data ? kiosk.data.teacherName : "Your teacher" }), [kiosk.data]);
  const resetCode = () => { setSubmittedCode(""); setCode(""); setJoinName(""); joinClass.reset(); };
  if (learner) {
    // `??` only falls back on null/undefined — a classroom with zero
    // published quizzes returns [], which `??` treats as a valid value.
    // Without `.length` here, QuizRunner gets an empty list and has
    // nothing to select, which is what produced the blank page.
    const availableQuizzes = kiosk.data?.valid && kiosk.data.quizzes?.length ? kiosk.data.quizzes : [fallbackQuiz];
    return <QuizRunner learner={learner} quizzes={availableQuizzes} onReturn={() => setLearner(null)} onRetry={() => void kiosk.refetch()} exit={kioskExit} />;
  }
  return <main className="kiosk-page"><header className="kiosk-header"><a className="kiosk-exit" href="/" onClick={exitKiosk}>← Exit kiosk</a><a href="/" className="brand"><img src="/logo.png" alt="Mosaic Classroom" className="mosaic-mark" /><span>Mosaic<span>Classroom</span></span></a><a href="/" className="return-teacher">Teacher view <ChevronRight size={15} /></a></header>{!hasRoster ? <section className="kiosk-entry"><div className="kiosk-entry__art"><div className="orbit orbit--one" /><div className="orbit orbit--two" /><div className="entry-symbol"><KeyRound size={39} /></div></div><div className="eyebrow">Shared-device classroom</div><h1>Start where you are.</h1><p>Enter the classroom code from your teacher. We’ll verify the class before you join.</p><form onSubmit={(event) => { event.preventDefault(); setSubmittedCode(code.trim().toUpperCase()); }}><label htmlFor="class-code">Classroom code</label><div className="code-input"><input id="class-code" value={code} onChange={(event) => setCode(event.target.value)} placeholder="e.g. MOSAIC01" autoComplete="off" /><button className="btn btn--student" type="submit" disabled={!code.trim() || kiosk.isFetching}>{kiosk.isFetching ? "Checking…" : "Continue"}<ChevronRight size={18} /></button></div>{kiosk.data && !kiosk.data.valid && <p className="form-error"><CircleAlert size={15} />{kiosk.data.message}</p>}</form><div className="entry-notes"><span><LockKeyhole size={15} />No login required</span><span><WifiOff size={15} />Works on shared devices</span></div></section> : <section className="roster-page"><div className="roster-heading"><div><div className="eyebrow">{intro.subject} · class preview</div><h1>Join {intro.name}</h1><p>Your teacher: <b>{intro.teacherName}</b>. Confirm your name to join this class immediately.</p></div><button className="text-button" onClick={resetCode}><ArrowLeft size={15} />Change code</button></div><div className="join-preview-card"><div className="join-preview-card__mark"><CheckCircle2 size={28} /></div><div><span className="eyebrow">Verified class code</span><strong>{submittedCode.trim().toUpperCase()}</strong><p>{intro.name} · {intro.subject}</p></div></div><form className="join-confirm-form" onSubmit={(event) => { event.preventDefault(); joinClass.mutate({ code: submittedCode, name: joinName.trim() }); }}><label htmlFor="student-join-name">Your name</label><input id="student-join-name" value={joinName} onChange={(event) => setJoinName(event.target.value)} placeholder="e.g. Hana Yusof" autoComplete="name" /><button className="btn btn--student" type="submit" disabled={joinClass.isPending || joinName.trim().length < 2}>{joinClass.isPending ? "Joining class…" : "Confirm and join"}<ChevronRight size={18} /></button>{joinClass.data && !joinClass.data.success && <p className="form-error"><CircleAlert size={15} />{joinClass.data.message}</p>}</form><p className="privacy-note"><UserRound size={15} />Your answers are saved to your name only. Ask your teacher if you need help.</p></section>}</main>;
}
