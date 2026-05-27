# Requirements Document

## Introduction

Tái cấu trúc sidebar và hệ thống route của admin panel AlgoTutor để phù hợp hơn với mục đích quản trị hệ thống. Hiện tại, sidebar được tổ chức theo nhóm "Overview", "Curriculum", "AI Lab", "Administration" với cấu trúc route `/dashboard/*`. Cần sắp xếp lại để phản ánh đúng luồng công việc quản trị: quản lý nội dung học tập, quản lý người dùng, giám sát hệ thống, và cấu hình.

## Glossary

- **Sidebar**: Thanh điều hướng bên trái của admin panel, chứa các nhóm menu và liên kết
- **Route**: Đường dẫn URL tương ứng với các trang trong ứng dụng Next.js App Router
- **Navigation_Group**: Nhóm các mục menu liên quan trong sidebar, có label và danh sách items
- **Admin_Panel**: Giao diện quản trị hệ thống AlgoTutor dành cho quản trị viên
- **Learning_Path**: Lộ trình học tập bao gồm các chủ đề và bài học về thuật toán
- **Content_Management**: Nhóm chức năng quản lý nội dung học tập (lộ trình học tập, với chủ đề và bài học được quản lý dưới dạng sub-route của từng lộ trình)
- **Token_Cost**: Trang giám sát chi phí API và token sử dụng cho các dịch vụ AI
- **System_Monitoring**: Nhóm chức năng giám sát hoạt động hệ thống (analytics, logs)
- **Active_State**: Trạng thái hiển thị mục menu đang được chọn dựa trên URL hiện tại

## Requirements

### Requirement 1: Tổ chức lại nhóm điều hướng trong Sidebar

**User Story:** Là quản trị viên, tôi muốn sidebar được tổ chức theo nhóm chức năng quản trị rõ ràng, để tôi có thể truy cập nhanh các tính năng quản lý hệ thống theo luồng công việc hợp lý.

#### Acceptance Criteria

1. THE Sidebar SHALL hiển thị các Navigation_Group theo thứ tự cố định: "Tổng quan", "Quản lý nội dung", "Quản lý người dùng", "AI & Công cụ", "Cài đặt hệ thống" — tổng cộng 5 nhóm
2. WHEN Admin_Panel được tải, THE Sidebar SHALL hiển thị nhóm "Tổng quan" với các mục: Dashboard (route `/dashboard`) và Analytics (route `/dashboard/analytics`)
3. THE Sidebar SHALL hiển thị nhóm "Quản lý nội dung" với mục: Learning Paths (Topics và Lessons là sub-route của từng Learning Path, không hiển thị riêng trên sidebar)
4. THE Sidebar SHALL hiển thị nhóm "Quản lý người dùng" với các mục theo thứ tự: Users, Roles & Permissions
5. THE Sidebar SHALL hiển thị nhóm "AI & Công cụ" với các mục theo thứ tự: AI Models, Playground, Token Cost
6. THE Sidebar SHALL hiển thị nhóm "Cài đặt hệ thống" với mục: Settings
7. THE Sidebar SHALL hiển thị mỗi Navigation_Group với label nhóm rõ ràng phía trên danh sách các mục menu thuộc nhóm đó

### Requirement 2: Cập nhật cấu trúc Route phù hợp với nhóm quản trị

**User Story:** Là quản trị viên, tôi muốn URL phản ánh đúng cấu trúc quản trị, để tôi có thể bookmark và chia sẻ liên kết dễ dàng.

#### Acceptance Criteria

