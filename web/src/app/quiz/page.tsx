"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

interface Question {
  id: string;
  question: string;
  options: { value: string; label: string; tags: string[] }[];
}

const QUESTIONS: Question[] = [
  {
    id: "phase",
    question: "Où en êtes-vous dans votre cycle de vie ?",
    options: [
      { value: "menstrual", label: "Cycle menstruel régulier", tags: ["cycle"] },
      { value: "trying", label: "En projet de grossesse", tags: ["hormones", "energy"] },
      { value: "perimeno", label: "Périménopause", tags: ["hormones", "sleep"] },
      { value: "postpartum", label: "Post-partum", tags: ["energy", "skin"] }
    ]
  },
  {
    id: "goal",
    question: "Quel est votre objectif principal ?",
    options: [
      { value: "energy", label: "Plus d'énergie au quotidien", tags: ["energy"] },
      { value: "sleep", label: "Mieux dormir", tags: ["sleep"] },
      { value: "skin", label: "Améliorer ma peau", tags: ["skin"] },
      { value: "balance", label: "Apaiser mon cycle", tags: ["cycle"] }
    ]
  },
  {
    id: "stress",
    question: "Comment décririez-vous votre niveau de stress ?",
    options: [
      { value: "low", label: "Modéré, gérable", tags: [] },
      { value: "med", label: "Souvent élevé", tags: ["sleep", "energy"] },
      { value: "high", label: "Permanent, difficile", tags: ["sleep", "hormones"] }
    ]
  },
  {
    id: "immunity",
    question: "Tombez-vous facilement malade aux changements de saison ?",
    options: [
      { value: "no", label: "Non, rarement", tags: [] },
      { value: "sometimes", label: "Parfois", tags: ["immunity"] },
      { value: "yes", label: "Oui, régulièrement", tags: ["immunity"] }
    ]
  },
  {
    id: "format",
    question: "Préférez-vous une cure ponctuelle ou un abonnement ?",
    options: [
      { value: "once", label: "Cure ponctuelle", tags: [] },
      { value: "sub", label: "Abonnement mensuel", tags: [] }
    ]
  }
];

const TAG_TO_SLUGS: Record<string, string[]> = {
  cycle: ["cycle-equilibre"],
  energy: ["energie-feminine"],
  sleep: ["sommeil-profond"],
  skin: ["peau-eclat"],
  immunity: ["immunite-bouclier"],
  hormones: ["hormones-serenes"]
};

const SLUG_TO_NAME: Record<string, string> = {
  "cycle-equilibre": "Cycle Équilibré",
  "energie-feminine": "Énergie Féminine",
  "sommeil-profond": "Sommeil Profond",
  "peau-eclat": "Peau & Éclat",
  "immunite-bouclier": "Immunité Bouclier",
  "hormones-serenes": "Hormones Sereines"
};

