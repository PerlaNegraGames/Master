import { ref, set, onValue } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";
import { doc, updateDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

export function iniciar(contenedor, db, miCarpeta, rtdb) {
    const cartasMex = [
        "El Gallo", "El Diablito", "La Dama", "El Catrín", "El Paraguas", "La Sirena", "La Escalera", "La Botella", "El Barril", "El Árbol", 
        "El Melón", "El Valiente", "El Gorrito", "La Muerte", "La Pera", "La Bandera", "El Bandolón", "El Violoncello", "La Garza", "El Pájaro", 
        "La Mano", "La Bota", "El Cotorro", "El Borracho", "El Negrito", "El Corazón", "La Sandía", "El Tambor", "El Músico", "El Arpa", 
        "La Rana", "La Estrellita", "El Mundo", "El Apache", "El Nopal", "El Alacrán", "La Rosa", "La Calavera", "La Campana", "El Cantarito", 
        "El Venado", "El Sol", "La Corona", "La Chalupa", "El Pino", "El Pescado", "La Palma", "La Maceta", "El Faro", "El Catrín 2", 
        "La Guitarra", "La Manzana", "El Sombrero", "El Colibrí", "El Cascabel", "El Tecolote", "El Chapulín", "El metate", "El Molcajete", "El Sarape",
        "El Cántaro", "La Olla", "Los Jarritos", "El Comal", "El Soplador", "El Equipal", "El Chiquihuite", "El Guacamole", "El Ajolote", "El Xoloitzcuintle",
        "El Tacos", "El Alebrije", "El Trompo", "El papalote", "La Pirinola", "El Balero", "La Matatena", "El Rehilete", "La Catrina", "El Venadito",
        "La Zopilota", "El Tejón", "La ardilla", "El Zorrillo", "El Coyote", "El Tecolote", "La Lechuza", "El Buho", "La Mariposa", "El Gusano",
        "La Hormiga", "La Abeja", "La Mosca", "El Mosquito", "La Cucaracha", "El Caracol", "La Tortuga", "El Cangrejo", "La Langosta", "La Medusa",
        "La Ballena", "El Tiburón", "La Foca", "El Pingüino", "El Oso", "El Tigre", "El León", "El Elefante", "La Jirafa", "El Mono",
        "El Cerdito", "La Vaca", "El Toro", "El Caballo", "La Cabra", "La Oveja", "El Perrito", "El Gato", "El Loro", "El Canario"
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
                <div style="display:flex; align-items:center; gap:5px; background:#000; border:1px solid var(--amarillo); padding:4px 8px; border-radius:6px;">
                    <span style="font-size:11px; color:#fff; font-weight:bold;">SEG:</span>
                    <input type="number" id="sel-vel-mex" value="5" min="1" step="0.5" style="background:transparent; border:none; color:#fff; width:50px; font-weight:bold; text-align:center; outline:none;">
                </div>
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
    const inpVel = document.getElementById('sel-vel-mex');

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

    document.getElementById('btn-reset-mex').onclick = async () => {
        if (confirm("¿Reiniciar baraja actual?")) {
            detenerAuto();
            await set(sorteoRef, { sacados: [], estado: "detenido", ultimo: null });
        }
    };
}