export async function verificarLicenciaGlobal(db, doc, onSnapshot, miCarpeta) {
    return new Promise((resolve) => {
        // Siempre resolvemos como true y ocultamos la pantalla de bloqueo
        const pantallaBloqueo = document.getElementById('pantalla-bloqueo');
        if (pantallaBloqueo) pantallaBloqueo.style.display = 'none';
        resolve(true);
    });
}