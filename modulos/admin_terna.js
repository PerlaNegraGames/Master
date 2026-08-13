import { ref, set, onValue } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

export function iniciar(contenedor, db, miCarpeta, rtdb) {
    const codJuego = "terna";

    contenedor.innerHTML = `
        <div style="background:#080808; border:1px solid var(--rosa); padding:20px; border-radius:15px; text-align:center;">
            <h2 style="color:var(--rosa); margin-top:0;">TERNAS (1 AL 120)</h2>
            <div style="display:flex; gap:10px; justify-content:center; margin-bottom:15px;">
                <button id="btn-sacar-terna" class="btn-abrir" style="background:var(--rosa); color:#fff;">SACAR TERNA</button>
                <button id="btn-reset-terna" class="btn-abrir" style="background:var(--rojo); color:#fff;">REINICIAR</button>
            </div>
            <div id="ultimo-num-terna" style="font-size:40px; font-weight:900; color:var(--amarillo); margin-bottom:15px;">--</div>
            <div id="tablero-grid-terna" style="display:flex; flex-wrap:wrap; gap:6px; justify-content:center; max-width:650px; margin:0 auto;"></div>
        </div>`;

    const sorteoRef = ref(rtdb, `proyectos/${miCarpeta}/sorteos/${codJuego}`);
    let salidos = [];

    onValue(sorteoRef, (snapshot) => {
        const data = snapshot.val() || {};
        const rawSalidos = data.sacados || [];
        salidos = Array.isArray(rawSalidos) ? rawSalidos : Object.values(rawSalidos);

        const ultimo = salidos[salidos.length - 1] || "--";
        const elem = document.getElementById('ultimo-num-terna');
        if(elem) elem.innerText = ultimo;
        renderTablero(salidos);
    });

    function renderTablero(salidosList) {
        const grid = document.getElementById('tablero-grid-terna');
        if(grid) {
            grid.innerHTML = salidosList.map(item => 
                `<div style="background:var(--rosa); color:#fff; padding:6px 10px; border-radius:4px; font-weight:900; font-size:12px;">${item}</div>`
            ).join('');
        }
    }

    document.getElementById('btn-sacar-terna').onclick = async () => {
        const n1 = Math.floor(Math.random() * 120) + 1;
        const n2 = Math.floor(Math.random() * 120) + 1;
        const n3 = Math.floor(Math.random() * 120) + 1;
        const combo = `[ ${n1} - ${n2} - ${n3} ]`;
        salidos.push(combo);
        await set(sorteoRef, { sacados: salidos, estado: "activo", ultimo: combo });
    };

    document.getElementById('btn-reset-terna').onclick = async () => {
        if (confirm("¿Reiniciar juego de Ternas?")) {
            await set(sorteoRef, { sacados: [], estado: "detenido", ultimo: null });
        }
    };
}