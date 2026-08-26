import { vercelPreset } from "@vercel/react-router/vite";
import type { Config } from "@react-router/dev/config";

export default {
  appDirectory: "src",
  ssr: true,
  presets: [vercelPreset()],
} satisfies Config;
