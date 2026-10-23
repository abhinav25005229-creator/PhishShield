
import { useState } from "react";
import "./scam-quiz.css";

const questions = [
  {
    tag: "UPI PAYMENT",
    question: "Someone asks you to scan a QR code to receive money. What should you do?",
    options: [
      "Scan it immediately",
      "Enter your UPI PIN",
      "Verify the request; never enter a PIN just to receive money",
      "Share your OTP",
    ],
    answer: 2,
    explanation: "A UPI PIN authorizes a payment from your account. Never enter it just to receive money.",
  },
  {
    tag: "SUSPICIOUS LINK",
    question: "A message threatens to block your bank account unless you click a link immediately. What's safest?",
    options: [
      "Click quickly",
      "Reply with account details",
      "Forward it to friends",
      "Open your official bank app or contact the bank through a trusted channel",
    ],
    answer: 3,
    explanation: "Urgency and threats are common phishing tactics. Avoid the link and verify independently.",
  },
  {
    tag: "JOB SCAM",
    question: "A recruiter asks for a registration fee to guarantee you a job. What should you do?",
    options: [
      "Pay immediately",
      "Verify the employer independently before paying or sharing documents",
      "Send bank details first",
      "Trust the offer because the salary is high",
    ],
    answer: 1,
    explanation: "Upfront fees and unrealistic promises are warning signs. Verify the employer using trusted sources.",
  },
  {
    tag: "OTP SECURITY",
    question: "A caller claiming to be customer support asks for your OTP to cancel a transaction. What is safest?",
    options: [
      "Share it after checking their name",
      "Share only part of it",
      "Hang up and contact the service through its official channel",
      "Send it by text instead",
    ],
    answer: 2,
    explanation: "Never share an OTP with a caller. Contact the bank or service independently.",
  },
  {
    tag: "FAKE PRIZE",
    question: "A message says you won a prize but must pay a processing fee first. What should you do?",
    options: [
      "Pay the fee",
      "Verify the offer independently and don't pay an unexpected fee",
      "Share bank details",
      "Forward the message to claim faster",
    ],
    answer: 1,
    explanation: "Unexpected prize messages demanding upfront payment are a common scam warning sign.",
  },
];


export default function ScamQuiz() {
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState({});
  const [finished, setFinished] = useState(false);

  const question = questions[current];
  const selected = answers[current];
  const answered = selected !== undefined;
  const score = questions.reduce(
    (total, item, index) => total + (answers[index] === item.answer ? 1 : 0),
    0
  );

  function chooseAnswer(index) {
    if (answered) return;
    setAnswers((previous) => ({ ...previous, [current]: index }));
  }

  function nextQuestion() {
    if (current === questions.length - 1) {
      setFinished(true);
    } else {
      setCurrent((value) => value + 1);
    }
  }

  function restartQuiz() {
    setCurrent(0);
    setAnswers({});
    setFinished(false);
  }

  return (
    <section className="scam-quiz" aria-labelledby="scam-quiz-title">
      <div className="quiz-heading">
        <span className="quiz-eyebrow">SECURITY CHALLENGE / 06</span>
        <h2 id="scam-quiz-title">Can You Spot the Scam?</h2>
        <p>
          Test your instincts. Learn the warning signs before a scam catches you.
        </p>
      </div>

      {!finished ? (
        <div className="quiz-card">
          <div className="quiz-topline">
            <span>QUESTION {current + 1} OF {questions.length}</span>
            <span>{Math.round(((current + 1) / questions.length) * 100)}%</span>
          </div>

          <div
            className="quiz-progress"
            role="progressbar"
            aria-label="Quiz progress"
            aria-valuemin={0}
            aria-valuemax={questions.length}
            aria-valuenow={current + 1}
          >
            <span style={{ width: `${((current + 1) / questions.length) * 100}%` }} />
          </div>

          <span className="quiz-tag">{question.tag}</span>
          <h3 className="quiz-question">{question.question}</h3>

          <div className="quiz-options">
            {question.options.map((option, index) => {
              const isCorrect = index === question.answer;
              const isSelected = selected === index;
              let stateClass = "";

              if (answered && isCorrect) stateClass = "correct";
              else if (answered && isSelected) stateClass = "incorrect";

              return (
                <button
                  type="button"
                  key={option}
                  className={`quiz-option ${stateClass}`}
                  onClick={() => chooseAnswer(index)}
                  disabled={answered}
                >
                  <span className="quiz-option-letter">
                    {String.fromCharCode(65 + index)}
                  </span>
                  <span>{option}</span>
                  {answered && isCorrect && (
                    <span className="quiz-option-result">✓</span>
                  )}
                  {answered && isSelected && !isCorrect && (
                    <span className="quiz-option-result">×</span>
                  )}
                </button>
              );
            })}
          </div>

          {answered && (
            <div
              className={`quiz-feedback ${selected === question.answer ? "success" : "warning"}`}
              role="status"
            >
              <strong>
                {selected === question.answer
                  ? "Correct — nice catch!"
                  : "Not quite. Here's the safer choice."}
              </strong>
              <p>{question.explanation}</p>
            </div>
          )}

          <div className="quiz-footer">
            <span className="quiz-score">
              SCORE <strong>{score}/{questions.length}</strong>
            </span>
            <button
              type="button"
              className="quiz-next"
              onClick={nextQuestion}
              disabled={!answered}
            >
              {current === questions.length - 1 ? "See Results →" : "Next Question →"}
            </button>
          </div>
        </div>
      ) : (
        <div className="quiz-result" aria-live="polite">
          <span className="quiz-eyebrow">CHALLENGE COMPLETE</span>
          <div className="quiz-result-score">{score}<span> / {questions.length}</span></div>
          <h3>
            {score === 3
              ? "Excellent scam awareness!"
              : score === 2
                ? "Good instincts. Stay alert!"
                : "Keep learning. Pause before you trust."}
          </h3>
          <p>
            {score === 3
              ? "You spotted all three warning signs. Keep verifying unexpected requests."
              : "Review the explanations and remember: pause, verify independently, and never share your PIN or OTP."}
          </p>
          <button type="button" className="quiz-next" onClick={restartQuiz}>
            ↻ Play Again
          </button>
        </div>
      )}

      <p className="quiz-disclaimer">
        Educational examples only. Real scams can look different; verify suspicious requests independently.
      </p>
    </section>
  );
}
