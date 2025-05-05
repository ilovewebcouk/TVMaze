// Make the API request
const query = "batman"; //added this for testing
fetch(`https://api.tvmaze.com/search/shows?q=${query}`)
    .then(response => response.json())
    .then(data => console.log(data));