const today = new Date().toISOString().split('T')[0];
const scheduleUrl = `https://api.tvmaze.com/schedule?country=GB&date=${today}`;
let allSortedShows = [];
let visibleCount = 3;

async function fetchPopularShows() {
    try {
        const response = await fetch(scheduleUrl);
        const data = await response.json();

        const showEpisodeMap = new Map();
        data.forEach(episode => {
            const show = episode.show;
            if (!showEpisodeMap.has(show.id)) {
                show._episode = episode;
                showEpisodeMap.set(show.id, show);
            }
        });

        const shows = Array.from(showEpisodeMap.values());
        allSortedShows = shows.sort((a, b) => b.weight - a.weight);

        renderShows();
        renderScheduleTable(data); // 👈 Render full schedule table
    } catch (error) {
        console.error("Fetch error:", error);
        document.getElementById('shows-list').innerHTML = `<p class="text-danger">Could not load shows.</p>`;
    }
}

function renderShows() {
    const showList = document.getElementById('shows-list');
    const limitedShows = allSortedShows.slice(0, visibleCount);

    showList.innerHTML = limitedShows.map(show => {
        const episode = show._episode;
        const rating = show.rating?.average ? `${show.rating.average} / 10` : "Not rated";
        const epInfo = episode
            ? `S${String(episode.season).padStart(2, '0')} · E${String(episode.number).padStart(2, '0')} — ${episode.name}`
            : "Airing tonight";

        return `
      <div class="col-md-4">
        <div class="card h-100 shadow-sm">
          <img src="${show.image?.medium || 'https://via.placeholder.com/210x295?text=No+Image'}" class="card-img-top" alt="${show.name}">
          <div class="card-body">
            <h5 class="card-title">${show.name}</h5>
            <p class="card-text">
              <strong>${epInfo}</strong><br>
              Rating: ${rating}
            </p>
            <a href="show.html?id=${show.id}" class="btn btn-primary">View Show</a>          </div>
        </div>
      </div>
    `;
    }).join('');

    const moreBtn = document.getElementById('more-shows-btn');
    moreBtn.style.display = visibleCount >= allSortedShows.length ? 'none' : 'block';
}

function renderScheduleTable(data) {
    const allowedChannels = ["BBC One", "BBC Two", "ITV1", "Channel 4", "5"];

    const filtered = data.filter(ep => {
        const channel = ep.show.network?.name || ep.show.webChannel?.name || "";
        const hour = parseInt(ep.airtime?.split(':')[0], 10); // e.g., "21:00" -> 21
        return allowedChannels.some(name => channel.toLowerCase().includes(name.toLowerCase())) && hour >= 18;
    });

    const tableBody = document.getElementById('schedule-table-body');
    tableBody.innerHTML = filtered.map(ep => {
        const time = new Date(`${ep.airdate}T${ep.airtime}`).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit'
        });
        const channel = ep.show.network?.name || ep.show.webChannel?.name || "N/A";

        return `
      <tr>
        <td>${time}</td>
        <td>${channel}</td>
        <td>${ep.show.name}</td>
        <td>${ep.name}</td>
        <td>${ep.season}</td>
        <td>${ep.number}</td>
        <td>${ep.runtime} min</td>
      </tr>
    `;
    }).join('');

    if (filtered.length === 0) {
        tableBody.innerHTML = `<tr><td colspan="7" class="text-center">No evening shows found on selected channels.</td></tr>`;
    }
}

document.addEventListener("DOMContentLoaded", () => {
    document.getElementById('more-shows-btn').addEventListener('click', () => {
        visibleCount += 3;
        renderShows();
    });

    fetchPopularShows();
});