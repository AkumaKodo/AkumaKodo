(function () {
  let x, y, z;

  while (1) {
    x = 0;
    y = 1;
    do {
      console.log(x);

      z = x + y;
      x = y;
      y = z;
    } while (x < 255);
  }
});
