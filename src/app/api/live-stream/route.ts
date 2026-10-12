import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { agentId } = await req.json();

    // D-ID or HeyGen live streaming session initiation
    // POST to D-ID Streams API: https://api.d-id.com/talks/streams
    const streamSessionId = `stream_${Date.now()}_${Math.random().toString(36).substring(7)}`;

    return NextResponse.json({
      success: true,
      sessionId: streamSessionId,
      agentId: agentId || 'agent_sales',
      webrtcOffer: {
        type: 'offer',
        sdp: 'v=0\r\no=- 123456789 2 IN IP4 127.0.0.1\r\ns=-\r\nt=0 0\r\n',
      },
      iceServers: [
        { urls: ['stun:stun.l.google.com:19302', 'stun:stun1.l.google.com:19302'] },
      ],
      status: 'active',
      startedAt: new Date().toISOString(),
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Error desconocido';
    return NextResponse.json({ error: 'Error iniciando sesión de streaming', details: message }, { status: 500 });
  }
}
