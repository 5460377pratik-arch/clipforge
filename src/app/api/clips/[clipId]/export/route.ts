import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { ApiResponse } from "@/lib/types";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ clipId: string }> }
): Promise<NextResponse<ApiResponse<{ message: string, downloadUrl?: string }>>> {
  try {
    const { clipId } = await params;
    
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return NextResponse.json({ success: false, error: { code: "UNAUTHORIZED", message: "You must be logged in" } }, { status: 401 });

    const { data: clip, error: clipError } = await supabase
      .from("clips")
      .select("id, storage_path, projects!inner(user_id)")
      .eq("id", clipId)
      .eq("projects.user_id", user.id)
      .single();

    if (clipError || !clip) {
      return NextResponse.json({ success: false, error: { code: "NOT_FOUND", message: "Clip not found or unauthorized" } }, { status: 404 });
    }

    if (!clip.storage_path) {
      return NextResponse.json({ success: false, error: { code: "NOT_FOUND", message: "Clip file not found" } }, { status: 404 });
    }

    // Generate signed download URL using existing generated clip
    const { data: signedData, error: signError } = await supabase.storage
      .from("videos")
      .createSignedUrl(clip.storage_path, 3600, { download: true });

    if (signError || !signedData?.signedUrl) {
      return NextResponse.json({ success: false, error: { code: "STORAGE_ERROR", message: "Failed to generate download URL" } }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      data: { 
        message: "Download ready",
        downloadUrl: signedData.signedUrl
      }
    });

  } catch (err: any /* eslint-disable-line @typescript-eslint/no-explicit-any */) {
    return NextResponse.json({ success: false, error: { code: "INTERNAL_ERROR", message: err.message } }, { status: 500 });
  }
}