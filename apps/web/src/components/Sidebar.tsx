import {
  Home,
  FileText,
  FolderOpen,
  Layers,
  Users,
  Settings,
  ChevronUp,
  ChevronDown,
} from "lucide-react";
import clsx from "clsx";

export function Sidebar() {
  const menuItems = [
    { icon: Home, label: "Dashboard", active: true },
    { icon: FileText, label: "Invoice", active: false },
    { icon: FolderOpen, label: "Other files", active: false },
    { icon: Layers, label: "Departments", active: false },
    { icon: Users, label: "Users", active: false },
    { icon: Settings, label: "Settings", active: false }, 
  ];

  return (
    <div className="bg-white border-r border-gray-200 flex flex-col h-full">
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img className="w-10 h-10 rounded-md object-cover" src="/header1.png" alt="" />
            <div>
              <div className="font-semibold">Buchhaltung</div>
              <div className="text-xs text-gray-500">12 members</div>
            </div>
          </div>

          <button
            aria-label="toggle"
            className="flex flex-col items-center justify-center p-1 rounded-md hover:bg-gray-50 leading-none"
            type="button"
          >
            <ChevronUp className="w-3 h-3 -mb-0.5" />
            <ChevronDown className="w-3 h-3 -mt-0.5" />
          </button>
        </div>
      </div>

      <nav className="flex-1 p-4 overflow-y-auto">
        <div className="text-xs font-medium mb-3 tracking-wide text-gray-600">GENERAL</div>

        <ul className="">
          {menuItems.map((item) => {
            const svgSrc = `/${encodeURIComponent(item.label)}.svg`;
            const pngSrc = `/${encodeURIComponent(item.label)}.png`;

            return (
              <li key={item.label} className="flex">
                <button
                  className={clsx(
                    "flex items-center gap-1 px-3 py-1.5 rounded-lg transition-colors w-full sm:w-[204px] h-auto sm:h-[52px] font-semibold cursor-pointer leading-none",
                    item.active ? "bg-[#E3E6F0] text-[#1B1464]" : "text-gray-700 hover:bg-gray-50"
                  )}
                  type="button"
                >
                  <span
                    className={clsx(
                      "flex items-center justify-center w-8 h-8 rounded-md shrink-0",
                      item.active ? " text-white" : "bg-transparent text-gray-600"
                    )}
                    aria-hidden
                  >
                    <picture>
                      <source srcSet={svgSrc} type="image/svg+xml" />
                      <img
                        src={pngSrc}
                        alt={`${item.label} icon`}
                        className="w-5 h-5 object-contain block"
                        draggable={false}
                      />
                    </picture>
                  </span>

                  <span className={clsx("text-sm leading-none", item.active ? "font-semibold" : "font-medium")}>
                    {item.label}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="p-4 border-t border-gray-200 mt-auto">
        <div className="flex items-center justify-center gap-2 w-full">
          <img src="/Flowbit.svg" alt="" className="w-5 h-5" />
          <span className="font-semibold">Flowbit AI</span>
        </div>
      </div>
    </div>
  );
}
