// ============================================================
// config.js — Configuración y utilidades compartidas de REGHOR
// Cargar SIEMPRE después del SDK de Supabase y ANTES del script
// específico de cada página (app.js / informes.js / graficos.js)
// ============================================================

// Conexión Supabase (única fuente de verdad)
const SUPABASE_URL = 'https://oppieocootkgddhazikw.supabase.co';
const SUPABASE_KEY = 'sb_publishable_6_pEKDfVrdKKuewB_qn_cw_fzNXPjT-';

let supabaseClient = null;
if (window.supabase) {
  supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
}

const TABLA = 'obras';

/**
 * Convierte un patrón con comodines '*' en una expresión regular.
 * Usado en informes.js y graficos.js para filtrar por texto.
 */
function crearRegexFiltro(patron) {
  if (!patron || !patron.trim()) return null;
  const textoLimpio = patron.trim();
  const patronEspecial = textoLimpio.replace(/[-\/\\^$+?.()|[\]{}]/g, '\\$&');
  const patronRegex = '^' + patronEspecial.replace(/\*/g, '.*') + '$';
  return new RegExp(patronRegex, 'i');
}

/**
 * Diferencia en minutos entre dos horas 'HH:MM'.
 * Si la hora fin es menor que la de inicio, se asume que cruza medianoche.
 */
function obtenerMinutosDuracion(horaInicio, horaFin) {
  if (!horaInicio || !horaFin) return 0;
  const [hIni, mIni] = horaInicio.split(':').map(Number);
  const [hFin, mFin] = horaFin.split(':').map(Number);
  let dif = (hFin * 60 + mFin) - (hIni * 60 + mIni);
  return dif < 0 ? dif + 1440 : dif;
}

/** Formatea minutos totales como 'HH:MM' (con signo si es negativo). */
function formatearMinutosAHoras(totalMinutos) {
  const absMin = Math.abs(totalMinutos);
  const hh = String(Math.floor(absMin / 60)).padStart(2, '0');
  const mm = String(absMin % 60).padStart(2, '0');
  const signo = totalMinutos < 0 ? '-' : '';
  return `${signo}${hh}:${mm}`;
}

/** Duración entre horaInicio y horaFin, formateada como 'HH:MM'. */
function calcularDuracion(horaInicio, horaFin) {
  return formatearMinutosAHoras(obtenerMinutosDuracion(horaInicio, horaFin));
}

/** Alterna el tema claro/oscuro y actualiza el texto del botón. */
function toggleTheme() {
  document.body.classList.toggle('dark-mode');
  const isDark = document.body.classList.contains('dark-mode');
  const btn = document.getElementById('btn-theme');
  if (btn) btn.textContent = isDark ? '☀️ Claro' : '🌙 Oscuro';
}

/** Cierra la pestaña actual (usado en informes.html y graficos.html). */
function cerrarPestana() {
  window.close();
}
