import { SignIn } from "@clerk/nextjs";

export default function Page() {
  return (
    <section className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50">
      <div className="lg:grid lg:min-h-screen lg:grid-cols-12">
        <section className="relative flex h-32 items-end bg-gradient-to-br from-blue-600 to-purple-600 lg:col-span-5 lg:h-full xl:col-span-6">
          <div className="absolute inset-0 bg-black/20"></div>
          <img
            alt=""
            src="https://images.unsplash.com/photo-1605106702734-205df224ecce?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8MHx8&auto=format&fit=crop&w=870&q=80"
            className="absolute inset-0 h-full w-full object-cover opacity-60"
          />
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

        <main className="flex min-h-screen items-center justify-center px-4 py-8 sm:px-8 lg:col-span-7 lg:px-16 lg:py-12 xl:col-span-6 bg-transparent">
          <div className="w-full max-w-md mx-auto">
            <div className="backdrop-blur-lg bg-white/70 border border-gray-200 rounded-3xl shadow-2xl p-10 flex flex-col items-center justify-center gap-6" style={{boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)'}}>
              <div className="text-center mb-2">
                <h2 className="text-3xl font-extrabold text-gray-900 mb-1 tracking-tight">Sign in to MoneyMap</h2>
                <p className="text-gray-600 text-base">Access your personalized financial dashboard</p>
              </div>
              <SignIn 
                forceRedirectUrl="/dashboard"
                appearance={{
                  elements: {
                    formButtonPrimary: "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300",
                    card: "shadow-none bg-transparent",
                    headerTitle: "hidden",
                    headerSubtitle: "hidden",
                    socialButtonsBlockButton: "bg-white border border-gray-300 hover:border-blue-600 hover:text-blue-600 transition-all duration-300",
                    dividerLine: "bg-gray-200",
                    dividerText: "text-gray-500",
                    formFieldInput: "border border-gray-300 focus:border-blue-600 focus:ring-blue-600 rounded-xl",
                    formFieldLabel: "text-gray-700 font-medium",
                    footerActionLink: "text-blue-600 hover:text-blue-700 font-medium",
                    footerActionText: "text-gray-600"
                  }
                }}
              />
            </div>
          </div>
        </main>
      </div>
    </section>
  );
}
