import { doc, setDoc, onSnapshot } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

export function iniciar(contenedor, db, miCarpeta) {
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

    const refJuego = doc(db, "proyectos", miCarpeta, "juegosData", "sumatoriaVersus");
    let pA = 0, pB = 0;

    onSnapshot(refJuego, (snap) => {
        if (snap.exists()) {
            pA = snap.data().puntosA || 0;
            pB = snap.data().puntosB || 0;
            const elA = document.getElementById('pts-a');
            const elB = document.getElementById('pts-b');
            if(elA) elA.innerText = pA;
            if(elB) elB.innerText = pB;
        }
    });

    document.getElementById('btn-a').onclick = async () => {
        await setDoc(refJuego, { puntosA: pA + 1, puntosB: pB }, { merge: true });
    };

    document.getElementById('btn-b').onclick = async () => {
        await setDoc(refJuego, { puntosA: pA, puntosB: pB + 1 }, { merge: true });
    };

    document.getElementById('btn-reset-vs').onclick = async () => {
        if (confirm("¿Reiniciar Marcador Versus?")) {
            await setDoc(refJuego, { puntosA: 0, puntosB: 0 }, { merge: true });
        }
    };
}