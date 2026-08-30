"use client";

import { useEffect, useMemo, useState } from "react";
import { Check, Eye, EyeOff, RotateCcw, Sparkles, Volume2, X } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import vokabelDaten from "@/data/vokabeln.json";

type Direction = "de-fr" | "fr-de";
type Mode = "choice" | "think";
type Card = { de: string; fr: string; hint?: string };
type Lesson = { id: number; grade: number; name: string; vokabeln: Card[] };

const lessons = vokabelDaten.lektionen as Lesson[];
const allLessonIds = lessons.map((lesson) => lesson.id);
const grades = [...new Set(lessons.map((lesson) => lesson.grade))].sort((a, b) => b - a);
const highestGrade = grades[0];
const highestLesson = lessons.filter((lesson) => lesson.grade === highestGrade).at(-1);
const defaultLessonIds = highestLesson ? [highestLesson.id] : [];
const shuffle = <T,>(items: T[]) => [...items].sort(() => Math.random() - 0.5);

export default function Home() {
  const [direction, setDirection] = useState<Direction>("de-fr");
  const [mode, setMode] = useState<Mode>("think");
  const [selectedLessons, setSelectedLessons] = useState<number[]>(defaultLessonIds);
  const cards = useMemo(
    () => lessons.filter((lesson) => selectedLessons.includes(lesson.id)).flatMap((lesson) => lesson.vokabeln),
    [selectedLessons]
  );
  const [order, setOrder] = useState(() => shuffle(lessons.filter((lesson) => defaultLessonIds.includes(lesson.id)).flatMap((lesson) => lesson.vokabeln).map((_, i) => i)));
  const [position, setPosition] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [correct, setCorrect] = useState(0);
  const [wrong, setWrong] = useState(0);

  const cardIndex = (order[position % Math.max(order.length, 1)] ?? 0) % Math.max(cards.length, 1);
  const card = cards[cardIndex] ?? lessons[0].vokabeln[0];
  const prompt = direction === "de-fr" ? card.de : card.fr;
  const answer = direction === "de-fr" ? card.fr : card.de;
  const options = useMemo(() => {
    const field = direction === "de-fr" ? "fr" : "de";
    const distractors = [...new Set(cards.map((c) => c[field]).filter((value) => value !== answer))];
    return shuffle([answer, ...shuffle(distractors).slice(0, 3)]);
  }, [answer, direction, cards]);

  useEffect(() => {
    const stored = localStorage.getItem("franzoesisch-fortschritt");
    if (stored) {
      const data = JSON.parse(stored);
      setCorrect(data.correct ?? 0);
      setWrong(data.wrong ?? 0);
    }
  }, []);
  useEffect(() => {
    localStorage.setItem("franzoesisch-fortschritt", JSON.stringify({ correct, wrong }));
  }, [correct, wrong]);
  useEffect(() => {
    setOrder(shuffle(cards.map((_, i) => i)));
    setPosition(0);
    setSelected(null);
    setRevealed(false);
  }, [cards]);
  useEffect(() => {
    if (!selected) return;

    const timer = window.setTimeout(() => {
      setPosition((p) => (p + 1) % Math.max(order.length, 1));
      setSelected(null);
      setRevealed(false);
    }, 2000);

    return () => window.clearTimeout(timer);
  }, [selected, order.length]);

  function next() {
    setPosition((p) => (p + 1) % Math.max(order.length, 1));
    setSelected(null);
    setRevealed(false);
  }
  function toggleLesson(id: number) {
    setSelectedLessons((current) => {
      if (current.includes(id)) {
        return current.filter((lessonId) => lessonId !== id);
      }
      return [...current, id].sort((a, b) => a - b);
    });
  }
  function toggleGrade(grade: number) {
    const gradeLessonIds = lessons.filter((lesson) => lesson.grade === grade).map((lesson) => lesson.id);
    setSelectedLessons((current) => {
      const completeGradeSelected = gradeLessonIds.every((id) => current.includes(id));
      return completeGradeSelected
        ? current.filter((id) => !gradeLessonIds.includes(id))
        : [...new Set([...current, ...gradeLessonIds])].sort((a, b) => a - b);
    });
  }
  function toggleAllLessons() { setSelectedLessons(allSelected ? [] : allLessonIds); }
  function choose(option: string) {
    if (selected) return;
    setSelected(option);
    option === answer ? setCorrect((n) => n + 1) : setWrong((n) => n + 1);
  }
  function selfRate(knewIt: boolean) {
    knewIt ? setCorrect((n) => n + 1) : setWrong((n) => n + 1);
    next();
  }
  function reset() {
    setCorrect(0); setWrong(0); setPosition(0); setSelected(null); setRevealed(false);
    setOrder(shuffle(cards.map((_, i) => i)));
  }
  function speak() {
    const utterance = new SpeechSynthesisUtterance(direction === "fr-de" ? prompt : answer);
    utterance.lang = "fr-FR";
    speechSynthesis.speak(utterance);
  }

  const total = correct + wrong;
  const progress = total ? Math.round((correct / total) * 100) : 0;
  const allSelected = selectedLessons.length === lessons.length;
  const lessonSummary = allSelected
    ? "Alle Lektionen"
    : selectedLessons.length === 1
      ? lessons.find((l) => l.id === selectedLessons[0])?.name ?? "1 Lektion"
      : `${selectedLessons.length} Lektionen`;

  return (
    <main className="min-h-[100dvh] bg-[linear-gradient(145deg,#f5f8ff_0%,#fff8f3_48%,#f4fbf6_100%)] text-[#17231c]">
      <div className="mx-auto min-h-[100dvh] max-w-lg px-3 pb-6 pt-3 sm:px-4 sm:pt-5">
        <Tabs defaultValue="learn">
          <div className="mb-3 flex h-1.5 overflow-hidden rounded-full shadow-sm" aria-hidden="true">
            <span className="flex-1 bg-[#3f6fc4]" /><span className="flex-1 bg-white" /><span className="flex-1 bg-[#ea5b59]" />
          </div>
          <header className="mb-3 flex items-center gap-2">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <h1 className="truncate text-lg font-black tracking-[-.03em] sm:text-xl">Bonjour, les mots!</h1>
                <span className="shrink-0 rounded-full bg-[#e7efff] px-2 py-0.5 text-[10px] font-black uppercase tracking-wider text-[#315796]">Klasse 5–7</span>
              </div>
            </div>
            <button onClick={reset} aria-label="Fortschritt zurücksetzen" className="rounded-full border border-[#d8d5cc] bg-white p-2 text-[#526057] shadow-sm active:scale-95"><RotateCcw className="size-4" /></button>
          </header>

          <TabsList className="mb-3 grid h-9 w-full grid-cols-2 rounded-xl bg-[#e8e4da] p-1">
            <TabsTrigger value="learn" className="rounded-lg text-xs font-black data-[state=active]:bg-white data-[state=active]:shadow-sm">Lernen</TabsTrigger>
            <TabsTrigger value="lessons" className="rounded-lg text-xs font-black data-[state=active]:bg-white data-[state=active]:shadow-sm">Lektionen</TabsTrigger>
          </TabsList>

          <TabsContent value="learn" className="mt-0">
            <section className="mb-3 rounded-xl border border-[#d8d5cc] bg-white/85 px-3 py-2.5 shadow-sm">
              <div className="mb-1.5 flex items-center gap-2 text-xs font-bold">
                <span className="text-[#287a4a]">✓ {correct}</span>
                <span className="text-[#c44938]">× {wrong}</span>
                <span className="min-w-0 flex-1 truncate text-right text-[#667068]">{lessonSummary} · {cards.length} Wörter</span>
                <span className="font-black text-[#315d43]">{progress}%</span>
              </div>
              <Progress value={progress} className="h-1.5 bg-[#e8e4da] [&>div]:bg-gradient-to-r [&>div]:from-[#3f6fc4] [&>div]:to-[#e6543f]" />
            </section>

            <section className="mb-3 grid grid-cols-2 gap-2">
              <div className="grid grid-cols-2 rounded-xl bg-[#e8e4da] p-1">
                <button onClick={() => { setDirection("de-fr"); setSelected(null); setRevealed(false); }} className={`rounded-lg px-2 py-1.5 text-[11px] font-black transition ${direction === "de-fr" ? "bg-white text-[#315796] shadow-sm" : "text-[#667068]"}`}>DE → FR</button>
                <button onClick={() => { setDirection("fr-de"); setSelected(null); setRevealed(false); }} className={`rounded-lg px-2 py-1.5 text-[11px] font-black transition ${direction === "fr-de" ? "bg-white text-[#315796] shadow-sm" : "text-[#667068]"}`}>FR → DE</button>
              </div>
              <div className="grid grid-cols-2 rounded-xl bg-[#e8e4da] p-1">
                <button onClick={() => { setMode("choice"); setSelected(null); setRevealed(false); }} className={`rounded-lg px-2 py-1.5 text-[11px] font-black transition ${mode === "choice" ? "bg-white text-[#315796] shadow-sm" : "text-[#667068]"}`}>Auswahl</button>
                <button onClick={() => { setMode("think"); setSelected(null); setRevealed(false); }} className={`rounded-lg px-2 py-1.5 text-[11px] font-black transition ${mode === "think" ? "bg-white text-[#315796] shadow-sm" : "text-[#667068]"}`}>Karteikarten</button>
              </div>
            </section>

            {cards.length === 0 && (
              <div className="rounded-[1.5rem] border border-dashed border-[#aebbd5] bg-white/80 px-5 py-10 text-center shadow-sm">
                <Sparkles className="mx-auto mb-3 size-7 text-[#5274b4]" />
                <h2 className="text-lg font-black">Keine Lektion ausgewählt</h2>
                <p className="mt-2 text-sm leading-6 text-[#667068]">Aktiviere im Tab „Lektionen“ eine Klasse oder einzelne Lektion.</p>
              </div>
            )}
            <div className={`${cards.length === 0 ? "hidden" : ""} relative overflow-hidden rounded-[1.5rem] border border-[#d9dff0] bg-white p-4 shadow-[0_16px_42px_rgba(46,66,112,.12)] sm:p-5`}>
              <div className="absolute right-0 top-0 h-24 w-24 rounded-bl-full bg-[#ffe1d8]/75" />
              <div className="absolute bottom-0 left-0 h-16 w-16 rounded-tr-full bg-[#e7efff]/70" />
              <div className="relative mb-4 flex items-center justify-between">
                <span className="rounded-full bg-[#f7f4ed] px-2.5 py-1 text-[11px] font-bold text-[#737970]">Karte {position + 1} / {cards.length}</span>
                {(direction === "fr-de" || revealed || selected === answer) && <button onClick={speak} aria-label="Französische Aussprache anhören" className="rounded-full bg-[#315d43] p-2 text-white active:scale-95"><Volume2 className="size-4" /></button>}
              </div>

              <div className="relative mb-5 min-h-20 text-center">
                <p className="mb-2 text-[10px] font-bold uppercase tracking-[.16em] text-[#9a6b3a]">Wie heißt das auf {direction === "de-fr" ? "Französisch" : "Deutsch"}?</p>
                <h2 className="text-2xl font-black tracking-tight sm:text-3xl">{prompt}</h2>
                {card.hint && direction === "de-fr" && <p className="mt-2 text-xs italic text-[#7c817c]">Hinweis: {card.hint}</p>}
              </div>

              {mode === "choice" ? (
                <div className="space-y-2">
                  {options.map((option, i) => {
                    const isAnswer = option === answer;
                    const isSelected = option === selected;
                    const state = selected && isAnswer ? "border-[#45a96b] bg-[#e3f4e8] text-[#1f6038]" : isSelected ? "border-[#df614f] bg-[#fbe7e3] text-[#8f3027]" : "border-[#d9dff0] bg-[#f8faff] active:border-[#7d9bd5] active:bg-[#eef3ff]";
                    return <button key={option} onClick={() => choose(option)} disabled={selected !== null} className={`flex min-h-12 w-full items-center gap-3 rounded-xl border-2 px-3 text-left text-sm font-bold transition disabled:cursor-default ${state}`}><span className={`grid size-6 shrink-0 place-items-center rounded-full text-[10px] shadow-sm ${selected && (isAnswer || isSelected) ? "bg-white" : "bg-[#e7efff] text-[#315796]"}`}>{selected && (isAnswer ? <Check className="size-3.5 text-[#287a4a]" /> : isSelected ? <X className="size-3.5 text-[#c44938]" /> : String.fromCharCode(65 + i))}</span><span>{option}</span></button>;
                  })}
                  {selected && (
                    <div role="status" aria-live="polite" className={`mt-3 flex min-h-12 items-center justify-center gap-2 rounded-xl border px-3 text-center text-sm font-black ${selected === answer ? "border-[#83c79b] bg-[#dff3e6] text-[#21613a]" : "border-[#e4aaa0] bg-[#fde8e4] text-[#94382d]"}`}>
                      {selected === answer ? <Check className="size-5" /> : <X className="size-5" />}
                      <span>{selected === answer ? "Richtig!" : "Leider falsch."} Nächste Vokabel kommt gleich …</span>
                    </div>
                  )}
                </div>
              ) : (
                <div>
                  {!revealed ? <button onClick={() => setRevealed(true)} className="flex h-20 w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-[#c8c4b9] bg-[#fbfaf7] text-base font-black text-[#315d43] active:bg-[#f2eee5]"><Eye className="size-5" /> Lösung zeigen</button> : <div className="rounded-xl bg-[#e3f4e8] p-4 text-center"><div className="mb-1 flex items-center justify-center gap-2 text-[10px] font-bold uppercase tracking-[.16em] text-[#4d775c]"><EyeOff className="size-4" /> Lösung</div><div className="text-xl font-black">{answer}</div></div>}
                  {revealed && <div className="mt-2 grid grid-cols-2 gap-2"><Button onClick={() => selfRate(false)} variant="outline" className="h-11 rounded-xl border-[#e1a59c] bg-[#fbe7e3] text-sm font-black text-[#9b392d]">Noch üben</Button><Button onClick={() => selfRate(true)} className="h-11 rounded-xl bg-[#315d43] text-sm font-black text-white hover:bg-[#284e38]">Gewusst!</Button></div>}
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="lessons" className="mt-0">
            <section className="rounded-2xl border border-[#d8d5cc] bg-white p-4 shadow-sm">
              <div className="mb-4 flex items-start justify-between gap-3">
                <div>
                  <div className="mb-1 flex items-center gap-2"><Sparkles className="size-4 text-[#315d43]" /><h2 className="text-base font-black">Lektionen auswählen</h2></div>
                  <p className="text-xs leading-5 text-[#667068]">Die Lernabfragen verwenden ausschließlich Wörter aus den aktivierten Lektionen.</p>
                </div>
                <button onClick={toggleAllLessons} aria-pressed={allSelected} className={`shrink-0 rounded-full border px-3 py-1.5 text-xs font-bold transition ${allSelected ? "border-[#315d43] bg-[#dce9df] text-[#315d43]" : "border-[#d8d5cc] bg-white text-[#667068]"}`}>Alle</button>
              </div>
              <div className="grid gap-4">
                {grades.map((grade) => {
                  const gradeLessons = lessons.filter((lesson) => lesson.grade === grade);
                  const selectedInGrade = gradeLessons.filter((lesson) => selectedLessons.includes(lesson.id)).length;
                  const completeGradeSelected = selectedInGrade === gradeLessons.length;
                  return (
                    <section key={grade} aria-labelledby={`grade-${grade}`}>
                      <button onClick={() => toggleGrade(grade)} aria-pressed={completeGradeSelected} className="mb-2 flex w-full items-center justify-between rounded-xl bg-[#eaf0fc] px-3 py-2 text-left text-[#315796] transition active:scale-[.99]">
                        <span className="flex items-center gap-2">
                          <span className={`grid size-5 place-items-center rounded-md border text-xs font-black ${completeGradeSelected ? "border-[#315796] bg-[#315796] text-white" : selectedInGrade ? "border-[#6f8bc0] bg-white text-[#315796]" : "border-[#9facc3] bg-white text-transparent"}`}>{completeGradeSelected ? "✓" : selectedInGrade ? "–" : "✓"}</span>
                          <h3 id={`grade-${grade}`} className="text-sm font-black">{grade}. Klasse</h3>
                        </span>
                        <span className="text-[11px] font-bold">{selectedInGrade} / {gradeLessons.length}</span>
                      </button>
                      <div className="grid gap-2">
                        {gradeLessons.map((lesson) => {
                          const active = selectedLessons.includes(lesson.id);
                          return (
                            <button key={lesson.id} onClick={() => toggleLesson(lesson.id)} aria-pressed={active} className={`flex items-center justify-between rounded-xl border px-3 py-3 text-left transition ${active ? "border-[#8bb69a] bg-[#edf6ef]" : "border-[#dedbd2] bg-[#fbfaf7]"}`}>
                              <span className="flex min-w-0 items-center gap-2.5"><span className={`grid size-5 shrink-0 place-items-center rounded-md border text-xs font-black ${active ? "border-[#315d43] bg-[#315d43] text-white" : "border-[#bfc4bf] bg-white text-transparent"}`}>✓</span><span className="truncate text-sm font-bold">{lesson.name}</span></span>
                              <span className="ml-2 shrink-0 text-xs font-semibold text-[#7a817b]">{lesson.vokabeln.length} Wörter</span>
                            </button>
                          );
                        })}
                      </div>
                    </section>
                  );
                })}
              </div>
              <div className="mt-4 rounded-xl bg-[#f7f4ed] px-3 py-2.5 text-center text-xs font-bold text-[#667068]">{selectedLessons.length} von {lessons.length} Lektionen · {cards.length} Wörter ausgewählt</div>
            </section>
          </TabsContent>
        </Tabs>
      </div>
    </main>
  );
}
