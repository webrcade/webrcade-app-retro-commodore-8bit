import React, { Fragment } from 'react';
import { Component } from 'react';

import {
  AppDisplaySettingsTab,
  EditorScreen,
  FieldsTab,
  FieldRow,
  FieldLabel,
  FieldControl,
  TelevisionWhiteImage,
  GamepadWhiteImage,
  KeyboardWhiteImage,
  // ScreenSizeSelect,
  // ScreenControlsSelect,
  Switch,
  WebrcadeContext,
} from '@webrcade/app-common';
import { VkTransparencySelect } from './vktransparencyselect';
import { DiskSelect } from './diskselect';

export class CommodoreSettingsEditor extends Component {
  constructor() {
    super();
    this.state = {
      tabIndex: null,
      focusGridComps: null,
      values: {},
    };
  }

  componentDidMount() {
    const { emulator } = this.props;

    this.setState({
      values: {
        swapControllers: emulator.getSwapControllers(),
        origBilinearMode: emulator.getPrefs().isBilinearEnabled(),
        bilinearMode: emulator.getPrefs().isBilinearEnabled(),
        origScreenSize: emulator.getPrefs().getScreenSize(),
        screenSize: emulator.getPrefs().getScreenSize(),
        origScreenControls: emulator.getPrefs().getScreenControls(),
        screenControls: emulator.getPrefs().getScreenControls(),
        origVkTransparency: emulator.getPrefs().getVkTransparency(),
        vkTransparency: emulator.getPrefs().getVkTransparency(),
        origMediaIndex: emulator.getMediaIndex(),
        mediaIndex: emulator.getMediaIndex()
        // origVkCloseOnEnter: emulator.getPrefs().getVkCloseOnEnter(),
        // vkCloseOnEnter: emulator.getPrefs().getVkCloseOnEnter(),
      },
    });
  }

  render() {
    const { emulator, onClose, showOnScreenControls } = this.props;
    const { tabIndex, values, focusGridComps } = this.state;

    const setFocusGridComps = (comps) => {
      this.setState({ focusGridComps: comps });
    };

    const setValues = (values) => {
      this.setState({ values: values });
    };

    return (
      <EditorScreen
        showCancel={true}
        onOk={() => {
          let change = false;
          emulator.setSwapControllers(values.swapControllers);
          if (values.origBilinearMode !== values.bilinearMode) {
            emulator.getPrefs().setBilinearEnabled(values.bilinearMode);
            emulator.updateBilinearFilter();
            change = true;
          }
          if (values.origScreenSize !== values.screenSize) {
            emulator.getPrefs().setScreenSize(values.screenSize);
            emulator.updateScreenSize();
            change = true;
          }
          if (values.origScreenControls !== values.screenControls) {
              emulator.getPrefs().setScreenControls(values.screenControls);
              emulator.updateOnScreenControls();
              change = true;
          }
          if (values.origVkTransparency !== values.vkTransparency) {
              emulator.getPrefs().setVkTransparency(values.vkTransparency);
              emulator.updateVkTransparency();
              change = true;
          }

          const newMediaIndex = parseInt(values.mediaIndex);
          if (values.origMediaIndex !== newMediaIndex) {
            emulator.setMediaIndex(newMediaIndex, true);
          }
          // if (values.origVkCloseOnEnter !== values.vkCloseOnEnter) {
          //     emulator.getPrefs().setVkCloseOnEnter(values.vkCloseOnEnter);
          //     emulator.updateVkCloseOnEnter();
          //     change = true;
          // }
          if (change) {
            emulator.getPrefs().save();
          }
          onClose();
        }}
        onClose={onClose}
        focusGridComps={focusGridComps}
        onTabChange={(oldTab, newTab) => this.setState({ tabIndex: newTab })}
        tabs={[
          {
            image: GamepadWhiteImage,
            label: 'C64 Settings (Session only)',
            content: (
              <CommodoreSettingsTab
                emulator={emulator}
                showOnScreenControls={showOnScreenControls}
                isActive={tabIndex === 0}
                setFocusGridComps={setFocusGridComps}
                values={values}
                setValues={setValues}
              />
            ),
          },
          {
            image: TelevisionWhiteImage,
            label: 'Display Settings',
            content: (
              <AppDisplaySettingsTab
                emulator={emulator}
                isActive={tabIndex === 1}
                showOnScreenControls={showOnScreenControls}
                setFocusGridComps={setFocusGridComps}
                values={values}
                setValues={setValues}
              />
            ),
          },
          {
            image: KeyboardWhiteImage,
            label: 'Virtual Keyboard Settings',
            content: (
              <CommodoreVirtualKeyboardTab
                  emulator={emulator}
                  isActive={tabIndex === 2}
                  setFocusGridComps={setFocusGridComps}
                  values={values}
                  setValues={setValues}
              />
            ),
          },
        ]}
      />
    );
  }
}

