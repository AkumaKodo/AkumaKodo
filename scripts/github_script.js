const ghpages = require("gh-pages");

ghpages.publish("./docs/book/html", {
    branch: "documentation",
    repo: "https://github.com/AkumaKodo/AkumaKodo.git",
    message: "Documentation updated."
// @ts-ignore - ignore the error
}, function (err) {
    if (err) {
        console.log(err);
    } else {
        console.log("Documentation published to github!");
    }
});
