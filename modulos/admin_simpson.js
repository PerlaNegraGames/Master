import { ref, set, onValue } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

export function iniciar(contenedor, db, miCarpeta, rtdb) {
    const simpsons = ["Homero", "Marge", "Bart", "Lisa", "Maggie", "Ned Flanders", "Sr. Burns", "Smithers", "Moe", "Barney", "Krusty", "Milhouse"];
    const codJuego = "simpsons";

    contenedor.innerHTML = `
        <div style="background:#080808; border:1px solid var(--amarillo); padding:20px; border-radius:15px; text-align:center;">
            <h2 style="color:var(--amarillo); margin-top:0;">LOS SIMPSONS</h2>
            <div style="display:flex; gap:8px; justify-content:center; align-items:center; margin-bottom:15px; flex-wrap:wrap;">
                <button id="btn-sacar-simp" class="btn-abrir" style="background:var(--amarillo); color:#000;">SACAR PERSONAJE</button>
                <button id="btn-auto-simp" class="btn-abrir" style="background:var(--cian); color:#000;">▶ AUTOMÁTICO</button>
                <select id="sel-vel-simp" style="background:#000; border:1px solid var(--cian); color:#fff; padding:8px; border-radius:6px; font-weight:bold;">
                    <option value="3000">3 Segundos</option>
                    <option value="5000" selected>5 Segundos</option>
                    <option value="8000">8 Segundos</option>
                </select>
                <button id="btn-pausa-simp" class="btn-abrir" style="background:#ff9900; color:#000; display:none;">PAUSAR</button>
                <button id="btn-reset-simp" class="btn-abrir" style="background:var(--rojo); color:#fff;">REINICIAR</button>
            </div>
            <div id="estado-partida" style="font-size:12px; font-weight:bold; color:var(--amarillo); margin-bottom:10px; text-transform:uppercase;">ESTADO: DETENIDO</div>
            <div id="ultimo-num-simp" style="font-size:32px; font-weight:900; color:var(--cian); margin-bottom:15px;">--</div>
            <div id="tablero-grid-simp" style="display:grid; grid-template-columns:repeat(3, 1fr); gap:8px; max-width:600px; margin:0 auto;"></div>
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
        const elem = document.getElementById('ultimo-num-simp');
        if(elem) elem.innerText = ultimo;

        const lblEstado = document.getElementById('estado-partida');
        if(lblEstado) {
            lblEstado.innerText = `ESTADO: ${estadoJuego.toUpperCase()}`;
            lblEstado.style.color = estadoJuego === 'activo' ? 'var(--amarillo)' : (estadoJuego === 'pausado' ? '#ff9900' : 'var(--rojo)');
        }
        renderTablero(salidos);
    });

    function renderTablero(salidosList) {
        let html = '';
        simpsons.forEach(item => {
            const mar = salidosList.includes(item);
            html += `<div style="background:${mar ? 'var(--amarillo)' : '#111'}; color:${mar ? '#000' : '#aaa'}; padding:10px; border-radius:6px; font-weight:bold; font-size:11px; text-transform:uppercase;">${item}</div>`;
        });
        const grid = document.getElementById('tablero-grid-simp');
        if(grid) grid.innerHTML = html;
    }

    async function sacarAccion() {
        const disponibles = simpsons.filter(item => !salidos.includes(item));
        if (disponibles.length === 0) {
            detenerAuto();
            alert("¡Todos los personajes han salido!");
            return;
        }
        const nuevo = disponibles[Math.floor(Math.random() * disponibles.length)];
        salidos.push(nuevo);
        await set(sorteoRef, { sacados: salidos, estado: "activo", ultimo: nuevo });
    }

    document.getElementById('btn-sacar-simp').onclick = async () => {
        detenerAuto();
        await sacarAccion();
    };

    const btnAuto = document.getElementById('btn-auto-simp');
    const btnPausa = document.getElementById('btn-pausa-simp');
    const selVel = document.getElementById('sel-vel-simp');

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

    document.getElementById('btn-reset-simp').onclick = async () => {
        if (confirm("¿Reiniciar Los Simpsons?")) {
            detenerAuto();
            await set(sorteoRef, { sacados: [], estado: "detenido", ultimo: null });
        }
    };
}