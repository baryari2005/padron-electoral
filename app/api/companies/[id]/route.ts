// // /app/api/companies/[id]/route.ts

// import { db } from "@/lib/db";
// import { auth } from "@clerk/nextjs";
// import { NextResponse } from "next/server";

// export async function DELETE(
//   request: Request,
//   { params }: { params: { id: string } }
// ) {
//   try {
//     const { userId } = auth();
    
//     if (!userId)
//       return new NextResponse("Unauthorized", { status: 401 });
    
//     await db.contact.deleteMany({ where: { companyId: params.id } });
//     await db.company.delete({ where: { id: params.id } });
//     return NextResponse.json({ success: true });
//   } catch (error) {
//     return NextResponse.json({ error: "No se pudo eliminar" }, { status: 500 });
//   }
// }

// export async function PATCH(req: Request, { params }: { params: { id: string } }) {
//   try {
//     const { userId } = auth();
//     const { id } = params;
//     const values = await req.json()

//     if (!userId)
//       return new NextResponse("Unauthorized", { status: 401 });

//     const company = await db.company.update({
//       where: {
//         id: id,
//         userId,
//       },
//       data: {
//         ...values
//       },
//     });

//     return NextResponse.json(company);
//   }
//   catch (error) {
//     console.log(error);
//     return new NextResponse("Internal Error", { status: 500 });
//   }
// }