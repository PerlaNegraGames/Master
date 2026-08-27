import { ref, set, onValue } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";
import { updateDoc, doc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

export function iniciar(contenedor, db, miCarpeta, rtdb) {
    const comidas = [
        "Pizza", "Hamburguesa", "Tacos", "Sushi", "Paella", "Asado", "Pasta", "Hot Dog", "Empanadas", "Arepas", 
        "Ceviche", "Pollo Frito", "Lasagna", "Burritos", "Quesadillas", "Enchiladas", "Tamales", "Pozole", "Mole", "Chiles Rellenos", 
        "Torta Ahogada", "Carnitas", "Barbacoa", "Birria", "Fajitas", "Nachos", "Guacamole", "Salchipapa", "Lomo Saltado", "Causa Rellena", 
        "Anticuchos", "Aji de Gallina", "Bandeja Paisa", "Sancocho", "Ajiaco", "Pupusas", "Gallo Pinto", "Vigorón", "Baleadas", "Chivito", 
        "Milanesa a la Napolitana", "Empanada Salteña", "Churrasco", "Curry", "Ramen", "Tempura", "Okonomiyaki", "Takoyaki", "Dim Sum", "Pato Pekín", 
        "Pad Thai", "Pho", "Banh Mi", "Kimchi", "Bibimbap", "Bulgogi", "Kebab", "Falafel", "Hummus", "Shawarma", 
        "Musaka", "Gyros", "Baklava", "Fish and Chips", "Shepherd's Pie", "Full English Breakfast", "Bangers and Mash", "Ratatouille", "Coq au Vin", "Bouillabaisse", 
        "Croissant", "Quiche Lorraine", "Fondue", "Raclette", "Schnitzel", "Pretzel", "Strudel", "Tortilla Española", "Paella Valenciana", "Gazpacho", 
        "Jamón Ibérico", "Croquetas", "Fabada Asturiana", "Pulpo a la Gallega", "Caldereta", "Risotto", "Carpaccio", "Bruschetta", "Minestrone", "Ossobuco", 
        "Gnocchi", "Ravioli", "Cannoli", "Tiramisú", "Gelato", "Waffles", "Pancakes", "Donas", "Brownie", "Cheesecake", 
        "Tres Leches", "Churros", "Flan", "Alfajores", "Tequeños", "Cachapas", "Hallacas", "Bolón de Verde", "Encocado", "Seco de Pollo", 
        "Chupe de Camarones", "Causa Limeña", "Arroz Chaufa", "Tallarin Saltado", "Cuy Chactado", "Papa a la Huancaína", "Ocopa", "Causa Acevichada", "Leche de Tigre", "Causa de Pollo"
    ];
    const codJuego = "comidas";

    contenedor.innerHTML = `
        <div style="background:#080808; border:1px solid var(--amarillo); padding:20px; border-radius:15px; text-align:center;">
            <h2 style="color:var(--amarillo); margin-top:0;">LOTERÍA COMIDAS (120 OPCIONES)</h2>
            
            <div style="display: flex; gap: 10px; margin-bottom: 15px; justify-content: center;">
                <button id="btn-comenzar-com" class="btn-abrir" style="background: var(--verde); color: #000; flex: 1; padding: 10px; font-weight: 900; border-radius: 6px; cursor: pointer;">🚀 COMENZAR PARTIDA</button>
                <button id="btn-reset-todo-com" class="btn-abrir" style="background: var(--amarillo); color: #000; flex: 1; padding: 10px; font-weight: 900; border-radius: 6px; cursor: pointer;">🔄 REINICIAR TODO Y SELECCIÓN</button>
            </div>

            <div style="display:flex; gap:8px; justify-content:center; align-items:center; margin-bottom:15px; flex-wrap:wrap;">
                <button id="btn-sacar-com" class="btn-abrir" style="background:var(--amarillo); color:#000;">EXTRAER PLATILLO</button>
                <button id="btn-auto-com" class="btn-abrir" style="background:var(--cian); color:#000;">▶ AUTOMÁTICO</button>
                <div style="display:flex; align-items:center; gap:5px; background:#000; border:1px solid var(--cian); padding:4px 8px; border-radius:6px;">
                    <span style="font-size:11px; color:#fff; font-weight:bold;">SEG:</span>
                    <input type="number" id="sel-vel-com" value="5" min="1" step="0.5" style="background:transparent; border:none; color:#fff; width:50px; font-weight:bold; text-align:center; outline:none;">
                </div>
                <button id="btn-pausa-com" class="btn-abrir" style="background:#ff9900; color:#000; display:none;">PAUSAR</button>
                <button id="btn-reset-com" class="btn-abrir" style="background:var(--rojo); color:#fff;">REINICIAR BARAJA</button>
            </div>
            <div id="estado-partida" style="font-size:12px; font-weight:bold; color:var(--amarillo); margin-bottom:10px; text-transform:uppercase;">ESTADO: DETENIDO</div>
            <div id="ultimo-num-com" style="font-size:32px; font-weight:900; color:var(--cian); margin-bottom:15px;">--</div>
            <div id="tablero-grid-com" style="display:flex; flex-wrap:wrap; gap:6px; justify-content:center; max-width:700px; margin:0 auto; max-height: 200px; overflow-y: auto;"></div>
        </div>`;

    const sorteoRef = ref(rtdb, `proyectos/${miCarpeta}/sorteos/${codJuego}`);
    let salidos = [];
    let intervaloAuto = null;

    document.getElementById('btn-comenzar-com').onclick = async () => {
        await updateDoc(doc(db, "proyectos", miCarpeta), { estadoComidasComenzado: true });
        alert("¡Partida de Comidas comenzada!");
    };

    document.getElementById('btn-reset-todo-com').onclick = async () => {
        if (confirm("¿Reiniciar partida completa, borrar selecciones de los jugadores y platillos sacados?")) {
            detenerAuto();
            await updateDoc(doc(db, "proyectos", miCarpeta), { estadoComidasComenzado: false });
            await set(ref(rtdb, `proyectos/${miCarpeta}/comidasSeleccion`), null);
            await set(sorteoRef, { sacados: [], estado: "detenido", ultimo: null });
            alert("¡Partida de Comidas reiniciada por completo!");
        }
    };

    onValue(sorteoRef, (snapshot) => {
        const data = snapshot.val() || {};
        const rawSalidos = data.sacados || [];
        salidos = Array.isArray(rawSalidos) ? rawSalidos : Object.values(rawSalidos);
        const estadoJuego = data.estado || "detenido";

        const ultimo = salidos[salidos.length - 1] || "--";
        const elem = document.getElementById('ultimo-num-com');
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
        comidas.forEach((item, index) => {
            const numP = `#${index + 1}`;
            const mar = salidosList.includes(item);
            html += `<div style="background:${mar ? 'var(--amarillo)' : '#111'}; color:${mar ? '#000' : '#aaa'}; padding:6px 10px; border-radius:4px; font-weight:bold; font-size:10px; text-transform:uppercase;">${numP} ${item}</div>`;
        });
        const grid = document.getElementById('tablero-grid-com');
        if(grid) grid.innerHTML = html;
    }

    async function sacarAccion() {
        const disponibles = comidas.filter(item => !salidos.includes(item));
        if (disponibles.length === 0) {
            detenerAuto();
            alert("¡Todos los platillos han salido!");
            return;
        }
        const nuevo = disponibles[Math.floor(Math.random() * disponibles.length)];
        salidos.push(nuevo);
        await set(sorteoRef, { sacados: salidos, estado: "activo", ultimo: nuevo });
    }

    document.getElementById('btn-sacar-com').onclick = async () => {
        detenerAuto();
        await sacarAccion();
    };

    const btnAuto = document.getElementById('btn-auto-com');
    const btnPausa = document.getElementById('btn-pausa-com');
    const inpVel = document.getElementById('sel-vel-com');

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

    document.getElementById('btn-reset-com').onclick = async () => {
        if (confirm("¿Reiniciar baraja actual de Comidas?")) {
            detenerAuto();
            await set(sorteoRef, { sacados: [], estado: "detenido", ultimo: null });
        }
    };
}