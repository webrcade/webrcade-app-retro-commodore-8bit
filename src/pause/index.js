import React from 'react';
import { Component } from 'react';

import { GamepadControlsTab, KeyboardControlsTab } from './controls';
import { CommodoreSettingsEditor } from './settings';

import {
  CustomPauseScreen,
  EditorScreen,
  GamepadWhiteImage,
  KeyboardWhiteImage,
  Commodore64Background,
  PauseScreenButton,
  Resources,
  SaveStatesEditor,
  SaveWhiteImage,
  SettingsAppWhiteImage,
  TEXT_IDS,
} from '@webrcade/app-common';

export class EmulatorPauseScreen extends Component {
  constructor() {
    super();
    this.state = {
      mode: this.ModeEnum.PAUSE,
    };
  }

  ModeEnum = {
    PAUSE: 'pause',
    CONTROLS: 'controls',
    COMMODORE_SETTINGS: 'commodore-settings',
    STATE: 'state',
  };

  ADDITIONAL_BUTTON_REFS = [React.createRef(), React.createRef(), React.createRef()];

  componentDidMount() {
    const { loaded } = this.state;
    const { emulator } = this.props;

    if (!loaded) {
      let cloudEnabled = false;
      emulator.getSaveManager().isCloudEnabled()
        .then(c => { cloudEnabled = c; })
        .finally(() => {
          this.setState({
            loaded: true,
            cloudEnabled: cloudEnabled
          });
        })
    }
  }

  render() {
    const { ADDITIONAL_BUTTON_REFS, ModeEnum } = this;
    const {
      appProps,
      closeCallback,
      emulator,
      exitCallback,
      isEditor,
      isStandalone,
    } = this.props;
    const { cloudEnabled, loaded, mode } = this.state;

    if (!loaded) {
      return null;
    }

    const additionalButtons = [
      <PauseScreenButton
        imgSrc={GamepadWhiteImage}
        buttonRef={ADDITIONAL_BUTTON_REFS[0]}
        label={Resources.getText(TEXT_IDS.VIEW_CONTROLS)}
        onHandlePad={(focusGrid, e) =>
          focusGrid.moveFocus(e.type, ADDITIONAL_BUTTON_REFS[0])
        }
        onClick={() => {
          this.setState({ mode: ModeEnum.CONTROLS });
        }}
      />
    ];

    additionalButtons.push(
      <PauseScreenButton
        imgSrc={SettingsAppWhiteImage}
        buttonRef={ADDITIONAL_BUTTON_REFS[1]}
        label="C64 Settings"
        onHandlePad={(focusGrid, e) =>
          focusGrid.moveFocus(e.type, ADDITIONAL_BUTTON_REFS[1])
        }
        onClick={() => {
          this.setState({ mode: ModeEnum.COMMODORE_SETTINGS });
        }}
      />
    );

    if (cloudEnabled) {
      additionalButtons.push(
        <PauseScreenButton
          imgSrc={SaveWhiteImage}
          buttonRef={ADDITIONAL_BUTTON_REFS[2]}
          label={Resources.getText(TEXT_IDS.SAVE_STATES)}
          onHandlePad={(focusGrid, e) =>
            focusGrid.moveFocus(e.type, ADDITIONAL_BUTTON_REFS[2])
          }
          onClick={() => {
            this.setState({ mode: ModeEnum.STATE });
          }}
        />
      );
    }

    const gamepad = <GamepadControlsTab emulator={emulator} />;
    const keyboard = <KeyboardControlsTab emulator={emulator} />;
    const gamepadLabel = Resources.getText(TEXT_IDS.GAMEPAD_CONTROLS);
    const keyboardLabel = Resources.getText(TEXT_IDS.KEYBOARD_CONTROLS);

    return (
      <>
        {mode === ModeEnum.PAUSE ? (
          <CustomPauseScreen
            appProps={appProps}
            closeCallback={closeCallback}
            exitCallback={exitCallback}
            isEditor={isEditor}
            isStandalone={isStandalone}
            additionalButtonRefs={ADDITIONAL_BUTTON_REFS}
            additionalButtons={additionalButtons}
          />
        ) : null}
        {mode === ModeEnum.CONTROLS ? (
          <EditorScreen
            onClose={closeCallback}
            tabs={[
              {
                image: GamepadWhiteImage,
                label: gamepadLabel,
                content: gamepad,
              },
              {
                image: KeyboardWhiteImage,
                label: keyboardLabel,
                content: keyboard,
              },
            ]}
          />
        ) : null}
        {mode === ModeEnum.COMMODORE_SETTINGS ? (
          <CommodoreSettingsEditor
            emulator={emulator}
            showOnScreenControls={true}
            onClose={closeCallback}
          />
        ) : null}
        {mode === ModeEnum.STATE ? (
          <SaveStatesEditor
            emptyImageSrc={Commodore64Background}
            emulator={emulator}
            onClose={closeCallback}
            showStatusCallback={emulator.saveMessageCallback}
          />
        ) : null}
      </>
    );
  }
}
