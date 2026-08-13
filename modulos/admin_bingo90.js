import { ref, set, onValue } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

export function iniciar(contenedor, db, miCarpeta, rtdb) {
    const codJuego = "bingo90";
    const totalNumeros = 90;

    contenedor.innerHTML = `
        <div style="background:#111; border:2px solid #39ff14; border-radius:15px; padding:20px; text-align:center;">
            <h2 style="color:#39ff14; text-shadow: 0 0 20px #39ff14;">🎯 BINGO 90 (PANEL)</h2>
            <div style="display:flex; gap:10px; justify-content:center; margin-bottom:15px;">
                <button id="btn-sacar-b90" class="btn-abrir" style="background:#39ff14; color:#000; padding:10px 20px; border-radius:8px; font-weight:bold; cursor:pointer;">SACAR NÚMERO</button>
                <button id="btn-reset-b90" class="btn-abrir" style="background:var(--rojo); color:#fff; padding:10px 20px; border-radius:8px; font-weight:bold; cursor:pointer;">REINICIAR</button>
            </div>
            <div id="ultimo-b90" style="font-size:40px; font-weight:900; color:#ffff00; margin-bottom:15px;">--</div>
            <div id="grid-b90" style="display:grid; grid-template-columns:repeat(10, 1fr); gap:5px; max-width:600px; margin:0 auto;"></div>
        </div>
    `;

    const sorteoRef = ref(rtdb, `proyectos/${miCarpeta}/sorteos/${codJuego}`);
    let salidos = [];

    onValue(sorteoRef, (snapshot) => {
        const data = snapshot.val() || {};
        const raw = data.sacados || [];
        salidos = Array.isArray(raw) ? raw.map(Number) : Object.values(raw).map(Number);
        
        const ultimo = salidos.length > 0 ? salidos[salidos.length - 1] : "--";
        const el = document.getElementById('ultimo-b90');
        if (el) el.innerText = ultimo;
        renderTablero(salidos);
    });

    function renderTablero(salidosList) {
        let html = '';
        for (let i = 1; i <= totalNumeros; i++) {
            const mar = salidosList.includes(i);
            html += `<div style="background:${mar ? '#39ff14' : '#1a1a1a'}; color:${mar ? '#000' : '#fff'}; padding:8px; border-radius:4px; font-weight:bold; font-size:12px;">${i}</div>`;
        }
        const grid = document.getElementById('grid-b90');
        if (grid) grid.innerHTML = html;
    }

    document.getElementById('btn-sacar-b90').onclick = async () => {
        const disponibles = Array.from({length: totalNumeros}, (_, i) => i + 1).filter(n => !salidos.includes(n));
        if (disponibles.length === 0) return alert("¡Todos los números han salido!");
        const nuevo = disponibles[Math.floor(Math.random() * disponibles.length)];
        salidos.push(nuevo);
        await set(sorteoRef, { sacados: salidos, estado: "activo", ultimo: nuevo });
    };

    document.getElementById('btn-reset-b90').onclick = async () => {
        if (confirm("¿Reiniciar tablero Bingo 90?")) {
            await set(sorteoRef, { sacados: [], estado: "detenido", ultimo: null });
        }
    };
}