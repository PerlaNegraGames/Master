import { ref, set, onValue } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

export function iniciar(contenedor, db, miCarpeta, rtdb) {
    const totalNumeros = 90;
    const codJuego = "90";
    const codJuegoAlt = "bingo90";

    contenedor.innerHTML = `
        <div style="background:#080808; border:1px solid var(--verde); padding:20px; border-radius:15px; text-align:center;">
            <h2 style="color:var(--verde); margin-top:0;">BINGO 90 NÚMEROS</h2>
            <div style="display:flex; gap:8px; justify-content:center; align-items:center; margin-bottom:15px; flex-wrap:wrap;">
                <button id="btn-sacar-90" class="btn-abrir" style="background:var(--cian); color:#000;">SACAR NÚMERO</button>
                <button id="btn-auto-90" class="btn-abrir" style="background:var(--amarillo); color:#000;">▶ AUTOMÁTICO</button>
                <div style="display:flex; align-items:center; gap:5px; background:#000; border:1px solid var(--amarillo); padding:4px 8px; border-radius:6px;">
                    <span style="font-size:11px; color:#fff; font-weight:bold;">SEG:</span>
                    <input type="number" id="sel-vel-90" value="5" min="1" step="0.5" style="background:transparent; border:none; color:#fff; width:50px; font-weight:bold; text-align:center; outline:none;">
                </div>
                <button id="btn-pausa-90" class="btn-abrir" style="background:#ff9900; color:#000; display:none;">PAUSAR</button>
                <button id="btn-reset-90" class="btn-abrir" style="background:var(--rojo); color:#fff;">REINICIAR</button>
            </div>
            <div id="estado-partida" style="font-size:12px; font-weight:bold; color:var(--verde); margin-bottom:10px; text-transform:uppercase;">ESTADO: DETENIDO</div>
            <div id="ultimo-num-90" style="font-size:40px; font-weight:900; color:var(--amarillo); margin-bottom:15px;">--</div>
            <div id="tablero-grid-90" style="display:grid; grid-template-columns:repeat(10, 1fr); gap:5px; max-width:600px; margin:0 auto;"></div>
        </div>`;

    const sorteoRef1 = ref(rtdb, `proyectos/${miCarpeta}/sorteos/${codJuego}`);
    const sorteoRef2 = ref(rtdb, `proyectos/${miCarpeta}/sorteos/${codJuegoAlt}`);
    let numerosSalidos = [];
    let intervaloAuto = null;

    onValue(sorteoRef1, (snapshot) => {
        const data = snapshot.val() || {};
        const rawSalidos = data.sacados || [];
        numerosSalidos = Array.isArray(rawSalidos) ? rawSalidos.map(Number) : Object.values(rawSalidos).map(Number);
        const estadoJuego = data.estado || "detenido";

        const ultimo = numerosSalidos.length > 0 ? numerosSalidos[numerosSalidos.length - 1] : "--";
        const elemUltimo = document.getElementById('ultimo-num-90');
        if(elemUltimo) elemUltimo.innerText = ultimo;

        const lblEstado = document.getElementById('estado-partida');
        if(lblEstado) {
            lblEstado.innerText = `ESTADO: ${estadoJuego.toUpperCase()}`;
            lblEstado.style.color = estadoJuego === 'activo' ? 'var(--verde)' : (estadoJuego === 'pausado' ? 'var(--amarillo)' : 'var(--rojo)');
        }
        renderTablero(numerosSalidos);
    });

    function renderTablero(salidos) {
        let html = '';
        for (let i = 1; i <= totalNumeros; i++) {
            const mar = salidos.includes(i);
            html += `<div style="background:${mar ? 'var(--verde)' : '#111'}; color:${mar ? '#000' : '#fff'}; padding:8px; border-radius:4px; font-weight:bold; font-size:12px;">${i}</div>`;
        }
        const grid = document.getElementById('tablero-grid-90');
        if(grid) grid.innerHTML = html;
    }

    async function sacarNumeroAccion() {
        const disponibles = Array.from({length: totalNumeros}, (_, i) => i + 1).filter(n => !numerosSalidos.includes(n));
        if (disponibles.length === 0) {
            detenerAuto();
            alert("¡Todos los números han salido!");
            return;
        }
        const nuevo = disponibles[Math.floor(Math.random() * disponibles.length)];
        numerosSalidos.push(nuevo);
        const payload = { sacados: numerosSalidos, estado: "activo", ultimo: nuevo };
        await set(sorteoRef1, payload);
        await set(sorteoRef2, payload);
    }

    document.getElementById('btn-sacar-90').onclick = async () => {
        detenerAuto();
        await sacarNumeroAccion();
    };

    const btnAuto = document.getElementById('btn-auto-90');
    const btnPausa = document.getElementById('btn-pausa-90');
    const inpVel = document.getElementById('sel-vel-90');

    function obtenerMilisegundos() {
        const val = parseFloat(inpVel.value);
        return (isNaN(val) || val <= 0) ? 5000 : val * 1000;
    }

    btnAuto.onclick = () => {
        if (intervaloAuto) return;
        const velocidad = obtenerMilisegundos();
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
            const payload = { sacados: numerosSalidos, estado: "pausado", ultimo: numerosSalidos[numerosSalidos.length - 1] || null };
            await set(sorteoRef1, payload);
            await set(sorteoRef2, payload);
        } else {
            const velocidad = obtenerMilisegundos();
            btnPausa.innerText = "PAUSAR";
            intervaloAuto = setInterval(() => sacarNumeroAccion(), velocidad);
            const payload = { sacados: numerosSalidos, estado: "activo", ultimo: numerosSalidos[numerosSalidos.length - 1] || null };
            await set(sorteoRef1, payload);
            await set(sorteoRef2, payload);
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

    document.getElementById('btn-reset-90').onclick = async () => {
        if (confirm("¿Reiniciar juego de Bingo 90?")) {
            detenerAuto();
            const payload = { sacados: [], estado: "detenido", ultimo: null };
            await set(sorteoRef1, payload);
            await set(sorteoRef2, payload);
        }
    };
}