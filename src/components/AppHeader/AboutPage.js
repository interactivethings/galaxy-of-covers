'use strict';

var React = require('react')

require('components/AppHeader/AboutPage.scss')

var ComponentName = React.createClass({

  render() {
    return (
      <div className={'AboutPage' + (this.props.isOpen ? '' : ' AboutPage--closed')} style={{ maxHeight: this.props.maxHeight }}>
        <div className='AboutPage__wrapper'>
          <h2>Galaxy of Covers</h2>
          <h3>Honoring the evolution of the 50 most popular cover songs of all time.</h3>
          <h4>About the Project</h4>
          <p>Our most beloved songs have a longer history than we might think. They might exist in hundreds of alternative versions created by other artists in distant decades. Those versions can differ in character and style and reach completely different audiences.</p>
          <p>We looked closely at the 50 most popular cover songs as well as the original works. Galaxy of Covers is the result of this analysis and allows you to explore the evolution from idea to recording.</p>

          <h4>About the Visualization</h4>
          <p>The panorama view shows the 50 top songs as individual planetary systems with the original work as the sun. Each planet represents a version of the song and it’s appearance indicates characteristics including genre, popularity, tempo, valence, energy, and speechiness. The radius of its orbit around the sun shows the years between the publication dates. This view allows you to compare the structure and density of the constellation of different songs from a high-level perspective.</p>
          <p>The detail view lists the versions of one song in cross section. The characteristics and positioning of the planets is consistent with the panorama. This view allows you to compare different versions of the same song individually.</p>

          <h4>Sources</h4>
          <p>The dataset that drives this application is retrieved from the following sources:</p>
          <ul>
            <li>BBC: List of 50 most popular cover songs.</li>
            <li>Echonest: Information on tempo, valence, energy, and speechiness.</li>
            <li>Spotify: Information on popularity.</li>
            <li>Secondhand Songs: Information on cover version, artist, and date.</li>
            <li>Whosampled: Information on music genre.</li>
          </ul>

          <h4>Technology</h4>
          <p>The visualization is hand crafted with standard web technologies HTML, CSS, JavaScript using open source software including Bourbon, Catalyst, D3, React, among others. Please refer to our Github repository for more details.</p>

          <h4>Credits</h4>
          <p>Galaxy of Covers has been created by Interactive Things, a User Experience and Data Visualization studio based in Zürich, Switzerland. Research, concept, design, and development was done by Tania Boa, Ilya Boyandin, Mark Hintz, Jan Wächter, and Benjamin Wiederkehr.</p>
        </div>
      </div>
    )
  }

})

module.exports = ComponentName
