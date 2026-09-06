import * as d3 from "d3";
import { useEffect, useMemo, useRef, useState } from "react";
import { BarChart3, BellRing, BookOpenCheck, ChevronRight, CircleHelp, Copy, Download, Grid2X2, Lightbulb, LogOut, Plus, Printer, Radio, RefreshCw, ScanLine, Sparkles, UsersRound, Wifi, X, Zap } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { signOut } from "@/lib/auth";
import { toast } from "sonner";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { type Learner, tierMeta, type Tier } from "@shared/mosaic";
import NotificationCenter from "./NotificationCenter";
import PaperScanner from "./PaperScanner";
import PeerTutoringRecognition from "./PeerTutoringRecognition";
import PrintableSlipGenerator from "./PrintableSlipGenerator";
import HowItWorks from "./shared/HowItWorks";
import CreateClassModal, { type CreatedClass } from "./teacher/CreateClassModal";
import ClassSettingsModal from "./teacher/ClassSettingsModal";
import FeatureTooltip from "./shared/FeatureTooltip";
import HelpBadge from "./shared/HelpBadge";
import PolicyModal from "./shared/PolicyModal";
import { PRIVACY_POLICY, TERMS_OF_USE } from "@/lib/policies";

const navigation = [
  { id: "overview", label: "Dashboard", description: "See the class-wide learning picture and next action.", icon: Grid2X2 },
  { id: "cohort", label: "Cohort map", description: "View learners clustered by current learning tier.", icon: UsersRound },
  { id: "heatmap", label: "Concept signals", description: "Inspect patterns in misconceptions and confidence.", icon: BarChart3 },
  { id: "groups", label: "Learning groups", description: "Plan targeted support for each learning group.", icon: BookOpenCheck },
];

const teacherSidebarNavigation = [
  { id: "dashboard", label: "Dashboard", description: "See the class-wide learning picture and next action.", icon: Grid2X2, view: "overview" },
  { id: "classes", label: "Classes", description: "View class code, students, and assigned quizzes.", icon: UsersRound, href: "/teacher/class" },
  { id: "students", label: "Students", description: "Inspect learners, tiers, and student progress.", icon: UsersRound, view: "cohort" },
  { id: "groups", label: "Learning groups", description: "Plan targeted support for each learning group.", icon: BookOpenCheck, view: "groups" },
  { id: "quizzes", label: "Quizzes", description: "View, manage, and publish classroom quizzes.", icon: BookOpenCheck, href: "/teacher/quiz" },
  { id: "assignments", label: "Assignments", description: "Manage and review student assignments.", icon: BookOpenCheck, href: "/educator" },
  { id: "analytics", label: "Analytics", description: "View performance insights and learning progress.", icon: BarChart3, view: "heatmap" },
  { id: "settings", label: "Settings", description: "Manage class details, access, and kiosk settings.", icon: CircleHelp, href: "/teacher/class" },
];

function TierPill({ tier }: { tier: Tier }) {
  const meta = tierMeta[tier];
  return <span className="tier-pill" style={{ color: meta.color, backgroundColor: meta.soft }}><span style={{ backgroundColor: meta.color }} />{meta.label}</span>;
}

function TeacherProfileMenu() {
  const auth = useAuth();
  const name = auth.user?.name || "Ms. Aida";
  const initials = name.split(" ").map((part) => part[0]).join("").slice(0, 2).toUpperCase();
  return <Popover><PopoverTrigger asChild><button className="teacher-profile-trigger" aria-label="Open teacher profile"><span>{initials}</span></button></PopoverTrigger><PopoverContent align="end" className="profile-popover"><b>{name}</b><small>{auth.user?.email || "teacher@school.edu"}</small><div className="profile-divider" /><button className="profile-signout" onClick={() => signOut(auth.logout).catch(() => toast.error("Could not sign out. Please try again."))}><LogOut size={15} />Sign out</button></PopoverContent></Popover>;
}

