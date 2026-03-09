import { redirect } from 'next/navigation'

export default function Home() {
  // Redirigimos automáticamente a todos los que entren a la raíz hacia el login
  redirect('/login')
}