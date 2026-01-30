// DETAILS (UPDATED)
// DETAILS (PROFESSIONAL DESIGN UPDATE)
function showDetails(id) {
    db.ref('movieClicks/' + id).transaction(c => (c || 0) + 1);
    const m = allMovies.find(mov => mov.id === id);
    if(!m) return;
    currentPlayingMovieTitle = m.title;
    document.getElementById('mainPage').style.display = 'none';
    document.getElementById('detailsPage').style.display = 'block';
    window.scrollTo(0,0);
    
    let contentHtml = '';
    if(m.note) contentHtml += `<div class="note-box"><i class="fa-solid fa-bell"></i> ${m.note}</div>`;

    // --- CONTENT GENERATION ---
    if (m.content) {
        // SERIES DESIGN
        if (m.type === 'series') {
            let sNum = (m.seasonNum || 1).toString().padStart(2, '0');
            contentHtml += `<h3 style="color:#fff; font-size:14px; margin-bottom:15px; border-left:3px solid var(--primary); padding-left:10px;">EPISODES (SEASON ${sNum})</h3>`;
            
            m.content.forEach(ep => {
                let safeS1 = encodeURIComponent(ep.server1 || '');
                let safeS2 = encodeURIComponent(ep.server2 || '');
                let safeWatch = encodeURIComponent(ep.watch || '');
                let safePoster = encodeURIComponent(m.img || '');
                let lang = m.lang || 'Dual Audio'; // Fallback if undefined

                contentHtml += `
                <div class="premium-card">
                    <div class="card-top">
                        <div class="card-title-group">
                            <div class="card-title">Episode ${ep.epNum}</div>
                            <div class="card-meta">
                                <span class="meta-badge badge-res">${m.res || 'HD'}</span>
                                <span class="meta-badge badge-lang">${lang}</span>
                                ${ep.isNew ? '<span class="meta-badge badge-res" style="background:var(--primary);color:#fff;border:none;">NEW</span>' : ''}
                            </div>
                        </div>
                    </div>
                    <div class="action-row">
                        <button onclick="preparePlayer('${safeS1}','${safeS2}','${safeWatch}','${safePoster}')" class="btn-premium-play">
                            <i class="fa-solid fa-play"></i> PLAY NOW
                        </button>
                        <button onclick="showDownloadPopup('${ep.dl}')" class="btn-premium-dl">
                            <i class="fa-solid fa-download"></i>
                        </button>
                    </div>
                </div>`;
            });
        } 
        // MOVIE DESIGN (The part you marked)
        else {
            contentHtml += `<h3 style="color:#fff; font-size:14px; margin-bottom:15px; border-left:3px solid var(--primary); padding-left:10px;">WATCH MOVIE</h3>`;
            
            m.content.forEach(q => {
                let safeS1 = encodeURIComponent(q.server1 || '');
                let safeS2 = encodeURIComponent(q.server2 || '');
                let safeWatch = encodeURIComponent(q.watch || '');
                let safePoster = encodeURIComponent(m.img || '');
                
                // Fix for UNDEFINED
                let langText = (m.lang && m.lang !== 'undefined') ? m.lang : 'Dual Audio';
                let sizeText = (q.size && q.size !== 'undefined') ? q.size : '';

                contentHtml += `
                <div class="premium-card">
                    <div class="card-top">
                        <div class="card-title-group">
                            <div class="card-title">${m.title}</div>
                            <div class="card-meta">
                                <span class="meta-badge badge-res">${q.qual || 'HD'}</span>
                                <span class="meta-badge badge-lang">${langText}</span>
                                ${sizeText ? `<span class="meta-badge badge-size">${sizeText}</span>` : ''}
                            </div>
                        </div>
                    </div>
                    <div class="action-row">
                        <button onclick="preparePlayer('${safeS1}','${safeS2}','${safeWatch}','${safePoster}')" class="btn-premium-play">
                            <i class="fa-solid fa-play"></i> WATCH NOW
                        </button>
                        <button onclick="showDownloadPopup('${q.dl}')" class="btn-premium-dl">
                            <i class="fa-solid fa-download"></i> Download
                        </button>
                    </div>
                </div>`;
            });
        }
    } 
    // OLD DATA SUPPORT (Fallback)
    else if (m.link || m.dl || m.downloadLink) {
        let link = m.link || m.dl || m.downloadLink;
        let watch = m.watchLink || link;
        contentHtml += `
        <div class="premium-card">
            <div class="card-top">
                <div class="card-title-group">
                    <div class="card-title">${m.title}</div>
                    <div class="card-meta">
                        <span class="meta-badge badge-res">${m.res || 'HD'}</span>
                        <span class="meta-badge badge-lang">Legacy</span>
                    </div>
                </div>
            </div>
            <div class="action-row">
                <button onclick="openPlayer('${watch}','', '', '${m.img}')" class="btn-premium-play"><i class="fa-solid fa-play"></i> WATCH</button>
                <button onclick="showDownloadPopup('${link}')" class="btn-premium-dl"><i class="fa-solid fa-download"></i></button>
            </div>
        </div>`;
    }

    let relatedMovies = allMovies.filter(mov => mov.id !== id && (mov.genre === m.genre || mov.lang === m.lang)).slice(0, 5);
    let relatedHtml = relatedMovies.map(rm => `<div class="related-card" onclick="showDetails('${rm.id}')"><img src="${rm.img}" class="related-img" onerror="this.src='https://via.placeholder.com/150x225?text=No+Image'"><div class="related-info">${rm.title.substring(0,20)}...</div></div>`).join('');

    let subHeaderInfo = (m.type === 'series') ? `Season ${m.seasonNum || 1}` : m.genre;
    let trailerBtn = m.trailer ? `<a href="${m.trailer}" target="_blank" style="display:inline-block; margin-top:10px; background:#e50914; color:white; padding:8px 15px; border-radius:50px; text-decoration:none; font-size:12px; font-weight:bold; box-shadow:0 4px 10px rgba(229,9,20,0.4);"><i class="fa-brands fa-youtube"></i> Watch Trailer</a>` : '';
    let castHtml = m.cast ? `<div style="margin-top:15px; color:#ccc; font-size:13px; border-top:1px solid #333; padding-top:10px;"><strong>🎭 Cast:</strong> <span style="color:#888;">${m.cast}</span></div>` : '';

    document.getElementById('detailsContent').innerHTML = `
        <div class="hero-banner" style="background-image: url('${m.img}')"><div class="hero-overlay"></div></div>
        <div class="content-wrap">
            <div style="display:flex; gap:15px;">
                <img src="${m.img}" class="details-poster" onerror="this.src='https://via.placeholder.com/300x450?text=No+Image'">
                <div><h2 style="margin: 10px 0 5px 0;">${m.title}</h2><div style="color:#ccc; font-size:11px;"><span>${m.res || 'HD'}</span> • <span>${subHeaderInfo}</span> • <span>${m.rating || 'N/A'}★</span></div>${trailerBtn}</div>
            </div>
            ${castHtml}
            <div class="description">${m.desc}</div>
            ${contentHtml}
            <div class="related-section"><div class="related-title">YOU MAY ALSO LIKE</div><div class="related-grid">${relatedHtml}</div></div>
        </div>`;
}


