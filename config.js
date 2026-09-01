
// ============================================================
// config.js — Configuración y utilidades compartidas de REGHOR
// Cargar SIEMPRE después del SDK de Supabase y ANTES del script
// específico de cada página (app.js / informes.js / graficos.js / Semana.js)
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
 
/** Cierra la pestaña actual (usado en informes.html, graficos.html y Semana.html). */
function cerrarPestana() {
  window.close();
}
 
// ------------------------------------------------------------
// Fechas: helpers compartidos (antes duplicados en varias páginas)
// ------------------------------------------------------------
 
/** Formatea un objeto Date como 'YYYY-MM-DD'. */
function formatearFechaISO(fecha) {
  const yyyy = fecha.getFullYear();
  const mm = String(fecha.getMonth() + 1).padStart(2, '0');
  const dd = String(fecha.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}
 
/** Fecha de hoy como 'YYYY-MM-DD', corregida a la zona horaria local del navegador. */
function obtenerFechaHoyISO() {
  const hoy = new Date();
  const offset = hoy.getTimezoneOffset();
  return new Date(hoy.getTime() - (offset * 60 * 1000)).toISOString().split('T')[0];
}
 
/** Convierte 'YYYY-MM-DD' a un objeto Date en horario local (evita el desfase de usar `new Date('YYYY-MM-DD')`, que interpreta la fecha en UTC). */
function parsearFechaLocal(fechaStr) {
  if (!fechaStr) return null;
  const partes = fechaStr.split('-');
  if (partes.length !== 3) return null;
  return new Date(Number(partes[0]), Number(partes[1]) - 1, Number(partes[2]));
}
 
const DIAS_SEMANA = {
  es: ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'],
  gl: ['domingo', 'luns', 'martes', 'mércores', 'xoves', 'venres', 'sábado'],
  en: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
};
 
const MESES = {
  es: ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'],
  gl: ['xaneiro', 'febreiro', 'marzo', 'abril', 'maio', 'xuño', 'xullo', 'agosto', 'setembro', 'outubro', 'novembro', 'decembro'],
  en: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
};
 
// ------------------------------------------------------------
// Festivos y jornada teórica (compartido por app.js, informes.js y Semana.js)
// ------------------------------------------------------------
 
// Festivos oficiales de Ferrol: nacionales + autonómicos + locales.
// IMPORTANTE: añadir aquí la lista de cada año nuevo en cuanto el
// Ayuntamiento/Xunta la publiquen (normalmente a finales del año anterior).
// Mientras un año no tenga lista, esFestivo() devuelve false para esas
// fechas y la app funciona igual, solo que sin descontar festivos ese año.
const FESTIVOS_FERROL = {
  2026: [
    '2026-01-01', '2026-01-06', '2026-01-07', '2026-03-19', '2026-04-02',
    '2026-04-03', '2026-04-06', '2026-05-01', '2026-06-24', '2026-07-25',
    '2026-08-15', '2026-10-12', '2026-12-08', '2026-12-25'
  ]
  // 2027: [ ... ] — pendiente de publicación oficial (ver aviso en el chat)
};
 
/** ¿Es 'fechaStr' (YYYY-MM-DD) festivo en Ferrol? Devuelve false si ese año aún no está cargado. */
function esFestivo(fechaStr) {
  if (!fechaStr) return false;
  const anio = Number(fechaStr.split('-')[0]);
  const lista = FESTIVOS_FERROL[anio];
  return !!lista && lista.includes(fechaStr);
}
 
/** Jornada de verano: del 1 de julio al 31 de agosto. */
function esVerano(fechaStr) {
  const fecha = parsearFechaLocal(fechaStr);
  if (!fecha) return false;
  const mes = fecha.getMonth() + 1;
  return mes === 7 || mes === 8;
}
 
/**
 * Minutos de jornada teórica para una fecha 'YYYY-MM-DD'.
 * - Festivo o fin de semana: 0
 * - Verano (1 jul - 31 ago): 07:00 todos los días laborables, viernes incluido
 * - Resto del año (1 sep - 30 jun): 08:30 de lunes a jueves, 07:00 el viernes
 */
function obtenerJornadaTeoricaMinutos(fechaStr) {
  const fecha = parsearFechaLocal(fechaStr);
  if (!fecha) return 0;
  if (esFestivo(fechaStr)) return 0;
 
  const diaSemana = fecha.getDay();
  if (diaSemana === 0 || diaSemana === 6) return 0;
  if (esVerano(fechaStr)) return 420;   // Verano: 7h 00m (todos los días, viernes incluido)
  if (diaSemana === 5) return 420;      // Viernes (resto del año): 7h 00m
  return 510;                           // Lunes a Jueves: 8h 30m
}
 
/**
 * Minutos de descanso (comida) a descontar de las horas realmente
 * trabajadas: lunes a jueves, del 1 de septiembre al 30 de junio: 30 min.
 * Viernes (todo el año) y jornada de verano (cualquier día): 0 min.
 */
function obtenerDescansoMinutos(fechaStr) {
  if (esVerano(fechaStr)) return 0;
  const fecha = parsearFechaLocal(fechaStr);
  if (!fecha) return 0;
  const diaSemana = fecha.getDay();
  return (diaSemana >= 1 && diaSemana <= 4) ? 30 : 0;
}