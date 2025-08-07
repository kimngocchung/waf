// src/app/api/logs/historical/route.ts

import { NextResponse } from 'next/server';
import fs from 'fs';
import readline from 'readline';
import path from 'path';

// Tạo một đường dẫn an toàn để lưu log bên trong thư mục dự án
const LOCAL_LOG_FILE = path.join(process.cwd(), 'local_audit.log');

interface LogEntry {
  transaction: object;
}

async function getLogsFromFile(): Promise<LogEntry[]> {
  try {
    if (!fs.existsSync(LOCAL_LOG_FILE)) {
      return [];
    }

    const fileStream = fs.createReadStream(LOCAL_LOG_FILE);
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