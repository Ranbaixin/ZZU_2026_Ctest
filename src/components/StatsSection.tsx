import React, { useMemo, useState } from "react";
import { Question, allQuestions, categories } from "../data/questions";
import { PracticeState } from "../utils/quizHelpers";
import { 
  BookOpen, 
  CheckCircle, 
  XCircle, 
  Star, 
  BarChart2, 
  RotateCcw,
  BookMarked,
  Award,
  AlertTriangle
} from "lucide-react";

interface StatsSectionProps {
  state: PracticeState;
  onNavigateToCategory: (categoryName: string) => void;
  onReset: () => void;
  onNavigateToWrong: () => void;
  onNavigateToStarred: () => void;
  onNavigateToPractice: (startIndex: number) => void;
}

export const StatsSection: React.FC<StatsSectionProps> = ({
  state,
  onNavigateToCategory,
  onReset,
  onNavigateToWrong,
  onNavigateToStarred,
  onNavigateToPractice,
}) => {
  const { answered, correct, bookmarked } = state;
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  // Stat computations
  const totalQuestions = allQuestions.length;
  const answeredCount = Object.keys(answered).length;
  const correctCount = Object.values(correct).filter(Boolean).length;
  const wrongCount = answeredCount - correctCount;
  const starCount = Object.values(bookmarked).filter(Boolean).length;

  const currentAccuracy = useMemo(() => {
    if (answeredCount === 0) return 0;
    return Math.round((correctCount / answeredCount) * 100);
  }, [answeredCount, correctCount]);

  const overallProgressPercentage = useMemo(() => {
    return Math.round((answeredCount / totalQuestions) * 100);
  }, [answeredCount, totalQuestions]);

  // Compute category details
  const categoryStats = useMemo(() => {
    const stats: Record<string, { total: number; answered: number; correct: number }> = {};
    
    // Initialize
    categories.forEach(cat => {
      stats[cat] = { total: 0, answered: 0, correct: 0 };
    });

    // Populate
    allQuestions.forEach(q => {
      if (stats[q.cat]) {
        stats[q.cat].total += 1;
        if (answered[q.id] !== undefined) {
          stats[q.cat].answered += 1;
          if (correct[q.id]) {
            stats[q.cat].correct += 1;
          }
        }
      }
    });

    return Object.entries(stats).map(([name, data]) => {
      const accuracy = data.answered === 0 ? 0 : Math.round((data.correct / data.answered) * 100);
      const completion = Math.round((data.answered / data.total) * 100);
      return {
        name,
        ...data,
        accuracy,
        completion,
      };
    });
  }, [answered, correct]);

  // Find index of first unanswered question to easily "resume"
  const firstUnansweredIndex = useMemo(() => {
    const idx = allQuestions.findIndex(q => answered[q.id] === undefined);
    return idx === -1 ? 0 : idx;
  }, [answered]);

  return (
    <div id="stats_section_container" className="space-y-6">
      {/* Quick overview ribbon */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div 
          id="stat_all_card" 
          onClick={() => onNavigateToPractice(firstUnansweredIndex)}
          className="bg-white p-5 rounded-2xl border border-slate-100 hover:border-blue-200 transition-all cursor-pointer shadow-xs group"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-400 font-display">总刷题进度</span>
            <div className="p-2 bg-blue-50 text-blue-500 rounded-lg group-hover:bg-blue-100 transition-colors">
              <BookOpen className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline space-x-1">
            <span className="text-2xl font-semibold font-display text-slate-800">{answeredCount}</span>
            <span className="text-xs text-slate-400">/ {totalQuestions} 题</span>
          </div>
          <div className="mt-3 w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
            <div 
              className="bg-blue-500 h-1.5 rounded-full transition-all duration-500" 
              style={{ width: `${overallProgressPercentage}%` }}
            />
          </div>
          <div className="mt-1 flex justify-between items-center text-[10px] text-slate-400 font-mono">
            <span>占全部</span>
            <span>{overallProgressPercentage}%</span>
          </div>
        </div>

        <div 
          id="stat_accuracy_card"
          className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs flex flex-col justify-between"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-400 font-display">当前正确率</span>
            <div className={`p-2 rounded-lg ${currentAccuracy >= 80 ? 'bg-emerald-50 text-emerald-500' : 'bg-amber-50 text-amber-500'}`}>
              <CheckCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline space-x-1">
            <span className={`text-2xl font-semibold font-display ${currentAccuracy >= 80 ? 'text-emerald-600' : 'text-amber-600'}`}>
              {currentAccuracy}%
            </span>
          </div>
          <div className="mt-2 text-xs text-slate-400 font-sans leading-tight">
            共做对 <span className="text-slate-800 font-medium">{correctCount}</span> 题，做错 <span className="text-slate-800 font-medium">{wrongCount}</span> 题
          </div>
        </div>

        <div 
          id="stat_wrong_card"
          onClick={onNavigateToWrong}
          className="bg-white p-5 rounded-2xl border border-slate-100 hover:border-rose-200 transition-all cursor-pointer shadow-xs group"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-400 font-display">错题存记</span>
            <div className={`p-2 rounded-lg ${wrongCount > 0 ? 'bg-rose-50 text-rose-500 group-hover:bg-rose-100' : 'bg-slate-50 text-slate-400'} transition-colors`}>
              <XCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline space-x-1">
            <span className="text-2xl font-semibold font-display text-slate-800">{wrongCount}</span>
            <span className="text-xs text-slate-400">道错题</span>
          </div>
          <div className="mt-2 text-xs text-slate-400 hover:text-rose-500 transition-colors flex items-center gap-1">
            <span>点击立即进入错题本 ➔</span>
          </div>
        </div>

        <div 
          id="stat_starred_card"
          onClick={onNavigateToStarred}
          className="bg-white p-5 rounded-2xl border border-slate-100 hover:border-yellow-200 transition-all cursor-pointer shadow-xs group"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-400 font-display">我的收藏</span>
            <div className={`p-2 rounded-lg ${starCount > 0 ? 'bg-yellow-50 text-yellow-500 group-hover:bg-yellow-100' : 'bg-slate-50 text-slate-400'} transition-colors`}>
              <Star className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline space-x-1">
            <span className="text-2xl font-semibold font-display text-slate-800">{starCount}</span>
            <span className="text-xs text-slate-400 font-sans">道收藏</span>
          </div>
          <div className="mt-2 text-xs text-slate-400 hover:text-yellow-600 transition-colors flex items-center gap-1">
            <span>点击查看收藏题目 ➔</span>
          </div>
        </div>
      </div>

      {/* Main Stats layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Circle mastery & quick advice */}
        <div id="mastery_radar_card" className="bg-white p-6 rounded-3xl border border-slate-100 shadow-xs flex flex-col justify-between space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <span className="font-semibold text-slate-800 flex items-center gap-2 font-display">
              <Award className="w-4 h-4 text-amber-500" /> C语言掌握力评级
            </span>
          </div>
          
          <div className="flex flex-col items-center justify-center space-y-3 py-4">
            <div className="relative w-36 h-36 flex items-center justify-center">
              {/* Radial Progress */}
              <svg className="w-full h-full transform -rotate-90">
                <circle
                  cx="72"
                  cy="72"
                  r="64"
                  className="stroke-slate-100 fill-none"
                  strokeWidth="10"
                />
                <circle
                  cx="72"
                  cy="72"
                  r="64"
                  className={`fill-none transition-all duration-1000 ${
                    currentAccuracy >= 80 ? 'stroke-emerald-500' : 
                    currentAccuracy >= 60 ? 'stroke-blue-500' : 
                    currentAccuracy > 0 ? 'stroke-amber-500' : 'stroke-slate-250'
                  }`}
                  strokeWidth="10"
                  strokeDasharray={`${2 * Math.PI * 64}`}
                  strokeDashoffset={`${2 * Math.PI * 64 * (1 - (answeredCount === 0 ? 0 : currentAccuracy) / 100)}`}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute flex flex-col items-center justify-center text-center">
                <span className="text-3xl font-bold font-display text-slate-800">
                  {answeredCount === 0 ? "暂无" : `${currentAccuracy}%`}
                </span>
                <span className="text-[10px] text-slate-400 mt-0.5">做题正确率</span>
              </div>
            </div>

            <div className="text-center space-y-1">
              <h4 className="text-sm font-semibold text-slate-700">
                {answeredCount === 0 ? "尚未开始答题" :
                 currentAccuracy >= 85 ? "完美掌控" :
                 currentAccuracy >= 70 ? "基础扎实" :
                 currentAccuracy >= 50 ? "仍需努力" : "漏洞较多"}
              </h4>
              <p className="text-xs text-slate-400 px-3 select-none leading-relaxed">
                {answeredCount === 0 ? "点击下方按钮开始顺序练习，我们将对您的答题行为进行深度能力肖像挖掘！" :
                 currentAccuracy >= 85 ? "您的代码功底相当出众，对指针算术、多维维数组等各种复杂结构了如指掌！" :
                 currentAccuracy >= 70 ? "您已具备郑大2026年C语言考试及格实力。查缺补漏多刷弱项分类即可完美冲击优秀！" :
                 currentAccuracy >= 50 ? "多练习控制和指针方面的经典案例，在错题本中重试和研读其深度解析。" : 
                 "建议参考代码解析，弄懂每道题在底层中各变量的干裂自变过程再做复习。"}
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-2 pt-2 border-t border-slate-100">
            <button
              id="resume_practice_btn"
              onClick={() => onNavigateToPractice(firstUnansweredIndex)}
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs rounded-xl transition-all shadow-xs flex items-center justify-center gap-2 group cursor-pointer"
            >
              <span>{answeredCount === 0 ? "立即开始首次答题" : "同步继续先前练习"}</span>
              <span className="group-hover:translate-x-1 transition-transform">➔</span>
            </button>
            <button
              id="reset_entire_btn"
              onClick={() => setShowResetConfirm(true)}
              className="w-full py-2 bg-slate-50 hover:bg-rose-50 hover:text-rose-600 text-slate-400 font-medium text-xs rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>清空本地所有答题记录</span>
            </button>
          </div>
        </div>

        {/* Custom reset confirmation modal overlay */}
        {showResetConfirm && (
          <div id="reset_confirm_modal_backdrop" className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4 animate-fade-in">
            <div id="reset_confirm_modal_box" className="bg-white rounded-3xl border border-slate-100 shadow-xl max-w-sm w-full p-6 space-y-4 animate-scale-up">
              <div className="flex items-center gap-3 text-rose-600">
                <div className="p-2.5 bg-rose-50 rounded-xl">
                  <AlertTriangle className="w-5 h-5 animate-pulse" />
                </div>
                <h3 className="text-base font-bold font-display text-slate-800">确认清空记录？</h3>
              </div>
              
              <p className="text-xs text-slate-500 leading-relaxed">
                确定要清空全部的刷题进度、统计数据与智能能力诊断吗？该动作不可撤销，且会重置已解答和错题笔记本的全部信息。
              </p>

              <div className="flex items-center gap-2 pt-2">
                <button
                  id="cancel_reset_btn"
                  onClick={() => setShowResetConfirm(false)}
                  className="flex-1 py-2 bg-slate-50 hover:bg-slate-100 text-slate-600 font-semibold text-xs rounded-xl transition-all cursor-pointer text-center border border-slate-200"
                >
                  取消
                </button>
                <button
                  id="confirm_reset_btn"
                  onClick={() => {
                    setShowResetConfirm(false);
                    onReset();
                  }}
                  className="flex-1 py-2 bg-rose-500 hover:bg-rose-600 text-white font-semibold text-xs rounded-xl transition-all cursor-pointer text-center shadow-xs"
                >
                  确认清空
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Category breakdown Bento grids */}
        <div id="category_breakdown_card" className="bg-white p-6 rounded-3xl border border-slate-100 shadow-xs lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <span className="font-semibold text-slate-800 flex items-center gap-2 font-display">
              <BarChart2 className="w-4 h-4 text-blue-500" /> C语言各章节能力洞察
            </span>
            <span className="text-xs text-slate-400 select-none">点击章节可直接进入专项训练</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
            {categoryStats.map((cat, idx) => (
              <div 
                key={idx}
                onClick={() => onNavigateToCategory(cat.name)}
                className="p-4 rounded-xl border border-slate-100 hover:border-blue-200 bg-slate-50/50 hover:bg-white cursor-pointer transition-all flex flex-col justify-between group"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="space-y-0.5">
                    <span className="text-xs font-semibold text-slate-700 group-hover:text-blue-600 transition-colors">
                      {cat.name}
                    </span>
                    <p className="text-[10px] text-slate-400 font-mono">
                      已刷: {cat.answered} / 全: {cat.total} 题
                    </p>
                  </div>
                  <div className={`px-2 py-0.5 rounded text-[10px] font-semibold font-mono ${
                    cat.answered === 0 ? 'bg-slate-100 text-slate-400' :
                    cat.accuracy >= 75 ? 'bg-emerald-50 text-emerald-600' :
                    cat.accuracy >= 55 ? 'bg-blue-50 text-blue-600' : 'bg-rose-50 text-rose-600'
                  }`}>
                    {cat.answered === 0 ? "未刷" : `${cat.accuracy}% 正确`}
                  </div>
                </div>

                {/* Micro progress line */}
                <div className="space-y-1.5 mt-2">
                  <div className="w-full bg-slate-200/60 h-1 rounded-full overflow-hidden">
                    <div 
                      className={`h-1 rounded-full transition-all duration-500 ${
                        cat.accuracy >= 75 ? 'bg-emerald-500' : 
                        cat.accuracy >= 55 ? 'bg-blue-500' : 
                        cat.answered === 0 ? 'bg-slate-300' : 'bg-rose-500'
                      }`}
                      style={{ width: `${cat.completion}%` }}
                    />
                  </div>
                  <div className="flex justify-between items-center text-[10px] text-slate-400 font-sans">
                    <span>章节完成度</span>
                    <span className="font-mono text-slate-600 font-medium">{cat.completion}%</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
