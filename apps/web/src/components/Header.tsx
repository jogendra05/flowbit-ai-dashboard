import { MoreVertical } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";

export function Header() {
  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center justify-center gap-2">
          <img src="/panel-left.svg" alt="" className="w-5 h-5"/>
          <h1 className="text-xl">Dashboard</h1>
        </div>
        <div className="flex items-center gap-3">
          <Avatar className="w-10 h-10">
            <AvatarImage src="/header2.jpg" />
            <AvatarFallback>AJ</AvatarFallback>
          </Avatar>
          <div>
            <div className="font-semibold">Amit Jadhav</div>
            <div className="text-xs text-gray-500">Admin</div>
          </div>
          <button className="p-1 hover:bg-gray-100 rounded">
            <MoreVertical className="w-5 h-5 text-gray-600" />
          </button>
        </div>
      </div>
    </header>
  );
}