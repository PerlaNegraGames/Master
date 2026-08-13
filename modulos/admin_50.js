import { ref, set, onValue } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

export function iniciar(contenedor, db, miCarpeta, rtdb) {
    const totalNumeros = 50;
    const juegoKey = "50";
    const juegoKeyAlt = "bingo50";

    // 1. Inyectamos la interfaz en el DOM
    contenedor.innerHTML = `
        <div style="background:#080808; border:1px solid var(--verde); padding:20px; border-radius:15px; text-align:center;">
            <h2 style="color:var(--verde); margin-top:0;">BINGO 50 NÚMEROS</h2>
            <div style="display:flex; gap:10px; justify-content:center; margin-bottom:15px;">
                <button id="btn-sacar-50" class="btn-abrir" style="background:var(--cian); color:#000;">SACAR NÚMERO</button>
                <button id="btn-reset-50" class="btn-abrir" style="background:var(--rojo); color:#fff;">REINICIAR TABLERO</button>
            </div>
            <div id="ultimo-num-50" style="font-size:40px; font-weight:900; color:var(--amarillo); margin-bottom:15px;">--</div>
            <div id="tablero-grid-50" style="display:grid; grid-template-columns:repeat(10, 1fr); gap:5px; max-width:600px; margin:0 auto;"></div>
        </div>`;

    const refSorteo1 = ref(rtdb, `proyectos/${miCarpeta}/sorteos/${juegoKey}`);
    const refSorteo2 = ref(rtdb, `proyectos/${miCarpeta}/sorteos/${juegoKeyAlt}`);
    let numerosSalidos = [];

    // 2. Escuchamos cambios en Realtime Database
    onValue(refSorteo1, (snapshot) => {
        const data = snapshot.val() || {};
        const rawSacados = data.sacados || [];
        numerosSalidos = Array.isArray(rawSacados) ? rawSacados : Object.values(rawSacados);
        const ultimo = numerosSalidos.length > 0 ? numerosSalidos[numerosSalidos.length - 1] : "--";
        const elemUltimo = document.getElementById('ultimo-num-50');
        if(elemUltimo) elemUltimo.innerText = ultimo;
        renderTablero(numerosSalidos);
    });

    function renderTablero(salidos) {
        let html = '';
        for (let i = 1; i <= totalNumeros; i++) {
            const mar = salidos.includes(Number(i));
            html += `<div style="background:${mar ? 'var(--verde)' : '#111'}; color:${mar ? '#000' : '#fff'}; padding:8px; border-radius:4px; font-weight:bold; font-size:12px;">${i}</div>`;
        }
        const grid = document.getElementById('tablero-grid-50');
        if(grid) grid.innerHTML = html;
    }

    // 3. Asignamos eventos para sacar números y sincronizarlos en vivo
    const btnSacar = document.getElementById('btn-sacar-50');
    if (btnSacar) {
        btnSacar.onclick = async () => {
            const disponibles = Array.from({length: totalNumeros}, (_, i) => i + 1).filter(n => !numerosSalidos.includes(n));
            if (disponibles.length === 0) return alert("¡Todos los números han salido!");
            const nuevo = disponibles[Math.floor(Math.random() * disponibles.length)];
            numerosSalidos.push(nuevo);
            
            const payload = {
                sacados: numerosSalidos,
                estado: "activo",
                ultimo: nuevo
            };

            await set(refSorteo1, payload);
            await set(refSorteo2, payload);
        };
    }

    const btnReset = document.getElementById('btn-reset-50');
    if (btnReset) {
        btnReset.onclick = async () => {
            if (confirm("¿Reiniciar juego de Bingo 50?")) {
                const payload = {
                    sacados: [],
                    estado: "detenido",
                    ultimo: null
                };
                await set(refSorteo1, payload);
                await set(refSorteo2, payload);
            }
        };
    }
}