import { VK_POSITION } from "../emulator/prefs";
import {
  KeyDef
} from "./common";

import keycodes from "./c64-keymap-positional.json";

import {
  ArrowUpwardImage,
  ArrowDownwardImage,
  ArrowBackImage,
  ArrowForwardImage,
  SwapVertImage,
} from '@webrcade/app-common';

const SHIFT_PREFIX = "SHIFT:";

const onKeyboardClose = (kb, ctx) => {
  if (ctx.commodore) {
    ctx.commodore = false;
  }
  if (ctx.leftShift) {
    ctx.leftShift = false;
  }
  if (ctx.rightShift) {
    ctx.rightShift = false;
  }
  if (ctx.control) {
    ctx.control = false;
  }
}

let nextFlip = 0;

const allowFlip = () => {
  const NOW = Date.now();
  if (nextFlip < NOW) {
    nextFlip = NOW + 200;
    return true;
  }
  console.log('ignoring flip!')
  return false;
}

const showLetters = (kb, ctx) => {
  if (!allowFlip()) return;
  ctx.currentKeys = "default";
  kb.setState({ keysContext: { ...ctx } })
  kb.updateFocusGridComponents();
}

const showNumbers = (kb, ctx) => {
  if (!allowFlip()) return;
  ctx.currentKeys = "numbers";
  kb.setState({ keysContext: { ...ctx } })
  kb.updateFocusGridComponents();
}

const showCaps = (kb, ctx) => {
  if (!allowFlip()) return;
  ctx.currentKeys = "caps";
  kb.setState({ keysContext: { ...ctx } })
  kb.updateFocusGridComponents();
}

const toggleLeftShift = (kb, ctx, key) => {
  ctx.leftShift = !ctx.leftShift;
  kb.setState({ keysContext: { ...ctx } })
  if (ctx.leftShift) {
    onKey(kb, ctx, key);
  }
}

const toggleRightShift = (kb, ctx, key) => {
  ctx.rightShift = !ctx.rightShift;
  kb.setState({ keysContext: { ...ctx } })
  if (ctx.rightShift) {
    onKey(kb, ctx, key);
  }
}

const toggleCommodore = (kb, ctx, key) => {
  ctx.commodore = !ctx.commodore;
  kb.setState({ keysContext: { ...ctx } })
  if (ctx.commodore) {
    onKey(kb, ctx, key);
  }
}

const toggleControl = (kb, ctx, key) => {
  ctx.control = !ctx.control;
  kb.setState({ keysContext: { ...ctx } })
  if (ctx.control) {
    onKey(kb, ctx, key);
  }
}

const leftShiftEnabled = (kb, ctx) => {
  return ctx.leftShift;
}

const rightShiftEnabled = (kb, ctx) => {
  return ctx.rightShift;
}

const commodoreEnabled = (kb, ctx) => {
  return ctx.commodore;
}

const controlEnabled = (kb, ctx) => {
  return ctx.control;
}

const locationToggle = (kb, ctx) => {
  const prefs = window.emulator.getPrefs()
  prefs.setVkPosition(
    prefs.getVkPosition() === VK_POSITION.MIDDLE ?
      VK_POSITION.BOTTOM : VK_POSITION.MIDDLE
  )
  kb.forceRefresh();
}

const onKey = (kb, ctx, key) => {
  let shift = false;
  let code = null;
  if (key.c.startsWith(SHIFT_PREFIX)) {
    shift = true;
    code = keycodes[key.c.substring(SHIFT_PREFIX.length)];
  }

  if (code === null) {
    code = keycodes[key.c];
  }

  if (ctx.leftShift || shift) {
    window.emulator.sendKeyDown(keycodes["ShiftLeft"].code);
  }
  if (ctx.rightShift) {
    window.emulator.sendKeyDown(keycodes["ShiftRight"].code);
  }
  if (ctx.commodore) {
    window.emulator.sendKeyDown(keycodes["ControlLeft"].code);
  }
  if (ctx.control) {
    window.emulator.sendKeyDown(keycodes["Tab"].code);
  }

  window.emulator.sendKeyDown(code.code);

  setTimeout(() => {
    window.emulator.sendKeyUp(code.code);
    if (ctx.rightShift) {
      window.emulator.sendKeyUp(keycodes["ShiftRight"].code);
    }
    if (ctx.leftShift || shift) {
      window.emulator.sendKeyUp(keycodes["ShiftLeft"].code);
    }
    if (ctx.commodore) {
      window.emulator.sendKeyUp(keycodes["ControlLeft"].code);
    }
    if (ctx.control) {
      window.emulator.sendKeyUp(keycodes["Tab"].code);
    }
  }, 50);
}