export default function QuizPage() {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const recommendations = useMemo(() => {
    if (Object.keys(answers).length < QUESTIONS.length) return [];
    const tagCount: Record<string, number> = {};
    for (const q of QUESTIONS) {
      const ansVal = answers[q.id];
      const opt = q.options.find((o) => o.value === ansVal);
      opt?.tags.forEach((t) => {
        tagCount[t] = (tagCount[t] ?? 0) + 1;
      });
    }
    const sortedTags = Object.entries(tagCount)
      .sort((a, b) => b[1] - a[1])
      .map(([t]) => t);
    const slugs: string[] = [];
    for (const t of sortedTags) {
      for (const s of TAG_TO_SLUGS[t] ?? []) {
        if (!slugs.includes(s)) slugs.push(s);
      }
    }
    if (slugs.length === 0) slugs.push("cycle-equilibre", "energie-feminine");
    return slugs.slice(0, 3);
  }, [answers]);

  const isLast = step === QUESTIONS.length - 1;
  const finished = Object.keys(answers).length === QUESTIONS.length;

  const handleSelect = (questionId: string, value: string) => {
    setAnswers((a) => ({ ...a, [questionId]: value }));
    if (!isLast) {
      setTimeout(() => setStep((s) => s + 1), 250);
    }
  };

  const submit = async () => {
    await fetch("/api/quiz", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: email || undefined,
        answers,
        recommendedSlugs: recommendations
      })
    });
    setSubmitted(true);
  };

  if (finished) {
    return (
      <div className="container-x py-16">
        <p className="eyebrow">Vos résultats</p>
        <h1 className="h-display mt-2">Votre rituel personnalisé</h1>
        <p className="mt-4 max-w-xl text-ink/70">
          D'après vos réponses, voici les compléments que nous vous recommandons en priorité.
        </p>
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {recommendations.map((slug, i) => (
            <Link
              key={slug}
              href={`/products/${slug}`}
              className="rounded-2xl border border-ink/10 bg-cream-50 p-6 transition hover:border-sage-700"
            >
              <p className="eyebrow">Recommandation {i + 1}</p>
              <h3 className="mt-3 font-serif text-2xl">{SLUG_TO_NAME[slug]}</h3>
              <p className="mt-3 text-sm text-ink/60">Découvrir →</p>
            </Link>
          ))}
        </div>

        <div className="mt-12 max-w-md rounded-2xl bg-cream-100 p-6">
          <h3 className="font-serif text-xl">Recevoir mes résultats par email</h3>
          {submitted ? (
            <p className="mt-3 text-sm text-sage-700">✓ Merci, vos résultats ont été enregistrés.</p>
          ) : (
            <>
              <p className="mt-2 text-sm text-ink/60">Optionnel, on vous enverra un récap.</p>
              <div className="mt-4 flex gap-2">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="votre@email.com"
                  className="flex-1 rounded-full border border-ink/20 bg-cream-50 px-5 py-3 text-sm focus:border-sage-700 focus:outline-none"
                />
                <button onClick={submit} className="btn-primary">
                  Envoyer
                </button>
              </div>
            </>
          )}
        </div>

        <button
          onClick={() => {
            setAnswers({});
            setStep(0);
            setSubmitted(false);
          }}
          className="mt-8 text-sm underline-offset-4 hover:underline"
        >
          ← Refaire le diagnostic
        </button>
      </div>
    );
  }

  const currentQuestion = QUESTIONS[step];

  return (
    <div className="container-x py-16">
      <p className="eyebrow">
        Diagnostic — {step + 1} / {QUESTIONS.length}
      </p>
      <div className="mt-3 h-1 w-full overflow-hidden rounded-full bg-cream-200">
        <div
          className="h-full bg-sage-700 transition-all duration-500"
          style={{ width: `${((step + 1) / QUESTIONS.length) * 100}%` }}
        />
      </div>

      <h1 className="h-display mt-10 max-w-2xl">{currentQuestion.question}</h1>

      <div className="mt-10 grid gap-3 sm:grid-cols-2">
        {currentQuestion.options.map((opt) => {
          const active = answers[currentQuestion.id] === opt.value;
          return (
            <button
              key={opt.value}
              onClick={() => handleSelect(currentQuestion.id, opt.value)}
              className={`rounded-2xl border px-6 py-5 text-left transition ${
                active
                  ? "border-sage-700 bg-sage-700 text-cream-50"
                  : "border-ink/15 hover:border-ink"
              }`}
            >
              <span className="font-serif text-lg">{opt.label}</span>
            </button>
          );
        })}
      </div>

      <div className="mt-10 flex items-center justify-between">
        <button
          onClick={() => setStep((s) => Math.max(0, s - 1))}
          disabled={step === 0}
          className="text-sm text-ink/60 hover:text-ink disabled:opacity-30"
        >
          ← Précédent
        </button>
        {isLast && answers[currentQuestion.id] && (
          <button onClick={() => setStep(step)} className="btn-primary">
            Voir mes résultats
          </button>
        )}
      </div>
    </div>
  );
}
