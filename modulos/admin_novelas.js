import { ref, set, onValue } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

export function iniciar(contenedor, db, miCarpeta, rtdb) {
    const novelas = ["Rubí", "La Usurpadora", "Marimar", "Teresa", "Betty la Fea", "Rosalinda", "Pasión de Gavilanes", "El Senor de los Cielos", "Sin Senos no hay Paraíso", "Amor Real", "La Fea más Bella", "Cuidado con el Ángel"];
    const codJuego = "novelas";

    contenedor.innerHTML = `
        <div style="background:#080808; border:1px solid var(--rosa); padding:20px; border-radius:15px; text-align:center;">
            <h2 style="color:var(--rosa); margin-top:0;">LOTERÍA NOVELAS</h2>
            <div style="display:flex; gap:10px; justify-content:center; margin-bottom:15px;">
                <button id="btn-sacar-nov" class="btn-abrir" style="background:var(--rosa); color:#fff;">SACAR NOVELA</button>
                <button id="btn-reset-nov" class="btn-abrir" style="background:var(--rojo); color:#fff;">REINICIAR</button>
            </div>
            <div id="ultimo-num-nov" style="font-size:32px; font-weight:900; color:var(--amarillo); margin-bottom:15px;">--</div>
            <div id="tablero-grid-nov" style="display:grid; grid-template-columns:repeat(3, 1fr); gap:8px; max-width:600px; margin:0 auto;"></div>
        </div>`;

    const sorteoRef = ref(rtdb, `proyectos/${miCarpeta}/sorteos/${codJuego}`);
    let salidos = [];

    onValue(sorteoRef, (snapshot) => {
        const data = snapshot.val() || {};
        const rawSalidos = data.sacados || [];
        salidos = Array.isArray(rawSalidos) ? rawSalidos : Object.values(rawSalidos);

        const ultimo = salidos[salidos.length - 1] || "--";
        const elem = document.getElementById('ultimo-num-nov');
        if(elem) elem.innerText = ultimo;
        renderTablero(salidos);
    });

    function renderTablero(salidosList) {
        let html = '';
        novelas.forEach(item => {
            const mar = salidosList.includes(item);
            html += `<div style="background:${mar ? 'var(--rosa)' : '#111'}; color:${mar ? '#fff' : '#aaa'}; padding:10px; border-radius:6px; font-weight:bold; font-size:11px; text-transform:uppercase;">${item}</div>`;
        });
        const grid = document.getElementById('tablero-grid-nov');
        if(grid) grid.innerHTML = html;
    }

    document.getElementById('btn-sacar-nov').onclick = async () => {
        const disponibles = novelas.filter(item => !salidos.includes(item));
        if (disponibles.length === 0) return alert("¡Todas las novelas han salido!");
        const nuevo = disponibles[Math.floor(Math.random() * disponibles.length)];
        salidos.push(nuevo);
        await set(sorteoRef, { sacados: salidos, estado: "activo", ultimo: nuevo });
    };

    document.getElementById('btn-reset-nov').onclick = async () => {
        if (confirm("¿Reiniciar Lotería Novelas?")) {
            await set(sorteoRef, { sacados: [], estado: "detenido", ultimo: null });
        }
    };
}