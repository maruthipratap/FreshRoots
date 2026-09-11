/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState } from 'react'

const AuthContext = createContext(null)

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const storedUser = localStorage.getItem('fr_user')
      return storedUser ? JSON.parse(storedUser) : null
    } catch {
      return null
    }
  })
  const [token, setToken] = useState(() => {
    return localStorage.getItem('fr_token') || null
  })
  const [loading] = useState(false)

  const login = (userData, userToken) => {
    //console.log('Login called with:', userData)
    const userObj = userData.user || userData
    const tokenStr = userToken || userData.token

    setUser(userObj)
    setToken(tokenStr)
    localStorage.setItem('fr_user', JSON.stringify(userObj))
    localStorage.setItem('fr_token', tokenStr)
  }

  const logout = () => {
    setUser(null)
    setToken(null)
    localStorage.removeItem('fr_user')
    localStorage.removeItem('fr_token')
  }

  return (
    <AuthContext.Provider value={{ user, token, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}