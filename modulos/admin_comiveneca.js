import { ref, set, onValue } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

export function iniciar(contenedor, db, miCarpeta, rtdb) {
    const comiVeneca = ["Pabellón Criollo", "Arepa Pelúa", "Cachapa", "Hallaca", "Tequeños", "Asado Negro", "Patacón", "Pan de Jamón", "Empanada de Cazón", "Mundongo", "Chicha", "Cocada"];
    const codJuego = "comiveneca";

    contenedor.innerHTML = `
        <div style="background:#080808; border:1px solid var(--amarillo); padding:20px; border-radius:15px; text-align:center;">
            <h2 style="color:var(--amarillo); margin-top:0;">GOURMET VENEZOLANO</h2>
            <div style="display:flex; gap:10px; justify-content:center; margin-bottom:15px;">
                <button id="btn-sacar-ven" class="btn-abrir" style="background:var(--amarillo); color:#000;">SACAR PLATILLO</button>
                <button id="btn-reset-ven" class="btn-abrir" style="background:var(--rojo); color:#fff;">REINICIAR</button>
            </div>
            <div id="ultimo-num-ven" style="font-size:32px; font-weight:900; color:var(--cian); margin-bottom:15px;">--</div>
            <div id="tablero-grid-ven" style="display:grid; grid-template-columns:repeat(3, 1fr); gap:8px; max-width:600px; margin:0 auto;"></div>
        </div>`;

    const sorteoRef = ref(rtdb, `proyectos/${miCarpeta}/sorteos/${codJuego}`);
    let salidos = [];

    onValue(sorteoRef, (snapshot) => {
        const data = snapshot.val() || {};
        const rawSalidos = data.sacados || [];
        salidos = Array.isArray(rawSalidos) ? rawSalidos : Object.values(rawSalidos);

        const ultimo = salidos[salidos.length - 1] || "--";
        const elem = document.getElementById('ultimo-num-ven');
        if(elem) elem.innerText = ultimo;
        renderTablero(salidos);
    });

    function renderTablero(salidosList) {
        let html = '';
        comiVeneca.forEach(item => {
            const mar = salidosList.includes(item);
            html += `<div style="background:${mar ? 'var(--amarillo)' : '#111'}; color:${mar ? '#000' : '#aaa'}; padding:10px; border-radius:6px; font-weight:bold; font-size:11px; text-transform:uppercase;">${item}</div>`;
        });
        const grid = document.getElementById('tablero-grid-ven');
        if(grid) grid.innerHTML = html;
    }

    document.getElementById('btn-sacar-ven').onclick = async () => {
        const disponibles = comiVeneca.filter(item => !salidos.includes(item));
        if (disponibles.length === 0) return alert("¡Todos los platillos han salido!");
        const nuevo = disponibles[Math.floor(Math.random() * disponibles.length)];
        salidos.push(nuevo);
        await set(sorteoRef, { sacados: salidos, estado: "activo", ultimo: nuevo });
    };

    document.getElementById('btn-reset-ven').onclick = async () => {
        if (confirm("¿Reiniciar Gourmet Venezolano?")) {
            await set(sorteoRef, { sacados: [], estado: "detenido", ultimo: null });
        }
    };
}