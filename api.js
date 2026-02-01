// FETCH DATA & FAVORITES LOGIC
let favorites = JSON.parse(localStorage.getItem('myFavMovies')) || [];

db.ref('movies').on('value', (snap) => {
    const data = snap.val();
    allMovies = [];
    if(data) { for (let id in data) { allMovies.push({ id: id, ...data[id] }); } }
    allMovies.sort((a, b) => new Date(b.uploadTime) - new Date(a.uploadTime));
    
    // Hero Slider Init (যদি আপনি আগে যোগ করে থাকেন)
    if(typeof initHeroSlider === "function") initHeroSlider();
    
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
        
        // Favorite Check
        const isFav = favorites.includes(m.id);
        const heartClass = isFav ? 'active' : '';

        return `<div class="movie-box"> 
            <div class="movie-card show">
                <div class="image-container">
                    <img src="${m.img}" class="movie-img" onclick="showDetails('${m.id}')" onerror="this.src='https://via.placeholder.com/300x450?text=No+Image'">
                    ${trending}
                    
                    <button class="fav-btn ${heartClass}" onclick="toggleFav(event, '${m.id}')">
                        <i class="fa-${isFav ? 'solid' : 'regular'} fa-heart"></i>
                    </button>

                    <div class="res-badge">${m.res || 'HD'}</div>
                </div>
                <div class="upload-info" onclick="showDetails('${m.id}')">
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

// TOGGLE FAVORITE FUNCTION
function toggleFav(e, id) {
    e.stopPropagation(); // যাতে ডিটেইলস পেজ ওপেন না হয়
    
    if (favorites.includes(id)) {
        favorites = favorites.filter(favId => favId !== id);
        showToast("Removed from My List 💔", "red");
    } else {
        favorites.push(id);
        showToast("Added to My List ❤️", "#ffd700");
    }
    
    localStorage.setItem('myFavMovies', JSON.stringify(favorites));
    
    // যদি ইউজার বর্তমানে 'My List' ট্যাবে থাকে, তবে লিস্ট রিফ্রেশ করবে
    const activeBtn = document.querySelector('.cat-btn.active');
    if (activeBtn && activeBtn.innerText.includes('My List')) {
        filterCategory('MyList');
    } else {
        displayMovies(); // শুধু বাটন আপডেট করবে
    }
}

function filterCategory(cat) {
    document.querySelectorAll('.cat-btn').forEach(b => b.classList.remove('active'));
    // Find the button that was clicked and active it
    const buttons = document.querySelectorAll('.cat-btn');
    for (let btn of buttons) {
        if(btn.innerText.includes(cat) || (cat === 'MyList' && btn.innerText.includes('My List'))) {
            btn.classList.add('active');
            break;
        }
    }

    if (cat === 'All') { 
        filteredMovies = [...allMovies]; 
    } 
    else if (cat === 'MyList') {
        filteredMovies = allMovies.filter(m => favorites.includes(m.id));
        if(filteredMovies.length === 0) showToast("Your List is Empty!", "red");
    }
    else { 
        filteredMovies = allMovies.filter(m => (m.genre && m.genre.toLowerCase().includes(cat.toLowerCase())) || (m.desc && m.desc.toLowerCase().includes(cat.toLowerCase()))); 
    }
    
    currentPage = 1; 
    displayMovies();
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

// HERO SLIDER LOGIC (SAME AS BEFORE)
let slideIndex = 0;
let slideInterval;

function initHeroSlider() {
    const slides = allMovies.slice(0, 5); 
    const container = document.getElementById('heroSlider');
    const dotsContainer = document.getElementById('heroDots');
    const wrapper = document.getElementById('heroSliderContainer');

    if(!container || slides.length === 0) return;

    wrapper.style.display = 'block';

    container.innerHTML = slides.map((m, i) => `
        <div class="hero-slide ${i === 0 ? 'active' : ''}" style="background-image: url('${m.backdrop || m.img}');">
            <div class="hero-overlay"></div>
            <div class="hero-content">
                <div class="hero-badge-top">🔥 TRENDING #${i+1}</div>
                <h2 class="hero-title">${m.title}</h2>
                <div class="hero-meta">
                    <span style="color:var(--gold)">${m.res || 'HD'}</span> • 
                    <span>${m.lang || 'Dual Audio'}</span> • 
                    <span>${m.genre ? m.genre.split(',')[0] : 'Action'}</span>
                </div>
                <button onclick="showDetails('${m.id}')" class="hero-btn">
                    <i class="fa-solid fa-play"></i> WATCH NOW
                </button>
            </div>
        </div>
    `).join('');

    dotsContainer.innerHTML = slides.map((_, i) => `<div class="dot ${i === 0 ? 'active' : ''}"></div>`).join('');

    if(slideInterval) clearInterval(slideInterval);
    slideInterval = setInterval(() => {
        const items = document.querySelectorAll('.hero-slide');
        const dots = document.querySelectorAll('.dot');
        if(items.length > 0) {
            items[slideIndex].classList.remove('active');
            dots[slideIndex].classList.remove('active');
            slideIndex = (slideIndex + 1) % items.length;
            items[slideIndex].classList.add('active');
            dots[slideIndex].classList.add('active');
        }
    }, 4000);
}