function CohortCanvas({ learners, onSelect }: { learners: Learner[]; onSelect: (learner: Learner) => void }) {
  const ref = useRef<SVGSVGElement | null>(null);

  useEffect(() => {
    if (!ref.current) return;
    const width = 850;
    const height = 350;
    const nodes = learners.map((learner, index) => ({ ...learner, index, x: width / 2, y: height / 2 }));
    const targets: Record<Tier, [number, number]> = { red: [145, 170], yellow: [350, 170], green: [560, 170], blue: [745, 170] };
    const svg = d3.select(ref.current);
    svg.selectAll("*").remove();
    const labels = Object.entries(targets);
    svg.selectAll(".zone-label").data(labels).enter().append("text")
      .attr("class", "zone-label")
      .attr("x", ([tier, point]) => point[0])
      .attr("y", 50)
      .attr("text-anchor", "middle")
      .text(([tier]) => tierMeta[tier as Tier].label);
    svg.selectAll(".zone-rule").data(labels).enter().append("line")
      .attr("x1", ([, point]) => point[0] - 82).attr("x2", ([, point]) => point[0] + 82)
      .attr("y1", 63).attr("y2", 63).attr("stroke", "#e8e2d8");
    const bubbles = svg.append("g").selectAll("g").data(nodes).enter().append("g").style("cursor", "pointer");
    bubbles.append("circle")
      .attr("r", (node) => 18 + (node.mastery / 100) * 13)
      .attr("fill", (node) => tierMeta[node.tier].color)
      .attr("fill-opacity", 0.88)
      .attr("stroke", "#fffdf8").attr("stroke-width", 3);
    bubbles.append("text").attr("text-anchor", "middle").attr("dy", ".35em").attr("fill", "#fff")
      .attr("font-size", 10).attr("font-weight", 800).text((node) => node.initials);
    bubbles.on("click", (_event, node) => onSelect(node));
    const simulation = d3.forceSimulation(nodes as d3.SimulationNodeDatum[])
      .force("x", d3.forceX((node) => targets[(node as typeof nodes[number]).tier][0]).strength(0.18))
      .force("y", d3.forceY((node) => targets[(node as typeof nodes[number]).tier][1]).strength(0.14))
      .force("collide", d3.forceCollide((node) => 23 + ((node as typeof nodes[number]).mastery / 100) * 13))
      .alpha(0.85).alphaDecay(0.035)
      .on("tick", () => bubbles.attr("transform", (node) => `translate(${Math.max(36, Math.min(width - 36, node.x ?? width / 2))},${Math.max(94, Math.min(height - 34, node.y ?? height / 2))})`));
    return () => { simulation.stop(); };
  }, [learners, onSelect]);

  return <div className="cohort-canvas"><svg ref={ref} viewBox="0 0 850 350" role="img" aria-label="Dynamic cohort map clustered by learning tier" /></div>;
}

function ActionCard({ data, onPulse }: { data: { title: string; summary: string; recommendation: string; affected: number; topic: string }; onPulse: () => void }) {
  return <section className="action-card">
    <div className="action-card__top"><div className="eyebrow eyebrow--warm"><Sparkles size={14} />Teacher action card<HelpBadge>This card automatically finds the single most important thing to address in your class right now, based on live answers. Read the summary, then click "New pulse" to send a quick diagnostic that targets it.</HelpBadge></div><span className="live-dot">Live</span></div>
    <div className="action-card__body"><div><h2>{data.title}</h2><p>{data.summary}</p></div><div className="action-count"><strong>{data.affected}</strong><span>learners<br />affected</span></div></div>
    <div className="action-card__footer"><div><Lightbulb size={18} /><p><strong>Try next</strong>{data.recommendation}</p></div><button className="btn btn--ink" onClick={onPulse}><Radio size={16} />New pulse</button></div>
  </section>;
}

