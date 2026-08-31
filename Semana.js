// SUPABASE_URL, SUPABASE_KEY, supabaseClient, obtenerMinutosDuracion,
// formatearMinutosAHoras, toggleTheme y cerrarPestana viven en config.js.
// TABLA ('obras') no se usa en esta página: esta usa su propia tabla.
const TABLA_SEMANAL = 'jornada_semanal';

// Festivos oficiales de Ferrol 2026 (nacionales + autonómicos + locales)
const FESTIVOS_FERROL_2026 = [
  '2026-01-01', '2026-01-06', '2026-01-07', '2026-03-19', '2026-04-02',
  '2026-04-03', '2026-04-06', '2026-05-01', '2026-06-24', '2026-07-25',
  '2026-08-15', '2026-10-12', '2026-12-08', '2026-12-25'
];

let idiomaActual = 'es';
let lunesActual = null;
let diasSemanaActual = [];

const DIAS_CORTOS = {
  es: ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'],
  gl: ['Luns', 'Martes', 'Mércores', 'Xoves', 'Venres'],
  en: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']
};

const MESES = {
  es: ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'],
  gl: ['xaneiro', 'febreiro', 'marzo', 'abril', 'maio', 'xuño', 'xullo', 'agosto', 'setembro', 'outubro', 'novembro', 'decembro'],
  en: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
};

const TEXTOS_SEMANA = {
  es: {
    titulo: '📅 Resumen Semanal', cerrar: '❌ Cerrar', thFecha: 'Fecha', thDia: 'Día', thEntrada: 'Entrada', thSalida: 'Salida',
    thTeorica: 'Jornada Teórica', thDuracion: 'Duración', anterior: '◀ Semana anterior', actual: 'Semana actual', siguiente: 'Semana siguiente ▶',
    teoricasSemana: 'Horas teóricas semana', totalesLunesJueves: 'Horas totales semana (lunes-jueves)',
    pendienteViernes: 'Horas pendientes hasta viernes', salidaViernesPrevista: 'Hora salida viernes (prevista)',
    pendiente: 'Pendiente', guardar: 'Guardar', erroCampos: 'Introduce hora de entrada y hora de salida.',
    erroOrden: 'La hora de salida debe ser posterior a la de entrada.', erroGuardar: 'Error al guardar: '
  },
  gl: {
    titulo: '📅 Resumo Semanal', cerrar: '❌ Pechar', thFecha: 'Data', thDia: 'Día', thEntrada: 'Entrada', thSalida: 'Saída',
    thTeorica: 'Xornada Teórica', thDuracion: 'Duración', anterior: '◀ Semana anterior', actual: 'Semana actual', siguiente: 'Semana seguinte ▶',
    teoricasSemana: 'Horas teóricas semana', totalesLunesJueves: 'Horas totais semana (luns-xoves)',
    pendienteViernes: 'Horas pendentes ata venres', salidaViernesPrevista: 'Hora saída venres (prevista)',
    pendiente: 'Pendente', guardar: 'Gardar', erroCampos: 'Introduce hora de entrada e hora de saída.',
    erroOrden: 'A hora de saída debe ser posterior á de entrada.', erroGuardar: 'Erro ao gardar: '
  },
  en: {
    titulo: '📅 Weekly Summary', cerrar: '❌ Close', thFecha: 'Date', thDia: 'Day', thEntrada: 'Start', thSalida: 'End',
    thTeorica: 'Theoretical Shift', thDuracion: 'Duration', anterior: '◀ Previous Week', actual: 'Current Week', siguiente: 'Next Week ▶',
    teoricasSemana: 'Weekly Theoretical Hours', totalesLunesJueves: 'Total Hours (Mon-Thu)',
    pendienteViernes: 'Hours Pending Until Friday', salidaViernesPrevista: 'Friday End Time (estimated)',
    pendiente: 'Pending', guardar: 'Save', erroCampos: 'Enter both start and end time.',
    erroOrden: 'End time must be later than start time.', erroGuardar: 'Error saving: '
  }
};

