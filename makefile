test:
	deno run -A ./test/__mock__.ts
lib:
	deno run -A ./mod.ts --no-check=remote
clg:
	deno run -A ./scripts/clg.js