import React from 'react';

import { ControlsTab } from '@webrcade/app-common';

export class GamepadControlsTab extends ControlsTab {
  render() {
    return (
      <>
        {this.renderControl('start', 'Enter Key')}
        {this.renderControl('select', 'Keyboard')}
        {this.renderControl('dpad', 'Move')}
        {this.renderControl('lanalog', 'Move')}
        {this.renderControl('a', 'Fire 1')}
        {this.renderControl('b', 'Fire 2')}
        {this.renderControl('y', 'Space Bar')}
        {this.renderControl('lbump', 'Run/stop')}
        {this.renderControl('rbump', 'F1')}
      </>
    );
  }
}

export class KeyboardControlsTab extends ControlsTab {
  render() {
    return (
      <>
        {this.renderKey('ArrowUp', 'Up')}
        {this.renderKey('ArrowDown', 'Down')}
        {this.renderKey('ArrowLeft', 'Left')}
        {this.renderKey('ArrowRight', 'Right')}
        {this.renderKey('KeyZ', 'Fire 1')}
        {this.renderKey('KeyX', 'Fire 2')}
      </>
    );
  }
}
