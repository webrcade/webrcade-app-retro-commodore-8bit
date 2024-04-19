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
    this.mediaList = [];
    this.mediaIndex = 0;
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

  updateSaveStateForSlotProps(slot, props) {
    props.stateName = this.getMediaList()[this.getMediaIndex()].stateName;
  }

  async loadStateForSlot(slot, currentSlot) {
    const stateName = currentSlot.stateName;
    if (stateName) {
      const mediaList = this.getMediaList();
      for (let i = 0; i < mediaList.length; i++) {
        const media = mediaList[i];
        if (media.stateName === stateName) {
          console.log("Loading disk: " + media.path);
          this.setMediaIndex(i, true);
        }
      }
    }

    return await super.loadStateForSlot(slot)
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

  async saveState() {}

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

  getMediaList() {
    return this.mediaList;
  }

  setMediaIndex(index, eject = false) {
    const { Module } = window;
    this.mediaIndex = index;
    const currentMedia = this.mediaList[this.mediaIndex];
    if (index === 0) {
      this.setStateFilePath(currentMedia.statePath);
    }

    if (eject) {
      Module._wrc_set_options(this.OPT12);
    }
  }

  getMediaIndex() {
    return this.mediaIndex;
  }

  getMediaPath() {
    return this.mediaList[this.mediaIndex].path;
  }

  onStoreMedia() {
    const { FS } = window;

    this.mediaList = [];

    for (let i = 0; i < this.media.length; i++) {
      const m = this.media[i];
      const bytes = m[0];
      let name = m[1];

      if (!name) {
        name = "game" + i + ".bin";
      }

      let fileName = "";
      let ext = "";

      const extIdx = name.lastIndexOf(".");
      if (extIdx !== -1) {
        fileName = name.substring(0, extIdx);
        ext = name.substring(extIdx + 1);
      }

      const pstartIdx = fileName.indexOf("(");
      const pendIdx = fileName.lastIndexOf(")");

      let parens = "";
      if (pstartIdx !== -1 && pendIdx !== -1) {
        parens = fileName.substring(pstartIdx, pendIdx + 1);
      }

      const updatedNameNoExt = "game" +
        (parens.length > 0 ? (" " + parens) : "") +
        (fileName.toLowerCase().indexOf("ntsc") !== -1 ? " NTSC" : "") +
        (fileName.toLowerCase().indexOf("pal") !== -1 ? " PAL" : "");

      const updatedName = updatedNameNoExt +
        (ext.length > 0 ? ("." + ext) : "");

      const stateName = updatedNameNoExt + ".state";

      const currentMedia = {
        name: updatedName,
        path: this.RA_DIR + updatedName,
        stateName: stateName,
        statePath: "/home/web_user/retroarch/userdata/states/" + stateName,
        originalName: name,
        shortName: name,
      }

      this.mediaList.push(currentMedia);

      if (i === 0) {
        this.game = currentMedia.path;
        this.setMediaIndex(0);
      }

      let stream = FS.open(currentMedia.path, 'a');
      FS.write(stream, bytes, 0, bytes.length, 0, true);
      FS.close(stream);
    }

    // Determine unique names
    if (this.mediaList.length > 0) {
      const compare = this.mediaList[0].originalName;

      let commonEnd = 0;
      let startParen = -1;
      for (commonEnd = 0; commonEnd < compare.length; commonEnd++) {
        let stop = false;
        for (let i = 0; i < this.mediaList.length; i++) {
          const current = this.mediaList[i].originalName;
          if (commonEnd >= (current.length - 1)) {
            stop = true;
            break;
          }

          if (current[commonEnd] === "(") {
            startParen = commonEnd;
          } else if (current[commonEnd] === ")") {
            startParen = -1;
          }

          if (current[commonEnd] !== compare[commonEnd]) {
            stop = true;
            break;
          }
        }
        if (stop) break;
      }

      for (let i = 0; i < this.mediaList.length; i++) {
        const curr = this.mediaList[i];
        curr.shortName = curr.originalName.substring(startParen !== -1 ? startParen : commonEnd);
        const lastDot = curr.shortName.indexOf(".");
        if (lastDot !== -1) {
          curr.shortName = curr.shortName.substring(0, lastDot);
        }
      }
    }

    console.log(this.mediaList);
  }

  applyGameSettings() {
    const { Module } = window;
    const props = this.getProps();

    console.log(props);

    if (this.swapControllers === null) {
      this.swapControllers = props.swap ? false : true;
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
