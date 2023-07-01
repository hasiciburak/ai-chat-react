import Link from 'next/link'
import React from 'react'

export const ChatSidebar = () => {
  return (
    <div className="bg-gray-900 text-white">
      <Link href="/api/auth/logout">Logout</Link>
    </div>
  )
}