const onEnter = (kb, ctx, key) => {
  onKey(kb, ctx, key);
  if (kb.isCloseOnEnter()) {
    window.emulator.app.setKeyboardShown(false);
  }
}

const KEYS = {
  "default": [
    [
      new KeyDef("F1").code("F1").setOnClick(onKey),
      new KeyDef("F2").code("F2").setOnClick(onKey),
      new KeyDef("F3").code("F3").setOnClick(onKey),
      new KeyDef("F4").code("F4").setOnClick(onKey),
      new KeyDef("F5").code("F5").setOnClick(onKey),
      new KeyDef("F6").code("F6").setOnClick(onKey),
      new KeyDef("F7").code("F7").setOnClick(onKey),
      new KeyDef("F8").code("F8").setOnClick(onKey),
      new KeyDef("Run/Stop").setWidth(2).code("Escape").setOnClick(onKey),
    ],
    [
      new KeyDef("q").code("KeyQ").setOnClick(onKey),
      new KeyDef("w").code("KeyW").setOnClick(onKey),
      new KeyDef("e").code("KeyE").setOnClick(onKey),
      new KeyDef("r").code("KeyR").setOnClick(onKey),
      new KeyDef("t").code("KeyT").setOnClick(onKey),
      new KeyDef("y").code("KeyY").setOnClick(onKey),
      new KeyDef("u").code("KeyU").setOnClick(onKey),
      new KeyDef("i").code("KeyI").setOnClick(onKey),
      new KeyDef("o").code("KeyO").setOnClick(onKey),
      new KeyDef("p").code("KeyP").setOnClick(onKey),
    ],
    [
      new KeyDef("C=").code("ControlLeft").setOnClick(toggleCommodore).setIsEnabledCb(commodoreEnabled),
      new KeyDef("a").code("KeyA").setOnClick(onKey),
      new KeyDef("s").code("KeyS").setOnClick(onKey),
      new KeyDef("d").code("KeyD").setOnClick(onKey),
      new KeyDef("f").code("KeyF").setOnClick(onKey),
      new KeyDef("g").code("KeyG").setOnClick(onKey),
      new KeyDef("h").code("KeyH").setOnClick(onKey),
      new KeyDef("j").code("KeyJ").setOnClick(onKey),
      new KeyDef("k").code("KeyK").setOnClick(onKey),
      new KeyDef("l").code("KeyL").setOnClick(onKey),
    ],
    [
      new KeyDef("CTRL").code("Tab").setOnClick(toggleControl).setIsEnabledCb(controlEnabled),
      new KeyDef("z").code("KeyZ").setOnClick(onKey),
      new KeyDef("x").code("KeyX").setOnClick(onKey),
      new KeyDef("c").code("KeyC").setOnClick(onKey),
      new KeyDef("v").code("KeyV").setOnClick(onKey),
      new KeyDef("b").code("KeyB").setOnClick(onKey),
      new KeyDef("n").code("KeyN").setOnClick(onKey),
      new KeyDef("m").code("KeyM").setOnClick(onKey),
      new KeyDef("Delete").setWidth(2).code("Backspace").setOnClick(onKey),
    ],
    [
      new KeyDef("123...").setOnClick(showNumbers),
      new KeyDef("Position").setImage(SwapVertImage).setOnClick(locationToggle),
      new KeyDef("Shift").code("ShiftLeft").setWidth(2).setOnClick(toggleLeftShift).setIsEnabledCb(leftShiftEnabled),
      new KeyDef("Space").setWidth(2).code("Space").setOnClick(onKey),
      new KeyDef("Shift").code("ShiftRight").setWidth(2).setOnClick(toggleRightShift).setIsEnabledCb(rightShiftEnabled),
      new KeyDef("Enter").setWidth(2).code("Enter").setOnClick(onEnter),
    ],
  ],
  "numbers": [
    [
      new KeyDef("F1").code("F1").setOnClick(onKey),
      new KeyDef("F2").code("F2").setOnClick(onKey),
      new KeyDef("F3").code("F3").setOnClick(onKey),
      new KeyDef("F4").code("F4").setOnClick(onKey),
      new KeyDef("F5").code("F5").setOnClick(onKey),
      new KeyDef("F6").code("F6").setOnClick(onKey),
      new KeyDef("F7").code("F7").setOnClick(onKey),
      new KeyDef("F8").code("F8").setOnClick(onKey),
      new KeyDef("Run/Stop").setWidth(2).code("Escape").setOnClick(onKey),
    ],
    [
      new KeyDef("1").code("Digit1").setOnClick(onKey),
      new KeyDef("2").code("Digit2").setOnClick(onKey),
      new KeyDef("3").code("Digit3").setOnClick(onKey),
      new KeyDef("4").code("Digit4").setOnClick(onKey),
      new KeyDef("5").code("Digit5").setOnClick(onKey),
      new KeyDef("6").code("Digit6").setOnClick(onKey),
      new KeyDef("7").code("Digit7").setOnClick(onKey),
      new KeyDef("8").code("Digit8").setOnClick(onKey),
      new KeyDef("9").code("Digit9").setOnClick(onKey),
      new KeyDef("0").code("Digit0").setOnClick(onKey),
    ],
    [
      new KeyDef("C=").code("ControlLeft").setOnClick(toggleCommodore).setIsEnabledCb(commodoreEnabled),
      new KeyDef("+").code("Minus").setOnClick(onKey),
      new KeyDef("-").code("Equal").setOnClick(onKey),
      new KeyDef("@").code("BracketLeft").setOnClick(onKey),
      new KeyDef(":").code("Semicolon").setOnClick(onKey),
      new KeyDef(";").code("Quote").setOnClick(onKey),
      new KeyDef("Up").setImage(ArrowUpwardImage).code("ArrowUp").setOnClick(onKey),
      new KeyDef(",").code("Comma").setOnClick(onKey),
      new KeyDef(".").code("Period").setOnClick(onKey),
      new KeyDef("/").code("Slash").setOnClick(onKey),
    ],
    [
      new KeyDef("CTRL").code("Tab").setOnClick(toggleControl).setIsEnabledCb(controlEnabled),
      new KeyDef("%&$...").code("\\").setOnClick(showCaps),
      new KeyDef("=").code("Backslash").setOnClick(onKey),
      new KeyDef("*").code("BracketRight").setOnClick(onKey),
      new KeyDef("£").code("Insert").setOnClick(onKey),
      new KeyDef("Left").setImage(ArrowBackImage).code("ArrowLeft").setOnClick(onKey),
      new KeyDef("Down").setImage(ArrowDownwardImage).code("ArrowDown").setOnClick(onKey),
      new KeyDef("Right").setImage(ArrowForwardImage).code("ArrowRight").setOnClick(onKey),
      new KeyDef("Delete").setWidth(2).code("Backspace").setOnClick(onKey),
    ],
    [
      new KeyDef("abc...").setOnClick(showLetters),
      new KeyDef("Position").setImage(SwapVertImage).setOnClick(locationToggle),
      new KeyDef("Shift").code("ShiftLeft").setWidth(2).setOnClick(toggleLeftShift).setIsEnabledCb(leftShiftEnabled),
      new KeyDef("Space").setWidth(2).code("Space").setOnClick(onKey),
      new KeyDef("Shift").code("ShiftRight").setWidth(2).setOnClick(toggleRightShift).setIsEnabledCb(rightShiftEnabled),
      new KeyDef("Enter").setWidth(2).code("Enter").setOnClick(onEnter),
    ],
  ],
  "caps": [
    [
      new KeyDef("F1").code("f1").setOnClick(onKey),
      new KeyDef("F2").code("f2").setOnClick(onKey),
      new KeyDef("F3").code("f3").setOnClick(onKey),
      new KeyDef("F4").code("f4").setOnClick(onKey),
      new KeyDef("F5").code("f5").setOnClick(onKey),
      new KeyDef("F6").code("f6").setOnClick(onKey),
      new KeyDef("F7").code("f7").setOnClick(onKey),
      new KeyDef("F8").code("f8").setOnClick(onKey),
      new KeyDef("Run/Stop").setWidth(2).code("Escape").setOnClick(onKey),
    ],
    [
      new KeyDef("!").code(SHIFT_PREFIX + "Digit1").setOnClick(onKey),
      new KeyDef("\"").code(SHIFT_PREFIX + "Digit2").setOnClick(onKey),
      new KeyDef("#").code(SHIFT_PREFIX + "Digit3").setOnClick(onKey),
      new KeyDef("$").code(SHIFT_PREFIX + "Digit4").setOnClick(onKey),
      new KeyDef("%").code(SHIFT_PREFIX + "Digit5").setOnClick(onKey),
      new KeyDef("&").code(SHIFT_PREFIX + "Digit6").setOnClick(onKey),
      new KeyDef("'").code(SHIFT_PREFIX + "Digit7").setOnClick(onKey),
      new KeyDef("(").code(SHIFT_PREFIX + "Digit8").setOnClick(onKey),
      new KeyDef(")").code(SHIFT_PREFIX + "Digit9").setOnClick(onKey),
      new KeyDef("0").code("Digit0").setOnClick(onKey),
    ],
    [
      new KeyDef("C=").code("ControlLeft").setOnClick(toggleCommodore).setIsEnabledCb(commodoreEnabled),
      new KeyDef("+").code("Minus").setOnClick(onKey),
      new KeyDef("-").code("Equal").setOnClick(onKey),
      new KeyDef("@").code("BracketLeft").setOnClick(onKey),
      new KeyDef("[").code(SHIFT_PREFIX + "Semicolon").setOnClick(onKey),
      new KeyDef("]").code(SHIFT_PREFIX + "Quote").setOnClick(onKey),
      new KeyDef("Up").setImage(ArrowUpwardImage).code("ArrowUp").setOnClick(onKey),
      new KeyDef("<").code(SHIFT_PREFIX + "Comma").setOnClick(onKey),
      new KeyDef(">").code(SHIFT_PREFIX + "Period").setOnClick(onKey),
      new KeyDef("?").code(SHIFT_PREFIX + "Slash").setOnClick(onKey),
    ],
    [
      new KeyDef("CTRL").code("Tab").setOnClick(toggleControl).setIsEnabledCb(controlEnabled),
      new KeyDef("123...").code("\\").setOnClick(showNumbers),
      new KeyDef("←").code("Backquote").setOnClick(onKey),
      new KeyDef("↑").code("Delete").setOnClick(onKey),
      new KeyDef("Home").code("Home").setOnClick(onKey),
      new KeyDef("Left").setImage(ArrowBackImage).code("ArrowLeft").setOnClick(onKey),
      new KeyDef("Down").setImage(ArrowDownwardImage).code("ArrowDown").setOnClick(onKey),
      new KeyDef("Right").setImage(ArrowForwardImage).code("ArrowRight").setOnClick(onKey),
      new KeyDef("Restore").setWidth(2).code("PageUp").setOnClick(onKey),
    ],
    [
      new KeyDef("abc...").setOnClick(showLetters),
      new KeyDef("Position").setImage(SwapVertImage).setOnClick(locationToggle),
      new KeyDef("Shift").code("ShiftLeft").setWidth(2).setOnClick(toggleLeftShift).setIsEnabledCb(leftShiftEnabled),
      new KeyDef("Space").setWidth(2).code("Space").setOnClick(onKey),
      new KeyDef("Shift").code("ShiftRight").setWidth(2).setOnClick(toggleRightShift).setIsEnabledCb(rightShiftEnabled),
      new KeyDef("Enter").setWidth(2).code("Enter").setOnClick(onEnter),
    ],
  ]
}

export { KEYS, onKeyboardClose }