import {
  DisplayLoop,
  RetroAppWrapper,
  Controllers,
  Controller,
  blobToStr,
  md5,
  SCREEN_CONTROLS,
  LOG,
  KCODES,
  CIDS,
  KeyCodeToControlMapping,
} from '@webrcade/app-common';

import { Prefs } from './prefs'
import keycodes from "../keyboard/c64-keymap-positional.json"
import { createEmptyDisk } from './emptydisk';

export class CommodoreKeyCodeToControlMapping extends KeyCodeToControlMapping {
  constructor() {
    super({
      [KCODES.ARROW_UP]: CIDS.UP,
      [KCODES.ARROW_DOWN]: CIDS.DOWN,
      [KCODES.ARROW_RIGHT]: CIDS.RIGHT,
      [KCODES.ARROW_LEFT]: CIDS.LEFT,
      [KCODES.Z]: CIDS.A,
      [KCODES.X]: CIDS.B,
    });
  }
}

export class Emulator extends RetroAppWrapper {

  SAVE_NAME = 'sav';

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
    this.keyboardEvent = false;
    this.keyboardJoystickMode = true;
    this.selectDown = false;
  }

  createControllers() {
    return new Controllers([
      new Controller(new CommodoreKeyCodeToControlMapping()),
      new Controller(),
      new Controller(),
      new Controller(),
    ]);
  }

  pollControls() {
    const { controllers } = this;

    super.pollControls();

    if (!this.paused) {
      if (controllers.isControlDown(0, CIDS.SELECT)) {
        if (this.selectDown) return;
        this.selectDown = true;
        controllers
          .waitUntilControlReleased(0, CIDS.SELECT)
            .then(() => {
              this.toggleKeyboard();
              this.selectDown = false;
            });
      }
    }
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

  isKeyboardJoystickMode() {
    return this.keyboardJoystickMode;
  }

  setKeyboardJoystickMode(val) {
    this.controllers.setKeyboardDisabled(!val);
    return this.keyboardJoystickMode = val;

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

  async getFileContentMd5(content) {
    if (!(content instanceof Blob)) {
      content = new Blob([content]);
    }
    return md5(await blobToStr(content));
  }

  async loadState() {
    const { FS } = window;

    try {
      const saveName = `${this.SAVE_NAME}.zip`;

      // Load from new save format
      const files = await this.getSaveManager().load(
        `${this.saveStatePrefix}${saveName}`,
        this.loadMessageCallback,
      );

      // Cache file hashes
      await this.getSaveManager().checkFilesChanged(files);

      let s = null;
      for (let i = 0; i < files.length; i++) {
        const f = files[i];
        s = f.content;
        if (s) {
          FS.writeFile(this.RA_DIR + f.name, s);
        }
      }
    } catch (e) {
      LOG.error('Error loading save state: ' + e);
    }
  }

  async saveState() {
    const { FS } = window;
    const files = [];
    try {
      const media = this.getMediaList();
      if (!media) return;
      for (let i = 0; i < media.length; i++) {
        const m = media[i];
        try {
          const path = m.path;
          const res = FS.analyzePath(path, true);
          if (res.exists) {
            const s = FS.readFile(path);
            if (s) {
              const md5 = await this.getFileContentMd5(s);
              // Only add if the file is different than the original
              if (md5 !== m.md5) {
                files.push({
                  name: m.name,
                  content: s,
                });
              }
            }
          }
        } catch (e) {
          LOG.error(e);
        }
      }

      console.log(files);

      const hasChanges = await this.getSaveManager().checkFilesChanged(files);
      console.log("Has changes: " + hasChanges);
      if (hasChanges) {
        console.log(`${this.saveStatePrefix}${this.SAVE_NAME}`);
        await this.getSaveManager().save(
          `${this.saveStatePrefix}${this.SAVE_NAME}`,
          files,
          this.saveMessageCallback,
        );
      }
    } catch (e) {
      LOG.error('Error persisting save state: ' + e);
    }
  }

  toggleKeyboard() {
    const { app } = this;

    const show = !app.isKeyboardShown();
    this.disableInput = show ? true : false;
    app.setKeyboardShown(show);
  }

  isKeyboardEvent() {
    return this.keyboardEvent;
  }

  onFrame() {
    if (this.firstFrame) {
      this.firstFrame = false;

      // Initial joystick mode
      this.setKeyboardJoystickMode(this.isKeyboardJoystickMode());

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

        document.onkeydown = (e) => {

          if (
            this.paused ||
            this.app.isKeyboardShown() ||
            (this.isKeyboardJoystickMode() &&
              this.controllers.getController(0).getKeyCodeToControllerMapping().getKeyCodeToControlId()[e.code] !== undefined)
          ) {
            return;
          }
          this.onKeyboardEvent();
          if (e.repeat !== undefined && e.repeat) {
            return;
          }

          const key = keycodes["" + e.code];
          if (key) {
              this.sendKeyDown(key.code)
          }
          e.stopPropagation();
          e.preventDefault();
        }

        document.onkeyup = (e) => {
          if (
            this.paused ||
            this.app.isKeyboardShown() ||
            (this.isKeyboardJoystickMode() &&
              this.controllers.getController(0).getKeyCodeToControllerMapping().getKeyCodeToControlId()[e.code] !== undefined)
          ) {
            return;
          }

          this.onKeyboardEvent();

          const key = keycodes["" + e.code];
          if (key) {
            this.sendKeyUp(key.code)
          }
          e.stopPropagation();
          e.preventDefault();
        }

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

  checkOnScreenControls() {
    const controls = this.prefs.getScreenControls();
    if (controls === SCREEN_CONTROLS.SC_AUTO) {
      setTimeout(() => {
        this.showTouchOverlay(true);
        this.app.forceRefresh();
      }, 0);
    }
  }

  onKeyboardEvent() {
    if (!this.keyboardEvent) {
      this.keyboardEvent = true;
      this.checkOnScreenControls();
    }
  }

  onTouchEvent() {
    if (!this.touchEvent) {
      this.touchEvent = true;
      this.checkOnScreenControls();
    }
  }

  onMouseEvent() {
    if (!this.mouseEvent) {
      this.mouseEvent = true;
      this.checkOnScreenControls();
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

  async onStoreMedia() {
    const { FS } = window;

    this.mediaList = [];
    const saveDisks = this.saveDisks ? this.saveDisks : 0;

    let saveDiskIndex = 0;

    for (let i = 0; i < (this.media.length + saveDisks); i++) {
      const isSaveDisk = (i >= this.media.length);

      const m = this.media[i];
      const bytes = isSaveDisk ? createEmptyDisk(++saveDiskIndex) : m[0];
      let name = isSaveDisk ? ("Save Disk " + (saveDiskIndex)) : m[1];
      let fileName = "";
      let ext = "";
      let updatedName = "";
      let stateName = "";

      if (!isSaveDisk) {
        if (!name) {
          name = "game" + i + ".bin";
        }

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

        const updatedNameNoExt = "game" + i +
          (parens.length > 0 ? (" " + parens) : "") +
          (fileName.toLowerCase().indexOf("ntsc") !== -1 ? " NTSC" : "") +
          (fileName.toLowerCase().indexOf("pal") !== -1 ? " PAL" : "");

        updatedName = updatedNameNoExt +
          (ext.length > 0 ? ("." + ext) : "");

        stateName = updatedNameNoExt + ".state";
      } else {
        updatedName = "savedisk" + saveDiskIndex;
        stateName = updatedName + ".state";
        updatedName += ".d64";
      }

      const currentMedia = {
        name: updatedName,
        md5: await this.getFileContentMd5(bytes),
        path: this.RA_DIR + updatedName,
        stateName: stateName,
        statePath: "/home/web_user/retroarch/userdata/states/" + stateName,
        originalName: name,
        shortName: name,
        isSaveDisk: isSaveDisk,
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
      let uniqueNameCount = 0;
      for (commonEnd = 0; commonEnd < compare.length; commonEnd++) {
        let stop = false;
        for (let i = 1; i < this.mediaList.length; i++) {
          if (this.mediaList[i].isSaveDisk) continue;

          uniqueNameCount++;

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
        if (this.mediaList[i].isSaveDisk) continue;
        const curr = this.mediaList[i];
        curr.shortName = curr.originalName.substring(startParen !== -1 ? startParen : uniqueNameCount > 0 ? commonEnd : 0);
        const lastDot = curr.shortName.indexOf(".");
        if (lastDot !== -1) {
          curr.shortName = curr.shortName.substring(0, lastDot);
        }
      }
    }

    console.log(this.mediaList);
  }

  applyGameSettings() {
    //alert('apply game settings');
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

    if (props.disableAutoload) {
      options |= this.OPT2;
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
