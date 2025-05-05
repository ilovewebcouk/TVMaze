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
        .then(data => console.log(data));
});