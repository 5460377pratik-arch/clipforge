import { NextRequest, NextResponse } from 'next/server';
import type { ApiResponse, Project } from '@/lib/types';

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(
  _request: NextRequest,
  { params }: RouteContext
): Promise<NextResponse<ApiResponse<Project>>> {
  const { id } = await params;
  // TODO: verify session, query DB for project where id = ? AND userId = ?
  void id;
  return NextResponse.json(
    { success: false, error: { code: 'NOT_IMPLEMENTED', message: 'Database not configured.' } },
    { status: 501 }
  );
}

export async function PATCH(
  request: NextRequest,
  { params }: RouteContext
): Promise<NextResponse<ApiResponse<Project>>> {
  const { id } = await params;
  const _body = await request.json();
  // TODO: verify session, update project in DB
  void id;
  return NextResponse.json(
    { success: false, error: { code: 'NOT_IMPLEMENTED', message: 'Database not configured.' } },
    { status: 501 }
  );
}

export async function DELETE(
  _request: NextRequest,
  { params }: RouteContext
): Promise<NextResponse<ApiResponse<{ deleted: boolean }>>> {
  const { id } = await params;
  // TODO: verify session, soft-delete or delete project + cascade clips
  void id;
  return NextResponse.json(
    { success: false, error: { code: 'NOT_IMPLEMENTED', message: 'Database not configured.' } },
    { status: 501 }
  );
}