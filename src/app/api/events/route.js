import { NextResponse } from 'next/server';
import { getDb } from '@/utils/db';

export async function POST(request) {
  try {
    const event = await request.json();
    const db = getDb();

    // Insert the new event into the database
    const stmt = db.prepare(`
      INSERT INTO events (
        uuid,
        camera_id,
        time,
        event_type,
        event,
        alert,
        alert_level
      ) VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      event.id.toString(),
      event.camera_id,
      event.timestamp,
      event.event_type,
      event.details,
      event.alert_level !== 'low' ? 1 : 0,
      event.alert_level.toUpperCase()
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error adding event:', error);
    return NextResponse.json(
      { error: 'Failed to add event' },
      { status: 500 }
    );
  }
} 