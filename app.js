// ==========================================
// 1. CONFIGURACIÓN DE SUPABASE
// ==========================================
// Sustituye estos dos valores por las credenciales de tu proyecto
const SUPABASE_URL = 'https://TU-PROYECTO.supabase.co';
const SUPABASE_KEY = 'TU-ANON-KEY-PUBLICA';

const supabase = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
const TABLA = 'obras';

// Referencias a elementos de la interfaz (DOM)
const form = document.getElementById('tarea-form');
const tablaBody = document.getElementById('tabla-body');
const inputId = document.getElementById('tarea-id');
const btnGuardar = document.getElementById('btn-guardar');
const btnCancelar = document.getElementById('btn-cancelar');

// Inicialización de eventos al cargar la página
document.addEventListener('DOMContentLoaded', cargarTareas);
form.addEventListener('submit', guardarOActualizar);

// ==========================================
// 2. LÓGICA Y OPERACIONES CRUD
// ==========================================

/**
 * Consulta la base de datos y renderiza las filas en la tabla HTML.
 */
async function cargarTareas() {
  tablaBody.innerHTML = '<tr><td colspan="10">Cargando tareas...</td></tr>';
  
  const { data: tareas, error } = await supabase
    .from(TABLA)
    .select('*')
    .order('fecha', { ascending: false });

  if (error) {
    console.error('Error al cargar datos:', error.message);
    mostrarNotificacion('Error al cargar la lista de tareas: ' + error.message, true);
    tablaBody.innerHTML = '<tr><td colspan="10">Error al obtener los datos.</td></tr>';
    return;
  }

  if (!tareas || tareas.length === 0) {
    tablaBody.innerHTML = '<tr><td colspan="10">No hay tareas registradas.</td></tr>';
    return;
  }

  tablaBody.innerHTML = '';
  tareas.forEach(item => {
    const duracion = calcularDuracion(item.horainicio, item.horafin);
    const tr = document.createElement('tr');
    
    tr.innerHTML = `
      <td>${item.fecha || ''}</td>
      <td>${item.tarea || ''}</td>
      <td>${item.proyecto || ''}</td>
      <td>${item.bloque || ''}</td>
      <td>${item.horainicio || ''}</td>
      <td>${item.horafin || ''}</td>
      <td><strong>${duracion}</strong></td>
      <td>${item.comentario || ''}</td>
      <td>${item.notas || ''}</td>
      <td>
        <button class="btn-edit" onclick="prepararEdicion(${JSON.stringify(item).replace(/"/g, '&quot;')})">Editar</button>
        <button class="btn-delete" onclick="borrarTarea(${item.id})">Eliminar</button>
      </td>
    `;
    tablaBody.appendChild(tr);
  });
}

/**
 * Inserta un nuevo registro o actualiza uno existente según la presencia de un ID.
 */
async function guardarOActualizar(e) {
  e.preventDefault();

  const id = inputId.value;
  const registro = {
    fecha: document.getElementById('fecha').value,
    tarea: document.getElementById('tarea').value,
    proyecto: document.getElementById('proyecto').value,
    bloque: document.getElementById('bloque').value,
    horainicio: document.getElementById('horainicio').value,
    horafin: document.getElementById('horafin').value,
    comentario: document.getElementById('comentario').value,
    notas: document.getElementById('notas').value
  };

  let error;

  if (id) {
    // Modo Edición
    const res = await supabase.from(TABLA).update(registro).eq('id', id);
    error = res.error;
    if (!error) mostrarNotificacion('Registro actualizado correctamente.');
  } else {
    // Modo Inserción
    const res = await supabase.from(TABLA).insert([registro]);
    error = res.error;
    if (!error) mostrarNotificacion('Nuevo registro añadido correctamente.');
  }

  if (error) {
    mostrarNotificacion('Error al guardar: ' + error.message, true);
  } else {
    resetearFormulario();
    cargarTareas(); // Vuelve a consultar la base de datos para actualizar la vista
  }
}

/**
 * Vuelca los datos del registro seleccionado en el formulario para editarlo.
 */
function prepararEdicion(item) {
  inputId.value = item.id;
  document.getElementById('fecha').value = item.fecha || '';
  document.getElementById('tarea').value = item.tarea || '';
  document.getElementById('proyecto').value = item.proyecto || '';
  document.getElementById('bloque').value = item.bloque || '';
  document.getElementById('horainicio').value = item.horainicio || '';
  document.getElementById('horafin').value = item.horafin || '';
  document.getElementById('comentario').value = item.comentario || '';
  document.getElementById('notas').value = item.notas || '';

  btnGuardar.textContent = 'Actualizar Tarea';
  btnCancelar.style.display = 'inline-block';
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

/**
 * Elimina una fila por su ID tras confirmación del usuario.
 */
async function borrarTarea(id) {
  if (!confirm('¿Seguro que deseas eliminar esta tarea?')) return;

  const { error } = await supabase.from(TABLA).delete().eq('id', id);

  if (error) {
    mostrarNotificacion('Error al eliminar: ' + error.message, true);
  } else {
    mostrarNotificacion('Registro eliminado correctamente.');
    cargarTareas();
  }
}

/**
 * Restablece el formulario a su estado original para crear nuevos registros.
 */
function resetearFormulario() {
  form.reset();
  inputId.value = '';
  btnGuardar.textContent = 'Guardar Tarea';
  btnCancelar.style.display = 'none';
}

// ==========================================
// 3. FUNCIONES AUXILIARES
// ==========================================

/**
 * Muestra alertas dinámicas de éxito o error en la parte superior.
 */
function mostrarNotificacion(texto, esError = false) {
  const alerta = document.getElementById('mensaje-alerta');
  alerta.style.display = 'block';
  alerta.style.backgroundColor = esError ? '#f8d7da' : '#d4edda';
  alerta.style.color = esError ? '#721c24' : '#155724';
  alerta.style.border = esError ? '1px solid #f5c6cb' : '1px solid #c3e6cb';
  alerta.textContent = texto;

  setTimeout(() => {
    alerta.style.display = 'none';
  }, 3500);
}

/**
 * Calcula dinámicamente la diferencia en HH:MM entre inicio y fin para mostrarla en la tabla.
 */
function calcularDuracion(horaInicio, horaFin) {
  if (!horaInicio || !horaFin) return "00:00";
  
  const [hIni, mIni] = horaInicio.split(':').map(Number);
  const [hFin, mFin] = horaFin.split(':').map(Number);
  
  let minutosInicio = hIni * 60 + mIni;
  let minutosFin = hFin * 60 + mFin;
  
  let diferencia = minutosFin - minutosInicio;
  if (diferencia < 0) diferencia += 24 * 60; // Ajuste si la tarea cruza la medianoche

  const horas = Math.floor(diferencia / 60).toString().padStart(2, '0');
  const minutos = (diferencia % 60).toString().padStart(2, '0');
  
  return `${horas}:${minutos}`;
}