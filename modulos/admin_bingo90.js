// modulos/admin_bingo90.js
export function iniciar(contenedor, db, carpeta, rtdb) {
    console.log("✅ Módulo BINGO 90 cargado");
    contenedor.innerHTML = `
        <div style="background:#111; border:2px solid #39ff14; border-radius:15px; padding:20px; text-align:center;">
            <h2 style="color:#39ff14; text-shadow: 0 0 20px #39ff14;">🎯 BINGO 90</h2>
            <p style="color:#aaa;">Panel de administración para Bingo 90.</p>
            <button id="btn-test" class="btn-abrir" style="background:#39ff14; color:#000; border:none; padding:10px 20px; border-radius:8px; font-weight:bold; cursor:pointer;">PRUEBA</button>
            <div id="test-msg" style="margin-top:15px; color:#fff;"></div>
        </div>
    `;
    document.getElementById('btn-test').onclick = () => {
        document.getElementById('test-msg').innerText = "✅ Módulo funcionando correctamente";
    };
}