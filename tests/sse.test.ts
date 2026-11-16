import { describe, expect, it } from "vitest";
import { parseEventBlock, readEventStream } from "@/lib/chat/sse";

function streamOf(parts: string[]) {
  const encoder = new TextEncoder();
  return new ReadableStream<Uint8Array>({
    start(controller) {
      for (const part of parts) controller.enqueue(encoder.encode(part));
      controller.close();
    },
  });
}

describe("parseEventBlock", () => {
  it("membaca event dan data", () => {
    expect(parseEventBlock('event: delta\ndata: {"text":"hai"}')).toEqual({ event: "delta", data: '{"text":"hai"}' });
  });

  it("mengabaikan komentar/heartbeat", () => {
    expect(parseEventBlock(": ping")).toBeNull();
  });
});

describe("readEventStream", () => {
  it("menangani event yang terpotong di antara chunk", async () => {
    const events = [];
    for await (const event of readEventStream(
      streamOf([": ok\n\nevent: del", 'ta\ndata: {"text":"Ass', 'alamu"}\n\nevent: done\ndata: {}\n\n']),
    )) {
      events.push(event);
    }
    expect(events).toEqual([
      { event: "delta", data: '{"text":"Assalamu"}' },
      { event: "done", data: "{}" },
    ]);
  });
});
