import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Không dùng proxy — axios gọi thẳng backend qua VITE_API_URL
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
  },
});
