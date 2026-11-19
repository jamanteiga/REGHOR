// SUPABASE_URL, SUPABASE_KEY, supabaseClient, TABLA, toggleTheme,
// cerrarPestana, parsearFechaLocal, DIAS_SEMANA, obtenerFechaHoyISO,
// obtenerFestivosGuardados, guardarFestivosGuardados, obtenerFestivosAnio,
// obtenerAniosConFestivos, FESTIVOS_FERROL_DEFECTO y sembrarFestivosPorDefecto
// viven en config.js.

let idiomaActualFestivos = 'es';
let anioActualFestivos = null;
let fechaEnEdicion = null; // fecha (clave) de la fila actualmente en modo edición, o null

// Solo español y gallego, igual que el resto de páginas nuevas de REGHOR
// (gantt.html) -pedido explícitamente, sin inglés-.
const TEXTOS_FESTIVOS = {
  es: {
    titulo: '🎌 Festivos', cerrar: '❌ Cerrar',
    avisoInfo: 'Estos son los días que la app considera no laborables (jornada teórica 0h) en los balances de horas. Vienen precargados con los festivos de Ferrol, Galicia y España de 2026; puedes editarlos o añadir los de años siguientes en cuanto se publiquen.',
    anio: 'Año', anadirAnio: '➕ Año nuevo', restaurar: '↺ Restaurar valores por defecto',
    colFecha: 'Fecha', colDia: 'Día', colNombre: 'Nombre',
    nuevaFecha: 'Fecha', nuevoNombre: 'Nombre', placeholderNombre: 'p.ej. San Xoán',
    anadirFestivo: '➕ Añadir festivo',
    vacio: 'No hay festivos configurados para este año todavía. Añade el primero con el formulario de abajo.',
    editar: 'Editar', borrar: 'Borrar', guardar: 'Guardar', cancelar: 'Cancelar',
    confirmarBorrar: '¿Borrar este festivo?',
    confirmarRestaurar: 'Esto sustituirá los festivos del año {anio} por los valores por defecto de REGHOR (si los hay para ese año). ¿Continuar?',
    sinDefectoParaAnio: 'No hay una lista por defecto de REGHOR para el año {anio}; solo se pueden restaurar los años con valores precargados (2026).',
    pideAnio: 'Año a añadir (4 dígitos):',
    anioInvalido: 'Introduce un año válido de 4 dígitos.',
    anioYaExiste: 'Ese año ya está en la lista.',
    faltaFecha: 'Elige una fecha.',
    faltaNombre: 'Escribe un nombre para el festivo.',
    fechaDuplicada: 'Ya hay un festivo guardado en esa fecha.'
  },
  gl: {
    titulo: '🎌 Festivos', cerrar: '❌ Pechar',
    avisoInfo: 'Estes son os días que a app considera non laborables (xornada teórica 0h) nos balances de horas. Veñen precargados cos festivos de Ferrol, Galicia e España de 2026; podes editalos ou engadir os de anos seguintes en canto se publiquen.',
    anio: 'Ano', anadirAnio: '➕ Ano novo', restaurar: '↺ Restaurar valores por defecto',
    colFecha: 'Data', colDia: 'Día', colNombre: 'Nome',
    nuevaFecha: 'Data', nuevoNombre: 'Nome', placeholderNombre: 'p.ex. San Xoán',
    anadirFestivo: '➕ Engadir festivo',
    vacio: 'Non hai festivos configurados para este ano aínda. Engade o primeiro co formulario de abaixo.',
    editar: 'Editar', borrar: 'Borrar', guardar: 'Gardar', cancelar: 'Cancelar',
    confirmarBorrar: '¿Borrar este festivo?',
    confirmarRestaurar: 'Isto substituirá os festivos do ano {anio} polos valores por defecto de REGHOR (se os hai para ese ano). ¿Continuar?',
    sinDefectoParaAnio: 'Non hai unha lista por defecto de REGHOR para o ano {anio}; só se poden restaurar os anos con valores precargados (2026).',
    pideAnio: 'Ano a engadir (4 díxitos):',
    anioInvalido: 'Introduce un ano válido de 4 díxitos.',
    anioYaExiste: 'Ese ano xa está na lista.',
    faltaFecha: 'Escolle unha data.',
    faltaNombre: 'Escribe un nome para o festivo.',
    fechaDuplicada: 'Xa hai un festivo gardado nesa data.'
  }
};