function toggleS(id) { const el = document.getElementById(id); const arr = document.getElementById(`arrow-${id}`); if(el.style.display==="block"){el.style.display="none";if(arr)arr.classList.remove('rotate');}else{el.style.display="block";if(arr)arr.classList.add('rotate');}}
function closeDetails() { document.getElementById('mainPage').style.display = 'block'; document.getElementById('detailsPage').style.display = 'none'; closeRgbPlayer(); }

// --- PLAYER SYSTEM WITH VPN TIMER ---
let currentVideoUrl = "";
let currentPlayerMode = "sandbox"; 
let vpnTimerInterval = null; // টাইমার ভেরিয়েবল

function preparePlayer(s1, s2, watch, poster) {
    const url1 = decodeURIComponent(s1);
    const url2 = decodeURIComponent(s2);
    const url3 = decodeURIComponent(watch); 
    const img = decodeURIComponent(poster);

    let btnHtml = "";
    if(url1) btnHtml += `<button onclick="switchServer('${url1}', this)" class="server-btn">Server 1</button>`;
    if(url2) btnHtml += `<button onclick="switchServer('${url2}', this)" class="server-btn">Server 2</button>`;
    if(url3) btnHtml += `<button onclick="switchServer('${url3}', this)" class="server-btn">Watch</button>`;

    document.getElementById('dynamicServerBtns').innerHTML = btnHtml;
    
    let defaultUrl = url3 || url1 || url2;
    if(defaultUrl) {
        openPlayer(defaultUrl, img);
        setTimeout(() => {
            const btns = document.querySelectorAll('.server-btn');
            if(btns.length > 0) {
                if(url3) btns[btns.length-1].classList.add('active'); 
                else btns[0].classList.add('active');
            }
        }, 100);
    } else {
        showToast("No playable links found!", "red");
    }
}

