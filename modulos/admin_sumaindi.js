import { ref, set, onValue } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

export function iniciar(contenedor, db, miCarpeta, rtdb) {
    const codJuego = "sumaindi";

    contenedor.innerHTML = `
        <div style="background:#080808; border:1px solid var(--verde); padding:20px; border-radius:15px; text-align:center;">
            <h2 style="color:var(--verde); margin-top:0;">SUMATORIA INDIVIDUAL</h2>
            <div style="font-size:50px; font-weight:900; color:var(--amarillo); margin:15px 0;" id="total-indi">0</div>
            <div style="display:flex; gap:10px; justify-content:center; margin-bottom:15px;">
                <button id="btn-add1" class="btn-abrir" style="background:var(--verde); color:#000;">+1</button>
                <button id="btn-add5" class="btn-abrir" style="background:var(--verde); color:#000;">+5</button>
                <button id="btn-add10" class="btn-abrir" style="background:var(--verde); color:#000;">+10</button>
            </div>
            <button id="btn-reset-indi" class="btn-abrir" style="background:var(--rojo); color:#fff;">REINICIAR PUNTOS</button>
        </div>`;

    const sorteoRef = ref(rtdb, `proyectos/${miCarpeta}/sorteos/${codJuego}`);
    let total = 0;

    onValue(sorteoRef, (snapshot) => {
        const data = snapshot.val() || {};
        total = data.puntos || 0;
        const elem = document.getElementById('total-indi');
        if(elem) elem.innerText = total;
    });

    const sumar = async (val) => {
        total += val;
        await set(sorteoRef, { puntos: total, estado: "activo" });
    };

    document.getElementById('btn-add1').onclick = () => sumar(1);
    document.getElementById('btn-add5').onclick = () => sumar(5);
    document.getElementById('btn-add10').onclick = () => sumar(10);

    document.getElementById('btn-reset-indi').onclick = async () => {
        if (confirm("¿Reiniciar puntos individuales?")) {
            total = 0;
            await set(sorteoRef, { puntos: 0, estado: "detenido" });
        }
    };
}