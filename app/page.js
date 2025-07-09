"use client";
import React, { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import Image from "next/image";

export default function Home() {
  const { user, isSignedIn, isLoaded } = useUser();
  const router = useRouter();
  const [showLoading, setShowLoading] = useState(false);

  useEffect(() => {
    if (isLoaded && isSignedIn) {
      setShowLoading(true);
      const timer = setTimeout(() => {
        router.push("/dashboard");
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [isSignedIn, isLoaded, router]);

  const handleGetStarted = () => {
    router.push("/sign-in");
  };

  if (showLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-20 h-20 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
            <div className="w-10 h-10 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
          </div>
          <h2 className="text-3xl font-bold text-gray-800 mb-3">Welcome back!</h2>
          <p className="text-gray-600 text-lg">Redirecting you to your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header */}
      <div className="p-6 flex justify-between items-center">
        <div className="flex items-center">
          <div className="relative">
            <Image src="/chart-donut.svg" alt="logo" width={40} height={25} />
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
          </div>
          <span className="text-blue-800 font-bold text-xl ml-2">MoneyMap</span>
        </div>
        <div className="hidden md:flex space-x-4">
          <span className="text-gray-600">Smart Finance Management</span>
        </div>
      </div>

      {/* Hero Section */}
      <div className="flex flex-col lg:flex-row items-center justify-center min-h-[calc(100vh-120px)] px-6">
        <div className="lg:w-1/2 text-center lg:text-left mb-12 lg:mb-0">
          <div className="inline-flex items-center px-4 py-2 bg-blue-100 text-blue-800 rounded-full text-sm font-medium mb-6">
            <span className="w-2 h-2 bg-blue-600 rounded-full mr-2 animate-pulse"></span>
            AI-Powered Financial Management
          </div>
          
          <h1 className="text-4xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
            Manage your Money with
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 block">AI-Driven Personal</span>
            <span className="text-blue-800">Finance Advisor</span>
          </h1>
          
          <p className="text-xl text-gray-600 mb-8 max-w-2xl leading-relaxed">
            Take control of your finances with intelligent budgeting, investment tracking, 
            and personalized financial insights powered by AI.
          </p>
          
          {/* Get Started Button */}
          <div className="flex flex-col sm:flex-row gap-4">
            <Button 
              size="lg" 
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-4 text-lg rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
              onClick={handleGetStarted}
            >
              Get Started
              <span className="ml-2 text-xl">→</span>
            </Button>
            <Button 
              variant="outline"
              size="lg" 
              className="px-8 py-4 text-lg rounded-full border-2 border-gray-300 hover:border-blue-600 hover:text-blue-600 transition-all duration-300"
            >
              Learn More
            </Button>
          </div>
        </div>

        <div className="lg:w-1/2">
          <div className="relative">
            <div className="absolute -inset-4 bg-gradient-to-r from-blue-400 to-purple-400 rounded-3xl blur-xl opacity-20"></div>
            <Image
              src="/dashboard.png"
              alt="MoneyMap Dashboard"
              width={600}
              height={400}
              className="relative rounded-2xl shadow-2xl border border-gray-200"
              priority
            />
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-20 px-6 bg-white/50 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Why Choose MoneyMap?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Experience the future of personal finance management with cutting-edge AI technology
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center group">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-blue-200 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                <svg className="w-10 h-10 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="text-2xl font-semibold mb-3 text-gray-900">Smart Budgeting</h3>
              <p className="text-gray-600 leading-relaxed">AI-powered budget tracking and expense categorization with intelligent insights</p>
            </div>
            
            <div className="text-center group">
              <div className="w-20 h-20 bg-gradient-to-br from-green-100 to-green-200 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
              <h3 className="text-2xl font-semibold mb-3 text-gray-900">Investment Tracking</h3>
              <p className="text-gray-600 leading-relaxed">Monitor stocks, crypto, and mutual funds in real-time with portfolio analytics</p>
            </div>
            
            <div className="text-center group">
              <div className="w-20 h-20 bg-gradient-to-br from-purple-100 to-purple-200 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                <svg className="w-10 h-10 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <h3 className="text-2xl font-semibold mb-3 text-gray-900">AI Insights</h3>
              <p className="text-gray-600 leading-relaxed">Personalized financial advice and spending pattern analysis</p>
            </div>
          </div>
        </div>
      </div>
   </div>
  );
}