import React, { Component } from 'react'

export default ({ state, onToggle }) =>
  <input
    type="checkbox"
    checked={state}
    onChange={onToggle}
  />
  // <Icon
  //   type={ state ? 'eye' : 'eye-o' }
  //   size={ size || 'large' }
  //   onClick={onToggle}
  // />
