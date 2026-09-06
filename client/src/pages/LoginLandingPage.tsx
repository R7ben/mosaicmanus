import { useEffect, useState } from "react";
import { AlertCircle, ArrowLeft, ArrowRight, BookOpen, Loader2, Sparkles, UserRound } from "lucide-react";
import { useLocation } from "wouter";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { startLogin } from "@/const";
import { useAuth } from "@/_core/hooks/useAuth";
import { toast } from "sonner";
import HowItWorks from "@/components/shared/HowItWorks";
import PolicyModal from "@/components/shared/PolicyModal";
import { PRIVACY_POLICY, TERMS_OF_USE } from "@/lib/policies";
import { useRiseIn } from "@/hooks/useRiseIn";

type PanelRole = "teacher" | "student";
type Step = "picker" | PanelRole;

function BrandMark() {
  return (
    <div className="brand-stack">
      <img src="/logo.png" alt="" aria-hidden="true" className="mosaic-mark" />
      <b>Mosaic Classroom</b>
      <p>Every student, one classroom.</p>
    </div>
  );
}

/** Sign-in form for the role the visitor picked. Both roles share one flow. */
function SignInForm({ role, onBack, onRegister }: { role: PanelRole; onBack: () => void; onRegister: () => void }) {
  const [, navigate] = useLocation();
  const auth = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [roleIntent] = useState<PanelRole | null>(() => {
    const saved = localStorage.getItem("mosaic-role-intent");
    const startedAt = Number(localStorage.getItem("mosaic-role-intent-at") ?? 0);
    const isRecent = startedAt > 0 && Date.now() - startedAt < 10 * 60 * 1000;
    if (!isRecent) {
      localStorage.removeItem("mosaic-role-intent");
      localStorage.removeItem("mosaic-role-intent-at");
    }
    return isRecent && (saved === "teacher" || saved === "student") ? saved : null;
  });
  const teacher = role === "teacher";

  useEffect(() => {
    if (!auth.user || roleIntent !== role) return;
    const actualRole = auth.user.role;
    const roleMismatch = teacher ? actualRole === "student" : actualRole === "educator";
    if (roleMismatch) {
      setError(
        teacher
          ? "This account is registered as a student. Go back and choose “I'm a Student”."
          : "This account is registered as a teacher. Go back and choose “I'm a Teacher”.",
      );
      localStorage.removeItem("mosaic-role-intent");
      localStorage.removeItem("mosaic-role-intent-at");
      return;
    }
    localStorage.removeItem("mosaic-role-intent");
    localStorage.removeItem("mosaic-role-intent-at");
    navigate(teacher ? "/teacher" : "/student");
  }, [auth.user, navigate, role, roleIntent, teacher]);

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    setError("");
    if (!email.trim() || !password.trim()) {
      setError("Enter your email and password to continue.");
      return;
    }
    setBusy(true);
    localStorage.setItem("mosaic-role-intent", role);
    localStorage.setItem("mosaic-role-intent-at", String(Date.now()));
    startLogin();
  };

  return (
    <section className="entry-card entry-card--form">
      <BrandMark />
      <h1 className="entry-form__title">{teacher ? "Teacher sign in" : "Student sign in"}</h1>
      <p className="entry-form__lede">
        {teacher ? "Manage your classes and act on live insights." : "Pick up your learning path where you left it."}
      </p>
      <form onSubmit={submit} className="entry-form">
        <label htmlFor={`${role}-email`}>
          Email
          <input
            id={`${role}-email`}
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder={teacher ? "teacher@school.edu" : "your school email"}
            type="email"
            autoComplete="email"
          />
        </label>
        <label htmlFor={`${role}-password`}>
          Password
          <input
            id={`${role}-password`}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="••••••••"
            type="password"
            autoComplete="current-password"
          />
        </label>
        <Button type="submit" className="entry-form__submit" disabled={busy}>
          {busy ? (
            <>
              <Loader2 className="animate-spin" size={16} />
              Signing in…
            </>
          ) : (
            "Sign in"
          )}
        </Button>
        {error && (
          <Alert variant="destructive" className="login-error">
            <AlertCircle size={15} />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
      </form>
      <div className="entry-card__security">
        <span aria-hidden="true">✓</span> Secure sign-in via Manus
      </div>
      {teacher ? (
        <button className="entry-link" onClick={onRegister}>
          New here? Create a teacher account
        </button>
      ) : (
        <a className="entry-link" href="/kiosk">
          No account? Join with a class code <ArrowRight size={14} />
        </a>
      )}
      <button className="entry-back" onClick={onBack}>
        <ArrowLeft size={14} /> Back to role picker
      </button>
    </section>
  );
}

export default function LoginLandingPage() {
  const [step, setStep] = useState<Step>("picker");
  const [registerOpen, setRegisterOpen] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [registerError, setRegisterError] = useState("");
  const [registerBusy, setRegisterBusy] = useState(false);
  const [tutorialOpen, setTutorialOpen] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  const [showPrivacy, setShowPrivacy] = useState(false);
  // The two role buttons rise in with a slight stagger each time the picker
  // is shown (including on return from the sign-in step).
  const rolesRef = useRiseIn<HTMLDivElement>({ deps: [step] });

  useEffect(() => {
    const message = sessionStorage.getItem("mosaic-toast");
    if (message) {
      sessionStorage.removeItem("mosaic-toast");
      toast.success(message);
    }
  }, []);

  const register = (event: React.FormEvent) => {
    event.preventDefault();
    if (!name || !email || password.length < 8 || password !== confirm) {
      setRegisterError(
        password !== confirm
          ? "The passwords do not match."
          : "Add your name, school email, and a password with at least 8 characters.",
      );
      return;
    }
    setRegisterError("");
    setRegisterBusy(true);
    localStorage.setItem("mosaic-role-intent", "teacher");
    localStorage.setItem("mosaic-role-intent-at", String(Date.now()));
    startLogin();
  };

  return (
    <main className="entry-landing">
      {step === "picker" ? (
        <section className="entry-card">
          <BrandMark />
          <div className="entry-roles" ref={rolesRef}>
            <button className="entry-role" onClick={() => setStep("teacher")}>
              <span className="entry-role__icon">
                <UserRound size={20} />
              </span>
              <b>I'm a Teacher</b>
              <small>Manage classes &amp; insights</small>
            </button>
            <button className="entry-role entry-role--accent" onClick={() => setStep("student")}>
              <span className="entry-role__icon">
                <BookOpen size={20} />
              </span>
              <b>I'm a Student</b>
              <small>Continue your path</small>
            </button>
          </div>
          <a className="entry-link" href="/kiosk">
            Join with a class code (Kiosk) <ArrowRight size={14} />
          </a>
          <button className="entry-how" onClick={() => setTutorialOpen(true)}>
            <Sparkles size={14} />
            See how it works
          </button>
          <a className="entry-secondary" href="/login/tutor">
            Tutor or mentor? Sign in here
          </a>
        </section>
      ) : (
        <SignInForm role={step} onBack={() => setStep("picker")} onRegister={() => setRegisterOpen(true)} />
      )}

      {import.meta.env.DEV && (
        <div className="entry-dev">
          <p>Dev only — bypasses Manus OAuth (no OAUTH_SERVER_URL locally):</p>
          <a href="/api/dev-login?role=educator">Sign in as teacher</a>
          <a href="/api/dev-login?role=student">Sign in as student</a>
        </div>
      )}

      <div className="entry-legal">
        By continuing, you agree to our <button onClick={() => setShowTerms(true)}>Terms of use</button> and{" "}
        <button onClick={() => setShowPrivacy(true)}>Privacy policy</button>
      </div>

      <PolicyModal title="Terms of Use" content={TERMS_OF_USE} isOpen={showTerms} onClose={() => setShowTerms(false)} />
      <PolicyModal
        title="Privacy Policy"
        content={PRIVACY_POLICY}
        isOpen={showPrivacy}
        onClose={() => setShowPrivacy(false)}
      />
      <HowItWorks role="general" isOpen={tutorialOpen} onClose={() => setTutorialOpen(false)} />
      <Dialog open={registerOpen} onOpenChange={setRegisterOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create a teacher account</DialogTitle>
            <DialogDescription>
              Set up your teacher access, then continue through Mosaic's secure Manus login.
            </DialogDescription>
          </DialogHeader>
          <form className="register-form" onSubmit={register}>
            <label>
              Full name
              <Input value={name} onChange={(event) => setName(event.target.value)} placeholder="Aida Rahman" />
            </label>
            <label>
              Email
              <Input
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                type="email"
                placeholder="teacher@school.edu"
              />
            </label>
            <label>
              Password
              <Input
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                type="password"
                placeholder="At least 8 characters"
              />
            </label>
            <label>
              Confirm password
              <Input
                value={confirm}
                onChange={(event) => setConfirm(event.target.value)}
                type="password"
                placeholder="Repeat your password"
              />
            </label>
            {registerError && (
              <Alert variant="destructive">
                <AlertDescription>{registerError}</AlertDescription>
              </Alert>
            )}
            <Button type="submit" disabled={registerBusy}>
              {registerBusy ? (
                <>
                  <Loader2 className="animate-spin" size={15} />
                  Creating…
                </>
              ) : (
                "Create teacher account"
              )}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </main>
  );
}
