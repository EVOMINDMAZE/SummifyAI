import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig({
  server: {
    host: "::",
    port: 5173, // Standard Vite port
  },
  build: {
    outDir: "dist",
  },
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./client"),
    },
  },
  // Remove server proxy since we're using Supabase directly
  define: {
    // Make sure environment variables are available in the client
    'import.meta.env.VITE_SUPABASE_URL': JSON.stringify(process.env.VITE_SUPABASE_URL),
    'import.meta.env.VITE_SUPABASE_ANON_KEY': JSON.stringify(process.env.VITE_SUPABASE_ANON_KEY),
    'import.meta.env.VITE_DATABASE_URL': JSON.stringify(process.env.DATABASE_URL),
    'import.meta.env.VITE_OPENAI_API_KEY': JSON.stringify(process.env.OPENAI_API_KEY),
    'import.meta.env.VITE_OPENAI_MODEL': JSON.stringify(process.env.OPENAI_MODEL),
  }
});
