"use client";
import React, { useEffect, useState } from "react";
import SideNav from "./_components/SideNav";
import DashboardHeader from "./_components/DashboardHeader";
import { db } from "@/utils/dbConfig";
import { Budgets } from "@/utils/schema";
import { useUser } from "@clerk/nextjs";
import { eq } from "drizzle-orm";
import { useRouter } from "next/navigation";

function DashboardLayout({ children }) {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    if (isLoaded && user) {
      checkUserBudgets();
    } else if (isLoaded && !user) {
      router.push("/");
    }
  }, [user, isLoaded]);

  const checkUserBudgets = async () => {
    try {
    const result = await db
      .select()
      .from(Budgets)
      .where(eq(Budgets.createdBy, user?.primaryEmailAddress?.emailAddress));
      
    console.log(result);
    if (result?.length == 0) {
      router.replace("/dashboard/budgets");
    }
    } catch (error) {
      console.error("Error checking user budgets:", error);
    } finally {
      setIsChecking(false);
    }
  };

  if (!isLoaded || isChecking) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-20 h-20 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
            <div className="w-10 h-10 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
          </div>
          <h2 className="text-3xl font-bold text-gray-800 mb-3">Loading your dashboard...</h2>
          <p className="text-gray-600 text-lg">Please wait while we set up your financial overview</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50">
      {/* Sidebar */}
      <div className="fixed md:w-64 hidden md:block h-full z-20">
        <div className="h-full bg-white/80 backdrop-blur-sm border-r border-gray-200/50">
        <SideNav />
        </div>
      </div>
      
      {/* Main Content */}
      <div className="md:ml-64">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-sm border-b border-gray-200/50">
        <DashboardHeader />
        </div>
        
        {/* Page Content */}
        <div className="relative">
        {children}
        </div>
      </div>
    </div>
  );
}

export default DashboardLayout;
