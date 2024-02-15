require("module-alias/register");

import { server, app } from "@/server";
import getGameRoute from "@/routes/getGame";
import makeMoveRoute from "@/routes/makeMove";

const PORT = process.env["PORT"] ?? "3000";

getGameRoute(app);
makeMoveRoute(app);

(async () => {
  server.listen(PORT);
  console.log(`Server running on port ${PORT}`);
})();
