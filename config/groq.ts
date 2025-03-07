import Groq from "groq-sdk";

const groq = new Groq({
  apiKey: "",
  dangerouslyAllowBrowser: true
});

export { groq }; 