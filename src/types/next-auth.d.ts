import { type DefaultSession } from 'next-auth'

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      role: string
      institutionId: string | null
      institutionName: string | null
      avatarUrl: string | null
    } & DefaultSession['user']
  }
}