function Heatmap({ learners, onSelect }: { learners: Learner[]; onSelect?: (learner: Learner) => void }) {
  const concepts = ["Mass vs. weight", "Force & motion", "Falling objects", "Measurement"];
  const cells = learners.slice(0, 12);
  const [context, setContext] = useState<{ learner: Learner; concept: string } | null>(null);
  const [override, setOverride] = useState("Mass and weight are the same thing");
  const applyOverride = trpc.mosaic.teacherOverride.useMutation({ onSuccess: () => setContext(null) });
  const markResolved = trpc.mosaic.markResolved.useMutation({ onSuccess: () => setContext(null) });
  return <section className="panel heatmap-panel"><div className="panel-heading"><div><div className="eyebrow">Concept diagnostic · confidence signal</div><h2>Where thinking gets stuck<HelpBadge>A solid red cell means a student answered confidently but wrong — a real misconception. An outlined red cell means they guessed or were unsure. Right-click any cell to override the detected misconception or mark it resolved.</HelpBadge></h2></div><button className="text-button">See responses <ChevronRight size={15} /></button></div><p className="heatmap-explainer"><Zap size={14} />Solid red means “I knew this” but wrong. An outlined red means “I guessed” or “I’m unsure”. Right-click a cell for teacher actions.</p><div className="heatmap-scroll"><div className="heatmap"><div className="heatmap-row heatmap-row--head"><span>Learner</span>{concepts.map((concept) => <span key={concept}>{concept}</span>)}</div>{cells.map((learner, index) => <div className="heatmap-row" key={learner.id}><span className="learner-label"><b>{learner.initials}</b>{learner.name}</span>{concepts.map((concept, cellIndex) => { const hot = learner.misconception?.toLowerCase().includes("mass") && cellIndex === 0; const confident = hot && (learner.confidentWrongCount ?? 0) > 0; const confused = hot && !confident && (learner.confusedWrongCount ?? 0) > 0; const level = hot ? confident ? "hot-confident" : confused ? "hot-confused" : "hot" : (index + cellIndex * 2) % 5 === 0 ? "watch" : "clear"; return <span className={`heat-cell heat-cell--${level}`} key={concept} title={hot ? `${learner.misconception}\nDetected from: ${confident ? "a confident wrong answer" : "a guessed or unsure answer"}\nPattern: ${confident ? "confident error" : "confused attempt"}` : `${learner.name} · ${concept}`} onContextMenu={(event) => { event.preventDefault(); setContext({ learner, concept }); }} onClick={() => onSelect?.(learner)} aria-label={`${learner.name} ${concept} ${level}`} />; })}</div>)}</div></div><div className="heat-legend"><span><i className="heat-cell heat-cell--clear" />Secure</span><span><i className="heat-cell heat-cell--watch" />Watch</span><span><i className="heat-cell heat-cell--hot-confident" />Confident error</span><span><i className="heat-cell heat-cell--hot-confused" />Confused attempt</span></div>{context && <div className="heatmap-context" role="menu"><b>{context.learner.name}</b><small>{context.concept}</small><button onClick={() => { onSelect?.(context.learner); setContext(null); }}>View student profile <ChevronRight size={14} /></button><label>Override misconception<select value={override} onChange={(event) => setOverride(event.target.value)}><option>Mass and weight are the same thing</option><option>Force is only needed to keep objects moving</option><option>Heavier objects always fall faster</option></select></label><button onClick={() => applyOverride.mutate({ learnerId: context.learner.id, misconception: override })}>Confirm override</button><button onClick={() => markResolved.mutate({ learnerId: context.learner.id })}>Mark as resolved</button><button className="text-button" onClick={() => setContext(null)}>Close</button></div>}</section>;
}

function GroupCards({ learners }: { learners: Learner[] }) {
  return <section className="group-grid">{(Object.keys(tierMeta) as Tier[]).map((tier) => { const meta = tierMeta[tier]; const list = learners.filter((learner) => learner.tier === tier); return <article className="group-card" key={tier} style={{ borderTopColor: meta.color }}><div className="group-card__heading"><div><TierPill tier={tier} /><h3>{list.length} learners</h3></div><span className="group-badge">{tier === "red" ? "Priority" : "Ready"}</span></div><p>{meta.task}</p><div className="avatar-stack">{list.slice(0, 5).map((learner) => <span key={learner.id} title={learner.name} style={{ backgroundColor: meta.color }}>{learner.initials}</span>)}{list.length > 5 && <span className="avatar-stack__more">+{list.length - 5}</span>}</div><button className="text-button" onClick={() => window.print()}>Generate repair slip <Download size={15} /></button></article>; })}</section>;
}

