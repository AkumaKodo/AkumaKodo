// deno-lint-ignore-file
import { AkumaKodoContainerInterface } from "../../interfaces/Client.ts";
import { AkumaKodoTask } from "../../interfaces/Task.ts";
import { AkumaKodoCollection } from "../utils/Collection.ts";

export class AkumaKodoTaskModule {
  public container: AkumaKodoContainerInterface;
  public constructor(container: AkumaKodoContainerInterface) {
    this.container = container;
  }

  /**
   * Push the task to the task queue
   */
  public initializeTask() {
    for (const task of this.container.taskCollection.values()) {
      this.container.runningTasks.initialTimeouts.push(
        setTimeout(async () => {
          try {
            await task.execute();
            this.container.logger.debug("info", "initialize Task", `Task ${task.name} executed`);
          } catch (error) {
            this.container.logger.debug("error", "initialize Task", `Task ${task.name} failed to execute.\n ${error}`);
          }

          this.container.runningTasks.initialTimeouts.push(
            setInterval(async () => {
              if (!this.container.fullyReady) return;
              try {
                await task.execute();
                this.container.logger.debug("info", "initialize Task", `Task ${task.name} executed`);
              } catch (error) {
                this.container.logger.debug(
                  "error",
                  "initializeTask",
                  `Task ${task.name} failed to execute.\n ${error}`,
                );
              }
            }, task.interval),
          );
        }, task.interval - (Date.now() % task.interval) ?? undefined),
      );
    }
    this.container.logger.debug("info", "initialize Task", `Task module initialized`, "beta");
  }

  /**
   * Creates a new task for the bot.
   * @param task The task to be executed.
   * @param callback The callback to be executed when the task is executed.
   */
  public createAkumaKodoTask(task: AkumaKodoTask, callback?: () => any) {
    this.container.taskCollection.set(task.name, task);
    if (callback) {
      callback();
    }
    this.container.logger.debug("info", "create AkumaKodo Task", `Task ${task.name} created`);
  }

  /**
   * Deletes all active tasks.
   * @param callback The callback to be executed when the tasks are deleted.
   */
  public destroyTask(callback?: () => any) {
    for (const task of this.container.runningTasks.initialTimeouts) {
      clearTimeout(task);
    }
    for (const task of this.container.runningTasks.intervals) clearInterval(task);

    this.container.taskCollection = new AkumaKodoCollection<string, AkumaKodoTask>();
    this.container.runningTasks = { initialTimeouts: [], intervals: [] };

    this.container.logger.debug("info", "destroy Task", "All tasks destroyed!");

    if (callback) {
      callback();
    }
  }
}