class CommodoreSettingsTab extends FieldsTab {
  constructor(props) {
    super(props);
    this.swapControllersRef = React.createRef();
    this.mediaRef = React.createRef();
    this.mediaList = props.emulator.getMediaList();
    this.gridComps = [
      [this.swapControllersRef]
    ];

    if (this.mediaList && this.mediaList.length > 1 ) {
      this.gridComps.push(
        [this.mediaRef]
      );
    }
  }

  componentDidUpdate(prevProps, prevState) {
    const { gridComps } = this;
    const { setFocusGridComps } = this.props;
    const { isActive } = this.props;

    if (isActive && isActive !== prevProps.isActive) {
      setFocusGridComps(gridComps);
    }
  }

  render() {
    const { swapControllersRef, mediaRef, mediaList } = this;
    const { focusGrid } = this.context;
    const { setValues, values, emulator } = this.props;

    return (
      <>
        <FieldRow>
          <FieldLabel>Swap Controllers</FieldLabel>
          <FieldControl>
          <Switch
              ref={swapControllersRef}
              onChange={(e) => {
                setValues({
                  ...values,
                  ...{ swapControllers: !e.target.checked},
                })
              }}
              checked={!values.swapControllers}
              onPad={(e) => focusGrid.moveFocus(e.type, swapControllersRef)}
            />
          </FieldControl>
        </FieldRow>
        {mediaList && mediaList.length > 1 && (
          <FieldRow>
            <FieldLabel>Current Media</FieldLabel>
            <FieldControl>
              <DiskSelect
                selectRef={mediaRef}
                emulator={emulator}
                onChange={(value) => {
                  setValues({ ...values, ...{ mediaIndex: value } });
                }}
                value={values.mediaIndex}
                onPad={e => focusGrid.moveFocus(e.type, mediaRef)}
              />
            </FieldControl>
          </FieldRow>
        )}
      </>
    );
  }
}
CommodoreSettingsTab.contextType = WebrcadeContext;

export class CommodoreVirtualKeyboardTab extends FieldsTab {
  constructor() {
      super();
      this.vkTransparencyRef = React.createRef();
      // this.vkCloseOnEnterRef = React.createRef();
      this.gridComps = [
          [this.vkTransparencyRef],
          // [this.vkCloseOnEnterRef],
      ];
  }

  componentDidUpdate(prevProps, prevState) {
      const { gridComps } = this;
      const { setFocusGridComps } = this.props;
      const { isActive } = this.props;

      if (isActive && isActive !== prevProps.isActive) {
          setFocusGridComps(gridComps);
      }
  }

  render() {
      const { vkTransparencyRef, /*vkCloseOnEnterRef*/ } = this;
      const { focusGrid } = this.context;
      const { setValues, values } = this.props;

      return (
          <Fragment>
              <FieldRow>
                  <FieldLabel>Transparency</FieldLabel>
                  <FieldControl>
                      <VkTransparencySelect
                          selectRef={vkTransparencyRef}
                          // addDefault={true}
                          onChange={(value) => {
                              setValues({ ...values, ...{ vkTransparency: value } });
                          }}
                          value={values.vkTransparency}
                          onPad={e => focusGrid.moveFocus(e.type, vkTransparencyRef)}
                      />
                  </FieldControl>
              </FieldRow>
              {/* <FieldRow>
                  <FieldLabel>Close on enter</FieldLabel>
                  <FieldControl>
                      <Switch
                          ref={vkCloseOnEnterRef}
                          onPad={(e) => focusGrid.moveFocus(e.type, vkCloseOnEnterRef)}
                          onChange={(e) => {
                              setValues({ ...values, ...{ vkCloseOnEnter: e.target.checked } });
                          }}
                          checked={values.vkCloseOnEnter}
                      />
                  </FieldControl>
              </FieldRow> */}
          </Fragment>
      );
  }
}
CommodoreVirtualKeyboardTab.contextType = WebrcadeContext;
