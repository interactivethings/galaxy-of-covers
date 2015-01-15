var ResizeMixin = {

  getInitialState() {
    return {
      size: null
    };
  },

  getActualSize: function() {
    var node = this.getDOMNode();
    return [node.offsetWidth, node.offsetHeight];
  },

  getSize: function() {
    return this.state.size.slice();
  },

  componentDidMount: function() {
    window.addEventListener('resize', this._windowResized);
    this.componentResized();
  },

  componentDidUpdate: function() {
    this._componentResized();
  },

  componentResized() {
    var size = this.getActualSize();
    this.setState({ size: size });
  },

  _componentResized: function() {
    var changed, size;
    if (!this.isMounted()) {
      return;
    }
    size = this.getActualSize();
    changed = (size[0] !== this.state.size[0] || size[1] !== this.state.size[1]);
    if (changed) {
      this.componentResized();
    }
  },

  _windowResized: function() {
    if (!this.isMounted()) {
      return;
    }
    this.componentResized();
  },

  componentWillUnmount: function() {
    window.removeEventListener('resize', this._windowResized, this);
  }

};


module.exports = ResizeMixin;
