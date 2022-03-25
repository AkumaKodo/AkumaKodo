/**
 * Pauses the execution of the current thread for the specified number of milliseconds.
 * @param ms The number of milliseconds to wait.
 */
export function delay(ms: number): Promise<void> {
    return new Promise((res): number =>
        setTimeout((): void => {
            res();
        }, ms)
    );
}
