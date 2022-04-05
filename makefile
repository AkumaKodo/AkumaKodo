test:
	@echo "Running deno test script from ./test/__mock__.ts"
	deno run -A ./test/__mock__.ts
	@echo "Finished running test script"
lib:
	@echo "building deno lib..."
	deno run -A ./mod.ts --no-check=remote
	@echo "finished building deno lib. No errors found in source."
clg:
	@echo "generating change log text:"
	deno run -A ./scripts/clg.js
	@echo "done!"
