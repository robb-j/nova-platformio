import { PlatformIO } from './pio.js'

export class PlatformIOTasks implements TaskAssistant {
  constructor(public pio: PlatformIO) {}

  provideTasks(): AssistantArray<Task> {
    // const pioPath = getPioPath()
    // if (!isFile(pioPath)) {
    //   //
    //   // Install task
    //   //
    // } else {
    //   //
    //   //
    //   //
    // }

    //
    //
    //
    const systemInfo = new Task('System info')

    systemInfo.setAction(Task.Run, this.pio.getSystemInfoAction())

    const listBoards = new Task('List boards')
    listBoards.setAction(Task.Run, this.pio.getBoardsAction())

    return [listBoards, systemInfo]
  }

  // resolveTaskAction(
  //   context: TaskActionResolveContext<any>,
  // ): ResolvedTaskAction | Promise<ResolvedTaskAction> {
  //   if (Array.isArray(context.data.args)) {
  //     return new TaskProcessAction(this.pio.path, {
  //
  //     })
  //   }
  //
  //   //
  //   //
  //   //
  //   throw new Error('Method not implemented.')
  // }
}
