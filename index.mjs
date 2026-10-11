/** Flag likely tone and terminology issues in localization review text. */
import fs from "node:fs";

function config() {
  const values = {};
  for (const line of fs.readFileSync(new URL("config/development.env", import.meta.url), "utf8").split(/\r?\n/)) {
    if (line && !line.startsWith("#") && line.includes("=")) {
      const at = line.indexOf("="); values[line.slice(0, at)] = line.slice(at + 1);
    }
  }
  return {...values, ...process.env};
}

const cfg = config();
const input = fs.readFileSync(process.argv[2] || "examples/input.txt", "utf8");
const response = await fetch(cfg.OPENAI_BASE_URL.replace(/\/$/, "") + "/chat/completions", {
  method: "POST",
  headers: {"authorization": `Bearer ${cfg.OPENAI_API_KEY}`, "content-type": "application/json"},
  body: JSON.stringify({model: cfg.OPENAI_MODEL || "gpt-6-sol",
    messages: [{role: "system", content: "Perform localization review. Return concise JSON for human review."},
               {role: "user", content: input}], temperature: 0})
});
if (!response.ok) throw new Error(`gateway returned ${response.status}`);
const body = await response.json();
console.log(body.choices[0].message.content);
