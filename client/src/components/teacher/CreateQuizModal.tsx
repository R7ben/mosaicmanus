import { useMemo, useState } from "react";
import { X, Plus, Save } from "lucide-react";
import { trpc } from "@/lib/trpc";

type OptionKey = "A" | "B" | "C" | "D";
const optionKeys: OptionKey[] = ["A", "B", "C", "D"];

type Props = { classroomName: string; subject: string; topics: string[]; onClose: () => void; onSaved: () => void };

function emptyOptions(): Record<OptionKey, string> {
  return { A: "", B: "", C: "", D: "" };
}

export default function CreateQuizModal({ classroomName, subject, topics, onClose, onSaved }: Props) {
  const [topic, setTopic] = useState(topics[0] ?? "");
  const [questionText, setQuestionText] = useState("");
  const [options, setOptions] = useState<Record<OptionKey, string>>(emptyOptions());
  const [correctOption, setCorrectOption] = useState<OptionKey>("A");
  const [showHints, setShowHints] = useState(false);
  const [hints, setHints] = useState<Record<OptionKey, string>>(emptyOptions());
  const [addAnother, setAddAnother] = useState(false);

  const misconceptions = trpc.mosaic.misconceptionsForTopic.useQuery({ topic }, { enabled: Boolean(topic && showHints) });

  const resetForm = () => {
    setQuestionText("");
    setOptions(emptyOptions());
    setCorrectOption("A");
    setHints(emptyOptions());
    setShowHints(false);
  };

  const createQuestion = trpc.mosaic.createTeacherQuestion.useMutation({
    onSuccess: () => {
      if (addAnother) {
        resetForm();
      } else {
        onSaved();
        onClose();
      }
    },
  });

  // Validation
  const questionTooShort = questionText.trim().length > 0 && questionText.trim().length < 10;
  const emptyOptions_ = optionKeys.filter((key) => !options[key].trim());
  const valid = topic && questionText.trim().length >= 10 && optionKeys.every((key) => options[key].trim());

  const hintPayload = useMemo(
    () =>
      Object.fromEntries(
        optionKeys
          .filter((key) => key !== correctOption && hints[key])
          .map((key) => [key, Number(hints[key])])
      ),
    [hints, correctOption]
  );

  const handleSave = (another: boolean) => {
    if (!valid || createQuestion.isPending) return;
    setAddAnother(another);
    createQuestion.mutate({
      topic,
      questionText: questionText.trim(),
      options,
      correctOption,
      misconceptionHints: hintPayload,
    });
  };

  return (
    <div
      className="modal-backdrop"
      role="presentation"
      onMouseDown={(event) => {
        if (event.currentTarget === event.target) onClose();
      }}
    >
      <section className="modal-card create-quiz-modal" role="dialog" aria-modal="true" aria-labelledby="create-quiz-title">
        <header className="modal-card__header">
          <div>
            <div className="eyebrow">Teacher-created question</div>
            <h2 id="create-quiz-title">Add a question to {classroomName}</h2>
            <p>Students will see this in their next mission. Their answers will be diagnosed the same way as AI-generated questions.</p>
          </div>
          <button className="icon-button" onClick={onClose} aria-label="Close">
            <X size={18} />
          </button>
        </header>

        <div className="create-quiz-grid">
          <div className="create-quiz-form">
            <label>
              Topic
              <select value={topic} onChange={(event) => setTopic(event.target.value)}>
                {topics.map((item) => (
                  <option key={item}>{item}</option>
                ))}
              </select>
            </label>

            <label>
              Question text
              <textarea
                value={questionText}
                onChange={(event) => setQuestionText(event.target.value)}
                minLength={10}
                placeholder="Type your question here. E.g. What is the unit of force?"
              />
              {questionTooShort && (
                <span className="field-error" style={{ color: "var(--color-error, #c0392b)", fontSize: "0.8rem", marginTop: "4px", display: "block" }}>
                  Question must be at least 10 characters.
                </span>
              )}
            </label>

            <div className="answer-editor">
              <b>Answer options</b>
              {optionKeys.map((key) => (
                <div className="answer-row" key={key}>
                  <span className={correctOption === key ? "answer-label answer-label--correct" : "answer-label"}>{key}</span>
                  <input
                    value={options[key]}
                    onChange={(event) => setOptions((current) => ({ ...current, [key]: event.target.value }))}
                    placeholder={`Option ${key}`}
                  />
                </div>
              ))}
              {emptyOptions_.length > 0 && questionText.trim().length >= 10 && (
                <span style={{ color: "var(--color-error, #c0392b)", fontSize: "0.8rem", marginTop: "4px", display: "block" }}>
                  Please fill in all answer options ({emptyOptions_.join(", ")}).
                </span>
              )}
            </div>

            <fieldset className="correct-selector">
              <legend>Which option is correct?</legend>
              {optionKeys.map((key) => (
                <label key={key}>
                  <input
                    type="radio"
                    name="correct-option"
                    checked={correctOption === key}
                    onChange={() => setCorrectOption(key)}
                  />
                  {key}
                </label>
              ))}
            </fieldset>

            <button className="link-button" type="button" onClick={() => setShowHints((value) => !value)}>
              {showHints ? "Hide misconception hints" : "Add misconception hints (optional)"}
            </button>

            {showHints && (
              <div className="hint-editor">
                {optionKeys
                  .filter((key) => key !== correctOption)
                  .map((key) => (
                    <label key={key}>
                      Wrong option {key}
                      <select
                        value={hints[key]}
                        onChange={(event) => setHints((current) => ({ ...current, [key]: event.target.value }))}
                      >
                        <option value="">Gemini classifies automatically</option>
                        {misconceptions.data?.map((item) => (
                          <option key={item.id} value={item.id}>
                            {item.name}
                          </option>
                        ))}
                      </select>
                    </label>
                  ))}
              </div>
            )}

            {createQuestion.isError && (
              <p style={{ color: "var(--color-error, #c0392b)", fontSize: "0.85rem", marginTop: "8px" }}>
                Failed to save question. Please try again.
              </p>
            )}

            {createQuestion.isSuccess && addAnother && (
              <p style={{ color: "var(--color-success, #27ae60)", fontSize: "0.85rem", marginTop: "8px" }}>
                ✓ Question saved! You can add another below.
              </p>
            )}
          </div>

          <aside className="quiz-live-preview">
            <div className="eyebrow">Student preview</div>
            <h3>{questionText || "Your question will appear here"}</h3>
            {optionKeys.map((key) => (
              <div className={correctOption === key ? "preview-option preview-option--selected" : "preview-option"} key={key}>
                <span>{key}</span>
                {options[key] || `Option ${key}`}
              </div>
            ))}
            <small>
              {subject} · {topic || "Choose a topic"}
            </small>
          </aside>
        </div>

        <footer className="modal-card__footer">
          <button className="btn btn--soft" type="button" onClick={onClose}>
            Cancel
          </button>
          <button
            className="btn btn--student"
            disabled={!valid || createQuestion.isPending}
            title={!valid ? "Fill in the question (min 10 chars) and all 4 answer options to save." : undefined}
            onClick={() => handleSave(false)}
          >
            {createQuestion.isPending && !addAnother ? "Saving…" : "Save question"}
            <Save size={16} />
          </button>
          <button
            className="btn btn--ink"
            type="button"
            disabled={!valid || createQuestion.isPending}
            title={!valid ? "Fill in the question (min 10 chars) and all 4 answer options to save." : undefined}
            onClick={() => handleSave(true)}
          >
            <Plus size={16} />
            {createQuestion.isPending && addAnother ? "Saving…" : "Save and add another"}
          </button>
        </footer>
      </section>
    </div>
  );
}
