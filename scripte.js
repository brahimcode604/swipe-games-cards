// Éléments DOM
const cardStack = document.getElementById('cardStack');
const likeBtn = document.getElementById('likeBtn');
const dislikeBtn = document.getElementById('dislikeBtn');
const summaryBtn = document.getElementById('summaryBtn');
const summaryContainer = document.getElementById('summaryContainer');
const likedGamesContainer = document.getElementById('likedGames');
const backBtn = document.getElementById('backBtn');

// Variables d'état
let games = [];
let likedGames = [];
let currentCardIndex = 0;
let isDragging = false;
let startX = 0;
let currentX = 0;

// Charger les données depuis le fichier JSON
async function loadGames() {
    try {
        const response = await fetch('games.json');
        games = await response.json();
        init();
    } catch (error) {
        console.error('Erreur lors du chargement des jeux:', error);
        cardStack.innerHTML = '<div class="no-more-cards">Erreur de chargement des jeux</div>';
    }
}

// Initialisation
function init() {
    renderCards();
    setupEventListeners();
}

// Rendu des cartes
function renderCards() {
    cardStack.innerHTML = '';
    
    if (currentCardIndex >= games.length) {
        cardStack.innerHTML = '<div class="no-more-cards">Plus de jeux à découvrir!<br>Consultez vos jeux aimés.</div>';
        return;
    }
    
    // Créer les cartes
    for (let i = currentCardIndex; i < Math.min(currentCardIndex + 3, games.length); i++) {
        const game = games[i];
        const card = document.createElement('div');
        card.className = 'game-card';
        if (i === currentCardIndex) {
            card.classList.add('active');
        }
        card.dataset.id = game.id;
        
        card.innerHTML = `
            <div class="game-image" style="background-image: url('${game.image}')"></div>
            <div class="game-info">
                <h2 class="game-title">${game.title}</h2>
                <p class="game-description">${game.description}</p>
                <span class="game-genre">${game.genre}</span>
            </div>
        `;
        
        cardStack.appendChild(card);
    }
    
    // Ajouter les écouteurs d'événements de glissement
    setupDragEvents();
}

// Configuration des écouteurs d'événements
function setupEventListeners() {
    likeBtn.addEventListener('click', handleLike);
    dislikeBtn.addEventListener('click', handleDislike);
    summaryBtn.addEventListener('click', showSummary);
    backBtn.addEventListener('click', hideSummary);
}

// Configuration des événements de glissement
function setupDragEvents() {
    const activeCard = document.querySelector('.game-card.active');
    if (!activeCard) return;
    
    activeCard.addEventListener('mousedown', startDrag);
    activeCard.addEventListener('touchstart', startDrag);
    
    document.addEventListener('mousemove', drag);
    document.addEventListener('touchmove', drag);
    
    document.addEventListener('mouseup', endDrag);
    document.addEventListener('touchend', endDrag);
}

// Gestion du début du glissement
function startDrag(e) {
    isDragging = true;
    const activeCard = document.querySelector('.game-card.active');
    activeCard.style.transition = 'none';
    
    if (e.type === 'mousedown') {
        startX = e.clientX;
    } else if (e.type === 'touchstart') {
        startX = e.touches[0].clientX;
    }
}

// Gestion du glissement
function drag(e) {
    if (!isDragging) return;
    
    const activeCard = document.querySelector('.game-card.active');
    if (!activeCard) return;
    
    if (e.type === 'mousemove') {
        currentX = e.clientX;
    } else if (e.type === 'touchmove') {
        currentX = e.touches[0].clientX;
    }
    
    const diffX = currentX - startX;
    
    // Appliquer la transformation
    activeCard.style.transform = `translateX(${diffX}px) rotate(${diffX * 0.1}deg)`;
    
    // Changer l'opacité en fonction de la direction
    if (diffX > 50) {
        activeCard.classList.add('swiping-right');
        activeCard.classList.remove('swiping-left');
    } else if (diffX < -50) {
        activeCard.classList.add('swiping-left');
        activeCard.classList.remove('swiping-right');
    } else {
        activeCard.classList.remove('swiping-left', 'swiping-right');
    }
}

// Gestion de la fin du glissement
function endDrag() {
    if (!isDragging) return;
    
    isDragging = false;
    const activeCard = document.querySelector('.game-card.active');
    if (!activeCard) return;
    
    activeCard.style.transition = 'transform 0.5s ease, opacity 0.5s ease';
    
    const diffX = currentX - startX;
    
    // Déterminer si le glissement est suffisant pour déclencher une action
    if (diffX > 100) {
        // Glissement vers la droite - Like
        handleLike();
    } else if (diffX < -100) {
        // Glissement vers la gauche - Dislike
        handleDislike();
    } else {
        // Retour à la position initiale
        activeCard.style.transform = 'translateX(0) rotate(0)';
        activeCard.classList.remove('swiping-left', 'swiping-right');
    }
}

// Gestion du like
function handleLike() {
    const currentGame = games[currentCardIndex];
    likedGames.push(currentGame);
    
    animateCardSwipe('right');
    setTimeout(() => {
        currentCardIndex++;
        renderCards();
    }, 300);
}

// Gestion du dislike
function handleDislike() {
    animateCardSwipe('left');
    setTimeout(() => {
        currentCardIndex++;
        renderCards();
    }, 300);
}

// Animation de glissement de carte
function animateCardSwipe(direction) {
    const activeCard = document.querySelector('.game-card.active');
    if (!activeCard) return;
    
    if (direction === 'right') {
        activeCard.style.transform = 'translateX(500px) rotate(30deg)';
    } else {
        activeCard.style.transform = 'translateX(-500px) rotate(-30deg)';
    }
    
    activeCard.style.opacity = '0';
}

// Affichage du récapitulatif
function showSummary() {
    document.querySelector('.container').style.display = 'none';
    summaryContainer.style.display = 'block';
    
    // Afficher les jeux aimés
    likedGamesContainer.innerHTML = '';
    
    if (likedGames.length === 0) {
        likedGamesContainer.innerHTML = '<p style="text-align: center; grid-column: 1 / -1;">Aucun jeu aimé pour le moment.</p>';
        return;
    }
    
    likedGames.forEach(game => {
        const gameCard = document.createElement('div');
        gameCard.className = 'liked-game-card';
        
        gameCard.innerHTML = `
            <div class="liked-game-image" style="background-image: url('${game.image}')"></div>
            <div class="liked-game-info">
                <h3>${game.title}</h3>
                <p>${game.genre}</p>
            </div>
        `;
        
        likedGamesContainer.appendChild(gameCard);
    });
}

// Masquage du récapitulatif
function hideSummary() {
    summaryContainer.style.display = 'none';
    document.querySelector('.container').style.display = 'flex';
}

// Charger les jeux au démarrage
loadGames();