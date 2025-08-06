// src/lib/log-broadcaster.ts

// Dùng một Set để lưu trữ tất cả các kết nối (controller) từ client.
// Set hiệu quả hơn Array trong việc thêm/xóa và tự động xử lý trùng lặp.
const clients = new Set<ReadableStreamDefaultController>();

/**
 * Phát một tin nhắn log tới tất cả các client đang kết nối.
 * @param logData Đối tượng log nhận được từ WAF.
 */
export function broadcastLog(logData: any) {
  // Định dạng tin nhắn theo chuẩn Server-Sent Events (SSE).
  // Mỗi tin nhắn phải bắt đầu bằng "data: " và kết thúc bằng "\n\n".
  const message = `data: ${JSON.stringify(logData)}\n\n`;
  const encoder = new TextEncoder();

  // Lặp qua tất cả các client đang kết nối và gửi tin nhắn.
  clients.forEach(controller => {
    try {
      controller.enqueue(encoder.encode(message));
    } catch (error) {
      // Nếu có lỗi khi gửi (ví dụ: client đã ngắt kết nối),
      // hãy xóa client đó khỏi danh sách để tránh gửi lại trong tương lai.
      console.error('Failed to send log to a client, removing client.', error);
      clients.delete(controller);
    }
  });
}

/**
 * Thêm một client mới vào danh sách khi họ kết nối.
 * @param controller Controller của ReadableStream từ client.
 */
export function addClient(controller: ReadableStreamDefaultController) {
  clients.add(controller);
  console.log(`Client connected. Total clients: ${clients.size}`);
}

/**
 * Xóa một client khỏi danh sách khi họ ngắt kết nối.
 * @param controller Controller của ReadableStream từ client.
 */
export function removeClient(controller: ReadableStreamDefaultController) {
  clients.delete(controller);
  console.log(`Client disconnected. Total clients: ${clients.size}`);
}