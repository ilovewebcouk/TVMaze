//Listening for searchButton click and update const searchQuery
document.getElementById("searchButton").addEventListener("click", function() {
    const query = document.getElementById("searchQuery").value;

    if (query.trim() === "") {
        alert("Please enter a search term");
        return;
    }

// Make the API request
    fetch(`https://api.tvmaze.com/search/shows?q=${query}`)
        .then(response => response.json())
        .then((data) => {
            const resultsContainer = document.getElementById("results");
            resultsContainer.innerHTML = ""; // clear previous results
            
            data.forEach((item) => {
                const show = item.show;
                const showCard = `
                    <div class="col-md-3 mb-3">
                        <div class="card">
                        <img src = "${show.image.medium}" class="card-img-top" alt="${show.name}">
                            <div class="card-body">
                                <h5 class="card-title">${show.name}</h5>
                                <p class="card-text">${show.rating?.average !== null ? show.rating.average : 'No rating available.'}</p>
</p>
                                <a href="${show.officialSite || '#'}" target="_blank" class="btn btn-primary">Learn More</a>
                            </div>

                        </div>
                    </div>
                `;
                resultsContainer.innerHTML += showCard;
            })  
        })
});

//Popular shows airing tonight
const today = new Date().toISOString().split('T')[0];
const scheduleUrl = `https://api.tvmaze.com/schedule?country=GB&date=${today}`;
let allSortedShows = [];
let visibleCount = 3;

async function fetchPopularShows() {
    const response = await fetch(scheduleUrl);
    const data = await response.json();

    const showEpisodeMap = new Map();

    for (const episode of data) {
        const show = episode.show;
        if (!showEpisodeMap.has(show.id)) {
            show._episode = episode; // Attach the episode to the show
            showEpisodeMap.set(show.id, show);
        }
    }

    const shows = Array.from(showEpisodeMap.values());
    allSortedShows = shows.sort((a, b) => b.weight - a.weight);

    renderShows();
}

function renderShows() {
    const showList = document.getElementById('shows-list');
    const limitedShows = allSortedShows.slice(0, visibleCount);

    showList.innerHTML = limitedShows.map(show => {
        const episode = show._episode;
        const rating = show.rating?.average ? `${show.rating.average} / 10` : "Not rated";

        let episodeInfo = "Airing tonight";
        if (episode) {
            const season = episode.season.toString().padStart(2, '0');
            const number = episode.number.toString().padStart(2, '0');
            episodeInfo = `S${season} · E${number} — ${episode.name}`;
        }

        return `
      <div class="col-md-4">
        <div class="card h-100">
          <img src="${show.image ? show.image.medium : 'https://via.placeholder.com/210x295?text=No+Image'}" class="card-img-top" alt="${show.name}">
          <div class="card-body">
            <h5 class="card-title">${show.name}</h5>
            <p class="card-text">
              <strong>${episodeInfo}</strong><br>
              Rating: ${rating}
            </p>
            <a href="${show.officialSite || show.url}" target="_blank" class="btn btn-primary">View Show</a>
          </div>
        </div>
      </div>
    `;
    }).join('');

    const moreBtn = document.getElementById('more-shows-btn');
    moreBtn.style.display = visibleCount >= allSortedShows.length ? 'none' : 'block';
}

document.addEventListener("DOMContentLoaded", () => {
    document.getElementById('more-shows-btn').addEventListener('click', () => {
        visibleCount += 3;
        renderShows();
    });

    fetchPopularShows().catch(err => {
        console.error("Error fetching shows:", err);
        document.getElementById('shows-list').innerHTML = `<p class="text-danger">Unable to load shows at this time.</p>`;
    });
});