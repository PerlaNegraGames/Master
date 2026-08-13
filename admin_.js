// admin_50.js (para BINGO 50)
export function iniciar(contenedor, db, proyecto, dbRT) {
    contenedor.innerHTML = `
        <div style="background:#080808;padding:20px;border-radius:15px;border:1px solid var(--verde);">
            <h2 style="color:var(--verde);">🎰 BINGO 50</h2>
            <p>Panel de administración para BINGO 50</p>
            <button onclick="alert('Acción personalizada')" class="btn-abrir">EJECUTAR</button>
        </div>
    `;
    // Aquí puedes agregar lógica específica del juego
}