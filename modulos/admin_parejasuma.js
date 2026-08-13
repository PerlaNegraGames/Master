import { ref, set, onValue } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

export function iniciar(contenedor, db, miCarpeta, rtdb) {
    const codJuego = "parejasuma";

    contenedor.innerHTML = `
        <div style="background:#080808; border:1px solid var(--amarillo); padding:20px; border-radius:15px; text-align:center;">
            <h2 style="color:var(--amarillo); margin-top:0;">SUMATORIA PAREJAS</h2>
            <div style="display:flex; gap:8px; justify-content:center; align-items:center; margin-bottom:15px; flex-wrap:wrap;">
                <button id="btn-sacar-par" class="btn-abrir" style="background:var(--amarillo); color:#000;">GENERAR PAREJA</button>
                <button id="btn-auto-par" class="btn-abrir" style="background:var(--cian); color:#000;">▶ AUTOMÁTICO</button>
                <select id="sel-vel-par" style="background:#000; border:1px solid var(--cian); color:#fff; padding:8px; border-radius:6px; font-weight:bold;">
                    <option value="3000">3 Segundos</option>
                    <option value="5000" selected>5 Segundos</option>
                    <option value="8000">8 Segundos</option>
                </select>
                <button id="btn-pausa-par" class="btn-abrir" style="background:#ff9900; color:#000; display:none;">PAUSAR</button>
                <button id="btn-reset-par" class="btn-abrir" style="background:var(--rojo); color:#fff;">REINICIAR</button>
            </div>
            <div id="estado-partida" style="font-size:12px; font-weight:bold; color:var(--amarillo); margin-bottom:10px; text-transform:uppercase;">ESTADO: DETENIDO</div>
            <div id="ultimo-num-par" style="font-size:36px; font-weight:900; color:var(--cian); margin-bottom:15px;">--</div>
            <div id="tablero-grid-par" style="display:flex; flex-wrap:wrap; gap:8px; justify-content:center; max-width:600px; margin:0 auto;"></div>
        </div>`;

    const sorteoRef = ref(rtdb, `proyectos/${miCarpeta}/sorteos/${codJuego}`);
    let salidos = [];
    let intervaloAuto = null;

    onValue(sorteoRef, (snapshot) => {
        const data = snapshot.val() || {};
        const rawSalidos = data.sacados || [];
        salidos = Array.isArray(rawSalidos) ? rawSalidos : Object.values(rawSalidos);
        const estadoJuego = data.estado || "detenido";

        const ultimo = salidos[salidos.length - 1] || "--";
        const elem = document.getElementById('ultimo-num-par');
        if(elem) elem.innerText = ultimo;

        const lblEstado = document.getElementById('estado-partida');
        if(lblEstado) {
            lblEstado.innerText = `ESTADO: ${estadoJuego.toUpperCase()}`;
            lblEstado.style.color = estadoJuego === 'activo' ? 'var(--amarillo)' : (estadoJuego === 'pausado' ? '#ff9900' : 'var(--rojo)');
        }
        renderTablero(salidos);
    });

    function renderTablero(salidosList) {
        const grid = document.getElementById('tablero-grid-par');
        if(grid) {
            grid.innerHTML = salidosList.map(item => 
                `<div style="background:var(--amarillo); color:#000; padding:8px 12px; border-radius:6px; font-weight:900; font-size:13px;">${item}</div>`
            ).join('');
        }
    }

    async function sacarAccion() {
        const n1 = Math.floor(Math.random() * 50) + 1;
        const n2 = Math.floor(Math.random() * 50) + 1;
        const combo = `${n1} + ${n2} = ${n1 + n2}`;
        salidos.push(combo);
        await set(sorteoRef, { sacados: salidos, estado: "activo", ultimo: combo });
    }

    document.getElementById('btn-sacar-par').onclick = async () => {
        detenerAuto();
        await sacarAccion();
    };

    const btnAuto = document.getElementById('btn-auto-par');
    const btnPausa = document.getElementById('btn-pausa-par');
    const selVel = document.getElementById('sel-vel-par');

    btnAuto.onclick = () => {
        if (intervaloAuto) return;
        const vel = parseInt(selVel.value) || 5000;
        btnAuto.style.display = "none";
        btnPausa.style.display = "inline-block";
        btnPausa.innerText = "PAUSAR";
        sacarAccion();
        intervaloAuto = setInterval(() => sacarAccion(), vel);
    };

    btnPausa.onclick = async () => {
        if (intervaloAuto) {
            clearInterval(intervaloAuto);
            intervaloAuto = null;
            btnPausa.innerText = "REANUDAR";
            await set(sorteoRef, { sacados: salidos, estado: "pausado", ultimo: salidos[salidos.length - 1] || null });
        } else {
            const vel = parseInt(selVel.value) || 5000;
            btnPausa.innerText = "PAUSAR";
            intervaloAuto = setInterval(() => sacarAccion(), vel);
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

    document.getElementById('btn-reset-par').onclick = async () => {
        if (confirm("¿Reiniciar Sumatoria Parejas?")) {
            detenerAuto();
            await set(sorteoRef, { sacados: [], estado: "detenido", ultimo: null });
        }
    };
}