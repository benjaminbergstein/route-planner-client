import React from 'react';

const withBrowser= (Component) =>
  class extends React.Component {
    constructor(props) {
      super(props);
      this.state = {
        isMobileDevice: /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent),
        width: Math.max(document.documentElement.clientWidth, window.innerWidth || 0),
        height: Math.max(document.documentElement.clientHeight, window.innerHeight || 0)
      }
    }

    render() {
      return <Component
        browser={{
          width: this.state.width,
          height: this.state.height,
          isMobileDevice: this.state.isMobileDevice,
        }}
        {...this.props}
      />
    }
  };

export default withBrowser;
