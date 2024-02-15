require("module-alias/register");

import express from "express";

import { server, app } from "@/server";
import getGameRoute from "@/routes/getGame";
import makeMoveRoute from "@/routes/makeMove";

const PORT = process.env["PORT"] ?? "3000";

app.use(express.static("public"));

getGameRoute(app);
makeMoveRoute(app);

(async () => {
  server.listen(PORT);
  console.log(`Server running on port ${PORT}`);
})();
