// ============================================================
// auth.js — Candado de acceso a REGHOR
// Cargar como PRIMER script dentro de <head>, antes que cualquier otro
// contenido, en TODAS las páginas protegidas (index.html, informes.html,
// graficos.html, Semana.html). login.html también lo carga (para poder
// comprobar la contraseña), pero se excluye a sí misma del redireccionado.
//
// IMPORTANTE: esto es un candado de INTERFAZ, no de datos. La clave de
// Supabase en config.js sigue siendo pública; alguien con conocimientos
// técnicos que inspeccione las peticiones de red podría seguir consultando
// la base de datos sin pasar por este login. Si se quiere proteger también
// los datos, hay que activar Supabase Auth + RLS (nivel "seguridad real").
// ============================================================

// Hash SHA-256 de la contraseña de acceso (nunca se guarda en texto plano).
const REGHOR_CLAVE_HASH = '33ccfab4b8c1899746165f6081a07f5e03163ad2ae79cc28ffa9eb544e2a0523';

const REGHOR_AUTH_KEY = 'reghor_autenticado';

/** true si ya se introdujo la contraseña correcta en este navegador. */
function estaAutenticado() {
  try {
    return localStorage.getItem(REGHOR_AUTH_KEY) === '1';
  } catch (e) {
    return false;
  }
}

/** Calcula el hash SHA-256 (hex) de un texto, usando la Web Crypto API. */
async function calcularHashSHA256(texto) {
  const datos = new TextEncoder().encode(texto);
  const buffer = await crypto.subtle.digest('SHA-256', datos);
  return Array.from(new Uint8Array(buffer)).map(b => b.toString(16).padStart(2, '0')).join('');
}

/** Comprueba una contraseña introducida contra el hash guardado. */
async function comprobarClave(clave) {
  const hash = await calcularHashSHA256(clave || '');
  return hash === REGHOR_CLAVE_HASH;
}

/** Marca la sesión como autenticada en este navegador (persiste entre visitas). */
function marcarAutenticado() {
  try {
    localStorage.setItem(REGHOR_AUTH_KEY, '1');
  } catch (e) {
    // localStorage no disponible: no se puede recordar la sesión, pero no rompe nada.
  }
}

/** Cierra la sesión y vuelve a la pantalla de login. */
function cerrarSesion() {
  try {
    localStorage.removeItem(REGHOR_AUTH_KEY);
  } catch (e) {}
  window.location.href = 'login.html';
}

// Guardián: si esta página NO es login.html y no hay sesión iniciada,
// redirige inmediatamente a login.html antes de que se cargue nada más.
(function protegerPagina() {
  const esLogin = /(^|\/)login\.html$/.test(window.location.pathname);
  if (!esLogin && !estaAutenticado()) {
    window.location.replace('login.html');
  }
})();
