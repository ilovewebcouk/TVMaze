const params = new URLSearchParams(window.location.search);
const showId = params.get("id");

if (!showId) {
    document.body.innerHTML = "<p class='text-danger text-center mt-5'>No show ID provided.</p>";
} else {
    // Fetch all show info
    fetchShowDetails();
    fetchCast();
    fetchCrew();
}

function fetchShowDetails() {
    fetch(`https://api.tvmaze.com/shows/${showId}`)
        .then(res => res.json())
        .then(show => {
            document.getElementById("show-title").textContent = show.name;

            const image = show.image?.original || "https://via.placeholder.com/400x600?text=No+Image";
            const summary = show.summary || "No summary available.";
            const site = show.officialSite || show.url;

            document.getElementById("main-content").innerHTML = `
        <div class="col-md-4">
          <img src="${image}" class="img-fluid rounded shadow" alt="${show.name}">
        </div>
        <div class="col-md-8">
          <p>${summary}</p>
          <a href="${site}" target="_blank" class="btn btn-primary mt-3">Visit Official Site</a>
          <p class="mt-4"><strong>Genres:</strong> ${show.genres.join(", ")}</p>
          <p><strong>Status:</strong> ${show.status}</p>
          <p><strong>Language:</strong> ${show.language}</p>
          <p><strong>Premiered:</strong> ${show.premiered}</p>
        </div>
      `;
        });
}

function fetchCast() {
    fetch(`https://api.tvmaze.com/shows/${showId}/cast`)
        .then(res => res.json())
        .then(data => {
            const castContainer = document.getElementById("cast-content");
            if (!data.length) {
                castContainer.innerHTML = "<p>No cast information available.</p>";
                return;
            }

            castContainer.innerHTML = data.map(cast => {
                const img = cast.person.image?.medium || 'https://via.placeholder.com/210x295?text=No+Image';
                return `
          <div class="col-md-3 text-center mb-4">
            <img src="${img}" class="img-fluid rounded shadow-sm mb-2" alt="${cast.person.name}">
            <h6>${cast.person.name}</h6>
            <p class="text-muted">as ${cast.character.name}</p>
          </div>
        `;
            }).join('');
        });
}

function fetchCrew() {
    fetch(`https://api.tvmaze.com/shows/${showId}/crew`)
        .then(res => res.json())
        .then(data => {
            const crewContainer = document.getElementById("crew-content");
            if (!data.length) {
                crewContainer.innerHTML = "<p>No crew information available.</p>";
                return;
            }

            crewContainer.innerHTML = data.map(entry => {
                const img = entry.person.image?.medium || 'https://via.placeholder.com/210x295?text=No+Image';
                return `
          <div class="col-md-3 text-center mb-4">
            <img src="${img}" class="img-fluid rounded shadow-sm mb-2" alt="${entry.person.name}">
            <h6>${entry.person.name}</h6>
            <p class="text-muted">${entry.type}</p>
          </div>
        `;
            }).join('');
        });
}