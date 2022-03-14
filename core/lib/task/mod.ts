import { AkumaKodoTask } from "../../interfaces/Task.ts";
import { AkumaKodoLogger } from "../../../internal/logger.ts";
import { AkumaKodoCollection } from "../utils/Collection.ts";
import {AkumaKodoBotCore} from "../AkumaKodo.ts";

export class AkumaKodoTaskModule extends AkumaKodoBotCore {

    protected initializeTask() {
        for (const task of this.container.taskCollection.values()) {
            this.container.runningTasks.initialTimeouts.push(
                setTimeout(async () => {
                    try {
                        await task.execute();
                        AkumaKodoLogger("info", "initializeTask", `Task ${task.name} executed`);
                    } catch (error) {
                        AkumaKodoLogger("error", "initializeTask", `Task ${task.name} failed to execute.\n ${error}`);
                    }

                    this.container.runningTasks.initialTimeouts.push(
                        setInterval(async () => {
                            if (!this.container.fullyReady) return;
                            try {
                                await task.execute();
                                AkumaKodoLogger("info", "initializeTask", `Task ${task.name} executed`);
                            } catch (error) {
                                AkumaKodoLogger("error", "initializeTask", `Task ${task.name} failed to execute.\n ${error}`);
                            }
                        }, task.interval),
                    );
                }, task.interval - (Date.now() % task.interval) ?? undefined),
            );
        }
    }

    /**
     * Creates a new task for the bot.
     * @param name The name of the task.
     * @param task The task to be executed.
     * @param callback The callback to be executed when the task is executed.
     * @protected
     */
    protected createAkumaKodoTask(name: string, task: AkumaKodoTask, callback?: () => any) {
        this.container.taskCollection.set(task.name, task);
        if (callback) {
            callback();
        }
    }

    /**
     * Deletes all active tasks.
     * @param callback The callback to be executed when the tasks are deleted.
     * @protected
     */
    protected destroyTask(callback?: () => any) {
        for (const task of this.container.runningTasks.initialTimeouts) {
            clearTimeout(task);
        }
        for (const task of this.container.runningTasks.intervals) clearInterval(task);

        this.container.taskCollection = new AkumaKodoCollection<string, AkumaKodoTask>();
        this.container.runningTasks = {initialTimeouts: [], intervals: []};

        if (callback) {
            callback();
        }
    }
}