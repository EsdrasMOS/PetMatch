// teste.js

function getUserPreferences() {
    return {
        size: document.querySelector('input[name="size"]:checked')?.value || '',
        temperament: document.querySelector('input[name="temperament"]:checked')?.value || '',
        life_span: document.querySelector('input[name="life_span"]:checked')?.value || '',
        origin: document.querySelector('input[name="origin"]:checked')?.value || '',
        weight: document.querySelector('input[name="weight"]:checked')?.value || ''
    };
}

function runTest() {
    const userPrefs = getUserPreferences();
    console.log("📋 Suas preferências:", userPrefs);
    getMatchingBreeds(userPrefs);
}

async function getMatchingBreeds(userPrefs) {
    const url = 'https://api.thedogapi.com/v1/breeds'; 
    const apiKey = 'live_3JFxMfYR6dL0NihqBPYZtHRi6vPjCFsbXXZ722q2UZ0SLeI93xjbnR0HvqrTvtWo';

    try {
        const response = await fetch(url, {
            headers: {
                'x-api-key': apiKey
            }
        });

        if (!response.ok) throw new Error(`Erro na API: ${response.status}`);

        let breeds = await response.json();

        if (!breeds.length) {
            alert("Nenhuma raça encontrada.");
            showFallbackBreeds();
            return;
        }

        breeds = breeds.filter(breed => breed.name && breed.image?.url);

        const matches = breeds.map(breed => {
            let matchCount = 0;

            const height = parseInt(breed.height?.metric.split(' ')[0]) || 0;
            const inferredSize = height < 40 ? 'Small' : height <= 60 ? 'Medium' : 'Large';
            if (userPrefs.size && inferredSize === userPrefs.size) matchCount += 1;

            if (userPrefs.temperament && breed.temperament && breed.temperament.toLowerCase().includes(userPrefs.temperament.toLowerCase())) {
                matchCount += 1;
            }

            if (userPrefs.life_span && breed.life_span && breed.life_span.includes(userPrefs.life_span)) {
                matchCount += 1;
            }

            if (userPrefs.origin && breed.origin && breed.origin.toLowerCase().includes(userPrefs.origin.toLowerCase())) {
                matchCount += 1;
            }

            if (userPrefs.weight) {
                const avgWeight = parseFloat(breed.weight?.metric.split(' - ')[0]);
                const [min, max] = userPrefs.weight.split(' - ').map(parseFloat);
                if ((avgWeight >= min) && (max ? avgWeight <= max : true)) {
                    matchCount += 1;
                }
            }

            return { ...breed, matchCount };
        })
        .filter(breed => breed.matchCount > 0)
        .sort((a, b) => b.matchCount - a.matchCount)
        .slice(0, 10); // Mostra até 10 raças

        displayResults(matches);

    } catch (error) {
        console.error("🚨 Erro ao buscar raças:", error);
        alert("Ocorreu um erro ao carregar as raças.");
        showFallbackBreeds();
    }
}

function displayResults(results) {
    const resultsContainer = document.getElementById('results');
    resultsContainer.innerHTML = '';

    if (!results.length) {
        resultsContainer.innerHTML = `
            <div class="text-center text-muted mb-4">
                <p>Nenhuma raça foi totalmente compatível com suas preferências.</p>
                <p>Aqui estão algumas raças populares:</p>
            </div>
        `;
        showFallbackBreeds();
        return;
    }

    results.forEach(breed => {
        const div = document.createElement('div');
        div.className = 'card mb-4 shadow-sm';

        const imageUrl = breed.image?.url 
            ? `<img src="${breed.image.url}" class="card-img-top" alt="${breed.name}">` 
            : '<p class="text-center mt-3">Sem imagem disponível</p>';

            div.innerHTML = `
            ${imageUrl}
            <div class="card-body">
                <h5 class="card-title">${breed.name}</h5>
                <p class="card-text">
                    <strong>Tamanho estimado:</strong> ${getInferredSize(breed)}<br>
                    <strong>Temperamento:</strong> ${translateTemperament(breed.temperament)}<br>
                    <strong>Origem:</strong> ${breed.origin || 'Não informado'}<br>
                    <strong>Peso:</strong> ${breed.weight?.metric || 'Não informado'}<br>
                    <strong>Esperança de vida:</strong> ${breed.life_span || 'Não informado'}<br>
                    <strong>Compatibilidade:</strong> ${breed.matchCount}/5 critérios batem
                </p>
                <button class="btn btn-outline-success btn-favorite" onclick="toggleFavorite('${breed.name}', '${breed.image.url}', '${breed.id}')">
                    ❤️ Favoritar
                </button>
            </div>
        `;
    });
}

function getInferredSize(breed) {
    const height = parseInt(breed.height?.metric.split(' ')[0]) || 0;
    if (height < 40) return 'Pequeno';
    if (height <= 60) return 'Médio';
    return 'Grande';
}

function translateTemperament(temperament) {
    if (!temperament) return 'Não informado';

    const temperamentMap = {
        'friendly': 'Amigável',
        'loyal': 'Leal',
        'intelligent': 'Inteligente',
        'energetic': 'Energético',
        'calm': 'Calmo',
        'playful': 'Brincalhão',
        'gentle': 'Gentil',
        'alert': 'Alerta',
        'watchful': 'Vigilante',
        'independent': 'Independente',
        'docile': 'Dócil',
        'active': 'Ativo',
        'trainable': 'Treinável',
        'protective': 'Protetor',
        'affectionate': 'Afetuoso'
    };

    if (!temperament) return 'Não informado';

    return temperament
        .split(', ')
        .map(temp => temperamentMap[temp.toLowerCase()] || temp)
        .join(', ');
}

function toggleFavorite(name, imageUrl, id) {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));

    if (!currentUser) {
        alert("Você precisa estar logado para favoritar uma raça.");
        window.location.href = 'index.html';
        return;
    }

    let favorites = JSON.parse(localStorage.getItem('favorites') || '{}');

    if (!favorites[currentUser.email]) {
        favorites[currentUser.email] = [];
    }

    const existing = favorites[currentUser.email].find(fav => fav.id === id);

    if (existing) {
        favorites[currentUser.email] = favorites[currentUser.email].filter(fav => fav.id !== id);
        alert(`${name} removido dos favoritos.`);
    } else {
        favorites[currentUser.email].push({
            name: breed.name,
            imageUrl: breed.image?.url || '',
            id: breed.id
        });
        alert(`${name} adicionado aos favoritos!`);
    }

    localStorage.setItem('favorites', JSON.stringify(favorites));
}
function displayFavorites() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    const container = document.getElementById('favoritesContainer');

    if (!container || !currentUser) return;

    const favorites = JSON.parse(localStorage.getItem('favorites') || '{}')[currentUser.email];

    if (!favorites || favorites.length === 0) {
        container.innerHTML = '<p>Você ainda não tem raças favoritas.</p>';
        return;
    }

    container.innerHTML = '';
    favorites.forEach(fav => {
        const div = document.createElement('div');
        div.className = 'card mb-3 shadow-sm';
        div.innerHTML = `
            <img src="${fav.imageUrl}" class="card-img-top" alt="${fav.name}">
            <div class="card-body">
                <h5 class="card-title">${fav.name}</h5>
                <p class="card-text">
                    <small class="text-muted">Raça favorita</small>
                </p>
            </div>
        `;
        container.appendChild(div);
    });
}