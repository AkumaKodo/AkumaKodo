(() => {
  const loopCount = [];
  let x, y, z;

  while (true) {
    x = 0;
    y = 1;
    do {
      console.log(`${x}`);

      z = x + y;
      x = y;
      y = z;
    } while (x < 255);

    loopCount.push(x);

    if (loopCount.length > 10_000) {
      console.log(`Loop count: ${loopCount.length}. Ending...`);
      break;
    }
  }
})();
