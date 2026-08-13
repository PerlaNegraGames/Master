import { ref, set, onValue } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

export function iniciar(contenedor, db, miCarpeta, rtdb) {
    const totalNumeros = 72;
    const codJuego = "72";
    const codJuegoAlt = "bingo72";

    contenedor.innerHTML = `
        <div style="background:#080808; border:1px solid var(--verde); padding:20px; border-radius:15px; text-align:center;">
            <h2 style="color:var(--verde); margin-top:0;">BINGO 72 NUMEROS</h2>
            <div style="display:flex; gap:10px; justify-content:center; margin-bottom:15px;">
                <button id="btn-sacar-72" class="btn-abrir" style="background:var(--cian); color:#000;">SACAR NÚMERO</button>
                <button id="btn-reset-72" class="btn-abrir" style="background:var(--rojo); color:#fff;">REINICIAR TABLERO</button>
            </div>
            <div id="ultimo-num-72" style="font-size:40px; font-weight:900; color:var(--amarillo); margin-bottom:15px;">--</div>
            <div id="tablero-grid-72" style="display:grid; grid-template-columns:repeat(9, 1fr); gap:5px; max-width:600px; margin:0 auto;"></div>
        </div>`;

    const sorteoRef1 = ref(rtdb, `proyectos/${miCarpeta}/sorteos/${codJuego}`);
    const sorteoRef2 = ref(rtdb, `proyectos/${miCarpeta}/sorteos/${codJuegoAlt}`);
    let numerosSalidos = [];

    onValue(sorteoRef1, (snapshot) => {
        const data = snapshot.val() || {};
        const rawSalidos = data.sacados || [];
        numerosSalidos = Array.isArray(rawSalidos) ? rawSalidos.map(Number) : Object.values(rawSalidos).map(Number);

        const ultimo = numerosSalidos.length > 0 ? numerosSalidos[numerosSalidos.length - 1] : "--";
        const elemUltimo = document.getElementById('ultimo-num-72');
        if(elemUltimo) elemUltimo.innerText = ultimo;
        renderTablero(numerosSalidos);
    });

    function renderTablero(salidos) {
        let html = '';
        for (let i = 1; i <= totalNumeros; i++) {
            const mar = salidos.includes(i);
            html += `<div style="background:${mar ? 'var(--verde)' : '#111'}; color:${mar ? '#000' : '#fff'}; padding:8px; border-radius:4px; font-weight:bold; font-size:12px;">${i}</div>`;
        }
        const grid = document.getElementById('tablero-grid-72');
        if(grid) grid.innerHTML = html;
    }

    document.getElementById('btn-sacar-72').onclick = async () => {
        const disponibles = Array.from({length: totalNumeros}, (_, i) => i + 1).filter(n => !numerosSalidos.includes(n));
        if (disponibles.length === 0) return alert("¡Todos los números han salido!");
        const nuevo = disponibles[Math.floor(Math.random() * disponibles.length)];
        numerosSalidos.push(nuevo);
        
        const payload = { sacados: numerosSalidos, estado: "activo", ultimo: nuevo };
        await set(sorteoRef1, payload);
        await set(sorteoRef2, payload);
    };

    document.getElementById('btn-reset-72').onclick = async () => {
        if (confirm("¿Reiniciar juego de Bingo 72?")) {
            const payload = { sacados: [], estado: "detenido", ultimo: null };
            await set(sorteoRef1, payload);
            await set(sorteoRef2, payload);
        }
    };
}