import React from 'react';

import { ControlsTab } from '@webrcade/app-common';

export const OPTIONS = [
  {
      label: "Joystick Left",
      value: "joy-left"
  },
  {
      label: "Joystick Right",
      value: "joy-right"
  },
  {
      label: "Joystick Up",
      value: "joy-up"
  },
  {
      label: "Joystick Down",
      value: "joy-down"
  },
  {
      label: "Fire 1",
      value: "fire1"
  },
  {
      label: "Fire 2",
      value: "fire2"
  },
  {
      label: "F1",
      value: "f1"
  },
  {
      label: "F2",
      value: "f2"
  },
  {
      label: "F3",
      value: "f3"
  },
  {
      label: "F4",
      value: "f4"
  },
  {
      label: "F5",
      value: "f5"
  },
  {
      label: "F6",
      value: "f6"
  },
  {
      label: "F7",
      value: "f7"
  },
  {
      label: "F8",
      value: "f8"
  },
  {
      label: "Run/Stop",
      value: "runstop"
  },
  {
      label: "Home",
      value: "home"
  },
  {
      label: "Delete",
      value: "delete"
  },
  {
      label: "Control",
      value: "control"
  },
  {
      label: "Restore",
      value: "restore"
  },
  {
      label: "Commodore Key",
      value: "commodore"
  },
  {
      label: "Left Shift",
      value: "leftshift"
  },
  {
      label: "Right Shift",
      value: "rightshift"
  },
  {
      label: "Return",
      value: "return"
  },
  {
      label: "Cursor Up",
      value: "cursorup"
  },
  {
      label: "Cursor Down",
      value: "cursordown"
  },
  {
      label: "Cursor Left",
      value: "cursorleft"
  },
  {
      label: "Cursor Right",
      value: "cursorright"
  },
  {
      label: "Space Bar",
      value: "space"
  },
  {
      label: "A",
      value: "a"
  },
  {
      label: "B",
      value: "b"
  },
  {
      label: "C",
      value: "c"
  },
  {
      label: "D",
      value: "d"
  },
  {
      label: "E",
      value: "e"
  },
  {
      label: "F",
      value: "f"
  },
  {
      label: "G",
      value: "g"
  },
  {
      label: "H",
      value: "h"
  },
  {
      label: "I",
      value: "i"
  },
  {
      label: "J",
      value: "j"
  },
  {
      label: "K",
      value: "k"
  },
  {
      label: "L",
      value: "l"
  },
  {
      label: "M",
      value: "m"
  },
  {
      label: "N",
      value: "n"
  },
  {
      label: "O",
      value: "o"
  },
  {
      label: "P",
      value: "p"
  },
  {
      label: "Q",
      value: "q"
  },
  {
      label: "R",
      value: "r"
  },
  {
      label: "S",
      value: "s"
  },
  {
      label: "T",
      value: "t"
  },
  {
      label: "U",
      value: "u"
  },
  {
      label: "V",
      value: "v"
  },
  {
      label: "W",
      value: "w"
  },
  {
      label: "X",
      value: "x"
  },
  {
      label: "Y",
      value: "y"
  },
  {
      label: "Z",
      value: "z"
  },
  {
      label: "1",
      value: "1"
  },
  {
      label: "2",
      value: "2"
  },
  {
      label: "3",
      value: "3"
  },
  {
      label: "4",
      value: "4"
  },
  {
      label: "5",
      value: "5"
  },
  {
      label: "6",
      value: "6"
  },
  {
      label: "7",
      value: "7"
  },
  {
      label: "8",
      value: "8"
  },
  {
      label: "9",
      value: "9"
  },
  {
      label: "0",
      value: "0"
  },
  {
      label: "+",
      value: "plus"
  },
  {
      label: "-",
      value: "minus"
  },
  {
      label: "£",
      value: "pound"
  },
  {
      label: "←",
      value: "leftarrow"
  },
  {
      label: "↑",
      value: "uparrow"
  },
  {
      label: "@",
      value: "at"
  },
  {
      label: "*",
      value: "asterick"
  },
  {
      label: ":",
      value: "colon"
  },
  {
      label: ";",
      value: "semicolon"
  },
  {
      label: "=",
      value: "equal"
  },
  {
      label: ",",
      value: "comma"
  },
  {
      label: ".",
      value: "period"
  },
  {
      label: "/",
      value: "slash"
  },
];

let keymap = null;

const getKeyName = (key) => {
  if (keymap === null) {
    keymap = {}
    for (let i = 0; i < OPTIONS.length; i++) {
      const opt = OPTIONS[i];
      keymap[opt.value] = opt.label;
    }
  }
  return keymap[key];
}

export class GamepadControlsTab extends ControlsTab {

  renderMappedControl(control) {
    const {emulator} = this.props;
    const mappings = emulator.getMappings();
    if (control === "select") {
      return this.renderControl('select', 'Keyboard');
    } else if (control === "dpad") {
        return this.renderControl('dpad', 'Move');
    } else if (control === "lanalog") {
        return this.renderControl('lanalog', 'Move');
    } else {
      let key = control;
      if (key === "lbump") key = "lb";
      else if (key === "rbump") key = "rb";
      else if (key === "ltrig") key = "lt";
      else if (key === "rtrig") key = "rt";
      const map = mappings[key];
      if (map) {
        let text = null;
        if (key === "ra-up") {
          text = "(up)";
        } else if (key === "ra-down") {
          text = "(down)";
        } else if (key === "ra-left") {
          text = "(left)";
        } else if (key === "ra-right") {
          text = "(right)";
        }
        if (text) {
          return this.renderControlWithText("ranalog", text, getKeyName(map));
        } else {
          return this.renderControl(control, getKeyName(map));
        }
      }
    }
  }

  render() {
    const outControls = [];
    const controls = [
      "start", "select", "dpad", "lanalog", "a", "b", "x", "y", "lbump", "rbump", "ltrig", "rtrig",
      "ra-up", "ra-down", "ra-left", "ra-right"
    ]
    for (let i = 0; i < controls.length; i++) {
      const control = controls[i];
      const out = this.renderMappedControl(control);
      if (out) {
        outControls.push(out);
      }
    }

    return (
      <>
        {outControls}
      </>
    );
  }
}

export class KeyboardControlsTab extends ControlsTab {
  render() {
    const {emulator} = this.props;
    const mappings = emulator.getMappings();
    const controlsOut = [];
    const aMap = mappings["a"];
    if (aMap) {
      controlsOut.push(this.renderKey('KeyZ', getKeyName(aMap)))
    }
    const bMap = mappings["b"];
    if (bMap) {
      controlsOut.push(this.renderKey('KeyX', getKeyName(bMap)))
    }

    // {this.renderKey('KeyZ', 'Fire 1')}
    // {this.renderKey('KeyX', 'Fire 2')}

    return (
      <>
        {this.renderKey('ArrowUp', 'Up')}
        {this.renderKey('ArrowDown', 'Down')}
        {this.renderKey('ArrowLeft', 'Left')}
        {this.renderKey('ArrowRight', 'Right')}
        {controlsOut}
      </>
    );
  }
}
