import { doc, setDoc, onSnapshot } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

export function iniciar(contenedor, db, miCarpeta) {
    contenedor.innerHTML = `
        <div style="background:#080808; border:1px solid var(--cian); padding:20px; border-radius:15px; text-align:center;">
            <h2 style="color:var(--cian); margin-top:0;">NUEVO JUEGO</h2>
            <div style="display:flex; gap:10px; justify-content:center; margin-bottom:15px;">
                <button id="btn-sacar-nue" class="btn-abrir" style="background:var(--cian); color:#000;">LANZAR VALOR</button>
                <button id="btn-reset-nue" class="btn-abrir" style="background:var(--rojo); color:#fff;">REINICIAR</button>
            </div>
            <div id="ultimo-num-nue" style="font-size:40px; font-weight:900; color:var(--amarillo); margin-bottom:15px;">--</div>
            <div id="tablero-grid-nue" style="display:flex; flex-wrap:wrap; gap:8px; justify-content:center; max-width:600px; margin:0 auto;"></div>
        </div>`;

    const refJuego = doc(db, "proyectos", miCarpeta, "juegosData", "nuevoJuego");
    let salidos = [];

    onSnapshot(refJuego, (snap) => {
        if (snap.exists()) {
            salidos = snap.data().salidos || [];
            const ultimo = salidos[salidos.length - 1] || "--";
            const elem = document.getElementById('ultimo-num-nue');
            if(elem) elem.innerText = ultimo;
            renderTablero(salidos);
        } else {
            renderTablero([]);
        }
    });

    function renderTablero(salidosList) {
        const grid = document.getElementById('tablero-grid-nue');
        if(grid) {
            grid.innerHTML = salidosList.map(item => 
                `<div style="background:var(--cian); color:#000; padding:8px 12px; border-radius:6px; font-weight:900; font-size:13px;">${item}</div>`
            ).join('');
        }
    }

    document.getElementById('btn-sacar-nue').onclick = async () => {
        const num = Math.floor(Math.random() * 100) + 1;
        const texto = `VALOR #${num}`;
        salidos.push(texto);
        await setDoc(refJuego, { salidos: salidos, ultimo: texto }, { merge: true });
    };

    document.getElementById('btn-reset-nue').onclick = async () => {
        if (confirm("¿Reiniciar Nuevo Juego?")) {
            await setDoc(refJuego, { salidos: [], ultimo: null }, { merge: true });
        }
    };
}