1. THE Admin_Panel SHALL sử dụng cấu trúc route `/dashboard` làm route gốc cho tất cả trang quản trị
2. WHEN quản trị viên truy cập route `/dashboard` (không có path con), THE Admin_Panel SHALL hiển thị trang Dashboard tổng quan
3. THE Admin_Panel SHALL sử dụng route `/dashboard/content/learning-paths` cho trang quản lý lộ trình học tập, với các sub-route `/dashboard/content/learning-paths/[id]/topics/[topicId]` và `/dashboard/content/learning-paths/[id]/lessons/[lessonId]` cho quản lý chủ đề và bài học thuộc từng lộ trình
4. THE Admin_Panel SHALL sử dụng route `/dashboard/users` cho trang quản lý người dùng
5. THE Admin_Panel SHALL sử dụng route `/dashboard/users/roles` cho trang quản lý vai trò và quyền
6. THE Admin_Panel SHALL sử dụng route `/dashboard/ai/models` cho trang quản lý AI models
7. THE Admin_Panel SHALL sử dụng route `/dashboard/ai/playground` cho trang AI playground
8. THE Admin_Panel SHALL sử dụng route `/dashboard/ai/token-cost` cho trang giám sát chi phí API và token AI
9. THE Admin_Panel SHALL sử dụng route `/dashboard/analytics` cho trang phân tích dữ liệu
10. THE Admin_Panel SHALL sử dụng route `/dashboard/settings` cho trang cài đặt hệ thống
11. WHEN quản trị viên truy cập một route không tồn tại dưới `/dashboard/*`, THE Admin_Panel SHALL hiển thị trang 404 Not Found

### Requirement 3: Hiển thị trạng thái Active cho mục menu

**User Story:** Là quản trị viên, tôi muốn sidebar hiển thị rõ ràng mục menu đang được chọn, để tôi luôn biết mình đang ở trang nào.

#### Acceptance Criteria

1. WHEN quản trị viên truy cập một route, THE Sidebar SHALL đánh dấu Active_State cho mục menu có URL khớp chính xác với route hiện tại hoặc là prefix của route hiện tại (so khớp theo đường dẫn), và chỉ duy nhất một mục menu cha được đánh dấu Active_State tại một thời điểm
2. WHEN một mục menu ở Active_State, THE Sidebar SHALL hiển thị mục đó với thuộc tính `data-active="true"` để phân biệt trực quan với các mục menu không active
3. WHEN quản trị viên truy cập route con (ví dụ `/dashboard/content/learning-paths/123`), THE Sidebar SHALL đánh dấu Active_State cho mục menu cha có URL là prefix dài nhất khớp với route hiện tại
4. WHEN một mục menu có sub-items và đang ở Active_State, THE Sidebar SHALL tự động mở rộng (expand) danh sách sub-items khi trang được tải hoặc khi điều hướng xảy ra
5. IF route hiện tại không khớp với bất kỳ mục menu nào trong Sidebar, THEN THE Sidebar SHALL không đánh dấu Active_State cho bất kỳ mục menu nào

### Requirement 4: Hỗ trợ thu gọn và mở rộng nhóm menu

**User Story:** Là quản trị viên, tôi muốn có thể thu gọn các nhóm menu không cần thiết, để sidebar gọn gàng hơn khi làm việc.

#### Acceptance Criteria

1. WHEN quản trị viên click vào mục menu có sub-items, THE Sidebar SHALL toggle hiển thị danh sách sub-items (mở rộng nếu đang thu gọn, thu gọn nếu đang mở rộng) với hiệu ứng chuyển đổi hoàn tất trong tối đa 300ms
2. THE Sidebar SHALL hiển thị biểu tượng mũi tên (chevron) bên cạnh mỗi mục menu có sub-items để chỉ báo trạng thái mở rộng (xoay xuống) hoặc thu gọn (xoay sang phải)
3. WHEN Admin_Panel được tải lần đầu trong một phiên làm việc (từ lúc mở tab trình duyệt đến khi đóng tab), THE Sidebar SHALL hiển thị tất cả Navigation_Group ở trạng thái thu gọn, ngoại trừ nhóm chứa mục menu đang ở Active_State
4. THE Sidebar SHALL giữ nguyên trạng thái mở rộng/thu gọn của các nhóm menu khi chuyển trang trong cùng phiên làm việc (cùng tab trình duyệt), bao gồm cả trường hợp nhóm chứa mục Active_State đã bị thu gọn thủ công bởi quản trị viên

### Requirement 5: Di chuyển và tái tổ chức file route trong Next.js App Router

**User Story:** Là lập trình viên, tôi muốn cấu trúc thư mục route trong `src/app/dashboard` phản ánh đúng cấu trúc nhóm mới, để dễ bảo trì và mở rộng.

#### Acceptance Criteria

