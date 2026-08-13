import { ref, set, onValue } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

export function iniciar(contenedor, db, miCarpeta, rtdb) {
    const totalPos = 30;
    const codJuego = "eliminatorias";

    contenedor.innerHTML = `
        <div style="background:#080808; border:1px solid var(--rojo); padding:20px; border-radius:15px; text-align:center;">
            <h2 style="color:var(--rojo); margin-top:0;">ELIMINATORIAS</h2>
            <div style="display:flex; gap:10px; justify-content:center; margin-bottom:15px;">
                <button id="btn-sacar-elim" class="btn-abrir" style="background:var(--rojo); color:#fff;">ELIMINAR POSICIÓN</button>
                <button id="btn-reset-elim" class="btn-abrir" style="background:#333; color:#fff;">REINICIAR</button>
            </div>
            <div id="ultimo-num-elim" style="font-size:36px; font-weight:900; color:var(--amarillo); margin-bottom:15px;">--</div>
            <div id="tablero-grid-elim" style="display:grid; grid-template-columns:repeat(6, 1fr); gap:6px; max-width:600px; margin:0 auto;"></div>
        </div>`;

    const sorteoRef = ref(rtdb, `proyectos/${miCarpeta}/sorteos/${codJuego}`);
    let salidos = [];

    onValue(sorteoRef, (snapshot) => {
        const data = snapshot.val() || {};
        const rawSalidos = data.sacados || [];
        salidos = Array.isArray(rawSalidos) ? rawSalidos.map(Number) : Object.values(rawSalidos).map(Number);

        const ultimo = salidos[salidos.length - 1] ? `ELIMINADO #${salidos[salidos.length - 1]}` : "--";
        const elem = document.getElementById('ultimo-num-elim');
        if(elem) elem.innerText = ultimo;
        renderTablero(salidos);
    });

    function renderTablero(salidosList) {
        let html = '';
        for (let i = 1; i <= totalPos; i++) {
            const mar = salidosList.includes(i);
            html += `<div style="background:${mar ? 'var(--rojo)' : '#111'}; color:${mar ? '#fff' : '#888'}; padding:10px; border-radius:6px; font-weight:bold; font-size:12px; text-decoration:${mar ? 'line-through' : 'none'};">P${i}</div>`;
        }
        const grid = document.getElementById('tablero-grid-elim');
        if(grid) grid.innerHTML = html;
    }

    document.getElementById('btn-sacar-elim').onclick = async () => {
        const disponibles = Array.from({length: totalPos}, (_, i) => i + 1).filter(n => !salidos.includes(n));
        if (disponibles.length === 0) return alert("¡Todas las posiciones han sido eliminadas!");
        const nuevo = disponibles[Math.floor(Math.random() * disponibles.length)];
        salidos.push(nuevo);
        await set(sorteoRef, { sacados: salidos, estado: "activo", ultimo: nuevo });
    };

    document.getElementById('btn-reset-elim').onclick = async () => {
        if (confirm("¿Reiniciar Eliminatorias?")) {
            await set(sorteoRef, { sacados: [], estado: "detenido", ultimo: null });
        }
    };
}