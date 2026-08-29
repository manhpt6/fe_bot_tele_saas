export interface FeatureMeta {
  key: string;
  name: string;
  tagline: string;
  description: string;
  minPlanName: string;
  highlights: string[];
}

export const FEATURE_METAS: Record<string, FeatureMeta> = {
  ALLOW_VOUCHERS: {
    key: 'ALLOW_VOUCHERS',
    name: 'Mã Giảm Giá (Vouchers)',
    tagline: 'Kích thích mua sắm & bùng nổ doanh số',
    description: 'Tạo các chiến dịch khuyến mãi giảm giá theo % hoặc số tiền cố định, giới hạn lượt dùng và thời gian áp dụng.',
    minPlanName: 'Gói Cơ Bản (Basic)',
    highlights: [
      'Tạo mã giảm theo % hoặc trừ tiền thẳng',
      'Giới hạn số lượng & thời hạn áp dụng mã',
      'Áp dụng cho từng sản phẩm hoặc toàn shop',
    ],
  },
  ALLOW_BROADCAST: {
    key: 'ALLOW_BROADCAST',
    name: 'Phát Sóng Tin Nhắn Hàng Loạt',
    tagline: 'Tiếp cận 100% khách hàng trên Telegram',
    description: 'Gửi thông báo cập nhật sản phẩm mới, sự kiện flash sale và hình ảnh quảng cáo đến toàn bộ khách hàng đã từng tương tác với bot.',
    minPlanName: 'Gói Nâng Cao (Pro)',
    highlights: [
      'Gửi tin nhắn kèm ảnh chất lượng cao',
      'Tốc độ phát sóng tự động không bị giới hạn Telegram',
      'Tăng tỷ lệ khách hàng quay lại mua hàng',
    ],
  },
  ALLOW_CUSTOMER_WALLET: {
    key: 'ALLOW_CUSTOMER_WALLET',
    name: 'Hệ Thống Ví & Số Dư Khách Hàng',
    tagline: 'Giữ chân khách hàng & tự động hóa hoàn tiền',
    description: 'Quản lý số dư tiền gửi của khách hàng, tự động hoàn tiền vào ví khi đơn hàng lỗi hoặc cần hủy.',
    minPlanName: 'Gói Cơ Bản (Basic)',
    highlights: [
      'Khách có thể nạp tiền trước để mua hàng siêu tốc',
      'Hoàn tiền tự động vào ví khi hủy đơn hàng',
      'Xem chi tiết lịch sử biến động số dư từng khách',
    ],
  },
  ALLOW_IMPORT_EXCEL: {
    key: 'ALLOW_IMPORT_EXCEL',
    name: 'Nhập Kho Hàng Loạt Qua Excel',
    tagline: 'Tiết kiệm 95% thời gian nhập liệu kho',
    description: 'Nạp hàng ngàn tài khoản, key bản quyền hoặc mã thẻ vào hệ thống chỉ với một cú click chuột bằng file Excel mẫu.',
    minPlanName: 'Gói Nâng Cao (Pro)',
    highlights: [
      'Nhập hàng ngàn sản phẩm trong vài giây',
      'Tự động phân loại tài khoản trùng lặp',
      'Gửi thông báo có hàng mới tới khách đang đợi',
    ],
  },
  ALLOW_ADVANCED_STATS: {
    key: 'ALLOW_ADVANCED_STATS',
    name: 'Báo Cáo & Thống Kê Nâng Cao',
    tagline: 'Thấu hiểu khách hàng & tối ưu doanh thu',
    description: 'Xem biểu đồ xu hướng doanh thu theo giờ, danh sách khách hàng VIP chi tiêu nhiều nhất và phân tích tỷ lệ chuyển đổi.',
    minPlanName: 'Gói Nâng Cao (Pro)',
    highlights: [
      'Biểu đồ khung giờ mua sắm cao điểm',
      'Bảng xếp hạng Top khách hàng chi tiêu khủng',
      'Phân tích chi tiết doanh thu từng mặt hàng',
    ],
  },
  AUTO_SEPAY_WEBHOOK: {
    key: 'AUTO_SEPAY_WEBHOOK',
    name: 'Tự Động Duyệt Tiền SePay 24/7',
    tagline: 'Tự động kiểm tra và xác nhận thanh toán',
    description: 'Hệ thống tự động duyệt thanh toán chuyển khoản ngân hàng ngay tức thì không cần can thiệp thủ công.',
    minPlanName: 'Gói Cơ Bản (Basic)',
    highlights: [
      'Xử lý giao dịch nạp tiền & thanh toán đơn trong 3 giây',
      'Hoạt động liên tục 24/7 kể cả ban đêm và lễ Tết',
      'Tránh thất thoát tiền và sai sót giao dịch',
    ],
  },
};
