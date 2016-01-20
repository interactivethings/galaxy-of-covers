import React from 'react';

import css from 'components/AppHeader/ShareButtons.css';

export const TwitterShare = (props) => {
  return (
    <a
      href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(props.text)}&url=${encodeURIComponent(props.url)}&via=${encodeURIComponent(props.via)}`}
      target='_blank'
    >
      <div className={`${css.headerShareButton} icon-twitter`} />
    </a>
  );
};

export const FacebookShare = (props) => {
  return (
    <a
      href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(props.url)}`}
      target='_blank'
    >
      <div className={`${css.headerShareButton} icon-facebook`} />
    </a>
  );
};

export const PinterestShare = (props) => {
  return (
    <a
      onClick={() => {
        if (typeof PinUtils !== 'undefined' && typeof PinUtils.pinOne === 'function') {
          PinUtils.pinOne({
            media: props.media,
            url: props.url,
            description: props.description
          });
        }
      }}
    >
      <div className={`${css.headerShareButton} icon-pinterest`} />
    </a>
  );
};
