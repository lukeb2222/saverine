/** Local dev server for the proxy: `XAI_API_KEY=... node dev-server.js` then POST http://localhost:8787/api/chat */
import http from "node:http";
import handler from "./api/chat.js";

const port = Number(process.env.PORT || 8787);
http
  .createServer((req, res) => {
    res.status = (code) => ((res.statusCode = code), res);
    res.json = (obj) => (res.setHeader("Content-Type", "application/json"), res.end(JSON.stringify(obj)));
    if (req.url?.split("?")[0] !== "/api/chat") return res.status(404).json({ error: "Not found" });
    handler(req, res);
  })
  .listen(port, () => console.log(`support-api dev server on http://localhost:${port}/api/chat`));
