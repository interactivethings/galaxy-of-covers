module.exports = function energyBaselinePoints(d) {
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
}
