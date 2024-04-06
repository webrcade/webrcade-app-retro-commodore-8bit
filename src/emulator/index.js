import {
  DisplayLoop,
  RetroAppWrapper,
} from '@webrcade/app-common';

export class Emulator extends RetroAppWrapper {

  constructor(app, debug = false) {
    super(app, debug);

    this.swapControllers = null;
    window.emulator = this;
  }


  createDisplayLoop(debug) {
    return new DisplayLoop(60 /*this.frameRate*/, true, debug, false, false);
  }

  createAudioProcessor() {
     return null;
  }

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

  async loadState() {
    // // Check cloud storage (eliminate delay when showing settings)
    // try {
    //   await this.getSaveManager().isCloudEnabled(this.loadMessageCallback);
    // } finally {
    //   this.loadMessageCallback(null);
    // }
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
