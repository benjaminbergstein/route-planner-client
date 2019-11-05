import React from 'react';

const withDragging = (Component) =>
  class extends React.Component {
    constructor(props) {
      super(props);

      this.state = {
        draggingEnabled: true,
      };

      this.setDraggingEnabled= this.setDraggingEnabled.bind(this);
    }

    setDraggingEnabled(draggingEnabled) {
      this.setState({ draggingEnabled });
    }

    render() {
      return <Component
        setDraggingEnabled={this.setDraggingEnabled}
        draggingEnabled={this.state.draggingEnabled}
        {...this.props}
      />
    }
  };

export default withDragging;
