import { doc, updateDoc, onSnapshot } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

export function iniciar(contenedor, db, miCarpeta) {
    const baraja = ["El Gallo", "El Diablito", "La Dama", "El Catrín", "El Paraguas", "La Sirena", "El Escalera", "La Botella", "El Barril", "El Árbol"];
    
    contenedor.innerHTML = `
        <div style="background:#080808; border:1px solid var(--rosa); padding:20px; border-radius:15px; text-align:center;">
            <h2 style="color:var(--rosa); margin-top:0;">LOTERÍA MEXICANA / FIGURAS</h2>
            <div style="display:flex; gap:10px; justify-content:center; margin-bottom:15px;">
                <button id="btn-cantar" class="btn-abrir" style="background:var(--rosa); color:#fff;">CANTAR CARTA</button>
                <button id="btn-reset" class="btn-abrir" style="background:var(--rojo); color:#fff;">REINICIAR BARAJA</button>
            </div>
            <div id="carta-act" style="font-size:28px; font-weight:900; color:var(--cian); margin:20px 0;">--</div>
            <div id="historial-cartas" style="display:flex; flex-wrap:wrap; gap:8px; justify-content:center;"></div>
        </div>`;

    const refJuego = doc(doc(db, "proyectos", miCarpeta), "juegosData", "lotería");
    let cantadas = [];

    onSnapshot(refJuego, (snap) => {
        if (snap.exists()) {
            cantadas = snap.data().cantadas || [];
            document.getElementById('carta-act').innerText = cantadas[cantadas.length - 1] || "PRESIONA CANTAR";
            document.getElementById('historial-cartas').innerHTML = cantadas.map(c => 
                `<span style="background:#151515; border:1px solid var(--rosa); padding:5px 10px; border-radius:15px; font-size:12px;">${c}</span>`
            ).join('');
        }
    });

    document.getElementById('btn-cantar').onclick = async () => {
        const disponibles = baraja.filter(c => !cantadas.includes(c));
        if (disponibles.length === 0) return alert("¡Se cantaron todas las cartas!");
        const nueva = disponibles[Math.floor(Math.random() * disponibles.length)];
        cantadas.push(nueva);
        await updateDoc(refJuego, { cantadas: cantadas });
    };

    document.getElementById('btn-reset').onclick = async () => {
        if (confirm("¿Reiniciar la baraja?")) await updateDoc(refJuego, { cantadas: [] });
    };
}