1. THE Admin_Panel SHALL tổ chức thư mục route theo cấu trúc: `src/app/dashboard/content/` chứa các route quản lý nội dung, và `src/app/dashboard/ai/` chứa các route liên quan đến AI
2. THE Admin_Panel SHALL di chuyển route `learning-paths` vào thư mục `src/app/dashboard/content/learning-paths/`, bao gồm toàn bộ sub-route hiện có (`[id]/`, `[id]/topics/[topicId]/`, `[id]/lessons/[lessonId]/`, `create/`) với cấu trúc thư mục con được giữ nguyên hoàn toàn
3. THE Admin_Panel SHALL di chuyển route `models` vào thư mục `src/app/dashboard/ai/models/`, giữ nguyên nội dung file `page.tsx` hiện có
4. THE Admin_Panel SHALL tạo route mới `src/app/dashboard/ai/playground/` cho trang AI playground, với tối thiểu file `page.tsx` để route có thể truy cập được
5. THE Admin_Panel SHALL tạo route mới `src/app/dashboard/ai/token-cost/` cho trang giám sát chi phí API và token AI, với tối thiểu file `page.tsx` để route có thể truy cập được
6. THE Admin_Panel SHALL tạo route mới `src/app/dashboard/users/roles/` cho trang quản lý vai trò, với tối thiểu file `page.tsx` để route có thể truy cập được
7. WHEN file route được di chuyển sang vị trí mới, THE Admin_Panel SHALL cập nhật tất cả import path trong các file bị di chuyển để phản ánh đúng đường dẫn tương đối mới, đảm bảo project build thành công không có lỗi import
8. THE Admin_Panel SHALL đảm bảo project biên dịch thành công (next build không có lỗi) sau khi hoàn tất việc tái tổ chức thư mục

### Requirement 6: Đảm bảo tương thích ngược cho các route hiện có

**User Story:** Là quản trị viên, tôi muốn các bookmark và liên kết cũ vẫn hoạt động sau khi tái cấu trúc, để không bị gián đoạn công việc.

#### Acceptance Criteria

1. WHEN quản trị viên truy cập route cũ `/dashboard/learning-paths`, THE Admin_Panel SHALL chuyển hướng (redirect) đến route mới `/dashboard/content/learning-paths` với HTTP status code 308 (Permanent Redirect)
2. WHEN quản trị viên truy cập route cũ `/dashboard/models`, THE Admin_Panel SHALL chuyển hướng (redirect) đến route mới `/dashboard/ai/models` với HTTP status code 308 (Permanent Redirect)
3. WHEN quản trị viên truy cập route con của route cũ (ví dụ `/dashboard/learning-paths/[id]` hoặc `/dashboard/learning-paths/create`), THE Admin_Panel SHALL chuyển hướng đến route con tương ứng dưới cấu trúc mới (ví dụ `/dashboard/content/learning-paths/[id]`) với HTTP status code 308, giữ nguyên phần path phía sau
4. THE Admin_Panel SHALL bảo toàn query parameters và URL fragment trong quá trình chuyển hướng từ route cũ sang route mới

### Requirement 7: Responsive Sidebar trên các kích thước màn hình

**User Story:** Là quản trị viên, tôi muốn sidebar hoạt động tốt trên cả màn hình lớn và nhỏ, để tôi có thể quản trị từ nhiều thiết bị.

#### Acceptance Criteria

1. WHILE màn hình có chiều rộng nhỏ hơn 768px, THE Sidebar SHALL ẩn hoàn toàn khỏi giao diện và hiển thị nút toggle để mở sidebar dạng overlay
2. WHILE màn hình có chiều rộng từ 768px trở lên, THE Sidebar SHALL hiển thị dạng cố định bên trái với chiều rộng từ 240px đến 280px
3. WHEN quản trị viên click nút toggle sidebar trên màn hình nhỏ hơn 768px, THE Sidebar SHALL hiển thị dạng overlay phủ lên nội dung chính kèm lớp backdrop phía sau
4. IF sidebar đang mở dạng overlay và quản trị viên click vào vùng backdrop hoặc click nút toggle lần nữa, THEN THE Sidebar SHALL đóng overlay trong thời gian không quá 300ms
5. WHEN quản trị viên chọn một mục menu trong sidebar dạng overlay trên màn hình nhỏ hơn 768px, THE Sidebar SHALL tự động đóng overlay sau khi điều hướng đến trang được chọn
