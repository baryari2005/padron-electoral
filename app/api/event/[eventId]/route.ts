// app/api/event/[eventId]/route.ts

import { db } from "@/lib/db";
import { auth } from "@clerk/nextjs";
import { NextResponse } from "next/server";

export async function DELETE(req: Request, { params }: { params: { eventId: string } }) {
    try {
        const { userId } = auth();

        if (!userId) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        if (!params.eventId) {
            return new NextResponse("Event ID is required", { status: 400 });
        }

        const event = await db.event.delete({
            where: {
                id: params.eventId,
            },
        });

        return NextResponse.json(event);
    } catch (error) {
        console.error("[DELETE_EVENT_ERROR]", error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}
