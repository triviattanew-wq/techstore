export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const leadId = params.id
    const { status } = await request.json()

    if (!status) {
      return NextResponse.json({ error: 'Status is required' }, { status: 400 })
    }

    const validStatuses = ['NEW', 'IN_PROGRESS', 'CONFIRMED', 'CANCELLED', 'COMPLETED']
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
    }

    const lead = await prisma.lead.update({
      where: { id: leadId },
      data: { status: status as any }
    })

    return NextResponse.json({ success: true, lead })
  } catch (error) {
    console.error('Lead status update error:', error)
    return NextResponse.json({ error: 'Failed to update lead status' }, { status: 500 })
  }
}