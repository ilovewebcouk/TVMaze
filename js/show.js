const params = new URLSearchParams(window.location.search);
const showId = params.get("id");

if (!showId) {
    document.body.innerHTML = "<p class='text-danger text-center mt-5'>No show ID provided.</p>";
    throw new Error("Missing show ID");
}

const showUrl = `https://api.tvmaze.com/shows/${showId}?embed[]=cast&embed[]=crew&embed[]=episodes`;

fetch(showUrl)
    .then(res => res.json())
    .then(data => {
        renderHero(data);
        renderOverview(data);
        renderEpisodes(data._embedded.episodes);
        renderCast(data._embedded.cast);
        renderCrew(data._embedded.crew);
    })
    .catch(err => {
        console.error("Error loading show:", err);
        document.body.innerHTML = "<p class='text-danger text-center mt-5'>Failed to load show data.</p>";
    });

function renderHero(show) {
    const genres = show.genres.map(g => `<span class="badge bg-secondary me-1">${g}</span>`).join(" ");
    const rating = show.rating?.average ? `${show.rating.average} / 10` : "Not rated";
    const image = show.image?.original || show.image?.medium || "https://via.placeholder.com/1200x600?text=No+Image";

    document.getElementById("show-hero").innerHTML = `
    <div class="container d-lg-flex align-items-center gap-4">
      <img src="${image}" alt="${show.name}" class="img-fluid rounded" style="max-width: 300px;" />
      <div>
        <h1 class="display-5 fw-bold text-accent">${show.name}</h1>
        <p class="mb-2">${genres}</p>
        <p class="mb-1"><strong>Premiered:</strong> ${show.premiered || "TBA"}</p>
        <p class="mb-1"><strong>Rating:</strong> ${rating}</p>
        <a href="${show.officialSite || show.url}" target="_blank" class="btn btn-accent mt-2">Official Site</a>
      </div>
    </div>
  `;
}

function renderOverview(show) {
    const summary = show.summary || "No summary available.";
    document.getElementById("overview").innerHTML = `
    <div class="lead">${summary}</div>
  `;
}

function renderEpisodes(episodes) {
    if (!episodes.length) {
        document.getElementById("episodes").innerHTML = "<p>No episodes found.</p>";
        return;
    }

    const grouped = {};
    episodes.forEach(ep => {
        if (!grouped[ep.season]) grouped[ep.season] = [];
        grouped[ep.season].push(ep);
    });

    let html = "";
    Object.entries(grouped).forEach(([season, eps]) => {
        html += `<h5 class="text-accent mt-4">Season ${season}</h5><ul class="list-group">`;
        eps.forEach(ep => {
            html += `
        <li class="list-group-item bg-dark text-white border-secondary">
          <strong>S${String(ep.season).padStart(2, "0")}E${String(ep.number).padStart(2, "0")}:</strong>
          ${ep.name} <span class="text-muted">(${ep.airdate || "TBA"})</span>
        </li>
      `;
        });
        html += `</ul>`;
    });

    document.getElementById("episodes").innerHTML = html;
}

function renderCast(cast) {
    if (!cast.length) {
        document.getElementById("cast").innerHTML = "<p>No cast info available.</p>";
        return;
    }

    const html = `<div class="row g-3">` + cast.map(person => {
        const actor = person.person;
        const character = person.character;
        const img = actor.image?.medium || "./assets/placeholder.webp";

        return `
      <div class="col-md-3 text-center">
        <img src="${img}" onerror="this.src='./assets/placeholder.webp'" class="rounded shadow-sm mb-2" alt="${actor.name}" style="width: 100px; height: 140px; object-fit: cover;">
        <div><strong>${actor.name}</strong></div>
        <div class="text-white-50 small">as ${character.name}</div>
      </div>
    `;
    }).join("") + `</div>`;

    document.getElementById("cast").innerHTML = html;
}

function renderCrew(crew) {
    if (!crew.length) {
        document.getElementById("crew").innerHTML = "<p>No crew info available.</p>";
        return;
    }

    const html = `<div class="row g-3">` + crew.map(member => {
        const person = member.person;
        const img = person.image?.medium || "./assets/placeholder.webp";

        return `
      <div class="col-md-3 text-center">
        <img src="${img}" onerror="this.src='./assets/placeholder.webp'" class="rounded shadow-sm mb-2" alt="${person.name}" style="width: 100px; height: 140px; object-fit: cover;">
        <div><strong>${person.name}</strong></div>
        <div class="text-white-50 small">${member.type}</div>
      </div>
    `;
    }).join("") + `</div>`;

    document.getElementById("crew").innerHTML = html;
}