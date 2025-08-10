import { addListener, removeListener } from "@/app/lib/vote-stream";
import { NextResponse } from "next/server";

export const runtime = "nodejs"; // asegurar streaming

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const mesaId = searchParams.get("mesaId");
  if (!mesaId) {
    return new NextResponse("mesaId requerido", { status: 400 });
  }

  const stream = new ReadableStream({
    start(controller) {
      // helper para enviar eventos SSE
      const send = (data: any) => {
        const payload = `data: ${JSON.stringify(data)}\n\n`;
        controller.enqueue(new TextEncoder().encode(payload));
      };

      // mandar un ping inicial
      send({ type: "connected", mesaId });

      const listener = (event: any) => send(event);
      addListener(mesaId, listener);

      const interval = setInterval(() => {
        send({ type: "ping", t: Date.now() });
      }, 20000);

      // cierre
      const close = () => {
        clearInterval(interval);
        removeListener(mesaId, listener);
        controller.close();
      };

      // @ts-ignore
      req.signal?.addEventListener?.("abort", close);
    },
  });

  return new NextResponse(stream, {
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}
