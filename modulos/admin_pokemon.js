import { ref, set, onValue } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";
import { updateDoc, doc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

export function iniciar(contenedor, db, miCarpeta, rtdb) {
    const pokemonList = [
        "Bulbasaur", "Ivysaur", "Venusaur", "Charmander", "Charmeleon", "Charizard", "Squirtle", "Wartortle", "Blastoise", "Caterpie",
        "Metapod", "Butterfree", "Weedle", "Kakuna", "Beedrill", "Pidgey", "Pidgeotto", "Pidgeot", "Rattata", "Raticate",
        "Spearow", "Fearow", "Ekans", "Arbok", "Pikachu", "Raichu", "Sandshrew", "Sandslash", "Nidoran♀", "Nidorina",
        "Nidoqueen", "Nidoran♂", "Nidorino", "Nidoking", "Clefairy", "Clefable", "Vulpix", "Ninetales", "Jigglypuff", "Wigglytuff",
        "Zubat", "Golbat", "Oddish", "Gloom", "Vileplume", "Paras", "Parasect", "Venonat", "Venomoth", "Diglett",
        "Dugtrio", "Meowth", "Persian", "Psyduck", "Golduck", "Mankey", "Primeape", "Growlithe", "Arcanine", "Poliwag",
        "Poliwhirl", "Poliwrath", "Abra", "Kadabra", "Alakazam", "Machop", "Machoke", "Machamp", "Bellsprout", "Weepinbell",
        "Victreebel", "Tentacool", "Tentacruel", "Geodude", "Graveler", "Golem", "Ponyta", "Rapidash", "Slowpoke", "Slowbro",
        "Magnemite", "Magneton", "Farfetch'd", "Doduo", "Dodrio", "Seel", "Dewgong", "Grimer", "Muk", "Shellder",
        "Cloyster", "Gastly", "Haunter", "Gengar", "Onix", "Drowzee", "Hypno", "Krabby", "Kingler", "Voltorb",
        "Electrode", "Exeggcute", "Exeggutor", "Cubone", "Marowak", "Hitmonlee", "Hitmonchan", "Lickitung", "Koffing", "Weezing",
        "Rhyhorn", "Rhydon", "Chansey", "Tangela", "Kangaskhan", "Horsea", "Seadra", "Goldeen", "Seaking", "Staryu",
        "Starmie", "Mr. Mime", "Scyther", "Jynx", "Electabuzz", "Magmar", "Pinsir", "Tauros", "Magikarp", "Gyarados",
        "Lapras", "Ditto", "Eevee", "Vaporeon", "Jolteon", "Flareon", "Porygon", "Omanyte", "Omastar", "Kabuto",
        "Kabutops", "Aerodactyl", "Snorlax", "Articuno", "Zapdos", "Moltres", "Dratini", "Dragonair", "Dragonite"
    ];
    const codJuego = "pokemon";

    contenedor.innerHTML = `
        <div style="background:#080808; border:1px solid #ffcb05; padding:20px; border-radius:15px; text-align:center;">
            <h2 style="color:#ffcb05; margin-top:0;">POKEDEX KANTO (120 POKÉMON)</h2>
            
            <div style="display: flex; gap: 10px; margin-bottom: 15px; justify-content: center;">
                <button id="btn-comenzar-poke" class="btn-abrir" style="background: var(--verde); color: #000; flex: 1; padding: 10px; font-weight: 900; border-radius: 6px; cursor: pointer;">🚀 COMENZAR PARTIDA</button>
                <button id="btn-reset-todo-poke" class="btn-abrir" style="background: var(--amarillo); color: #000; flex: 1; padding: 10px; font-weight: 900; border-radius: 6px; cursor: pointer;">🔄 REINICIAR TODO Y SELECCIÓN</button>
            </div>

            <div style="display:flex; gap:8px; justify-content:center; align-items:center; margin-bottom:15px; flex-wrap:wrap;">
                <button id="btn-sacar-poke" class="btn-abrir" style="background:#ffcb05; color:#000;">EXTRAER POKÉMON</button>
                <button id="btn-auto-poke" class="btn-abrir" style="background:var(--amarillo); color:#000;">▶ AUTOMÁTICO</button>
                <div style="display:flex; align-items:center; gap:5px; background:#000; border:1px solid var(--amarillo); padding:4px 8px; border-radius:6px;">
                    <span style="font-size:11px; color:#fff; font-weight:bold;">SEG:</span>
                    <input type="number" id="sel-vel-poke" value="5" min="1" step="0.5" style="background:transparent; border:none; color:#fff; width:50px; font-weight:bold; text-align:center; outline:none;">
                </div>
                <button id="btn-pausa-poke" class="btn-abrir" style="background:#ff9900; color:#000; display:none;">PAUSAR</button>
                <button id="btn-reset-poke" class="btn-abrir" style="background:var(--rojo); color:#fff;">REINICIAR BARAJA</button>
            </div>
            <div id="estado-partida" style="font-size:12px; font-weight:bold; color:#ffcb05; margin-bottom:10px; text-transform:uppercase;">ESTADO: DETENIDO</div>
            <div id="ultimo-num-poke" style="font-size:32px; font-weight:900; color:var(--amarillo); margin-bottom:15px;">--</div>
            <div id="tablero-grid-poke" style="display:flex; flex-wrap:wrap; gap:6px; justify-content:center; max-width:700px; margin:0 auto; max-height: 200px; overflow-y: auto;"></div>
        </div>`;

    const sorteoRef = ref(rtdb, `proyectos/${miCarpeta}/sorteos/${codJuego}`);
    let salidos = [];
    let intervaloAuto = null;

    document.getElementById('btn-comenzar-poke').onclick = async () => {
        await updateDoc(doc(db, "proyectos", miCarpeta), { estadoPokemonComenzado: true });
        alert("¡Partida de Pokémon comenzada!");
    };

    document.getElementById('btn-reset-todo-poke').onclick = async () => {
        if (confirm("¿Reiniciar partida completa, borrar selecciones de los jugadores y Pokémon sacados?")) {
            detenerAuto();
            await updateDoc(doc(db, "proyectos", miCarpeta), { estadoPokemonComenzado: false });
            await set(ref(rtdb, `proyectos/${miCarpeta}/pokemonSeleccion`), null);
            await set(sorteoRef, { sacados: [], estado: "detenido", ultimo: null });
            alert("¡Partida de Pokémon reiniciada por completo!");
        }
    };

    onValue(sorteoRef, (snapshot) => {
        const data = snapshot.val() || {};
        const rawSalidos = data.sacados || [];
        salidos = Array.isArray(rawSalidos) ? rawSalidos : Object.values(rawSalidos);
        const estadoJuego = data.estado || "detenido";

        const ultimo = salidos[salidos.length - 1] || "--";
        const elem = document.getElementById('ultimo-num-poke');
        if(elem) elem.innerText = ultimo;

        const lblEstado = document.getElementById('estado-partida');
        if(lblEstado) {
            lblEstado.innerText = `ESTADO: ${estadoJuego.toUpperCase()}`;
            lblEstado.style.color = estadoJuego === 'activo' ? '#ffcb05' : (estadoJuego === 'pausado' ? '#ff9900' : 'var(--rojo)');
        }
        renderTablero(salidos);
    });

    function renderTablero(salidosList) {
        let html = '';
        pokemonList.forEach((poke, index) => {
            const numP = `#${index + 1}`;
            const mar = salidosList.includes(poke);
            html += `<div style="background:${mar ? '#ffcb05' : '#111'}; color:${mar ? '#000' : '#aaa'}; padding:6px 10px; border-radius:4px; font-weight:bold; font-size:10px; text-transform:uppercase;">${numP} ${poke}</div>`;
        });
        const grid = document.getElementById('tablero-grid-poke');
        if(grid) grid.innerHTML = html;
    }

    async function sacarAccion() {
        const disponibles = pokemonList.filter(item => !salidos.includes(item));
        if (disponibles.length === 0) {
            detenerAuto();
            alert("¡Han salido todos los Pokémon!");
            return;
        }
        const nuevo = disponibles[Math.floor(Math.random() * disponibles.length)];
        salidos.push(nuevo);
        await set(sorteoRef, { sacados: salidos, estado: "activo", ultimo: nuevo });
    }

    document.getElementById('btn-sacar-poke').onclick = async () => {
        detenerAuto();
        await sacarAccion();
    };

    const btnAuto = document.getElementById('btn-auto-poke');
    const btnPausa = document.getElementById('btn-pausa-poke');
    const inpVel = document.getElementById('sel-vel-poke');

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

    document.getElementById('btn-reset-poke').onclick = async () => {
        if (confirm("¿Reiniciar baraja actual de Pokémon?")) {
            detenerAuto();
            await set(sorteoRef, { sacados: [], estado: "detenido", ultimo: null });
        }
    };
}