import { ref, set, onValue } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

export function iniciar(contenedor, db, miCarpeta, rtdb) {
    const codJuego = "killer";

    contenedor.innerHTML = `
        <div style="background:#080808; border:1px solid var(--violeta); padding:20px; border-radius:15px; text-align:center;">
            <h2 style="color:var(--violeta); margin-top:0;">☠️ KILLER ELIMINATORIA</h2>
            <input type="text" id="target-kill" placeholder="Escribe elemento a eliminar" style="background:#000; border:1px solid var(--violeta); color:#fff; padding:10px; border-radius:8px; width:80%; text-align:center; font-weight:bold; outline:none; margin-bottom:15px;">
            <br>
            <button id="btn-eliminar" class="btn-abrir" style="background:var(--rojo); color:#fff;">ELIMINAR AHORA</button>
            <div id="ultimo-eliminado-display" style="font-size:24px; color:var(--amarillo); margin-top:15px;">--</div>
        </div>`;

    const sorteoRef = ref(rtdb, `proyectos/${miCarpeta}/sorteos/${codJuego}`);
    let eliminados = [];

    onValue(sorteoRef, (snapshot) => {
        const data = snapshot.val() || {};
        const raw = data.sacados || [];
        eliminados = Array.isArray(raw) ? raw : Object.values(raw);
        const ultimo = eliminados[eliminados.length - 1] || "--";
        const el = document.getElementById('ultimo-eliminado-display');
        if (el) el.innerText = `Último eliminado: ${ultimo}`;
    });

    document.getElementById('btn-eliminar').onclick = async () => {
        const val = document.getElementById('target-kill').value.trim();
        if (!val) return alert("Escribe un valor");
        eliminados.push(val);
        await set(sorteoRef, { sacados: eliminados, estado: "activo", ultimo: val });
        document.getElementById('target-kill').value = "";
        alert(`Eliminado: ${val}`);
    };
}