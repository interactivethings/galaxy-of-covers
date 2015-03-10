module.exports = {

  BaselinePoints(d) {
    var x = d.timelineCX
    ,   baseY = d.timelineBaseY
    ,   p1 = d.tailpt1
    ,   p2 = d.tailpt2
    ,   pts = [
      [x, baseY],
      [x + p1[0], baseY + p1[1]],
      [x + p2[0], baseY + p2[1]],
      [x, baseY]
    ]
    return pts.join(' ')
  },

  ExtendedPoints(d) {
    var x = d.timelineCX
    ,   baseY = d.timelineBaseY
    ,   y = d.timelineCY
    ,   p1 = d.tailpt1
    ,   p2 = d.tailpt2
    ,   pts = [
          [x, baseY],
          [x + p1[0], y + p1[1]],
          [x + p2[0], y + p2[1]],
          [x, baseY]
        ]
    return pts.join(' ')
  }

}
