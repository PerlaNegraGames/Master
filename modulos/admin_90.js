import { ref, set, onValue } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";
import { updateDoc, doc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

export function iniciar(contenedor, db, miCarpeta, rtdb) {
    const codJuego = "90";
    const totalNumeros = 90;

    contenedor.innerHTML = `
        <div style="background:#080808; border:1px solid var(--verde); padding:20px; border-radius:15px; text-align:center;">
            <h2 style="color:var(--verde); margin-top:0;">BINGO 90 (PANEL DE CONTROL)</h2>
            
            <div style="display: flex; gap: 10px; margin-bottom: 15px; justify-content: center;">
                <button id="btn-comenzar-90" class="btn-abrir" style="background: var(--verde); color: #000; flex: 1; padding: 10px; font-weight: 900; border-radius: 6px; cursor: pointer;">🚀 COMENZAR PARTIDA</button>
                <button id="btn-reset-todo-90" class="btn-abrir" style="background: var(--amarillo); color: #000; flex: 1; padding: 10px; font-weight: 900; border-radius: 6px; cursor: pointer;">🔄 REINICIAR TODO Y SELECCIÓN</button>
            </div>

            <div style="display:flex; gap:8px; justify-content:center; align-items:center; margin-bottom:15px; flex-wrap:wrap;">
                <button id="btn-sacar-90" class="btn-abrir" style="background:var(--verde); color:#000;">SACAR NÚMERO</button>
                <button id="btn-auto-90" class="btn-abrir" style="background:var(--amarillo); color:#000;">▶ AUTOMÁTICO</button>
                <div style="display:flex; align-items:center; gap:5px; background:#000; border:1px solid var(--amarillo); padding:4px 8px; border-radius:6px;">
                    <span style="font-size:11px; color:#fff; font-weight:bold;">SEG:</span>
                    <input type="number" id="sel-vel-90" value="5" min="1" step="0.5" style="background:transparent; border:none; color:#fff; width:50px; font-weight:bold; text-align:center; outline:none;">
                </div>
                <button id="btn-pausa-90" class="btn-abrir" style="background:#ff9900; color:#000; display:none;">PAUSAR</button>
                <button id="btn-reset-90" class="btn-abrir" style="background:var(--rojo); color:#fff;">REINICIAR BOLAS</button>
            </div>
            <div id="estado-partida" style="font-size:12px; font-weight:bold; color:var(--verde); margin-bottom:10px; text-transform:uppercase;">ESTADO: DETENIDO</div>
            <div id="ultimo-num-90" style="font-size:40px; font-weight:900; color:var(--amarillo); margin-bottom:15px;">--</div>
            <div id="tablero-grid-90" style="display:grid; grid-template-columns:repeat(10, 1fr); gap:5px; max-width:600px; margin:0 auto;"></div>
        </div>`;

    const sorteoRef = ref(rtdb, `proyectos/${miCarpeta}/sorteos/${codJuego}`);
    let salidos = [];
    let intervaloAuto = null;

    document.getElementById('btn-comenzar-90').onclick = async () => {
        await updateDoc(doc(db, "proyectos", miCarpeta), { estado90Comenzado: true });
        alert("¡Partida de Bingo 90 comenzada! El tablero del jugador se ha activado.");
    };

    document.getElementById('btn-reset-todo-90').onclick = async () => {
        if (confirm("¿Reiniciar partida completa, borrar selecciones de los jugadores y bolas sacadas?")) {
            detenerAuto();
            await updateDoc(doc(db, "proyectos", miCarpeta), { estado90Comenzado: false });
            await set(ref(rtdb, `proyectos/${miCarpeta}/90Seleccion`), null);
            await set(sorteoRef, { sacados: [], estado: "detenido", ultimo: null });
            alert("¡Bingo 90 reiniciado por completo!");
        }
    };

    onValue(sorteoRef, (snapshot) => {
        const data = snapshot.val() || {};
        const rawSalidos = data.sacados || [];
        salidos = Array.isArray(rawSalidos) ? rawSalidos.map(Number) : Object.values(rawSalidos).map(Number);
        const estadoJuego = data.estado || "detenido";

        const ultimo = salidos.length > 0 ? salidos[salidos.length - 1] : "--";
        const elem = document.getElementById('ultimo-num-90');
        if(elem) elem.innerText = ultimo;

        const lblEstado = document.getElementById('estado-partida');
        if(lblEstado) {
            lblEstado.innerText = `ESTADO: ${estadoJuego.toUpperCase()}`;
            lblEstado.style.color = estadoJuego === 'activo' ? 'var(--verde)' : (estadoJuego === 'pausado' ? '#ff9900' : 'var(--rojo)');
        }
        renderTablero(salidos);
    });

    function renderTablero(salidosList) {
        let html = '';
        for (let i = 1; i <= totalNumeros; i++) {
            const mar = salidosList.includes(i);
            html += `<div style="background:${mar ? 'var(--verde)' : '#111'}; color:${mar ? '#000' : '#fff'}; padding:8px; border-radius:4px; font-weight:bold; font-size:12px;">${i}</div>`;
        }
        const grid = document.getElementById('tablero-grid-90');
        if(grid) grid.innerHTML = html;
    }

    async function sacarAccion() {
        let disponibles = [];
        for(let i=1; i<=totalNumeros; i++) {
            if(!salidos.includes(i)) disponibles.push(i);
        }
        if(disponibles.length === 0) {
            detenerAuto();
            alert("¡Se han sacado todos los números del 1 al 90!");
            return;
        }
        const randomIndex = Math.floor(Math.random() * disponibles.length);
        const numSocio = disponibles[randomIndex];
        
        salidos.push(numSocio);
        await set(sorteoRef, { sacados: salidos, estado: "activo", ultimo: numSocio });
    }

    document.getElementById('btn-sacar-90').onclick = async () => {
        detenerAuto();
        await sacarAccion();
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
        const vel = obtenerMilisegundos();
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
            const vel = obtenerMilisegundos();
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

    document.getElementById('btn-reset-90').onclick = async () => {
        if (confirm("¿Reiniciar bolas sacadas?")) {
            detenerAuto();
            await set(sorteoRef, { sacados: [], estado: "detenido", ultimo: null });
        }
    };
}