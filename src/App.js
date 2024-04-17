import React, { Fragment } from "react";

import {
  WebrcadeRetroApp
} from '@webrcade/app-common';

import { Emulator } from './emulator';
import { EmulatorPauseScreen } from './pause';
import { VK_TRANSPARENCY } from "./emulator/prefs";
import { TouchOverlay } from "./touchoverlay";
import { Keyboard } from "./keyboard";

import './App.scss';

class App extends WebrcadeRetroApp {

  constructor() {
    super();

    this.state = {
      ...this.state,
      showKeyboard: false,
      kbTransparency: VK_TRANSPARENCY.HIGH,
      kbCloseOnEnter: true
    };
  }

  createEmulator(app, isDebug) {
    return new Emulator(app, isDebug);
  }

  getBiosMap() {
    return {};
  }

  getAlternateBiosMap() {
    return {
      'be09394f0576cf81fa8bacf634daf9a2': 'vice/JiffyDOS_C64.bin',             // JiffyDOS C64 Kernel
      '1b1e985ea5325a1f46eb7fd9681707bf': 'vice/JiffyDOS_1541-II.bin',         // JiffyDOS 1541 drive BIOS
      '41c6cc528e9515ffd0ed9b180f8467c0': 'vice/JiffyDOS_1571_repl310654.bin', // JiffyDOS 1571 drive BIOS
      '20b6885c6dc2d42c38754a365b043d71': 'vice/JiffyDOS_1581.bin',            // JiffyDOS 1581 drive BIOS
    };
  }

  getBiosUrls(appProps) {
    return appProps.commodore8bit_bios ? appProps.commodore8bit_bios : [];
  }

  isDiscBased() {
    return false;
  }

  isMediaBased() {
    return true;
  }

  renderPauseScreen() {
    const { appProps, emulator } = this;

    return (
      <EmulatorPauseScreen
        emulator={emulator}
        appProps={appProps}
        closeCallback={() => this.resume()}
        exitCallback={() => {
          this.exitFromPause();
        }}
        isEditor={this.isEditor}
        isStandalone={this.isStandalone}
      />
    );
  }

  showCanvas() {
    this.setState({showCanvas: true});
  }

  isKeyboardShown() {
    return this.state.showKeyboard;
  }

  setKeyboardShown(value) {
    try {
      // window.Module._emDisableGamepad(value);
    } catch (e) {}
    this.setState({showKeyboard: value})
  }

  setKeyboardTransparency(value) {
    this.setState({kbTransparency: value});
  }

  setKeyboardCloseOnEnter(value) {
    this.setState({kbCloseOnEnter: value});
  }

  render() {
    const { showCanvas, showKeyboard, kbTransparency, kbCloseOnEnter} = this.state;

    return (
      <Fragment>
        {super.render()}
        <TouchOverlay show={showCanvas} />
        <Keyboard
          show={showKeyboard}
          transparency={kbTransparency}
          closeOnEnter={kbCloseOnEnter}
        />
      </Fragment>
    );
  }
}

export default App;
