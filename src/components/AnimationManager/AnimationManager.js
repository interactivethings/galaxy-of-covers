var galaxyPlanets = {}

var AnimationManager = {

  registerAnimatedPlanet(planetAnimator) {
    galaxyPlanets[planetAnimator.id] = planetAnimator
  },

  continuousPlanetAnimation(planetId) {
    var planet = galaxyPlanets[planetId]
    if (planet) d3.timer(planet.animate)
  },

  togglePlanetPlay(planetId, toggle) {
    var planet = galaxyPlanets[planetId]
    if (planet) planet.play = toggle
  },

  stopPlanet(planetId) {
    var planet = galaxyPlanets[planetId]
    if (planet) {
      planet.stop = true
      galaxyPlanets[planetId] = null
    }
  }

}

module.exports = AnimationManager
