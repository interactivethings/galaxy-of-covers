import React from 'react';
import css from 'components/AppHeader/HeaderMenu.css';
import shareImage from '!file?name=[name].[ext]!assets/share_img.png';

import DropdownToggle from 'components/AppHeader/DropdownToggle';
import {TwitterShare, FacebookShare, PinterestShare} from 'components/AppHeader/ShareButtons';

var HeaderMenu = React.createClass({

  render() {
    const {legendOpen, toggleLegend, aboutOpen, toggleAbout, isStacked, aboutShareOpen} = this.props;

    return (
      <div className={`${css.AppHeaderMenu}`} >
        {/* Modal Menus */}
        {(!isStacked || !aboutShareOpen) &&
          <DropdownToggle open={legendOpen} onClick={toggleLegend} >Legend</DropdownToggle>
        }
        {(!isStacked || aboutShareOpen) &&
          <DropdownToggle open={aboutOpen} onClick={toggleAbout} >About</DropdownToggle>
        }
        {/* Share Stuff */}
        {(!isStacked || aboutShareOpen) && 
          <div className={`${css.appheadersharediv}`}>
            <TwitterShare
              text={'Galaxy of Covers – Honoring the evolution of the 50 most popular cover songs of all time.'}
              url={'https://lab.interactivethings.com/galaxy-of-covers'}
              via={'ixt'}
            />
            <FacebookShare
              url={'https://lab.interactivethings.com/galaxy-of-covers'}
            />
            <PinterestShare
              media={location.href + shareImage}
              url={'https://lab.interactivethings.com/galaxy-of-covers'}
              description={'Galaxy of Covers – Honoring the evolution of the 50 most popular cover songs of all time.'}
            />
          </div>
        }
      </div>
    )
  }

});

module.exports = HeaderMenu;
