import React from 'react';

import css from 'components/AppHeader/DropdownToggle.css';

const DropdownToggle = (props) => {
  return (
    <div className={`${css.DropdownToggle} ${props.open ? css.MenuOptionActive : ''}`} onClick={props.onClick} >
      <h2 className={css.DropdownToggleLabel}>{props.children}</h2>
      <span className={`${css.DropdownToggleIcon} ${props.open ? 'icon-keyboard-arrow-up' : 'icon-keyboard-arrow-down'}`} />
    </div>
  );
};

export default DropdownToggle;
