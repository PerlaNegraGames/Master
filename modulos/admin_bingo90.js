import { ref, set, onValue } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

export function iniciar(contenedor, db, miCarpeta, rtdb) {
    const codJuego = "bingo90";
    const totalNumeros = 90;

    contenedor.innerHTML = `
        <div style="background:#111; border:2px solid #39ff14; border-radius:15px; padding:20px; text-align:center;">
            <h2 style="color:#39ff14; text-shadow: 0 0 20px #39ff14;">🎯 BINGO 90 (PANEL)</h2>
            <div style="display:flex; gap:8px; justify-content:center; align-items:center; margin-bottom:15px; flex-wrap:wrap;">
                <button id="btn-sacar-b90" class="btn-abrir" style="background:#39ff14; color:#000; padding:10px 20px; border-radius:8px; font-weight:bold; cursor:pointer;">SACAR NÚMERO</button>
                <button id="btn-auto-b90" class="btn-abrir" style="background:var(--amarillo); color:#000; padding:10px 20px; border-radius:8px; font-weight:bold; cursor:pointer;">▶ AUTOMÁTICO</button>
                <select id="sel-vel-b90" style="background:#000; border:1px solid var(--amarillo); color:#fff; padding:8px; border-radius:6px; font-weight:bold;">
                    <option value="3000">3 Segundos</option>
                    <option value="5000" selected>5 Segundos</option>
                    <option value="8000">8 Segundos</option>
                </select>
                <button id="btn-pausa-b90" class="btn-abrir" style="background:#ff9900; color:#000; padding:10px 20px; border-radius:8px; font-weight:bold; cursor:pointer; display:none;">PAUSAR</button>
                <button id="btn-reset-b90" class="btn-abrir" style="background:var(--rojo); color:#fff; padding:10px 20px; border-radius:8px; font-weight:bold; cursor:pointer;">REINICIAR</button>
            </div>
            <div id="estado-partida" style="font-size:12px; font-weight:bold; color:#39ff14; margin-bottom:10px; text-transform:uppercase;">ESTADO: DETENIDO</div>
            <div id="ultimo-b90" style="font-size:40px; font-weight:900; color:#ffff00; margin-bottom:15px;">--</div>
            <div id="grid-b90" style="display:grid; grid-template-columns:repeat(10, 1fr); gap:5px; max-width:600px; margin:0 auto;"></div>
        </div>
    `;

    const sorteoRef = ref(rtdb, `proyectos/${miCarpeta}/sorteos/${codJuego}`);
    let salidos = [];
    let intervaloAuto = null;

    onValue(sorteoRef, (snapshot) => {
        const data = snapshot.val() || {};
        const raw = data.sacados || [];
        salidos = Array.isArray(raw) ? raw.map(Number) : Object.values(raw).map(Number);
        const estadoJuego = data.estado || "detenido";
        
        const ultimo = salidos.length > 0 ? salidos[salidos.length - 1] : "--";
        const el = document.getElementById('ultimo-b90');
        if (el) el.innerText = ultimo;

        const lblEstado = document.getElementById('estado-partida');
        if(lblEstado) {
            lblEstado.innerText = `ESTADO: ${estadoJuego.toUpperCase()}`;
            lblEstado.style.color = estadoJuego === 'activo' ? '#39ff14' : (estadoJuego === 'pausado' ? '#ffff00' : '#ff0000');
        }
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

    async function sacarNumeroAccion() {
        const disponibles = Array.from({length: totalNumeros}, (_, i) => i + 1).filter(n => !salidos.includes(n));
        if (disponibles.length === 0) {
            detenerAuto();
            alert("¡Todos los números han salido!");
            return;
        }
        const nuevo = disponibles[Math.floor(Math.random() * disponibles.length)];
        salidos.push(nuevo);
        await set(sorteoRef, { sacados: salidos, estado: "activo", ultimo: nuevo });
    }

    document.getElementById('btn-sacar-b90').onclick = async () => {
        detenerAuto();
        await sacarNumeroAccion();
    };

    const btnAuto = document.getElementById('btn-auto-b90');
    const btnPausa = document.getElementById('btn-pausa-b90');
    const selVel = document.getElementById('sel-vel-b90');

    btnAuto.onclick = () => {
        if (intervaloAuto) return;
        const velocidad = parseInt(selVel.value) || 5000;
        btnAuto.style.display = "none";
        btnPausa.style.display = "inline-block";
        btnPausa.innerText = "PAUSAR";
        sacarNumeroAccion();
        intervaloAuto = setInterval(() => sacarNumeroAccion(), velocidad);
    };

    btnPausa.onclick = async () => {
        if (intervaloAuto) {
            clearInterval(intervaloAuto);
            intervaloAuto = null;
            btnPausa.innerText = "REANUDAR";
            await set(sorteoRef, { sacados: salidos, estado: "pausado", ultimo: salidos[salidos.length - 1] || null });
        } else {
            const velocidad = parseInt(selVel.value) || 5000;
            btnPausa.innerText = "PAUSAR";
            intervaloAuto = setInterval(() => sacarNumeroAccion(), velocidad);
            await set(sorteoRef, { sacados: salidos, estado: "activo", ultimo: salidos[salidos.length - 1] || null });
        }
    };

    function detenerAuto() {
        if (intervaloAuto) {
            clearInterval(intervaloAuto);
            intervaloAuto = null;
        }
        if (btnAuto) btnAuto.style.display = "inline-block";
        if (btnPausa) btnPausa.style.display = "none";
    }

    document.getElementById('btn-reset-b90').onclick = async () => {
        if (confirm("¿Reiniciar tablero Bingo 90?")) {
            detenerAuto();
            await set(sorteoRef, { sacados: [], estado: "detenido", ultimo: null });
        }
    };
}