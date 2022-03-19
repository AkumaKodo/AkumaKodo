export class FileSystemModule {
    private savedPaths: string[];
    private uniqueFilePathCounter: number

    public constructor() {
        this.savedPaths = [];
        this.uniqueFilePathCounter = 0;
    }
    /**
     * Imports all the files in the given directory and saves them to an array of strings to load later
     * @param path 
     */
    public async import(path: string) {
        path = path.replaceAll("\\", "/");

        const files = Deno.readDirSync(Deno.realPathSync(path));

        for (const file of files) {

            if (!file.name) continue;

            const currentPath = `${path}/${file.name}`;

            if (file.isFile) {
                // if the file is not typescript, ignore it
                if (!currentPath.endsWith(".ts")) continue;
                this.savedPaths.push(
                    `import "${Deno.mainModule.substring(0, Deno.mainModule.lastIndexOf("/"))}/${currentPath.substring(
                        currentPath.indexOf(`src/`),
                    )
                    }#${this.uniqueFilePathCounter}";`,
                );
                continue;
            }

            // Recursive function!
            await this.import(currentPath);
        }

        this.uniqueFilePathCounter++;
    }

    /**
     * Loads all the saved paths from the file cache then imports them.
     */
    public async load() {
        await Deno.writeTextFile("fileloader.ts", this.savedPaths.join("\n").replaceAll("\\", "/"));
        await import(
            `${Deno.mainModule.substring(0, Deno.mainModule.lastIndexOf("/"))}/fileloader.ts#${this.uniqueFilePathCounter}`
        );
        this.savedPaths = [];
    }

    /**
     * Util for loading all the files in a directory recursively.
     * Example: Commands, Events, etc
     * @param paths 
     * @param between 
     * @param before 
     */
    public async fastLoader(
        /** An array of directories to import recursively. */
        paths: string[],
        /** A function that will run before recursively setting a part of `paths`.
         * `path` contains the path that will be imported, useful for logging
         */
        between?: (path: string, uniqueFilePathCounter: number, paths: string[]) => void,
        /** A function that runs before **actually** importing all the files. */
        before?: (uniqueFilePathCounter: number, paths: string[]) => void,
    ) {
        await Promise.all(
            [...paths].map((path) => {
                if (between) between(path, this.uniqueFilePathCounter, paths);
                this.import(path);
            }),
        );

        if (before) before(this.uniqueFilePathCounter, paths);

        await this.load();
    }
}