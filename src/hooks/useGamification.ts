import { useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useRDMAuth } from "@/contexts/RDMAuthContext";
import { useToast } from "@/components/ui/use-toast";

// Action -> points table (canonical, easy to extend)
export const POINTS_TABLE = {
  daily_login: 5,
  visit_place: 10,
  share_post: 25,
  upload_photo: 30,
  review_business: 40,
  complete_route: 75,
  attend_event: 50,
  refer_friend: 100,
  register_business: 200,
} as const;

export type GamificationAction = keyof typeof POINTS_TABLE;

export function useGamification() {
  const { user, refreshProfile } = useRDMAuth();
  const { toast } = useToast();

  const logActivity = useCallback(
    async (action: string, targetType?: string, targetId?: string, metadata?: Record<string, unknown>) => {
      if (!user) return;
      await supabase.from("activity_log").insert({
        user_id: user.id,
        action,
        target_type: targetType ?? null,
        target_id: targetId ?? null,
        metadata: metadata ?? null,
      });
    },
    [user]
  );

  const awardPoints = useCallback(
    async (action: GamificationAction, metadata?: Record<string, unknown>) => {
      if (!user) return { ok: false, reason: "not_authenticated" as const };
      const points = POINTS_TABLE[action];
      const { error } = await supabase.functions.invoke("award-points", {
        body: { action, points, metadata },
      });
      if (error) return { ok: false, reason: error.message };
      await refreshProfile();
      toast({ title: `+${points} puntos`, description: `Acción: ${action.replace(/_/g, " ")}` });
      return { ok: true };
    },
    [user, refreshProfile, toast]
  );

  return { awardPoints, logActivity };
}
