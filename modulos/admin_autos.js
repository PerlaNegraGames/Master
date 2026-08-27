import { ref, set, onValue } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";
import { updateDoc, doc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

export function iniciar(contenedor, db, miCarpeta, rtdb) {
    const autos = [
        "Ferrari", "Porsche", "Lamborghini", "BMW", "Mercedes-Benz", "Audi", "Toyota", "Ford", "Chevrolet", "Nissan", 
        "Honda", "Volkswagen", "Aston Martin", "Bugatti", "Maserati", "Bentley", "Rolls-Royce", "Jaguar", "Land Rover", "Volvo", 
        "Subaru", "Mazda", "Mitsubishi", "Lexus", "Infiniti", "Acura", "Alfa Romeo", "Fiat", "Renault", "Peugeot", 
        "Citroën", "Tesla", "Hyundai", "Kia", "Genesis", "Mini", "Smart", "SEAT", "Skoda", "Cupra", 
        "Pagani", "Koenigsegg", "McLaren", "Lotus", "Alpine", "Dodge", "Chrysler", "Jeep", "Ram", "GMC", 
        "Buick", "Cadillac", "Lincoln", "Pontiac", "Mercury", "Saturn", "Hummer", "Scion", "De Tomaso", "Lancia", 
        "Saab", "Opel", "Vauxhall", "Dacia", "Holden", "Perodua", "Proton", "Mahindra", "Tata", "Maruti Suzuki", 
        "BYD", "Geely", "Chery", "Great Wall", "Nio", "XPeng", "Li Auto", "Hongqi", "SAIC Motor", "Changan", 
        "Zotye", "Haval", "Baojun", "Wuling", "Foton", "JAC", "Dongfeng", "GAC", "Roewe", "Lynk & Co", 
        "Polestar", "Rivian", "Lucid", "Fisker", "Isuzu", "Daihatsu", "Hino", "UD Trucks", "Scania", "MAN", 
        "DAF", "Iveco", "Kenworth", "Peterbilt", "Freightliner", "Mack", "Western Star", "KTM", "Yamaha", "Suzuki", 
        "Kawasaki", "Ducati", "Harley-Davidson", "Triumph", "Royal Enfield", "Aprilia", "Moto Guzzi", "Husqvarna", "Indian", "BMW Motorrad"
    ];
    const codJuego = "autos";

    contenedor.innerHTML = `
        <div style="background:#080808; border:1px solid var(--verde); padding:20px; border-radius:15px; text-align:center;">
            <h2 style="color:var(--verde); margin-top:0;">AUTOS Y MARCAS (120 OPCIONES)</h2>
            
            <div style="display: flex; gap: 10px; margin-bottom: 15px; justify-content: center;">
                <button id="btn-comenzar-autos" class="btn-abrir" style="background: var(--verde); color: #000; flex: 1; padding: 10px; font-weight: 900; border-radius: 6px; cursor: pointer;">🚀 COMENZAR PARTIDA</button>
                <button id="btn-reset-todo-autos" class="btn-abrir" style="background: var(--amarillo); color: #000; flex: 1; padding: 10px; font-weight: 900; border-radius: 6px; cursor: pointer;">🔄 REINICIAR TODO Y SELECCIÓN</button>
            </div>

            <div style="display:flex; gap:8px; justify-content:center; align-items:center; margin-bottom:15px; flex-wrap:wrap;">
                <button id="btn-sacar-auto" class="btn-abrir" style="background:var(--verde); color:#000;">EXTRAER MARCA</button>
                <button id="btn-auto-auto" class="btn-abrir" style="background:var(--amarillo); color:#000;">▶ AUTOMÁTICO</button>
                <div style="display:flex; align-items:center; gap:5px; background:#000; border:1px solid var(--amarillo); padding:4px 8px; border-radius:6px;">
                    <span style="font-size:11px; color:#fff; font-weight:bold;">SEG:</span>
                    <input type="number" id="sel-vel-auto" value="5" min="1" step="0.5" style="background:transparent; border:none; color:#fff; width:50px; font-weight:bold; text-align:center; outline:none;">
                </div>
                <button id="btn-pausa-auto" class="btn-abrir" style="background:#ff9900; color:#000; display:none;">PAUSAR</button>
                <button id="btn-reset-auto" class="btn-abrir" style="background:var(--rojo); color:#fff;">REINICIAR BARAJA</button>
            </div>
            <div id="estado-partida" style="font-size:12px; font-weight:bold; color:var(--verde); margin-bottom:10px; text-transform:uppercase;">ESTADO: DETENIDO</div>
            <div id="ultimo-num-auto" style="font-size:32px; font-weight:900; color:var(--amarillo); margin-bottom:15px;">--</div>
            <div id="tablero-grid-auto" style="display:flex; flex-wrap:wrap; gap:6px; justify-content:center; max-width:700px; margin:0 auto; max-height: 200px; overflow-y: auto;"></div>
        </div>`;

    const sorteoRef = ref(rtdb, `proyectos/${miCarpeta}/sorteos/${codJuego}`);
    let salidos = [];
    let intervaloAuto = null;

    document.getElementById('btn-comenzar-autos').onclick = async () => {
        await updateDoc(doc(db, "proyectos", miCarpeta), { estadoAutosComenzado: true });
        alert("¡Partida de Autos comenzada!");
    };

    document.getElementById('btn-reset-todo-autos').onclick = async () => {
        if (confirm("¿Reiniciar partida completa, borrar selecciones de los jugadores y marcas sacadas?")) {
            detenerAuto();
            await updateDoc(doc(db, "proyectos", miCarpeta), { estadoAutosComenzado: false });
            await set(ref(rtdb, `proyectos/${miCarpeta}/autosSeleccion`), null);
            await set(sorteoRef, { sacados: [], estado: "detenido", ultimo: null });
            alert("¡Partida de Autos reiniciada por completo!");
        }
    };

    onValue(sorteoRef, (snapshot) => {
        const data = snapshot.val() || {};
        const rawSalidos = data.sacados || [];
        salidos = Array.isArray(rawSalidos) ? rawSalidos : Object.values(rawSalidos);
        const estadoJuego = data.estado || "detenido";

        const ultimo = salidos[salidos.length - 1] || "--";
        const elem = document.getElementById('ultimo-num-auto');
        if(elem) elem.innerText = ultimo;

        const lblEstado = document.getElementById('estado-partida');
        if(lblEstado) {
            lblEstado.innerText = `ESTADO: ${estadoJuego.toUpperCase()}`;
            lblEstado.style.color = estadoJuego === 'activo' ? 'var(--verde)' : (estadoJuego === 'pausado' ? '#ff9900' : 'var(--rojo)');
        }
        renderTablero(salidos);
    });

    function renderTablero(salidosList) {
        let html = '';
        autos.forEach((item, index) => {
            const numP = `#${index + 1}`;
            const mar = salidosList.includes(item);
            html += `<div style="background:${mar ? 'var(--verde)' : '#111'}; color:${mar ? '#000' : '#aaa'}; padding:6px 10px; border-radius:4px; font-weight:bold; font-size:10px; text-transform:uppercase;">${numP} ${item}</div>`;
        });
        const grid = document.getElementById('tablero-grid-auto');
        if(grid) grid.innerHTML = html;
    }

    async function sacarAccion() {
        const disponibles = autos.filter(item => !salidos.includes(item));
        if (disponibles.length === 0) {
            detenerAuto();
            alert("¡Todas las marcas han salido!");
            return;
        }
        const nuevo = disponibles[Math.floor(Math.random() * disponibles.length)];
        salidos.push(nuevo);
        await set(sorteoRef, { sacados: salidos, estado: "activo", ultimo: nuevo });
    }

    document.getElementById('btn-sacar-auto').onclick = async () => {
        detenerAuto();
        await sacarAccion();
    };

    const btnAuto = document.getElementById('btn-auto-auto');
    const btnPausa = document.getElementById('btn-pausa-auto');
    const inpVel = document.getElementById('sel-vel-auto');

    function obtenerMilisegundos() {
        const val = parseFloat(inpVel.value);
        return (isNaN(val) || val <= 0) ? 5000 : val * 1000;
    }

    btnAuto.onclick = () => {
        if (intervaloAuto) return;
        const vel = obtenerMilisegundos();
        btnAuto.style.display = "none";
        btnPausa.style.display = "inline-block";
        btnPausa.innerText = "PAUSAR";
        sacarAccion();
        intervaloAuto = setInterval(() => sacarAccion(), vel);
    };

    btnPausa.onclick = async () => {
        if (intervaloAuto) {
            clearInterval(intervaloAuto);
            intervaloAuto = null;
            btnPausa.innerText = "REANUDAR";
            await set(sorteoRef, { sacados: salidos, estado: "pausado", ultimo: salidos[salidos.length - 1] || null });
        } else {
            const vel = obtenerMilisegundos();
            btnPausa.innerText = "PAUSAR";
            intervaloAuto = setInterval(() => sacarAccion(), vel);
            await set(sorteoRef, { sacados: salidos, estado: "activo", ultimo: salidos[salidos.length - 1] || null });
        }
    };

    function detenerAuto() {
        if (intervaloAuto) {
            clearInterval(intervaloAuto);
            intervaloAuto = null;
        }
        if (btnAuto) btnAuto.style.display = "inline-block";
        if (btnPausa) btnPausa.style.display = "none";
    }

    document.getElementById('btn-reset-auto').onclick = async () => {
        if (confirm("¿Reiniciar baraja actual de Autos?")) {
            detenerAuto();
            await set(sorteoRef, { sacados: [], estado: "detenido", ultimo: null });
        }
    };
}