function t(clave) {
  return TEXTOS_FESTIVOS[idiomaActualFestivos][clave];
}

function cambiarIdiomaFestivos(lang) {
  idiomaActualFestivos = lang;
  const tx = TEXTOS_FESTIVOS[lang];

  document.getElementById('txt-titulo').textContent = tx.titulo;
  document.getElementById('btn-cerrar').textContent = tx.cerrar;
  document.getElementById('txt-aviso-info').textContent = tx.avisoInfo;
  document.getElementById('lbl-anio').textContent = tx.anio;
  document.getElementById('btn-anadir-anio').textContent = tx.anadirAnio;
  document.getElementById('btn-restaurar').textContent = tx.restaurar;
  document.getElementById('col-fecha').textContent = tx.colFecha;
  document.getElementById('col-dia').textContent = tx.colDia;
  document.getElementById('col-nombre').textContent = tx.colNombre;
  document.getElementById('lbl-nueva-fecha').textContent = tx.nuevaFecha;
  document.getElementById('lbl-nuevo-nombre').textContent = tx.nuevoNombre;
  document.getElementById('campo-nombre').placeholder = tx.placeholderNombre;
  document.getElementById('btn-anadir-festivo').textContent = tx.anadirFestivo;

  fechaEnEdicion = null;
  renderTablaFestivos();
}

document.addEventListener('DOMContentLoaded', () => {
  const anios = obtenerAniosConFestivos();
  const hoyAnio = Number(obtenerFechaHoyISO().split('-')[0]);
  anioActualFestivos = anios.includes(hoyAnio) ? hoyAnio : (anios[anios.length - 1] || hoyAnio);
  poblarSelectAnios();
  renderTablaFestivos();
});

function poblarSelectAnios() {
  const anios = obtenerAniosConFestivos();
  if (!anios.includes(anioActualFestivos)) anios.push(anioActualFestivos);
  anios.sort((a, b) => a - b);

  const select = document.getElementById('select-anio');
  select.innerHTML = '';
  anios.forEach(anio => {
    const opt = document.createElement('option');
    opt.value = String(anio);
    opt.textContent = String(anio);
    if (anio === anioActualFestivos) opt.selected = true;
    select.appendChild(opt);
  });
}

function cambiarAnioFestivos() {
  const select = document.getElementById('select-anio');
  anioActualFestivos = Number(select.value);
  fechaEnEdicion = null;
  renderTablaFestivos();
}

function anadirAnioFestivos() {
  const entrada = window.prompt(t('pideAnio'), String(new Date().getFullYear() + 1));
  if (entrada === null) return;
  const anio = Number(String(entrada).trim());
  if (!Number.isInteger(anio) || anio < 1000 || anio > 9999) {
    alert(t('anioInvalido'));
    return;
  }
  const datos = obtenerFestivosGuardados();
  if (datos[String(anio)]) {
    alert(t('anioYaExiste'));
    anioActualFestivos = anio;
    poblarSelectAnios();
    renderTablaFestivos();
    return;
  }
  datos[String(anio)] = [];
  guardarFestivosGuardados(datos);
  anioActualFestivos = anio;
  poblarSelectAnios();
  renderTablaFestivos();
}

