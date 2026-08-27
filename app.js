// Guardar tarea desde formulario con validación visual
document.getElementById('task-form').addEventListener('submit', (e) => {
  e.preventDefault();

  // 1. Definir los campos que son estrictamente obligatorios
  const camposObligatorios = ['fecha', 'tarea', 'proyecto', 'hora-inicio', 'hora-fin'];
  let formularioValido = true;

  // 2. Comprobar cada campo obligatorio
  camposObligatorios.forEach(id => {
    const elemento = document.getElementById(id);
    
    // Limpiar el estilo de error previo (si lo hubiera)
    elemento.classList.remove('border-red-500', 'bg-red-50');
    
    if (!elemento.value.trim()) {
      // Si está vacío, aplicar estilos de error (borde y fondo rojo claro)
      elemento.classList.add('border-red-500', 'bg-red-50');
      formularioValido = false;
    }
  });

  // Si falta algún campo obligatorio, mostramos alerta y detenemos el guardado
  if (!formularioValido) {
    alert("Por favor, rellena los campos resaltados en rojo antes de guardar.");
    return; // Sale de la función sin guardar
  }

  // 3. Si todo es correcto, procedemos a guardar
  const nuevaTarea = {
    fecha: document.getElementById('fecha').value,
    tarea: document.getElementById('tarea').value,
    proyecto: document.getElementById('proyecto').value,
    bloque: document.getElementById('bloque').value,
    horaInicio: document.getElementById('hora-inicio').value,
    horaFin: document.getElementById('hora-fin').value,
    comentario: document.getElementById('comentario').value,
    notas: document.getElementById('notas').value,
    duracion: document.getElementById('duracion').value
  };

  tareas.push(nuevaTarea);
  
  const horaFinActual = nuevaTarea.horaFin;

  // Limpiar campos no persistentes y restaurar estilos originales
  document.getElementById('comentario').value = '';
  document.getElementById('notas').value = '';
  document.getElementById('hora-fin').value = '';
  document.getElementById('duracion').value = '';
  
  camposObligatorios.forEach(id => {
      document.getElementById(id).classList.remove('border-red-500', 'bg-red-50');
  });
  
  if (horaFinActual) {
    document.getElementById('hora-inicio').value = horaFinActual;
  }

  renderTabla();
  updateChart();
});

// Evento extra: Quitar el resaltado rojo en cuanto el usuario empiece a escribir en un campo con error
document.querySelectorAll('#task-form input, #task-form select').forEach(elemento => {
  elemento.addEventListener('input', function() {
    this.classList.remove('border-red-500', 'bg-red-50');
  });
});