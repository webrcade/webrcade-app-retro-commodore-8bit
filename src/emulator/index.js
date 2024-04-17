import {
  DisplayLoop,
  RetroAppWrapper,
  SCREEN_CONTROLS,
  LOG,
  // normalizeFileName,
} from '@webrcade/app-common';

import { Prefs } from './prefs'

export class Emulator extends RetroAppWrapper {

  constructor(app, debug = false) {
    super(app, debug);

    window.emulator = this;

    this.keyCode = 0;
    this.swapControllers = null;
    this.touchEvent = false;
    this.mouseEvent = false;
    this.prefs = new Prefs(this);
    this.firstFrame = true;
  }

  getRegion() {
    const props = this.getProps();
    const region = props.region;
    return (region === undefined ? 0 : region);
  }

  setFrameRate(rate) {
    LOG.info("## frame rate set to: " + rate);
    this.frameRate = rate;
  }

  createDisplayLoop(debug) {
    // NTSC can be sync'd at 60, otherwise use framerate and disable sync (for now...)
    if (this.frameRate < 55) {
      return new DisplayLoop(this.frameRate, false, debug, false, false);
    }
    return super.createDisplayLoop(debug);
  }

  isTouchEvent() {
    return this.touchEvent;
  }

  createAudioProcessor() {
     return null;
  }

  createTouchListener() {}

  getScriptUrl() {
    return 'js/vice_x64_libretro.js';
  }

  getPrefs() {
    return this.prefs;
  }

  async saveState() {
  }

  isEscapeHackEnabled() {
    return false;
  }

  onPause(p) {
    const { app } = this;
    if (p) {
      try {
        app.setKeyboardShown(false);
      } catch (e) {}
    }
    super.onPause(p);
  }


  async loadState() {
    // Check cloud storage (eliminate delay when showing settings)
    try {
      await this.getSaveManager().isCloudEnabled(this.loadMessageCallback);
    } finally {
      this.loadMessageCallback(null);
    }
  }

  toggleKeyboard() {
    const { app } = this;
    // console.log('toggle keyboard');

    const show = !app.isKeyboardShown();
    app.setKeyboardShown(show);
    //window.Module._emKeyboard()
  }

  onFrame() {
    if (this.firstFrame) {
      this.firstFrame = false;
      setTimeout(() => {
        const onTouch = () => { this.onTouchEvent() };
        window.addEventListener("touchstart", onTouch);
        window.addEventListener("touchend", onTouch);
        window.addEventListener("touchcancel", onTouch);
        window.addEventListener("touchmove", onTouch);

        const onMouse = () => { this.onMouseEvent() };
        window.addEventListener("mousedown", onMouse);
        window.addEventListener("mouseup", onMouse);
        window.addEventListener("mousemove", onMouse);

        this.app.showCanvas(); // TODO: Where should this go?
      }, 10);
    }
  }

  showTouchOverlay(show) {
    const to = document.getElementById("touch-overlay");
    if (to) {
      to.style.display = show ? 'block' : 'none';
    }
  }

  onTouchEvent() {
    const controls = this.prefs.getScreenControls();

    if (!this.touchEvent) {
      if (controls === SCREEN_CONTROLS.SC_AUTO) {
        setTimeout(() => {
          this.showTouchOverlay(true);
          this.app.forceRefresh();
        }, 0);
      }
      this.touchEvent = true;
    }
  }

  onMouseEvent() {
    const controls = this.prefs.getScreenControls();

    if (!this.mouseEvent) {
      if (controls === SCREEN_CONTROLS.SC_AUTO) {
        setTimeout(() => {
          this.showTouchOverlay(true);
          this.app.forceRefresh();
        }, 0);
      }
      this.mouseEvent = true;
    }

    this.mouseEventCount++;
  }

  updateOnScreenControls(initial = false) {
    const controls = this.prefs.getScreenControls();
    if (controls === SCREEN_CONTROLS.SC_OFF) {
      this.showTouchOverlay(false);
    } else if (controls === SCREEN_CONTROLS.SC_ON) {
      this.showTouchOverlay(true);
    } else if (controls === SCREEN_CONTROLS.SC_AUTO) {
      if (!initial) {
        setTimeout(() => {
          this.showTouchOverlay(this.touchEvent || this.mouseEvent);
          this.app.forceRefresh();
        }, 0);
      }
    }
  }

  updateVkTransparency() {
    const value = this.prefs.getVkTransparency();
    this.app.setKeyboardTransparency(value);
  }

  isJiffyDosEnabled() {
    return this.getProps().jiffydos === 1 ? 0 : 1;
  }

  getSwapControllers() { return this.swapControllers; }

  setSwapControllers(value) {
    if (value === this.swapControllers) return;
    this.swapControllers = value;
    this.applyGameSettings();
  }

  getKeyCode() {
    console.log(this.keyCode)
    console.log("Get key code: " + this.keyCode);
    return this.keyCode;
  }

  sendKeyDown(code) {
    const { Module } = window;
    this.keyCode = code;
    Module._wrc_set_options(this.OPT15);
  }

  sendKeyUp(code) {
    const { Module } = window;
    this.keyCode = code;
    Module._wrc_set_options(this.OPT16);
  }

  applyGameSettings() {
    const { Module } = window;
    const props = this.getProps();

    console.log(props);

    if (this.swapControllers === null) {
      this.swapControllers = props.swap ? true : false;
    }

    let options = 0;
    if (this.swapControllers) {
      options |= this.OPT1;
    }

    Module._wrc_set_options(options);
  }

  isForceAspectRatio() {
    return false;
  }

  getDefaultAspectRatio() {
    return 1.333;
  }

  resizeScreen(canvas) {
    this.canvas = canvas;
    this.updateScreenSize();
  }

  getShotAspectRatio() { return this.getDefaultAspectRatio(); }
}
