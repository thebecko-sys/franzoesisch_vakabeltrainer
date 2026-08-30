"use client";

import { useEffect, useMemo, useState } from "react";
import { Check, ChevronRight, Eye, EyeOff, RotateCcw, Sparkles, Volume2, X } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import vokabelDaten from "@/data/vokabeln.json";

type Direction = "de-fr" | "fr-de";
type Mode = "choice" | "think";
type Card = { de: string; fr: string; hint?: string };
type Lesson = { id: number; name: string; vokabeln: Card[] };

const lessons = vokabelDaten.lektionen as Lesson[];
const allLessonIds = lessons.map((lesson) => lesson.id);
const shuffle = <T,>(items: T[]) => [...items].sort(() => Math.random() - 0.5);

export default function Home() {
  const [direction, setDirection] = useState<Direction>("de-fr");
  const [mode, setMode] = useState<Mode>("choice");
  const [selectedLessons, setSelectedLessons] = useState<number[]>(allLessonIds);
  const cards = useMemo(
    () => lessons.filter((lesson) => selectedLessons.includes(lesson.id)).flatMap((lesson) => lesson.vokabeln),
    [selectedLessons]
  );
  const [order, setOrder] = useState(() => shuffle(lessons.flatMap((lesson) => lesson.vokabeln).map((_, i) => i)));
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
    return shuffle([answer, ...shuffle(cards.filter((c) => c[field] !== answer)).slice(0, 3).map((c) => c[field])]);
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

  function next() {
    setPosition((p) => (p + 1) % Math.max(order.length, 1));
    setSelected(null);
    setRevealed(false);
  }
  function toggleLesson(id: number) {
    setSelectedLessons((current) => {
      if (current.includes(id)) {
        if (current.length === 1) return current;
        return current.filter((lessonId) => lessonId !== id);
      }
      return [...current, id].sort((a, b) => a - b);
    });
  }
  function selectAllLessons() { setSelectedLessons(allLessonIds); }
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
    <main className="min-h-[100dvh] bg-[#f7f4ed] text-[#17231c]">
      <div className="mx-auto min-h-[100dvh] max-w-lg px-3 pb-6 pt-3 sm:px-4 sm:pt-5">
        <Tabs defaultValue="learn">
          <header className="mb-3 flex items-center gap-2">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <h1 className="truncate text-lg font-black tracking-[-.03em] sm:text-xl">Bonjour, les mots!</h1>
                <span className="shrink-0 rounded-full bg-[#dce9df] px-2 py-0.5 text-[10px] font-black uppercase tracking-wider text-[#315d43]">7. Klasse</span>
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
              <Progress value={progress} className="h-1.5 bg-[#e8e4da] [&>div]:bg-[#e6543f]" />
            </section>

            <section className="mb-3 grid grid-cols-2 gap-2">
              <div className="grid grid-cols-2 rounded-xl bg-[#e8e4da] p-1">
                <button onClick={() => { setDirection("de-fr"); setSelected(null); setRevealed(false); }} className={`rounded-lg px-2 py-1.5 text-[11px] font-black transition ${direction === "de-fr" ? "bg-white shadow-sm" : "text-[#667068]"}`}>DE → FR</button>
                <button onClick={() => { setDirection("fr-de"); setSelected(null); setRevealed(false); }} className={`rounded-lg px-2 py-1.5 text-[11px] font-black transition ${direction === "fr-de" ? "bg-white shadow-sm" : "text-[#667068]"}`}>FR → DE</button>
              </div>
              <div className="grid grid-cols-2 rounded-xl bg-[#e8e4da] p-1">
                <button onClick={() => { setMode("choice"); setSelected(null); setRevealed(false); }} className={`rounded-lg px-2 py-1.5 text-[11px] font-black transition ${mode === "choice" ? "bg-white shadow-sm" : "text-[#667068]"}`}>Auswahl</button>
                <button onClick={() => { setMode("think"); setSelected(null); setRevealed(false); }} className={`rounded-lg px-2 py-1.5 text-[11px] font-black transition ${mode === "think" ? "bg-white shadow-sm" : "text-[#667068]"}`}>Denken</button>
              </div>
            </section>

            <div className="relative overflow-hidden rounded-[1.5rem] border border-[#d8d5cc] bg-white p-4 shadow-[0_14px_40px_rgba(36,49,40,.10)] sm:p-5">
              <div className="absolute right-0 top-0 h-24 w-24 rounded-bl-full bg-[#f4d9b8]/65" />
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
                    const state = selected && isAnswer ? "border-[#45a96b] bg-[#e3f4e8]" : isSelected ? "border-[#df614f] bg-[#fbe7e3]" : "border-[#dedbd2] bg-[#fbfaf7] active:bg-[#f2eee5]";
                    return <button key={option} onClick={() => choose(option)} className={`flex min-h-12 w-full items-center gap-3 rounded-xl border-2 px-3 text-left text-sm font-bold transition ${state}`}><span className="grid size-6 shrink-0 place-items-center rounded-full bg-white text-[10px] shadow-sm">{selected && (isAnswer ? <Check className="size-3.5 text-[#287a4a]" /> : isSelected ? <X className="size-3.5 text-[#c44938]" /> : String.fromCharCode(65 + i))}</span><span>{option}</span></button>;
                  })}
                  {selected && <Button onClick={next} className="mt-3 h-11 w-full rounded-xl bg-[#e6543f] text-sm font-black text-white hover:bg-[#d94b37]">Nächste Karte <ChevronRight className="size-4" /></Button>}
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
                <button onClick={selectAllLessons} className={`shrink-0 rounded-full border px-3 py-1.5 text-xs font-bold transition ${allSelected ? "border-[#315d43] bg-[#dce9df] text-[#315d43]" : "border-[#d8d5cc] bg-white text-[#667068]"}`}>Alle</button>
              </div>
              <div className="grid gap-2">
                {lessons.map((lesson) => {
                  const active = selectedLessons.includes(lesson.id);
                  return (
                    <button key={lesson.id} onClick={() => toggleLesson(lesson.id)} aria-pressed={active} className={`flex items-center justify-between rounded-xl border px-3 py-3 text-left transition ${active ? "border-[#8bb69a] bg-[#edf6ef]" : "border-[#dedbd2] bg-[#fbfaf7]"}`}>
                      <span className="flex min-w-0 items-center gap-2.5"><span className={`grid size-5 shrink-0 place-items-center rounded-md border text-xs font-black ${active ? "border-[#315d43] bg-[#315d43] text-white" : "border-[#bfc4bf] bg-white text-transparent"}`}>✓</span><span className="truncate text-sm font-bold">{lesson.name}</span></span>
                      <span className="ml-2 shrink-0 text-xs font-semibold text-[#7a817b]">{lesson.vokabeln.length} Wörter</span>
                    </button>
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
