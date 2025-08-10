import { Logo } from "../Logo";
import { SidebarRoutes } from "../SidebarRoutes";

export function Sidebar() {
  return (
    <div className="h-screen overflow-y-auto border-r flex flex-col">
      <Logo />
      <SidebarRoutes />
    </div>
  )
}
