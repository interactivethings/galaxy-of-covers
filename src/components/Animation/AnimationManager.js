var galaxyPlanets = {}
var galaxySystems = {}

function LinkedList() {
  var head = null
  ,   tail = null

  return {
    first: function() {
      return head
    },
    add: function(val) {
      var node = { val: val, next: null }
      if (tail) tail.next = node
      else head = node
      tail = node
    }
  }
}

var AnimationManager = {

  registerSystemPlanet(systemId, planetAnimator) {
    var system = galaxySystems[systemId]
    if (!system) system = galaxySystems[systemId] = LinkedList()
    system.add(planetAnimator)
    galaxyPlanets[planetAnimator.id] = planetAnimator
    d3.timer(planetAnimator.animate)
  },

  toggleSystemPlay(systemId, toggle) {
    var system = galaxySystems[systemId]
    if (system) {
      var planetRef = system.first()
      while (planetRef) {
        planetRef.val.play = toggle
        planetRef = planetRef.next
      }
    }
  },

  stopSystem(systemId) {
    var system = galaxySystems[systemId]
    if (system) {
      var planetRef = system.first()
      while (planetRef) {
        planetRef.val.stop = true
        planetRef = planetRef.next
      }
      galaxySystems[systemId] = null
    }
  },

  togglePlanetPlay(planetId, toggle) {
    var planet = galaxyPlanets[planetId]
    if (planet) planet.play = toggle
  }

}

module.exports = AnimationManager
