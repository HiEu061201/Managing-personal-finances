# Specification: Essential Features (V2)

## 1. Introduction

Bổ sung các tính năng thiết yếu (Essential Features) cho ứng dụng Quản Lý Chi Tiêu Cá Nhân để biến ứng dụng trở nên toàn diện và cá nhân hóa hơn cho người dùng. 

Các tính năng bao gồm:
1. Quản lý đa ví (Multi-wallets)
2. Tùy chỉnh danh mục thu/chi (Custom Categories)
3. Lập ngân sách (Budgeting)
4. Bộ lọc thời gian trên Dashboard (Time Filters)

## 2. User Stories

### User Story 1 - Quản lý Đa ví (Multi-wallets) (Priority: P1)
Người dùng cần khả năng tạo nhiều ví (Tiền mặt, Thẻ tín dụng, Tài khoản ngân hàng, v.v.) để phân bổ dòng tiền thực tế thay vì gộp chung vào 1 ví duy nhất.
**Why this priority**: Lõi của việc quản lý tài chính nâng cao là nắm được tiền đang nằm ở đâu.
**Independent Test**: Người dùng có thể tạo một ví mới, chọn ví khi tạo giao dịch và xem số dư riêng biệt của từng ví.
**Acceptance Scenarios**:
1. **Given** Người dùng ở trang Quản lý Ví, **When** tạo ví mới (Tên ví, Số dư ban đầu), **Then** ví được lưu và hiển thị trong danh sách ví.
2. **Given** form Thêm giao dịch, **When** chọn Ví nguồn, **Then** số dư của ví đó được cập nhật sau khi lưu giao dịch.

### User Story 2 - Tùy chỉnh Danh mục (Custom Categories) (Priority: P1)
Thay vì sử dụng danh sách danh mục cố định, người dùng có thể tự tạo thêm, sửa, xóa các danh mục phù hợp với thói quen của họ (kèm màu sắc và icon nếu có thể).
**Why this priority**: Cải thiện tính linh hoạt và cá nhân hóa cho người dùng.
**Independent Test**: Người dùng tạo mới một danh mục "Đầu tư Crypto" và có thể chọn nó khi nhập giao dịch.
**Acceptance Scenarios**:
1. **Given** trang Cài đặt Danh mục, **When** thêm danh mục mới, **Then** danh mục đó xuất hiện trong dropdown ở form Giao dịch.

### User Story 3 - Bộ lọc Thời gian trên Dashboard (Priority: P2)
Dashboard hiện tại đang gộp chung toàn bộ dữ liệu từ trước đến nay. Người dùng cần chọn xem theo Tháng, Tuần, Năm, hoặc Tùy chỉnh.
**Why this priority**: Giúp người dùng nhìn nhận được hiệu quả tài chính của từng kỳ.
**Independent Test**: Đổi bộ lọc từ "Tất cả" sang "Tháng này" và biểu đồ tự cập nhật dữ liệu.
**Acceptance Scenarios**:
1. **Given** Dashboard, **When** chọn "Tháng này", **Then** các chỉ số Tổng thu, Tổng chi, Số dư và Biểu đồ chỉ tính các giao dịch trong tháng hiện tại.

### User Story 4 - Lập Ngân sách (Budgeting) (Priority: P3)
Người dùng có thể đặt giới hạn chi tiêu tối đa cho một tháng (hoặc một danh mục cụ thể) và theo dõi tiến độ chi tiêu.
**Why this priority**: Giúp kiểm soát chi tiêu khỏi việc vung tay quá trán.
**Independent Test**: Đặt ngân sách 5 triệu cho "Ăn uống" trong tháng, hệ thống hiển thị thanh tiến độ (progress bar).
**Acceptance Scenarios**:
1. **Given** trang Ngân sách, **When** tạo ngân sách 5.000.000 VNĐ cho tháng hiện tại, **Then** hệ thống tính toán tổng chi tiêu trong tháng và hiển thị % đã tiêu.

## 3. Product Scope

### In Scope
- Tạo/Sửa/Xóa Ví. Giao dịch phải thuộc về 1 ví.
- Thêm trường Ví (wallet_id) vào Giao dịch.
- Tạo/Sửa/Xóa Danh mục. Giao dịch tham chiếu đến tên danh mục hoặc category_id.
- Dashboard thêm UI chọn khoảng thời gian (Tháng này, Tháng trước, Năm nay).
- Trang Ngân sách: Tạo ngân sách tổng hoặc theo danh mục cho tháng.

### Out of Scope
- Chuyển tiền giữa các ví (Transfer). Sẽ làm ở version sau.
- Ngân sách tự lặp lại các tháng. Tạm thời quản lý ngân sách thủ công theo tháng cụ thể.

## 4. UI/UX Requirements
- Tạo trang **Ví của tôi** và **Danh mục** riêng (có thể gộp vào tab Cài đặt).
- Form Giao dịch cần thêm 1 trường "Chọn Ví".
- Dashboard hiển thị các Ví và số dư tương ứng bằng giao diện Card mượt mà.
- Giao diện Ngân sách dùng các thanh Progress Bar (Màu Xanh nếu an toàn, Vàng nếu >80%, Đỏ nếu vượt).

## 5. Error Handling
- Xóa một Ví/Danh mục: Cần cảnh báo người dùng nếu ví/danh mục đang chứa giao dịch. Có thể cấm xóa hoặc đánh dấu ẩn (soft delete) hoặc di chuyển giao dịch sang ví mặc định. (Ưu tiên: Chặn xóa nếu có giao dịch).
