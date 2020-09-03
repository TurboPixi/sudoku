export default {
  width: 8,
  height: 8,

  crates: [
    {type: 'blue', x: 2, y: 4},
    {type: 'blue', x: 4, y: 4},
    {type: 'blue', x: 5, y: 4},
    {type: 'blue', x: 4, y: 2},
  ],

  frames: [
    {type: 'blue', x: 2, y: 2},
    {type: 'blue', x: 2, y: 4},
    {type: 'blue', x: 4, y: 3},
    {type: 'blue', x: 5, y: 5},
  ],

  player: {x: 1, y: 4},

  map: [
    0, 0, 1, 1, 1, 1, 0, 0,
    0, 1, 2, 2, 2, 2, 1, 0,
    0, 1, 2, 1, 2, 2, 1, 0,
    0, 1, 2, 1, 2, 2, 1, 0,
    1, 2, 2, 2, 2, 2, 1, 0,
    1, 2, 2, 1, 2, 2, 2, 1,
    0, 1, 2, 2, 2, 2, 2, 1,
    0, 0, 1, 1, 1, 1, 1, 0
  ]
}