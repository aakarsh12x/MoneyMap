import { SignUp } from "@clerk/nextjs";

export default function Page() {
  return (
    <section className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50">
      <div className="lg:grid lg:min-h-screen lg:grid-cols-12">
        {/* Left Side - Welcome/Branding */}
        <section className="relative flex h-32 items-end bg-gradient-to-br from-blue-600 to-purple-600 lg:col-span-5 lg:h-full xl:col-span-6">
          <div className="absolute inset-0 bg-black/20"></div>
          <div className="relative p-8 text-white">
            <div className="flex items-center mb-4">
              <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center mr-3">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              </div>
              <h1 className="text-2xl font-bold">MoneyMap</h1>
            </div>
            <h2 className="text-3xl font-bold mb-4">Welcome to Smart Finance Management</h2>
            <p className="text-lg opacity-90">
              Take control of your finances with AI-powered insights and intelligent budgeting.
            </p>
          </div>
        </section>

        {/* Right Side - Sign Up Form */}
        <main className="flex items-center justify-center px-8 py-8 sm:px-12 lg:col-span-7 lg:px-16 lg:py-12 xl:col-span-6">
          <div className="max-w-xl lg:max-w-3xl w-full">
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Create your account</h2>
                <p className="text-gray-600">Start your journey to smarter finances</p>
              </div>
              <SignUp fallbackRedirectUrl="/dashboard" />
            </div>
          </div>
        </main>
      </div>
    </section>
  );
}
