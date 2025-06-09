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
                'x-api-key': 'live_ddZ3SMxuOJEOpefHVIIGBJhBWik7lhRPg3wDKp5YbwyTphfLQkZ0tIzIL4qGLYrQ'
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

    if (!container) return;

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

            if (!imageUrl) {
                imageUrl = await fetchBreedImageFromAPI(breed.name);
            }

            breedCards.push(`
                <div class="col-md-3 col-sm-6 mb-3 d-flex justify-content-center">
                    <div class="card shadow-sm h-100" style="width: 100%; max-width: 250px;">
                        <img src="${imageUrl}" 
                             alt="${breed.name}" 
                             style="height: 200px; width: 100%; object-fit: cover; border-top-left-radius: 8px; border-top-right-radius: 8px;">
                        <div class="card-body text-center p-2">
                            <p class="mb-0">${breed.name}</p>
                        </div>
                    </div>
                </div>
            `);
        }

        userDiv.innerHTML = `
            <div class="card shadow-sm border-0 mb-4">
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
        container.innerHTML = '<p class="text-muted text-center">Nenhum usuário favoritou raças ainda.</p>';
    }
}

function displayMyFavorites() {
    const currentUser = getCurrentUser();
    const myContainer = document.getElementById('myFavoritesContainer');

    if (!myContainer) return;

    if (!currentUser) {
        myContainer.innerHTML = `<p class="text-center text-muted">Você precisa estar logado para ver seus favoritos.</p>`;
        return;
    }

    const breeds = getFavoriteBreeds(currentUser.email);

    if (!breeds.length) {
        myContainer.innerHTML = `<p class="text-center text-muted">Você ainda não favoritou nenhuma raça.</p>`;
        return;
    }

    breeds.forEach(async (breed) => {
        let imageUrl = breed.imageUrl;

        if (!imageUrl) {
            imageUrl = await fetchBreedImageFromAPI(breed.name);
        }

        const div = document.createElement('div');
        div.className = 'col-md-3 col-sm-6 mb-3 d-flex justify-content-center';

        div.innerHTML = `
            <div class="card shadow-sm h-100" style="width: 100%; max-width: 250px;">
                <img src="${imageUrl}" 
                     alt="${breed.name}" 
                     style="height: 200px; width: 100%; object-fit: cover; border-top-left-radius: 8px; border-top-right-radius: 8px;">
                <div class="card-body text-center p-2">
                    <h5 class="card-title m-0">${breed.name}</h5>
                    <small class="text-muted d-block mt-2">
                    <a href="#" onclick="event.preventDefault(); unfavoriteBreed('${breed.name}')" class="text-decoration-none text-danger">
                        ❌ Deixar o pimpolho
                    </a>
                </small>
            </div>
            </div>
        `;
        myContainer.appendChild(div);
    });
}

// Função para desfavoritar uma raça
function unfavoriteBreed(breedName) {
    const currentUser = getCurrentUser();

    if (!currentUser) {
        alert("Você precisa estar logado para remover um favorito.");
        window.location.href = 'index.html';
        return;
    }

    let favorites = JSON.parse(localStorage.getItem('favorites') || '{}');
    const userFavorites = favorites[currentUser.email] || [];

    // Filtra e remove a raça
    favorites[currentUser.email] = userFavorites.filter(fav => fav.name !== breedName);

    // Salva de volta no localStorage
    localStorage.setItem('favorites', JSON.stringify(favorites));

    // Recarrega os dados
    const myContainer = document.getElementById('myFavoritesContainer');
    myContainer.innerHTML = '';
    displayMyFavorites();
}

function initPimpolhosPage() {
    console.log(" Carregando página de Pimpolhos...");
    displayAllFavorites();
    displayMyFavorites();
}