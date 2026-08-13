import { ref, set, onValue } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

export function iniciar(contenedor, db, miCarpeta, rtdb) {
    const codJuego = "sumarversus";

    contenedor.innerHTML = `
        <div style="background:#080808; border:1px solid var(--violeta); padding:20px; border-radius:15px; text-align:center;">
            <h2 style="color:var(--violeta); margin-top:0;">SUMATORIA VERSUS</h2>
            <div style="display:flex; justify-content:space-around; margin:20px 0;">
                <div>
                    <h3 style="color:var(--cian); margin:0;">EQUIPO A</h3>
                    <div id="pts-a" style="font-size:40px; font-weight:900; color:#fff;">0</div>
                    <button id="btn-a" class="btn-abrir" style="background:var(--cian); color:#000;">+1 PUNTO</button>
                </div>
                <div>
                    <h3 style="color:var(--rosa); margin:0;">EQUIPO B</h3>
                    <div id="pts-b" style="font-size:40px; font-weight:900; color:#fff;">0</div>
                    <button id="btn-b" class="btn-abrir" style="background:var(--rosa); color:#fff;">+1 PUNTO</button>
                </div>
            </div>
            <button id="btn-reset-vs" class="btn-abrir" style="background:var(--rojo); color:#fff;">REINICIAR MARCADOR</button>
        </div>`;

    const sorteoRef = ref(rtdb, `proyectos/${miCarpeta}/sorteos/${codJuego}`);
    let pA = 0, pB = 0;

    onValue(sorteoRef, (snapshot) => {
        const data = snapshot.val() || {};
        pA = data.puntosA || 0;
        pB = data.puntosB || 0;
        const elA = document.getElementById('pts-a');
        const elB = document.getElementById('pts-b');
        if(elA) elA.innerText = pA;
        if(elB) elB.innerText = pB;
    });

    document.getElementById('btn-a').onclick = async () => {
        pA += 1;
        await set(sorteoRef, { puntosA: pA, puntosB: pB, estado: "activo" });
    };

    document.getElementById('btn-b').onclick = async () => {
        pB += 1;
        await set(sorteoRef, { puntosA: pA, puntosB: pB, estado: "activo" });
    };

    document.getElementById('btn-reset-vs').onclick = async () => {
        if (confirm("¿Reiniciar Marcador Versus?")) {
            pA = 0; pB = 0;
            await set(sorteoRef, { puntosA: 0, puntosB: 0, estado: "detenido" });
        }
    };
}