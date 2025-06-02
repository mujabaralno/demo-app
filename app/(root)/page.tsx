"use client"
import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

const HomePage = () => {
  const router = useRouter() 
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('authToken')
      
      if (!token) {
        router.push('/login') 
        return
      }
      
      setIsLoading(false)
    }

    checkAuth()
  }, [router])

  if (isLoading) {
    return <div>Loading...</div>
  }

  return (
    <div>Home page</div>
  )
}

export default HomePage