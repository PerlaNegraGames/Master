import { doc, setDoc, onSnapshot } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

export function iniciar(contenedor, db, miCarpeta) {
    const totalCartones = 50;

    contenedor.innerHTML = `
        <div style="background:#080808; border:1px solid var(--amarillo); padding:20px; border-radius:15px; text-align:center;">
            <h2 style="color:var(--amarillo); margin-top:0;">BINGO DE CARTONES</h2>
            <div style="display:flex; gap:10px; justify-content:center; margin-bottom:15px;">
                <button id="btn-sacar-carton" class="btn-abrir" style="background:var(--amarillo); color:#000;">SORTEAR CARTÓN</button>
                <button id="btn-reset-carton" class="btn-abrir" style="background:var(--rojo); color:#fff;">REINICIAR</button>
            </div>
            <div id="ultimo-num-carton" style="font-size:40px; font-weight:900; color:var(--cian); margin-bottom:15px;">--</div>
            <div id="tablero-grid-carton" style="display:grid; grid-template-columns:repeat(10, 1fr); gap:5px; max-width:600px; margin:0 auto;"></div>
        </div>`;

    const refJuego = doc(db, "proyectos", miCarpeta, "juegosData", "bingoCartones");
    let salidos = [];

    onSnapshot(refJuego, (snap) => {
        if (snap.exists()) {
            salidos = snap.data().salidos || [];
            const ultimo = salidos[salidos.length - 1] ? `CARTÓN #${salidos[salidos.length - 1]}` : "--";
            const elem = document.getElementById('ultimo-num-carton');
            if(elem) elem.innerText = ultimo;
            renderTablero(salidos);
        } else {
            renderTablero([]);
        }
    });

    function renderTablero(salidosList) {
        let html = '';
        for (let i = 1; i <= totalCartones; i++) {
            const mar = salidosList.includes(i);
            html += `<div style="background:${mar ? 'var(--amarillo)' : '#111'}; color:${mar ? '#000' : '#888'}; padding:8px 2px; border-radius:4px; font-weight:bold; font-size:11px;">#${i}</div>`;
        }
        const grid = document.getElementById('tablero-grid-carton');
        if(grid) grid.innerHTML = html;
    }

    document.getElementById('btn-sacar-carton').onclick = async () => {
        const disponibles = Array.from({length: totalCartones}, (_, i) => i + 1).filter(n => !salidos.includes(n));
        if (disponibles.length === 0) return alert("¡Todos los cartones han salido!");
        const nuevo = disponibles[Math.floor(Math.random() * disponibles.length)];
        salidos.push(nuevo);
        await setDoc(refJuego, { salidos: salidos, ultimo: nuevo }, { merge: true });
    };

    document.getElementById('btn-reset-carton').onclick = async () => {
        if (confirm("¿Reiniciar Bingo de Cartones?")) {
            await setDoc(refJuego, { salidos: [], ultimo: null }, { merge: true });
        }
    };
}