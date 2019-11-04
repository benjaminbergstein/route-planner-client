import React from 'react';

const withTrackEvent = (category) => (Component) =>
  class extends React.Component {
    constructor(props) {
      super(props);

      this.state = {
        gtag: global.gtag,
      };

      this.wrapWithTrackEvent = this.wrapWithTrackEvent.bind(this);
      this.trackEvent = this.trackEvent.bind(this);
    }

    wrapWithTrackEvent(cb, ...args) {
      return (...cbArgs) => {
        this.trackEvent(...args)
        cb(...cbArgs);
      };
    }

    trackEvent({ action, label, value }) {
      const { gtag } = this.state;
      if (gtag) {
        gtag('event', action, {
          event_category: category,
          event_label: label,
          value,
        });
      }
    }

    render() {
      return <Component
        trackEvent={this.trackEvent}
        wrapWithTrackEvent={this.wrapWithTrackEvent}
        {...this.props}
      />
    }
  };

export default withTrackEvent;
