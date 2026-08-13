import { ref, set, onValue } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

export function iniciar(contenedor, db, miCarpeta, rtdb) {
    const totalPos = 30;
    const codJuego = "eliminatorias";

    contenedor.innerHTML = `
        <div style="background:#080808; border:1px solid var(--rojo); padding:20px; border-radius:15px; text-align:center;">
            <h2 style="color:var(--rojo); margin-top:0;">ELIMINATORIAS</h2>
            <div style="display:flex; gap:8px; justify-content:center; align-items:center; margin-bottom:15px; flex-wrap:wrap;">
                <button id="btn-sacar-elim" class="btn-abrir" style="background:var(--rojo); color:#fff;">ELIMINAR POSICIÓN</button>
                <button id="btn-auto-elim" class="btn-abrir" style="background:var(--amarillo); color:#000;">▶ AUTOMÁTICO</button>
                <select id="sel-vel-elim" style="background:#000; border:1px solid var(--amarillo); color:#fff; padding:8px; border-radius:6px; font-weight:bold;">
                    <option value="3000">3 Segundos</option>
                    <option value="5000" selected>5 Segundos</option>
                    <option value="8000">8 Segundos</option>
                </select>
                <button id="btn-pausa-elim" class="btn-abrir" style="background:#ff9900; color:#000; display:none;">PAUSAR</button>
                <button id="btn-reset-elim" class="btn-abrir" style="background:#333; color:#fff;">REINICIAR</button>
            </div>
            <div id="estado-partida" style="font-size:12px; font-weight:bold; color:var(--rojo); margin-bottom:10px; text-transform:uppercase;">ESTADO: DETENIDO</div>
            <div id="ultimo-num-elim" style="font-size:36px; font-weight:900; color:var(--amarillo); margin-bottom:15px;">--</div>
            <div id="tablero-grid-elim" style="display:grid; grid-template-columns:repeat(6, 1fr); gap:6px; max-width:600px; margin:0 auto;"></div>
        </div>`;

    const sorteoRef = ref(rtdb, `proyectos/${miCarpeta}/sorteos/${codJuego}`);
    let salidos = [];
    let intervaloAuto = null;

    onValue(sorteoRef, (snapshot) => {
        const data = snapshot.val() || {};
        const rawSalidos = data.sacados || [];
        salidos = Array.isArray(rawSalidos) ? rawSalidos.map(Number) : Object.values(rawSalidos).map(Number);
        const estadoJuego = data.estado || "detenido";

        const ultimo = salidos[salidos.length - 1] ? `ELIMINADO #${salidos[salidos.length - 1]}` : "--";
        const elem = document.getElementById('ultimo-num-elim');
        if(elem) elem.innerText = ultimo;

        const lblEstado = document.getElementById('estado-partida');
        if(lblEstado) {
            lblEstado.innerText = `ESTADO: ${estadoJuego.toUpperCase()}`;
            lblEstado.style.color = estadoJuego === 'activo' ? 'var(--rojo)' : (estadoJuego === 'pausado' ? '#ff9900' : '#888');
        }
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

    async function sacarAccion() {
        const disponibles = Array.from({length: totalPos}, (_, i) => i + 1).filter(n => !salidos.includes(n));
        if (disponibles.length === 0) {
            detenerAuto();
            alert("¡Todas las posiciones han sido eliminadas!");
            return;
        }
        const nuevo = disponibles[Math.floor(Math.random() * disponibles.length)];
        salidos.push(nuevo);
        await set(sorteoRef, { sacados: salidos, estado: "activo", ultimo: nuevo });
    }

    document.getElementById('btn-sacar-elim').onclick = async () => {
        detenerAuto();
        await sacarAccion();
    };

    const btnAuto = document.getElementById('btn-auto-elim');
    const btnPausa = document.getElementById('btn-pausa-elim');
    const selVel = document.getElementById('sel-vel-elim');

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

    document.getElementById('btn-reset-elim').onclick = async () => {
        if (confirm("¿Reiniciar Eliminatorias?")) {
            detenerAuto();
            await set(sorteoRef, { sacados: [], estado: "detenido", ultimo: null });
        }
    };
}