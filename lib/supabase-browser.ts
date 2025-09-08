// SOLO servidor: usa SERVICE ROLE (no exponer al cliente)
import { createClient } from "@supabase/supabase-js";

export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,        // tu URL del proyecto
  process.env.SUPABASE_SERVICE_ROLE!        // service role (server-only)
);
