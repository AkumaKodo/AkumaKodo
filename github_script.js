const ghpages = require('gh-pages');

ghpages.publish("./docs/book/html", {
  branch: "documentation",
  repo: "https://github.com/ThatGuyJamal/AkumaKodo.git",
}, function(err) {
  if (err) {
    console.log(err);
  } else {
    console.log("Documentation published to github!");
  }
});
