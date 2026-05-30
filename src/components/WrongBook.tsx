import React, { useState, useMemo } from "react";
import { Question, allQuestions } from "../data/questions";
import { 
  HelpCircle, 
  Trash2, 
  RotateCcw, 
  Search, 
  CheckCircle, 
  XCircle, 
  Lightbulb, 
  Bookmark,
  CheckSquare,
  AlertTriangle
} from "lucide-react";

interface WrongBookProps {
  wrongList: number[];
  bookmarked: Record<number, boolean>;
  onRemoveFromWrongs: (questionId: number) => void;
  onClearWrongs: () => void;
  onToggleBookmark: (questionId: number) => void;
  onAnswerQuestion: (questionId: number, selectedOption: string, isCorrect: boolean) => void;
}

export const WrongBook: React.FC<WrongBookProps> = ({
  wrongList,
  bookmarked,
  onRemoveFromWrongs,
  onClearWrongs,
  onToggleBookmark,
  onAnswerQuestion,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  
  // Track individual interactive re-attempts on wrong questions
  // questionId -> temporary selected choice ('A'|'B'|'C'|'D')
  const [retryAnswers, setRetryAnswers] = useState<Record<number, string>>({});

  // Find standard question objects for IDs in the mistake list
  const wrongQuestions = useMemo(() => {
    // Unique the IDs just in case
    const uniqueIds = Array.from(new Set(wrongList));
    return uniqueIds
      .map(id => allQuestions.find(q => q.id === id))
      .filter((q): q is Question => q !== undefined);
  }, [wrongList]);

  // Categories in mistake sheet
  const mistakeCategories = useMemo(() => {
    const list = wrongQuestions.map(q => q.cat);
    return ["all", ...Array.from(new Set(list))];
  }, [wrongQuestions]);

  // Search & category filter logic
  const filteredWrongQuestions = useMemo(() => {
    return wrongQuestions.filter(q => {
      const matchSearch = searchQuery.trim() === "" || 
        q.q.toLowerCase().includes(searchQuery.toLowerCase()) || 
        `q${q.id}`.includes(searchQuery.toLowerCase());
      
      const matchCat = selectedCategory === "all" || q.cat === selectedCategory;

      return matchSearch && matchCat;
    });
  }, [wrongQuestions, searchQuery, selectedCategory]);

  const handleRetrySelect = (questionId: number, optionChar: string, correctChar: string) => {
    setRetryAnswers(prev => ({
      ...prev,
      [questionId]: optionChar
    }));

    const isCorrect = optionChar === correctChar;
    // Feed back answer event to parent so standard global statistics can update of newly answered items
    onAnswerQuestion(questionId, optionChar, isCorrect);
  };

  return (
    <div id="wrong_book_container" className="space-y-6">
      
      {/* Control bar / filters and headers */}
      <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="space-y-1 text-center md:text-left">
          <h3 className="text-lg font-bold text-slate-800 font-display flex items-center justify-center md:justify-start gap-2">
            <Trash2 className="w-5 h-5 text-rose-500" /> 错题及复习笔记本
          </h3>
          <p className="text-xs text-slate-400 font-sans">
            本册统一收录了您在顺序刷题、考考训练及各个专项中答错的题目，共 <strong className="text-slate-700">{wrongQuestions.length}</strong> 道。
          </p>
        </div>

        {wrongQuestions.length > 0 && (
          <button
            onClick={() => setShowClearConfirm(true)}
            className="shrink-0 py-2 px-4 bg-rose-50 hover:bg-rose-100 text-rose-600 text-xs font-semibold rounded-xl transition-all cursor-pointer flex items-center gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            <span>一键清空错题本记录</span>
          </button>
        )}
      </div>

      {/* Custom clear wrongs confirmation modal overlay */}
      {showClearConfirm && (
        <div id="clear_wrongs_confirm_modal_backdrop" className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4 animate-fade-in animate-duration-200">
          <div id="clear_wrongs_confirm_modal_box" className="bg-white rounded-3xl border border-slate-100 shadow-xl max-w-sm w-full p-6 space-y-4 animate-scale-up">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="p-2.5 bg-rose-50 rounded-xl">
                <AlertTriangle className="w-5 h-5 animate-pulse" />
              </div>
              <h3 className="text-base font-bold font-display text-slate-800">确认清空错题本？</h3>
            </div>
            
            <p className="text-xs text-slate-500 leading-relaxed">
              确定要清空错题本中的所有记录吗？此举会移除错题本中目前归集的所有题目，并复位作答状态。
            </p>

            <div className="flex items-center gap-2 pt-2">
              <button
                id="cancel_clear_btn"
                onClick={() => setShowClearConfirm(false)}
                className="flex-1 py-2 bg-slate-50 hover:bg-slate-100 text-slate-600 font-semibold text-xs rounded-xl transition-all cursor-pointer text-center border border-slate-200"
              >
                取消
              </button>
              <button
                id="confirm_clear_btn"
                onClick={() => {
                  setShowClearConfirm(false);
                  onClearWrongs();
                  setRetryAnswers({});
                }}
                className="flex-1 py-2 bg-rose-500 hover:bg-rose-600 text-white font-semibold text-xs rounded-xl transition-all cursor-pointer text-center shadow-xs"
              >
                确认清空
              </button>
            </div>
          </div>
        </div>
      )}

      {wrongQuestions.length === 0 ? (
        <div id="empty_wrong_book" className="bg-white rounded-3xl p-16 text-center border border-slate-100 max-w-xl mx-auto space-y-4 shadow-xs">
          <div className="w-16 h-16 bg-emerald-50 text-emerald-500 rounded-2xl flex items-center justify-center mx-auto animate-float">
            <CheckCircle className="w-8 h-8" />
          </div>
          <h3 className="font-semibold text-lg text-slate-800">暂无任何错题！</h3>
          <p className="text-slate-400 text-xs leading-relaxed max-w-sm mx-auto">
            干得漂亮！说明您的C语言功底极为扎实，或在练习中做到了全部满分做对。继续加油，在模拟考试中尝试冲击完美的100满分吧！
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Filters sidebar */}
          <div className="lg:col-span-1 space-y-4">
            <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-xs space-y-4">
              <div className="space-y-1.5">
                <span className="text-[10px] font-bold tracking-wider uppercase text-blue-500 font-mono">本册内过滤</span>
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    placeholder="在错题中搜索..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 text-xs border border-transparent rounded-xl focus:bg-white focus:border-blue-100 focus:ring-2 focus:ring-blue-100 transition-all text-slate-700 outline-hidden"
                  />
                </div>
              </div>

              <div className="space-y-2 border-t border-slate-100 pt-3">
                <span className="text-[10px] font-bold tracking-wider uppercase text-blue-500 font-mono">按发生分类划分</span>
                <div className="flex flex-col gap-1 max-h-48 overflow-y-auto pr-1">
                  {mistakeCategories.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`text-left py-1.5 px-2.5 rounded-lg text-xs leading-none transition-all cursor-pointer ${
                        selectedCategory === cat 
                          ? "bg-blue-600 text-white font-semibold" 
                          : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"
                      }`}
                    >
                      {cat === "all" ? "全部错题" : cat}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Mistakes feed */}
          <div className="lg:col-span-3 space-y-6">
            {filteredWrongQuestions.length === 0 ? (
              <div className="bg-white rounded-3xl p-12 text-center border border-slate-100 space-y-4 shadow-xs">
                <HelpCircle className="w-10 h-10 text-slate-300 mx-auto" />
                <h4 className="font-semibold text-slate-700 text-sm">此筛选分类下暂无错题</h4>
                <button
                  onClick={() => { setSearchQuery(""); setSelectedCategory("all"); }}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs rounded-lg cursor-pointer"
                >
                  清除筛选条件
                </button>
              </div>
            ) : (
              filteredWrongQuestions.map((q) => {
                const retrySelected = retryAnswers[q.id];
                const isRetryCorrect = retrySelected === q.a;
                const isStarred = !!bookmarked[q.id];

                return (
                  <div 
                    key={q.id} 
                    id={`wrong_item_${q.id}`} 
                    className="bg-white rounded-3xl border border-slate-150 shadow-xs relative overflow-hidden p-6 md:p-8 space-y-5 hover:border-slate-350 transition-all"
                  >
                    {/* Top flag bar */}
                    <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                      <div className="flex items-center space-x-2">
                        <span className="px-2 py-0.5 bg-rose-50 text-rose-500 text-[10px] font-mono font-bold rounded">
                          题号: #{q.id}
                        </span>
                        <span className="text-xs text-slate-400 font-sans">
                          ({q.cat})
                        </span>
                      </div>

                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => onToggleBookmark(q.id)}
                          className="p-1 rounded-md hover:bg-slate-50 text-slate-400 hover:text-amber-500 transition-colors cursor-pointer"
                          title="收藏"
                        >
                          <Bookmark className={`w-4 h-4 ${isStarred ? "fill-amber-400 text-amber-400" : ""}`} />
                        </button>
                        <button
                          onClick={() => onRemoveFromWrongs(q.id)}
                          className="p-1 rounded-md hover:bg-slate-50 text-slate-400 hover:text-rose-500 transition-colors cursor-pointer"
                          title="直接从错题列表中移出"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Question description */}
                    <div className="text-sm font-sans text-slate-800 leading-relaxed whitespace-pre-wrap">
                      {q.q}
                    </div>

                    {/* Retry Interactive Option Buttons */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                      {["A", "B", "C", "D"].map((optKey, oIdx) => {
                        const optText = q.o[oIdx];
                        const cleanOptText = optText ? optText.replace(/^[A-D]、\s*/, "") : "";
                        const isSelectedInRetry = retrySelected === optKey;
                        const isCorrectInRetry = q.a === optKey;
                        const hasRetried = retrySelected !== undefined;

                        let style = "border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50/50";
                        if (hasRetried) {
                          if (isSelectedInRetry) {
                            style = isRetryCorrect 
                              ? "bg-emerald-50 border-emerald-300 text-emerald-800 font-medium" 
                              : "bg-rose-50 border-rose-300 text-rose-800 font-medium";
                          } else if (isCorrectInRetry) {
                            style = "bg-emerald-50/40 border-emerald-250 text-emerald-800 font-medium";
                          } else {
                            style = "border-slate-100 bg-slate-50/10 text-slate-350 cursor-not-allowed opacity-70";
                          }
                        }

                        return (
                          <button
                            key={optKey}
                            disabled={hasRetried}
                            onClick={() => handleRetrySelect(q.id, optKey, q.a)}
                            className={`p-3 rounded-xl text-left text-xs transition-all border cursor-pointer font-sans leading-normal ${style} flex items-start gap-2`}
                          >
                            <span className={`w-5.5 h-5.5 rounded-full text-xs font-semibold shrink-0 flex items-center justify-center transition-colors ${
                              isSelectedInRetry 
                                ? (isRetryCorrect ? "bg-emerald-500 text-white" : "bg-rose-500 text-white")
                                : (isCorrectInRetry && hasRetried ? "bg-emerald-500 text-white" : "bg-slate-100 text-slate-400")
                            }`}>
                              {optKey}
                            </span>
                            <span className="flex-1 mt-0.5 leading-snug">
                              {cleanOptText || optText}
                            </span>
                          </button>
                        );
                      })}
                    </div>

                    {/* Feedback & Actions */}
                    {retrySelected !== undefined && (
                      <div className="pt-4 border-t border-slate-100 space-y-4">
                        <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl flex items-start gap-3.5">
                          <div className={`p-2 rounded-xl shrink-0 ${isRetryCorrect ? 'bg-emerald-50 text-emerald-500' : 'bg-rose-50 text-rose-500'}`}>
                            <Lightbulb className="w-4.5 h-4.5" />
                          </div>
                          <div className="space-y-1 flex-1">
                            <span className="text-xs font-bold text-slate-800">
                              {isRetryCorrect ? "🎉 恭喜做对啦！" : "❌ 呀，又选错啦！"}
                            </span>
                            <p className="text-xs text-slate-500 leading-relaxed whitespace-pre-wrap">
                              {q.e}
                            </p>
                          </div>
                        </div>

                        {/* If answered correctly, let them proudly eliminate it! */}
                        <div className="flex justify-end gap-2.5">
                          {isRetryCorrect && (
                            <button
                              onClick={() => {
                                onRemoveFromWrongs(q.id);
                                // Reset local retry tag for this ID as it departs
                                const copy = { ...retryAnswers };
                                delete copy[q.id];
                                setRetryAnswers(copy);
                              }}
                              className="py-1.5 px-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
                            >
                              <CheckSquare className="w-3.5 h-3.5" />
                              <span>错题已解决！从此移出库</span>
                            </button>
                          )}
                          <button
                            onClick={() => {
                              const copy = { ...retryAnswers };
                              delete copy[q.id];
                              setRetryAnswers(copy);
                            }}
                            className="py-1.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-400 text-xs rounded-lg transition-all cursor-pointer font-semibold"
                          >
                            清除重试状态再来
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};
