import { ref, set, onValue } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";
import { updateDoc, doc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

export function iniciar(contenedor, db, miCarpeta, rtdb) {
    const listaFiesta = [
        "Globos", "Pastel", "Piñata", "Música", "Confeti", "Regalos", "Luces", "Serpentina", "Bebidas", "Antifaces", 
        "Velas", "Sorpresas", "DJ", "Bocinas", "Tarima", "Disfraces", "Máscaras", "Pitos", "Matatracas", "Gafas de Sol", 
        "Sombreros", "Corbatas locas", "Colores neón", "Pulseras LED", "Bengalas", "Humo de colores", "Burbujas", "Cañón de confeti", "Photobooth", "Cartel de bienvenida", 
        "Invitaciones", "Vasos rojos", "Hielera", "Chupitos", "Cócteles", "Tequilero", "Cervezas", "Vino", "Champaña", "Mesa de dulces", 
        "Botanas", "Papas fritas", "Palomitas", "Nueces", "Chocolates", "Gomitas", "Brochetas", "Mini hamburguesas", "Pizzetas", "Taquiza", 
        "Karaoke", "Micrófono", "Pantalla gigante", "Proyector", "Luces estroboscópicas", "Láser", "Bola disco", "Pista de baile", "Juegos de mesa", "Beer Pong", 
        "Jenga gigante", "Rueda de shots", "Ruleta loca", "Cartas", "Dados", "Concursos", "Premios", "Diplomas", "Coronas", "Bandas de honor", 
        "Baño portátil", "Limpieza", "Seguridad", "Invitados", "Anfitrión", "Cámara de fotos", "Cámara video", "Trípode", "Foco ring", "Cargador portátil", 
        "Wi-Fi", "Playlist", "Baile sorpresa", "Vals", "Brindis", "Discurso", "Palabras emotivas", "Llanto de alegría", "Abrazos", "Selfies", 
        "Historias IG", "TikTok", "Transmisión en vivo", "Hashtag", "Recuerditos", "Imanes", "Llaveros", "Tazas impresas", "Abanicos", "Pantuflas", 
        "Kits de resaca", "Pastillas", "Suero oral", "Café cargado", "Desayuno", "Chilaquiles", "Menudo", "Pozole crudo", "Limpieza final", "Bolsas de basura", 
        "Escoba", "Trapeador", "Aromatizante", "Despedida", "Agradecimientos", "Cierre", "Luces apagadas", "Puerta cerrada", "Llave maestra", "Fin de fiesta"
    ];
    const codJuego = "fiesta";

    contenedor.innerHTML = `
        <div style="background:#080808; border:1px solid #ff0099; padding:20px; border-radius:15px; text-align:center;">
            <h2 style="color:#ff0099; margin-top:0;">LOTERÍA FIESTA (120 OPCIONES)</h2>
            
            <div style="display: flex; gap: 10px; margin-bottom: 15px; justify-content: center;">
                <button id="btn-comenzar-fie" class="btn-abrir" style="background: var(--verde); color: #000; flex: 1; padding: 10px; font-weight: 900; border-radius: 6px; cursor: pointer;">🚀 COMENZAR PARTIDA</button>
                <button id="btn-reset-todo-fie" class="btn-abrir" style="background: var(--amarillo); color: #000; flex: 1; padding: 10px; font-weight: 900; border-radius: 6px; cursor: pointer;">🔄 REINICIAR TODO Y SELECCIÓN</button>
            </div>

            <div style="display:flex; gap:8px; justify-content:center; align-items:center; margin-bottom:15px; flex-wrap:wrap;">
                <button id="btn-sacar-fie" class="btn-abrir" style="background:#ff0099; color:#fff;">EXTRAER CARTA</button>
                <button id="btn-auto-fie" class="btn-abrir" style="background:var(--amarillo); color:#000;">▶ AUTOMÁTICO</button>
                <div style="display:flex; align-items:center; gap:5px; background:#000; border:1px solid var(--amarillo); padding:4px 8px; border-radius:6px;">
                    <span style="font-size:11px; color:#fff; font-weight:bold;">SEG:</span>
                    <input type="number" id="sel-vel-fie" value="5" min="1" step="0.5" style="background:transparent; border:none; color:#fff; width:50px; font-weight:bold; text-align:center; outline:none;">
                </div>
                <button id="btn-pausa-fie" class="btn-abrir" style="background:#ff9900; color:#000; display:none;">PAUSAR</button>
                <button id="btn-reset-fie" class="btn-abrir" style="background:var(--rojo); color:#fff;">REINICIAR BARAJA</button>
            </div>
            <div id="estado-partida" style="font-size:12px; font-weight:bold; color:#ff0099; margin-bottom:10px; text-transform:uppercase;">ESTADO: DETENIDO</div>
            <div id="ultimo-num-fie" style="font-size:32px; font-weight:900; color:var(--amarillo); margin-bottom:15px;">--</div>
            <div id="tablero-grid-fie" style="display:flex; flex-wrap:wrap; gap:6px; justify-content:center; max-width:700px; margin:0 auto; max-height: 200px; overflow-y: auto;"></div>
        </div>`;

    const sorteoRef = ref(rtdb, `proyectos/${miCarpeta}/sorteos/${codJuego}`);
    let salidos = [];
    let intervaloAuto = null;

    document.getElementById('btn-comenzar-fie').onclick = async () => {
        await updateDoc(doc(db, "proyectos", miCarpeta), { estadoFiestaComenzado: true });
        alert("¡Partida de Fiesta comenzada!");
    };

    document.getElementById('btn-reset-todo-fie').onclick = async () => {
        if (confirm("¿Reiniciar partida completa, borrar selecciones de los jugadores y cartas sacadas?")) {
            detenerAuto();
            await updateDoc(doc(db, "proyectos", miCarpeta), { estadoFiestaComenzado: false });
            await set(ref(rtdb, `proyectos/${miCarpeta}/fiestaSeleccion`), null);
            await set(sorteoRef, { sacados: [], estado: "detenido", ultimo: null });
            alert("¡Partida de Fiesta reiniciada por completo!");
        }
    };

    onValue(sorteoRef, (snapshot) => {
        const data = snapshot.val() || {};
        const rawSalidos = data.sacados || [];
        salidos = Array.isArray(rawSalidos) ? rawSalidos : Object.values(rawSalidos);
        const estadoJuego = data.estado || "detenido";

        const ultimo = salidos[salidos.length - 1] || "--";
        const elem = document.getElementById('ultimo-num-fie');
        if(elem) elem.innerText = ultimo;

        const lblEstado = document.getElementById('estado-partida');
        if(lblEstado) {
            lblEstado.innerText = `ESTADO: ${estadoJuego.toUpperCase()}`;
            lblEstado.style.color = estadoJuego === 'activo' ? '#ff0099' : (estadoJuego === 'pausado' ? '#ff9900' : 'var(--rojo)');
        }
        renderTablero(salidos);
    });

    function renderTablero(salidosList) {
        let html = '';
        listaFiesta.forEach((item, index) => {
            const numP = `#${index + 1}`;
            const mar = salidosList.includes(item);
            html += `<div style="background:${mar ? '#ff0099' : '#111'}; color:${mar ? '#fff' : '#aaa'}; padding:6px 10px; border-radius:4px; font-weight:bold; font-size:10px; text-transform:uppercase;">${numP} ${item}</div>`;
        });
        const grid = document.getElementById('tablero-grid-fie');
        if(grid) grid.innerHTML = html;
    }

    async function sacarAccion() {
        const disponibles = listaFiesta.filter(item => !salidos.includes(item));
        if (disponibles.length === 0) {
            detenerAuto();
            alert("¡Todas las cartas han salido!");
            return;
        }
        const nuevo = disponibles[Math.floor(Math.random() * disponibles.length)];
        salidos.push(nuevo);
        await set(sorteoRef, { sacados: salidos, estado: "activo", ultimo: nuevo });
    }

    document.getElementById('btn-sacar-fie').onclick = async () => {
        detenerAuto();
        await sacarAccion();
    };

    const btnAuto = document.getElementById('btn-auto-fie');
    const btnPausa = document.getElementById('btn-pausa-fie');
    const inpVel = document.getElementById('sel-vel-fie');

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

    document.getElementById('btn-reset-fie').onclick = async () => {
        if (confirm("¿Reiniciar baraja actual de Fiesta?")) {
            detenerAuto();
            await set(sorteoRef, { sacados: [], estado: "detenido", ultimo: null });
        }
    };
}