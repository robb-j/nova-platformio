import { PlatformIO } from './pio.js'
import { Board, RunTarget } from './types.js'

export class BoardProvider implements TreeDataProvider<Board> {
  search: string | null = null
  constructor(public pio: PlatformIO) {}

  async getChildren(): Promise<Board[]> {
    const boards = await this.pio.listBoards()
    const query = this.search?.toLowerCase()
    return boards
      .filter(query ? (b) => b.name.toLowerCase().includes(query) : () => true)
      .sort((a, b) => a.id.localeCompare(b.id))
  }

  getTreeItem(board: Board): TreeItem {
    const item = new TreeItem(board.id, TreeItemCollapsibleState.None)
    item.identifier = board.id
    item.image = '__filetype.json'
    item.descriptiveText = board.name
    item.command = 'robb-j.platformio.copyBoard'
    return item
  }
}

class GroupItem {
  constructor(
    public name: string,
    public targets: Target[],
  ) {}
}

class Target {
  get name() {
    return this.target.name
  }
  get title() {
    return this.target.title
  }
  get description() {
    return this.target.description
  }
  constructor(public target: RunTarget) {}
}

// interface RunGroup {
//   group: string
//   targets: RunTarget[]
// }

type TargetItem = GroupItem | Target

export class TargetProvider implements TreeDataProvider<TargetItem> {
  constructor(public pio: PlatformIO) {}

  async getChildren(parent: GroupItem | null): Promise<TargetItem[]> {
    if (parent) return parent.targets
    const metadata = await this.pio.getMetadata()
    const output: GroupItem[] = []
    for (const name in metadata) {
      output.push(
        new GroupItem(
          name,
          metadata[name].targets.map((t) => new Target(t)),
        ),
      )
    }
    return output
  }

  getTreeItem(target: TargetItem): TreeItem {
    if (target instanceof GroupItem) {
      const item = new TreeItem(target.name, TreeItemCollapsibleState.Expanded)
      item.image = '__builtin.remote'
      item.identifier = target.name
      return item
    } else {
      const item = new TreeItem(target.title, TreeItemCollapsibleState.None)
      item.identifier = target.name
      item.image = '__filetype.sh'
      if (target.description) item.descriptiveText = target.description
      return item
    }
  }
}
