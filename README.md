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

## Core Features

### Teacher and educator workspace

The teacher experience provides a classroom dashboard with class summaries, learner counts, quiz activity, attendance signals, analytics, and intervention-oriented prompts. Educators can open classrooms, define subjects and topics, build chapters, upload quiz content, and manage materials before publishing them to learners.

The teacher question bank supports manually authored questions with four answer options, a correct answer, topic metadata, and optional misconception hints. Questions can be activated or deactivated, reviewed in the quiz library, and surfaced to students as part of future learning missions.

### Student learning experience

Students can access the platform through a secure student entry flow or through the shared-device kiosk. The student mission presents a focused question, confidence choices such as **“I knew this,” “Not sure,”** and **“I guessed,”** and immediate feedback after submission.

The experience is intentionally small-step oriented. Rather than overwhelming learners with a large course catalogue, it presents a clear warm-up, practice, and reflection path. Learner signals such as mastery, confidence, misconception patterns, and progress tiers can be used by teachers and tutors to choose the next support action.

### Shared-device kiosk mode

Kiosk mode allows a student to join a classroom using a teacher-provided code. The flow verifies the classroom, lets the student enter their name, and opens the active learning mission without requiring a personal account. The kiosk supports offline-ready answer handling so responses can be queued locally and synchronized when the connection returns.

The kiosk includes a reliable Exit kiosk control that returns users to the main landing page and exits browser fullscreen before navigation when fullscreen is active.

### Quizzes and question management

Teachers can create quiz questions, upload quiz files, review question previews, attach quizzes to chapters, and browse saved questions in the quiz library. Saved teacher questions are represented as visible quiz cards with topic, status, and question count so a successful save is immediately discoverable.

The application also includes validation and visible save-error feedback so malformed or rejected questions do not fail silently.

### Learning analytics and intervention signals

The dashboard organizes learners into actionable states such as practice, repair, and rebuild-oriented support. Teachers can inspect class momentum, review learner performance, identify recurring misconceptions, and launch pulse checks or other short assessments to collect fresh evidence.

Student review and analytics views provide access to answer history, accuracy, questions to revisit, common errors, and revisit actions. Notifications and classroom activity surfaces help keep important signals visible.

### Tutor and AI-assisted support

Tutor-oriented features provide structured support resources and classroom context. The server also exposes AI-assisted procedures for generating questions and preparation plans, together with a tutor response flow that can explain difficult concepts in a more approachable way.

These features are intended to support educators rather than replace their judgment. The teacher remains responsible for selecting, reviewing, and applying instructional interventions.

### Authentication and production infrastructure

The application runs as a Manus-hosted full-stack web project with Manus authentication, a tRPC API layer, Drizzle ORM, and a MySQL/TiDB-compatible database. The project includes production runtime configuration, database-backed classroom data, server procedures, Vitest regression tests, and a published Manus deployment.

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
| `/teacher/quiz` | Quiz library and saved teacher-question cards |
| `/teacher/quiz/create` | Create a quiz question |
| `/teacher/class` | Classroom details and learner context |
| `/educator` | Educator workspace for chapters, uploads, and question management |
| `/student` | Student dashboard |
| `/student/analytics` | Student progress and analytics |
| `/student/review` | Student answer review and revisit flow |
| `/student/quiz` | Student quiz library |
| `/kiosk` | Shared-device classroom entry and active mission |
| `/join/:code` | Live classroom joining flow |
| `/tutor/perks` | Tutor support and available perks |
| `/roadmap` | Product roadmap and future direction |

## Technical Architecture

| Layer | Current implementation |
| --- | --- |
| Frontend | React 19, Vite, Wouter, Tailwind CSS 4, Radix UI primitives, Lucide icons |
| API | Express with tRPC 11 for typed client-server procedures |
| Data access | Drizzle ORM with a MySQL/TiDB-compatible database |
| Authentication | Manus OAuth and session infrastructure |
| Offline support | Local answer queue with synchronization when connectivity returns |
| Testing | Vitest regression suite covering authentication, classroom behavior, quiz views, and kiosk-exit sequencing |
| Production hosting | Manus web hosting with autoscaling runtime and persistent project deployment |

## Local Development

### Prerequisites

Install Node.js and pnpm, then make sure the required Manus environment variables and database configuration are available through the project environment. Do not commit secrets or local `.env` files.

### Install dependencies

```bash
pnpm install
```

### Run the development server

```bash
pnpm dev
```

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

**[mosaicclass-8npkyvm5.manus.space](https://mosaicclass-8npkyvm5.manus.space)**

Production deployment should continue to use managed secrets and the hosted database rather than committing credentials or relying on local files. Any future schema change should be generated through the project migration workflow and applied to the hosted database deliberately.

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

Future releases should add role-based authorization at every server procedure, audit logs for sensitive classroom changes, rate limiting, automated backups, structured monitoring, and end-to-end tests for the highest-value teacher and student flows.

### Product integrations

Potential integrations include school identity providers, learning-management systems, calendar systems, classroom roster imports, secure file storage, notification channels, and standards or curriculum repositories.

## Project Status

Mosaic Classroom is a functioning Manus-hosted prototype with teacher, student, tutor, quiz, analytics, shared-device kiosk, database, authentication, and production deployment foundations in place. The most important next step is to strengthen authorization and multi-class data isolation before broad institutional rollout.

## References

[1] [Mosaic Classroom Canva brief](https://canva.link/i3tmf3htzk2qqjq)

[2] [Published Mosaic Classroom website](https://mosaicclass-8npkyvm5.manus.space)

## Source Material

The product framing was supplied through the shared Canva project brief and cross-checked against the current published application:

- [Mosaic Classroom Canva brief](https://canva.link/i3tmf3htzk2qqjq)
- [Published Mosaic Classroom website](https://mosaicclass-8npkyvm5.manus.space)

