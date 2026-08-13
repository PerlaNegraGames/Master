import { doc, setDoc, onSnapshot } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

export function iniciar(contenedor, db, miCarpeta) {
    const abcdario = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

    contenedor.innerHTML = `
        <div style="background:#080808; border:1px solid var(--cian); padding:20px; border-radius:15px; text-align:center;">
            <h2 style="color:var(--cian); margin-top:0;">ABCDARIO</h2>
            <div style="display:flex; gap:10px; justify-content:center; margin-bottom:15px;">
                <button id="btn-sacar-abc" class="btn-abrir" style="background:var(--cian); color:#000;">SACAR LETRA</button>
                <button id="btn-reset-abc" class="btn-abrir" style="background:var(--rojo); color:#fff;">REINICIAR</button>
            </div>
            <div id="ultimo-num-abc" style="font-size:45px; font-weight:900; color:var(--amarillo); margin-bottom:15px;">--</div>
            <div id="tablero-grid-abc" style="display:grid; grid-template-columns:repeat(7, 1fr); gap:6px; max-width:600px; margin:0 auto;"></div>
        </div>`;

    const refJuego = doc(db, "proyectos", miCarpeta, "juegosData", "abcdario");
    let salidos = [];

    onSnapshot(refJuego, (snap) => {
        if (snap.exists()) {
            salidos = snap.data().salidos || [];
            const ultimo = salidos[salidos.length - 1] || "--";
            const elem = document.getElementById('ultimo-num-abc');
            if(elem) elem.innerText = ultimo;
            renderTablero(salidos);
        } else {
            renderTablero([]);
        }
    });

    function renderTablero(salidosList) {
        let html = '';
        abcdario.forEach(letra => {
            const mar = salidosList.includes(letra);
            html += `<div style="background:${mar ? 'var(--cian)' : '#111'}; color:${mar ? '#000' : '#888'}; padding:10px; border-radius:6px; font-weight:bold; font-size:14px;">${letra}</div>`;
        });
        const grid = document.getElementById('tablero-grid-abc');
        if(grid) grid.innerHTML = html;
    }

    document.getElementById('btn-sacar-abc').onclick = async () => {
        const disponibles = abcdario.filter(letra => !salidos.includes(letra));
        if (disponibles.length === 0) return alert("¡Todas las letras han salido!");
        const nuevo = disponibles[Math.floor(Math.random() * disponibles.length)];
        salidos.push(nuevo);
        await setDoc(refJuego, { salidos: salidos, ultimo: nuevo }, { merge: true });
    };

    document.getElementById('btn-reset-abc').onclick = async () => {
        if (confirm("¿Reiniciar Abcdario?")) {
            await setDoc(refJuego, { salidos: [], ultimo: null }, { merge: true });
        }
    };
}