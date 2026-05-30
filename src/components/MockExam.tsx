import React, { useState, useEffect, useMemo } from "react";
import { Question } from "../data/questions";
import { generateMockExam, ExamHistoryRecord, saveExamHistory } from "../utils/quizHelpers";
import { 
  History, 
  Play, 
  Timer, 
  ChevronLeft, 
  ChevronRight, 
  CheckCircle2, 
  AlertCircle, 
  RotateCcw, 
  Compass, 
  Award,
  BookOpen
} from "lucide-react";

interface MockExamProps {
  onAddWrongs: (wrongIds: number[]) => void;
  history: ExamHistoryRecord[];
  onRefreshHistory: () => void;
}

export const MockExam: React.FC<MockExamProps> = ({
  onAddWrongs,
  history,
  onRefreshHistory,
}) => {
  const [examStarted, setExamStarted] = useState(false);
  const [examQuestions, setExamQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Record<number, string>>({}); // questionId -> selectedOption
  const [currentIndex, setCurrentIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(1800); // 30 minutes in seconds
  const [examFinished, setExamFinished] = useState(false);
  const [finalRecord, setFinalRecord] = useState<ExamHistoryRecord | null>(null);
  const [showSubmitConfirm, setShowSubmitConfirm] = useState(false);

  // Stats
  const answeredCount = Object.keys(answers).length;

  // Countdown clock timer
  useEffect(() => {
    if (!examStarted || examFinished) return;

    if (timeLeft <= 0) {
      handleFinishExam();
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [examStarted, examFinished, timeLeft]);

  const handleStartExam = () => {
    const questions = generateMockExam();
    setExamQuestions(questions);
    setAnswers({});
    setCurrentIndex(0);
    setTimeLeft(1800); // 30 minutes
    setExamFinished(false);
    setFinalRecord(null);
    setExamStarted(true);
  };

  const handleFinishExam = () => {
    if (!examQuestions.length) return;

    let correctCount = 0;
    const wrongIds: number[] = [];

    examQuestions.forEach(q => {
      const ans = answers[q.id];
      if (ans === q.a) {
        correctCount += 1;
      } else {
        wrongIds.push(q.id);
      }
    });

    // Score out of 100
    const rawScore = Math.round((correctCount / examQuestions.length) * 100);
    const elapsedSeconds = 1800 - timeLeft;

    const record: ExamHistoryRecord = {
      id: `exam_${Date.now()}`,
      timestamp: Date.now(),
      score: rawScore,
      totalQuestions: examQuestions.length,
      correctAnswers: correctCount,
      wrongIds,
      durationSeconds: elapsedSeconds,
    };

    // Save record to local storage
    saveExamHistory(record);
    setFinalRecord(record);
    setExamFinished(true);

    // Feed incorrect question IDs back to parent so they land in Wrong Questions Book
    if (wrongIds.length > 0) {
      onAddWrongs(wrongIds);
    }

    // Refresh history
    onRefreshHistory();
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const currentQuestion = examQuestions[currentIndex];

  return (
    <div id="mock_exam_container" className="space-y-6">
      {!examStarted ? (
        /* Welcome Lobby & History Tab */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div id="exam_intro_card" className="lg:col-span-2 bg-white p-6 md:p-8 rounded-3xl border border-slate-100 shadow-xs flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div className="inline-flex p-3 bg-blue-50 text-blue-600 rounded-2xl animate-float">
                <Compass className="w-6 h-6" />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-bold text-slate-800 font-display">郑州大学2026年C语言考试模拟测试</h3>
                <p className="text-slate-500 text-xs leading-relaxed max-w-xl">
                  模拟实考系统将以全真标准，在海量251大题库内按章节比率全智能抽取 <strong>30道经典题目</strong> 组装成模拟考试卷。试卷包含运算符、双维组合数组、行级指针、标准外置文件命令等多维难关、限时 <strong>30分钟</strong> 完成。
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="p-4 rounded-xl border border-slate-100 bg-slate-50/50 space-y-1">
                  <span className="text-xs font-semibold text-slate-700">📜 题目配比</span>
                  <p className="text-[11px] text-slate-400">
                    全方位覆盖指针、基本数据类型、数组及文件等7类难点。
                  </p>
                </div>
                <div className="p-4 rounded-xl border border-slate-100 bg-slate-50/50 space-y-1">
                  <span className="text-xs font-semibold text-slate-700">⏱️ 限时答题</span>
                  <p className="text-[11px] text-slate-400">
                    30分钟倒计时。到达时间后系统将强制收卷并智能 grading。
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-slate-100">
              <button
                id="start_mock_exam_btn"
                onClick={handleStartExam}
                className="w-full sm:w-auto py-3.5 px-6 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer group"
              >
                <Play className="w-4 h-4 fill-white" />
                <span>立即进入考场并开始发卷</span>
                <span className="group-hover:translate-x-1 transition-transform">➔</span>
              </button>
            </div>
          </div>

          {/* Previous histories bento */}
          <div id="exam_history_card" className="bg-white p-6 rounded-3xl border border-slate-100 shadow-xs flex flex-col space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-1">
              <span className="font-semibold text-slate-800 flex items-center gap-2 font-display">
                <History className="w-4.5 h-4.5 text-slate-400" /> 历史考试战绩簿
              </span>
              <span className="text-[10px] text-slate-400 select-none">最近 {history.length} 次</span>
            </div>

            {history.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-8 space-y-2 text-slate-300">
                <History className="w-10 h-10 stroke-1" />
                <span className="text-xs font-sans text-slate-400">尚无考试数据，赶紧考一发吧！</span>
              </div>
            ) : (
              <div className="space-y-2 flex-1 overflow-y-auto max-h-[300px] pr-1">
                {history.map((record) => (
                  <div key={record.id} className="p-3 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-between gap-3 hover:bg-white hover:border-slate-200 transition-all">
                    <div className="space-y-0.5">
                      <div className="flex items-baseline space-x-1.5">
                        <span className={`text-sm font-bold font-display ${
                          record.score >= 80 ? 'text-emerald-600' :
                          record.score >= 60 ? 'text-blue-500' : 'text-rose-500'
                        }`}>
                          {record.score}分
                        </span>
                        <span className="text-[9px] text-slate-400 font-sans">
                          (做对 {record.correctAnswers}/{record.totalQuestions} 题)
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-400 font-mono">
                        用时: {Math.floor(record.durationSeconds / 60)}分{record.durationSeconds % 60}秒
                      </p>
                    </div>
                    <span className="text-[9px] text-slate-350 font-mono">
                      {new Date(record.timestamp).toLocaleDateString()}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      ) : examFinished && finalRecord ? (
        /* Exam Finished Report card */
        <div className="space-y-6">
          <div className="bg-white p-6 md:p-8 rounded-3xl border border-slate-150 shadow-xs flex flex-col md:flex-row items-center justify-between gap-6 max-w-4xl mx-auto">
            <div className="flex flex-col items-center md:items-start text-center md:text-left space-y-3">
              <div className="p-3 bg-emerald-50 text-emerald-500 rounded-2xl animate-bounce">
                <Award className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-bold text-slate-800">考试已顺利完卷并已自动 ग्रेड评分</h3>
                <p className="text-slate-400 text-xs max-w-md">
                  本次考试您已答对 <strong className="text-slate-700">{finalRecord.correctAnswers}</strong> 道题目。相关做错的题目已智能化分类分派至您的错题本以辅助二次重做。
                </p>
              </div>
            </div>

            <div className="flex flex-row items-baseline space-x-6 shrink-0 bg-slate-50 border border-slate-100 p-6 rounded-2xl text-center">
              <div className="space-y-0.5">
                <span className="text-[10px] font-semibold text-slate-400">我的总分</span>
                <h4 className={`text-4xl font-extrabold font-display leading-none ${
                  finalRecord.score >= 80 ? 'text-emerald-500' :
                  finalRecord.score >= 60 ? 'text-blue-500' : 'text-rose-500'
                }`}>
                  {finalRecord.score}
                </h4>
                <p className="text-[10px] text-slate-400 font-mono mt-1">满分 100</p>
              </div>

              <div className="space-y-0.5 border-l border-slate-200 pl-6 text-left">
                <p className="text-xs text-slate-500 font-sans">
                  用时：<strong className="text-slate-700 font-mono font-bold">{Math.floor(finalRecord.durationSeconds / 60)}分{finalRecord.durationSeconds % 60}秒</strong>
                </p>
                <p className="text-xs text-slate-500 font-sans">
                  判定：<span className={`font-semibold ${
                    finalRecord.score >= 85 ? 'text-emerald-600' :
                    finalRecord.score >= 60 ? 'text-blue-500' : 'text-rose-500'
                  }`}>
                    {finalRecord.score >= 85 ? "S级 完美通关" :
                     finalRecord.score >= 70 ? "A级 扎实掌控" :
                     finalRecord.score >= 60 ? "B级 基本通过" : "C级 漏洞极大"}
                  </span>
                </p>
              </div>
            </div>
          </div>

          {/* Review exam sheet panel directly */}
          <div className="bg-white rounded-3xl border border-slate-150 p-6 shadow-xs space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <span className="font-semibold text-slate-800 flex items-center gap-2 font-display">
                <BookOpen className="w-5 h-5 text-blue-500" /> 本届考试错题核销分析
              </span>
              <button
                onClick={() => setExamStarted(false)}
                className="py-1.5 px-3 bg-slate-50 hover:bg-slate-100 text-slate-500 text-xs rounded-lg transition-all cursor-pointer font-semibold"
              >
                返回 lobby 战绩大厅
              </button>
            </div>

            <div className="space-y-6">
              {examQuestions.map((q, qIndex) => {
                const userAns = answers[q.id];
                const isCor = userAns === q.a;

                return (
                  <div key={q.id} className="p-5 rounded-2xl border border-slate-100 hover:border-slate-200 bg-slate-50/50 hover:bg-white transition-all space-y-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="space-y-1.5">
                        <span className="px-2 py-0.5 bg-slate-200/50 rounded-md text-[9px] font-bold text-slate-500 font-mono">
                          考题 #{qIndex + 1} ({q.cat})
                        </span>
                        <h4 className="text-sm font-semibold text-slate-800 whitespace-pre-wrap">
                          {q.q}
                        </h4>
                      </div>

                      <div className={`p-1.5 rounded-full ${isCor ? 'bg-emerald-50 text-emerald-500' : 'bg-rose-50 text-rose-500'}`}>
                        {isCor ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                      {q.o.map((opt, oIdx) => {
                        const char = ["A", "B", "C", "D"][oIdx];
                        const isChosen = userAns === char;
                        const isCorrectOption = q.a === char;

                        let style = "bg-white text-slate-600 border border-slate-200";
                        if (isChosen) {
                          style = isCor 
                            ? "bg-emerald-50 border border-emerald-300 text-emerald-800 font-medium" 
                            : "bg-rose-50 border border-rose-300 text-rose-800 font-medium";
                        } else if (isCorrectOption) {
                          style = "bg-emerald-50/40 border border-emerald-200 text-emerald-800 font-medium";
                        }

                        return (
                          <div key={char} className={`p-2 rounded-xl text-[11px] leading-tight flex items-start gap-1.5 ${style}`}>
                            <span className="font-bold">{char}.</span>
                            <span>{opt.replace(/^[A-D]、\s*/, "")}</span>
                          </div>
                        );
                      })}
                    </div>

                    <div className="p-3 bg-amber-50/40 border border-amber-100 rounded-xl space-y-1">
                      <div className="flex items-center gap-1 text-[11px] text-amber-700 font-semibold">
                        <span>💡 详细解析回答：</span>
                      </div>
                      <p className="text-xs text-slate-600 leading-relaxed font-sans">
                        {q.e}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="pt-4 flex justify-between items-center">
              <button
                onClick={handleStartExam}
                className="py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-xl shadow-xs transition-all flex items-center gap-2 cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
                <span>重新开始新一届模考</span>
              </button>
              <button
                onClick={() => setExamStarted(false)}
                className="py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-600 font-semibold text-xs rounded-xl transition-all cursor-pointer"
              >
                返回模场大厅
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* Mock Exam actively taking place */
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Main card panel */}
          <div className="lg:col-span-3 space-y-6">
            <div className="bg-white rounded-3xl border border-slate-150 shadow-xs relative overflow-hidden flex flex-col justify-between">
              
              {/* Highlight timer strip */}
              <div className="h-1 bg-blue-500 w-full" />

              {/* Header inside exam */}
              <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                <span className="px-2.5 py-1 bg-amber-50 text-amber-600 text-[10px] uppercase font-mono font-bold tracking-wider rounded-md">
                  正在进行：全真模拟考
                </span>

                <div className="flex items-center gap-2 text-slate-600 text-sm font-semibold font-mono">
                  <Timer className="w-4.5 h-4.5 text-blue-500 animate-pulse" />
                  <span>倒计时: {formatTime(timeLeft)}</span>
                </div>
              </div>

              {/* Card Question content */}
              <div className="p-6 md:p-8 space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <span className="text-xs bg-slate-100 text-slate-500 font-semibold px-2 py-0.5 rounded">
                      题号 #{currentIndex + 1}
                    </span>
                    <span className="text-xs text-slate-400 font-sans">
                      ({currentQuestion.cat})
                    </span>
                  </div>
                  <div 
                    className="text-base font-sans text-slate-800 leading-relaxed whitespace-pre-wrap"
                    style={{ wordBreak: 'break-word' }}
                  >
                    {currentQuestion.q}
                  </div>
                </div>

                {/* Question options */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {["A", "B", "C", "D"].map((optKey, idx) => {
                    const optText = currentQuestion.o[idx];
                    const cleanOptText = optText ? optText.replace(/^[A-D]、\s*/, "") : "";
                    const isSelected = answers[currentQuestion.id] === optKey;

                    return (
                      <button
                        key={optKey}
                        onClick={() => {
                          setAnswers(prev => ({
                            ...prev,
                            [currentQuestion.id]: optKey
                          }));
                        }}
                        className={`w-full p-4 rounded-xl text-left text-xs transition-all border cursor-pointer font-sans leading-relaxed flex items-start gap-3 hover:-translate-y-0.5 ${
                          isSelected 
                            ? "border-blue-500 bg-blue-50/35 text-blue-800 font-medium" 
                            : "border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50/50"
                        }`}
                      >
                        <span className={`w-6 h-6 rounded-full text-xs font-semibold flex items-center justify-center font-display transition-colors shrink-0 ${
                          isSelected 
                            ? "bg-blue-600 text-white" 
                            : "bg-slate-100 text-slate-500"
                        }`}>
                          {optKey}
                        </span>
                        <span className="flex-1 mt-0.5 leading-normal">
                          {cleanOptText || optText}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Bottom Pagination controls */}
              <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                <button
                  onClick={() => setCurrentIndex(prev => Math.max(0, prev - 1))}
                  disabled={currentIndex === 0}
                  className="flex items-center gap-1 py-1.5 px-3 text-xs font-semibold text-slate-600 hover:text-slate-800 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-100/50 rounded-lg transition-all cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>上一题</span>
                </button>

                <span className="text-xs text-slate-400 font-mono">
                  答题进度：{answeredCount} / {examQuestions.length}
                </span>

                <button
                  onClick={() => setCurrentIndex(prev => Math.min(examQuestions.length - 1, prev + 1))}
                  disabled={currentIndex === examQuestions.length - 1}
                  className="flex items-center gap-1 py-1.5 px-3 text-xs font-semibold text-slate-600 hover:text-slate-800 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-100/50 rounded-lg transition-all cursor-pointer"
                >
                  <span>下一题</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Exam status layout sidebar */}
          <div className="lg:col-span-1 space-y-4">
            <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-xs space-y-4">
              <div className="space-y-1">
                <span className="text-[10px] font-bold tracking-wider uppercase text-blue-500 font-mono">考试全览卡</span>
                <h4 className="text-sm font-semibold text-slate-800">
                  答题卡分布状况
                </h4>
              </div>

              <div className="grid grid-cols-5 gap-1.5 pt-1">
                {examQuestions.map((q, idx) => {
                  const hasSelection = answers[q.id] !== undefined;
                  const active = idx === currentIndex;

                  let style = "bg-slate-50 hover:bg-slate-100 text-slate-500";
                  if (hasSelection) {
                    style = "bg-blue-50 text-blue-600 border border-blue-200 font-medium";
                  }
                  if (active) {
                    style = "bg-blue-600 text-white border-transparent font-bold ring-2 ring-blue-100";
                  }

                  return (
                    <button
                      key={q.id}
                      onClick={() => setCurrentIndex(idx)}
                      className={`aspect-square rounded-lg flex items-center justify-center font-mono text-[10px] transition-all cursor-pointer ${style}`}
                    >
                      {idx + 1}
                    </button>
                  );
                })}
              </div>

              <div className="pt-4 border-t border-slate-100">
                <button
                  onClick={() => setShowSubmitConfirm(true)}
                  className="w-full py-3 bg-red-500 hover:bg-red-600 text-white font-bold text-xs rounded-xl transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4 text-white" />
                  <span>立即交卷计分并出局</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Custom submit exam confirmation modal overlay */}
      {showSubmitConfirm && (
        <div id="submit_confirm_modal_backdrop" className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4 animate-fade-in animate-duration-200">
          <div id="submit_confirm_modal_box" className="bg-white rounded-3xl border border-slate-100 shadow-xl max-w-sm w-full p-6 space-y-4 animate-scale-up">
            <div className="flex items-center gap-3 text-amber-500">
              <div className="p-2.5 bg-amber-50 rounded-xl">
                <AlertCircle className="w-5 h-5 animate-pulse" />
              </div>
              <h3 className="text-base font-bold font-display text-slate-800">确认提前收卷？</h3>
            </div>
            
            <p className="text-xs text-slate-500 leading-relaxed">
              {examQuestions.length - answeredCount > 0 ? (
                <span>您还有 <strong className="text-amber-600 font-semibold">{examQuestions.length - answeredCount}</strong> 道题目未作答。确定现在提前交卷评分吗？</span>
              ) : (
                <span>确定已完成所有作答并立即交卷计分吗？提交后将无法修改。</span>
              )}
            </p>

            <div className="flex items-center gap-2 pt-2">
              <button
                id="cancel_submit_btn"
                onClick={() => setShowSubmitConfirm(false)}
                className="flex-1 py-2 bg-slate-50 hover:bg-slate-100 text-slate-600 font-semibold text-xs rounded-xl transition-all cursor-pointer text-center border border-slate-200"
              >
                继续作答
              </button>
              <button
                id="confirm_submit_btn"
                onClick={() => {
                  setShowSubmitConfirm(false);
                  handleFinishExam();
                }}
                className="flex-1 py-2 bg-rose-500 hover:bg-rose-600 text-white font-semibold text-xs rounded-xl transition-all cursor-pointer text-center shadow-xs"
              >
                确认交卷
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
