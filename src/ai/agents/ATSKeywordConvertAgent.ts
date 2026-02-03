import { generateText } from "ai";
import { readFileSync } from "fs";
import { join } from "path";

export async function processHtmlWithPrompt(html: string) {
  const convertHTMLToKeywordSystemPrompt = readFileSync(
    join(
      process.cwd(),
      "src",
      "ai",
      "prompts",
      "convertHTMLToKeywordSystemPrompt.md",
    ),
    "utf8",
  );
  const result = await generateText({
    model: "google/gemini-2.5-flash",
    system: convertHTMLToKeywordSystemPrompt,
    prompt: `Convert the html following the format, this is the ${html}`,
  });
  console.log(result.text);
  return result.text;
}
// const html = await extractHTMLFromUrl("");
// if (html) {
//   processHtmlWithPrompt(html);
// }
