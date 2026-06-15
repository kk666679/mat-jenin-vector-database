import { NextRequest, NextResponse } from 'next/server';
import { getPrismaClient, addDocumentJob } from '@/sdk';

// Explicitly declare runtime as Node.js
export const runtime = 'nodejs';

// Get prisma client instance
const prisma = getPrismaClient();

export async function GET(request: NextRequest) {
  try {
    // Get tenant ID from header (for demo, using a default)
    const tenantId = request.headers.get('x-tenant-id') || 'default-tenant';
    
    const documents = await prisma.document.findMany({
      where: { tenantId },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        title: true,
        status: true,
        chunkCount: true,
        createdAt: true,
      },
    });

    return NextResponse.json({
      success: true,
      data: { items: documents, total: documents.length },
    });
  } catch (error) {
    console.error('Failed to fetch documents:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch documents' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Get tenant ID from header (for demo, using a default)
    const tenantId = request.headers.get('x-tenant-id') || 'default-tenant';
    
    const formData = await request.formData();
    const title = formData.get('title') as string;
    const file = formData.get('file') as File;

    if (!title || !file) {
      return NextResponse.json(
        { success: false, error: 'Title and file are required' },
        { status: 400 }
      );
    }

    // Read file content
    const content = await file.text();

    // Create document record
    const document = await prisma.document.create({
      data: {
        tenantId,
        title,
        content,
        status: 'pending',
      },
    });

    // Add to processing queue
    await addDocumentJob(document.id, tenantId);

    return NextResponse.json({
      success: true,
      data: { id: document.id, title: document.title, status: document.status },
    });
  } catch (error) {
    console.error('Failed to upload document:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to upload document' },
      { status: 500 }
    );
  }
}

