import { ref, set, onValue } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

export function iniciar(contenedor, db, miCarpeta, rtdb) {
    const codJuego = "bomba";

    contenedor.innerHTML = `
        <div style="background:#080808; border:1px solid var(--rojo); padding:20px; border-radius:15px; text-align:center;">
            <h2 style="color:var(--rojo); margin-top:0;">MODO BOMBA</h2>
            <div style="display:flex; gap:10px; justify-content:center; margin-bottom:15px;">
                <button id="btn-sacar-bom" class="btn-abrir" style="background:var(--rojo); color:#fff;">EXPLOTAR BOMBA</button>
                <button id="btn-reset-bom" class="btn-abrir" style="background:#333; color:#fff;">REINICIAR</button>
            </div>
            <div id="ultimo-num-bom" style="font-size:36px; font-weight:900; color:var(--amarillo); margin-bottom:15px;">--</div>
            <div id="tablero-grid-bom" style="display:flex; flex-wrap:wrap; gap:8px; justify-content:center; max-width:600px; margin:0 auto;"></div>
        </div>`;

    const sorteoRef = ref(rtdb, `proyectos/${miCarpeta}/sorteos/${codJuego}`);
    let salidos = [];

    onValue(sorteoRef, (snapshot) => {
        const data = snapshot.val() || {};
        const rawSalidos = data.sacados || [];
        salidos = Array.isArray(rawSalidos) ? rawSalidos : Object.values(rawSalidos);

        const ultimo = salidos[salidos.length - 1] || "--";
        const elem = document.getElementById('ultimo-num-bom');
        if(elem) elem.innerText = ultimo;
        renderTablero(salidos);
    });

    function renderTablero(salidosList) {
        const grid = document.getElementById('tablero-grid-bom');
        if(grid) {
            grid.innerHTML = salidosList.map(item => 
                `<div style="background:var(--rojo); color:#fff; padding:8px 12px; border-radius:6px; font-weight:900; font-size:13px;">💣 ${item}</div>`
            ).join('');
        }
    }

    document.getElementById('btn-sacar-bom').onclick = async () => {
        const num = Math.floor(Math.random() * 100) + 1;
        const texto = `BOMBA EN #${num}`;
        salidos.push(texto);
        await set(sorteoRef, { sacados: salidos, estado: "activo", ultimo: texto });
    };

    document.getElementById('btn-reset-bom').onclick = async () => {
        if (confirm("¿Reiniciar Modo Bomba?")) {
            await set(sorteoRef, { sacados: [], estado: "detenido", ultimo: null });
        }
    };
}