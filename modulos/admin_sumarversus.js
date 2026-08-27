import { ref, set, onValue } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

export function iniciar(contenedor, db, miCarpeta, rtdb) {
    const codJuego = "sumarversus";

    contenedor.innerHTML = `
        <div style="background:#080808; border:1px solid var(--violeta); padding:20px; border-radius:15px; text-align:center;">
            <h2 style="color:var(--violeta); margin-top:0;">SUMATORIA VERSUS - CONTROL</h2>
            
            <div style="margin-bottom: 20px; background: #111; padding: 12px; border-radius: 10px; border: 1px solid #333;">
                <button id="btn-toggle-bloqueo" class="btn-abrir" style="background: var(--rojo); color: #fff; padding: 10px 20px; font-weight: 900; cursor: pointer;">🔒 BLOQUEAR CAMBIO DE EQUIPO</button>
                <div id="lbl-estado-bloqueo" style="font-size: 11px; color: #aaa; margin-top: 6px; font-weight: bold;">ESTADO: EQUIPOS LIBRES</div>
            </div>

            <div style="display:flex; justify-content:space-around; margin:20px 0; gap: 20px; flex-wrap: wrap;">
                <!-- EQUIPO A -->
                <div style="background: #121212; padding: 15px; border-radius: 10px; border: 1px solid var(--cian); flex: 1; min-width: 250px;">
                    <h3 style="color:var(--cian); margin-top:0;">EQUIPO A</h3>
                    <div id="pts-a" style="font-size:45px; font-weight:900; color:#fff; margin-bottom: 10px;">0</div>
                    
                    <div style="display: flex; gap: 5px; justify-content: center; margin-bottom: 10px;">
                        <button id="btn-a-menos" class="btn-abrir" style="background: #440000; color: #fff; padding: 6px 12px; cursor: pointer;">-1</button>
                        <button id="btn-a-mas" class="btn-abrir" style="background: var(--cian); color: #000; padding: 6px 15px; cursor: pointer;">+1 PUNTO</button>
                    </div>
                    
                    <div style="display: flex; gap: 5px; justify-content: center; align-items: center;">
                        <input type="number" id="input-pts-a" placeholder="Ej: 100 o -50" style="width: 100px; background: #000; border: 1px solid var(--cian); color: #fff; text-align: center; padding: 6px; border-radius: 6px; font-weight: bold; outline: none;">
                        <button id="btn-set-a" class="btn-abrir" style="background: var(--cian); color: #000; padding: 6px 10px; font-size: 10px; cursor: pointer;">MODIFICAR</button>
                    </div>
                </div>

                <!-- EQUIPO B -->
                <div style="background: #121212; padding: 15px; border-radius: 10px; border: 1px solid var(--rosa); flex: 1; min-width: 250px;">
                    <h3 style="color:var(--rosa); margin-top:0;">EQUIPO B</h3>
                    <div id="pts-b" style="font-size:45px; font-weight:900; color:#fff; margin-bottom: 10px;">0</div>
                    
                    <div style="display: flex; gap: 5px; justify-content: center; margin-bottom: 10px;">
                        <button id="btn-b-menos" class="btn-abrir" style="background: #440000; color: #fff; padding: 6px 12px; cursor: pointer;">-1</button>
                        <button id="btn-b-mas" class="btn-abrir" style="background: var(--rosa); color: #fff; padding: 6px 15px; cursor: pointer;">+1 PUNTO</button>
                    </div>

                    <div style="display: flex; gap: 5px; justify-content: center; align-items: center;">
                        <input type="number" id="input-pts-b" placeholder="Ej: 100 o -50" style="width: 100px; background: #000; border: 1px solid var(--rosa); color: #fff; text-align: center; padding: 6px; border-radius: 6px; font-weight: bold; outline: none;">
                        <button id="btn-set-b" class="btn-abrir" style="background: var(--rosa); color: #000; padding: 6px 10px; font-size: 10px; cursor: pointer;">MODIFICAR</button>
                    </div>
                </div>
            </div>

            <button id="btn-reset-vs" class="btn-abrir" style="background:var(--rojo); color:#fff; margin-top: 10px; cursor: pointer;">🔄 REINICIAR MARCADOR Y EQUIPOS</button>
        </div>`;

    const sorteoRef = ref(rtdb, `proyectos/${miCarpeta}/sorteos/${codJuego}`);
    const configRef = ref(rtdb, `proyectos/${miCarpeta}/sumarversusConfig`);
    let pA = 0, pB = 0, bloqueado = false;

    onValue(sorteoRef, (snapshot) => {
        const data = snapshot.val() || {};
        pA = Number(data.puntosA) || 0;
        pB = Number(data.puntosB) || 0;
        const elA = document.getElementById('pts-a');
        const elB = document.getElementById('pts-b');
        if(elA) elA.innerText = pA;
        if(elB) elB.innerText = pB;
    });

    onValue(configRef, (snapshot) => {
        const data = snapshot.val() || {};
        bloqueado = Boolean(data.bloqueado);
        const btnBloq = document.getElementById('btn-toggle-bloqueo');
        const lblBloq = document.getElementById('lbl-estado-bloqueo');
        if (btnBloq && lblBloq) {
            if (bloqueado) {
                btnBloq.style.background = "var(--verde)";
                btnBloq.style.color = "#000";
                btnBloq.innerText = "🔓 DESBLOQUEAR CAMBIO DE EQUIPO";
                lblBloq.innerText = "ESTADO: EQUIPOS BLOQUEADOS (LOS JUGADORES NO PUEDEN CAMBIARSE)";
                lblBloq.style.color = "var(--verde)";
            } else {
                btnBloq.style.background = "var(--rojo)";
                btnBloq.style.color = "#fff";
                btnBloq.innerText = "🔒 BLOQUEAR CAMBIO DE EQUIPO";
                lblBloq.innerText = "ESTADO: EQUIPOS LIBRES";
                lblBloq.style.color = "#aaa";
            }
        }
    });

    document.getElementById('btn-toggle-bloqueo').onclick = async () => {
        bloqueado = !bloqueado;
        await set(configRef, { bloqueado: bloqueado });
    };

    // Funciones de actualización para Equipo A
    const aplicarCambioA = async () => {
        const val = parseInt(document.getElementById('input-pts-a').value);
        if (!isNaN(val)) {
            pA = pA + val; // Permite sumar o restar acumulativamente (soporta negativos)
            await set(sorteoRef, { puntosA: pA, puntosB: pB });
            document.getElementById('input-pts-a').value = '';
        }
    };

    document.getElementById('btn-a-mas').onclick = async () => {
        pA += 1;
        await set(sorteoRef, { puntosA: pA, puntosB: pB });
    };
    document.getElementById('btn-a-menos').onclick = async () => {
        pA -= 1;
        await set(sorteoRef, { puntosA: pA, puntosB: pB });
    };
    document.getElementById('btn-set-a').onclick = aplicarCambioA;
    document.getElementById('input-pts-a').onkeydown = (e) => {
        if (e.key === 'Enter') aplicarCambioA();
    };

    // Funciones de actualización para Equipo B
    const aplicarCambioB = async () => {
        const val = parseInt(document.getElementById('input-pts-b').value);
        if (!isNaN(val)) {
            pB = pB + val; // Permite sumar o restar acumulativamente (soporta negativos)
            await set(sorteoRef, { puntosA: pA, puntosB: pB });
            document.getElementById('input-pts-b').value = '';
        }
    };

    document.getElementById('btn-b-mas').onclick = async () => {
        pB += 1;
        await set(sorteoRef, { puntosA: pA, puntosB: pB });
    };
    document.getElementById('btn-b-menos').onclick = async () => {
        pB -= 1;
        await set(sorteoRef, { puntosA: pA, puntosB: pB });
    };
    document.getElementById('btn-set-b').onclick = aplicarCambioB;
    document.getElementById('input-pts-b').onkeydown = (e) => {
        if (e.key === 'Enter') aplicarCambioB();
    };

    document.getElementById('btn-reset-vs').onclick = async () => {
        if (confirm("¿Reiniciar marcador a 0 y limpiar equipos de los jugadores?")) {
            await set(sorteoRef, { puntosA: 0, puntosB: 0 });
            await set(ref(rtdb, `proyectos/${miCarpeta}/sumarversusSeleccion`), null);
        }
    };
}