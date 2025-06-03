function getCurrentUser() {
    const user = JSON.parse(localStorage.getItem('currentUser'));
    console.log("👤 Usuário atual:", user);
    return user;
}

function getAllUsers() {
    const users = JSON.parse(localStorage.getItem('users')) || [];
    console.log("👥 Todos os usuários:", users);
    return users;
}

function getFavoriteBreeds(email) {
    const favorites = JSON.parse(localStorage.getItem('favorites') || '{}');
    console.log("❤️ Favoritos completos:", favorites);
    console.log("🔍 Buscando favoritos para:", email);

    if (!favorites[email]) {
        console.warn(`⚠️ Sem favoritos para ${email}`);
        return [];
    }

    return favorites[email];
}

function displayAllFavorites() {
    const container = document.getElementById('allFavoritesContainer');
    if (!container) {
        console.error("❌ Container 'allFavoritesContainer' não encontrado");
        return;
    }

    container.innerHTML = ""; // Limpa antes de preencher

    const users = getAllUsers();
    const currentUser = getCurrentUser();

    if (!users.length) {
        container.innerHTML = '<p class="text-muted">Nenhum usuário encontrado.</p>';
        return;
    }

    let hasAnyFavorite = false;

    users.forEach(user => {
        const breeds = getFavoriteBreeds(user.email);

        if (breeds.length === 0) return; // Pula usuários sem favoritos

        hasAnyFavorite = true;

        const userDiv = document.createElement('div');
        userDiv.className = 'col-md-12 mb-4';

        userDiv.innerHTML = `
            <div class="card shadow-sm border-0">
                <div class="card-header bg-secondary text-white">
                    <strong>${user.name}</strong> (${user.email})
                </div>
                <div class="card-body d-flex flex-wrap gap-3">
                    ${breeds.map(breed => `
                        <div class="card" style="width: 180px;">
                            <img src="${breed.imageUrl}" class="card-img-top" alt="${breed.name}">
                            <div class="card-body p-2">
                                <p class="card-text m-0 text-center">${breed.name}</p>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
        container.appendChild(userDiv);
    });

    if (!hasAnyFavorite) {
        container.innerHTML = '<p class="text-muted">Nenhum usuário favoritou raças ainda.</p>';
    }
}

function displayMyFavorites() {
    const currentUser = getCurrentUser();
    const container = document.getElementById('myFavoritesContainer');

    if (!container) {
        console.error("❌ Container 'myFavoritesContainer' não encontrado");
        return;
    }

    container.innerHTML = ""; // Limpa antes de preencher

    if (!currentUser) {
        container.innerHTML = `<p>Você precisa estar logado para ver seus favoritos.</p>`;
        return;
    }

    const breeds = getFavoriteBreeds(currentUser.email);

    if (!breeds.length) {
        container.innerHTML = `<p>Você ainda não favoritou nenhuma raça.</p>`;
        return;
    }

    breeds.forEach(breed => {
        const div = document.createElement('div');
        div.className = 'col-md-3';

        div.innerHTML = `
            <div class="card shadow-sm h-100">
                <img src="${breed.imageUrl}" class="card-img-top" alt="${breed.name}">
                <div class="card-body">
                    <h5 class="card-title">${breed.name}</h5>
                    <p class="card-text">
                        <small class="text-muted">Raça favorita</small>
                    </p>
                </div>
            </div>
        `;
        container.appendChild(div);
    });
}

function initPimpolhosPage() {
    console.log("🔄 Carregando página de pimpolhos...");
    displayAllFavorites();
    displayMyFavorites();
}