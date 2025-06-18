const API_URL = 'https://www.datos.gov.co/resource/b38q-zzgx.json';

// Seleccionar main para cambiar su contenido
const contenedor = document.querySelector('main');

// Cargar vista HTML usando fetch
function cargarvista(vista) {
    fetch(`vistas/${vista}.html`)
        .then(res => res.text())
        .then(html => {
            contenedor.innerHTML = html;
            Inicializarvista(vista);       // inicializa la lógica de esa vista
        })
        .catch(console.error);
}

// Inicializar listeners (oyente de evento) tras cargar la vista
async function Inicializarvista(vista) {

    // VISTA DE DATOS
    if (vista !== 'datos') return;
    
    const selectDepto = document.getElementById('iddepto');
    const selectMpio = document.getElementById('idmpio');
    const selectAnio = document.getElementById('año');
    const tablaBody = document.getElementById('tabladatos');

    try {
        const res = await axios.get(API_URL);
        const datos = res.data;

        // Extraer valores únicos
        const departamentos = [...new Set(datos.map(d => d.iddepto))].sort();
        const municipios = [...new Set(datos.map(d => d.nompio))].sort();
        const años = [...new Set(datos.map(d => d.a_o))].sort();

        // Llenar selects
        selectDepto.innerHTML += departamentos.map(d => `<option value="${d}">${d}</option>`).join('');
        selectMpio.innerHTML += municipios.map(m => `<option value="${m}">${m}</option>`).join('');
        selectAnio.innerHTML += años.map(a => `<option value="${a}">${a}</option>`).join('');

        // Escuchar cambios en filtros
        document.getElementById('filtros').addEventListener('change', () => {
            const depto = selectDepto.value;
            const mpio = selectMpio.value;
            const año = selectAnio.value;

            const filtrados = datos.filter(d =>
                (!depto || d.iddepto === depto) &&
                (!mpio || d.nompio === mpio) &&
                (!año || d.a_o === año)
            );

            // cargar tabla
            tablaBody.innerHTML = filtrados.map(d => `
                <tr class="hover:bg-gray-100">
                    <td class="px-4 py-2">${d.iddepto || ''}</td>
                    <td class="px-4 py-2">${d.nomdepto || ''}</td>
                    <td class="px-4 py-2">${d.idmpio || ''}</td>
                    <td class="px-4 py-2">${d.nompio || ''}</td>
                    <td class="px-4 py-2">${d.tiporegimen || ''}</td>
                    <td class="px-4 py-2">${d.tipopoblaci_n || ''}</td>
                    <td class="px-4 py-2">${d.a_o || ''}</td>
                    <td class="px-4 py-2">${d.mes || ''}</td>
                    <td class="px-4 py-2">${d.total || ''}</td>
                </tr>
            `).join('');
        });

        // resultados
        document.getElementById('filtros').dispatchEvent(new Event('change'));

    } catch (err) {
        console.error("Error cargando datos:", err);
    }


    // VISTA DE GRAFICAS
    if (vista === 'graficas') {

    try {
        const res = await axios.get(API_URL);
        const datos = res.data;

        // Agrupar totales por año
        const agrupados = {};

        datos.forEach(d => {
            const año = d.a_o;
            const total = parseInt(d.total) || 0;
            if (año) {
                agrupados[año] = (agrupados[año] || 0) + total;
            }
        });

        const labels = Object.keys(agrupados).sort();
        const valores = labels.map(a => agrupados[a]);

        const canvas = document.getElementById('graficoHabitantes');
        if (!canvas) {
            console.warn("No se encontró el canvas 'graficoHabitantes'");
            return;
        }

        const ctx = canvas.getContext('2d');

        new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Total Habitantes de Calle por Año',
                    data: valores,
                    backgroundColor: 'rgba(14, 165, 233, 0.6)',
                    borderColor: 'rgba(14, 165, 233, 1)',
                    borderWidth: 1,
                    borderRadius: 6
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: { display: true },
                    tooltip: { mode: 'index', intersect: false }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Total'
                        }
                    },
                    x: {
                        title: {
                            display: true,
                            text: 'Año'
                        }
                    }
                }
            }
        });

    } catch (err) {
        console.error("Error al cargar datos para la gráfica:", err);
    }
}

}


// Configuracion de la barra lateral
document.querySelectorAll('aside nav a').forEach(a => {
    a.addEventListener('click', e => {
        e.preventDefault();
        const view = a.dataset.view;
        cargarvista(view);
    });
});

// Al inicio carga la vista de datos
cargarvista('datos');