import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ success: false, error: { message: "Unauthorized" } }, { status: 401 });
    }

    // We join with projects to ensure user ownership
    const { data, error } = await supabase
      .from("processing_jobs")
      .select("*, projects!inner(user_id)")
      .eq("id", id)
      .eq("projects.user_id", user.id)
      .single();

    if (error || !data) {
      return NextResponse.json({ success: false, error: { message: "Job not found" } }, { status: 404 });
    }

    return NextResponse.json(
      { success: true, data },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (err: any /* eslint-disable-line @typescript-eslint/no-explicit-any */) {
    return NextResponse.json({ success: false, error: { message: err.message } }, { status: 500 });
  }
}