# Mosaic Classroom

Mosaic Classroom is a formative-learning platform for teachers, students, and tutors. It connects classroom planning, shared-device participation, quick assessments, misconception feedback, and learner analytics in one workflow.

The project is designed around a simple idea: **every student should have a clear next step, while teachers should have timely evidence about what students understand and where they need support.**

## Overview

Traditional classroom tools often separate lesson planning, assessment, student participation, and intervention data. This creates extra work for teachers and makes it difficult to respond to misconceptions while learning is still taking place. Students may also need to join lessons from shared devices without creating an account or navigating a complex learning-management system.

Mosaic Classroom addresses this gap with a role-aware classroom workspace and a lightweight student kiosk experience. Teachers can organize classroom content, create chapters and quizzes, author targeted questions, review learner signals, and launch short pulse checks. Students can join with a classroom code, answer questions from a shared device, report their confidence, and receive immediate formative feedback. Tutors and educators can use the same classroom signals to guide targeted support.

## Problem Statement

Teachers need a practical way to move from **“I delivered the lesson”** to **“I know what each learner needs next.”** The main challenges are:

| Challenge | Classroom impact | Mosaic Classroom response |
| --- | --- | --- |
| Assessment and lesson planning are disconnected | Teachers spend time moving information between tools | Chapters, quizzes, questions, and classroom activity are managed in one workspace |
| Misconceptions are discovered too late | Students continue practicing an incorrect mental model | Immediate answer feedback and misconception-oriented learner signals support earlier intervention |
| Shared-device participation is difficult | Students lose time on account creation and login flows | A classroom code and kiosk mode let learners join without a personal account |
| Feedback is too generic | Students may know whether an answer was right but not what to do next | Confidence capture and targeted explanations turn answers into next-step guidance |
| Classroom data is hard to act on | Dashboards show activity without an instructional response | Learner tiers, analytics, response patterns, and intervention prompts connect data to action |
| Teachers don't know how to use a new feature | Underused tools and support tickets | Inline contextual help (a "?" badge with a plain-language explanation) is attached to every major dashboard panel |

## Core Features

### Teacher workspace

The teacher experience is a single dashboard (`/teacher`) with a sidebar covering Dashboard, Classes, Content, Students, Learning groups, Quizzes, Analytics, Kiosk, and Settings. `/teacher/analytics` and `/teacher/students` are real, deep-linkable routes into the same dashboard with the matching tab pre-selected — refreshing or bookmarking either one lands you back on that tab instead of the overview.

A command palette (⌘K / Ctrl+K) lets a teacher jump straight to a class, a student, or a common action (create a quiz, start a live session, open kiosk mode) without navigating the sidebar by hand.

The Content tab covers chapter creation and question authoring: quizzes with four answer options, a correct answer, topic metadata, and optional misconception hints. Questions can be activated or deactivated, reviewed in the quiz library, and published to students.

### Student learning experience

Students can access the platform through a secure student entry flow (`/student`) or through the shared-device kiosk (`/kiosk`). Every mission — "Continue mission," "Open mission," "Start practice," "Practice now" — sends an authenticated student to `/student/practice`, a dedicated practice runner that already knows who they are; it never bounces them through the kiosk's class-code entry.

The practice runner presents a focused question, confidence choices ("I knew this," "Unsure," "I guessed"), and immediate feedback after submission. Three seeded Forces & Motion questions ship with the project — including one that directly targets the mass/weight misconception — so a fresh classroom has real content to try instead of placeholder text.

The experience is intentionally small-step oriented. Rather than overwhelming learners with a large course catalogue, it presents a clear warm-up, practice, and reflection path. Learner signals such as mastery, confidence, misconception patterns, and progress tiers can be used by teachers and tutors to choose the next support action.

### Shared-device kiosk mode

Kiosk mode allows a student to join a classroom using a teacher-provided code. The flow verifies the classroom, lets the student enter their name, and opens the active learning mission without requiring a personal account. The kiosk supports offline-ready answer handling so responses can be queued locally (tagged with the specific question answered) and synchronized when the connection returns.

The quiz runner is built to never render a blank screen: if a classroom has no published quizzes it falls back to a built-in practice quiz, and if a selected quiz genuinely has no questions it shows a visible error card with a retry action instead of a silent blank page.

The kiosk includes a reliable Exit kiosk control that returns users to the main landing page and exits browser fullscreen before navigation when fullscreen is active.

### Quizzes and question management

Teachers can create quiz questions, upload quiz files, review question previews, attach quizzes to chapters, and browse saved questions in the quiz library. Saved teacher questions are represented as visible quiz cards with topic, status, and question count so a successful save is immediately discoverable.

The application also includes validation and visible save-error feedback so malformed or rejected questions do not fail silently.

### Learning analytics and intervention signals

