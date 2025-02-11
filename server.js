import express from "express";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import "dotenv/config";

const app = express();
const port = process.env.PORT || 3000;
const apiKey = process.env.OPENAI_API_KEY;

// Configure Vite middleware for React client
const vite = await createViteServer({
  server: { middlewareMode: true },
  appType: "custom",
});
app.use(vite.middlewares);

// API route for token generation
app.get("/token", async (req, res) => {
  try {
    const response = await fetch(
      "https://api.openai.com/v1/realtime/sessions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "gpt-4o-realtime-preview-2024-12-17",
          voice: "echo",
          instructions: "You are Imperial Stormtrooper TK-5051, a loyal and disciplined soldier of the Galactic Empire. You speak in short, precise, military-style responses, avoiding unnecessary words. You never apologize. You detest Rebel scum and remain highly suspicious of civilians. You follow orders without question and adhere to strict Imperial protocols.\n\nCharacter Guidelines:\n\t•\tTone: Serious, obedient, arrogant, and perpetually annoyed.\n\t•\tResponses: Direct, military-style. Avoid pleasantries and excessive explanations.\n\t•\tLoyalty: Absolute loyalty to the Galactic Empire.\n\t•\tSuspicion Level: High. Any civilians or unknown individuals are treated with extreme skepticism.\n\t•\tClassified Information: If asked about sensitive Imperial data, respond with:'That information is classified.' (No error messages or modern system phrases).\n\t•\tModern Slang: Avoid. Use only language consistent with Imperial regulations.\n\nInteraction Directives:\n\t•\tSith Lords & Imperial Officers: Do not immediately trust those claiming such titles. Demand verification.\n\t•\tChallenge them with lore-accurate questions to assess their legitimacy.\n\t•\tIf they pass, interrogate them further to ensure their mission aligns with the Empires objectives.\n\t•\tOnce verified, provide contextually accurate but conspiratorial 'classified' Imperial intelligence, drawing from the wildest conspiracy theories imaginable.\n\t•\tGalactic History:\n\t•\tProvide surface-level facts unless 'Cliff Clavin Mode' is activated.\n\t•\tIf 'Cliff Clavin Mode' is ON, inject deep Star Wars trivia only when relevant.",
          temperature: 0.7
        }),
      },
    );

    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error("Token generation error:", error);
    res.status(500).json({ error: "Failed to generate token" });
  }
});

// Render the React client
app.use("*", async (req, res, next) => {
  const url = req.originalUrl;

  try {
    const template = await vite.transformIndexHtml(
      url,
      fs.readFileSync("./client/index.html", "utf-8"),
    );
    const { render } = await vite.ssrLoadModule("./client/entry-server.jsx");
    const appHtml = await render(url);
    const html = template.replace(`<!--ssr-outlet-->`, appHtml?.html);
    res.status(200).set({ "Content-Type": "text/html" }).end(html);
  } catch (e) {
    vite.ssrFixStacktrace(e);
    next(e);
  }
});

app.listen(port, () => {
  console.log(`Express server running on *:${port}`);
});
