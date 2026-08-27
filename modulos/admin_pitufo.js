import { ref, set, onValue } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";
import { updateDoc, doc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

export function iniciar(contenedor, db, miCarpeta, rtdb) {
    const pitufos = [
        "Papá Pitufo", "Pitufina", "Pitufo Filósofo", "Pitufo Fortachón", "Pitufo Goloso", "Pitufo Bromista", "Pitufo Pintor", "Pitufo Poeta", "Pitufo Perezoso", "Pitufo Vanidoso", 
        "Pitufo Panadero", "Pitufo Granjero", "Pitufo Músico", "Pitufo Constructor", "Pitufo Armonía", "Pitufo Genio", "Pitufo Minero", "Pitufo Labrador", "Pitufo Pescador", "Pitufo Cobarde", 
        "Pitufo Torpe", "Pitufo Curi", "Pitufo Somnámbulo", "Pitufo Llorón", "Pitufo Joyero", "Pitufo Sastre", "Pitufo Bombero", "Pitufo Relojero", "Pitufo Zapatero", "Pitufo Médico", 
        "Pitufo Carpintero", "Pitufo Jardinero", "Pitufo Alquimista", "Pitufo Astronauta", "Pitufo Detective", "Pitufo Actor", "Pitufo Mago", "Pitufo Acróbata", "Pitufo Malabarista", "Pitufo Payaso", 
        "Abuelo Pitufo", "Bebé Pitufo", "Pitufina Bebé", "Pitufo Salvaje", "Pitufo Natural", "Pitufo Duendecillo", "Pitufo Mecánico", "Pitufo Científico", "Pitufo Inventor", "Pitufo Fotógrafo", 
        "Gargamel", "Azrael", "Balthazar", "Hogatha", "Scruple", "Clorhidris", "Gromit", "Montblanc", "Joka", "Bicho Loco", 
        "Hombre de Nieve", "Duende Malo", "Bruja Malvada", "Dragón de Fuego", "Fantasioso", "Rey Gnomo", "Príncipe Gerardo", "Princesa Sabina", "Sir Lot", "Pillín", 
        "Sassette", "Nanny", "Homunkulus", "Vexy", "Hackus", "Klaus", "Johan", "Pirluit", "Gauvain", "Berta", 
        "Madam Pitufo", "Señor Otoño", "Señor Invierno", "Señor Verano", "Señor Primavera", "Madre Naturaleza", "Padre Tiempo", "Hada de los Sueños", "Espíritu del Bosque", "Duende de las CUEVAS", 
        "Trolls del Río", "Gigante Goliat", "Ogro Gruñón", "Pájaro Gigante", "Abeja Reina", "Mariposa Real", "Perrito Buitre", "Gato Montes", "Zorro Astuto", "Lobo Feroz", 
        "Búho Sabio", "Tortuga Veloz", "Rana Cantora", "Pez Dorado", "Delfín Azul", "Estrella de Mar", "Pulpo Gigante", "Sirena Encantada", "Unicornio Blanco", "Pegaso Alado", 
        "Fénix Dorado", "Grifo Valiente", "Centauro Noble", "Elfo del Viento", "Hada Madrina", "Duende de la Suerte", "Trol de las Montañas", "Espectro Errante", "Sombra Oscura", "Cristal Mágico"
    ];
    const codJuego = "pitufo";

    contenedor.innerHTML = `
        <div style="background:#080808; border:1px solid var(--cian); padding:20px; border-radius:15px; text-align:center;">
            <h2 style="color:var(--cian); margin-top:0;">LOTERÍA PITUFOS (120 OPCIONES)</h2>
            
            <div style="display: flex; gap: 10px; margin-bottom: 15px; justify-content: center;">
                <button id="btn-comenzar-pit" class="btn-abrir" style="background: var(--verde); color: #000; flex: 1; padding: 10px; font-weight: 900; border-radius: 6px; cursor: pointer;">🚀 COMENZAR PARTIDA</button>
                <button id="btn-reset-todo-pit" class="btn-abrir" style="background: var(--amarillo); color: #000; flex: 1; padding: 10px; font-weight: 900; border-radius: 6px; cursor: pointer;">🔄 REINICIAR TODO Y SELECCIÓN</button>
            </div>

            <div style="display:flex; gap:8px; justify-content:center; align-items:center; margin-bottom:15px; flex-wrap:wrap;">
                <button id="btn-sacar-pit" class="btn-abrir" style="background:var(--cian); color:#000;">EXTRAER PERSONAJE</button>
                <button id="btn-auto-pit" class="btn-abrir" style="background:var(--amarillo); color:#000;">▶ AUTOMÁTICO</button>
                <div style="display:flex; align-items:center; gap:5px; background:#000; border:1px solid var(--amarillo); padding:4px 8px; border-radius:6px;">
                    <span style="font-size:11px; color:#fff; font-weight:bold;">SEG:</span>
                    <input type="number" id="sel-vel-pit" value="5" min="1" step="0.5" style="background:transparent; border:none; color:#fff; width:50px; font-weight:bold; text-align:center; outline:none;">
                </div>
                <button id="btn-pausa-pit" class="btn-abrir" style="background:#ff9900; color:#000; display:none;">PAUSAR</button>
                <button id="btn-reset-pit" class="btn-abrir" style="background:var(--rojo); color:#fff;">REINICIAR BARAJA</button>
            </div>
            <div id="estado-partida" style="font-size:12px; font-weight:bold; color:var(--cian); margin-bottom:10px; text-transform:uppercase;">ESTADO: DETENIDO</div>
            <div id="ultimo-num-pit" style="font-size:32px; font-weight:900; color:var(--amarillo); margin-bottom:15px;">--</div>
            <div id="tablero-grid-pit" style="display:flex; flex-wrap:wrap; gap:6px; justify-content:center; max-width:700px; margin:0 auto; max-height: 200px; overflow-y: auto;"></div>
        </div>`;

    const sorteoRef = ref(rtdb, `proyectos/${miCarpeta}/sorteos/${codJuego}`);
    let salidos = [];
    let intervaloAuto = null;

    document.getElementById('btn-comenzar-pit').onclick = async () => {
        await updateDoc(doc(db, "proyectos", miCarpeta), { estadoPitufoComenzado: true });
        alert("¡Partida de Pitufos comenzada!");
    };

    document.getElementById('btn-reset-todo-pit').onclick = async () => {
        if (confirm("¿Reiniciar partida completa, borrar selecciones de los jugadores y personajes sacados?")) {
            detenerAuto();
            await updateDoc(doc(db, "proyectos", miCarpeta), { estadoPitufoComenzado: false });
            await set(ref(rtdb, `proyectos/${miCarpeta}/pitufoSeleccion`), null);
            await set(sorteoRef, { sacados: [], estado: "detenido", ultimo: null });
            alert("¡Partida de Pitufos reiniciada por completo!");
        }
    };

    onValue(sorteoRef, (snapshot) => {
        const data = snapshot.val() || {};
        const rawSalidos = data.sacados || [];
        salidos = Array.isArray(rawSalidos) ? rawSalidos : Object.values(rawSalidos);
        const estadoJuego = data.estado || "detenido";

        const ultimo = salidos[salidos.length - 1] || "--";
        const elem = document.getElementById('ultimo-num-pit');
        if(elem) elem.innerText = ultimo;

        const lblEstado = document.getElementById('estado-partida');
        if(lblEstado) {
            lblEstado.innerText = `ESTADO: ${estadoJuego.toUpperCase()}`;
            lblEstado.style.color = estadoJuego === 'activo' ? 'var(--cian)' : (estadoJuego === 'pausado' ? '#ff9900' : 'var(--rojo)');
        }
        renderTablero(salidos);
    });

    function renderTablero(salidosList) {
        let html = '';
        pitufos.forEach((item, index) => {
            const numP = `#${index + 1}`;
            const mar = salidosList.includes(item);
            html += `<div style="background:${mar ? 'var(--cian)' : '#111'}; color:${mar ? '#000' : '#aaa'}; padding:6px 10px; border-radius:4px; font-weight:bold; font-size:10px; text-transform:uppercase;">${numP} ${item}</div>`;
        });
        const grid = document.getElementById('tablero-grid-pit');
        if(grid) grid.innerHTML = html;
    }

    async function sacarAccion() {
        const disponibles = pitufos.filter(item => !salidos.includes(item));
        if (disponibles.length === 0) {
            detenerAuto();
            alert("¡Todos los personajes han salido!");
            return;
        }
        const nuevo = disponibles[Math.floor(Math.random() * disponibles.length)];
        salidos.push(nuevo);
        await set(sorteoRef, { sacados: salidos, estado: "activo", ultimo: nuevo });
    }

    document.getElementById('btn-sacar-pit').onclick = async () => {
        detenerAuto();
        await sacarAccion();
    };

    const btnAuto = document.getElementById('btn-auto-pit');
    const btnPausa = document.getElementById('btn-pausa-pit');
    const inpVel = document.getElementById('sel-vel-pit');

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

    document.getElementById('btn-reset-pit').onclick = async () => {
        if (confirm("¿Reiniciar baraja actual de Pitufos?")) {
            detenerAuto();
            await set(sorteoRef, { sacados: [], estado: "detenido", ultimo: null });
        }
    };
}