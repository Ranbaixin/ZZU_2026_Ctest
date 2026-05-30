import { useState, useEffect } from "react";
import { allQuestions, categories, Question } from "./data/questions";
import { 
  getInitialPracticeState, 
  savePracticeState, 
  PracticeState, 
  getExamHistory, 
  ExamHistoryRecord, 
  clearAllData 
} from "./utils/quizHelpers";
import { StatsSection } from "./components/StatsSection";
import { QuizCard } from "./components/QuizCard";
import { MockExam } from "./components/MockExam";
import { WrongBook } from "./components/WrongBook";
import { 
  BarChart3, 
  BookOpen, 
  Compass, 
  FileCheck, 
  AlertTriangle,
  Github,
  Moon,
  Sun,
  Star,
  RefreshCw,
  Info,
  ZoomIn,
  ZoomOut
} from "lucide-react";

export default function App() {
  // Navigation tabs
  // "dashboard" | "practice" | "exam" | "wrongs"
  const [activeTab, setActiveTab] = useState<"dashboard" | "practice" | "exam" | "wrongs">("dashboard");

  // Core quiz practice states
  const [practiceState, setPracticeState] = useState<PracticeState>(getInitialPracticeState);

  // Exam records
  const [examHistory, setExamHistory] = useState<ExamHistoryRecord[]>(getExamHistory);

  // Initial jump indexes inside practice deck
  const [initialQuizIndex, setInitialQuizIndex] = useState(0);

  // Global window scale / zoom states
  const [zoomLevel, setZoomLevel] = useState<number>(() => {
    const stored = localStorage.getItem("c_quiz_zoom_level");
    if (stored) {
      const val = parseFloat(stored);
      if (!isNaN(val) && val >= 0.7 && val <= 1.5) {
        return val;
      }
    }
    return 1.0;
  });

  // Sync zoom level preference
  useEffect(() => {
    localStorage.setItem("c_quiz_zoom_level", zoomLevel.toString());
  }, [zoomLevel]);

  const handleZoomChange = (delta: number) => {
    setZoomLevel(prev => {
      const val = Math.round((prev + delta) * 100) / 100;
      return Math.min(1.5, Math.max(0.7, val));
    });
  };

  // Sync practice configurations back to local storage
  useEffect(() => {
    savePracticeState(practiceState);
  }, [practiceState]);

  // Handle a user submitting an option in standard practice or wrong workbook
  const handleAnswerQuestion = (questionId: number, selectedOption: string, isCorrect: boolean) => {
    setPracticeState(prev => {
      const updatedAnswered = { ...prev.answered, [questionId]: selectedOption };
      const updatedCorrect = { ...prev.correct, [questionId]: isCorrect };
      
      // Update the mistakes ledger
      let updatedWrongList = [...prev.wrongList];
      if (!isCorrect) {
        // Add to mistake workbook if not already present
        if (!updatedWrongList.includes(questionId)) {
          updatedWrongList.push(questionId);
        }
      }

      return {
        ...prev,
        answered: updatedAnswered,
        correct: updatedCorrect,
        wrongList: updatedWrongList
      };
    });
  };

  // Toggle Manual Bookmark / Favorites collection
  const handleToggleBookmark = (questionId: number) => {
    setPracticeState(prev => {
      const updatedBookmarked = { 
        ...prev.bookmarked, 
        [questionId]: !prev.bookmarked[questionId] 
      };
      return {
        ...prev,
        bookmarked: updatedBookmarked
      };
    });
  };

  // Purge a question from wrongs collection (called in Wrong Notebook upon clicking resolve)
  const handleRemoveFromWrongs = (questionId: number) => {
    setPracticeState(prev => {
      return {
        ...prev,
        wrongList: prev.wrongList.filter(id => id !== questionId)
      };
    });
  };

  // Triggers when user finishes a mock exam, adding all exam's wrong questions to wrongs book automatically
  const handleAddWrongsFromExam = (wrongIds: number[]) => {
    setPracticeState(prev => {
      const currentList = [...prev.wrongList];
      wrongIds.forEach(id => {
        if (!currentList.includes(id)) {
          currentList.push(id);
        }
      });
      return {
        ...prev,
        wrongList: currentList
      };
    });
  };

  // Clear all mistakes
  const handleClearWrongs = () => {
    setPracticeState(prev => ({
      ...prev,
      wrongList: []
    }));
  };

  // Resets full localized client database
  const handleFullReset = () => {
    clearAllData();
  };

  // Navigation handlers
  const handleNavigateToCategory = (categoryName: string) => {
    // Locate index of first question matching this specific category
    const startQIdx = allQuestions.findIndex(q => q.cat === categoryName);
    if (startQIdx !== -1) {
      setInitialQuizIndex(startQIdx);
      setActiveTab("practice");
    }
  };

  const handleNavigateToPractice = (startIndex: number) => {
    setInitialQuizIndex(startIndex);
    setActiveTab("practice");
  };

  // Quick jump from dashboard tiles to errors or favorites
  const handleNavigateToWrong = () => {
    setActiveTab("wrongs");
  };

  const handleNavigateToStarred = () => {
    // Jump to practice but filtered down, or simply practice deck where user can see the bookmarks.
    // For easiest flow we set tab to practice which displays bookmarks prominently
    setActiveTab("practice");
  };

  return (
    <div id="application_root" className="min-h-screen bg-slate-50/50 flex flex-col justify-between selection:bg-blue-100 selection:text-blue-800" style={{ zoom: zoomLevel }}>
      
      {/* Visual background gradient blur accents */}
      <div className="absolute top-0 left-0 right-0 h-96 bg-gradient-to-b from-blue-50/50 to-transparent -z-10 pointer-events-none" />

      {/* Main Container */}
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-12 space-y-6 flex-1">
        
        {/* Brand Header */}
        <header id="website_brand_header" className="bg-white rounded-3xl border border-slate-150 p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xs relative overflow-hidden">
          
          {/* Subtle decoration spot */}
          <div className="absolute -right-16 -top-16 w-36 h-36 bg-blue-100/30 rounded-full blur-2xl pointer-events-none" />

          <div className="space-y-2 text-center md:text-left flex-1">
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2.5">
              <h1 className="text-xl md:text-2xl font-bold text-slate-800 tracking-tight font-display select-none">
                C语言二级考试通关大进阶
              </h1>
              <span className="px-2 py-0.5 bg-blue-600 text-white text-[10px] font-bold uppercase tracking-wider rounded-md">
                v2026.05 官方真题库
              </span>
            </div>
            <p className="text-xs text-slate-400 max-w-2xl leading-relaxed">
              全面精细收录 <strong>251道高频官方考核原题</strong>。提供多维度能力大屏、顺序智能刷题、全真模拟实试倒计时、历史战绩跟踪与支持消灭核销的“错题笔记本”硬核辅助系统，为您考试保怀护航！
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-6 shrink-0">
            {/* Window Scale Zoom Controls */}
            <div className="flex items-center gap-2 bg-slate-50/80 border border-slate-150 p-2 rounded-2xl shadow-xs">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider font-mono">
                视口缩放
              </span>
              <div className="flex items-center gap-1.5 bg-white border border-slate-150 pl-2 pr-1 py-1 rounded-xl">
                <span className="text-xs font-bold text-slate-600 font-mono min-w-[36px] text-center">
                  {Math.round(zoomLevel * 100)}%
                </span>
                <button
                  onClick={() => handleZoomChange(-0.1)}
                  disabled={zoomLevel <= 0.7}
                  className="w-5.5 h-5.5 flex items-center justify-center bg-slate-50 hover:bg-slate-100 text-slate-500 hover:text-slate-800 disabled:opacity-30 disabled:cursor-not-allowed rounded-lg border border-slate-150 transition-all cursor-pointer"
                  title="缩小"
                >
                  <ZoomOut className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => handleZoomChange(0.1)}
                  disabled={zoomLevel >= 1.5}
                  className="w-5.5 h-5.5 flex items-center justify-center bg-slate-50 hover:bg-slate-100 text-slate-500 hover:text-slate-800 disabled:opacity-30 disabled:cursor-not-allowed rounded-lg border border-slate-150 transition-all cursor-pointer"
                  title="放大"
                >
                  <ZoomIn className="w-3.5 h-3.5" />
                </button>
                {zoomLevel !== 1.0 && (
                  <button
                    onClick={() => setZoomLevel(1.0)}
                    className="text-[10px] text-blue-600 hover:text-blue-700 font-semibold px-1.5 hover:bg-blue-50/50 py-0.5 rounded-md transition-colors"
                  >
                    重置
                  </button>
                )}
              </div>
            </div>

            {/* Short current accuracy banner */}
            <div className="text-right hidden sm:block space-y-0.5">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-medium">全局累计完成率</span>
              <strong className="text-sm text-slate-700 font-bold font-mono">
                {Object.keys(practiceState.answered).length} / 251 题
              </strong>
            </div>
          </div>
        </header>

        {/* Dynamic Mode Switcher Navigation tabs */}
        <div id="tab_switcher_panel" className="flex flex-wrap md:flex-nowrap items-center justify-between gap-3 bg-white p-2 rounded-2xl border border-slate-100 shadow-xs">
          <nav className="flex flex-1 flex-wrap gap-1">
            <button
              id="dashboard_tab_btn"
              onClick={() => setActiveTab("dashboard")}
              className={`flex items-center gap-2 py-2.5 px-4 rounded-xl text-xs font-semibold tracking-wide transition-all cursor-pointer ${
                activeTab === "dashboard"
                  ? "bg-slate-900 text-white shadow-xs"
                  : "text-slate-500 hover:text-slate-900 hover:bg-slate-50"
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              <span>智能能力仪表盘</span>
            </button>

            <button
              id="practice_tab_btn"
              onClick={() => setActiveTab("practice")}
              className={`flex items-center gap-2 py-2.5 px-4 rounded-xl text-xs font-semibold tracking-wide transition-all cursor-pointer ${
                activeTab === "practice"
                  ? "bg-slate-900 text-white shadow-xs"
                  : "text-slate-500 hover:text-slate-900 hover:bg-slate-50"
              }`}
            >
              <BookOpen className="w-4 h-4" />
              <span>全真刷题练习</span>
            </button>

            <button
              id="exam_tab_btn"
              onClick={() => setActiveTab("exam")}
              className={`flex items-center gap-2 py-2.5 px-4 rounded-xl text-xs font-semibold tracking-wide transition-all cursor-pointer ${
                activeTab === "exam"
                  ? "bg-slate-900 text-white shadow-xs"
                  : "text-slate-500 hover:text-slate-900 hover:bg-slate-50"
              }`}
            >
              <Compass className="w-4 h-4" />
              <span>全真模拟考试</span>
            </button>

            <button
              id="wrongs_tab_btn"
              onClick={() => setActiveTab("wrongs")}
              className={`flex items-center gap-2 py-2.5 px-4 rounded-xl text-xs font-semibold tracking-wide transition-all cursor-pointer ${
                activeTab === "wrongs"
                  ? "bg-slate-900 text-white shadow-xs animate-pulse"
                  : "text-slate-500 hover:text-slate-900 hover:bg-slate-50"
              }`}
            >
              <FileCheck className="w-4 h-4" />
              <span>错题复习本</span>
              {practiceState.wrongList.length > 0 && (
                <span className="ml-1 bg-rose-500 text-white font-bold px-1.5 py-0.2 rounded-full text-[9px] font-mono leading-none">
                  {practiceState.wrongList.length}
                </span>
              )}
            </button>
          </nav>
        </div>

        {/* Primary View Router Area */}
        <main id="primary_view_pane" className="transition-all duration-300">
          {activeTab === "dashboard" && (
            <StatsSection
              state={practiceState}
              onNavigateToCategory={handleNavigateToCategory}
              onReset={handleFullReset}
              onNavigateToWrong={handleNavigateToWrong}
              onNavigateToStarred={handleNavigateToStarred}
              onNavigateToPractice={handleNavigateToPractice}
            />
          )}

          {activeTab === "practice" && (
            <QuizCard
              questions={allQuestions}
              answered={practiceState.answered}
              correct={practiceState.correct}
              bookmarked={practiceState.bookmarked}
              onAnswer={handleAnswerQuestion}
              onToggleBookmark={handleToggleBookmark}
              initialIndex={initialQuizIndex}
            />
          )}

          {activeTab === "exam" && (
            <MockExam
              onAddWrongs={handleAddWrongsFromExam}
              history={examHistory}
              onRefreshHistory={() => setExamHistory(getExamHistory())}
            />
          )}

          {activeTab === "wrongs" && (
            <WrongBook
              wrongList={practiceState.wrongList}
              bookmarked={practiceState.bookmarked}
              onRemoveFromWrongs={handleRemoveFromWrongs}
              onClearWrongs={handleClearWrongs}
              onToggleBookmark={handleToggleBookmark}
              onAnswerQuestion={handleAnswerQuestion}
            />
          )}
        </main>
      </div>

      {/* Decorative footer */}
      <footer id="app_credits_footer" className="bg-white border-t border-slate-150 py-6 text-center text-[11px] text-slate-400 font-sans tracking-wide">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© 2026 C语言二级官方考试强化版. 本地高速 localStorage 沙箱存储保护中.</p>
          <div className="flex items-center gap-4 select-none">
            <span className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>真题覆盖: 100% (251题全套)</span>
            </span>
          </div>
        </div>
      </footer>

    </div>
  );
}
