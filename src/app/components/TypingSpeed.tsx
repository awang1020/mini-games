"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";

type Duration = 30 | 60 | 120 | 180;

type SecondSample = {
  second: number;
  words_typed: number; // words submitted during this second (correct+incorrect)
  chars_typed: number; // total characters typed during this second (raw, excluding backspace)
  correct_chars: number; // newly added correct chars this second
  incorrect_chars: number; // newly added incorrect chars this second
  cumulative_words: number; // total submitted words up to this second
  cumulative_chars: number; // total chars typed up to this second
};

// Simple LCG RNG for deterministic shuffling
function seededRandom(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 0xffffffff;
  };
}

function shuffle<T>(arr: T[], seed: number): T[] {
  const a = arr.slice();
  const rnd = seededRandom(seed);
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// Built‑in 300 common French words
const WORDS_FR: string[] = [
  "le","de","un","être","et","à","il","avoir","ne","je","son","que","se","qui","ce","dans","en","du","elle","au","deux","mais","nous","vous","par","sur","pas","plus","pouvoir","avec","tout","faire","son","mettre","autre","on","même","très","sans","leur","si","temps","savoir","falloir","voir","quel","donner","prendre","où","aller","vouloir","bien","petit","aussi","devoir","avant","deux","premier","grand","mon","moi","jour","trouver","personne","rendre","part","dernier","venir","passer","peu","lequel","suite","bon","comprendre","depuis","point","ainsi","heure","rester","terre","parler","certain","femme","aimer","mieux","seul","année","toujours","temps","homme","chose","croire","monde","demander","alors","après","vie","sans","dieu","semaine","petit","moment","prendre","gouvernement","main","cas","yeux","aller","travail","place","chacun","tête","jeune","question","soir","relire","projet","groupe","ville","père","force","air","école","côté","milieu","rue","raison","mois","chef","idée","droit","mission","moindre","plein","loin","front","sens","mille","suite","durant","avenir","façon","type","partie","suite","bientôt","toujours","parmi","histoire","long","corps","quartier","ordre","route","service","président","écrire","genre","rapport","famille","mari","fille","garçon","ami","souvent","moyen","haut","bas","oublier","ouvrir","fermer","poser","tirer","tenir","porter","écouter","entendre","regarder","voir","sentir","penser","perdre","gagner","compter","jouer","rire","pleurer","vivre","mourir","naître","devenir","revenir","entrer","sortir","monter","descendre","tomber","arriver","partir","rester","retourner","appeler","répondre","élever","changer","continuer","arrêter","commencer","finir","travailler","étudier","lire","écrire","dire","parler","manger","boire","dormir","se lever","s’asseoir","courir","marcher","acheter","vendre","payer","apprendre","enseigner","penser","sourire","souvenir","attendre","choisir","décider","aider","montrer","essayer","utiliser","rechercher","trouver","créer","imaginer","réussir","protéger","aimer","adorer","détester","changer","préparer","cuisiner","nettoyer","ranger","voyager","visiter","rencontrer","inviter","accepter","refuser","envoyer","recevoir","rentrer","sortir","partager","proposer","organiser","communiquer","supporter","porter","remplacer","amener","emmener","raconter","préciser","confirmer","annuler","prévoir","réserver","déjeuner","dîner","goûter","fêter","danser","chanter","dessiner","peindre","filmer","photographier","programmer","coder","tester","jouer","nager","sauter","skier","conduire","rouler","voler","réparer","installer","brancher","charger","connecter","éteindre","allumer","cliquer","taper","glisser","déposer","envoyer","imprimer","sauvegarder","charger","créer","supprimer","modifier","sélectionner","copier","coller","couper","rechercher","remplacer","déplacer","terminer","valider","confirmer","annuler","ouvrir","fermer","archiver","publier","partager","suivre","aider","noter","comparer","analyser","mesurer","calmer","respirer","penser","rêver","espérer","croire","sourire","remercier","féliciter","encourager","progresser","réfléchir","méditer","apprécier","profiter"
];

// Build sentence-like stream with punctuation (deterministic per seed)
function capitalizeFirst(w: string) {
  if (!w) return w;
  return w[0].toUpperCase() + w.slice(1);
}

function buildPunctuatedWords(words: string[], enable: boolean, seed: number) {
  if (!enable) return words;
  const rnd = seededRandom(seed + 77);
  const enders = [".", ".", ".", "!", "?"]; // weighted towards period
  const commas = [",", ",", ";", ":"]; // internal punctuation
  const out: string[] = [];
  let i = 0;
  while (i < words.length) {
    // sentence length 6..10 words
    const len = 6 + Math.floor(rnd() * 5);
    const end = Math.min(words.length, i + len);
    for (let j = i; j < end; j++) {
      let w = words[j];
      // capitalize sentence start
      if (j === i) w = capitalizeFirst(w);
      // randomly add comma to some middle words
      if (j > i && j < end - 1 && rnd() < 0.2) {
        w = w + commas[Math.floor(rnd() * commas.length)];
      }
      // sentence end punctuation on last word of sentence
      if (j === end - 1) {
        w = w + enders[Math.floor(rnd() * enders.length)];
      }
      out.push(w);
    }
    i = end;
  }
  return out;
}

export default function TypingSpeed() {
  const [duration, setDuration] = useState<Duration>(60);
  const [includePunct, setIncludePunct] = useState(false);
  const [running, setRunning] = useState(false);
  const [ended, setEnded] = useState(false);
  const [timeLeft, setTimeLeft] = useState<number>(60);
  const [seed, setSeed] = useState<number>(() => Date.now());

  // Stats
  const [currentIndex, setCurrentIndex] = useState(0);
  const [input, setInput] = useState("");
  const [correctWords, setCorrectWords] = useState(0);
  const [incorrectWords, setIncorrectWords] = useState(0);
  const [totalKeystrokes, setTotalKeystrokes] = useState(0);
  const [correctKeystrokes, setCorrectKeystrokes] = useState(0);
  const [incorrectKeystrokes, setIncorrectKeystrokes] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [streak, setStreak] = useState(0);
  const [samples, setSamples] = useState<SecondSample[]>([]);

  const inputRef = useRef<HTMLInputElement>(null);
  const startedAtRef = useRef<number | null>(null);
  const prevInputRef = useRef<string>("");
  const intervalRef = useRef<number | null>(null);
  const totalKSRef = useRef(0);
  const correctKSRef = useRef(0);
  const incorrectKSRef = useRef(0);
  const corrWordsRef = useRef(0);
  const incorrWordsRef = useRef(0);

  useEffect(() => {
    totalKSRef.current = totalKeystrokes;
    correctKSRef.current = correctKeystrokes;
    incorrectKSRef.current = incorrectKeystrokes;
    corrWordsRef.current = correctWords;
    incorrWordsRef.current = incorrectWords;
  }, [totalKeystrokes, correctKeystrokes, incorrectKeystrokes, correctWords, incorrectWords]);

  const wordsQueue = useMemo(() => {
    const base = shuffle(WORDS_FR, seed);
    const withP = buildPunctuatedWords(base, includePunct, seed);
    return withP;
  }, [seed, includePunct]);

  // Normalize apostrophes and similar chars so ' and ’ are treated the same
  const normalizeChar = (c: string) => (c ? c.replace(/[’‘ʼ]/g, "'") : c);
  const normalizeString = (s: string) => (s ? s.replace(/[’‘ʼ]/g, "'") : s);

  const focusInput = useCallback(() => {
    requestAnimationFrame(() => inputRef.current?.focus());
  }, []);

  useEffect(() => {
    focusInput();
  }, [focusInput]);

  const resetAll = useCallback(
    (newDuration?: Duration) => {
      const d = newDuration ?? duration;
      setDuration(d);
      setTimeLeft(d);
      setRunning(false);
      setEnded(false);
      setSeed(Date.now());
      setCurrentIndex(0);
      setInput("");
      setCorrectWords(0);
      setIncorrectWords(0);
      setTotalKeystrokes(0);
      setCorrectKeystrokes(0);
      setIncorrectKeystrokes(0);
      setBestStreak(0);
      setStreak(0);
      setSamples([]);
      startedAtRef.current = null;
      prevInputRef.current = "";
      if (intervalRef.current) window.clearInterval(intervalRef.current);
      intervalRef.current = null;
      focusInput();
    },
    [duration, focusInput]
  );

  useEffect(() => {
    // Prevent page scroll on Space when focused outside
    const onKeydown = (e: KeyboardEvent) => {
      if (e.key === " " && (document.activeElement === document.body || document.activeElement === null)) {
        e.preventDefault();
      }
    };
    window.addEventListener("keydown", onKeydown, { passive: false });
    return () => window.removeEventListener("keydown", onKeydown);
  }, []);

  const start = () => {
    // Soft reset: do NOT change the seed or regenerate words
    setTimeLeft(duration);
    setRunning(true);
    setEnded(false);
    setCurrentIndex(0);
    setInput("");
    prevInputRef.current = "";
    setCorrectWords(0);
    setIncorrectWords(0);
    setTotalKeystrokes(0);
    setCorrectKeystrokes(0);
    setIncorrectKeystrokes(0);
    setBestStreak(0);
    setStreak(0);
    setSamples([]);
    startedAtRef.current = Date.now();
    focusInput();
    // start 1s sampling without touching the word list
    let sec = 0;
    let lastTotalChars = 0;
    let lastWords = 0;
    let lastCorrect = 0;
    let lastIncorrect = 0;
    intervalRef.current = window.setInterval(() => {
      sec += 1;
      setTimeLeft((t) => {
        const nt = t - 1;
        return nt >= 0 ? nt : 0;
      });

      setSamples((prev) => {
        const totalKS = totalKSRef.current;
        const corrKS = correctKSRef.current;
        const incKS = incorrectKSRef.current;
        const corrW = corrWordsRef.current;
        const incW = incorrWordsRef.current;
        const charsThisSec = totalKS - lastTotalChars;
        const wordsThisSec = corrW + incW - lastWords;
        const corrThisSec = corrKS - lastCorrect;
        const incThisSec = incKS - lastIncorrect;
        const sample: SecondSample = {
          second: prev.length + 1,
          words_typed: wordsThisSec,
          chars_typed: Math.max(0, charsThisSec),
          correct_chars: Math.max(0, corrThisSec),
          incorrect_chars: Math.max(0, incThisSec),
          cumulative_words: corrW + incW,
          cumulative_chars: totalKS,
        };
        lastTotalChars = totalKS;
        lastWords = corrW + incW;
        lastCorrect = corrKS;
        lastIncorrect = incKS;
        return [...prev, sample];
      });

      if (sec >= duration) {
        endRound();
      }
    }, 1000);
  };

  const endRound = () => {
    if (intervalRef.current) window.clearInterval(intervalRef.current);
    intervalRef.current = null;
    setRunning(false);
    setEnded(true);
    focusInput();
    // Save best WPM for this duration
    const wpm = liveWPM();
    try {
      const key = `typing_best_wpm_${duration}`;
      const prev = Number(localStorage.getItem(key) || 0);
      if (wpm > prev) localStorage.setItem(key, String(Math.floor(wpm)));
    } catch {}
  };


  // Keystroke tracking on input change (exclude backspace from totals)
  const onChangeInput = (v: string) => {
    const prev = prevInputRef.current;
    // Added text
    if (v.length > prev.length) {
      const added = v.slice(prev.length);
      const target = wordsQueue[currentIndex] || "";
      for (let i = 0; i < added.length; i++) {
        const ch = added[i];
        if (ch === " ") continue; // ignore spaces inside
        setTotalKeystrokes((t) => t + 1);
        const pos = prev.length + i;
        if (normalizeChar(target[pos]) === normalizeChar(ch)) setCorrectKeystrokes((t) => t + 1);
        else setIncorrectKeystrokes((t) => t + 1);
      }
    }
    prevInputRef.current = v;
    setInput(v);
  };

  const submitWord = () => {
    const target = (wordsQueue[currentIndex] || "").trim();
    const typed = input.trim();
    const isCorrect = typed.length > 0 && normalizeString(typed) === normalizeString(target);
    if (isCorrect) {
      setCorrectWords((c) => c + 1);
      setStreak((s) => {
        const ns = s + 1;
        setBestStreak((b) => (ns > b ? ns : b));
        return ns;
      });
    } else {
      setIncorrectWords((c) => c + 1);
      setStreak(0);
    }
    setCurrentIndex((i) => i + 1);
    setInput("");
    prevInputRef.current = "";
  };

  const handleKeyDown: React.KeyboardEventHandler<HTMLInputElement> = (e) => {
    if (e.key === " ") {
      // Prevent page scroll/space injection as submit trigger
      e.preventDefault();
      if (running && !ended) submitWord();
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (running && !ended) submitWord();
    }
  };

  // Live metrics
  const elapsedSeconds = useMemo(() => {
    if (!startedAtRef.current) return 0;
    return Math.max(0, Math.min(duration, Math.floor((Date.now() - startedAtRef.current) / 1000)));
  }, [running, timeLeft, duration]);

  const liveWPM = () => {
    const elapsedMin = Math.max(1 / 60, elapsedSeconds / 60); // avoid divide by zero
    return correctWords / elapsedMin; // words per minute = correct words / minutes
  };
  const liveRawCPM = () => {
    const elapsedMin = Math.max(1 / 60, elapsedSeconds / 60);
    return totalKeystrokes / elapsedMin; // raw CPM includes errors
  };
  const liveRawWPM = () => liveRawCPM() / 5; // convention: 5 chars per word
  const liveAccuracy = () => {
    const total = correctKeystrokes + incorrectKeystrokes;
    return total === 0 ? 100 : (correctKeystrokes / total) * 100;
  };

  // Level analysis helper
  function getTypingLevel(wpm: number) {
    // Classification en français
    if (wpm < 26) return { level: "Débutant", percentile: 40, advice: "Concentrez‑vous d’abord sur la précision avant la vitesse.", color: "#f87171" };
    if (wpm < 46) return { level: "Intermédiaire", percentile: 60, advice: "Beaux progrès ! Continuez à vous entraîner.", color: "#fb923c" };
    if (wpm < 66) return { level: "Rapide", percentile: 80, advice: "Belle performance. Visez une régularité constante.", color: "#f59e0b" };
    if (wpm < 86) return { level: "Avancé", percentile: 90, advice: "Excellent. Améliorez la précision pour atteindre Expert.", color: "#34d399" };
    if (wpm < 110) return { level: "Expert", percentile: 98, advice: "Impressionnant. Vous approchez d’une vitesse pro !", color: "#60a5fa" };
    return { level: "Élite", percentile: 99, advice: "Top 1% mondial. Compétence exceptionnelle !", color: "#a78bfa" };
  }

  const copyResults = async () => {
    const summary = `Typing Test Results\nDuration: ${duration}s\nWPM: ${Math.round(liveWPM())}\nRaw WPM: ${Math.round(liveRawWPM())}\nCPM: ${Math.round(liveRawCPM())}\nAccuracy: ${Math.round(liveAccuracy())}%\nCorrect Words: ${correctWords}\nIncorrect Words: ${incorrectWords}\nKeystrokes: ${totalKeystrokes} (correct ${correctKeystrokes} / incorrect ${incorrectKeystrokes})\nBest Streak: ${bestStreak}`;
    try {
      await navigator.clipboard.writeText(summary);
    } catch {}
  };

  const downloadCSV = () => {
    const header = "second,words_typed,chars_typed,correct_chars,incorrect_chars,cumulative_words,cumulative_chars";
    const rows = samples.map(
      (s) => `${s.second},${s.words_typed},${s.chars_typed},${s.correct_chars},${s.incorrect_chars},${s.cumulative_words},${s.cumulative_chars}`
    );
    const blob = new Blob([header + "\n" + rows.join("\n")], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `typing_stats_${duration}s.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  // No chart — replaced with Level Analysis card

  const currentWord = wordsQueue[currentIndex] || "";
  const wordsAhead = wordsQueue.slice(currentIndex, currentIndex + 30);

  // Friendly descriptions for results
  const describeWPM = (wpm: number) => {
    if (wpm < 26) return "Rythme calme. Construisez la précision et la régularité.";
    if (wpm < 46) return "Bon rythme — pratiquez un peu chaque jour.";
    if (wpm < 66) return "Bonne vitesse ! Cherchez la constance.";
    if (wpm < 86) return "Très bonne vitesse. Un peu plus de précision aidera.";
    if (wpm < 110) return "Excellente vitesse — proche du niveau pro.";
    return "Vitesse d’élite ! Gardez la forme et la fluidité.";
  };
  const describeAccuracy = (acc: number) => {
    if (acc >= 96) return "Précision excellente — continuez ainsi !";
    if (acc >= 90) return "Très bonne précision. Frappe fiable.";
    if (acc >= 80) return "Précision correcte — ralentissez un peu pour réduire les erreurs.";
    return "Priorisez la précision : la vitesse viendra ensuite.";
  };
  const describeCorrect = (n: number) => (n > 0 ? "Mots validés pendant cette manche." : "Lancez une manche pour accumuler des mots corrects.");
  const describeIncorrect = (n: number) => {
    if (n === 0) return "Impeccable — aucune erreur !";
    if (n <= 3) return "Très peu d’erreurs — beau contrôle.";
    return "Moins d’erreurs augmenteront votre WPM final.";
  };
  const describeStreak = (s: number) => {
    if (s >= 20) return "Concentration remarquable — longue série propre !";
    if (s >= 10) return "Belle série — gardez le rythme.";
    if (s >= 5) return "Bonne série — visez un peu plus haut la prochaine fois.";
    return "Les petites séries sont normales — restez détendu et précis.";
  };
  const describeRawWPM = (raw: number, net: number) => {
    const gap = Math.max(0, Math.round(raw - net));
    if (gap <= 3) return "Brut ≈ Net : très peu de corrections — efficace !";
    if (gap <= 8) return "Un peu de correction — visez une saisie plus propre.";
    return "Écart important : ralentissez légèrement et priorisez la précision.";
  };
  const describeCPM = () => "Caractères par minute — un volume de frappe direct.";
  const describeKeystrokes = (corr: number, inc: number) => {
    const total = corr + inc;
    if (total === 0) return "Lancez une manche pour obtenir vos métriques de frappe.";
    const ratio = total ? Math.round((corr / total) * 100) : 0;
    if (ratio >= 95) return "Excellent contrôle — très peu de frappes perdues.";
    if (ratio >= 85) return "Bon équilibre — continuez à réduire les erreurs.";
    return "Beaucoup de corrections — ralentissez un peu pour une saisie plus propre.";
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-6 text-white">
      {/* Top bar */}
      <div className="mx-auto mb-6 flex max-w-4xl items-center justify-center gap-4 text-sm">
        <div className="rounded-full bg-gray-800/60 px-4 py-2 ring-1 ring-gray-700">⏳ {timeLeft}s</div>
        <div className="rounded-full bg-gray-800/60 px-4 py-2 ring-1 ring-gray-700">WPM: {Math.round(liveWPM())}</div>
        <div className="rounded-full bg-gray-800/60 px-4 py-2 ring-1 ring-gray-700">Accuracy: {Math.round(liveAccuracy())}%</div>
      </div>

      {/* Controls */}
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <button
          type="button"
          onClick={start}
          className="rounded-md bg-indigo-600 px-4 py-2 font-semibold text-white transition hover:bg-indigo-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-900"
        >
          Start
        </button>
        <button
          type="button"
          onClick={() => resetAll()}
          className="rounded-md bg-gray-800/60 px-4 py-2 text-white ring-1 ring-gray-700 transition hover:bg-gray-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
        >
          Restart
        </button>
        <label className="flex items-center gap-2 text-sm text-gray-200">
          Duration
          <select
            value={duration}
            onChange={(e) => {
              const d = Number(e.target.value) as Duration;
              resetAll(d);
              focusInput();
            }}
            className="rounded-md bg-gray-800/60 px-2 py-1 ring-1 ring-gray-700 focus:outline-none focus-visible:ring-indigo-400"
          >
            <option value={30}>30s</option>
            <option value={60}>1 min</option>
            <option value={120}>2 min</option>
            <option value={180}>3 min</option>
          </select>
        </label>
        <label className="flex items-center gap-2 text-sm text-gray-200">
          Punctuation
          <input
            type="checkbox"
            checked={includePunct}
            onChange={(e) => {
              setIncludePunct(e.target.checked);
              resetAll();
            }}
            className="accent-indigo-500"
          />
        </label>
      </div>

      {/* Words stream area */}
      <div
        className="mx-auto max-w-3xl rounded-2xl bg-gray-900/80 p-6 ring-1 ring-gray-700 h-[160px] overflow-hidden"
        style={{ overflowWrap: "break-word" as const }}
      >
        <div className="whitespace-normal text-[1.4rem] leading-[2]">
          {wordsAhead.map((w, idx) => {
            const isCurrent = idx === 0;
            let content: React.ReactNode = w;
            if (isCurrent) {
              const correctPart: string[] = [];
              const wrongPart: string[] = [];
              for (let i = 0; i < input.length; i++) {
                const ch = input[i];
            if (normalizeChar(w[i]) === normalizeChar(ch)) correctPart.push(ch);
              else wrongPart.push(ch);
              }
              content = (
                <span>
                  <span className="text-emerald-400">{correctPart.join("")}</span>
                  <span className="text-rose-400">{wrongPart.join("")}</span>
                  <span className="text-gray-400">{w.slice(input.length)}</span>
                </span>
              );
            }
            return (
              <span
                key={`${w}-${idx}`}
                className={
                  isCurrent
                    ? "mr-2 rounded-full bg-gray-800/80 px-3 py-1 ring-1 ring-gray-700"
                    : "mr-2 text-gray-300"
                }
              >
                {content}
              </span>
            );
          })}
        </div>
      </div>

      {/* Input zone */}
      <div className="mx-auto mt-5 max-w-2xl">
        <input
          ref={inputRef}
          type="text"
          disabled={!running || ended}
          value={input}
          onChange={(e) => onChangeInput(e.target.value)}
          onKeyDown={handleKeyDown}
          className="w-full rounded-xl bg-gray-800/60 px-5 py-4 text-[1.35rem] ring-1 ring-gray-700 outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
          aria-label="Type the current word"
        />
      </div>

      {/* Results panel */}
      {ended && (
        <div className="mx-auto mt-6 grid max-w-4xl gap-6 md:grid-cols-2">
          <div className="rounded-[12px] bg-[#1e1e26] p-5 text-[#eee] leading-[1.8] ring-1 ring-gray-800">
            <h3 className="mb-3 text-lg font-semibold">Résultats</h3>
            <div className="grid grid-cols-1 gap-3">
              {/* Summary */}
              <section>
                <h4 className="section-title">Résumé</h4>
                <div className="grid grid-cols-2 gap-x-4 text-sm">
                  <div>Durée</div>
                  <div className="text-right">{duration}s</div>
                  <div>WPM</div>
                  <div className="text-right">{Math.round(liveWPM())}</div>
                  <div className="col-span-2 mt-1 text-xs text-gray-400">{describeWPM(Math.round(liveWPM()))}</div>
                  <div>Précision</div>
                  <div className="text-right">{Math.round(liveAccuracy())}%</div>
                  <div className="col-span-2 mt-1 text-xs text-gray-400">{describeAccuracy(Math.round(liveAccuracy()))}</div>
                </div>
              </section>
              {/* Performance */}
              <section>
                <h4 className="section-title">Performance</h4>
                <div className="grid grid-cols-2 gap-x-4 text-sm">
                  <div>Mots corrects</div>
                  <div className="text-right">{correctWords}</div>
                  <div className="col-span-2 mt-1 text-xs text-gray-400">{describeCorrect(correctWords)}</div>
                  <div>Mots incorrects</div>
                  <div className="text-right">{incorrectWords}</div>
                  <div className="col-span-2 mt-1 text-xs text-gray-400">{describeIncorrect(incorrectWords)}</div>
                  <div>Meilleure série</div>
                  <div className="text-right">{bestStreak}</div>
                  <div className="col-span-2 mt-1 text-xs text-gray-400">{describeStreak(bestStreak)}</div>
                </div>
              </section>
              {/* Advanced */}
              <section>
                <h4 className="section-title">Statistiques avancées</h4>
                <div className="grid grid-cols-2 gap-x-4 text-sm">
                  <div>WPM brut</div>
                  <div className="text-right">{Math.round(liveRawWPM())}</div>
                  <div className="col-span-2 mt-1 text-xs text-gray-400">{describeRawWPM(Math.round(liveRawWPM()), Math.round(liveWPM()))}</div>
                  <div>CPM</div>
                  <div className="text-right">{Math.round(liveRawCPM())}</div>
                  <div className="col-span-2 mt-1 text-xs text-gray-400">{describeCPM()}</div>
                  <div>Frappes</div>
                  <div className="text-right">
                    {totalKeystrokes} <span className="text-gray-400">(✓ {correctKeystrokes} / ✗ {incorrectKeystrokes})</span>
                  </div>
                  <div className="col-span-2 mt-1 text-xs text-gray-400">{describeKeystrokes(correctKeystrokes, incorrectKeystrokes)}</div>
                </div>
              </section>
            </div>
            {/* Action buttons removed as requested */}
          </div>
          <div className="rounded-[12px] bg-[#1e1e26] p-5 text-[#eee] leading-[1.8] ring-1 ring-gray-800">
            <h3 className="mb-3 text-lg font-semibold">Votre niveau de frappe</h3>
            {(() => {
              const wpmNow = Math.round(liveWPM());
              const info = getTypingLevel(wpmNow);
              return (
                <div>
                  <div
                    className="mb-3 inline-block rounded-full px-4 py-2 text-base font-semibold"
                    style={{ background: "#14192d", boxShadow: "0 0 0 1px #2a3455 inset", color: info.color }}
                    aria-label={`Badge de niveau : ${info.level}`}
                  >
                    {info.level}
                  </div>
                  <div className="text-sm text-gray-300">
                    Vous tapez plus vite que <span className="font-semibold" style={{ color: info.color }}>{info.percentile}%</span> des personnes.
                  </div>
                  <p className="mt-3 text-sm text-gray-300" aria-live="polite">{info.advice}</p>
                </div>
              );
            })()}
          </div>
        </div>
      )}
    </div>
  );
}
