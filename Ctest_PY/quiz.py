
"""
C语言选择题 随机刷题程序
题库来源：同目录下的 C语言选择题库.txt + 答案.txt
用法：python quiz.py
"""

import random
import os
import sys


def load_questions(question_file, answer_file):
    """解析题库和答案文件，返回题目列表。"""
    with open(question_file, 'r', encoding='utf-8') as f:
        lines = f.readlines()

    with open(answer_file, 'r', encoding='utf-8') as f:
        answer_lines = f.readlines()

    # 解析答案映射：题号 -> 答案字母
    answers = {}
    for line in answer_lines:
        line = line.strip()
        if not line:
            continue
        # "1.  C" 或 "1.C"
        parts = line.split('.', 1)
        if len(parts) == 2:
            num = parts[0].strip()
            ans = parts[1].strip().upper()
            if ans:
                answers[num] = ans

    questions = []
    i = 0
    while i < len(lines):
        line = lines[i].strip()
        if not line:
            i += 1
            continue

        # 题目行以数字开头
        if not (line and line[0].isdigit()):
            i += 1
            continue

        # 找到题号和题目的分隔符（中文顿号、英文句点等）
        sep_idx = -1
        for sep in ('、', '.', '．'):
            idx = line.find(sep)
            if idx != -1 and (sep_idx == -1 or idx < sep_idx):
                sep_idx = idx
        if sep_idx == -1:
            i += 1
            continue

        q_num = line[:sep_idx].strip()

        # 题目文本：去掉前缀和 (1分) 后缀
        question_text = line[sep_idx + 1:].strip()
        for suffix in ('（1分）', '(1分)', '（ 1分 ）'):
            question_text = question_text.replace(suffix, '').strip()

        # 读取四个选项（接下来的4行）
        options = {}
        for k in range(4):
            if i + 1 + k >= len(lines):
                break
            opt_line = lines[i + 1 + k].strip()
            if not opt_line:
                continue
            # 选项格式: "A、内容" / "A.内容"
            for opt_sep in ('、', '.', '．'):
                if len(opt_line) >= 2 and opt_line[1] == opt_sep:
                    opt_letter = opt_line[0].upper()
                    opt_text = opt_line[2:].strip()
                    options[opt_letter] = opt_text
                    break

        if len(options) == 4:
            correct = answers.get(q_num, '?')
            questions.append({
                'num': q_num,
                'question': question_text,
                'options': options,
                'correct': correct
            })

        i += 6  # 每组6行：题目 + 4选项 + 空行

    return questions


def run_quiz(questions):
    """主答题循环。"""
    random.shuffle(questions)
    total = len(questions)
    correct_count = 0
    answered = 0

    print("=" * 60)
    print("  C语言选择题  随机刷题")
    print(f"  共 {total} 题，随机顺序出题")
    print("  输入选项 (A/B/C/D 或 1/2/3/4) 作答，输入 Q 退出")
    print("=" * 60)
    print()

    for idx, q in enumerate(questions, 1):
        # 显示题目
        print(f"[{idx}/{total}] {q['question']}")
        for letter in ('A', 'B', 'C', 'D'):
            print(f"  {letter}、{q['options'][letter]}")
        print()

        # 获取有效输入（支持 A/B/C/D 或 1/2/3/4）
        DIGIT_MAP = {'1': 'A', '2': 'B', '3': 'C', '4': 'D'}
        while True:
            user_input = input("你的答案 (A/B/C/D 或 1/2/3/4, Q退出): ").strip().upper()
            # 数字映射为字母
            if user_input in DIGIT_MAP:
                user_input = DIGIT_MAP[user_input]
            if user_input in ('A', 'B', 'C', 'D'):
                break
            elif user_input == 'Q':
                print(f"\n已退出。已答 {answered} 题，正确 {correct_count} 题。")
                if answered > 0:
                    print(f"正确率: {correct_count / answered * 100:.1f}%")
                return
            else:
                print("输入无效，请输入 A/B/C/D、1/2/3/4 或 Q。")

        answered += 1

        # 判断结果
        if user_input == q['correct']:
            print("✓ 正确！")
            correct_count += 1
        else:
            print(f"✗ 错误。正确答案是 {q['correct']}")

        # 进度
        rate = correct_count / answered * 100
        remaining = total - idx
        print(f"  进度: {idx}/{total} | 正确: {correct_count}/{answered} | "
              f"正确率: {rate:.1f}% | 剩余: {remaining}")
        print("-" * 60)
        print()

    # 全部完成
    print("=" * 60)
    print("  答题结束！")
    print(f"  总题数: {total}")
    print(f"  正确: {correct_count}")
    print(f"  错误: {total - correct_count}")
    print(f"  正确率: {correct_count / total * 100:.1f}%")
    print("=" * 60)


def main():
    script_dir = os.path.dirname(os.path.abspath(__file__))
    question_file = os.path.join(script_dir, 'C语言选择题库.txt')
    answer_file = os.path.join(script_dir, '答案.txt')

    if not os.path.exists(question_file):
        print(f"错误: 找不到题库文件 {question_file}")
        sys.exit(1)
    if not os.path.exists(answer_file):
        print(f"错误: 找不到答案文件 {answer_file}")
        sys.exit(1)

    questions = load_questions(question_file, answer_file)
    if not questions:
        print("错误: 未能解析到任何题目")
        sys.exit(1)

    print(f"成功加载 {len(questions)} 道题目\n")
    run_quiz(questions)


if __name__ == '__main__':
    main()
