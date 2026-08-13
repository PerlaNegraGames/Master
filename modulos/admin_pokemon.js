import { ref, set, onValue } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

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
        "Kabutops", "Aerodactyl", "Snorlax", "Articuno", "Zapdos", "Moltres", "Dratini", "Dragonair", "Dragonite", "Mewtwo", "Mew"
    ];
    
    const codJuego = "pokemon";

    contenedor.innerHTML = `
        <div style="background:#080808; border:1px solid #ffcb05; padding:20px; border-radius:15px; text-align:center;">
            <h2 style="color:#ffcb05; margin-top:0;">POKEDEX KANTO (151 POKÉMON)</h2>
            <div style="display:flex; gap:10px; justify-content:center; margin-bottom:15px;">
                <button id="btn-sacar-poke" class="btn-abrir" style="background:#ffcb05; color:#000;">SACAR POKÉMON</button>
                <button id="btn-reset-poke" class="btn-abrir" style="background:var(--rojo); color:#fff;">REINICIAR</button>
            </div>
            <div id="ultimo-num-poke" style="font-size:32px; font-weight:900; color:#3b4cca; margin-bottom:15px;">--</div>
            <div id="tablero-grid-poke" style="display:grid; grid-template-columns:repeat(auto-fill, minmax(110px, 1fr)); gap:5px; max-height:350px; overflow-y:auto; padding:10px; border:1px solid #222; border-radius:8px;"></div>
        </div>`;

    const sorteoRef = ref(rtdb, `proyectos/${miCarpeta}/sorteos/${codJuego}`);
    let salidos = [];

    onValue(sorteoRef, (snapshot) => {
        const data = snapshot.val() || {};
        const rawSalidos = data.sacados || [];
        salidos = Array.isArray(rawSalidos) ? rawSalidos : Object.values(rawSalidos);

        const ultimo = salidos[salidos.length - 1] || "--";
        const elem = document.getElementById('ultimo-num-poke');
        if(elem) elem.innerText = ultimo;
        renderTablero(salidos);
    });

    function renderTablero(salidosList) {
        let html = '';
        pokemonList.forEach((poke, index) => {
            const numP = `#${index + 1}`;
            const mar = salidosList.includes(poke);
            html += `<div style="background:${mar ? '#ffcb05' : '#111'}; color:${mar ? '#000' : '#888'}; padding:6px; border-radius:4px; font-weight:bold; font-size:10px; text-transform:uppercase;">${numP} ${poke}</div>`;
        });
        const grid = document.getElementById('tablero-grid-poke');
        if(grid) grid.innerHTML = html;
    }

    document.getElementById('btn-sacar-poke').onclick = async () => {
        const disponibles = pokemonList.filter(item => !salidos.includes(item));
        if (disponibles.length === 0) return alert("¡Han salido los 151 Pokémon!");
        const nuevo = disponibles[Math.floor(Math.random() * disponibles.length)];
        salidos.push(nuevo);
        await set(sorteoRef, { sacados: salidos, estado: "activo", ultimo: nuevo });
    };

    document.getElementById('btn-reset-poke').onclick = async () => {
        if (confirm("¿Reiniciar Pokedex?")) {
            await set(sorteoRef, { sacados: [], estado: "detenido", ultimo: null });
        }
    };
}