//Carrega os dados do usuário logado
function loadUserProfile() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));

    if (!currentUser) {
        document.getElementById('profileMessage').textContent = "Você precisa estar logado.";
        document.getElementById('profileMessage').classList.remove('d-none');
        return;
    }

    document.getElementById('userName').value = currentUser.name || '';
    document.getElementById('userEmail').value = currentUser.email || '';
    document.getElementById('userBirthdate').value = currentUser.birthdate || '';
}

// Atualiza os dados do usuário 
function updateCurrentUser(data) {
    localStorage.setItem('currentUser', JSON.stringify(data));
}

function updateUsersList(users) {
    localStorage.setItem('users', JSON.stringify(users));
}

// Salva as alterações 
document.getElementById('profileForm').addEventListener('submit', function(e) {
    e.preventDefault();

    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    const users = JSON.parse(localStorage.getItem('users')) || [];

    const newName = document.getElementById('userName').value.trim();
    const newBirthdate = document.getElementById('userBirthdate').value;
    const newPasswordInput = document.getElementById('userPassword').value;

    if (!newName) {
        alert("Por favor, preencha seu nome.");
        return;
    }

    const updatedUser = {
        ...currentUser,
        name: newName,
        birthdate: newBirthdate
    };

    if (newPasswordInput) {
        updatedUser.password = newPasswordInput;
    }

    const updatedUsers = users.map(u => u.email === currentUser.email ? updatedUser : u);

    updateUsersList(updatedUsers);
    updateCurrentUser(updatedUser);

    document.getElementById('profileMessage').textContent = "Seus dados foram atualizados!";
    document.getElementById('profileMessage').classList.remove('d-none');
});

// Confirmação antes de excluir conta
function confirmDeleteAccount() {
    if (confirm("Você tem certeza que deseja excluir sua conta? Essa ação não pode ser desfeita.")) {
        deleteAccount();
    }
}

// Exclui a conta do usuário
function deleteAccount() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    let users = JSON.parse(localStorage.getItem('users')) || [];
    let favorites = JSON.parse(localStorage.getItem('favorites') || '{}');

    users = users.filter(user => user.email !== currentUser.email);

    delete favorites[currentUser.email];

    // Atualiza localStorage
    localStorage.setItem('users', JSON.stringify(users));
    localStorage.removeItem('currentUser');
    localStorage.setItem('favorites', JSON.stringify(favorites));

    alert("Conta excluída com sucesso.");
    window.location.href = 'index.html';
}
window.onload = () => {
    loadUserProfile();
};