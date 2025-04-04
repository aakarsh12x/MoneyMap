import React, { useEffect } from "react";
import Image from "next/image";
import {
  LayoutGrid,
  PiggyBank,
  ReceiptText,
  ShieldCheck,
  CircleDollarSign,
  TrendingUp,
  TrendingDownIcon,
  X,
  Settings,
} from "lucide-react";
import { UserButton } from "@clerk/nextjs";
import { usePathname } from "next/navigation";
import Link from "next/link";

function SideNav({ onItemClick }) {
  const menuList = [
    {
      id: 1,
      name: "Dashboard",
      icon: LayoutGrid,
      path: "/dashboard",
    },
    {
      id: 2,
      name: "Incomes",
      icon: CircleDollarSign,
      path: "/dashboard/incomes",
    },
    {
      id: 3,
      name: "Budgets",
      icon: PiggyBank,
      path: "/dashboard/budgets",
    },
    {
      id: 4,
      name: "Expenses",
      icon: ReceiptText,
      path: "/dashboard/expenses",
    },
    {
      id: 5,
      name: "Settings",
      icon: Settings,
      path: "/dashboard/settings",
    },
    {
      id: 6,
      name: "Upgrade",
      icon: ShieldCheck,
      path: "/dashboard/upgrade",
    },
  ];
  const path = usePathname();

  const handleNavClick = () => {
    if (onItemClick) {
      onItemClick();
    }
  };

  return (
    <div className="h-full flex flex-col p-5 border shadow-sm bg-white">
      <div className="flex flex-row items-center justify-between">
        <div className="flex items-center">
          <Image src={"./chart-donut.svg"} alt="logo" width={40} height={25} />
          <span className="text-blue-800 font-bold text-xl">MoneyMap</span>
        </div>
        {onItemClick && (
          <button 
            onClick={handleNavClick}
            className="md:hidden p-2 text-gray-500 hover:text-gray-800"
          >
            <X size={20} />
          </button>
        )}
      </div>

      <nav className="mt-8 flex-1">
        {menuList.map((menu, index) => (
          <Link 
            href={menu.path} 
            key={index} 
            onClick={handleNavClick} 
            className={`flex gap-3 items-center
                  text-gray-600 font-medium
                  mb-2 p-3 cursor-pointer rounded-lg
                  hover:text-primary hover:bg-blue-100 transition-colors
                  ${path === menu.path ? "text-primary bg-blue-100 font-semibold" : ""}
                  `}
          >
            <menu.icon size={20} />
            <span>{menu.name}</span>
          </Link>
        ))}
      </nav>

      <div className="p-3 flex items-center gap-3 border-t">
        <UserButton afterSignOutUrl='/' />
        <span className="text-sm font-medium">Profile</span>
      </div>
    </div>
  );
}

export default SideNav;
