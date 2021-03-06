import {animate, easeIn} from 'popmotion'

import Cell from './Cell'
import {Color, Mode} from './enum'
import * as sound from './sound'
import {createPromise, store} from '~/util'

let mode = Mode.Pen
let selected: Cell

const cells: Cell[] = []
const rows: Cell[][] = []
const cols: Cell[][] = []
const regions: Cell[][] = []
const grid: Grid = new PIXI.Graphics()

grid.interactive = true
grid.on('pointerdown', (e: IEvent) => {
  if (!(e.target instanceof Cell)) return
  const cell = e.target
  const {coord} = cell
  unhighlight()
  highlight(coord.x, coord.y)
  like(cell.value)
  if (!cell.selectable) {
    selected = null
    return valid()
  }
  selected = cell
  cell.statuses[1] = 1
  valid()
})

grid.init = function(opt) {
  const {size} = opt
  this
    .clear()
    .lineStyle(4, Color.Black, 1, 1)
    .beginFill(Color.White)
    .drawRect(0, 0, size * 9, size * 9)
    .endFill()

  this.data = opt.data

  for (let i = 0; i < 81; i++) {
    const x = i % 9
    const y = i / 9 | 0
    const cell = new Cell({size, y, x})
    cell.index = i
    cell.interactive = true
    cells.push(cell)
    cols[x] ||= []
    rows[y] ||= []
    cols[x].push(cell)
    rows[y].push(cell)

    {
      const dx = x / 3 | 0
      const dy = y / 3 | 0
      const i = dy * 3 + dx
      regions[i] ||= []
      regions[i].push(cell)
    }

    this.addChild(cell)
  }

  // 横竖两条线
  for (let x = 0; x < 2; x++) {
    const line = new PIXI.Graphics()
      .beginFill(Color.Black)
      .drawRect(0, 0, 2, size * 9)
      .endFill()

    line.position.set((x + 1) * size * 3 - 1, 0)
    grid.addChild(line)
  }

  for (let y = 0; y < 2; y++) {
    const line = new PIXI.Graphics()
      .beginFill(Color.Black)
      .drawRect(0, 0, size * 9, 2)
      .endFill()

    line.position.set(0, (y + 1) * size * 3 - 1)
    grid.addChild(line)
  }
}

grid.refresh = async function(opt) {
  this.data = opt.data
  mode = opt.mode
  for (const row of rows) {
    const [promise, resolve] = createPromise()
    for (const cell of row) {
      cell.empty()
      animate({
        from: .6,
        to: 1,
        duration: 2e2,
        ease: easeIn,
        onUpdate: (v) => {
          v > .8 && resolve()
          cell.tint = (v * 255 << 16) + (v * 255 << 8) + v * 255
        },
        onComplete: () => {
          const num = +opt.data[0][cell.index]
          num && cell.preset(num)
        }
      })
    }
    await promise
  }
  valid()
}

grid.switch = function(v) {
  mode = v
  sound.play(`${mode === Mode.Pen ? 'pen' : 'pencil'}.mp3`)
}

grid.erase = function() {
  if (!selected) return
  sound.play('erase.mp3')
  selected.erase()
  valid()
}

grid.input = function(v) {
  if (!selected) return
  if (mode === Mode.Pen) {
    selected.value = v
    sound.play('pen.mp3')
    if (this.check()) return grid.emit('done')
    selected.statuses[1] = 1
    valid()
  } else {
    selected.note(v)
    sound.play('pencil.mp3')
    valid()
  }
  save()
}

function valid() {
  for (const row of rows) {
    for (let i = 0, j = row.length; i < j; i++) {
      const cell = row[i]
      // 重置error状态
      cell.statuses[0] = 0
      const v = cell.value
      if (!v) continue
      const _i = row.findIndex(cell => cell.value === v)
      if (i === _i) continue
      for (const item of row) {
        if (item.value === v && item.selectable) item.statuses[0] = 1
      }
    }
  }

  for (const col of cols) {
    for (let i = 0, j = col.length; i < j; i++) {
      const cell = col[i]
      const v = cell.value
      if (!v) continue
      const _i = col.findIndex(cell => cell.value === v)
      if (i === _i) continue
      for (const item of col) {
        if (item.value === v && item.selectable) item.statuses[0] = 1
      }
    }
  }

  for (const region of regions) {
    for (let i = 0, j = region.length; i < j; i++) {
      const cell = region[i]
      const v = cell.value
      if (!v) continue
      const _i = region.findIndex(cell => cell.value === v)
      if (i === _i) continue
      for (const item of region) {
        if (item.value === v && item.selectable) item.statuses[0] = 1
      }
    }
  }
}

grid.tip = function() {
  if (!selected) return wx.showToast({title: '请先选中需要填写的方格', icon: 'none'})
  store.tip.count--
  selected.value = +this.data[1][selected.index]
  sound.play('hint.mp3')
  if (this.check()) return grid.emit('done')
  save()
}

/** 恢复填写记录 */
grid.restore = function(opt) {
  mode = opt.mode
  for (let i = 0; i < 81; i++) {
    const cell = cells[i]
    const item = opt.data[i]
    cell.empty()
    if (item.preset) {
      cell.preset(item.preset)
      continue
    }
    if (item.value) {
      cell.value = item.value
      continue
    }
    for (const v of item.items) cell.note(v)
  }
  valid()
}

/** 保存填写记录 */
function save() {
  store.last.cells = cells.map((cell) => {
    return {
      value: cell.value,
      preset: cell.selectable ? null : cell.value,
      items: cell.items
    }
  })
}

/** 高亮相同数字的cell */
function like(v: number) {
  if (!v) return
  for (const cell of cells) {
    if (cell.value === v) cell[2] = 1
  }
}

grid.check = function() {
  for (let i = 0; i < 81; i++) {
    const cell = cells[i]
    if (cell.value !== +this.data[1][i]) return false
  }
  return true
}

/** 高亮关联的cell */
function highlight(x: number, y: number) {
  for (const cell of rows[y]) {
    cell.statuses[3] = 1
  }
  for (const cell of cols[x]) {
    cell.statuses[3] = 1
  }
  const i = (x / 3 | 0) + (y / 3 | 0) * 3
  for (const cell of regions[i]) {
    cell.statuses[3] = 1
  }
}

function unhighlight() {
  for (const cell of cells) {
    cell.statuses[0] =
    cell.statuses[1] =
    cell.statuses[2] =
    cell.statuses[3] = 0
  }
}

interface IOption {
  // 方格尺寸
  size: number
  data: ILevelData
}

interface Grid extends PIXI.Graphics {
  data?: ILevelData
  tip?(): void
  erase?(): void
  switch?(v: Mode): void
  check?(this: Grid): boolean
  input?(this: Grid, v: number): void
  init?(this: Grid, opt: IOption): void
  refresh?(this: Grid, opt: {data: ILevelData, mode: Mode}): void
  restore?(this: Grid, opt: {data: typeof store.last.cells, mode: Mode}): void
}

export default grid
