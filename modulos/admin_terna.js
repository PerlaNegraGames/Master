import { ref, set, onValue } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";
import { updateDoc, doc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

export function iniciar(contenedor, db, miCarpeta, rtdb) {
    const codJuego = "terna";

    contenedor.innerHTML = `
        <div style="background:#080808; border:1px solid var(--rosa); padding:20px; border-radius:15px; text-align:center;">
            <h2 style="color:var(--rosa); margin-top:0;">JUEGO DE TERNAS</h2>
            
            <div style="display: flex; gap: 10px; margin-bottom: 15px; justify-content: center;">
                <button id="btn-comenzar-terna" class="btn-abrir" style="background: var(--verde); color: #000; flex: 1; padding: 10px; font-weight: 900; border-radius: 6px; cursor: pointer;">🚀 COMENZAR PARTIDA</button>
                <button id="btn-reset-todo-terna" class="btn-abrir" style="background: var(--amarillo); color: #000; flex: 1; padding: 10px; font-weight: 900; border-radius: 6px; cursor: pointer;">🔄 REINICIAR TODO Y SELECCIÓN</button>
            </div>

            <div style="display:flex; gap:8px; justify-content:center; align-items:center; margin-bottom:15px; flex-wrap:wrap;">
                <button id="btn-sacar-terna" class="btn-abrir" style="background:var(--rosa); color:#fff;">SACAR BOLA</button>
                <button id="btn-auto-terna" class="btn-abrir" style="background:var(--amarillo); color:#000;">▶ AUTOMÁTICO</button>
                <div style="display:flex; align-items:center; gap:5px; background:#000; border:1px solid var(--amarillo); padding:4px 8px; border-radius:6px;">
                    <span style="font-size:11px; color:#fff; font-weight:bold;">SEG:</span>
                    <input type="number" id="sel-vel-terna" value="5" min="1" step="0.5" style="background:transparent; border:none; color:#fff; width:50px; font-weight:bold; text-align:center; outline:none;">
                </div>
                <button id="btn-pausa-terna" class="btn-abrir" style="background:#ff9900; color:#000; display:none;">PAUSAR</button>
                <button id="btn-reset-terna" class="btn-abrir" style="background:var(--rojo); color:#fff;">REINICIAR BOLAS</button>
            </div>
            <div id="estado-partida" style="font-size:12px; font-weight:bold; color:var(--rosa); margin-bottom:10px; text-transform:uppercase;">ESTADO: DETENIDO</div>
            <div id="ultimo-num-terna" style="font-size:40px; font-weight:900; color:var(--amarillo); margin-bottom:15px;">--</div>
            <div id="tablero-grid-terna" style="display:flex; flex-wrap:wrap; gap:6px; justify-content:center; max-width:650px; margin:0 auto; max-height: 200px; overflow-y: auto;"></div>
        </div>`;

    const sorteoRef = ref(rtdb, `proyectos/${miCarpeta}/sorteos/${codJuego}`);
    let salidos = [];
    let intervaloAuto = null;

    document.getElementById('btn-comenzar-terna').onclick = async () => {
        await updateDoc(doc(db, "proyectos", miCarpeta), { estadoTernaComenzado: true });
        alert("¡Partida de Ternas comenzada! El tablero cambió a Bingo 90.");
    };

    document.getElementById('btn-reset-todo-terna').onclick = async () => {
        if (confirm("¿Reiniciar partida completa, borrar selecciones de los jugadores y bolas sacadas?")) {
            detenerAuto();
            await updateDoc(doc(db, "proyectos", miCarpeta), { estadoTernaComenzado: false });
            await set(ref(rtdb, `proyectos/${miCarpeta}/ternaSeleccion`), null);
            await set(sorteoRef, { sacados: [], estado: "detenido", ultimo: null });
            alert("¡Ternas reiniciado por completo!");
        }
    };

    onValue(sorteoRef, (snapshot) => {
        const data = snapshot.val() || {};
        const rawSalidos = data.sacados || [];
        salidos = Array.isArray(rawSalidos) ? rawSalidos : Object.values(rawSalidos);
        const estadoJuego = data.estado || "detenido";

        const ultimo = salidos[salidos.length - 1] || "--";
        const elem = document.getElementById('ultimo-num-terna');
        if(elem) elem.innerText = ultimo;

        const lblEstado = document.getElementById('estado-partida');
        if(lblEstado) {
            lblEstado.innerText = `ESTADO: ${estadoJuego.toUpperCase()}`;
            lblEstado.style.color = estadoJuego === 'activo' ? 'var(--rosa)' : (estadoJuego === 'pausado' ? '#ff9900' : 'var(--rojo)');
        }
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

    async function sacarAccion() {
        // Saca un número del 1 al 90 para el bingo de terna
        let disponibles = [];
        for(let i=1; i<=90; i++) {
            if(!salidos.includes(String(i))) disponibles.push(String(i));
        }
        if(disponibles.length === 0) {
            detenerAuto();
            alert("¡Se han sacado todas las bolas del 1 al 90!");
            return;
        }
        const randomIndex = Math.floor(Math.random() * disponibles.length);
        const numSocio = disponibles[randomIndex];
        
        salidos.push(numSocio);
        await set(sorteoRef, { sacados: salidos, estado: "activo", ultimo: numSocio });
    }

    document.getElementById('btn-sacar-terna').onclick = async () => {
        detenerAuto();
        await sacarAccion();
    };

    const btnAuto = document.getElementById('btn-auto-terna');
    const btnPausa = document.getElementById('btn-pausa-terna');
    const inpVel = document.getElementById('sel-vel-terna');

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

    document.getElementById('btn-reset-terna').onclick = async () => {
        if (confirm("¿Reiniciar bolas sacadas?")) {
            detenerAuto();
            await set(sorteoRef, { sacados: [], estado: "detenido", ultimo: null });
        }
    };
}