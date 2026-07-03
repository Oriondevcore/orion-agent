import { describe, it, expect } from "vitest";

const FALLBACK_MODELS = [
  { name: "@cf/google/gemma-4-26b-a4b-it", task: "text-generation" },
  { name: "@cf/meta/llama-4-scout-17b-16e-instruct", task: "text-generation" },
  { name: "@cf/meta/llama-3.2-11b-vision-instruct", task: "text-generation" },
  { name: "@cf/meta/llama-3.2-3b-instruct", task: "text-generation" },
  { name: "@cf/meta/llama-3.1-8b-instruct", task: "text-generation" },
  { name: "@cf/qwen/qwen2.5-7b-instruct", task: "text-generation" },
  { name: "@cf/openai/whisper-large-v3-turbo", task: "automatic-speech-recognition" },
  { name: "@cf/myshell-ai/melotts", task: "text-to-speech" },
];

describe("Fallback models list", () => {
  it("contains text-generation models", () => {
    const textModels = FALLBACK_MODELS.filter((m) => m.task === "text-generation");
    expect(textModels.length).toBeGreaterThanOrEqual(6);
  });

  it("contains a speech recognition model", () => {
    const asr = FALLBACK_MODELS.find((m) => m.task === "automatic-speech-recognition");
    expect(asr).toBeTruthy();
    expect(asr!.name).toContain("whisper");
  });

  it("contains a TTS model", () => {
    const tts = FALLBACK_MODELS.find((m) => m.task === "text-to-speech");
    expect(tts).toBeTruthy();
  });

  it("all model names are valid CF identifiers", () => {
    for (const m of FALLBACK_MODELS) {
      expect(m.name).toMatch(/^@cf\/[\w-]+\/[\w.-]+$/);
    }
  });
});

describe("Model assignment parsing", () => {
  it("parses valid JSON assignments", () => {
    const raw = JSON.stringify({ chat: "@cf/meta/llama-3.1-8b-instruct", vision: "@cf/meta/llama-3.2-11b-vision-instruct" });
    const parsed = JSON.parse(raw);
    expect(parsed.chat).toBe("@cf/meta/llama-3.1-8b-instruct");
    expect(parsed.vision).toBe("@cf/meta/llama-3.2-11b-vision-instruct");
  });

  it("handles empty assignments", () => {
    const parsed = JSON.parse("{}");
    expect(Object.keys(parsed)).toHaveLength(0);
  });

  it("rejects malformed JSON", () => {
    expect(() => JSON.parse("not json")).toThrow();
  });
});

describe("Model naming conventions", () => {
  const validNames = [
    "@cf/google/gemma-4-26b-a4b-it",
    "@cf/meta/llama-4-scout-17b-16e-instruct",
    "@cf/openai/whisper-large-v3-turbo",
  ];

  it.each(validNames)("accepts valid name: %s", (name) => {
    expect(name).toMatch(/^@cf\/[\w-]+\/[\w.-]+$/);
  });

  const invalidNames = [
    "gemma-4",
    "cf/google/gemma",
    "@google/gemma-4",
  ];

  it.each(invalidNames)("rejects invalid name: %s", (name) => {
    expect(name).not.toMatch(/^@cf\/[\w-]+\/[\w.-]+$/);
  });
});
