import { ArrowLeft, BookOpenCheck, ExternalLink, FileText, Globe2, Headphones, Image as ImageIcon, MoreHorizontal, Plus, Search, Upload, Youtube } from "lucide-react";
import { useMemo, useState } from "react";

type ResourceType = "Document" | "Audio" | "YouTube" | "Web" | "Image";

type Resource = {
  id: number;
  title: string;
  type: ResourceType;
  detail: string;
  note: string;
  updated: string;
};

const resources: Resource[] = [
  { id: 1, title: "Forces and Motion · Teacher guide.pdf", type: "Document", detail: "PDF · 18 pages", note: "Form 2 Science · Forces & Motion", updated: "Updated today" },
  { id: 2, title: "Mass, weight and gravity lesson notes", type: "Document", detail: "PDF · 7 pages", note: "Form 2 Science · Matter & Properties", updated: "Updated yesterday" },
  { id: 3, title: "Explaining force diagrams", type: "YouTube", detail: "YouTube · 8 min", note: "Shared with Form 2 Science", updated: "Added 2 days ago" },
  { id: 4, title: "Earth to Moon backpack simulation", type: "Web", detail: "Interactive webpage", note: "Forces & Motion · Mission support", updated: "Added last week" },
  { id: 5, title: "Science vocabulary pronunciation", type: "Audio", detail: "Audio · 4 min", note: "Form 2 Science · Revision support", updated: "Added last week" },
  { id: 6, title: "Free-body diagram classroom poster", type: "Image", detail: "PNG · Classroom visual", note: "Forces & Motion · Display resource", updated: "Added 2 weeks ago" },
];

const typeMeta: Record<ResourceType, { icon: typeof FileText; tint: string }> = {
  Document: { icon: FileText, tint: "#e7edff" },
  Audio: { icon: Headphones, tint: "#f8e8c9" },
  YouTube: { icon: Youtube, tint: "#f7deda" },
  Web: { icon: Globe2, tint: "#dcefe3" },
  Image: { icon: ImageIcon, tint: "#eee2f7" },
};

const filters: Array<{ label: "All" | ResourceType; count?: number }> = [
  { label: "All", count: resources.length },
  { label: "Document", count: 2 },
  { label: "Audio", count: 1 },
  { label: "YouTube", count: 1 },
  { label: "Web", count: 1 },
  { label: "Image", count: 1 },
];

export default function TeacherResourcesPage() {
  const [activeFilter, setActiveFilter] = useState<"All" | ResourceType>("All");
  const [search, setSearch] = useState("");
  const filtered = useMemo(() => resources.filter((resource) => {
    const matchesType = activeFilter === "All" || resource.type === activeFilter;
    const haystack = `${resource.title} ${resource.note} ${resource.detail}`.toLowerCase();
    return matchesType && haystack.includes(search.toLowerCase());
  }), [activeFilter, search]);

  return <div className="resources-shell">
    <aside className="resources-sidebar">
      <a className="brand" href="/teacher"><span className="mosaic-mark">M</span><span>Mosaic<span>Classroom</span></span></a>
      <div className="resources-class-card"><span>F2</span><div><small>Active classroom</small><b>Form 2 Science</b></div></div>
      <nav className="resources-nav" aria-label="Teacher navigation">
        <a href="/teacher">Dashboard</a><a href="/teacher/class">Classes</a><a href="/teacher">Students</a><a href="/teacher/quiz">Quizzes</a><a href="/educator">Assignments</a><a href="/teacher">Attendance</a><a href="/teacher">Analytics</a><a className="resources-nav__active" href="/teacher/resources">Resources</a><a href="/teacher/class">Settings</a>
      </nav>
      <div className="resources-sidebar__bottom"><a href="/teacher"><ArrowLeft size={15} />Back to dashboard</a><div className="teacher-mini"><div>AA</div><span><b>Ms. Aida</b><small>Teacher</small></span></div></div>
    </aside>
    <main className="resources-main">
      <header className="resources-topbar"><div><span className="eyebrow"><BookOpenCheck size={14} />Teacher library</span><b>Form 2 Science</b></div><a className="btn btn--student" href="/teacher/resources"><Upload size={15} />Add source</a></header>
      <section className="resources-content">
        <div className="resources-heading"><div><p className="eyebrow">Classroom resources</p><h1>Sources</h1><p>Keep lesson materials, references, and media ready for your next learning move.</p></div><button className="resources-feedback" type="button">Give feedback <ExternalLink size={13} /></button></div>
        <div className="resource-tabs" role="tablist" aria-label="Filter sources">{filters.map((filter) => { const Icon = filter.label === "All" ? BookOpenCheck : typeMeta[filter.label].icon; return <button key={filter.label} className={activeFilter === filter.label ? "resource-tab resource-tab--active" : "resource-tab"} onClick={() => setActiveFilter(filter.label)} role="tab" aria-selected={activeFilter === filter.label}><Icon size={15} />{filter.label}<span>{filter.count}</span></button>; })}</div>
        <label className="resources-search"><Search size={17} /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search sources..." aria-label="Search sources" /></label>
        <div className="resources-list">{filtered.length ? filtered.map((resource) => { const meta = typeMeta[resource.type]; const Icon = meta.icon; return <article className="resource-card" key={resource.id}><span className="resource-card__icon" style={{ backgroundColor: meta.tint }}><Icon size={19} /></span><div className="resource-card__body"><div className="resource-card__title-row"><h2>{resource.title}</h2><button className="resource-more" aria-label={`More options for ${resource.title}`}><MoreHorizontal size={18} /></button></div><p>{resource.detail}</p><small>{resource.note} · {resource.updated}</small></div></article>; }) : <div className="resources-empty"><Search size={22} /><h2>No sources found</h2><p>Try another search or choose a different source type.</p></div>}</div>
        <div className="resources-add-card"><div><span className="eyebrow">Build your library</span><h2>Add a source for your next lesson.</h2><p>Upload documents or save links so your class materials stay in one calm, searchable place.</p></div><button className="btn btn--soft" type="button"><Plus size={15} />Add source</button></div>
      </section>
    </main>
  </div>;
}
