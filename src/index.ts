import { serve } from "bun";
import index from "./index.html";
import { Database } from 'bun:sqlite'
import { db } from "../api/db";
import { routes } from "../api/routes";
import { seed } from "../api/seed/seed";
await seed();
console.log(
  db.query("SELECT name FROM sqlite_master WHERE type = 'table'").all()
);
const server = serve({
  routes: {
    ...routes,
    // Serve index.html for all unmatched routes.
    "/*": index,
  },

  development: process.env.NODE_ENV !== "production" && {
    // Enable browser hot reloading in development
    hmr: true,

    // Echo console logs from the browser to the server
    console: true
  },
});

console.log(`🚀 Server running at ${server.url}`);
