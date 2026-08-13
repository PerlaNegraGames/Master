import { doc, setDoc, onSnapshot } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

export function iniciar(contenedor, db, miCarpeta) {
    const simpsons = ["Homero", "Marge", "Bart", "Lisa", "Maggie", "Ned Flanders", "Sr. Burns", "Smithers", "Moe", "Barney", "Krusty", "Milhouse"];

    contenedor.innerHTML = `
        <div style="background:#080808; border:1px solid var(--amarillo); padding:20px; border-radius:15px; text-align:center;">
            <h2 style="color:var(--amarillo); margin-top:0;">LOS SIMPSONS</h2>
            <div style="display:flex; gap:10px; justify-content:center; margin-bottom:15px;">
                <button id="btn-sacar-simp" class="btn-abrir" style="background:var(--amarillo); color:#000;">SACAR PERSONAJE</button>
                <button id="btn-reset-simp" class="btn-abrir" style="background:var(--rojo); color:#fff;">REINICIAR</button>
            </div>
            <div id="ultimo-num-simp" style="font-size:32px; font-weight:900; color:var(--cian); margin-bottom:15px;">--</div>
            <div id="tablero-grid-simp" style="display:grid; grid-template-columns:repeat(3, 1fr); gap:8px; max-width:600px; margin:0 auto;"></div>
        </div>`;

    const refJuego = doc(db, "proyectos", miCarpeta, "juegosData", "simpsons");
    let salidos = [];

    onSnapshot(refJuego, (snap) => {
        if (snap.exists()) {
            salidos = snap.data().salidos || [];
            const ultimo = salidos[salidos.length - 1] || "--";
            const elem = document.getElementById('ultimo-num-simp');
            if(elem) elem.innerText = ultimo;
            renderTablero(salidos);
        } else {
            renderTablero([]);
        }
    });

    function renderTablero(salidosList) {
        let html = '';
        simpsons.forEach(item => {
            const mar = salidosList.includes(item);
            html += `<div style="background:${mar ? 'var(--amarillo)' : '#111'}; color:${mar ? '#000' : '#aaa'}; padding:10px; border-radius:6px; font-weight:bold; font-size:11px; text-transform:uppercase;">${item}</div>`;
        });
        const grid = document.getElementById('tablero-grid-simp');
        if(grid) grid.innerHTML = html;
    }

    document.getElementById('btn-sacar-simp').onclick = async () => {
        const disponibles = simpsons.filter(item => !salidos.includes(item));
        if (disponibles.length === 0) return alert("¡Todos los personajes han salido!");
        const nuevo = disponibles[Math.floor(Math.random() * disponibles.length)];
        salidos.push(nuevo);
        await setDoc(refJuego, { salidos: salidos, ultimo: nuevo }, { merge: true });
    };

    document.getElementById('btn-reset-simp').onclick = async () => {
        if (confirm("¿Reiniciar Los Simpsons?")) {
            await setDoc(refJuego, { salidos: [], ultimo: null }, { merge: true });
        }
    };
}