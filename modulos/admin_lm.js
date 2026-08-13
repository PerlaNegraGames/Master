import { ref, set, onValue } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

export function iniciar(contenedor, db, miCarpeta, rtdb) {
    const baraja = ["El Gallo", "El Diablito", "La Dama", "El Catrín", "El Paraguas", "La Sirena", "La Escalera", "La Botella", "El Barril", "El Árbol"];
    const codJuego = "lm";

    contenedor.innerHTML = `
        <div style="background:#080808; border:1px solid var(--rosa); padding:20px; border-radius:15px; text-align:center;">
            <h2 style="color:var(--rosa); margin-top:0;">LOTERÍA MEXICANA / FIGURAS</h2>
            <div style="display:flex; gap:8px; justify-content:center; align-items:center; margin-bottom:15px; flex-wrap:wrap;">
                <button id="btn-cantar" class="btn-abrir" style="background:var(--rosa); color:#fff;">CANTAR CARTA</button>
                <button id="btn-auto-lm" class="btn-abrir" style="background:var(--amarillo); color:#000;">▶ AUTOMÁTICO</button>
                <select id="sel-vel-lm" style="background:#000; border:1px solid var(--amarillo); color:#fff; padding:8px; border-radius:6px; font-weight:bold;">
                    <option value="3000">3 Segundos</option>
                    <option value="5000" selected>5 Segundos</option>
                    <option value="8000">8 Segundos</option>
                </select>
                <button id="btn-pausa-lm" class="btn-abrir" style="background:#ff9900; color:#000; display:none;">PAUSAR</button>
                <button id="btn-reset" class="btn-abrir" style="background:var(--rojo); color:#fff;">REINICIAR BARAJA</button>
            </div>
            <div id="estado-partida" style="font-size:12px; font-weight:bold; color:var(--rosa); margin-bottom:10px; text-transform:uppercase;">ESTADO: DETENIDO</div>
            <div id="carta-act" style="font-size:28px; font-weight:900; color:var(--cian); margin:20px 0;">--</div>
            <div id="historial-cartas" style="display:flex; flex-wrap:wrap; gap:8px; justify-content:center;"></div>
        </div>`;

    const sorteoRef = ref(rtdb, `proyectos/${miCarpeta}/sorteos/${codJuego}`);
    let cantadas = [];
    let intervaloAuto = null;

    onValue(sorteoRef, (snapshot) => {
        const data = snapshot.val() || {};
        const raw = data.sacados || [];
        cantadas = Array.isArray(raw) ? raw : Object.values(raw);
        const estadoJuego = data.estado || "detenido";

        const cartaElem = document.getElementById('carta-act');
        if (cartaElem) cartaElem.innerText = cantadas[cantadas.length - 1] || "PRESIONA CANTAR";

        const lblEstado = document.getElementById('estado-partida');
        if(lblEstado) {
            lblEstado.innerText = `ESTADO: ${estadoJuego.toUpperCase()}`;
            lblEstado.style.color = estadoJuego === 'activo' ? 'var(--rosa)' : (estadoJuego === 'pausado' ? '#ff9900' : 'var(--rojo)');
        }

        const histElem = document.getElementById('historial-cartas');
        if (histElem) {
            histElem.innerHTML = cantadas.map(c => 
                `<span style="background:#151515; border:1px solid var(--rosa); padding:5px 10px; border-radius:15px; font-size:12px; color:#fff;">${c}</span>`
            ).join('');
        }
    });

    async function sacarAccion() {
        const disponibles = baraja.filter(c => !cantadas.includes(c));
        if (disponibles.length === 0) {
            detenerAuto();
            alert("¡Se cantaron todas las cartas!");
            return;
        }
        const nueva = disponibles[Math.floor(Math.random() * disponibles.length)];
        cantadas.push(nueva);
        await set(sorteoRef, { sacados: cantadas, estado: "activo", ultimo: nueva });
    }

    document.getElementById('btn-cantar').onclick = async () => {
        detenerAuto();
        await sacarAccion();
    };

    const btnAuto = document.getElementById('btn-auto-lm');
    const btnPausa = document.getElementById('btn-pausa-lm');
    const selVel = document.getElementById('sel-vel-lm');

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
            await set(sorteoRef, { sacados: cantadas, estado: "pausado", ultimo: cantadas[cantadas.length - 1] || null });
        } else {
            const vel = parseInt(selVel.value) || 5000;
            btnPausa.innerText = "PAUSAR";
            intervaloAuto = setInterval(() => sacarAccion(), vel);
            await set(sorteoRef, { sacados: cantadas, estado: "activo", ultimo: cantadas[cantadas.length - 1] || null });
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

    document.getElementById('btn-reset').onclick = async () => {
        if (confirm("¿Reiniciar la baraja?")) {
            detenerAuto();
            await set(sorteoRef, { sacados: [], estado: "detenido", ultimo: null });
        }
    };
}