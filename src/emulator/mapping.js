// Map with 0x8000

// #define JOYPAD_N                        0x01
// #define JOYPAD_S                        0x02
// #define JOYPAD_W                        0x04
// #define JOYPAD_E                        0x08
// #define JOYPAD_FIRE                     0x10
// #define JOYPAD_FIRE2                    0x20
// #define JOYPAD_FIRE3                    0x40

// export class CommodoreKeyCodeToControlMapping extends KeyCodeToControlMapping {
//     constructor() {
//       super({
//         [KCODES.ARROW_UP]: CIDS.UP,
//         [KCODES.ARROW_DOWN]: CIDS.DOWN,
//         [KCODES.ARROW_RIGHT]: CIDS.RIGHT,
//         [KCODES.ARROW_LEFT]: CIDS.LEFT,
//         [KCODES.Z]: CIDS.A,
//         [KCODES.X]: CIDS.B,
//       });
//     }
//   }

// Build for what is mapped, also map into docs...

// Map commodore names to these names...

// {
//     "Space": {
//       "code": 32
//     },
//     "PageUp": {
//       "code": 280
//     },
//     "Insert": {
//       "code": 277
//     },
//     "Home": {
//       "code": 278
//     },
//     "Delete": {
//       "code": 127
//     },
//     "ControlLeft": {
//       "code": 306
//     },
//     "ControlRight": {
//       "code": 306
//     },
//     "AltLeft": {
//       "code": 306
//     },
//     "AltRight": {
//       "code": 306
//     },
//     "Backslash": {
//       "code": 92
//     },
//     "BracketLeft": {
//       "code": 91
//     },
//     "BracketRight": {
//       "code": 93
//     },
//     "Semicolon": {
//       "code": 59
//     },
//     "Quote": {
//       "code": 39
//     },
//     "Comma": {
//       "code": 44
//     },
//     "Period": {
//       "code": 46
//     },
//     "Slash": {
//       "code": 47
//     },
//     "Tab": {
//       "code": 9
//     },
//     "CapsLock": {
//       "code": 301
//     },
//     "ArrowLeft": {
//       "code": 276
//     },
//     "ArrowRight": {
//       "code": 275
//     },
//     "ArrowUp": {
//       "code": 273
//     },
//     "ArrowDown": {
//       "code": 274
//     },
//     "Escape": {
//       "code": 27
//     },
//     "F1": {
//       "code": 282
//     },
//     "F2": {
//       "code": 283
//     },
//     "F3": {
//       "code": 284
//     },
//     "F4": {
//       "code": 285
//     },
//     "F5": {
//       "code": 286
//     },
//     "F6": {
//       "code": 287
//     },
//     "F7": {
//       "code": 288
//     },
//     "F8": {
//       "code": 289
//     },
//     "ShiftLeft": {
//       "code": 304
//     },
//     "ShiftRight": {
//       "code": 303
//     },
//     "Backquote": {
//       "code": 96
//     },
//     "Minus": {
//       "code": 45
//     },
//     "Backspace": {
//       "code": 8
//     },
//     "Equal": {
//       "code": 61
//     },
//     "Digit0": {
//       "code": 48
//     },
//     "Digit1": {
//       "code": 49
//     },
//     "Digit2": {
//       "code": 50
//     },
//     "Digit3": {
//       "code": 51
//     },
//     "Digit4": {
//       "code": 52
//     },
//     "Digit5": {
//       "code": 53
//     },
//     "Digit6": {
//       "code": 54
//     },
//     "Digit7": {
//       "code": 55
//     },
//     "Digit8": {
//       "code": 56
//     },
//     "Digit9": {
//       "code": 57
//     },
//     "KeyA": {
//       "code": 97
//     },
//     "KeyB": {
//       "code": 98
//     },
//     "KeyC": {
//       "code": 99
//     },
//     "KeyD": {
//       "code": 100
//     },
//     "KeyE": {
//       "code": 101
//     },
//     "KeyF": {
//       "code": 102
//     },
//     "KeyG": {
//       "code": 103
//     },
//     "KeyH": {
//       "code": 104
//     },
//     "KeyI": {
//       "code": 105
//     },
//     "KeyJ": {
//       "code": 106
//     },
//     "KeyK": {
//       "code": 107
//     },
//     "KeyL": {
//       "code": 108
//     },
//     "KeyM": {
//       "code": 109
//     },
//     "KeyN": {
//       "code": 110
//     },
//     "KeyO": {
//       "code": 111
//     },
//     "KeyP": {
//       "code": 112
//     },
//     "KeyQ": {
//       "code": 113
//     },
//     "KeyR": {
//       "code": 114
//     },
//     "KeyS": {
//       "code": 115
//     },
//     "KeyT": {
//       "code": 116
//     },
//     "KeyU": {
//       "code": 117
//     },
//     "KeyV": {
//       "code": 118
//     },
//     "KeyW": {
//       "code": 119
//     },
//     "KeyX": {
//       "code": 120
//     },
//     "KeyY": {
//       "code": 121
//     },
//     "KeyZ": {
//       "code": 122
//     },
//     "Enter": {
//       "code": 13
//     }
//   }

// On Vice side, make call for each one... mapping for left, mapping for right, etc...
// then... in the loop check if they have a value, != 0 and apply logic