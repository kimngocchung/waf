// src/app/api/logs/route.ts

// Nhập các hàm quản lý client từ module trung gian chúng ta đã tạo.
import { addClient, removeClient } from '@/lib/log-broadcaster';

/**
 * API endpoint để client (trình duyệt) kết nối và nhận log
 * qua Server-Sent Events (SSE) theo thời gian thực.
 */
export async function GET() {
  // Tạo một ReadableStream. Đây là công nghệ cốt lõi của Next.js
  // để giữ một kết nối mở và liên tục gửi dữ liệu xuống client.
  const stream = new ReadableStream({
    start(controller) {
      // Hàm start() được gọi ngay khi client kết nối thành công.
      // Chúng ta gọi addClient() để thêm controller của client này vào danh sách
      // những người đang "lắng nghe", sẵn sàng nhận log mới.
      addClient(controller);
    },
    cancel() {
      // Hàm cancel() được gọi khi client ngắt kết nối (ví dụ: đóng tab trình duyệt).
      // Dù logic xóa client khi gửi lỗi đã có trong `log-broadcaster`,
      // việc dọn dẹp ở đây vẫn là một thực hành tốt để quản lý bộ nhớ.
      // Lưu ý: Việc lấy chính xác controller nào đã bị hủy ở đây có thể phức tạp.
      // Cách an toàn nhất là dựa vào việc xử lý lỗi trong hàm broadcastLog.
    },
  });

  // Trả về một Response chứa stream.
  // Các header đặc biệt này sẽ báo cho trình duyệt biết đây là một kết nối SSE.
  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform', // Đảm bảo không bị cache
      'Connection': 'keep-alive', // Giữ kết nối sống
    },
  });
}