function restaurarFestivosDefecto() {
  const anioStr = String(anioActualFestivos);
  if (!FESTIVOS_FERROL_DEFECTO[anioStr] && !FESTIVOS_FERROL_DEFECTO[anioActualFestivos]) {
    alert(t('sinDefectoParaAnio').replace('{anio}', anioStr));
    return;
  }
  if (!confirm(t('confirmarRestaurar').replace('{anio}', anioStr))) return;

  const datos = obtenerFestivosGuardados();
  const listaDefecto = FESTIVOS_FERROL_DEFECTO[anioStr] || FESTIVOS_FERROL_DEFECTO[anioActualFestivos];
  datos[anioStr] = listaDefecto.map(f => ({ fecha: f.fecha, nombre: f.nombre }));
  guardarFestivosGuardados(datos);
  fechaEnEdicion = null;
  renderTablaFestivos();
}

function nombreDiaSemana(fechaStr) {
  const fecha = parsearFechaLocal(fechaStr);
  if (!fecha) return '';
  const dias = DIAS_SEMANA[idiomaActualFestivos] || DIAS_SEMANA.es;
  return dias[fecha.getDay()];
}

function renderTablaFestivos() {
  const lista = obtenerFestivosAnio(anioActualFestivos);
  const tabla = document.getElementById('tabla-festivos');
  const vacio = document.getElementById('festivos-vacio');
  const cuerpo = document.getElementById('cuerpo-festivos');
  cuerpo.innerHTML = '';

  if (lista.length === 0) {
    tabla.style.display = 'none';
    vacio.style.display = 'block';
    vacio.textContent = t('vacio');
    return;
  }
  vacio.style.display = 'none';
  tabla.style.display = 'table';

  lista.forEach(festivo => {
    const fila = document.createElement('tr');

    if (fechaEnEdicion === festivo.fecha) {
      fila.appendChild(crearCeldaEdicionFecha(festivo));
      fila.appendChild(crearCeldaSoloTexto(''));
      fila.appendChild(crearCeldaEdicionNombre(festivo));
      fila.appendChild(crearCeldaAccionesEdicion(festivo));
    } else {
      fila.appendChild(crearCeldaSoloTexto(festivo.fecha, 'col-fecha'));
      fila.appendChild(crearCeldaSoloTexto(nombreDiaSemana(festivo.fecha), 'col-dia'));
      fila.appendChild(crearCeldaSoloTexto(festivo.nombre || ''));
      fila.appendChild(crearCeldaAcciones(festivo));
    }

    cuerpo.appendChild(fila);
  });
}

function crearCeldaSoloTexto(texto, claseExtra) {
  const td = document.createElement('td');
  if (claseExtra) td.className = claseExtra;
  td.textContent = texto;
  return td;
}

function crearCeldaEdicionFecha(festivo) {
  const td = document.createElement('td');
  td.className = 'col-fecha';
  const input = document.createElement('input');
  input.type = 'date';
  input.id = 'edicion-fecha';
  input.value = festivo.fecha;
  td.appendChild(input);
  return td;
}

function crearCeldaEdicionNombre(festivo) {
  const td = document.createElement('td');
  const input = document.createElement('input');
  input.type = 'text';
  input.id = 'edicion-nombre';
  input.maxLength = 80;
  input.value = festivo.nombre || '';
  input.style.width = '100%';
  td.appendChild(input);
  return td;
}

function crearCeldaAcciones(festivo) {
  const td = document.createElement('td');
  td.className = 'col-acciones';

  const btnEditar = document.createElement('button');
  btnEditar.className = 'btn-mini btn-mini-editar';
  btnEditar.textContent = t('editar');
  btnEditar.onclick = () => { fechaEnEdicion = festivo.fecha; renderTablaFestivos(); };

  const btnBorrar = document.createElement('button');
  btnBorrar.className = 'btn-mini btn-mini-borrar';
  btnBorrar.textContent = t('borrar');
  btnBorrar.onclick = () => eliminarFestivo(festivo.fecha);

  td.appendChild(btnEditar);
  td.appendChild(btnBorrar);
  return td;
}

