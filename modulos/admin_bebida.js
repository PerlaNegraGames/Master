import { doc, setDoc, onSnapshot } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

export function iniciar(contenedor, db, miCarpeta) {
    const bebidas = ["Cerveza", "Tequila", "Ron", "Whisky", "Vodka", "Garrone", "Sangría", "Margarita", "Mojito", "Pisco", "Vino Tinto", "Champán"];

    contenedor.innerHTML = `
        <div style="background:#080808; border:1px solid var(--verde); padding:20px; border-radius:15px; text-align:center;">
            <h2 style="color:var(--verde); margin-top:0;">LOTERÍA BEBIDAS</h2>
            <div style="display:flex; gap:10px; justify-content:center; margin-bottom:15px;">
                <button id="btn-sacar-beb" class="btn-abrir" style="background:var(--verde); color:#000;">SACAR BEBIDA</button>
                <button id="btn-reset-beb" class="btn-abrir" style="background:var(--rojo); color:#fff;">REINICIAR</button>
            </div>
            <div id="ultimo-num-beb" style="font-size:32px; font-weight:900; color:var(--amarillo); margin-bottom:15px;">--</div>
            <div id="tablero-grid-beb" style="display:grid; grid-template-columns:repeat(3, 1fr); gap:8px; max-width:600px; margin:0 auto;"></div>
        </div>`;

    const refJuego = doc(db, "proyectos", miCarpeta, "juegosData", "bebidas");
    let salidos = [];

    onSnapshot(refJuego, (snap) => {
        if (snap.exists()) {
            salidos = snap.data().salidos || [];
            const ultimo = salidos[salidos.length - 1] || "--";
            const elem = document.getElementById('ultimo-num-beb');
            if(elem) elem.innerText = ultimo;
            renderTablero(salidos);
        } else {
            renderTablero([]);
        }
    });

    function renderTablero(salidosList) {
        let html = '';
        bebidas.forEach(item => {
            const mar = salidosList.includes(item);
            html += `<div style="background:${mar ? 'var(--verde)' : '#111'}; color:${mar ? '#000' : '#aaa'}; padding:10px; border-radius:6px; font-weight:bold; font-size:11px; text-transform:uppercase;">${item}</div>`;
        });
        const grid = document.getElementById('tablero-grid-beb');
        if(grid) grid.innerHTML = html;
    }

    document.getElementById('btn-sacar-beb').onclick = async () => {
        const disponibles = bebidas.filter(item => !salidos.includes(item));
        if (disponibles.length === 0) return alert("¡Todas las bebidas han salido!");
        const nuevo = disponibles[Math.floor(Math.random() * disponibles.length)];
        salidos.push(nuevo);
        await setDoc(refJuego, { salidos: salidos, ultimo: nuevo }, { merge: true });
    };

    document.getElementById('btn-reset-beb').onclick = async () => {
        if (confirm("¿Reiniciar Lotería Bebidas?")) {
            await setDoc(refJuego, { salidos: [], ultimo: null }, { merge: true });
        }
    };
}