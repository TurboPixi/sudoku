export default {
  width: 7,
  height: 8,

  crates: [
    {type: 'red', x: 1, y: 3},
    {type: 'red', x: 2, y: 3},
    {type: 'red', x: 3, y: 4},
    {type: 'red', x: 3, y: 5},
    {type: 'red', x: 4, y: 5},
    {type: 'red', x: 5, y: 4},
  ],

  frames: [
    {type: 'red', x: 1, y: 5},
    {type: 'red', x: 2, y: 3},
    {type: 'red', x: 2, y: 4},
    {type: 'red', x: 4, y: 4},
    {type: 'red', x: 4, y: 5},
    {type: 'red', x: 5, y: 4},
  ],

  player: {x: 3, y: 6},

  map: [
    0, 1, 1, 1, 0, 0, 0,
    1, 2, 2, 2, 1, 0, 0,
    1, 2, 2, 2, 1, 1, 0,
    1, 2, 2, 2, 2, 2, 1,
    1, 2, 2, 2, 2, 2, 1,
    1, 2, 2, 2, 2, 2, 1,
    0, 1, 1, 2, 2, 2, 1,
    0, 0, 0, 1, 1, 1, 0
  ]
}