export default function MosaicDashboard() {
  const [view, setView] = useState("overview");
  const [focus, setFocus] = useState<Learner | null>(null);
  const [showScanner, setShowScanner] = useState(false);
  const [showPrint, setShowPrint] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  const [showPrivacy, setShowPrivacy] = useState(false);
  const [showCreateClass, setShowCreateClass] = useState(false);
  const [classMenuOpen, setClassMenuOpen] = useState(false);
  const [activeClass, setActiveClass] = useState<CreatedClass | null>(null);
  const [showClassSettings, setShowClassSettings] = useState(false);
  const [classCodeCopied, setClassCodeCopied] = useState(false);
  const dashboard = trpc.mosaic.dashboard.useQuery(undefined, { refetchInterval: 5000 });
  const classList = trpc.mosaic.listTeacherClasses.useQuery();
  const utils = trpc.useUtils();
  const startPulse = trpc.mosaic.startPulse.useMutation({ onSuccess: () => utils.mosaic.dashboard.invalidate() });
  const createLive = trpc.mosaic.createLiveSession.useMutation();
  const launchLive = trpc.mosaic.launchLiveSession.useMutation();
  const data = dashboard.data;
  const recentLearners = useMemo(() => data?.learners.slice(0, 5) ?? [], [data?.learners]);
  useEffect(() => { if (!activeClass && classList.data?.[0]) setActiveClass(classList.data[0]); }, [activeClass, classList.data]);
  const copyActiveClassCode = async () => { const code = activeClass?.kioskCode || data?.classroom.kioskCode; if (!code) return; await navigator.clipboard?.writeText(code); setClassCodeCopied(true); window.setTimeout(() => setClassCodeCopied(false), 2000); };

  if (dashboard.isLoading || !data) return <div className="dashboard-skeleton" aria-busy="true" aria-label="Loading teacher dashboard"><div className="dashboard-skeleton__sidebar"><span className="skeleton skeleton--logo" /><span className="skeleton skeleton--line" /><span className="skeleton skeleton--line" /><span className="skeleton skeleton--line" /><span className="skeleton skeleton--line" /><span className="skeleton skeleton--line" /></div><div className="dashboard-skeleton__main"><span className="skeleton skeleton--eyebrow" /><span className="skeleton skeleton--title" /><div className="skeleton-grid">{[1, 2, 3, 4, 5].map((item) => <span className="skeleton skeleton--card" key={item} />)}</div><span className="skeleton skeleton--wide" /><span className="skeleton skeleton--wide" /></div></div>;

  const renderMain = () => {
    if (view === "cohort") return <><div className="section-title"><div><div className="eyebrow">Live class view</div><h1>Every learner has a different path.<HelpBadge>Each bubble is one student — position shows their tier (Rebuild/Repair/Practice/Extend) and size shows current mastery. Click a bubble to open that student's profile and plan a 5-minute check-in.</HelpBadge></h1><p>Bubble size reflects current mastery. Tap a learner to see their next move.</p></div><button className="btn btn--soft" onClick={() => dashboard.refetch()}><RefreshCw size={16} />Refresh</button></div><section className="panel cohort-panel"><CohortCanvas learners={data.learners} onSelect={setFocus} /><div className="tier-key">{(Object.keys(tierMeta) as Tier[]).map((tier) => <TierPill tier={tier} key={tier} />)}</div></section></>;
    if (view === "heatmap") return <><div className="section-title"><div><div className="eyebrow">Live class view</div><h1>Concept signals</h1><p>Patterns appear here as learners complete missions and pulse checks.</p></div><button className="btn btn--soft" onClick={() => setShowScanner(true)}><ScanLine size={16} />Paper scanner</button></div><Heatmap learners={data.learners} onSelect={setFocus} /></>;
    if (view === "groups") return <><div className="section-title"><div><div className="eyebrow">Flexible intervention</div><h1>Four small moves. One classroom.<HelpBadge>Students are automatically grouped by what they need next. Click "Generate repair slip" on any group to print a targeted exercise for those students.</HelpBadge></h1><p>Groups refresh as learners demonstrate new understanding.</p></div><button className="btn btn--soft" onClick={() => dashboard.refetch()}><RefreshCw size={16} />Update groups</button></div><GroupCards learners={data.learners} /><section className="peer-bridge"><div className="peer-icon"><UsersRound size={21} /></div><div><div className="eyebrow">Peer bridge</div><h3>Adam can explain it to Hana</h3><p>Adam recently cleared the same mass-and-weight idea. Their explanation may unlock a new route.</p></div><button className="btn btn--ink">Make a pair</button></section><PeerTutoringRecognition /></>;
    return <><div className="welcome-line"><div><p className="eyebrow">Tuesday · 9:42 am</p><h1>Good morning, Ms. Aida.</h1><p>Here’s the clearest next step for <strong>{data.classroom.name}</strong>.</p></div><div className="class-chip"><span>F2</span><div><b>{data.classroom.name}</b><small>{data.classroom.subject} · {data.learners.length} learners</small></div></div></div><section className="summary-card-grid" aria-label="Teacher dashboard summary"><article className="summary-card"><span className="summary-card__icon"><Grid2X2 size={17} /></span><div><span>Total classes</span><strong>{classList.data?.length ?? 1}</strong><small>Active teaching spaces</small></div></article><article className="summary-card"><span className="summary-card__icon"><UsersRound size={17} /></span><div><span>Total students</span><strong>{data.learners.length}</strong><small>Across active classes</small></div></article><article className="summary-card"><span className="summary-card__icon"><BookOpenCheck size={17} /></span><div><span>Active quizzes</span><strong>3</strong><small>Ready for learners</small></div></article><article className="summary-card"><span className="summary-card__icon"><BarChart3 size={17} /></span><div><span>Average class score</span><strong>78%</strong><small>Up 6% this month</small></div></article><article className="summary-card"><span className="summary-card__icon"><Wifi size={17} /></span><div><span>Attendance rate</span><strong>94%</strong><small>Last 30 days</small></div></article></section><ActionCard data={data.actionCard} onPulse={() => startPulse.mutate()} /><div className="dashboard-grid"><section className="panel momentum-card"><div className="panel-heading"><div><div className="eyebrow">Class momentum</div><h2>Today’s learning picture<HelpBadge>Each bar counts how many students currently sit in that tier — Rebuild (struggling), Repair, Practice, or Extend. Click "Open cohort map" to see individual students behind these numbers.</HelpBadge></h2></div><span className="date-tag">This lesson</span></div><div className="tier-bars">{(Object.keys(tierMeta) as Tier[]).map((tier) => <div className="tier-bar" key={tier}><div><TierPill tier={tier} /><b>{data.counts[tier]}</b></div><div className="bar-track"><span style={{ width: `${data.counts[tier] * 5}%`, backgroundColor: tierMeta[tier].color }} /></div></div>)}</div><button className="text-button" onClick={() => setView("cohort")}>Open cohort map <ChevronRight size={15} /></button></section><section className="panel pulse-card"><div className="panel-heading"><div><div className="eyebrow">Quick check</div><h2>{data.pulse.active ? "Pulse is live" : "Read the room in 2 minutes"}<HelpBadge>Sends 3 short questions to every device in the room at once — no student logins needed. Click "Start pulse check" to launch it, then watch responses arrive here live.</HelpBadge></h2></div><span className={data.pulse.active ? "live-dot" : "muted-dot"}>{data.pulse.active ? "Live now" : "Ready"}</span></div><p>{data.pulse.active ? "3 questions are open across the classroom. Results will appear here as they arrive." : "Send a short diagnostic to every shared device—no logins needed."}</p><div className="pulse-progress"><span style={{ width: data.pulse.active ? "42%" : "0%" }} /><small>{data.pulse.active ? "8 of 20 responses" : "3 questions prepared"}</small></div><button className="btn btn--outlined" onClick={() => startPulse.mutate()} disabled={startPulse.isPending || data.pulse.active}>{startPulse.isPending ? "Sending…" : data.pulse.active ? "Pulse active" : "Start pulse check"}</button></section></div><Heatmap learners={data.learners} onSelect={setFocus} /></>;
  };

  const liveSession = createLive.data;
  return <div className="mosaic-shell"><aside className="mosaic-sidebar"><a className="brand" href="/"><img src="/logo.png" alt="Mosaic Classroom" className="mosaic-mark" /><span>Mosaic<span>Classroom</span></span></a><div className="class-switcher"><button className="side-class side-class-button" onClick={() => setClassMenuOpen((open) => !open)}><span className="side-class__round">{activeClass?.yearLevel?.split(" ").pop() || "F2"}</span><div><small>Active classroom</small><b>{activeClass?.name || data.classroom.name}</b><span className="sidebar-kiosk-code"><span>{activeClass?.kioskCode || data.classroom.kioskCode}</span><button type="button" onClick={(event) => { event.stopPropagation(); void copyActiveClassCode(); }} aria-label="Copy kiosk code"><Copy size={11} /></button>{classCodeCopied && <em>Copied!</em>}</span></div><ChevronRight size={15} className={classMenuOpen ? "class-switcher__chevron class-switcher__chevron--open" : "class-switcher__chevron"} /></button><div className="class-actions"><FeatureTooltip label="View class code, students, and assigned quizzes"><a className="class-details-link" href="/teacher/class">Class details</a></FeatureTooltip><button className="new-class-button" onClick={() => setShowCreateClass(true)} title="Create a new class and generate a unique class code">+ New class</button><button className="class-menu-button" onClick={() => setShowClassSettings(true)} aria-label="Class settings" title="Open class settings, kiosk access, and students">···</button></div>{classMenuOpen && <div className="class-switcher__menu">{classList.data?.map((item) => <button key={item.id} onClick={() => { setActiveClass(item); setClassMenuOpen(false); }}>{item.name}<small>{item.subject} · {item.yearLevel}</small></button>)}</div>}</div><nav className="teacher-sidebar-nav">{teacherSidebarNavigation.map((item) => { const Icon = item.icon; const active = item.view ? view === item.view : false; const control = item.href ? <a className={active ? "nav-item nav-item--active" : "nav-item"} href={item.href}><Icon size={18} />{item.label}</a> : <button className={active ? "nav-item nav-item--active" : "nav-item"} onClick={() => setView(item.view ?? "overview")}><Icon size={18} />{item.label}</button>; return <FeatureTooltip key={item.id} label={item.description}>{control}</FeatureTooltip>; })}</nav><div className="sidebar-section-label">Classroom tools</div><FeatureTooltip label="Create a new quiz and add questions"><a className="nav-item nav-item--quiz" href="/teacher/quiz/create"><Plus size={18} />Create quiz</a></FeatureTooltip><FeatureTooltip label="Scan paper answers and bring them into the class record"><button className="nav-item" onClick={() => setShowScanner(true)}><ScanLine size={18} />Paper-first</button></FeatureTooltip><div className="sidebar-bottom"><div className="teacher-mini"><div>AA</div><span><b>Ms. Aida</b><small>Teacher</small></span></div><div className="text-xs text-gray-400 mt-4 pt-3 border-t border-gray-200"><div className="mb-1 font-semibold tracking-wide uppercase">Platform</div><button className="block hover:text-gray-600" onClick={() => setShowPrivacy(true)}>Privacy policy</button><button className="block hover:text-gray-600" onClick={() => setShowTerms(true)}>Terms of use</button></div></div></aside><div className="mosaic-main"><header className="topbar"><div className="topbar__context"><span>Teacher dashboard</span><b>Form 2 Science</b></div><div className="mobile-brand"><img src="/logo.png" alt="Mosaic Classroom" className="mosaic-mark" />Mosaic</div><div className="topbar__right"><a className="topbar-action topbar-action--quiz" href="/teacher/quiz/create" title="Create a new quiz for your class"><Plus size={15} />Create quiz</a><button className="topbar-action" onClick={() => setShowScanner(true)}><ScanLine size={15} />Scan slips</button><button className="topbar-action" onClick={() => setShowPrint(true)}><Printer size={15} />Answer slips</button><button className="topbar-action topbar-action--live" onClick={() => createLive.mutate()}><Zap size={15} />Start live session</button><a href="/kiosk" className="kiosk-link"><Wifi size={15} />Kiosk mode</a><button className="topbar-action topbar-action--tutorial" onClick={() => setShowTutorial(true)}><CircleHelp size={15} />How it works</button><NotificationCenter audience="educator" /><TeacherProfileMenu /></div></header><main className="content"><div className="dashboard-breadcrumbs" aria-label="Breadcrumb"><span>Teacher</span><ChevronRight size={13} /><b>{view === "overview" ? "Dashboard overview" : navigation.find((item) => item.id === view)?.label ?? "Dashboard"}</b></div><div className="mobile-nav">{navigation.map((item) => <button key={item.id} className={view === item.id ? "mobile-nav__active" : ""} onClick={() => setView(item.id)}>{item.label}</button>)}</div>{renderMain()}<section className="recent-strip"><div><div className="eyebrow">Recent activity</div><h2>Keep an eye on these learners<HelpBadge>Students appear here when they show a recent thinking error. Click a name to open their profile, see the detected pattern, and plan a quick check-in.</HelpBadge></h2></div><div className="recent-list">{recentLearners.map((learner) => <button key={learner.id} onClick={() => setFocus(learner)}><span className="small-avatar" style={{ backgroundColor: tierMeta[learner.tier].color }}>{learner.initials}</span><span><b>{learner.name}</b><small>{learner.misconception ?? "Building confidence"} · {learner.recent}</small></span><ChevronRight size={16} /></button>)}</div></section></main></div>{focus && <div className="learner-drawer" role="dialog" aria-modal="true"><button className="drawer-backdrop" aria-label="Close learner details" onClick={() => setFocus(null)} /><article><button className="drawer-close" onClick={() => setFocus(null)}><X size={18} /></button><span className="large-avatar" style={{ backgroundColor: tierMeta[focus.tier].color }}>{focus.initials}</span><TierPill tier={focus.tier} /><h2>{focus.name}</h2><p>{focus.mastery}% mastery in Forces & Motion</p><div className="drawer-metric"><span>Next move</span><b>{focus.misconception ?? "Keep building independent practice."}</b></div><div className="drawer-metric"><span>Confident errors</span><b>{focus.confidentWrongCount ?? 0} · Confused attempts {focus.confusedWrongCount ?? 0}</b></div><div className="drawer-metric"><span>Why this was detected</span><b>{focus.misconception ? `Observed pattern: ${focus.misconception}. Confidence signal is used to choose the intervention.` : "No active misconception."}</b></div><button className="btn btn--ink" onClick={() => setFocus(null)}>Plan a 5-minute check-in</button></article></div>}{showScanner && <PaperScanner classId={data.classroom.id} isOpen={showScanner} onClose={() => setShowScanner(false)} topics={data.classroom.topics} classRoster={data.learners} />}{showPrint && <PrintableSlipGenerator className={data.classroom.name} onClose={() => setShowPrint(false)} />}<HowItWorks role="teacher" isOpen={showTutorial} onClose={() => setShowTutorial(false)} /><PolicyModal title="Terms of Use" content={TERMS_OF_USE} isOpen={showTerms} onClose={() => setShowTerms(false)} /><PolicyModal title="Privacy Policy" content={PRIVACY_POLICY} isOpen={showPrivacy} onClose={() => setShowPrivacy(false)} /><CreateClassModal open={showCreateClass} onOpenChange={setShowCreateClass} onCreated={(created) => { setActiveClass(created); void classList.refetch(); }} /><ClassSettingsModal classroom={activeClass ?? (classList.data?.[0] as CreatedClass | undefined) ?? null} open={showClassSettings} onOpenChange={setShowClassSettings} onUpdated={(updated) => { setActiveClass(updated); void classList.refetch(); }} />{liveSession && <div className="live-overlay"><div className="live-overlay__card"><button className="drawer-close" onClick={() => createLive.reset()}><X size={18} /></button><div className="eyebrow"><Zap size={14} />Live session ready</div><h2>Join code</h2><strong className="join-code">{liveSession.joinCode}</strong><p>Students open <b>/join/{liveSession.joinCode}</b> on their device and enter their name.</p><div className="live-qr-placeholder">Scan or type the code<br /><small>QR projection placeholder · {data.classroom.name}</small></div><button className="btn btn--student" onClick={() => launchLive.mutate({ joinCode: liveSession.joinCode })}>{launchLive.isPending ? "Launching…" : "Launch questions"}</button></div></div>}</div>;
}
