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

function displayAllFavorites() {
    const container = document.getElementById('allFavoritesContainer');

    if (!container) return;

    const users = getAllUsers();

    if (!users.length) {
        container.innerHTML = '<p class="text-muted">Nenhum usuário encontrado.</p>';
        return;
    }

    users.forEach(user => {
        const breeds = getFavoriteBreeds(user.email);

        if (breeds.length === 0) return;

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
}

function displayMyFavorites() {
    const currentUser = getCurrentUser();
    const container = document.getElementById('myFavoritesContainer');

    if (!container) return;

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
                        <small class="text-muted">Favoritado por você</small>
                    </p>
                </div>
            </div>
        `;
        container.appendChild(div);
    });
}

function initPimpolhosPage() {
    displayAllFavorites();
    displayMyFavorites();
}