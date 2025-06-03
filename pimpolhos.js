// pimpolhos.js

function getCurrentUser() {
    return JSON.parse(localStorage.getItem('currentUser'));
}

function getAllUsers() {
    return JSON.parse(localStorage.getItem('users')) || [];
}

function getFavoriteBreeds(email) {
    const favorites = JSON.parse(localStorage.getItem('favorites') || '{}');
    return favorites[email] || [];
}

async function fetchBreedImageFromAPI(breedName) {
    try {
        const response = await fetch(`https://api.thedogapi.com/v1/breeds/search?q=${encodeURIComponent(breedName)}`, {
            headers: {
                'x-api-key': 'live_3JFxMfYR6dL0NihqBPYZtHRi6vPjCFsbXXZ722q2UZ0SLeI93xjbnR0HvqrTvtWo'
            }
        });

        if (!response.ok) throw new Error("Erro na API");

        const data = await response.json();

        // Retorna primeira imagem encontrada
        return data[0]?.image?.url || "https://placehold.co/600x400?text=Sem+Imagem";
    } catch (error) {
        console.error("🚨 Erro ao buscar imagem:", error);
        return "https://placehold.co/600x400?text=Foto+Não+Encontrada";
    }
}

async function displayAllFavorites() {
    const container = document.getElementById('allFavoritesContainer');

    if (!container) {
        console.error("❌ Container 'allFavoritesContainer' não encontrado");
        return;
    }

    const users = getAllUsers();

    if (!users.length) {
        container.innerHTML = '<p class="text-muted">Nenhum usuário cadastrado.</p>';
        return;
    }

    let hasAnyFavorite = false;

    for (const user of users) {
        const breeds = getFavoriteBreeds(user.email);

        if (!breeds.length) continue;

        hasAnyFavorite = true;

        const userDiv = document.createElement('div');
        userDiv.className = 'col-md-12 mb-4';

        const breedCards = [];

        for (const breed of breeds) {
            let imageUrl = breed.imageUrl;

            // Se não tiver imagem salva, busca da API pelo nome
            if (!imageUrl) {
                imageUrl = await fetchBreedImageFromAPI(breed.name);
            }

            breedCards.push(`
                <div class="card" style="width: 180px;">
                    <img src="${imageUrl}" class="card-img-top" alt="${breed.name}">
                    <div class="card-body p-2">
                        <p class="card-text m-0 text-center">${breed.name}</p>
                    </div>
                </div>
            `);
        }

        userDiv.innerHTML = `
            <div class="card shadow-sm border-0">
                <div class="card-header bg-secondary text-white">
                    <strong>${user.name}</strong> (${user.email})
                </div>
                <div class="card-body d-flex flex-wrap gap-3">
                    ${breedCards.join('')}
                </div>
            </div>
        `;

        container.appendChild(userDiv);
    }

    if (!hasAnyFavorite) {
        container.innerHTML = '<p class="text-muted">Nenhum usuário favoritou raças ainda.</p>';
    }
}

function displayMyFavorites() {
    const currentUser = getCurrentUser();
    const myContainer = document.getElementById('myFavoritesContainer');

    if (!myContainer) {
        console.error("❌ Container 'myFavoritesContainer' não encontrado");
        return;
    }

    if (!currentUser) {
        myContainer.innerHTML = `<p>Você precisa estar logado para ver seus favoritos.</p>`;
        return;
    }

    const breeds = getFavoriteBreeds(currentUser.email);

    if (!breeds.length) {
        myContainer.innerHTML = `<p>Você ainda não favoritou nenhuma raça.</p>`;
        return;
    }

    breeds.forEach(async (breed) => {
        let imageUrl = breed.imageUrl;

        if (!imageUrl) {
            imageUrl = await fetchBreedImageFromAPI(breed.name); // Busca se não tiver imagem salva
        }

        const div = document.createElement('div');
        div.className = 'col-md-3';

        div.innerHTML = `
            <div class="card shadow-sm h-100">
                <img src="${imageUrl}" class="card-img-top" alt="${breed.name}">
                <div class="card-body">
                    <h5 class="card-title">${breed.name}</h5>
                    <p class="card-text">
                        <small class="text-muted">Favoritado por você</small>
                    </p>
                </div>
            </div>
        `;
        myContainer.appendChild(div);
    });
}

function initPimpolhosPage() {
    console.log("🔄 Carregando página de Pimpolhos...");
    displayAllFavorites();
    displayMyFavorites();
}