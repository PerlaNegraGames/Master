import { doc, setDoc, onSnapshot } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

export function iniciar(contenedor, db, miCarpeta) {
    contenedor.innerHTML = `
        <div style="background:#080808; border:1px solid var(--cian); padding:20px; border-radius:15px; text-align:center;">
            <h2 style="color:var(--cian); margin-top:0;">JUEGO INVERTIDOS</h2>
            <div style="display:flex; gap:10px; justify-content:center; margin-bottom:15px;">
                <button id="btn-sacar-inv" class="btn-abrir" style="background:var(--cian); color:#000;">GENERAR INVERTIDO</button>
                <button id="btn-reset-inv" class="btn-abrir" style="background:var(--rojo); color:#fff;">REINICIAR</button>
            </div>
            <div id="ultimo-num-inv" style="font-size:45px; font-weight:900; color:var(--verde); margin-bottom:15px;">--</div>
            <div id="tablero-grid-inv" style="display:flex; flex-wrap:wrap; gap:8px; justify-content:center; max-width:600px; margin:0 auto;"></div>
        </div>`;

    const refJuego = doc(db, "proyectos", miCarpeta, "juegosData", "invertidos");
    let salidos = [];

    onSnapshot(refJuego, (snap) => {
        if (snap.exists()) {
            salidos = snap.data().salidos || [];
            const ultimo = salidos[salidos.length - 1] || "--";
            const elem = document.getElementById('ultimo-num-inv');
            if(elem) elem.innerText = ultimo;
            renderTablero(salidos);
        } else {
            renderTablero([]);
        }
    });

    function renderTablero(salidosList) {
        const grid = document.getElementById('tablero-grid-inv');
        if(grid) {
            grid.innerHTML = salidosList.map(item => 
                `<div style="background:var(--cian); color:#000; padding:8px 12px; border-radius:6px; font-weight:900; font-size:14px;">${item}</div>`
            ).join('');
        }
    }

    document.getElementById('btn-sacar-inv').onclick = async () => {
        const n1 = Math.floor(Math.random() * 9) + 1;
        const n2 = Math.floor(Math.random() * 9) + 1;
        const combo = `${n1}${n2} - ${n2}${n1}`;
        salidos.push(combo);
        await setDoc(refJuego, { salidos: salidos, ultimo: combo }, { merge: true });
    };

    document.getElementById('btn-reset-inv').onclick = async () => {
        if (confirm("¿Reiniciar juego Invertidos?")) {
            await setDoc(refJuego, { salidos: [], ultimo: null }, { merge: true });
        }
    };
}