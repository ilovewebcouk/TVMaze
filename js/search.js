const params = new URLSearchParams(window.location.search);
const query = params.get("q");

if (!query) {
    document.getElementById("results").innerHTML = "<p class='text-danger'>No search query provided.</p>";
} else {
    fetch(`https://api.tvmaze.com/search/shows?q=${encodeURIComponent(query)}`)
        .then(res => res.json())
        .then(data => {
            const container = document.getElementById("results");
            container.innerHTML = "";

            if (data.length === 0) {
                container.innerHTML = "<p>No results found.</p>";
                return;
            }

            data.forEach(({ show }) => {
                container.innerHTML += `
          <div class="col-md-3 mb-4">
            <div class="card h-100 shadow-sm">
              <img src="${show.image?.medium || 'https://via.placeholder.com/210x295?text=No+Image'}" class="card-img-top" alt="${show.name}">
              <div class="card-body">
                <h5 class="card-title">${show.name}</h5>
                <p class="card-text">Rating: ${show.rating?.average || 'N/A'}</p>
                <a href="${show.officialSite || show.url}" class="btn btn-primary" target="_blank">More Info</a>
              </div>
            </div>
          </div>
        `;
            });
        })
        .catch(err => {
            document.getElementById("results").innerHTML = "<p class='text-danger'>Error loading search results.</p>";
        });
}