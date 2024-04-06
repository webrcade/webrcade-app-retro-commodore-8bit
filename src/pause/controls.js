import React from 'react';

import { ControlsTab } from '@webrcade/app-common';

export class GamepadControlsTab extends ControlsTab {
  render() {
    return (
      <>
        {/* {this.renderControl('start', 'Reset')}
        {this.renderControl('select', 'Select')}
        {this.renderControl('dpad', 'Move')}
        {this.renderControl('lanalog', 'Move')}
        {this.renderControl('a', 'Fire')}
        {this.renderControl('y', 'Color/B&W Switch')}
        {this.renderControl('lbump', 'Left Difficulty Switch')}
        {this.renderControl('rbump', 'Right Difficulty Switch')} */}
      </>
    );
  }
}

export class KeyboardControlsTab extends ControlsTab {
  render() {
    return (
      <>
        {/* {this.renderKey('Enter', 'Reset')}
        {this.renderKey('ShiftRight', 'Select')}
        {this.renderKey('ArrowUp', 'Up')}
        {this.renderKey('ArrowDown', 'Down')}
        {this.renderKey('ArrowLeft', 'Left')}
        {this.renderKey('ArrowRight', 'Right')}
        {this.renderKey('KeyZ', 'Fire')}
        {this.renderKey('KeyS', 'Color/B&W Switch')}
        {this.renderKey('KeyQ', 'Left Difficulty Switch')}
        {this.renderKey('KeyW', 'Right Difficulty Switch')} */}
      </>
    );
  }
}
