// 1. Verificar sesión
if (!localStorage.getItem('token')) {
    window.location.href = '/';
}

const urlParams = new URLSearchParams(window.location.search);
const tipoId = urlParams.get('id');

// Cargar datos iniciales
async function inicializarPagina() {
    await cargarTipoEquipo();
    await cargarUnidades();
}

async function cargarTipoEquipo() {
    try {
        const res = await fetch(`/api/tipos-equipos/${tipoId}`);
        const tipo = await res.json();
        
        document.getElementById('nombreTipo').textContent = tipo.nombre || 'Sin nombre';
        document.getElementById('tipoEquipo').textContent = tipo.tipo || 'N/A';
        document.getElementById('marcaEquipo').textContent = tipo.marca || 'N/A';
        document.getElementById('modeloEquipo').textContent = tipo.modelo || 'N/A';
        document.getElementById('descripcionEquipo').textContent = tipo.descripcion || 'Sin descripción';
        
        const fotoImg = document.getElementById('fotoTipo');
        if (tipo.foto && fotoImg) {
            fotoImg.src = `media/equipos/${tipo.foto}`;
        }
    } catch (error) {
        console.error('Error al cargar tipo:', error);
    }
}

async function cargarUnidades() {
    try {
        const res = await fetch(`/api/equipos/tipo/${tipoId}`);
        const unidades = await res.json();
        const container = document.getElementById('listaUnidades');
        
        if (!container) return;
        container.innerHTML = '';

        if (!unidades || unidades.length === 0) {
            container.innerHTML = '<p class="text-center text-muted">No hay unidades registradas.</p>';
            return;
        }

        // Recuperar plan con seguridad
        const configAlquiler = JSON.parse(localStorage.getItem('configAlquiler'));

        unidades.forEach(unidad => {
            // Lógica de selección ultra-segura
            let seleccionado = false;
            if (configAlquiler && configAlquiler.seleccionados) {
                const s = configAlquiler.seleccionados;
                // Unificamos todos los IDs seleccionados en una sola lista para comparar
                const todosIds = [
                    ...(s.receptores || []),
                    ...(s.colectores || []),
                    ...(s.bastones || []),
                    ...(s.otros || []),
                    ...(s.extras || []).map(e => e.id)
                ];
                seleccionado = todosIds.includes(unidad.id);
            }

            let colorBadge = 'bg-secondary';
            let textoEstado = unidad.estado;
            let botonHTML = '';

            if (unidad.estado === 'disponible') {
                colorBadge = 'bg-success';
                textoEstado = '✅ Disponible';
                if (seleccionado) {
                    botonHTML = `<button class="btn btn-warning" onclick="quitarDelCarrito(${unidad.id})">Quitar Selección</button>`;
                } else {
                    botonHTML = `<button class="btn btn-primary" onclick="agregarAlCarrito(${unidad.id}, '${unidad.numero_serie}')">Seleccionar</button>`;
                }
            } else if (unidad.estado === 'alquilado') {
                colorBadge = 'bg-danger';
                textoEstado = '🔴 Alquilado';
                botonHTML = `<button class="btn btn-secondary" disabled>No disponible</button>`;
            }

            const card = document.createElement('div');
            card.className = `unidad-card mb-3 p-3 border rounded shadow-sm ${seleccionado ? 'border-primary bg-light' : ''}`;
            card.innerHTML = `
                <div class="row align-items-center">
                    <div class="col-md-4"><h5>${unidad.numero_serie}</h5></div>
                    <div class="col-md-4"><span class="badge ${colorBadge}">${textoEstado}</span></div>
                    <div class="col-md-4 text-end">${botonHTML}</div>
                </div>`;
            container.appendChild(card);
        });

    } catch (error) {
        console.error('Error crítico al cargar unidades:', error);
        document.getElementById('listaUnidades').innerHTML = '<p class="text-danger">Error al cargar las unidades. Revisa la consola.</p>';
    }
}

function agregarAlCarrito(id, numeroSerie) {
    let config = JSON.parse(localStorage.getItem('configAlquiler'));
    if (!config) return;

    const nombre = document.getElementById('nombreTipo').textContent.toLowerCase();
    let cat = "otros";

    if (nombre.includes('receptor') || nombre.includes('gps')) cat = "receptores";
    else if (nombre.includes('colector') || nombre.includes('celular')) cat = "colectores";
    else if (nombre.includes('bastón') || nombre.includes('baston')) cat = "bastones";

    // Inicializar arrays si no existen
    if (!config.seleccionados[cat]) config.seleccionados[cat] = [];
    if (!config.seleccionados.extras) config.seleccionados.extras = [];

    const limite = config.minimos[cat] || 0;
    
    if (cat !== "otros" && config.seleccionados[cat].length >= limite) {
        config.seleccionados.extras.push({ id, numeroSerie, tipoNombre: nombre });
    } else {
        config.seleccionados[cat].push(id);
    }

    localStorage.setItem('configAlquiler', JSON.stringify(config));
    cargarUnidades();
    if (typeof renderizarBarraProgreso === 'function') renderizarBarraProgreso();
}

function quitarDelCarrito(id) {
    let config = JSON.parse(localStorage.getItem('configAlquiler'));
    if (!config) return;

    // Limpiar de todas las listas posibles
    const s = config.seleccionados;
    s.receptores = (s.receptores || []).filter(i => i !== id);
    s.colectores = (s.colectores || []).filter(i => i !== id);
    s.bastones = (s.bastones || []).filter(i => i !== id);
    s.otros = (s.otros || []).filter(i => i !== id);
    s.extras = (s.extras || []).filter(i => i.id !== id);

    localStorage.setItem('configAlquiler', JSON.stringify(config));
    cargarUnidades();
    if (typeof renderizarBarraProgreso === 'function') renderizarBarraProgreso();
}

// Iniciar proceso
inicializarPagina();