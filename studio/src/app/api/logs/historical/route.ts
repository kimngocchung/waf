// src/app/api/logs/historical/route.ts

import { NextResponse } from 'next/server';
import fs from 'fs';
import readline from 'readline';

// Đường dẫn đến file log bên trong container của dashboard
const LOG_FILE_PATH = '/var/log/modsec/audit.log';

// Định nghĩa kiểu dữ liệu cho log để đảm bảo an toàn
interface LogEntry {
  transaction: object;
  // Thêm các thuộc tính khác nếu cần
}

async function getLogsFromFile(): Promise<LogEntry[]> {
  try {
    // Kiểm tra xem file có tồn tại không
    if (!fs.existsSync(LOG_FILE_PATH)) {
      return [];
    }

    const fileStream = fs.createReadStream(LOG_FILE_PATH);
    const rl = readline.createInterface({
      input: fileStream,
      crlfDelay: Infinity,
    });

    const logs: LogEntry[] = [];
    for await (const line of rl) {
      if (line.trim()) {
        try {
          const logObject = JSON.parse(line);
          if (logObject.transaction) {
            logs.push(logObject);
          }
        } catch (e) {
          console.error('Failed to parse log line:', line, e);
        }
      }
    }
    return logs;
  } catch (error) {
    console.error(`Error reading log file:`, error);
    return [];
  }
}

export async function GET() {
  try {
    const logs = await getLogsFromFile();
    // Đảo ngược mảng để log mới nhất hiển thị đầu tiên
    return NextResponse.json(logs.reverse());
  } catch (error) {
    console.error('Failed to fetch historical logs:', error);
    return NextResponse.json({ message: 'Error fetching logs' }, { status: 500 });
  }
}