function formatearFechaISO(fecha) {
  const yyyy = fecha.getFullYear();
  const mm = String(fecha.getMonth() + 1).padStart(2, '0');
  const dd = String(fecha.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

function formatearFechaDDMMYYYY(fecha) {
  const dd = String(fecha.getDate()).padStart(2, '0');
  const mm = String(fecha.getMonth() + 1).padStart(2, '0');
  const yyyy = fecha.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
}

/** Lunes de la semana (lunes-domingo) que contiene 'fecha'. */
function obtenerLunes(fecha) {
  const diaSemana = fecha.getDay() === 0 ? 7 : fecha.getDay();
  return new Date(fecha.getFullYear(), fecha.getMonth(), fecha.getDate() - (diaSemana - 1));
}

function esFestivo(fecha) {
  return FESTIVOS_FERROL_2026.includes(formatearFechaISO(fecha));
}

/** Jornada de verano: del 1 de julio al 31 de agosto. */
function esVerano(fecha) {
  const mes = fecha.getMonth() + 1;
  return mes === 7 || mes === 8;
}

/**
 * Minutos de jornada teórica para un día concreto.
 * - Festivo o fin de semana: 0
 * - Verano (jul-ago): 07:00 todos los días laborables (incluido viernes)
 * - Resto del año (1 sep - 30 jun): 08:30 de lunes a jueves, 07:00 el viernes
 */
function jornadaTeoricaDiaMinutos(fecha) {
  if (esFestivo(fecha)) return 0;
  const diaSemana = fecha.getDay();
  if (diaSemana === 0 || diaSemana === 6) return 0;
  if (esVerano(fecha)) return 420;
  if (diaSemana === 5) return 420;
  return 510;
}

/**
 * Minutos a descontar de la jornada real por comida/descanso:
 * - Lunes a jueves, del 1 de sept al 30 de jun: -30 min (comida)
 * - Viernes (todo el año) y jornada de verano (cualquier día): 0 min
 *   (el descanso de 20 min por convenio no se resta, es retribuido)
 */
function obtenerMinutosDescuento(fecha) {
  if (esVerano(fecha)) return 0;
  const diaSemana = fecha.getDay();
  if (diaSemana >= 1 && diaSemana <= 4) return 30;
  return 0;
}

function calcularDuracionEfectivaMin(horainicio, horafin, fecha) {
  const bruto = obtenerMinutosDuracion(horainicio, horafin);
  const descuento = obtenerMinutosDescuento(fecha);
  return Math.max(0, bruto - descuento);
}

/** Convierte 'HH:MM' (con signo opcional) a minutos totales. */
function parsearDuracionAMinutos(str) {
  if (!str || !str.includes(':')) return 0;
  const negativo = str.trim().startsWith('-');
  const limpio = negativo ? str.trim().slice(1) : str.trim();
  const [hh, mm] = limpio.split(':').map(Number);
  const total = (hh || 0) * 60 + (mm || 0);
  return negativo ? -total : total;
}

/** Suma minutos (puede ser negativo) a una hora 'HH:MM', con vuelta de 24h. */
function sumarMinutosAHora(horaStr, minutosExtra) {
  const [h, m] = horaStr.split(':').map(Number);
  let total = h * 60 + m + minutosExtra;
  total = ((total % 1440) + 1440) % 1440;
  const hh = String(Math.floor(total / 60)).padStart(2, '0');
  const mm = String(total % 60).padStart(2, '0');
  return `${hh}:${mm}`;
}

/** Número de semana ISO-8601 (la semana pertenece al año de su jueves). */
function obtenerNumeroSemanaISO(fecha) {
  const d = new Date(Date.UTC(fecha.getFullYear(), fecha.getMonth(), fecha.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
}

function actualizarEncabezadoSemana() {
  const lunes = diasSemanaActual[0];
  const viernes = diasSemanaActual[4];
  const numSemana = obtenerNumeroSemanaISO(lunes);
  const meses = MESES[idiomaActual];

  const d1 = lunes.getDate();
  const m1 = meses[lunes.getMonth()];
  const d2 = viernes.getDate();
  const m2 = meses[viernes.getMonth()];
  const anio = viernes.getFullYear();

  let texto;
  if (idiomaActual === 'gl') {
    texto = `Semana ${numSemana} — semana do ${d1} de ${m1} ao ${d2} de ${m2} de ${anio}`;
  } else if (idiomaActual === 'en') {
    texto = `Week ${numSemana} — week of ${m1} ${d1} to ${m2} ${d2}, ${anio}`;
  } else {
    texto = `Semana ${numSemana} — semana del ${d1} de ${m1} al ${d2} de ${m2} de ${anio}`;
  }

  document.getElementById('txt-rango-semana').textContent = texto;
}

async function cargarSemana(lunes) {
  lunesActual = lunes;

  diasSemanaActual = [];
  for (let i = 0; i < 5; i++) {
    diasSemanaActual.push(new Date(lunes.getFullYear(), lunes.getMonth(), lunes.getDate() + i));
  }

  actualizarEncabezadoSemana();

  const desdeStr = formatearFechaISO(diasSemanaActual[0]);
  const hastaStr = formatearFechaISO(diasSemanaActual[4]);

  const registrosPorFecha = {};
  if (supabaseClient) {
    const { data, error } = await supabaseClient
      .from(TABLA_SEMANAL)
      .select('*')
      .gte('fecha', desdeStr)
      .lte('fecha', hastaStr);

    if (!error && data) {
      data.forEach(r => {
        let f = String(r.fecha).trim();
        if (f.includes('T')) f = f.split('T')[0];
        registrosPorFecha[f] = r;
      });
    } else if (error) {
      console.error('Error al cargar jornada_semanal:', error);
    }
  }

  const t = TEXTOS_SEMANA[idiomaActual];
  const nombresDias = DIAS_CORTOS[idiomaActual];

  const filas = diasSemanaActual.map((fecha, idx) => {
    const fechaStr = formatearFechaISO(fecha);
    const registro = registrosPorFecha[fechaStr];
    const entradaVal = registro ? registro.horainicio : '';
    const salidaVal = registro ? registro.horafin : '';
    const duracionVal = registro ? registro.duracion : '00:00';
    const festivo = esFestivo(fecha);
    const esViernes = idx === 4;
    const disabledEntrada = festivo ? 'disabled' : '';
    const disabledSalida = (festivo || esViernes) ? 'disabled' : '';
    const disabledBoton = festivo ? 'disabled' : '';

    return `
      <tr class="fila-dia-editable ${esViernes ? 'fila-viernes' : ''} ${festivo ? 'fila-festivo' : ''}">
        <td>${formatearFechaDDMMYYYY(fecha)}</td>
        <td>${nombresDias[idx]}</td>
        <td><input type="time" id="entrada-${idx}" value="${entradaVal}" onchange="actualizarDuracionFila(${idx})" ${disabledEntrada}></td>
        <td><input type="time" id="salida-${idx}" value="${salidaVal}" onchange="actualizarDuracionFila(${idx})" ${disabledSalida}></td>
        <td>${formatearMinutosAHoras(jornadaTeoricaDiaMinutos(fecha))}</td>
        <td id="duracion-${idx}">${duracionVal}</td>
        <td><button class="btn-guardar-dia" onclick="guardarJornada(${idx})" title="${t.guardar}" ${disabledBoton}>💾</button></td>
      </tr>
    `;
  });

  const tbody = document.getElementById('tabla-semana-body');
  tbody.innerHTML = filas.join('') + `
    <tr class="fila-resumen">
      <td colspan="6">${t.teoricasSemana}</td>
      <td id="valor-teoricas">00:00</td>
    </tr>
    <tr class="fila-resumen">
      <td colspan="6">${t.totalesLunesJueves}</td>
      <td id="valor-totales">00:00</td>
    </tr>
    <tr class="fila-resumen fila-pendiente">
      <td colspan="6">${t.pendienteViernes}</td>
      <td id="valor-pendiente">00:00</td>
    </tr>
    <tr class="fila-resumen fila-salida-prevista">
      <td colspan="6">${t.salidaViernesPrevista}</td>
      <td id="valor-salida-prevista">-</td>
    </tr>
  `;

  actualizarResumenSemana();
}

function actualizarDuracionFila(idx) {
  const entrada = document.getElementById(`entrada-${idx}`).value;
  const salida = document.getElementById(`salida-${idx}`).value;
  const fecha = diasSemanaActual[idx];
  const el = document.getElementById(`duracion-${idx}`);

  el.textContent = (entrada && salida)
    ? formatearMinutosAHoras(calcularDuracionEfectivaMin(entrada, salida, fecha))
    : '00:00';

  actualizarResumenSemana();
}

/**
 * Minutos estimados de un día lunes-jueves para la PREVISIÓN de salida del
 * viernes: si ya se rellenaron entrada/salida ese día, usa la duración real;
 * si aún no se ha registrado, asume su jornada teórica (08:30 o 07:00).
 */
function obtenerMinutosEstimadosDia(idx) {
  const entrada = document.getElementById(`entrada-${idx}`).value;
  const salida = document.getElementById(`salida-${idx}`).value;
  const fecha = diasSemanaActual[idx];

  if (entrada && salida) {
    return calcularDuracionEfectivaMin(entrada, salida, fecha);
  }
  return jornadaTeoricaDiaMinutos(fecha);
}

function actualizarResumenSemana() {
  const t = TEXTOS_SEMANA[idiomaActual];

  let teoricoTotalMin = 0;
  diasSemanaActual.forEach(fecha => {
    teoricoTotalMin += jornadaTeoricaDiaMinutos(fecha);
  });

  let totalesLunesJueves = 0;
  let estimadoLunesJueves = 0;
  for (let i = 0; i < 4; i++) {
    totalesLunesJueves += parsearDuracionAMinutos(document.getElementById(`duracion-${i}`).textContent);
    estimadoLunesJueves += obtenerMinutosEstimadosDia(i);
  }

  const pendienteMin = teoricoTotalMin - totalesLunesJueves;
  const pendienteEstimadoMin = teoricoTotalMin - estimadoLunesJueves;

  const entradaViernes = document.getElementById('entrada-4').value;
  const salidaPrevista = entradaViernes
    ? sumarMinutosAHora(entradaViernes, Math.max(0, pendienteEstimadoMin))
    : t.pendiente;

  document.getElementById('valor-teoricas').textContent = formatearMinutosAHoras(teoricoTotalMin);
  document.getElementById('valor-totales').textContent = formatearMinutosAHoras(totalesLunesJueves);
  document.getElementById('valor-pendiente').textContent = formatearMinutosAHoras(pendienteMin);
  document.getElementById('valor-salida-prevista').textContent = salidaPrevista;
}

async function guardarJornada(idx) {
  const t = TEXTOS_SEMANA[idiomaActual];
  const fecha = diasSemanaActual[idx];
  const fechaStr = formatearFechaISO(fecha);
  const entrada = document.getElementById(`entrada-${idx}`).value;
  let salida;

  if (idx === 4) {
    // El viernes no se introduce a mano: se toma de "Hora salida viernes (prevista)"
    const salidaCalculada = document.getElementById('valor-salida-prevista').textContent;
    if (!entrada || !salidaCalculada || salidaCalculada === t.pendiente) {
      alert(t.erroCampos);
      return;
    }
    salida = salidaCalculada;
  } else {
    salida = document.getElementById(`salida-${idx}`).value;
    if (!entrada || !salida) {
      alert(t.erroCampos);
      return;
    }
    if (salida <= entrada) {
      alert(t.erroOrden);
      return;
    }
  }

  const duracionStr = formatearMinutosAHoras(calcularDuracionEfectivaMin(entrada, salida, fecha));

  const registro = {
    fecha: fechaStr,
    dia: DIAS_CORTOS[idiomaActual][idx],
    horainicio: entrada,
    horafin: salida,
    duracion: duracionStr
  };

  const { error } = await supabaseClient
    .from(TABLA_SEMANAL)
    .upsert(registro, { onConflict: 'fecha' });

  if (error) {
    alert(t.erroGuardar + error.message);
    return;
  }

  document.getElementById(`duracion-${idx}`).textContent = duracionStr;
  if (idx === 4) {
    document.getElementById('salida-4').value = salida;
  }
  actualizarResumenSemana();
}

function cambiarSemana(direccion) {
  const nuevoLunes = (direccion === 0)
    ? obtenerLunes(new Date())
    : new Date(lunesActual.getFullYear(), lunesActual.getMonth(), lunesActual.getDate() + direccion * 7);

  cargarSemana(nuevoLunes);
}

function cambiarIdioma(lang) {
  idiomaActual = lang;
  const t = TEXTOS_SEMANA[lang];

  document.getElementById('txt-titulo').textContent = t.titulo;
  document.getElementById('btn-cerrar').textContent = t.cerrar;
  document.getElementById('th-fecha').textContent = t.thFecha;
  document.getElementById('th-dia').textContent = t.thDia;
  document.getElementById('th-entrada').textContent = t.thEntrada;
  document.getElementById('th-salida').textContent = t.thSalida;
  document.getElementById('th-teorica').textContent = t.thTeorica;
  document.getElementById('th-duracion').textContent = t.thDuracion;
  document.getElementById('btn-anterior').textContent = t.anterior;
  document.getElementById('btn-actual').textContent = t.actual;
  document.getElementById('btn-siguiente').textContent = t.siguiente;

  if (lunesActual) cargarSemana(lunesActual);
}

document.addEventListener('DOMContentLoaded', () => {
  cargarSemana(obtenerLunes(new Date()));
});
