import { join, dirname, resolve } from "path";
import { fileURLToPath } from "url";
import react from "@vitejs/plugin-react";

const path = fileURLToPath(import.meta.url);

export default {
  root: join(dirname(path), "client"),
  plugins: [react()],
  define: {
    'process.env.ENABLE_STORMTROOPER_AUDIO': JSON.stringify(process.env.ENABLE_STORMTROOPER_AUDIO)
  }
};
