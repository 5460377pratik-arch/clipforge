import { NextRequest, NextResponse } from 'next/server';
import type { ApiResponse, PaginatedResult, Clip } from '@/lib/types';

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(
  _request: NextRequest,
  { params }: RouteContext
): Promise<NextResponse<ApiResponse<PaginatedResult<Clip>>>> {
  const { id: projectId } = await params;
  // TODO: verify session, query DB for clips WHERE projectId = ? AND userId = ?
  void projectId;
  return NextResponse.json(
    { success: false, error: { code: 'NOT_IMPLEMENTED', message: 'Database not configured.' } },
    { status: 501 }
  );
}