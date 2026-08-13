import { doc, updateDoc, onSnapshot } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

export function iniciar(contenedor, db, miCarpeta) {
    contenedor.innerHTML = `
        <div style="background:#080808; border:1px solid var(--violeta); padding:20px; border-radius:15px; text-align:center;">
            <h2 style="color:var(--violeta); margin-top:0;">☠️ KILLER ELIMINATORIA</h2>
            <input type="text" id="target-kill" placeholder="Escribe elemento a eliminar" style="background:#000; border:1px solid var(--violeta); color:#fff; padding:10px; border-radius:8px; width:80%; text-align:center; font-weight:bold; outline:none; margin-bottom:15px;">
            <br>
            <button id="btn-eliminar" class="btn-abrir" style="background:var(--rojo); color:#fff;">ELIMINAR AHORA</button>
        </div>`;

    const refJuego = doc(db, "proyectos", miCarpeta, "juegosData", "killer");

    document.getElementById('btn-eliminar').onclick = async () => {
        const val = document.getElementById('target-kill').value.trim();
        if (!val) return alert("Escribe un valor");
        await updateDoc(refJuego, { ultimoEliminado: val, fecha: Date.now() });
        document.getElementById('target-kill').value = "";
        alert(`Eliminado: ${val}`);
    };
}