import React from 'react';

const TARGET_MODES = {
  DOUBLE_CLICK: 'double-click',
  DEFAULT: 'default',
};

const INITIAL_STATE = {
  targetCaptured: false,
  targetType: undefined,
  targetData: {},
  target: undefined,
  targetMode: TARGET_MODES.DEFAULT,
};

const getTargetMode = ({ isMobileDevice }) => isMobileDevice ?
  TARGET_MODES.DOUBLE_CLICK : TARGET_MODES.DEFAULT;

const withTarget = (Component) =>
  class extends React.Component {
    constructor(props) {
      super(props);
      const { browser, setDraggingEnabled } = this.props;


      this.state = {
        ...INITIAL_STATE,
        targetMode: getTargetMode(browser),
      };

      this.setDraggingEnabled = setDraggingEnabled;
      this.setTarget = this.setTarget.bind(this);
      this.clearTarget = this.clearTarget.bind(this);
      this.getTargetState = this.getTargetState.bind(this);
    }

    static getDerivedStateFromProps(nextProps, prevState) {
      const { browser } = nextProps;
      return { targetMode: getTargetMode(browser) };
    }

    getTargetState() {
      const { target, targetCaptured } = this.state;

      if (targetCaptured) {
        return 'ready';
      } else if (target) {
        this.setState({ targetCaptured: true });
        return 'waiting';
      } else {
        return false;
      }
    }

    setTarget(targetType, target, targetData, setCaptured) {
      const { targetMode } = this.state;

      if (targetMode !== TARGET_MODES.DOUBLE_CLICK) {
        this.setDraggingEnabled(false);
      }

      this.setState({
        targetCaptured: setCaptured || targetMode === TARGET_MODES.DEFAULT,
        targetType,
        targetData,
        target
      });
    }

    clearTarget() {
      this.setDraggingEnabled(true);
      this.setState(INITIAL_STATE);
    }

    render() {
      return <Component
        getTargetState={this.getTargetState}
        target={this.state.target}
        targetType={this.state.targetType}
        targetMode={this.state.targetMode}
        targetData={this.state.targetData}
        setTarget={this.setTarget}
        clearTarget={this.clearTarget}
        {...this.props}
      />
    }
  };

export default withTarget;
export { TARGET_MODES }
