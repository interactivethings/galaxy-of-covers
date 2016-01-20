module.exports = {

  BaselinePoints(d) {
    var baseX = d.timelineBaseX
    ,   baseY = d.timelineBaseY
    ,   p1 = d.tailpt1
    ,   p2 = d.tailpt2
    ,   pts = [
      [baseX, baseY],
      [baseX + p1[0], baseY + p1[1]],
      [baseX + p2[0], baseY + p2[1]],
      [baseX, baseY]
    ]
    return pts.join(' ')
  },

  ExtendedPoints(d) {
    var baseX = d.timelineBaseX
    ,   x = d.timelineCX
    ,   baseY = d.timelineBaseY
    ,   y = d.timelineCY
    ,   p1 = d.tailpt1
    ,   p2 = d.tailpt2
    ,   pts = [
          [baseX, baseY],
          [x + p1[0], y + p1[1]],
          [x + p2[0], y + p2[1]],
          [baseX, baseY]
        ]
    return pts.join(' ')
  }

}
