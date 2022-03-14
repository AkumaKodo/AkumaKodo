import { AkumaKodoBotInterface } from "../../interfaces/Client.ts";
import { AkumaKodoTask } from "../../interfaces/Task.ts";
import { AkumaKodoLogger } from "../../../internal/logger.ts";
import { Milliseconds } from "../utils/Helpers.ts";
import { AkumaKodoCollection } from "../utils/Collection.ts";
import { AkumaKodoBot } from "../AkumaKodo.ts";

/**
 * Allows you to create a new task for the bot.
 * @param bot The bot to create the task for.
 * @param task The task to be created.
 * @param callback Optional callback ran after the task is created. You can use this to do something after the task is created.
 */
export function createAkumaKodoTask(task: AkumaKodoTask, callback?: () => any) {
  AkumaKodoBot.taskCollection.set(task.name, task);
  if (callback) {
    callback();
  }
}

/**
 * Starts all registered tasks.
 * @param bot The bot to start the tasks for.
 */
export function initializeTask() {
  for (const task of AkumaKodoBot.taskCollection.values()) {
    AkumaKodoBot.runningTasks.initialTimeouts.push(
      setTimeout(async () => {
        try {
          await task.execute();
          AkumaKodoLogger("info", "initializeTask", `Task ${task.name} executed`);
        } catch (error) {
          AkumaKodoLogger("error", "initializeTask", `Task ${task.name} failed to execute.\n ${error}`);
        }

        AkumaKodoBot.runningTasks.initialTimeouts.push(
          setInterval(async () => {
            if (!AkumaKodoBot.fullyReady) return;
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
 * @param callback Optional callback ran after the intervals are destroyed. You can use this to do something after the intervals are destroyed.
 */
export function destroyTasks(callback?: () => any) {
  for (const task of AkumaKodoBot.runningTasks.initialTimeouts) {
    clearTimeout(task);
  }
  for (const task of AkumaKodoBot.runningTasks.intervals) clearInterval(task);

  AkumaKodoBot.taskCollection = new AkumaKodoCollection<string, AkumaKodoTask>();
  AkumaKodoBot.runningTasks = { initialTimeouts: [], intervals: [] };

  if (callback) {
    callback();
  }
}
