import React, { useState, useEffect, useMemo, useRef } from "react";
import { Question } from "../data/questions";
import { 
  ChevronLeft, 
  ChevronRight, 
  Star, 
  HelpCircle, 
  BookMarked, 
  Search, 
  Filter, 
  Lightbulb, 
  LayoutGrid,
  Info,
  RefreshCw
} from "lucide-react";

interface QuizCardProps {
  questions: Question[];
  answered: Record<number, string>;
  correct: Record<number, boolean>;
  bookmarked: Record<number, boolean>;
  onAnswer: (questionId: number, selectedOption: string, isCorrect: boolean) => void;
  onToggleBookmark: (questionId: number) => void;
  initialIndex?: number;
}

export const QuizCard: React.FC<QuizCardProps> = ({
  questions,
  answered,
  correct,
  bookmarked,
  onAnswer,
  onToggleBookmark,
  initialIndex = 0,
}) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [showExplanation, setShowExplanation] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showJumpGrid, setShowJumpGrid] = useState(false);
  const quizCardRef = useRef<HTMLDivElement>(null);

  // Shuffle utility
  const shuffleArray = (array: Question[]) => {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  };

  const [isShuffle, setIsShuffle] = useState(() => {
    return localStorage.getItem("c_quiz_shuffle_mode") === "true";
  });

  const [shuffledQuestions, setShuffledQuestions] = useState<Question[]>(() => {
    const isShuf = localStorage.getItem("c_quiz_shuffle_mode") === "true";
    return isShuf ? shuffleArray(questions) : [];
  });

  const handleToggleShuffle = () => {
    if (!isShuffle) {
      const newShuffled = shuffleArray(questions);
      setShuffledQuestions(newShuffled);
      setIsShuffle(true);
      localStorage.setItem("c_quiz_shuffle_mode", "true");
      setCurrentIndex(0);
    } else {
      const currentQ = filteredQuestions[currentIndex];
      setIsShuffle(false);
      localStorage.setItem("c_quiz_shuffle_mode", "false");
      if (currentQ) {
        const originalIdx = questions.findIndex(q => q.id === currentQ.id);
        if (originalIdx !== -1) {
          setCurrentIndex(originalIdx);
        }
      }
    }
  };

  const handleReshuffle = () => {
    const newShuffled = shuffleArray(questions);
    setShuffledQuestions(newShuffled);
    setCurrentIndex(0);
  };

  // Sync index if parent changes initialIndex (only when not in shuffle mode to avoid breaking flow)
  useEffect(() => {
    if (!isShuffle) {
      setCurrentIndex(initialIndex);
    }
  }, [initialIndex, isShuffle]);

  // Base deck selection
  const baseQuestions = useMemo(() => {
    return isShuffle ? shuffledQuestions : questions;
  }, [isShuffle, shuffledQuestions, questions]);

  // Search filter
  const filteredQuestions = useMemo(() => {
    if (!searchQuery.trim()) return baseQuestions;
    const normQuery = searchQuery.toLowerCase();
    return baseQuestions.filter(q => 
      q.q.toLowerCase().includes(normQuery) || 
      q.cat.toLowerCase().includes(normQuery) ||
      `q${q.id}`.includes(normQuery) ||
      q.o.some(opt => opt.toLowerCase().includes(normQuery))
    );
  }, [baseQuestions, searchQuery]);

  // Keep track of explanation state
  useEffect(() => {
    // If current question is already answered, show explanation by default
    const currentQ = filteredQuestions[currentIndex];
    if (currentQ && answered[currentQ.id] !== undefined) {
      setShowExplanation(true);
    } else {
      setShowExplanation(false);
    }
  }, [currentIndex, answered, searchQuery, filteredQuestions]);

  // Fallback if current index exceeds filtered list
  useEffect(() => {
    if (currentIndex >= filteredQuestions.length && filteredQuestions.length > 0) {
      setCurrentIndex(filteredQuestions.length - 1);
    }
  }, [filteredQuestions, currentIndex]);

  const currentQuestion = filteredQuestions[currentIndex];

  const handleOptionSelect = (optionChar: "A" | "B" | "C" | "D") => {
    if (!currentQuestion) return;
    
    // If already answered, do not allow re-selection in standard practice mode
    if (answered[currentQuestion.id] !== undefined) return;

    const isCorrect = optionChar === currentQuestion.a;
    onAnswer(currentQuestion.id, optionChar, isCorrect);
    setShowExplanation(true);
  };

  const handleNext = () => {
    if (currentIndex < filteredQuestions.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Avoid firing hotkeys when user is focused on searching
      if (document.activeElement?.tagName === "INPUT" || document.activeElement?.tagName === "TEXTAREA") {
        return;
      }

      const key = e.key.toLowerCase();
      if (key === "a") handleOptionSelect("A");
      else if (key === "b") handleOptionSelect("B");
      else if (key === "c") handleOptionSelect("C");
      else if (key === "d") handleOptionSelect("D");
      else if (e.key === "ArrowRight") handleNext();
      else if (e.key === "ArrowLeft") handlePrev();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentIndex, filteredQuestions, answered]);

  if (!currentQuestion) {
    return (
      <div id="no_question_found" className="bg-white rounded-3xl p-12 text-center border border-slate-100 max-w-xl mx-auto space-y-4 shadow-xs mt-10">
        <HelpCircle className="w-12 h-12 text-slate-300 mx-auto animate-pulse" />
        <h3 className="font-semibold text-lg text-slate-800">未找到符合搜索条件的题目</h3>
        <p className="text-slate-400 text-xs leading-relaxed">
          试试更换其他搜索词（例如 “指针”, “数组”, “strlen”），或者清空当前的找词输入。
        </p>
        <button
          onClick={() => setSearchQuery("")}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs rounded-lg transition-all shadow-xs cursor-pointer"
        >
          重置并返回全套题目
        </button>
      </div>
    );
  }

  const userSelection = answered[currentQuestion.id];
  const isUserCorrect = correct[currentQuestion.id];
  const isStarred = !!bookmarked[currentQuestion.id];
  const isAnswered = userSelection !== undefined;

  return (
    <div ref={quizCardRef} id="quiz_practice_view" className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      
      {/* Left panel / side navigation & Search */}
      <div className="lg:col-span-1 space-y-4">
        {/* Search tool */}
        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-xs space-y-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="搜索题目、编号或关键字..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentIndex(0); // Reset index on search
              }}
              className="w-full pl-9 pr-3 py-2 bg-slate-50 text-xs border border-transparent rounded-xl focus:bg-white focus:border-blue-100 focus:ring-2 focus:ring-blue-100 transition-all text-slate-700 outline-hidden"
            />
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono">
            <span>找到: <strong className="text-slate-700 font-semibold">{filteredQuestions.length}</strong> 道</span>
            <span>筛选中</span>
          </div>
        </div>

        {/* Practice Mode Configuration Widget */}
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-semibold tracking-wider uppercase text-slate-400 font-mono">刷题模式控制</span>
            <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${isShuffle ? 'bg-amber-50 text-amber-600 border border-amber-200/50' : 'bg-blue-50 text-blue-600 border border-blue-100'}`}>
              {isShuffle ? "乱序刷题中" : "顺序刷题中"}
            </span>
          </div>
          
          <div className="grid grid-cols-2 gap-1 bg-slate-50 p-1 rounded-xl">
            <button
              onClick={() => {
                if (isShuffle) handleToggleShuffle();
              }}
              className={`py-1.5 px-2 text-center rounded-lg text-xs font-semibold cursor-pointer transition-all ${
                !isShuffle 
                  ? "bg-white text-blue-600 shadow-xs" 
                  : "text-slate-400 hover:text-slate-600"
              }`}
            >
              顺序
            </button>
            <button
              onClick={() => {
                if (!isShuffle) handleToggleShuffle();
              }}
              className={`py-1.5 px-2 text-center rounded-lg text-xs font-semibold cursor-pointer transition-all ${
                isShuffle 
                  ? "bg-white text-amber-600 shadow-xs" 
                  : "text-slate-400 hover:text-slate-600"
              }`}
            >
              乱序
            </button>
          </div>

          {isShuffle && (
            <button
              onClick={handleReshuffle}
              className="w-full py-2 px-3 bg-amber-50/60 hover:bg-amber-50 text-amber-700 text-[11px] font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-all duration-200 cursor-pointer border border-amber-200/40"
            >
              <RefreshCw className="w-3.5 h-3.5 animate-spin-slow" />
              <span>重新洗牌 (打乱顺序)</span>
            </button>
          )}
        </div>

        {/* Quick actions & category info */}
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs space-y-3 justify-between flex flex-col">
          <div className="space-y-1">
            <span className="text-[10px] font-semibold tracking-wider uppercase text-blue-500 font-mono">当前章节分类</span>
            <h4 className="text-sm font-semibold text-slate-800 leading-tight">
              {currentQuestion.cat}
            </h4>
          </div>

          <div className="pt-2 border-t border-slate-100 space-y-2">
            <button
              onClick={() => onToggleBookmark(currentQuestion.id)}
              className={`w-full py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                isStarred 
                  ? "bg-amber-50 text-amber-500" 
                  : "bg-slate-50 hover:bg-slate-100 text-slate-500"
              }`}
            >
              <Star className={`w-4 h-4 ${isStarred ? "fill-amber-400 text-amber-400" : ""}`} />
              <span>{isStarred ? "已收藏此题目" : "收藏并加入复习"}</span>
            </button>

            <button
              onClick={() => setShowJumpGrid(!showJumpGrid)}
              className={`w-full py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                showJumpGrid 
                  ? "bg-blue-50 text-blue-600" 
                  : "bg-slate-50 hover:bg-slate-100 text-slate-500"
              }`}
            >
              <LayoutGrid className="w-4 h-4" />
              <span>{showJumpGrid ? "隐藏全部卡片索引" : "显示 251题 卡片索引"}</span>
            </button>
          </div>

          <div className="text-[11px] text-slate-400 font-sans p-2.5 bg-slate-50 rounded-lg space-y-1">
            <div className="flex items-center gap-1.5 font-medium text-slate-700">
              <Info className="w-3.5 h-3.5 text-slate-400" /> 练习秘籍：
            </div>
            <p className="leading-normal">
              您可以使用键盘的 <kbd className="bg-white px-1.5 py-0.5 border border-slate-200 rounded font-mono text-[9px]">A</kbd> <kbd className="bg-white px-1.5 py-0.5 border border-slate-200 rounded font-mono text-[9px]">B</kbd> <kbd className="bg-white px-1.5 py-0.5 border border-slate-200 rounded font-mono text-[9px]">C</kbd> <kbd className="bg-white px-1.5 py-0.5 border border-slate-200 rounded font-mono text-[9px]">D</kbd> 对应极速答题，使用键盘左右方向键进行前后页切换。
            </p>
          </div>
        </div>
      </div>

      {/* Right panel / main quiz card */}
      <div className="lg:col-span-3 space-y-6">
        
        {/* Jump list grid drawer */}
        {showJumpGrid && (
          <div id="jump_grid_drawer" className="bg-white p-5 rounded-3xl border border-slate-100 shadow-xs space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5 mb-2">
              <h4 className="text-xs font-semibold text-slate-800 flex items-center gap-2 font-display">
                <LayoutGrid className="w-4 h-4 text-slate-400" /> 题目极速导航卡
              </h4>
              <div className="flex items-center gap-3 text-[10px] font-mono text-slate-400 select-none">
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-slate-200" />未答</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-400" />对</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-rose-400" />错</span>
              </div>
            </div>

            <div className="grid grid-cols-7 sm:grid-cols-10 md:grid-cols-12 gap-1.5 max-h-48 overflow-y-auto pr-1">
              {filteredQuestions.map((q, idx) => {
                const isAns = answered[q.id] !== undefined;
                const isCor = correct[q.id];
                const active = idx === currentIndex;
                
                let btnStyle = "bg-slate-50 hover:bg-slate-100 text-slate-600";
                if (isAns) {
                  btnStyle = isCor 
                    ? "bg-emerald-50 text-emerald-600 hover:bg-emerald-100 border border-emerald-200" 
                    : "bg-rose-50 text-rose-500 hover:bg-rose-100 border border-rose-200";
                }
                if (active) {
                  btnStyle = "bg-blue-600 text-white ring-2 ring-blue-200 border-none font-bold";
                }

                return (
                  <button
                    key={q.id}
                    title={`第 ${q.id} 题`}
                    onClick={() => {
                      setCurrentIndex(idx);
                      // On smaller screen, minimize drawer automatically upon click to maximize focus
                      if (window.innerWidth < 1024) {
                        setShowJumpGrid(false);
                      }
                    }}
                    className={`aspect-square py-1 px-0.5 rounded-lg text-center font-mono text-[10px] leading-none transition-all cursor-pointer ${btnStyle} flex flex-col justify-center items-center`}
                  >
                    <span>{q.id}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Core Question Card */}
        <div id="core_question_box" className="bg-white rounded-3xl border border-slate-150 relative shadow-xs overflow-hidden flex flex-col justify-between">
          
          {/* Accent decoration line */}
          <div className="h-1 w-full bg-blue-500" />

          {/* Card Top bar */}
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="px-2.5 py-1 bg-blue-50 text-blue-600 text-[10px] uppercase font-mono font-bold tracking-wider rounded-md">
                题号: #{currentQuestion.id}
              </span>
              <span className="text-xs text-slate-400 font-mono">
                第 {currentIndex + 1} / {filteredQuestions.length} 题
              </span>
            </div>

            {/* Bookmark button */}
            <button
              onClick={() => onToggleBookmark(currentQuestion.id)}
              className="p-1.5 rounded-lg hover:bg-slate-50 text-slate-400 hover:text-amber-500 transition-colors cursor-pointer"
              title="加入收藏"
            >
              <Star className={`w-5 h-5 ${isStarred ? "fill-amber-400 text-amber-500" : ""}`} />
            </button>
          </div>

          <div className="p-6 md:p-8 space-y-6">
            {/* Question Text */}
            <div className="space-y-4">
              <div 
                className="text-base text-slate-800 leading-relaxed font-sans whitespace-pre-wrap selection:bg-blue-100"
                style={{ wordBreak: 'break-word' }}
              >
                {/* Find code snippets and style them nicely */}
                {currentQuestion.q}
              </div>
            </div>

            {/* Options Button Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {["A", "B", "C", "D"].map((optKey, idx) => {
                const optText = currentQuestion.o[idx];
                const cleanOptText = optText ? optText.replace(/^[A-D]、\s*/, "") : "";
                const isSelected = userSelection === optKey;
                const isCorrectAns = currentQuestion.a === optKey;
                const isAnswered = userSelection !== undefined;

                let optionStyle = "border-slate-200 bg-white text-slate-700 hover:border-blue-100 hover:bg-blue-50/20";
                
                if (isAnswered) {
                  if (isSelected) {
                    optionStyle = isUserCorrect 
                      ? "bg-emerald-50 Border border-emerald-300 text-emerald-800" 
                      : "bg-rose-50 border border-rose-300 text-rose-800";
                  } else if (isCorrectAns) {
                    optionStyle = "bg-emerald-50/50 border border-emerald-250 text-emerald-800 font-medium";
                  } else {
                    optionStyle = "border-slate-100 bg-slate-50/40 text-slate-400 cursor-not-allowed opacity-80";
                  }
                }

                return (
                  <button
                    key={optKey}
                    onClick={() => handleOptionSelect(optKey as any)}
                    disabled={isAnswered}
                    className={`w-full p-4 rounded-xl text-left text-xs text-slate-700 border transition-all cursor-pointer font-sans leading-relaxed group align-middle ${optionStyle} ${!isAnswered ? 'hover:-translate-y-0.5' : ''}`}
                  >
                    <div className="flex items-start space-x-3">
                      <span className={`w-6 h-6 shrink-0 rounded-full text-xs font-semibold flex items-center justify-center font-display border transition-colors ${
                        isSelected 
                          ? (isUserCorrect ? "bg-emerald-500 text-white border-emerald-500" : "bg-rose-500 text-white border-rose-500")
                          : (isCorrectAns && isAnswered ? "bg-emerald-500 text-white border-emerald-500" : "bg-slate-100 text-slate-500 group-hover:bg-blue-500 group-hover:text-white border-transparent")
                      }`}>
                        {optKey}
                      </span>
                      <span className="flex-1 mt-0.5 font-sans leading-normal">
                        {cleanOptText || optText}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Bottom Pagination bar */}
          <div className="px-6 py-4 bg-slate-50/80 border-t border-slate-100 flex items-center justify-between">
            <button
              onClick={handlePrev}
              disabled={currentIndex === 0}
              className="flex items-center gap-1 py-2 px-3 text-xs font-semibold text-slate-600 hover:text-slate-800 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-100/50 rounded-lg transition-all cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>上一题</span>
            </button>

            <span className="text-xs text-slate-500 font-mono font-medium hidden sm:inline">
              #{currentQuestion.id} / {currentQuestion.cat}
            </span>

            <button
              onClick={handleNext}
              disabled={currentIndex === filteredQuestions.length - 1}
              className="flex items-center gap-1 py-2 px-3 text-xs font-semibold text-slate-600 hover:text-slate-800 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-100/50 rounded-lg transition-all cursor-pointer"
            >
              <span>下一题</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Slide-down Detailed Explanation under Card */}
        {showExplanation && (
          <div 
            id="explanation_drawer" 
            className={`bg-white rounded-3xl border border-slate-150 p-6 md:p-8 space-y-4 shadow-xs transition-all duration-300 transform scale-100`}
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <span className="font-semibold text-slate-800 flex items-center gap-2 font-display">
                <Lightbulb className="w-4.5 h-4.5 text-amber-500 animate-pulse" /> 考级名师深度解析
              </span>
              <div className="flex items-center space-x-2">
                <span className="text-xs text-slate-400">正确选项：</span>
                <span className="w-6 h-6 rounded-full bg-emerald-500 text-white text-xs font-bold font-display flex items-center justify-center">
                  {currentQuestion.a}
                </span>
              </div>
            </div>

            <div className="space-y-4">
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-start gap-3">
                <div className={`p-2 rounded-xl shrink-0 ${isUserCorrect ? "bg-emerald-50 text-emerald-500" : "bg-rose-50 text-rose-500"}`}>
                  <HelpCircle className="w-4.5 h-4.5" />
                </div>
                <div className="text-xs text-slate-600 leading-relaxed font-sans">
                  {isAnswered ? (
                    <p>
                      您的判选是 <strong className={`font-semibold ${isUserCorrect ? 'text-emerald-600' : 'text-rose-600'}`}>{userSelection}</strong>，
                      此题的正确答案是 <strong className="text-emerald-600 font-semibold">{currentQuestion.a}</strong>。
                      {isUserCorrect ? " 正确！不费吹灰之力，干得漂亮！" : " 别气馁，研读下方解析即可秒懂底层规律！"}
                    </p>
                  ) : (
                    <p>
                      此题正确答案为 <strong className="text-emerald-600 font-semibold">{currentQuestion.a}</strong>。您本轮尚未做出选择，可研读下方解析加深基础！
                    </p>
                  )}
                </div>
              </div>

              <div id="explanation_text" className="text-sm text-slate-700 leading-relaxed font-sans space-y-2 whitespace-pre-wrap">
                {currentQuestion.e}
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
