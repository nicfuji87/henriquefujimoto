const token = "EAAU3IEhLIIUBQswxRjTlA4DRIC8inR5IZCsHbEzOyh2vG310NI7L6wVSa31XAFCNN36bev4YCbQ6ri9qdZArPlZC9Jl8v9qsJjAJcaRB1pJHw8CHoDUu1jExbqEBvZCR";
const url = `https://graph.facebook.com/v19.0/me?fields=id,name&access_token=${token}`;

fetch(url)
    .then(res => res.json())
    .then(data => console.log(JSON.stringify(data)))
    .catch(err => console.error(err));