The dashboard organizes learners into actionable states such as practice, repair, and rebuild-oriented support. Teachers can inspect class momentum, review learner performance, identify recurring misconceptions, and launch pulse checks or other short assessments to collect fresh evidence.

Student review and analytics views provide access to answer history, accuracy, questions to revisit, common errors, and revisit actions — "Practice now" and "Revisit this topic" send the student straight into the practice runner. Notifications and classroom activity surfaces help keep important signals visible.

### Tutor and AI-assisted support

Tutor-oriented features provide structured support resources and classroom context. The server also exposes AI-assisted procedures for generating questions and preparation plans, together with a tutor response flow that can explain difficult concepts in a more approachable way.

These features are intended to support educators rather than replace their judgment. The teacher remains responsible for selecting, reviewing, and applying instructional interventions.

### Trust, privacy, and session security

A Terms of Use / Privacy Policy modal is reachable from the login page footer, the teacher sidebar, and a "Your data is private" card in the student sidebar — all backed by one shared content file so the text is maintained in a single place.

Session tokens are short-lived (30 days, down from a full year) and carry a version stamp: signing out immediately invalidates that token server-side, rather than leaving it usable until it naturally expires.

### Visual design

The interface uses a liquid-glass surface treatment (soft blur, saturated Mosaic palette) with GSAP-driven motion for transitions, the role-toggle pill in the "How it works" tutorial, and scroll-triggered reveals — layered on top of the existing Radix UI/Tailwind component system, not a replacement for it.

### Authentication and production infrastructure

The application runs as a Manus-hosted full-stack web project with Manus authentication, a tRPC API layer, Drizzle ORM, and a MySQL/TiDB-compatible database. The project includes production runtime configuration, database-backed classroom data, server procedures, Vitest regression tests, and a published Manus deployment.

