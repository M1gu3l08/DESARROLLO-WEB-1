// variables y arrays
const proyectos = [];
const participantes = [];

// Helper: selecciona main
const contenedor = document.querySelector('main');

// Cargar vista HTML por fetch
function cargarvista(vista) {
    fetch(`vistas/${vista}.html`)
        .then(res => res.text())
        .then(html => {
            contenedor.innerHTML = html;
            Inicializarvista(vista);       // inicializa la lógica de esa vista
        })
        .catch(console.error);
}

// Inicializar listeners tras cargar la vista
function Inicializarvista(vista) {
    // Vista crearProyecto
    if (vista === 'crearProyecto') {
        const form = document.querySelector('form');
        form.addEventListener('submit', e => { // al enviar el formulario
            e.preventDefault(); // evitar recarga
            const dto = {
                id: form.idProyecto.value,
                nombre: form.nombre.value,
                descripcion: form.descripcion.value,
                fechaInicio: form.fechaInicio.value,
                fechaFinal: form.fechaFinal.value,
                valor: Number(form.valor.value)
            };
            proyectos.push(dto);                  // guardamos en el arreglo
            console.log('Proyectos:', proyectos);
            form.reset();
            alert('Proyecto creado');
        });
    }

    // Vista listadodeproyectos
    if (vista === 'listadodeproyectos') {
        const tabla = document.querySelector('#tablaProyectos');

        // Limpia la tabla antes de llenarla
        tabla.innerHTML = '';

        // Verifica si hay proyectos
        if (proyectos.length === 0) {
            tabla.innerHTML = `
      <tr>
        <td colspan="4" class="text-center p-4 text-gray-500">No hay proyectos registrados.</td>
      </tr>
    `;
            return;
        }

        // Genera las filas de la tabla
        proyectos.forEach(proyecto => {
            const fila = document.createElement('tr');
            fila.innerHTML = `
      <td class="border p-2">${proyecto.id}</td>
      <td class="border p-2">${proyecto.nombre}</td>
      <td class="border p-2">${proyecto.descripcion}</td>
      <td class="border p-2">${proyecto.fechaInicio}</td>
      <td class="border p-2">${proyecto.fechaFinal}</td>
      <td class="border p-2">$${proyecto.valor.toLocaleString()}</td>
    `;
            tabla.appendChild(fila);
        });

    }

    // Vista BuscarProyecto
    if (vista === 'buscarproyecto') {
        const inputBusqueda = document.querySelector('#idProyecto');
        const btnBuscar = document.querySelector('#botonBuscar');
        const resultado = document.querySelector('#resultado');

        btnBuscar.addEventListener('click', e => {
            e.preventDefault(); // Evita la recarga de la página

            const idBuscado = inputBusqueda.value.trim();
            const proyecto = proyectos.find(p => p.id === idBuscado);

            if (proyecto) {
                resultado.innerHTML = `
        <div class="p-4 border rounded shadow-sm bg-green-50">
          <h3 class="text-lg font-semibold text-gray-800">Proyecto encontrado</h3>
          <p><strong>ID:</strong> ${proyecto.id}</p>
          <p><strong>Nombre:</strong> ${proyecto.nombre}</p>
          <p><strong>Descripción:</strong> ${proyecto.descripcion}</p>
          <p><strong>Fecha Inicio:</strong> ${proyecto.fechaInicio}</p>
          <p><strong>Fecha Final:</strong> ${proyecto.fechaFinal}</p>
          <p><strong>Valor:</strong> $${proyecto.valor}</p>
        </div>
      `;
            } else {
                resultado.innerHTML = `
        <div class="p-4 border rounded shadow-sm bg-red-100 text-red-700">
          No se encontró un proyecto con ese ID.
        </div>
      `;
            }
        });
    }

    // Vista crearParticipante
    


}

// Configuracion de la barra lateral
document.querySelectorAll('aside nav a').forEach(a => {
    a.addEventListener('click', e => {
        e.preventDefault();
        const view = a.dataset.view;
        cargarvista(view);
    });
});

// Al inicio carga con la vista por defecto
cargarvista('crearProyecto');