import { db } from "@/lib/db";
import { auth } from "@clerk/nextjs";
import { NextResponse } from "next/server";

export async function POST(req: Request, { params }: { params: { id: string } }) {
  try {
    const { userId } = auth();
    const data = await req.json();

    if (!userId)
      return new NextResponse("Unauthorized", { status: 401 });

    const company = await db.company.findUnique({
      where: {
        id: params.id,
      },
    });

    if (!company)
      return new NextResponse("Company not found", { status: 404 });

    const contact = await db.contact.create({
      data: {
        name: data.name,
        phone: data.phone,
        role: data.role,
        email: data.email,
        companyId: params.id,  // ✅ Relación con la empresa
      },
    });

    return NextResponse.json(contact);
  } catch (error) {
    console.error("[CONTACT_POST]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
