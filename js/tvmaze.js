const today = new Date().toISOString().split('T')[0];
const scheduleUrl = `https://api.tvmaze.com/schedule?country=GB&date=${today}`;
let allSortedShows = [];

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
        renderScheduleTable(data);
    } catch (error) {
        console.error("Fetch error:", error);
        document.getElementById('shows-list').innerHTML = `<p class="text-danger">Could not load shows.</p>`;
    }
}

function renderShows() {
    const showList = document.getElementById('shows-list');
    const upNextList = document.getElementById('up-next-list');

    const showsToDisplay = allSortedShows;

    // Slider: Top 5 Shows
    showList.innerHTML = showsToDisplay.slice(0, 5).map(show => {
        const ep = show._episode;
        const img = show.image?.original || show.image?.medium || 'https://via.placeholder.com/1200x600?text=No+Image';
        const rating = show.rating?.average ? `${show.rating.average} / 10` : "Not rated";
        const channel = show.network?.name || show.webChannel?.name || "N/A";
        const airtime = ep.airtime || "TBA";

        return `
      <div class="swiper-slide hero-slide" style="background-image: url('${img}');">
        <div class="hero-overlay">
          <div class="container text-white">
            <h2 class="display-5 fw-bold">${show.name}</h2>
            <p class="lead mb-1"><strong>${airtime}</strong> · ${channel}</p>
            <p class="mb-3">Rating: ${rating}</p>
            <a href="show.html?id=${show.id}" class="btn btn-warning btn-lg">View Show</a>
          </div>
        </div>
      </div>
    `;
    }).join('');

    // Sidebar: Next 3 Shows
    upNextList.innerHTML = showsToDisplay.slice(5, 8).map(show => {
        const ep = show._episode;
        const img = show.image?.medium || 'https://via.placeholder.com/100x140?text=No+Image';
        const channel = show.network?.name || show.webChannel?.name || "N/A";
        const airtime = ep.airtime || "TBA";

        return `
      <div class="d-flex align-items-start gap-3">
        <img src="${img}" class="rounded" style="width: 90px; height: 130px; object-fit: cover;" alt="${show.name}">
        <div>
          <h6 class="mb-1">${show.name}</h6>
          <p class="mb-1 small text-white-50">${airtime} · ${channel}</p>
          <a href="show.html?id=${show.id}" class="btn btn-sm btn-outline-light">View</a>
        </div>
      </div>
    `;
    }).join('');

    // Init Swiper
    if (window.heroSwiper) {
        window.heroSwiper.destroy(true, true);
    }

    window.heroSwiper = new Swiper(".heroSwiper", {
        slidesPerView: 1,
        loop: true,
        autoplay: {
            delay: 7000,
            disableOnInteraction: false
        },
        effect: "fade",
        speed: 700,
        navigation: false // hide arrows
    });
}

function renderScheduleTable(data) {
    const allowedChannels = ["BBC One", "BBC Two", "ITV", "ITV1", "Channel 4", "Channel5", "Channel 5", "5"];

    const filtered = data.filter(ep => {
        const channel = ep.show.network?.name || ep.show.webChannel?.name || "";
        const hour = parseInt(ep.airtime?.split(':')[0], 10);
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
    fetchPopularShows();
});