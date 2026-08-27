import { ref, set, onValue } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

export function iniciar(contenedor, db, miCarpeta, rtdb) {
    import("https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js").then(async ({ doc, updateDoc }) => {
        const codJuego = "inv";

        contenedor.innerHTML = `
            <div style="background:#080808; border:1px solid var(--cian); padding:20px; border-radius:15px; text-align:center;">
                <h2 style="color:var(--cian); margin-top:0;">JUEGO INVERTIDOS (BINGO 90)</h2>
                
                <!-- BOTONES SUPERIORES: COMENZAR Y REINICIAR SELECCIÓN -->
                <div style="display: flex; gap: 10px; margin-bottom: 15px; justify-content: center;">
                    <button id="btn-comenzar-inv" class="btn-abrir" style="background: var(--verde); color: #000; flex: 1; padding: 10px; font-weight: 900; border-radius: 6px; cursor: pointer;">🚀 COMENZAR PARTIDA</button>
                    <button id="btn-reset-todo-inv" class="btn-abrir" style="background: var(--amarillo); color: #000; flex: 1; padding: 10px; font-weight: 900; border-radius: 6px; cursor: pointer;">🔄 REINICIAR TODO Y SELECCIÓN</button>
                </div>

                <div style="display:flex; gap:8px; justify-content:center; align-items:center; margin-bottom:15px; flex-wrap:wrap;">
                    <button id="btn-sacar-inv" class="btn-abrir" style="background:var(--cian); color:#000;">GENERAR NÚMERO</button>
                    <button id="btn-auto-inv" class="btn-abrir" style="background:var(--amarillo); color:#000;">▶ AUTOMÁTICO</button>
                    <div style="display:flex; align-items:center; gap:5px; background:#000; border:1px solid var(--amarillo); padding:4px 8px; border-radius:6px;">
                        <span style="font-size:11px; color:#fff; font-weight:bold;">SEG:</span>
                        <input type="number" id="sel-vel-inv" value="5" min="1" step="0.5" style="background:transparent; border:none; color:#fff; width:50px; font-weight:bold; text-align:center; outline:none;">
                    </div>
                    <button id="btn-pausa-inv" class="btn-abrir" style="background:#ff9900; color:#000; display:none;">PAUSAR</button>
                    <button id="btn-reset-inv" class="btn-abrir" style="background:var(--rojo); color:#fff;">REINICIAR BOLA</button>
                </div>
                <div id="estado-partida" style="font-size:12px; font-weight:bold; color:var(--cian); margin-bottom:10px; text-transform:uppercase;">ESTADO: DETENIDO</div>
                <div id="ultimo-num-inv" style="font-size:45px; font-weight:900; color:var(--verde); margin-bottom:15px;">--</div>
                <div id="tablero-grid-inv" style="display:flex; flex-wrap:wrap; gap:8px; justify-content:center; max-width:600px; margin:0 auto;"></div>
            </div>`;

        const sorteoRef = ref(rtdb, `proyectos/${miCarpeta}/sorteos/${codJuego}`);
        let salidos = [];
        let intervaloAuto = null;

        document.getElementById('btn-comenzar-inv').onclick = async () => {
            await updateDoc(doc(db, "proyectos", miCarpeta), { estadoInvertidosComenzado: true });
            alert("¡Partida de Invertidos comenzada! La pantalla de jugadores cambió al tablero de 90.");
        };

        document.getElementById('btn-reset-todo-inv').onclick = async () => {
            if (confirm("¿Reiniciar partida completa, borrar selecciones de los jugadores y números sacados?")) {
                detenerAuto();
                await updateDoc(doc(db, "proyectos", miCarpeta), { estadoInvertidosComenzado: false });
                await set(ref(rtdb, `proyectos/${miCarpeta}/invertidosSeleccion`), null);
                await set(sorteoRef, { sacados: [], estado: "detenido", ultimo: null });
                alert("¡Invertidos reiniciado por completo!");
            }
        };

        onValue(sorteoRef, (snapshot) => {
            const data = snapshot.val() || {};
            const rawSalidos = data.sacados || [];
            salidos = Array.isArray(rawSalidos) ? rawSalidos : Object.values(rawSalidos);
            const estadoJuego = data.estado || "detenido";

            const ultimo = salidos[salidos.length - 1] || "--";
            const elem = document.getElementById('ultimo-num-inv');
            if(elem) elem.innerText = ultimo;

            const lblEstado = document.getElementById('estado-partida');
            if(lblEstado) {
                lblEstado.innerText = `ESTADO: ${estadoJuego.toUpperCase()}`;
                lblEstado.style.color = estadoJuego === 'activo' ? 'var(--cian)' : (estadoJuego === 'pausado' ? '#ff9900' : 'var(--rojo)');
            }
            renderTablero(salidos);
        });

        function renderTablero(salidosList) {
            const grid = document.getElementById('tablero-grid-inv');
            if(grid) {
                grid.innerHTML = salidosList.map(item => 
                    `<div style="background:var(--cian); color:#000; padding:8px 12px; border-radius:6px; font-weight:900; font-size:14px;">${item}</div>`
                ).join('');
            }
        }

        async function sacarAccion() {
            let disponibles = [];
            for (let i = 1; i <= 90; i++) {
                if (!salidos.includes(i) && !salidos.includes(String(i))) {
                    disponibles.push(i);
                }
            }

            if (disponibles.length === 0) {
                detenerAuto();
                alert("¡Se han sorteado todos los números del 1 al 90!");
                return;
            }

            const randomIndex = Math.floor(Math.random() * disponibles.length);
            const elegido = disponibles[randomIndex];

            salidos.push(elegido);
            await set(sorteoRef, { sacados: salidos, estado: "activo", ultimo: elegido });
        }

        document.getElementById('btn-sacar-inv').onclick = async () => {
            detenerAuto();
            await sacarAccion();
        };

        const btnAuto = document.getElementById('btn-auto-inv');
        const btnPausa = document.getElementById('btn-pausa-inv');
        const inpVel = document.getElementById('sel-vel-inv');

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

        document.getElementById('btn-reset-inv').onclick = async () => {
            if (confirm("¿Reiniciar bola actual y números sacados?")) {
                detenerAuto();
                await set(sorteoRef, { sacados: [], estado: "detenido", ultimo: null });
            }
        };
    });
}