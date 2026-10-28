
import { useEffect, useState } from 'react'
import type { Session } from '@supabase/supabase-js'
import { supabase } from './lib/supabase'
import './App.css'

function App() {
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [securityResult, setSecurityResult] = useState('')
  const [testingSecurity, setTestingSecurity] = useState(false)

  useEffect(() => {
    async function checkSession() {
      const { data, error } = await supabase.auth.getSession()

      console.log('Sesión inicial:', data.session)
      console.log('Error al recuperar sesión:', error)

      setSession(data.session)
      setLoading(false)
    }

    checkSession()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('Evento de autenticación:', event)
      console.log('Sesión recibida:', session)

      setSession(session)
    })

    return () => subscription.unsubscribe()
  }, [])

  async function signInWithGoogle() {
    setError('')

    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin,
      },
    })

    if (error) setError(error.message)
  }

  async function signOut() {
    setError('')
    setSecurityResult('')

    const { error } = await supabase.auth.signOut()

    if (error) setError(error.message)
  }

  async function testSecurity() {
    setError('')
    setSecurityResult('')
    setTestingSecurity(true)

    try {
      if (!session) {
        throw new Error('Debes iniciar sesión primero.')
      }

      // 1. Consultar perfiles visibles según las políticas RLS.
      // No usamos .single() para distinguir entre cero y una fila.
      const { data: profiles, error: profileError } = await supabase
        .from('profiles')
        .select('id, display_name, avatar_path')

      console.log('Resultado de perfiles:', profiles)
      console.log('Error de perfiles:', profileError)

      if (profileError) {
        throw new Error(
          `Perfil: ${profileError.message} (código: ${profileError.code})`
        )
      }

      if (!profiles || profiles.length === 0) {
        throw new Error(
          'No se encontró ningún perfil visible. Hay que comprobar la fila y las políticas RLS.'
        )
      }

      if (profiles.length > 1) {
        throw new Error(
          'La consulta devolvió varios perfiles; revisaremos las políticas RLS.'
        )
      }

      const profile = profiles[0]

      // 2. Verificar que el perfil pertenece al usuario autenticado.
      if (profile.id !== session.user.id) {
        throw new Error(
          'El perfil devuelto no corresponde al usuario actual.'
        )
      }

      // 3. Consultar los roles visibles del usuario autenticado.
      const { data: roles, error: rolesError } = await supabase
        .from('user_roles')
        .select('roles(code, description)')

      console.log('Roles:', roles)
      console.log('Error de roles:', rolesError)

      if (rolesError) {
        throw new Error(
          `Roles: ${rolesError.message} (código: ${rolesError.code})`
        )
      }

      setSecurityResult(
        JSON.stringify(
          {
            resultado: 'Consultas completadas correctamente',
            perfil: profile,
            roles: roles,
          },
          null,
          2
        )
      )
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Error desconocido'
      )
    } finally {
      setTestingSecurity(false)
    }
  }

  if (loading) {
    return (
      <main>
        <p>Comprobando sesión...</p>
      </main>
    )
  }

  return (
    <main>
      <h1>puchale+</h1>
      <p>Subastas en tiempo real</p>

      {session ? (
        <section>
          <h2>¡Has iniciado sesión!</h2>
          <p>Correo: {session.user.email}</p>
          <p>UID: {session.user.id}</p>

          <button onClick={testSecurity} disabled={testingSecurity}>
            {testingSecurity
              ? 'Comprobando permisos...'
              : 'Probar perfil y roles'}
          </button>

          {securityResult && (
            <pre
              style={{
                textAlign: 'left',
                whiteSpace: 'pre-wrap',
                overflowWrap: 'anywhere',
              }}
            >
              {securityResult}
            </pre>
          )}

          <button onClick={signOut}>
            Cerrar sesión
          </button>
        </section>
      ) : (
        <button onClick={signInWithGoogle}>
          Continuar con Google
        </button>
      )}

      {error && <p role="alert">Error: {error}</p>}
    </main>
  )
}

export default App
