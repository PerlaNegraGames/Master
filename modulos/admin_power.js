import { ref, set, onValue } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";
import { doc, updateDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

export function iniciar(contenedor, db, miCarpeta, rtdb) {
    const codJuego = "power";

    contenedor.innerHTML = `
        <div style="background:#080808; border:1px solid #ffcc00; padding:20px; border-radius:15px; text-align:center; max-width:850px; margin:0 auto;">
            <h2 style="color:#ffcc00; margin-top:0;">LOTERÍA POWER - CONTROL</h2>
            
            <!-- FILA SUPERIOR DE BOTONES -->
            <div style="display:flex; gap:10px; justify-content:center; margin-bottom:15px; flex-wrap:wrap;">
                <button id="btn-comenzar-pow" class="btn-abrir" style="background:#39ff14; color:#000; font-weight:900; padding:12px 20px; border-radius:8px; cursor:pointer; flex:1; min-width:240px;">
                    🚀 COMENZAR PARTIDA
                </button>
                <button id="btn-reset-todo-pow" class="btn-abrir" style="background:#ffff00; color:#000; font-weight:900; padding:12px 20px; border-radius:8px; cursor:pointer; flex:1; min-width:240px;">
                    🔄 REINICIAR TODO Y SELECCIÓN
                </button>
            </div>

            <!-- FILA INFERIOR DE BOTONES DE EXTRACCIÓN -->
            <div style="display:flex; gap:10px; justify-content:center; align-items:center; margin-bottom:15px; flex-wrap:wrap;">
                <button id="btn-sacar-pow" class="btn-abrir" style="background:#00f3ff; color:#000; font-weight:900; padding:10px 18px; border-radius:8px; cursor:pointer;">
                    EXTRAER POWER
                </button>
                <button id="btn-auto-pow" class="btn-abrir" style="background:#ffff00; color:#000; font-weight:900; padding:10px 18px; border-radius:8px; cursor:pointer;">
                    ▶ AUTOMÁTICO
                </button>
                <button id="btn-pausa-pow" class="btn-abrir" style="background:#ff9900; color:#000; font-weight:900; padding:10px 18px; border-radius:8px; cursor:pointer; display:none;">
                    PAUSAR
                </button>
                
                <div style="display:flex; align-items:center; gap:5px; background:#000; border:1px solid #fff; padding:6px 10px; border-radius:8px;">
                    <span style="font-size:11px; color:#fff; font-weight:bold;">SEG:</span>
                    <input type="number" id="sel-vel-pow" value="5" min="1" step="0.5" style="background:transparent; border:none; color:#fff; width:45px; font-weight:bold; text-align:center; outline:none;">
                </div>

                <button id="btn-reset-baraja-pow" class="btn-abrir" style="background:#ff0000; color:#fff; font-weight:900; padding:10px 18px; border-radius:8px; cursor:pointer;">
                    REINICIAR BARAJA
                </button>
            </div>

            <div id="estado-partida" style="font-size:12px; font-weight:bold; color:#ffcc00; margin-bottom:10px; text-transform:uppercase;">ESTADO: DETENIDO</div>
            <div id="ultimo-num-pow" style="font-size:36px; font-weight:900; color:#ffcc00; margin-bottom:15px; text-shadow: 0 0 10px rgba(255,204,0,0.4);">--</div>
            <div id="tablero-grid-pow" style="display:flex; flex-wrap:wrap; gap:8px; justify-content:center; max-height:350px; overflow-y:auto; padding:10px;"></div>
        </div>`;

    const sorteoRef = ref(rtdb, `proyectos/${miCarpeta}/sorteos/${codJuego}`);
    const proyectoRef = doc(db, "proyectos", miCarpeta);
    
    let salidos = [];
    let intervaloAuto = null;

    const listaPowers = [
        "Abas", "Action", "Adele", "Aero", "Aliens", "All", "Alpha", "Always", "Amor", "Animate",
        "Apex", "Aqua", "Arcade", "Arrow", "Art", "Asylum", "Auto", "Avatar", "Baby", "Badge",
        "Ball", "Balloons", "Band", "Banner", "Base", "Bat", "Beam", "Bear", "Beast", "Bed",
        "Beer", "Bell", "Belly", "Big", "Bike", "Bird", "Birth", "Bite", "Black", "Blaze",
        "Blind", "Blink", "Blob", "Blood", "Blue", "Board", "Boat", "Bomb", "Bone", "Book",
        "Boom", "Boot", "Boss", "Bottle", "Bounce", "Box", "Boy", "Brain", "Bread", "Break",
        "Brick", "Bridge", "Bright", "Bring", "Broken", "Brothers", "Brown", "Brush", "Bubble", "Buckle",
        "Bud", "Bug", "Build", "Bulb", "Bull", "Bullet", "Bunny", "Burn", "Bus", "Bush",
        "Bust", "Busy", "Butter", "Button", "Buy", "Buzz", "Cactus", "Cake", "Calm", "Camera",
        "Camp", "Can", "Candle", "Candy", "Canoe", "Cap", "Car", "Card", "Care", "Carpet",
        "Carrot", "Cart", "Case", "Cash", "Castle", "Cat", "Catch", "Cater", "Cause", "Cave",
        "CD", "Cell", "Cent", "Chain", "Chair", "Chalk", "Chance", "Change", "Channel", "Chaos"
    ];

    onValue(sorteoRef, (snapshot) => {
        const data = snapshot.val() || {};
        const rawSalidos = data.sacados || [];
        salidos = Array.isArray(rawSalidos) ? rawSalidos : Object.values(rawSalidos);
        const estadoJuego = data.estado || "detenido";

        const ultimo = salidos[salidos.length - 1] || "--";
        const elem = document.getElementById('ultimo-num-pow');
        if(elem) elem.innerText = ultimo;

        const lblEstado = document.getElementById('estado-partida');
        if(lblEstado) {
            lblEstado.innerText = `ESTADO: ${estadoJuego.toUpperCase()}`;
            lblEstado.style.color = estadoJuego === 'activo' ? '#39ff14' : (estadoJuego === 'pausado' ? '#ff9900' : '#ff0000');
        }
        renderTablero(salidos);
    });

    function renderTablero(salidosList) {
        const grid = document.getElementById('tablero-grid-pow');
        if(grid) {
            grid.innerHTML = salidosList.map(item => 
                `<div style="background:#39ff14; color:#000; padding:6px 10px; border-radius:15px; font-weight:900; font-size:11px; text-transform:uppercase;">${item}</div>`
            ).join('');
        }
    }

    async function sacarAccion() {
        const disponibles = listaPowers.filter(p => !salidos.includes(p));
        if (disponibles.length === 0) {
            detenerAuto();
            alert("¡Ya han salido todos los powers de la lista!");
            return;
        }
        const randomIndex = Math.floor(Math.random() * disponibles.length);
        const powerElegido = disponibles[randomIndex];

        salidos.push(powerElegido);
        await set(sorteoRef, { sacados: salidos, estado: "activo", ultimo: powerElegido });
    }

    document.getElementById('btn-comenzar-pow').onclick = async () => {
        await updateDoc(proyectoRef, { estadoPowerComenzado: true });
        await set(sorteoRef, { sacados: salidos, estado: "activo", ultimo: salidos[salidos.length - 1] || null });
        alert("¡Partida comenzada! La fase de selección se ha cerrado para los jugadores.");
    };

    document.getElementById('btn-reset-todo-pow').onclick = async () => {
        if (confirm("¿Estás seguro de reiniciar todo, incluyendo las selecciones de los jugadores?")) {
            detenerAuto();
            await set(sorteoRef, { sacados: [], estado: "detenido", ultimo: null });
            await updateDoc(proyectoRef, { estadoPowerComenzado: false });
            
            const seleccionRef = ref(rtdb, `proyectos/${miCarpeta}/powerSeleccion`);
            await set(seleccionRef, null);
            alert("¡Se ha reiniciado por completo el juego y las selecciones!");
        }
    };

    document.getElementById('btn-sacar-pow').onclick = async () => {
        detenerAuto();
        await sacarAccion();
    };

    const btnAuto = document.getElementById('btn-auto-pow');
    const btnPausa = document.getElementById('btn-pausa-pow');
    const inpVel = document.getElementById('sel-vel-pow');

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

    document.getElementById('btn-reset-baraja-pow').onclick = async () => {
        if (confirm("¿Reiniciar únicamente la baraja de extracción?")) {
            detenerAuto();
            await set(sorteoRef, { sacados: [], estado: "detenido", ultimo: null });
        }
    };
}