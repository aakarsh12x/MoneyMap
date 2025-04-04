import { UserButton } from '@clerk/nextjs'
import React from 'react'

function DashboardHeader() {
  return (
    <div className='px-4 py-3 md:px-6 md:py-4 shadow-sm border-b flex justify-between items-center'>
        <div className="ml-10 md:ml-0">
          <h1 className="text-lg md:text-xl font-semibold text-gray-800">MoneyMap</h1>
        </div>
        <div>
            <UserButton afterSignOutUrl='/'/>
        </div>
    </div>
  )
}

export default DashboardHeader