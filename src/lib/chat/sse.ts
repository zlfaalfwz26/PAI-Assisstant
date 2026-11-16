/** Parser Server-Sent Events untuk respons fetch (EventSource tidak mendukung POST). */

export type ParsedEvent = { event: string; data: string };

export function parseEventBlock(raw: string): ParsedEvent | null {
  let event = "message";
  const data: string[] = [];
  for (const line of raw.split("\n")) {
    if (!line || line.startsWith(":")) continue; // komentar/heartbeat
    const colon = line.indexOf(":");
    const field = colon === -1 ? line : line.slice(0, colon);
    let value = colon === -1 ? "" : line.slice(colon + 1);
    if (value.startsWith(" ")) value = value.slice(1);
    if (field === "event") event = value;
    else if (field === "data") data.push(value);
  }
  return data.length ? { event, data: data.join("\n") } : null;
}

export async function* readEventStream(body: ReadableStream<Uint8Array>): AsyncGenerator<ParsedEvent> {
  const reader = body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  try {
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true }).replace(/\r\n/g, "\n");
      let boundary = buffer.indexOf("\n\n");
      while (boundary !== -1) {
        const block = buffer.slice(0, boundary);
        buffer = buffer.slice(boundary + 2);
        const parsed = parseEventBlock(block);
        if (parsed) yield parsed;
        boundary = buffer.indexOf("\n\n");
      }
    }
    buffer += decoder.decode();
    const parsed = parseEventBlock(buffer.trim());
    if (parsed) yield parsed;
  } finally {
    reader.releaseLock();
  }
}
