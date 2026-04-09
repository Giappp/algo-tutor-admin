---
description: CREATE Problem Page
---

[CONTEXT]
Bạn là một Expert Frontend Developer (Next.js 15, TypeScript, React). Hãy giúp tôi xây dựng tính năng "Create Problem Multi-step Wizard" cho CMS của nền tảng AlgoTutor.
Vì dữ liệu của một bài tập thuật toán rất phức tạp, tôi muốn chia quá trình tạo mới thành 3 bước (3 steps) rõ ràng.
[TECH STACK]
- Framework: Next.js 15+ (App Router)
- State Management: Zustand (lưu trữ Wizard data) & TanStack Query v5 (Data fetching)
- Form & Validation: React Hook Form (RHF) + Zod
- UI Components: Shadcn UI (sử dụng Tabs hoặc custom Stepper) + Tailwind CSS
- Editors (Yêu cầu đề xuất/tích hợp): Markdown Editor có hỗ trợ LaTeX (ví dụ: react-markdown, remark-math), Code Editor cho solutions (ví dụ: @monaco-editor/react).

[WORKFLOW & REQUIREMENTS]
Xây dựng một ProblemWizard quản lý 3 bước. Sử dụng Zustand store useProblemDraftStore để gom dữ liệu từ 3 bước trước khi submit. Ở mỗi bước, dùng RHF để validate local data trước khi cho phép sang bước tiếp theo.

Bước 1: Basic Information

    title: string.

    slug: string (Tự động generate từ title với debounce, nhưng vẫn cho phép edit).

    statement: Textarea tích hợp Markdown Editor (cần hỗ trợ render LaTeX cho công thức toán học).

    difficulty: Select/Dropdown (Enum: EASY, MEDIUM, HARD).

    tags: Dạng Multi-select Combobox. Sử dụng TanStack Query để fetch danh sách tags từ backend (ID và Name). Hiển thị các tag đã chọn dưới dạng Badge (có nút X để xóa).

Bước 2: Testcases & Sample Solutions

    testCases: Array of objects { input: string, output: string, isHidden: boolean, scoreWeight: number }. Sử dụng useFieldArray của RHF để thêm/sửa/xóa động.

    solutions: Cần có Tabs để chuyển đổi giữa các ngôn ngữ (C++, Python, Java). Mỗi Tab chứa một Code Editor component để nhập solution tương ứng.

Bước 3: AI Context & Publishing

    aiContext: Textarea. Đây là nơi nhập hướng dẫn (prompt instructions) dành cho AI Mentor, giúp AI hiểu cách gợi ý hướng đi đúng cho bài tập này mà không spoil code.

    Actions: Có 2 nút Submit: "Lưu bản nháp (Save as Draft)" và "Xuất bản (Publish)". Payload gửi lên API cần có thêm trường status ('DRAFT' | 'PUBLISHED').

[ZOD SCHEMA]
Hãy định nghĩa rõ Zod schema. Nên tách thành 3 sub-schemas tương ứng với 3 bước và 1 schema tổng (problemWizardSchema) để validate toàn bộ payload cuối cùng.

[DELIVERABLES]
Hãy cung cấp code theo từng file cấu trúc:

- schemas/problem-wizard.schema.ts (Các Zod schemas)
- store/problem-wizard.store.ts (Zustand store lưu trữ data của 3 bước)
- components/admin/problem/wizard/step-1-basic.tsx (Form bước 1 có fetch tags)
- components/admin/problem/wizard/step-2-tests-code.tsx (Form bước 2 có FieldArray và Code Editor Tabs)
- components/admin/problem/wizard/step-3-ai-publish.tsx (Form bước 3 và Actions)
- components/admin/problem/create-problem-wizard.tsx (Component cha chứa logic Stepper, gom data từ Zustand và gọi API bằng TanStack Query Mutation)

Vui lòng viết code TypeScript chuẩn, không sử dụng any, xử lý UI/UX mượt mà khi chuyển bước.