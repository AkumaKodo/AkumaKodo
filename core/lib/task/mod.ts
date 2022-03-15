import { AkumaKodoTask } from "../../interfaces/Task.ts";
import { AkumaKodoCollection } from "../utils/Collection.ts";
import {BotWithCache} from "https://deno.land/x/discordeno_cache_plugin@0.0.21/src/addCacheCollections.ts";
import {AkumaKodoBotInterface} from "../../interfaces/Client.ts";

export class AkumaKodoTaskModule {
  private client:  BotWithCache
  private container: AkumaKodoBotInterface;
  public constructor(client: BotWithCache, container: AkumaKodoBotInterface) {
    this.client = client;
    this.container = container;
  }

  public initializeTask() {
    for (const task of this.container.taskCollection.values()) {
      this.container.runningTasks.initialTimeouts.push(
        setTimeout(async () => {
          try {
            await task.execute();
            this.container.logger.create("info", "initializeTask", `Task ${task.name} executed`);
          } catch (error) {
            this.container.logger.create("error", "initializeTask", `Task ${task.name} failed to execute.\n ${error}`);
          }

          this.container.runningTasks.initialTimeouts.push(
            setInterval(async () => {
              if (!this.container.fullyReady) return;
              try {
                await task.execute();
                this.container.logger.create("info", "initializeTask", `Task ${task.name} executed`);
              } catch (error) {
                this.container.logger.create(
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
  }

  /**
   * Creates a new task for the bot.
   * @param task The task to be executed.
   * @param callback The callback to be executed when the task is executed.
   * @protected
   */
  public createAkumaKodoTask(task: AkumaKodoTask, callback?: () => any) {
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
  public destroyTask(callback?: () => any) {
    for (const task of this.container.runningTasks.initialTimeouts) {
      clearTimeout(task);
    }
    for (const task of this.container.runningTasks.intervals) clearInterval(task);

    this.container.taskCollection = new AkumaKodoCollection<string, AkumaKodoTask>();
    this.container.runningTasks = { initialTimeouts: [], intervals: [] };

    this.container.logger.create("info", "destroyTask", "All tasks destroyed!");

    if (callback) {
      callback();
    }
  }
}
