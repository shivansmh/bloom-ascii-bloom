/** Browser-only, constructed after a user presses play. */
export class PreviewPlayer {
  private context = new AudioContext();
  private buffer: AudioBuffer | null = null;
  private source: AudioBufferSourceNode | null = null;
  private offset = 0;
  private startedAt = 0;
  private controller = new AbortController();
  private generation = 0;

  constructor(private url: string, private onEnded: () => void) {}

  async play() {
    const generation = ++this.generation;
    await this.context.resume();
    if (!this.buffer) {
      const response = await fetch(this.url, { signal: AbortSignal.any([this.controller.signal, AbortSignal.timeout(15_000)]) });
      if (!response.ok) throw new Error("Preview download failed");
      const bytes = await response.arrayBuffer();
      try {
        this.buffer = await this.context.decodeAudioData(bytes.slice(0));
      } catch {
        // Some browsers cannot decode Apple's AAC previews natively.
        const { default: decode } = await import("@audio/decode-aac");
        const { channelData, sampleRate } = await decode(new Uint8Array(bytes));
        const length = channelData[0]?.length;
        if (!length) throw new Error("Empty preview");
        const buffer = this.context.createBuffer(channelData.length, length, sampleRate);
        channelData.forEach((channel, index) => buffer.getChannelData(index).set(channel));
        this.buffer = buffer;
      }
    }
    if (this.controller.signal.aborted || generation !== this.generation) return false;
    const source = this.context.createBufferSource();
    source.buffer = this.buffer;
    source.loop = true;
    source.connect(this.context.destination);
    source.onended = () => {
      if (this.source !== source) return;
      this.source = null;
      this.offset = 0;
      this.onEnded();
    };
    this.source = source;
    this.startedAt = this.context.currentTime;
    source.start(0, this.offset);
    return true;
  }

  pause() {
    this.generation++;
    const source = this.source;
    this.source = null;
    if (source) {
      const duration = this.buffer?.duration ?? 0;
      if (duration > 0) this.offset = (this.offset + this.context.currentTime - this.startedAt) % duration;
      source.onended = null;
      source.stop();
      source.disconnect();
    }
  }

  dispose() {
    this.pause();
    this.controller.abort();
    void this.context.close();
  }
}
