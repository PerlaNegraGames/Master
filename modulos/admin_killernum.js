import { doc, setDoc, onSnapshot } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

export function iniciar(contenedor, db, miCarpeta) {
    const totalNumeros = 50;

    contenedor.innerHTML = `
        <div style="background:#080808; border:1px solid var(--rojo); padding:20px; border-radius:15px; text-align:center;">
            <h2 style="color:var(--rojo); margin-top:0;">KILLER NÚMEROS</h2>
            <div style="display:flex; gap:10px; justify-content:center; margin-bottom:15px;">
                <button id="btn-sacar-knum" class="btn-abrir" style="background:var(--rojo); color:#fff;">ELIMINAR NÚMERO</button>
                <button id="btn-reset-knum" class="btn-abrir" style="background:#333; color:#fff;">REINICIAR</button>
            </div>
            <div id="ultimo-num-knum" style="font-size:40px; font-weight:900; color:var(--rojo); margin-bottom:15px;">--</div>
            <div id="tablero-grid-knum" style="display:grid; grid-template-columns:repeat(10, 1fr); gap:5px; max-width:600px; margin:0 auto;"></div>
        </div>`;

    const refJuego = doc(db, "proyectos", miCarpeta, "juegosData", "killerNumeros");
    let salidos = [];

    onSnapshot(refJuego, (snap) => {
        if (snap.exists()) {
            salidos = snap.data().salidos || [];
            const ultimo = salidos[salidos.length - 1] || "--";
            const elem = document.getElementById('ultimo-num-knum');
            if(elem) elem.innerText = ultimo;
            renderTablero(salidos);
        } else {
            renderTablero([]);
        }
    });

    function renderTablero(salidosList) {
        let html = '';
        for (let i = 1; i <= totalNumeros; i++) {
            const mar = salidosList.includes(i);
            html += `<div style="background:${mar ? 'var(--rojo)' : '#111'}; color:${mar ? '#fff' : '#888'}; padding:8px; border-radius:4px; font-weight:bold; font-size:12px; text-decoration:${mar ? 'line-through' : 'none'};">${i}</div>`;
        }
        const grid = document.getElementById('tablero-grid-knum');
        if(grid) grid.innerHTML = html;
    }

    document.getElementById('btn-sacar-knum').onclick = async () => {
        const disponibles = Array.from({length: totalNumeros}, (_, i) => i + 1).filter(n => !salidos.includes(n));
        if (disponibles.length === 0) return alert("¡Todos los números han sido eliminados!");
        const nuevo = disponibles[Math.floor(Math.random() * disponibles.length)];
        salidos.push(nuevo);
        await setDoc(refJuego, { salidos: salidos, ultimo: nuevo }, { merge: true });
    };

    document.getElementById('btn-reset-knum').onclick = async () => {
        if (confirm("¿Reiniciar Killer Números?")) {
            await setDoc(refJuego, { salidos: [], ultimo: null }, { merge: true });
        }
    };
}