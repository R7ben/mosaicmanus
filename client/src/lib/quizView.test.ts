import { describe, expect, it } from "vitest";
import { mergeTeacherQuestions } from "./quizView";

describe("quiz library view model", () => {
  it("includes saved teacher questions alongside classroom quizzes", () => {
    const cards = mergeTeacherQuestions(
      [{ id: "quiz-1", title: "Mass check", questionCount: 3, published: true }],
      [{ id: "42", topic: "Forces & Motion", questionText: "What force pulls objects toward Earth?", isActive: true, createdAt: "2026-09-05T15:00:00.000Z" }],
    );

    expect(cards).toHaveLength(2);
    expect(cards[1]).toMatchObject({
      id: "teacher-question-42",
      title: "What force pulls objects toward Earth?",
      topic: "Forces & Motion",
      status: "Active",
      questionCount: 1,
      isTeacherQuestion: true,
    });
  });
});
