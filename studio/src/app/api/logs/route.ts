
import { NextResponse } from 'next/server';
import type { LogEntry } from '@/lib/types';
import fs from 'fs';
import readline from 'readline';
import path from 'path';

// The path to the log file is now primarily driven by the environment variable.
// We provide a fallback, but the npm script should set the correct path for dev.
const LOG_FILE_PATH = process.env.MODSEC_LOG_FILE || (process.env.NODE_ENV === 'development' ? path.resolve(process.cwd(), './modsec_logs/audit.log') : '/var/log/modsec/audit.log');


async function getLogsFromFile(): Promise<LogEntry[]> {
  try {
    // Check if the file exists before trying to read it.
    if (!fs.existsSync(LOG_FILE_PATH)) {
      // This is an expected state if no requests have been blocked yet.
      // console.warn(`Log file not found at: ${LOG_FILE_PATH}. This is normal if no threats have been detected yet.`);
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
          // The log file contains multiple JSON objects, one per line.
          // We need to find the "transaction" part of each log.
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
    console.error(`Error reading or parsing log file at ${LOG_FILE_PATH}:`, error);
    return [];
  }
}

export async function GET() {
  try {
    const logs = await getLogsFromFile();
    // ModSecurity logs are appended, so the newest logs are at the end.
    // We reverse the array to show the most recent events first in the dashboard.
    return NextResponse.json(logs.reverse());
  } catch (error) {
    console.error('Failed to fetch logs:', error);
    return NextResponse.json({ message: 'Error fetching logs' }, { status: 500 });
  }
}