function crearCeldaAccionesEdicion(festivo) {
  const td = document.createElement('td');
  td.className = 'col-acciones';

  const btnGuardar = document.createElement('button');
  btnGuardar.className = 'btn-mini btn-mini-guardar';
  btnGuardar.textContent = t('guardar');
  btnGuardar.onclick = () => guardarEdicionFestivo(festivo.fecha);

  const btnCancelar = document.createElement('button');
  btnCancelar.className = 'btn-mini btn-mini-cancelar';
  btnCancelar.textContent = t('cancelar');
  btnCancelar.onclick = () => { fechaEnEdicion = null; renderTablaFestivos(); };

  td.appendChild(btnGuardar);
  td.appendChild(btnCancelar);
  return td;
}

function guardarEdicionFestivo(fechaOriginal) {
  const nuevaFecha = document.getElementById('edicion-fecha').value;
  const nuevoNombre = document.getElementById('edicion-nombre').value.trim();

  if (!nuevaFecha) { alert(t('faltaFecha')); return; }
  if (!nuevoNombre) { alert(t('faltaNombre')); return; }

  const datos = obtenerFestivosGuardados();
  const anioOriginal = fechaOriginal.split('-')[0];
  const anioNuevo = nuevaFecha.split('-')[0];

  // Si la fecha cambia a otro día que ya tenga un festivo guardado (y no es
  // el mismo registro que se está editando), no se permite duplicar.
  const listaNuevoAnio = datos[anioNuevo] || [];
  const yaExiste = listaNuevoAnio.some(f => f.fecha === nuevaFecha && !(anioNuevo === anioOriginal && nuevaFecha === fechaOriginal));
  if (yaExiste) { alert(t('fechaDuplicada')); return; }

  // Quitar el festivo de su año original.
  datos[anioOriginal] = (datos[anioOriginal] || []).filter(f => f.fecha !== fechaOriginal);

  // Añadirlo (posiblemente en un año distinto) con los datos nuevos.
  if (!datos[anioNuevo]) datos[anioNuevo] = [];
  datos[anioNuevo].push({ fecha: nuevaFecha, nombre: nuevoNombre });

  guardarFestivosGuardados(datos);
  fechaEnEdicion = null;

  // Si el festivo se movió a otro año, seguimos viendo ese año para que la
  // edición quede visible en pantalla.
  if (anioNuevo !== anioOriginal) {
    anioActualFestivos = Number(anioNuevo);
    poblarSelectAnios();
  }
  renderTablaFestivos();
}

function eliminarFestivo(fecha) {
  if (!confirm(t('confirmarBorrar'))) return;
  const datos = obtenerFestivosGuardados();
  const anio = fecha.split('-')[0];
  datos[anio] = (datos[anio] || []).filter(f => f.fecha !== fecha);
  guardarFestivosGuardados(datos);
  if (fechaEnEdicion === fecha) fechaEnEdicion = null;
  renderTablaFestivos();
}

function anadirFestivo() {
  const fecha = document.getElementById('campo-fecha').value;
  const nombre = document.getElementById('campo-nombre').value.trim();

  if (!fecha) { alert(t('faltaFecha')); return; }
  if (!nombre) { alert(t('faltaNombre')); return; }

  const datos = obtenerFestivosGuardados();
  const anio = fecha.split('-')[0];
  if (!datos[anio]) datos[anio] = [];

  if (datos[anio].some(f => f.fecha === fecha)) {
    alert(t('fechaDuplicada'));
    return;
  }

  datos[anio].push({ fecha, nombre });
  guardarFestivosGuardados(datos);

  document.getElementById('campo-fecha').value = '';
  document.getElementById('campo-nombre').value = '';

  anioActualFestivos = Number(anio);
  poblarSelectAnios();
  renderTablaFestivos();
}
