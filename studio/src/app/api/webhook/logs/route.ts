// src/app/api/webhook/logs/route.ts

import { broadcastLog } from '@/lib/log-broadcaster';
import { NextResponse } from 'next/server';

/**
 * API endpoint để nhận log từ WAF qua phương thức POST.
 */
export async function POST(request: Request) {
  try {
    const logData = await request.json();

    // Gọi hàm broadcast để đẩy log tới tất cả các client đang kết nối
    broadcastLog(logData);

    // Trả về response 200 OK để báo cho Log Collector biết đã nhận thành công
    return NextResponse.json({ success: true, message: 'Log broadcasted' });

  } catch (error) {
    console.error('Error processing webhook request:', error);
    return NextResponse.json(
      { success: false, message: 'Invalid JSON body' },
      { status: 400 }
    );
  }
}