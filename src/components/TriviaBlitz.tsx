import React, { useState, useEffect, useRef } from 'react';
import { TriviaQuestion } from '../types';
import { soundEngine } from '../services/soundEngine';
import confetti from 'canvas-confetti';
import { 
  Flame, 
  Clock, 
  HelpCircle, 
  Sparkles, 
  RotateCcw, 
  Volume2, 
  CheckCircle2, 
  XCircle, 
  Trophy, 
  Coins, 
  Zap, 
  Play, 
  Square,
  ShieldAlert,
  ArrowRight
} from 'lucide-react';

interface TriviaBlitzProps {
  questions: TriviaQuestion[];
  onCompleteGame: (score: number, correctCount: number) => void;
}

export const TriviaBlitz: React.FC<TriviaBlitzProps> = ({
  questions,
  onCompleteGame,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [maxStreak, setMaxStreak] = useState(0);
  const [correctAnswersCount, setCorrectAnswersCount] = useState(0);
  const [timeLeft, setTimeLeft] = useState(15);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswerRevealed, setIsAnswerRevealed] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);
  const [eliminatedOptions, setEliminatedOptions] = useState<number[]>([]);
  const [usedLifelines, setUsedLifelines] = useState<{ fiftyFifty: boolean; extraTime: boolean; hint: boolean }>({
    fiftyFifty: false,
    extraTime: false,
    hint: false
  });
  const [showHint, setShowHint] = useState(false);
  const [isPlayingAudioClue, setIsPlayingAudioClue] = useState(false);

  const timerRef = useRef<number | null>(null);
  const currentQuestion = questions[currentIndex];

  // Question countdown timer
  useEffect(() => {
    if (isGameOver || isAnswerRevealed) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    timerRef.current = window.setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          handleTimeOut();
          return 0;
        }
        if (prev <= 4) {
          soundEngine.playClick();
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [currentIndex, isAnswerRevealed, isGameOver]);

  const handleTimeOut = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    soundEngine.playWrong();
    setIsAnswerRevealed(true);
    setStreak(0);
    soundEngine.stopPreview();
    setIsPlayingAudioClue(false);
  };

  const handleToggleAudioClue = () => {
    if (!currentQuestion.audioRiff) return;
    if (isPlayingAudioClue) {
      soundEngine.stopPreview();
      setIsPlayingAudioClue(false);
    } else {
      soundEngine.playPreviewRiff(currentQuestion.audioRiff);
      setIsPlayingAudioClue(true);
    }
  };

  const handleSelectOption = (idx: number) => {
    if (isAnswerRevealed || isGameOver) return;
    if (timerRef.current) clearInterval(timerRef.current);

    setSelectedOption(idx);
    setIsAnswerRevealed(true);
    soundEngine.stopPreview();
    setIsPlayingAudioClue(false);

    const isCorrect = idx === currentQuestion.correctIndex;
    if (isCorrect) {
      soundEngine.playCorrect();
      const currentStreak = streak + 1;
      const multiplier = currentStreak >= 4 ? 2.5 : currentStreak >= 2 ? 1.5 : 1.0;
      const timeBonus = Math.floor(timeLeft * 5);
      const pointsEarned = Math.round((currentQuestion.points + timeBonus) * multiplier);

      setScore(prev => prev + pointsEarned);
      setStreak(currentStreak);
      if (currentStreak > maxStreak) setMaxStreak(currentStreak);
      setCorrectAnswersCount(prev => prev + 1);

      if (currentStreak % 3 === 0) {
        confetti({ particleCount: 50, spread: 60, origin: { y: 0.7 } });
      }
    } else {
      soundEngine.playWrong();
      setStreak(0);
    }
  };

  const handleNextQuestion = () => {
    soundEngine.playClick();
    soundEngine.stopPreview();
    setIsPlayingAudioClue(false);

    if (currentIndex + 1 < questions.length) {
      setCurrentIndex(prev => prev + 1);
      setSelectedOption(null);
      setIsAnswerRevealed(false);
      setTimeLeft(15);
      setEliminatedOptions([]);
      setShowHint(false);
    } else {
      // Game completed
      setIsGameOver(true);
      soundEngine.playFanfare();
      confetti({ particleCount: 120, spread: 90, origin: { y: 0.5 } });
      onCompleteGame(score, correctAnswersCount);
    }
  };

  const handleRestartGame = () => {
    soundEngine.playClick();
    setCurrentIndex(0);
    setScore(0);
    setStreak(0);
    setMaxStreak(0);
    setCorrectAnswersCount(0);
    setTimeLeft(15);
    setSelectedOption(null);
    setIsAnswerRevealed(false);
    setIsGameOver(false);
    setEliminatedOptions([]);
    setShowHint(false);
    setUsedLifelines({ fiftyFifty: false, extraTime: false, hint: false });
  };

  // Lifelines
  const handleUseFiftyFifty = () => {
    if (usedLifelines.fiftyFifty || isAnswerRevealed) return;
    soundEngine.playClick();
    const correctIdx = currentQuestion.correctIndex;
    const incorrectIndices = currentQuestion.options
      .map((_, i) => i)
      .filter(i => i !== correctIdx);
    
    // Pick 2 random incorrect to eliminate
    const shuffled = [...incorrectIndices].sort(() => 0.5 - Math.random());
    const toEliminate = shuffled.slice(0, 2);
    setEliminatedOptions(toEliminate);
    setUsedLifelines(prev => ({ ...prev, fiftyFifty: true }));
  };

  const handleUseExtraTime = () => {
    if (usedLifelines.extraTime || isAnswerRevealed) return;
    soundEngine.playClick();
    setTimeLeft(prev => prev + 10);
    setUsedLifelines(prev => ({ ...prev, extraTime: true }));
  };

  const handleUseHint = () => {
    if (usedLifelines.hint || isAnswerRevealed) return;
    soundEngine.playClick();
    setShowHint(true);
    setUsedLifelines(prev => ({ ...prev, hint: true }));
  };

  if (isGameOver) {
    const accuracy = Math.round((correctAnswersCount / questions.length) * 100);
    const coinsEarned = Math.round(score / 4);
    const xpEarned = score;

    return (
      <div className="max-w-2xl mx-auto bg-zinc-900/90 rounded-3xl border border-zinc-800 p-6 md:p-10 shadow-2xl text-center space-y-6">
        <div className="w-20 h-20 mx-auto rounded-3xl bg-gradient-to-tr from-amber-400 via-rose-500 to-purple-600 p-[2px] shadow-xl shadow-rose-500/30">
          <div className="w-full h-full bg-zinc-950 rounded-[22px] flex items-center justify-center">
            <Trophy className="w-10 h-10 text-amber-400 animate-bounce" />
          </div>
        </div>

        <div>
          <h2 className="text-3xl font-black text-white tracking-tight">
            TRIVIA BLITZ COMPLETE!
          </h2>
          <p className="text-sm text-zinc-400 mt-1">
            You tested your ear and sonic knowledge against the masters.
          </p>
        </div>

        {/* Score Summary Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-zinc-950/80 p-4 rounded-2xl border border-zinc-800">
          <div className="p-3 bg-zinc-900 rounded-xl">
            <div className="text-[11px] font-bold text-zinc-400">FINAL SCORE</div>
            <div className="text-2xl font-black text-amber-400 mt-0.5">{score}</div>
          </div>
          <div className="p-3 bg-zinc-900 rounded-xl">
            <div className="text-[11px] font-bold text-zinc-400">ACCURACY</div>
            <div className="text-2xl font-black text-cyan-400 mt-0.5">{accuracy}%</div>
          </div>
          <div className="p-3 bg-zinc-900 rounded-xl">
            <div className="text-[11px] font-bold text-zinc-400">MAX STREAK</div>
            <div className="text-2xl font-black text-rose-400 mt-0.5">{maxStreak}x</div>
          </div>
          <div className="p-3 bg-zinc-900 rounded-xl">
            <div className="text-[11px] font-bold text-zinc-400">COINS WON</div>
            <div className="text-2xl font-black text-emerald-400 mt-0.5">+{coinsEarned}</div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <button
            id="trivia-play-again-btn"
            onClick={handleRestartGame}
            className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-gradient-to-r from-rose-500 to-purple-600 hover:from-rose-600 hover:to-purple-700 text-white font-extrabold text-sm flex items-center justify-center gap-2 shadow-lg shadow-rose-500/25 transition-all"
          >
            <RotateCcw className="w-4 h-4" />
            <span>PLAY AGAIN</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      
      {/* Top Status Bar: Question Progress, Timer, Multiplier, Score */}
      <div className="bg-zinc-900/90 rounded-2xl border border-zinc-800 p-4 shadow-lg flex flex-wrap items-center justify-between gap-4">
        
        {/* Progress */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-black px-2.5 py-1 rounded-lg bg-rose-500/20 text-rose-400 border border-rose-500/30">
            Q {currentIndex + 1} / {questions.length}
          </span>
          <span className="text-xs font-semibold text-zinc-400">
            {currentQuestion.category}
          </span>
        </div>

        {/* Countdown Timer with warning pulse */}
        <div className="flex items-center gap-2">
          <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black font-mono border ${
            timeLeft <= 4
              ? 'bg-red-500/20 border-red-500/40 text-red-400 animate-pulse'
              : 'bg-zinc-800 border-zinc-700 text-zinc-200'
          }`}>
            <Clock className="w-3.5 h-3.5" />
            <span>{timeLeft}s</span>
          </div>

          {/* Streak multiplier pill */}
          {streak >= 2 && (
            <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-black animate-bounce">
              <Zap className="w-3.5 h-3.5 fill-current" />
              <span>{streak >= 4 ? '2.5x HYPE' : '1.5x STREAK'}</span>
            </div>
          )}
        </div>

        {/* Current Score */}
        <div className="flex items-center gap-2 font-mono text-sm font-black text-amber-400">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span>{score} PTS</span>
        </div>
      </div>

      {/* Main Question Card */}
      <div className="bg-zinc-900/90 rounded-3xl border border-zinc-800 p-6 md:p-8 shadow-2xl relative overflow-hidden">
        
        {/* Lifelines Bar */}
        <div className="flex items-center justify-between pb-4 mb-6 border-b border-zinc-800/80">
          <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">
            DJ LIFELINES:
          </span>
          <div className="flex items-center gap-2">
            <button
              id="lifeline-fifty-fifty-btn"
              onClick={handleUseFiftyFifty}
              disabled={usedLifelines.fiftyFifty || isAnswerRevealed}
              className={`px-3 py-1.5 rounded-lg text-xs font-extrabold border transition-all ${
                usedLifelines.fiftyFifty
                  ? 'bg-zinc-900 border-zinc-800 text-zinc-600 cursor-not-allowed line-through'
                  : 'bg-zinc-800 hover:bg-zinc-700 border-zinc-700 text-zinc-300 hover:text-white'
              }`}
              title="Eliminate two wrong answers"
            >
              50 / 50
            </button>
            <button
              id="lifeline-extra-time-btn"
              onClick={handleUseExtraTime}
              disabled={usedLifelines.extraTime || isAnswerRevealed}
              className={`px-3 py-1.5 rounded-lg text-xs font-extrabold border transition-all ${
                usedLifelines.extraTime
                  ? 'bg-zinc-900 border-zinc-800 text-zinc-600 cursor-not-allowed line-through'
                  : 'bg-zinc-800 hover:bg-zinc-700 border-zinc-700 text-zinc-300 hover:text-white'
              }`}
              title="Add 10 extra seconds"
            >
              +10 SEC
            </button>
            <button
              id="lifeline-hint-btn"
              onClick={handleUseHint}
              disabled={usedLifelines.hint || isAnswerRevealed}
              className={`px-3 py-1.5 rounded-lg text-xs font-extrabold border transition-all ${
                usedLifelines.hint
                  ? 'bg-zinc-900 border-zinc-800 text-zinc-600 cursor-not-allowed line-through'
                  : 'bg-zinc-800 hover:bg-zinc-700 border-zinc-700 text-zinc-300 hover:text-white'
              }`}
              title="Reveal subtle clue"
            >
              HINT
            </button>
          </div>
        </div>

        {/* Audio Clue Player (if question has audio) */}
        {currentQuestion.audioRiff && (
          <div className="mb-6 p-4 rounded-2xl bg-zinc-950 border border-zinc-800/90 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-500/20 border border-rose-500/30 flex items-center justify-center text-rose-400">
                <Volume2 className="w-5 h-5 animate-pulse" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white">Audio Synthesizer Clue</h4>
                <p className="text-[11px] text-zinc-400">Listen to the procedural musical stem for this question</p>
              </div>
            </div>

            <button
              id="play-audio-clue-btn"
              onClick={handleToggleAudioClue}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-extrabold shadow-md transition-all ${
                isPlayingAudioClue
                  ? 'bg-rose-600 text-white animate-pulse'
                  : 'bg-zinc-800 hover:bg-rose-500 text-zinc-200 hover:text-white border border-zinc-700'
              }`}
            >
              {isPlayingAudioClue ? (
                <>
                  <Square className="w-3.5 h-3.5 fill-current" />
                  <span>Stop Stem</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Play Clue</span>
                </>
              )}
            </button>
          </div>
        )}

        {/* Prompt Question */}
        <h3 className="text-xl md:text-2xl font-black text-white leading-snug mb-6">
          {currentQuestion.prompt}
        </h3>

        {/* Subtle Hint Box (if used) */}
        {showHint && (
          <div className="mb-6 p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-center gap-2">
            <Sparkles className="w-4 h-4 shrink-0" />
            <span>Hint: Focus on the genre's defining album release era and signature rhythm!</span>
          </div>
        )}

        {/* Options Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {currentQuestion.options.map((option, idx) => {
            const isEliminated = eliminatedOptions.includes(idx);
            const isSelected = selectedOption === idx;
            const isCorrect = idx === currentQuestion.correctIndex;

            let buttonStyle = 'bg-zinc-950 hover:bg-zinc-800 border-zinc-800 text-zinc-200';
            if (isAnswerRevealed) {
              if (isCorrect) {
                buttonStyle = 'bg-emerald-500/20 border-emerald-500 text-emerald-300 ring-2 ring-emerald-500/40';
              } else if (isSelected && !isCorrect) {
                buttonStyle = 'bg-rose-500/20 border-rose-500 text-rose-300';
              } else {
                buttonStyle = 'bg-zinc-950/50 border-zinc-900 text-zinc-600 opacity-40';
              }
            } else if (isEliminated) {
              buttonStyle = 'bg-zinc-950/30 border-zinc-900 text-zinc-700 opacity-25 cursor-not-allowed';
            }

            return (
              <button
                key={idx}
                id={`trivia-option-${idx}`}
                onClick={() => !isEliminated && handleSelectOption(idx)}
                disabled={isAnswerRevealed || isEliminated}
                className={`p-4 rounded-2xl border-2 text-left font-bold text-sm transition-all flex items-center justify-between gap-3 ${buttonStyle} ${
                  !isAnswerRevealed && !isEliminated ? 'hover:scale-[1.01] active:scale-[0.99]' : ''
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="w-7 h-7 rounded-lg bg-zinc-900 border border-zinc-800 text-xs font-mono font-bold flex items-center justify-center shrink-0">
                    {String.fromCharCode(65 + idx)}
                  </span>
                  <span className={isEliminated ? 'line-through' : ''}>{option}</span>
                </div>

                {isAnswerRevealed && isCorrect && (
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                )}
                {isAnswerRevealed && isSelected && !isCorrect && (
                  <XCircle className="w-5 h-5 text-rose-400 shrink-0" />
                )}
              </button>
            );
          })}
        </div>

        {/* Answer Explanation & Next Question Trigger */}
        {isAnswerRevealed && (
          <div className="mt-6 pt-6 border-t border-zinc-800/80 space-y-4">
            <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800/90 text-xs text-zinc-300 leading-relaxed">
              <span className="font-bold text-rose-400 block mb-1">SONIC LORE EXPLANATION:</span>
              {currentQuestion.explanation}
            </div>

            <div className="flex justify-end">
              <button
                id="trivia-next-question-btn"
                onClick={handleNextQuestion}
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-rose-500 to-purple-600 hover:from-rose-600 hover:to-purple-700 text-white font-extrabold text-sm flex items-center gap-2 shadow-lg shadow-rose-500/25 transition-all"
              >
                <span>{currentIndex + 1 < questions.length ? 'NEXT QUESTION' : 'SEE FINAL RESULTS'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
