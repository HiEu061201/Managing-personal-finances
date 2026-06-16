# Feature Specification: Core Features

**Feature Branch**: `001-core-features`

**Created**: 2026-06-16

**Status**: Draft

**Input**: User description: "Hãy tạo ứng dụng với các tính năng cơ bản sau: 1. Đăng nhập/Đăng ký. 2. Quản lý giao dịch (thêm, sửa, xóa khoản thu chi). 3. Dashboard hiển thị tổng số dư và biểu đồ thu chi trong tháng. Không cần quản lý đa ví, chỉ dùng 1 ví mặc định."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Đăng nhập & Đăng ký (Priority: P1)

Người dùng có thể đăng ký một tài khoản mới và đăng nhập vào ứng dụng để bảo vệ dữ liệu tài chính cá nhân của họ.

**Why this priority**: Yêu cầu bắt buộc để cá nhân hóa dữ liệu và bảo mật.

**Independent Test**: Có thể test độc lập bằng cách đăng ký tài khoản thành công và đăng nhập vào hệ thống.

**Acceptance Scenarios**:
1. **Given** người dùng ở trang Đăng ký, **When** nhập email và mật khẩu hợp lệ, **Then** tài khoản được tạo và chuyển hướng đến trang Đăng nhập.
2. **Given** người dùng ở trang Đăng nhập, **When** nhập đúng thông tin, **Then** đăng nhập thành công và chuyển đến Dashboard.

---

### User Story 2 - Quản lý Giao dịch (Priority: P1)

Người dùng có thể thêm mới, chỉnh sửa, và xóa các khoản thu hoặc chi để ghi nhận tình hình tài chính của mình.

**Why this priority**: Đây là tính năng cốt lõi nhất của một ứng dụng quản lý chi tiêu.

**Independent Test**: Có thể test bằng cách thực hiện tuần tự CRUD (Create, Read, Update, Delete) trên một giao dịch.

**Acceptance Scenarios**:
1. **Given** người dùng ở trang Quản lý giao dịch, **When** nhấn "Thêm giao dịch" và điền số tiền, ngày tháng, danh mục, **Then** giao dịch mới được lưu lại và hiển thị trong danh sách.
2. **Given** người dùng có một giao dịch đã tạo, **When** nhấn xóa giao dịch đó, **Then** giao dịch biến mất khỏi danh sách và số dư được cập nhật.

---

### User Story 3 - Dashboard & Biểu đồ (Priority: P2)

Người dùng có thể xem tổng số dư hiện tại, tổng thu/chi trong tháng, và một biểu đồ trực quan thể hiện tình hình chi tiêu.

**Why this priority**: Giúp người dùng có cái nhìn tổng quan ngay khi mở app, tạo giá trị cốt lõi thứ hai sau việc ghi nhận dữ liệu.

**Independent Test**: Kiểm tra bằng cách thêm vài giao dịch và xem Dashboard có phản ánh đúng số liệu không.

**Acceptance Scenarios**:
1. **Given** người dùng có dữ liệu giao dịch trong tháng, **When** mở trang Dashboard, **Then** hệ thống hiển thị chính xác tổng số dư, tổng thu, tổng chi của tháng đó.
2. **Given** người dùng có dữ liệu giao dịch, **When** mở Dashboard, **Then** biểu đồ (vd: biểu đồ tròn/cột) hiển thị tỷ lệ các khoản chi tiêu.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Hệ thống MUST cho phép người dùng đăng ký bằng email và mật khẩu.
- **FR-002**: Hệ thống MUST mã hóa mật khẩu trước khi lưu vào cơ sở dữ liệu.
- **FR-003**: Người dùng MUST có thể đăng nhập và duy trì phiên đăng nhập bằng JWT hoặc Session.
- **FR-004**: Hệ thống MUST cho phép tạo, sửa, xóa, và đọc danh sách các giao dịch (thu/chi).
- **FR-005**: Giao dịch MUST bao gồm các trường: Loại (Thu/Chi), Số tiền, Ngày tháng, Danh mục (Category), và Ghi chú (Note).
- **FR-006**: Hệ thống MUST tính toán và trả về tổng số dư, tổng thu, tổng chi trong một tháng cụ thể.
- **FR-007**: Hệ thống MUST cung cấp API trả về dữ liệu thống kê để vẽ biểu đồ trên frontend.

### Key Entities

- **User**: Lưu trữ thông tin người dùng (id, email, password_hash).
- **Transaction**: Lưu trữ thông tin một khoản thu/chi (id, user_id, type, amount, date, category, note).

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Người dùng có thể đăng ký và đăng nhập thành công dưới 1 phút.
- **SC-002**: Thao tác thêm một giao dịch mất không quá 10 giây.
- **SC-003**: Dashboard tải dữ liệu (tổng số dư, tổng thu chi, biểu đồ) dưới 2 giây.

## Assumptions

- Chỉ có 1 ví (wallet) mặc định duy nhất cho mỗi người dùng, không cần quản lý tài khoản ngân hàng riêng biệt.
- Danh mục thu/chi (Categories) sẽ sử dụng một danh sách tĩnh mặc định (VD: Ăn uống, Lương, Mua sắm, v.v.), người dùng chưa cần tự tạo danh mục trong phase này.
- Giao diện hỗ trợ responsive (Mobile/Desktop) nhưng tập trung vào Desktop/Web trước.
