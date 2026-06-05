import { createClient } from "@supabase/supabase-js";

const supabaseUrl =
 "https://cwzwzemieeihpoulzgle.supabase.co";

const supabaseAnonKey =
 "sb_publishable_BHGQhUK8lUgZhJDHitJ1pQ_CyyNZ2QK";

export const supabase = createClient(
  supabaseUrl,
  supabaseAnonKey
);