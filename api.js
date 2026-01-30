// FETCH DATA
db.ref('movies').on('value', (snap) => {
    const data = snap.val();
    allMovies = [];
    if(data) { for (let id in data) { allMovies.push({ id: id, ...data[id] }); } }
    allMovies.sort((a, b) => new Date(b.uploadTime) - new Date(a.uploadTime));
    filteredMovies = [...allMovies];
    displayMovies();
});

db.ref('movieClicks').on('value', (snap) => { 
    globalClicks = snap.val() || {}; 
    displayMovies(); 
});

function displayMovies() {
    const list = document.getElementById('movieList');
    const start = (currentPage - 1) * 10;
    const paginated = filteredMovies.slice(start, start + 10);
    
    list.innerHTML = paginated.map((m) => {
        const clicks = globalClicks[m.id] || 0;
        const trending = (clicks >= 5 || allMovies.indexOf(m) < 3) ? `<div class="trending-badge"><i class="fa-solid fa-fire"></i> TRENDING</div>` : "";
        
        const dH = (new Date() - new Date(m.uploadTime)) / 36e5;
        let tag = dH < 24 
            ? `<div class="recent-tag">RECENTLY ADDED</div>` 
            : (dH < 72 ? `<div class="newly-tag">NEWLY ADDED</div>` : `<div class="must-tag">MUST WATCH</div>`);
        
        return `<div class="movie-box" onclick="showDetails('${m.id}')"> 
            <div class="movie-card show">
                <div class="image-container">
                    <img src="${m.img}" class="movie-img" onerror="this.src='https://via.placeholder.com/300x450?text=No+Image'">
                    ${trending}
                    <div class="res-badge">${m.res || 'HD'}</div>
                </div>
                <div class="upload-info">
                    <span class="time-text">${timeAgo(m.uploadTime)}</span>
                    <div class="tag-area">${tag}</div>
                    <div class="movie-title">${m.title}</div>
                </div>
            </div>
        </div>`;
    }).join('');

    document.getElementById('pageNumber').innerText = `Page ${currentPage}`;
    document.getElementById('prevBtn').disabled = (currentPage === 1);
    document.getElementById('nextBtn').disabled = (start + 10 >= filteredMovies.length);
}

function timeAgo(date) {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    
    if (seconds < 60) return "Just Now";
    if (minutes < 60) return minutes + " Min Ago";
    if (hours < 24) return hours + " Hours Ago";
    if (days < 7) return days + " Days Ago";
    if (days < 30) return Math.floor(days / 7) + " Weeks Ago";
    if (days < 365) return Math.floor(days / 30) + " Months Ago";
    return Math.floor(days / 365) + " Years Ago";
}

function filterCategory(cat) {
    document.querySelectorAll('.cat-btn').forEach(b => b.classList.remove('active'));
    event.target.classList.add('active');
    if (cat === 'All') { filteredMovies = [...allMovies]; } else { filteredMovies = allMovies.filter(m => (m.genre && m.genre.toLowerCase().includes(cat.toLowerCase())) || (m.desc && m.desc.toLowerCase().includes(cat.toLowerCase()))); }
    currentPage = 1; displayMovies();
}

function searchMovie() { 
    const t = document.getElementById('movieSearch').value.toLowerCase(); 
    filteredMovies = allMovies.filter(m => m.title.toLowerCase().includes(t)); 
    currentPage = 1; 
    displayMovies(); 
}

function changePage(s) { 
    currentPage += s; 
    displayMovies(); 
    window.scrollTo(0,0); 
}
