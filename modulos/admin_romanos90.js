import { ref, set, onValue } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

export function iniciar(contenedor, db, miCarpeta, rtdb) {
    const romanos = ["I","II","III","IV","V","VI","VII","VIII","IX","X","XI","XII","XIII","XIV","XV","XVI","XVII","XVIII","XIX","XX","XXI","XXII","XXIII","XXIV","XXV","XXVI","XXVII","XXVIII","XXIX","XXX","XXXI","XXXII","XXXIII","XXXIV","XXXV","XXXVI","XXXVII","XXXVIII","XXXIX","XL","XLI","XLII","XLIII","XLIV","XLV","XLVI","XLVII","XLVIII","XLIX","L","LI","LII","LIII","LIV","LV","LVI","LVII","LVIII","LIX","LX","LXI","LXII","LXIII","LXIV","LXV","LXVI","LXVII","LXVIII","LXIX","LXX","LXXI","LXXII","LXXIII","LXXIV","LXXV","LXXVI","LXXVII","LXXVIII","LXXIX","LXXX","LXXXI","LXXXII","LXXXIII","LXXXIV","LXXXV","LXXXVI","LXXXVII","LXXXVIII","LXXXIX","XC"];
    const codJuego = "romanos90";

    contenedor.innerHTML = `
        <div style="background:#080808; border:1px solid var(--violeta); padding:20px; border-radius:15px; text-align:center;">
            <h2 style="color:var(--violeta); margin-top:0;">ROMANOS 90</h2>
            <div style="display:flex; gap:10px; justify-content:center; margin-bottom:15px;">
                <button id="btn-sacar-rom" class="btn-abrir" style="background:var(--violeta); color:#fff;">SACAR NÚMERO</button>
                <button id="btn-reset-rom" class="btn-abrir" style="background:var(--rojo); color:#fff;">REINICIAR</button>
            </div>
            <div id="ultimo-num-rom" style="font-size:40px; font-weight:900; color:var(--amarillo); margin-bottom:15px;">--</div>
            <div id="tablero-grid-rom" style="display:grid; grid-template-columns:repeat(10, 1fr); gap:5px; max-width:650px; margin:0 auto;"></div>
        </div>`;

    const sorteoRef = ref(rtdb, `proyectos/${miCarpeta}/sorteos/${codJuego}`);
    let salidos = [];

    onValue(sorteoRef, (snapshot) => {
        const data = snapshot.val() || {};
        const rawSalidos = data.sacados || [];
        salidos = Array.isArray(rawSalidos) ? rawSalidos : Object.values(rawSalidos);

        const ultimo = salidos[salidos.length - 1] || "--";
        const elem = document.getElementById('ultimo-num-rom');
        if(elem) elem.innerText = ultimo;
        renderTablero(salidos);
    });

    function renderTablero(salidosList) {
        let html = '';
        romanos.forEach(r => {
            const mar = salidosList.includes(r);
            html += `<div style="background:${mar ? 'var(--violeta)' : '#111'}; color:${mar ? '#fff' : '#888'}; padding:6px 2px; border-radius:4px; font-weight:bold; font-size:10px;">${r}</div>`;
        });
        const grid = document.getElementById('tablero-grid-rom');
        if(grid) grid.innerHTML = html;
    }

    document.getElementById('btn-sacar-rom').onclick = async () => {
        const disponibles = romanos.filter(r => !salidos.includes(r));
        if (disponibles.length === 0) return alert("¡Todos los números romanos han salido!");
        const nuevo = disponibles[Math.floor(Math.random() * disponibles.length)];
        salidos.push(nuevo);
        await set(sorteoRef, { sacados: salidos, estado: "activo", ultimo: nuevo });
    };

    document.getElementById('btn-reset-rom').onclick = async () => {
        if (confirm("¿Reiniciar juego de Romanos 90?")) {
            await set(sorteoRef, { sacados: [], estado: "detenido", ultimo: null });
        }
    };
}