// import { db } from "@/lib/db";
// import { auth } from "@clerk/nextjs"
// import { redirect } from "next/navigation";
// import { Calendar } from "./components/Calendar";


// export default async function TaskPage() {
//     const { userId } = auth();

//     if (!userId)
//         return redirect("/");

//     const companies = await db.company.findMany({
//         where: {
//             userId
//         },
//         orderBy: {
//             createAt: "desc"
//         }
//     })

//     const events = await db.event.findMany({
//         orderBy: {
//             createAt: "desc"
//         }
//     })
//     return (
//         <div><Calendar companies={companies} events={events}/></div>
//     )
// }
