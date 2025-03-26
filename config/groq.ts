import Groq from "groq-sdk";

const groq = new Groq({
  apiKey: "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",
  dangerouslyAllowBrowser: true
});

export { groq }; 