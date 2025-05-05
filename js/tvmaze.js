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
        .then(data => {
            const resultsContainer = document.getElementById("results");
            resultsContainer.innerHTML = "";

            if (data.length === 0) {
                resultsContainer.innerHTML = "<p>No results found</p>";
                return;
            }

            // Loop through the data and create results cards

            data.forEach(item => {
                const show = item.show;
                const showCard = `
              <div class="col-md-4 mb-4">
                <div class="card">
                  <img src="${show.image ? show.image.medium : 'https://via.placeholder.com/210x295'}" class="card-img-top" alt="${show.name}">
                  <div class="card-body">
                    <h5 class="card-title">${show.name}</h5>
                    <p class="card-text">${show.summary ? show.summary.replace(/<[^>]*>/g, '') : 'No summary available.'}</p>
                    <a href="${show.officialSite || '#'}" target="_blank" class="btn btn-primary">Learn More</a>
                  </div>
                </div>
              </div>
            `;
                resultsContainer.innerHTML += showCard;
            });
        })
        .catch(error => console.error("Error fetching data:", error));
});

    