function openPlayer(url, poster) {
    currentVideoUrl = url; 
    currentPlayingLink = url;
    
    const modal = document.getElementById('rgbPlayerModal');
    const cover = document.getElementById('fc-cover');
    const iframe = document.getElementById('fc-iframe');
    
    modal.style.display = 'flex';
    cover.style.display = 'flex'; 
    if(poster) cover.style.backgroundImage = `url('${poster}')`;
    iframe.src = "";
    
    setPlayerMode('sandbox'); // ডিফল্ট সিকিউর মোড

    // VPN TIMER START (প্রতি ৫ মিনিট পর পর)
    if(vpnTimerInterval) clearInterval(vpnTimerInterval);
    vpnTimerInterval = setInterval(() => {
        document.getElementById('vpnNotice').style.display = 'flex';
    }, 300000); // 300000ms = 5 মিনিট
}

function switchServer(url, btn) {
    document.querySelectorAll('.server-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    currentVideoUrl = url;
    currentPlayingLink = url;
    startVideo();
}

function setPlayerMode(mode) {
    currentPlayerMode = mode;
    document.getElementById('btnNormal').classList.remove('active');
    document.getElementById('btnSandbox').classList.remove('active');
    
    const iframe = document.getElementById('fc-iframe');
    const infoBox = document.getElementById('modeInfoText');

    if(mode === 'sandbox') {
        document.getElementById('btnSandbox').classList.add('active');
        // UPDATE: Added 'allow-orientation-lock' and 'allow-popups' for fullscreen fix
        iframe.setAttribute('sandbox', 'allow-forms allow-scripts allow-same-origin allow-presentation allow-orientation-lock allow-popups');
        if(infoBox) infoBox.style.borderLeft = "3px solid #ffd700";
    } else {
        document.getElementById('btnNormal').classList.add('active');
        iframe.removeAttribute('sandbox');
        if(infoBox) infoBox.style.borderLeft = "3px solid #00d2ff";
    }
    
    if(iframe.src) iframe.src = currentVideoUrl;
}

function startVideo() {
    const cover = document.getElementById('fc-cover');
    const iframe = document.getElementById('fc-iframe');
    cover.style.display = 'none';
    
    if(currentPlayerMode === 'sandbox') {
        // UPDATE: Added 'allow-orientation-lock' and 'allow-popups' here too
        iframe.setAttribute('sandbox', 'allow-forms allow-scripts allow-same-origin allow-presentation allow-orientation-lock allow-popups');
    } else {
        iframe.removeAttribute('sandbox');
    }
    iframe.src = currentVideoUrl;
}

function closeRgbPlayer() {
    document.getElementById('rgbPlayerModal').style.display = 'none';
    document.getElementById('fc-iframe').src = "";
    
    // টাইমার বন্ধ করা
    if(vpnTimerInterval) clearInterval(vpnTimerInterval);
}


// HELPERS & OTHER LOGIC
function checkStatus() { document.getElementById('offlineMessage').style.display = navigator.onLine ? 'none' : 'block'; }
window.addEventListener('offline', checkStatus); window.addEventListener('online', checkStatus); checkStatus();

let downloadTimer = null, downloadSeconds = 5, pendingDownloadUrl = "";
function showDownloadPopup(url) { pendingDownloadUrl = url; downloadSeconds = 5; document.getElementById('dlCounter').innerText = downloadSeconds; document.getElementById('downloadPopup').style.display = 'flex'; if(downloadTimer) clearInterval(downloadTimer); downloadTimer = setInterval(() => { downloadSeconds--; document.getElementById('dlCounter').innerText = downloadSeconds; if(downloadSeconds <= 0) { clearInterval(downloadTimer); document.getElementById('downloadPopup').style.display = 'none'; window.open(pendingDownloadUrl, '_blank'); } }, 1000); }
function closeDownloadPopup() { document.getElementById('downloadPopup').style.display = 'none'; clearInterval(downloadTimer); }

function reportBrokenLink() { if(!currentPlayingLink || !currentPlayingMovieTitle) return showToast("❌ প্লেয়ার চালু নেই!", "red"); db.ref('reports').push({ movie: currentPlayingMovieTitle, link: currentPlayingLink, status: 'broken', time: new Date().toLocaleString('bn-BD') }).then(() => showToast("✅ রিপোর্ট পাঠানো হয়েছে!", "#ffd700")).catch(e => showToast("❌ রিপোর্ট পাঠানো যায়নি।", "red")); }
function submitRequest() { const m = document.getElementById('reqMovieName').value, u = document.getElementById('reqUserName').value || "Anonymous"; if(!m) return showToast("❌ মুভির নাম দিন!", "red"); db.ref('requests').push({ movieName: m, userName: u, time: new Date().toLocaleString('bn-BD') }).then(() => { showToast("✅ রিকোয়েস্ট সফল হয়েছে!", "#ffd700"); document.getElementById('reqMovieName').value = ""; closeReqModal(); }); }
function showToast(text, color) { const toast = document.createElement("div"); toast.innerText = text; toast.style = `position:fixed;bottom:20px;left:50%;transform:translateX(-50%);background:${color};color:${color==='#ffd700'?'black':'white'};padding:12px 25px;border-radius:50px;font-weight:bold;box-shadow:0 5px 15px rgba(0,0,0,0.3);z-index:10000;animation:fadeIn 0.5s, fadeOut 0.5s 2.5s forwards;`; document.body.appendChild(toast); setTimeout(() => toast.remove(), 3000); }

function openReqModal() { document.getElementById('reqModal').style.display = 'flex'; }
function closeReqModal() { document.getElementById('reqModal').style.display = 'none'; }
function closeVpnNotice() { document.getElementById('vpnNotice').style.display = 'none'; }
function changePage(s) { currentPage += s; displayMovies(); window.scrollTo(0,0); }
function searchMovie() { const t = document.getElementById('movieSearch').value.toLowerCase(); filteredMovies = allMovies.filter(m => m.title.toLowerCase().includes(t)); currentPage = 1; displayMovies(); }

function randomizeTitle() {
    const gradients = ["linear-gradient(to right, #BF953F, #FCF6BA, #B38728, #FBF5B7, #AA771C)", "linear-gradient(to right, #1CB5E0, #000851)", "linear-gradient(to right, #ff9966, #ff5e62)", "linear-gradient(to right, #E0EAFC, #CFDEF3)"];
    const fontConfig = [{ text: "PREMIUM MOVIE STUDIO", font: "'Poppins', sans-serif" }, { text: "প্রিমিয়াম মুভি স্টুডিও", font: "'Hind Siliguri', sans-serif" }];
    const style = gradients[Math.floor(Math.random() * gradients.length)];
    const conf = fontConfig[Math.floor(Math.random() * fontConfig.length)];
    const title = document.getElementById("dynamicTitle");
    if(title) {
        title.innerText = conf.text;
        title.style.fontFamily = conf.font;
        title.style.background = style;
        title.style.webkitBackgroundClip = "text";
        title.style.backgroundClip = "text";
        title.style.webkitTextFillColor = "transparent";
    }
}

window.onload = () => { 
    randomizeTitle(); 
    if (!sessionStorage.getItem('popupShown')) { 
        document.getElementById('vpnNotice').style.display = 'flex'; 
        sessionStorage.setItem('popupShown', 'done'); 
    } 
};
