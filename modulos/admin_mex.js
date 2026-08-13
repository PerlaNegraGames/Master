import { doc, setDoc, onSnapshot } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

export function iniciar(contenedor, db, miCarpeta) {
    const cartasMex = ["El Gallo", "El Diablito", "La Dama", "El Catrín", "El Paraguas", "El Sireno", "La Escalera", "La Botella", "El Barril", "El Árbol", "El Melón", "El Valiente", "El Gorrito", "La Muerte", "La Pera", "La Bandera", "El Bandolón", "El Violoncello", "La Garza", "Pájaro", "La Mano", "La Bota", "El Cotorro", "El Borracho", "El Negrito", "El Corazón", "La Sandía", "El Tambor", "El Músico", "El Arpa", "La Rana"];

    contenedor.innerHTML = `
        <div style="background:#080808; border:1px solid #00ff66; padding:20px; border-radius:15px; text-align:center;">
            <h2 style="color:#00ff66; margin-top:0;">LOTERÍA MEXICANA</h2>
            <div style="display:flex; gap:10px; justify-content:center; margin-bottom:15px;">
                <button id="btn-sacar-mex" class="btn-abrir" style="background:#00ff66; color:#000;">EXTRAER CARTA</button>
                <button id="btn-reset-mex" class="btn-abrir" style="background:var(--rojo); color:#fff;">REINICIAR BARAJA</button>
            </div>
            <div id="ultimo-num-mex" style="font-size:32px; font-weight:900; color:var(--amarillo); margin-bottom:15px;">--</div>
            <div id="tablero-grid-mex" style="display:grid; grid-template-columns:repeat(4, 1fr); gap:8px; max-width:600px; margin:0 auto;"></div>
        </div>`;

    const refJuego = doc(db, "proyectos", miCarpeta, "juegosData", "loteriaMexicana");
    let salidos = [];

    onSnapshot(refJuego, (snap) => {
        if (snap.exists()) {
            salidos = snap.data().salidos || [];
            const ultimo = salidos[salidos.length - 1] || "--";
            const elem = document.getElementById('ultimo-num-mex');
            if(elem) elem.innerText = ultimo;
            renderTablero(salidos);
        } else {
            renderTablero([]);
        }
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

    document.getElementById('btn-sacar-mex').onclick = async () => {
        const disponibles = cartasMex.filter(item => !salidos.includes(item));
        if (disponibles.length === 0) return alert("¡Todas las cartas han salido!");
        const nuevo = disponibles[Math.floor(Math.random() * disponibles.length)];
        salidos.push(nuevo);
        await setDoc(refJuego, { salidos: salidos, ultimo: nuevo }, { merge: true });
    };

    document.getElementById('btn-reset-mex').onclick = async () => {
        if (confirm("¿Reiniciar Lotería Mexicana?")) {
            await setDoc(refJuego, { salidos: [], ultimo: null }, { merge: true });
        }
    };
}