For local development without Manus OAuth configured, a `NODE_ENV !== "production"`-only `/api/dev-login` route and an in-memory user/session fallback let the app run and be exercised end to end without a real database or OAuth server — see [Local Development](#local-development).

## How the Solution Addresses the Problem

Mosaic Classroom solves the central problem by making the instructional loop shorter and more observable:

1. **Plan:** The teacher opens a classroom, defines topics, creates chapters, and prepares quizzes or targeted questions.
2. **Engage:** Students join through authenticated access or a shared-device classroom code.
3. **Check:** Students answer a focused question and report how confident they were.
4. **Interpret:** The system combines correctness, confidence, misconception signals, and learner progress.
5. **Respond:** Teachers and tutors use the resulting signals to choose a pulse check, explanation, practice activity, or revisit action.
6. **Repeat:** New classroom evidence updates the next instructional decision.

This workflow reduces the distance between classroom activity and teacher action. It also gives students feedback that is more useful than a binary correct/incorrect result because it considers both the answer and the learner’s confidence.

## User Roles

| Role | Primary goal | Main capabilities |
| --- | --- | --- |
| Teacher / educator | Understand class progress and decide what to do next | Manage classrooms, chapters, quizzes, questions, learners, analytics, notifications, and live classroom activities |
| Student | Participate in a focused learning mission | Join a class, answer questions, report confidence, receive feedback, review progress, and revisit difficult topics |
| Tutor | Provide targeted learner support | Access learner signals, use support resources, and guide students through misconceptions and next steps |
| Shared-device learner | Join without an individual account | Enter a classroom code, confirm a name, complete a mission, work offline when needed, and exit kiosk mode safely |

## Application Routes

| Route | Purpose |
| --- | --- |
| `/` | Teacher and student entry experience |
| `/teacher` | Teacher dashboard and classroom overview |
| `/teacher/analytics` | Teacher dashboard, deep-linked to the Analytics tab |
| `/teacher/students` | Teacher dashboard, deep-linked to the Students (cohort map) tab |
| `/teacher/settings` | Classroom details and access settings |
| `/teacher/quiz` | Quiz library and saved teacher-question cards |
| `/teacher/quiz/create` | Create a quiz question |
| `/teacher/class` | Classroom details and learner context |
| `/student` | Student dashboard |
| `/student/practice` | Authenticated practice runner (no class code needed) |
| `/student/analytics` | Student progress and analytics |
| `/student/review` | Student answer review and revisit flow |
| `/student/quiz` | Student quiz library |
| `/kiosk` | Shared-device classroom entry and active mission |
| `/join/:code` | Live classroom joining flow |
| `/tutor/perks` | Tutor support and available perks |
| `/roadmap` | Product roadmap and future direction |

`/educator` and the old `/login/educator` and `/login/student` links now redirect into `/teacher` and `/`, respectively — that workspace was folded into the main teacher dashboard's Content tab.

## Technical Architecture

| Layer | Current implementation |
| --- | --- |
| Frontend | React 19, Vite, Wouter, Tailwind CSS 4, Radix UI primitives, Lucide icons, Framer Motion, GSAP |
| API | Express with tRPC 11 for typed client-server procedures |
| Data access | Drizzle ORM with a MySQL/TiDB-compatible database (falls back to an in-memory store for local dev without `DATABASE_URL`) |
| Authentication | Manus OAuth and session infrastructure, with a local-only dev-login bypass for running without it |
| Offline support | Local answer queue (tagged per question) with synchronization when connectivity returns |
| Testing | Vitest regression suite covering authentication, session revocation, classroom behavior, quiz views, and kiosk-exit sequencing |
| Production hosting | Manus web hosting with autoscaling runtime and persistent project deployment |

## Local Development

### Prerequisites

Node.js and pnpm (via `corepack enable`). No database or Manus OAuth credentials are required to run the app locally — see below.

### Install dependencies

```bash
pnpm install
```

### Run the development server

```bash
pnpm dev
```

This starts the app at `http://localhost:3000`. Without `DATABASE_URL` set, classroom data falls back to an in-memory/demo dataset, and without `OAUTH_SERVER_URL` set, the login page shows dev-only "Sign in as teacher" / "Sign in as student" links (backed by `/api/dev-login`) so you can exercise the full app without real Manus infrastructure. Neither the fallback store nor the dev-login route exist in production builds.

A `JWT_SECRET` is required even locally (session signing fails without one) — set any value in a local `.env` file, which is already git-ignored.

### Validate the project

```bash
pnpm run check
pnpm test
pnpm run build
```

### Format the code

```bash
pnpm run format
```

## Production Readiness

The project has been ported into a persistent Manus web project and has been validated with typechecking, production builds, database-backed flows, live browser checks, and regression tests. The published application is available at:

**[mosaicclass-3drrpiin.manus.space](https://mosaicclass-3drrpiin.manus.space/)**

Production deployment should continue to use managed secrets and the hosted database rather than committing credentials or relying on local files. Any future schema change should be generated through the project migration workflow and applied to the hosted database deliberately.

> **Before deploying:** the current Terms of Use / Privacy Policy content (`client/src/lib/policies.ts`) is draft boilerplate, not reviewed legal text, and the "PDPA 2010 Compliant" badge shown alongside it is an unverified compliance claim. Replace the copy and confirm compliance before this reaches real students and teachers.

## Future Improvements

### Multi-class and multi-tenant support

The current product model is centered on a primary classroom experience. A mature release should support multiple independent classrooms per teacher, explicit ownership, invitations, organization-level administration, and stricter tenant isolation for every classroom query and mutation.

### Richer assessment authoring

Future authoring tools could support question types beyond multiple choice, reusable question templates, image and equation content, rubric-based responses, question versioning, bulk editing, and scheduled publishing.

### Deeper intervention workflows

The learner-signal model could evolve into intervention plans that combine a misconception, a recommended activity, a deadline, an assigned tutor, and a measurable follow-up check. Teachers could then track whether an intervention changed a learner’s performance rather than only viewing the original error.

### Improved analytics and reporting

Additional reporting could include longitudinal growth, subgroup comparisons, exportable reports, standards alignment, attendance-to-performance relationships, and privacy-aware summaries for families or school leaders.

### Accessibility and localization

The interface should continue to improve keyboard navigation, screen-reader semantics, reduced-motion behavior, color contrast, language localization, and support for low-bandwidth or low-spec devices.

### Stronger operational safeguards

Future releases should add role-based authorization at every server procedure, audit logs for sensitive classroom changes, rate limiting, automated backups, structured monitoring, and end-to-end tests for the highest-value teacher and student flows. The class-details student count (`classStudents`) currently expects a numeric classroom id but receives a slug from the workspace query, so it under-reports enrollment — this should be fixed before relying on that figure operationally.

### Product integrations

Potential integrations include school identity providers, learning-management systems, calendar systems, classroom roster imports, secure file storage, notification channels, and standards or curriculum repositories.

## Project Status

Mosaic Classroom is a functioning Manus-hosted prototype with teacher, student, tutor, quiz, analytics, shared-device kiosk, database, authentication, and production deployment foundations in place. Recent work fixed a deep-linking bug that logged out valid teacher sessions on sub-routes, repaired the student practice flow (blank kiosk pages, mission links dead-ending at the kiosk, placeholder quiz content), tightened session security, and added a full visual restyle. The most important next steps are fixing the class-details student count, resolving a known tutorial-modal auto-reopen race condition, and strengthening authorization and multi-class data isolation before broad institutional rollout.

## References

[1] [Mosaic Classroom Canva brief](https://canva.link/i3tmf3htzk2qqjq)

[2] [Published Mosaic Classroom website](https://mosaicclass-3drrpiin.manus.space/)

## Source Material

The product framing was supplied through the shared Canva project brief and cross-checked against the current published application:

- [Mosaic Classroom Canva brief](https://canva.link/i3tmf3htzk2qqjq)
- [Published Mosaic Classroom website](https://mosaicclass-3drrpiin.manus.space/)
