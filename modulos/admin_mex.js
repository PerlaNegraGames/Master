import { ref, set, onValue } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

export function iniciar(contenedor, db, miCarpeta, rtdb) {
    import("https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js").then(async ({ doc, updateDoc }) => {
        const cartasMex = [
            "El Gallo", "El Diablito", "La Dama", "El Catrín", "El Paraguas", "La Sirena", "La Escalera", "La Botella", "El Barril", "El Árbol", 
            "El Melón", "El Valiente", "El Gorrito", "La Muerte", "La Pera", "La Bandera", "El Bandolón", "El Violoncello", "La Garza", "El Pájaro", 
            "La Mano", "La Bota", "El Cotorro", "El Borracho", "El Negrito", "El Corazón", "La Sandía", "El Tambor", "El Músico", "El Arpa", 
            "La Rana", "La Estrellita", "El Mundo", "El Apache", "El Nopal", "El Alacrán", "La Rosa", "La Calavera", "La Campana", "El Cantarito", 
            "El Venado", "El Sol", "La Corona", "La Chalupa", "El Pino", "El Pescado", "La Palma", "La Maceta", "El Faro", "El Catrín 2", 
            "Carta 51", "Carta 52", "Carta 53", "Carta 54", "Carta 55", "Carta 56", "Carta 57", "Carta 58", "Carta 59", "Carta 60",
            "Carta 61", "Carta 62", "Carta 63", "Carta 64", "Carta 65", "Carta 66", "Carta 67", "Carta 68", "Carta 69", "Carta 70",
            "Carta 71", "Carta 72", "Carta 73", "Carta 74", "Carta 75", "Carta 76", "Carta 77", "Carta 78", "Carta 79", "Carta 80",
            "Carta 81", "Carta 82", "Carta 83", "Carta 84", "Carta 85", "Carta 86", "Carta 87", "Carta 88", "Carta 89", "Carta 90",
            "Carta 91", "Carta 92", "Carta 93", "Carta 94", "Carta 95", "Carta 96", "Carta 97", "Carta 98", "Carta 99", "Carta 100",
            "Carta 101", "Carta 102", "Carta 103", "Carta 104", "Carta 105", "Carta 106", "Carta 107", "Carta 108", "Carta 109", "Carta 110",
            "Carta 111", "Carta 112", "Carta 113", "Carta 114", "Carta 115", "Carta 116", "Carta 117", "Carta 118", "Carta 119", "Carta 120"
        ];
        const codJuego = "mex";

        contenedor.innerHTML = `
            <div style="background:#080808; border:1px solid #00ff66; padding:20px; border-radius:15px; text-align:center;">
                <h2 style="color:#00ff66; margin-top:0;">LOTERÍA MEXICANA (120 CARTAS)</h2>
                
                <div style="display: flex; gap: 10px; margin-bottom: 15px; justify-content: center;">
                    <button id="btn-comenzar-mex" class="btn-abrir" style="background: var(--verde); color: #000; flex: 1; padding: 10px; font-weight: 900; border-radius: 6px; cursor: pointer;">🚀 COMENZAR PARTIDA</button>
                    <button id="btn-reset-todo-mex" class="btn-abrir" style="background: var(--amarillo); color: #000; flex: 1; padding: 10px; font-weight: 900; border-radius: 6px; cursor: pointer;">🔄 REINICIAR TODO Y SELECCIÓN</button>
                </div>

                <div style="display:flex; gap:8px; justify-content:center; align-items:center; margin-bottom:15px; flex-wrap:wrap;">
                    <button id="btn-sacar-mex" class="btn-abrir" style="background:#00ff66; color:#000;">EXTRAER CARTA</button>
                    <button id="btn-auto-mex" class="btn-abrir" style="background:var(--amarillo); color:#000;">▶ AUTOMÁTICO</button>
                    <select id="sel-vel-mex" style="background:#000; border:1px solid var(--amarillo); color:#fff; padding:8px; border-radius:6px; font-weight:bold;">
                        <option value="3000">3 Segundos</option>
                        <option value="5000" selected>5 Segundos</option>
                        <option value="8000">8 Segundos</option>
                    </select>
                    <button id="btn-pausa-mex" class="btn-abrir" style="background:#ff9900; color:#000; display:none;">PAUSAR</button>
                    <button id="btn-reset-mex" class="btn-abrir" style="background:var(--rojo); color:#fff;">REINICIAR BARAJA</button>
                </div>
                <div id="estado-partida" style="font-size:12px; font-weight:bold; color:#00ff66; margin-bottom:10px; text-transform:uppercase;">ESTADO: DETENIDO</div>
                <div id="ultimo-num-mex" style="font-size:32px; font-weight:900; color:var(--amarillo); margin-bottom:15px;">--</div>
                <div id="tablero-grid-mex" style="display:flex; flex-wrap:wrap; gap:6px; justify-content:center; max-width:700px; margin:0 auto; max-height: 200px; overflow-y: auto;"></div>
            </div>`;

        const sorteoRef = ref(rtdb, `proyectos/${miCarpeta}/sorteos/${codJuego}`);
        let salidos = [];
        let intervaloAuto = null;

        document.getElementById('btn-comenzar-mex').onclick = async () => {
            await updateDoc(doc(db, "proyectos", miCarpeta), { estadoMexComenzado: true });
            alert("¡Partida de Lotería Mexicana comenzada!");
        };

        document.getElementById('btn-reset-todo-mex').onclick = async () => {
            if (confirm("¿Reiniciar partida completa, borrar selecciones de los jugadores y cartas cantadas?")) {
                detenerAuto();
                await updateDoc(doc(db, "proyectos", miCarpeta), { estadoMexComenzado: false });
                await set(ref(rtdb, `proyectos/${miCarpeta}/mexSeleccion`), null);
                await set(sorteoRef, { sacados: [], estado: "detenido", ultimo: null });
                alert("¡Lotería Mexicana reiniciada por completo!");
            }
        };

        onValue(sorteoRef, (snapshot) => {
            const data = snapshot.val() || {};
            const rawSalidos = data.sacados || [];
            salidos = Array.isArray(rawSalidos) ? rawSalidos : Object.values(rawSalidos);
            const estadoJuego = data.estado || "detenido";

            const ultimo = salidos[salidos.length - 1] || "--";
            const elem = document.getElementById('ultimo-num-mex');
            if(elem) elem.innerText = ultimo;

            const lblEstado = document.getElementById('estado-partida');
            if(lblEstado) {
                lblEstado.innerText = `ESTADO: ${estadoJuego.toUpperCase()}`;
                lblEstado.style.color = estadoJuego === 'activo' ? '#00ff66' : (estadoJuego === 'pausado' ? '#ff9900' : 'var(--rojo)');
            }
            renderTablero(salidos);
        });

        function renderTablero(salidosList) {
            let html = '';
            cartasMex.forEach(item => {
                const mar = salidosList.includes(item);
                html += `<div style="background:${mar ? '#00ff66' : '#111'}; color:${mar ? '#000' : '#aaa'}; padding:6px 10px; border-radius:4px; font-weight:bold; font-size:10px; text-transform:uppercase;">${item}</div>`;
            });
            const grid = document.getElementById('tablero-grid-mex');
            if(grid) grid.innerHTML = html;
        }

        async function sacarAccion() {
            const disponibles = cartasMex.filter(item => !salidos.includes(item));
            if (disponibles.length === 0) {
                detenerAuto();
                alert("¡Todas las cartas han salido!");
                return;
            }
            const nuevo = disponibles[Math.floor(Math.random() * disponibles.length)];
            salidos.push(nuevo);
            await set(sorteoRef, { sacados: salidos, estado: "activo", ultimo: nuevo });
        }

        document.getElementById('btn-sacar-mex').onclick = async () => {
            detenerAuto();
            await sacarAccion();
        };

        const btnAuto = document.getElementById('btn-auto-mex');
        const btnPausa = document.getElementById('btn-pausa-mex');
        const selVel = document.getElementById('sel-vel-mex');

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

        document.getElementById('btn-reset-mex').onclick = async () => {
            if (confirm("¿Reiniciar baraja actual?")) {
                detenerAuto();
                await set(sorteoRef, { sacados: [], estado: "detenido", ultimo: null });
            }
        };
    });
}