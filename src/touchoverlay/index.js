import { Component } from "react";

import {
  ImageButton,
  KeyboardWhiteImage,
  PauseWhiteImage,
  VideoGameAssetWhiteImage,
  VideoGameAssetOffWhiteImage,
} from '@webrcade/app-common';

import './style.scss'

export class TouchOverlay extends Component {
  constructor() {
    super();

    this.state = {
      refresh: 0,
      initialShow: true
    }
  }

  render() {
    const { show } = this.props;
    const { initialShow } = this.state;
    const { emulator } = window;

    if (!emulator || !show) return <></>;

    if (initialShow) {
      this.setState({initialShow: false});
      setTimeout(() => {
        emulator.updateOnScreenControls(true);
      }, 0);
    }

    const app = emulator.app;

    const showPause = () => {
      if (!app.isShowOverlay() && emulator.pause(true)) {
        setTimeout(() => emulator.showPauseMenu(), 50);
      }
    }

    return (
      <div className="touch-overlay" id="touch-overlay">
        <div className="touch-overlay-buttons">
          <div className="touch-overlay-buttons-left"></div>
          <div className="touch-overlay-buttons-center"></div>
          <div className="touch-overlay-buttons-right">
            <ImageButton
              className="touch-overlay-button"
              imgSrc={KeyboardWhiteImage}
              onClick={() => {
                emulator.toggleKeyboard();
              }}
              onFocus={(e) => {e.target.blur()}}
            />
            {emulator.isKeyboardEvent() &&
              <ImageButton
                className="touch-overlay-button"
                imgSrc={emulator.isKeyboardJoystickMode() ? VideoGameAssetWhiteImage : VideoGameAssetOffWhiteImage }
                onClick={() => {
                  emulator.setKeyboardJoystickMode(!emulator.isKeyboardJoystickMode());
                  this.setState({ refresh: this.state.refresh + 1 });
                }}
              />
            }
            <ImageButton
              className="touch-overlay-button touch-overlay-button-last"
              onClick={showPause}
              imgSrc={PauseWhiteImage}
              onFocus={(e) => {e.target.blur()}}
            />
          </div>
        </div>
      </div>
    );
  }
}

