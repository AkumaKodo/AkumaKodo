import { AkumaKodoBotInterface } from "../../interfaces/Client.ts";
import { AkumaKodoTask } from "../../interfaces/Task.ts";
import { AkumaKodoLogger } from "../../../internal/logger.ts";
import { Milliseconds } from "../utils/Helpers.ts";
import { AkumaKodoCollection } from "../utils/Collection.ts";

/**
 * Allows you to create a new task for the bot.
 * @param bot The bot to create the task for.
 * @param task The task to be created.
 * @param callback Optional callback to run when the task is executed.
 */
export function createAkumaKodoTask(bot: AkumaKodoBotInterface, task: AkumaKodoTask, callback?: Function) {
  bot.taskCollection.set(task.name, task);
  if (callback) {
    callback();
  }
}

/**
 * Starts all registered tasks.
 * @param bot The bot to start the tasks for.
 */
export function initializeTask(bot: AkumaKodoBotInterface) {
  for (const task of bot.taskCollection.values()) {
    bot.runningTasks.initialTimeouts.push(
      setTimeout(async () => {
        try {
          await task.execute();
          AkumaKodoLogger("info", "initializeTask", `Task ${task.name} executed`);
        } catch (error) {
          AkumaKodoLogger("error", "initializeTask", `Task ${task.name} failed to execute.\n ${error}`);
        }

        bot.runningTasks.initialTimeouts.push(
          setInterval(async () => {
            if (!bot.fullyReady) return;
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
 * Destroys all task intervals in the bot.
 * @param bot The bot to destroy the intervals for.
 */
export function destroyTasks(bot: AkumaKodoBotInterface) {
  for (const task of bot.runningTasks.initialTimeouts) {
    clearTimeout(task);
  }
  for (const task of bot.runningTasks.intervals) clearInterval(task);

  bot.taskCollection = new AkumaKodoCollection<string, AkumaKodoTask>();
  bot.runningTasks = { initialTimeouts: [], intervals: [] };
}
