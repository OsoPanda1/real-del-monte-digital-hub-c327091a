import { supabase } from "@/integrations/supabase/client";

export async function callGateway<T = unknown>(operation: string, payload?: Record<string, unknown>): Promise<T> {
  const { data, error } = await supabase.functions.invoke("tamv-gateway", {
    body: { operation, payload: payload || {} },
  });

  if (error) throw new Error(`Gateway error [${operation}]: ${error.message}`);
  if (data?.error) throw new Error(`Gateway rejected [${operation}]: ${data.error}`);
  return data as T;
}
