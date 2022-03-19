import { AkumaKodoContainerInterface } from "../core/interfaces/Client.ts";

export class FileSystemModule {
    private container: AkumaKodoContainerInterface;
    private savedPaths: string[];
    private uniqueFilePathCounter: number;
    private _errors: number

    public constructor(config: AkumaKodoContainerInterface) {
        this.savedPaths = [];
        this.uniqueFilePathCounter = 0;
        this.container = config;
        this._errors = 0;
    }
    /**
     * Imports all the files in the given directory and saves them to an array of strings to load later
     * @param path
     */
    public async import(path: string) {
        try {
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

            if (this._errors < 1) this.container.logger.create("info", "FS import", `Saved ${this.uniqueFilePathCounter} ${this.uniqueFilePathCounter > 1 ? "files" : "file"}!`);
        } catch (e) {
            this._errors++;
            this.container.logger.create("error", "FS import", `Failed to import path: ${path}`);
        }
    }

    /**
     * Loads all the saved paths from the paths array then imports them.
     */
    public async load() {
        try {
            await Deno.writeTextFile("fileloader.ts", this.savedPaths.join("\n").replaceAll("\\", "/"));
            await import(
                `${Deno.mainModule.substring(0, Deno.mainModule.lastIndexOf("/"))}/fileloader.ts#${this.uniqueFilePathCounter}`
            );
            this.savedPaths = [];

            if (this._errors < 1) this.container.logger.create("info", "FS load", "Loaded all files!");
        } catch (e) {
            this._errors++
            this.container.logger.create("error", "FS load", `Failed to load fileloader.ts\n ${e}`);
        }
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
        try {
            await Promise.all(
                [...paths].map((path) => {
                    if (between) between(path, this.uniqueFilePathCounter, paths);
                    this.import(path);
                }),
            );

            if (before) before(this.uniqueFilePathCounter, paths);

            await this.load();

            if (this._errors < 1) this.container.logger.create("info", "FS fastLoader", "Loaded all files!");
        } catch (e) {
            this._errors++
            this.container.logger.create("error", "FS fastLoader", `Failed to load files! ${e}`);
        }
    }
}
