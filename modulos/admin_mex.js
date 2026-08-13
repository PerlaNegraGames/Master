import { ref, set, onValue } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

export function iniciar(contenedor, db, miCarpeta, rtdb) {
    const cartasMex = ["El Gallo", "El Diablito", "La Dama", "El Catrín", "El Paraguas", "El Sireno", "La Escalera", "La Botella", "El Barril", "El Árbol", "El Melón", "El Valiente", "El Gorrito", "La Muerte", "La Pera", "La Bandera", "El Bandolón", "El Violoncello", "La Garza", "Pájaro", "La Mano", "La Bota", "El Cotorro", "El Borracho", "El Negrito", "El Corazón", "La Sandía", "El Tambor", "El Músico", "El Arpa", "La Rana"];
    const codJuego = "mex";

    contenedor.innerHTML = `
        <div style="background:#080808; border:1px solid #00ff66; padding:20px; border-radius:15px; text-align:center;">
            <h2 style="color:#00ff66; margin-top:0;">LOTERÍA MEXICANA</h2>
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
            <div id="tablero-grid-mex" style="display:grid; grid-template-columns:repeat(4, 1fr); gap:8px; max-width:600px; margin:0 auto;"></div>
        </div>`;

    const sorteoRef = ref(rtdb, `proyectos/${miCarpeta}/sorteos/${codJuego}`);
    let salidos = [];
    let intervaloAuto = null;

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
            html += `<div style="background:${mar ? '#00ff66' : '#111'}; color:${mar ? '#000' : '#aaa'}; padding:10px; border-radius:6px; font-weight:bold; font-size:11px; text-transform:uppercase;">${item}</div>`;
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
        if (confirm("¿Reiniciar Lotería Mexicana?")) {
            detenerAuto();
            await set(sorteoRef, { sacados: [], estado: "detenido", ultimo: null });
        }
    };
}