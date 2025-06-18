const API_URL = 'https://www.datos.gov.co/resource/b38q-zzgx.json?$limit=10000';

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
    if (vista === 'datos') {

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
    }

    // VISTA DE GRAFICAS
    if (vista === 'graficas') {

        try {
            const res = await axios.get(API_URL);
            const datos = res.data;

            // Agrupar totales por año
            const agrupados = {};

            datos.forEach(d => {
                const depto = d.iddepto;
                const total = parseInt(d.total) || 0;

                if (depto) {
                    agrupados[depto] = (agrupados[depto] || 0) + total;
                }
            });


            const labels = Object.keys(agrupados).sort();
            const valores = labels.map(d => agrupados[d]);


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
                        label: 'Total Habitantes de Calle por Departamento',
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
                                text: 'Total de personas'
                            }
                        },
                        x: {
                            title: {
                                display: true,
                                text: 'Departamento'
                            },
                            ticks: {
                                autoSkip: false,
                                maxRotation: 90,
                                minRotation: 45
                            }
                        }
                    }
                }
            });



        } catch (err) {
            console.error("Error al cargar datos para la gráfica:", err);
        }
    }

    // VISTA DE MAPA
    if (vista === 'resumen') {

        try {
            const res = await axios.get(API_URL);
            const datos = res.data;

            // Totales
            const totalGeneral = datos.reduce((sum, d) => sum + (parseInt(d.total) || 0), 0);
            const deptosUnicos = new Set(datos.map(d => d.iddepto)).size;
            const aniosUnicos = new Set(datos.map(d => d.a_o)).size;

            document.getElementById('totalGeneral').textContent = totalGeneral;
            document.getElementById('totalDeptos').textContent = deptosUnicos;
            document.getElementById('totalAnios').textContent = aniosUnicos;

            // Top 5 departamentos
            const conteoDeptos = {};
            datos.forEach(d => {
                const dep = d.iddepto;
                const total = parseInt(d.total) || 0;
                conteoDeptos[dep] = (conteoDeptos[dep] || 0) + total;
            });

            const top5 = Object.entries(conteoDeptos)
                .sort((a, b) => b[1] - a[1])
                .slice(0, 5);

            // Gráfico de barras
            new Chart(document.getElementById('graficoTopDeptos'), {
                type: 'bar',
                data: {
                    labels: top5.map(e => e[0]),
                    datasets: [{
                        label: 'Habitantes de Calle',
                        data: top5.map(e => e[1]),
                        backgroundColor: 'rgba(59, 130, 246, 0.6)',
                        borderColor: 'rgba(37, 99, 235, 1)',
                        borderWidth: 1
                    }]
                },
                options: {
                    responsive: true,
                    scales: {
                        y: {
                            beginAtZero: true
                        }
                    }
                }
            });

            // Distribución por régimen
            const regimenes = {};
            datos.forEach(d => {
                const tipo = d.tiporegimen || 'Desconocido';
                const total = parseInt(d.total) || 0;
                regimenes[tipo] = (regimenes[tipo] || 0) + total;
            });

            new Chart(document.getElementById('graficoRegimen'), {
                type: 'pie',
                data: {
                    labels: Object.keys(regimenes),
                    datasets: [{
                        data: Object.values(regimenes),
                        backgroundColor: ['#22c55e', '#f59e0b', '#3b82f6', '#ef4444', '#a855f7']
                    }]
                },
                options: {
                    responsive: true
                }
            });

        } catch (err) {
            console.error('Error cargando resumen:', err);
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