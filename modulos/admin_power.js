import { doc, setDoc, onSnapshot } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

export function iniciar(contenedor, db, miCarpeta) {
    contenedor.innerHTML = `
        <div style="background:#080808; border:1px solid #ffcc00; padding:20px; border-radius:15px; text-align:center;">
            <h2 style="color:#ffcc00; margin-top:0;">LOTERÍA POWER</h2>
            <div style="display:flex; gap:10px; justify-content:center; margin-bottom:15px;">
                <button id="btn-sacar-pow" class="btn-abrir" style="background:#ffcc00; color:#000;">GENERAR POWER BALL</button>
                <button id="btn-reset-pow" class="btn-abrir" style="background:var(--rojo); color:#fff;">REINICIAR</button>
            </div>
            <div id="ultimo-num-pow" style="font-size:36px; font-weight:900; color:#fff; margin-bottom:15px;">--</div>
            <div id="tablero-grid-pow" style="display:flex; flex-wrap:wrap; gap:8px; justify-content:center; max-width:600px; margin:0 auto;"></div>
        </div>`;

    const refJuego = doc(db, "proyectos", miCarpeta, "juegosData", "loteriaPower");
    let salidos = [];

    onSnapshot(refJuego, (snap) => {
        if (snap.exists()) {
            salidos = snap.data().salidos || [];
            const ultimo = salidos[salidos.length - 1] || "--";
            const elem = document.getElementById('ultimo-num-pow');
            if(elem) elem.innerText = ultimo;
            renderTablero(salidos);
        } else {
            renderTablero([]);
        }
    });

    function renderTablero(salidosList) {
        const grid = document.getElementById('tablero-grid-pow');
        if(grid) {
            grid.innerHTML = salidosList.map(item => 
                `<div style="background:#ffcc00; color:#000; padding:8px 12px; border-radius:20px; font-weight:900; font-size:13px;">${item}</div>`
            ).join('');
        }
    }

    document.getElementById('btn-sacar-pow').onclick = async () => {
        const num = Math.floor(Math.random() * 69) + 1;
        const power = Math.floor(Math.random() * 26) + 1;
        const combo = `Nº ${num} [POWER: ${power}]`;
        salidos.push(combo);
        await setDoc(refJuego, { salidos: salidos, ultimo: combo }, { merge: true });
    };

    document.getElementById('btn-reset-pow').onclick = async () => {
        if (confirm("¿Reiniciar Lotería Power?")) {
            await setDoc(refJuego, { salidos: [], ultimo: null }, { merge: true });
        }
    };
}