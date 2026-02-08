const fs = require('fs');
const shortToken = "EAAU3IEhLIIUBQpq1Rj2U9pYLezdZC9tAQHh53uwHWHtdBpZCAyW8pgvhUfQDcEmomShiI4UjBI6ZBbXaisq8YZBdgmfALISxJLCMmiGNNcrMRMF1FQGnxUYE8s1O1nHVZAMyhri4P7q6rZASHAKKRwSFuiLfRqzcRI1u9TXtgHWafwkA2QJn6TE9dOyVrRy4gpLAZCXRdGU6MPl9bucV8HhlZBeHUtcjYAZABx1ocICzsj4s9U58mupjEgA8RCkzo0HN9fkphHl8D82ZBCqMbUBHIGAh3kaQZDZD";
const appId = "1467986674917509";
const appSecret = "1476b969c415ec7e6ed3865a04eb95ea";
const url = `https://graph.facebook.com/v19.0/oauth/access_token?grant_type=fb_exchange_token&client_id=${appId}&client_secret=${appSecret}&fb_exchange_token=${shortToken}`;

fetch(url)
    .then(res => res.json())
    .then(data => {
        if (data.access_token) {
            fs.writeFileSync('token.txt', data.access_token);
            console.log("Token written to token.txt");
        } else {
            console.error("No token in response", data);
        }
    })
    .catch(err => console.error(err));
