export interface AkumaKodoTask {
    /** The name of the monitor */
    name: string;
    /** The amount of milliseconds to wait before running this again. */
    interval: number;
    /** The main code that will be run when this monitor is triggered. */
    execute: () => unknown | Promise<unknown>;
}

export interface _runningTaskInterface {
    intervals: number[];
    initialTimeouts: number[];
}
