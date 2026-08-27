import { ref, set, onValue } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";
import { updateDoc, doc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

export function iniciar(contenedor, db, miCarpeta, rtdb) {
    const bebidas = [
        "Cerveza", "Tequila", "Ron", "Whisky", "Vodka", "Ginebra", "Sangría", "Margarita", "Mojito", "Pisco", 
        "Vino Tinto", "Champán", "Brandy", "Cognac", "Mezcal", "Fernet", "Anís", "Sidra", "Pulque", "Sake", 
        "Vermouth", "Campari", "Aperol", "Jägermeister", "Baileys", "Kahlúa", "Frangelico", "Amaretto", "Sambuca", "Grappa", 
        "Absenta", "Bourbon", "Scotch", "Vodka Tonic", "Piña Colada", "Daiquiri", "Cosmopolitan", "Manhattan", "Negroni", "Old Fashioned", 
        "Gin Tonic", "Bloody Mary", "Caipirinha", "Cuba Libre", "Tequila Sunrise", "Mimosa", "Bellini", "Mai Tai", "Zombie", "Long Island", 
        "Michelada", "Clamato", "Vino Blanco", "Vino Rosado", "Prosecco", "Cava", "Oporto", "Sherry", "Calvados", "Pacharán", 
        "Chinchón", "Sੋn", "Hidromiel", "Kombucha", "Agua Mineral", "Agua Tónica", "Refresco Cola", "Refresco Limón", "Refresco Naranja", "Agua Horchata", 
        "Agua Jamaica", "Agua Limón", "Jugo de Naranja", "Jugo de Manzana", "Jugo de Piña", "Jugo de Uva", "Jugo de Arándano", "Jugo de Tomate", "Limonada", "Naranjada", 
        "Café Espresso", "Café Americano", "Café Capuchino", "Café Latte", "Café Mocha", "Café Helado", "Mate", "Mate_Cocido", "Té Negro", "Té Verde", 
        "Té de Manzanilla", "Té de Menta", "Té Chai", "Mate", "Chocolate Caliente", "Atole", "Champurrado", "Licor de Melón", "Licor de Café", "Licor de Cacao", 
        "Licor de Naranja", "Licor de Hierbas", "Cerveza Oscura", "Cerveza Artesanal", "Cerveza IPA", "Cerveza Stout", "Cerveza Porter", "Cerveza Trigo", "Cerveza Sin Alcohol", "Sidra de Manzana", 
        "Vino Espumoso", "Vermut Rojo", "Vermut Blanco", "Punch de Frutas", "Zumo de Limón", "Zumo de Toronja", "Jarabe de Goma", "Granadina", "Bitter Angostura", "Agua de Coco"
    ];
    const codJuego = "bebida";

    contenedor.innerHTML = `
        <div style="background:#080808; border:1px solid var(--verde); padding:20px; border-radius:15px; text-align:center;">
            <h2 style="color:var(--verde); margin-top:0;">LOTERÍA BEBIDAS (120 OPCIONES)</h2>
            
            <div style="display: flex; gap: 10px; margin-bottom: 15px; justify-content: center;">
                <button id="btn-comenzar-beb" class="btn-abrir" style="background: var(--verde); color: #000; flex: 1; padding: 10px; font-weight: 900; border-radius: 6px; cursor: pointer;">🚀 COMENZAR PARTIDA</button>
                <button id="btn-reset-todo-beb" class="btn-abrir" style="background: var(--amarillo); color: #000; flex: 1; padding: 10px; font-weight: 900; border-radius: 6px; cursor: pointer;">🔄 REINICIAR TODO Y SELECCIÓN</button>
            </div>

            <div style="display:flex; gap:8px; justify-content:center; align-items:center; margin-bottom:15px; flex-wrap:wrap;">
                <button id="btn-sacar-beb" class="btn-abrir" style="background:var(--verde); color:#000;">EXTRAER BEBIDA</button>
                <button id="btn-auto-beb" class="btn-abrir" style="background:var(--amarillo); color:#000;">▶ AUTOMÁTICO</button>
                <div style="display:flex; align-items:center; gap:5px; background:#000; border:1px solid var(--amarillo); padding:4px 8px; border-radius:6px;">
                    <span style="font-size:11px; color:#fff; font-weight:bold;">SEG:</span>
                    <input type="number" id="sel-vel-beb" value="5" min="1" step="0.5" style="background:transparent; border:none; color:#fff; width:50px; font-weight:bold; text-align:center; outline:none;">
                </div>
                <button id="btn-pausa-beb" class="btn-abrir" style="background:#ff9900; color:#000; display:none;">PAUSAR</button>
                <button id="btn-reset-beb" class="btn-abrir" style="background:var(--rojo); color:#fff;">REINICIAR BARAJA</button>
            </div>
            <div id="estado-partida" style="font-size:12px; font-weight:bold; color:var(--verde); margin-bottom:10px; text-transform:uppercase;">ESTADO: DETENIDO</div>
            <div id="ultimo-num-beb" style="font-size:32px; font-weight:900; color:var(--amarillo); margin-bottom:15px;">--</div>
            <div id="tablero-grid-beb" style="display:flex; flex-wrap:wrap; gap:6px; justify-content:center; max-width:700px; margin:0 auto; max-height: 200px; overflow-y: auto;"></div>
        </div>`;

    const sorteoRef = ref(rtdb, `proyectos/${miCarpeta}/sorteos/${codJuego}`);
    let salidos = [];
    let intervaloAuto = null;

    document.getElementById('btn-comenzar-beb').onclick = async () => {
        await updateDoc(doc(db, "proyectos", miCarpeta), { estadoBebidaComenzado: true });
        alert("¡Partida de Bebidas comenzada!");
    };

    document.getElementById('btn-reset-todo-beb').onclick = async () => {
        if (confirm("¿Reiniciar partida completa, borrar selecciones de los jugadores y bebidas sacadas?")) {
            detenerAuto();
            await updateDoc(doc(db, "proyectos", miCarpeta), { estadoBebidaComenzado: false });
            await set(ref(rtdb, `proyectos/${miCarpeta}/bebidaSeleccion`), null);
            await set(sorteoRef, { sacados: [], estado: "detenido", ultimo: null });
            alert("¡Partida de Bebidas reiniciada por completo!");
        }
    };

    onValue(sorteoRef, (snapshot) => {
        const data = snapshot.val() || {};
        const rawSalidos = data.sacados || [];
        salidos = Array.isArray(rawSalidos) ? rawSalidos : Object.values(rawSalidos);
        const estadoJuego = data.estado || "detenido";

        const ultimo = salidos[salidos.length - 1] || "--";
        const elem = document.getElementById('ultimo-num-beb');
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
        bebidas.forEach((item, index) => {
            const numP = `#${index + 1}`;
            const mar = salidosList.includes(item);
            html += `<div style="background:${mar ? 'var(--verde)' : '#111'}; color:${mar ? '#000' : '#aaa'}; padding:6px 10px; border-radius:4px; font-weight:bold; font-size:10px; text-transform:uppercase;">${numP} ${item}</div>`;
        });
        const grid = document.getElementById('tablero-grid-beb');
        if(grid) grid.innerHTML = html;
    }

    async function sacarAccion() {
        const disponibles = bebidas.filter(item => !salidos.includes(item));
        if (disponibles.length === 0) {
            detenerAuto();
            alert("¡Todas las bebidas han salido!");
            return;
        }
        const nuevo = disponibles[Math.floor(Math.random() * disponibles.length)];
        salidos.push(nuevo);
        await set(sorteoRef, { sacados: salidos, estado: "activo", ultimo: nuevo });
    }

    document.getElementById('btn-sacar-beb').onclick = async () => {
        detenerAuto();
        await sacarAccion();
    };

    const btnAuto = document.getElementById('btn-auto-beb');
    const btnPausa = document.getElementById('btn-pausa-beb');
    const inpVel = document.getElementById('sel-vel-beb');

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

    document.getElementById('btn-reset-beb').onclick = async () => {
        if (confirm("¿Reiniciar baraja actual de Bebidas?")) {
            detenerAuto();
            await set(sorteoRef, { sacados: [], estado: "detenido", ultimo: null });
        }
    };
}
