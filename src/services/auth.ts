export interface UserAccount {
  name: string
  email: string
  password: string
}
 
const USERS_KEY = 'galeria_foto_users'
const SESSION_KEY = 'galeria_foto_session'
 
function getUsers(): UserAccount[] {
  const savedUsers = localStorage.getItem(USERS_KEY)
 
  if (!savedUsers) return []
 
  try {
    return JSON.parse(savedUsers) as UserAccount[]
  } catch {
    return []
  }
}
 
function saveUsers(users: UserAccount[]) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users))
}
 
export function registerUser(account: UserAccount) {
  const users = getUsers()
  const email = account.email.trim().toLowerCase()
 
  if (users.some((user) => user.email === email)) {
    throw new Error('E-mail ja cadastrado.')
  }
 
  const user = {
    name: account.name.trim(),
    email,
    password: account.password
  }
 
  saveUsers([...users, user])
  localStorage.setItem(SESSION_KEY, JSON.stringify({ name: user.name, email: user.email }))
}
 
export function loginUser(emailValue: string, password: string) {
  const email = emailValue.trim().toLowerCase()
  const user = getUsers().find((account) => account.email === email && account.password === password)
 
  if (!user) {
    throw new Error('E-mail ou senha invalidos.')
  }
 
  localStorage.setItem(SESSION_KEY, JSON.stringify({ name: user.name, email: user.email }))
}
 
export function logoutUser() {
  localStorage.removeItem(SESSION_KEY)
}
 
export function isAuthenticated() {
  return localStorage.getItem(SESSION_KEY) !== null
}
 
export function getCurrentUser() {
  const session = localStorage.getItem(SESSION_KEY)
 
  if (!session) return null
 
  try {
    return JSON.parse(session) as Pick<UserAccount, 'name' | 'email'>
  } catch {
    return null
  }
}