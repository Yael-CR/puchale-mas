
import { useState } from 'react'
import type { Session } from '@supabase/supabase-js'

import { supabase } from '../../../lib/supabase'

const API_URL = 'http://127.0.0.1:8000'

interface AuthDiagnosticsProps {
  session: Session
}

export function AuthDiagnostics({ session }: AuthDiagnosticsProps) {
  const [error, setError] = useState('')
  const [securityResult, setSecurityResult] = useState('')
  const [backendResult, setBackendResult] = useState('')

  const [testingSecurity, setTestingSecurity] = useState(false)
  const [testingBackend, setTestingBackend] = useState(false)

  async function testSecurity() {
    setError('')
    setSecurityResult('')
    setTestingSecurity(true)

    try {
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
          'No se encontró ningún perfil visible. Comprueba la fila y las políticas RLS.'
        )
      }

      if (profiles.length > 1) {
        throw new Error(
          'La consulta devolvió varios perfiles; revisaremos las políticas RLS.'
        )
      }

      const profile = profiles[0]

      if (profile.id !== session.user.id) {
        throw new Error(
          'El perfil devuelto no corresponde al usuario actual.'
        )
      }

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
            roles,
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

  async function testBackendAuth() {
    setError('')
    setBackendResult('')
    setTestingBackend(true)

    try {
      if (!session.access_token) {
        throw new Error(
          'Debes iniciar sesión con Google antes de probar FastAPI.'
        )
      }

      const response = await fetch(`${API_URL}/api/auth/me`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${session.access_token}`,
          Accept: 'application/json',
        },
      })

      const responseText = await response.text()

      let result: unknown

      try {
        result = responseText ? JSON.parse(responseText) : null
      } catch {
        result = { message: responseText }
      }

      if (!response.ok) {
        throw new Error(
          `FastAPI respondió con HTTP ${response.status}: ${JSON.stringify(result)}`
        )
      }

      setBackendResult(
        JSON.stringify(
          {
            resultado: 'FastAPI reconoció la sesión de Supabase',
            respuesta: result,
          },
          null,
          2
        )
      )
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'No se pudo conectar con FastAPI.'
      )
    } finally {
      setTestingBackend(false)
    }
  }

  return (
    <section>
      <h3>Diagnóstico de autenticación y seguridad</h3>

      <div>
        <button
          onClick={testSecurity}
          disabled={testingSecurity}
        >
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
      </div>

      <div>
        <button
          onClick={testBackendAuth}
          disabled={testingBackend}
        >
          {testingBackend
            ? 'Probando FastAPI...'
            : 'Probar autenticación con FastAPI'}
        </button>

        {backendResult && (
          <pre
            style={{
              textAlign: 'left',
              whiteSpace: 'pre-wrap',
              overflowWrap: 'anywhere',
            }}
          >
            {backendResult}
          </pre>
        )}
      </div>

      {error && <p role="alert">Error: {error}</p>}
    </section>
  )
}
