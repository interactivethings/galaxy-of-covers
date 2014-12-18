/**
 * sszvis.js is the visualization library used by Statistik Stadt Zürich.
 * It uses d3.js <http://d3js.org>
 *
 * The following modules are contained within this file:
 *   @VENDOR - various external dependencies
 *   @SSZVIS - the library itself
 *
 * Contact:
 *   Product Owner     - Statistik Stadt Zürich <https://www.stadt-zuerich.ch/statistik>
 *   Technical Contact - Interactive Things <http://interactivethings.com>
 *
 */




////////////////////////////////////////////////////////////////////////////////
//                                                                            //
//  @VENDOR                                                                   //
//                                                                            //
//  External dependencies that need to be available for the                   //
//  to run correctly.                                                         //
//                                                                            //
////////////////////////////////////////////////////////////////////////////////


//////////////////////////////////// SECTION ///////////////////////////////////


(function(d3) {
  'use strict';

  /**
   * d3 plugin to simplify creating reusable charts. Implements
   * the reusable chart interface and can thus be used interchangeably
   * with any other reusable charts.
   *
   * @example
   * var myAxis = d3.component()
   *   .prop('ticks').ticks(10)
   *   .render(function(data, i, j) {
   *     var selection = d3.select(this);
   *     var props = selection.props();
   *     var axis = d3.svg.axis().ticks(props.ticks);
   *     selection.enter()
   *       .append('g')
   *       .call(axis);
   *   })
   * console.log(myAxis.ticks()); //=> 10
   * d3.select('svg').call(myAxis.ticks(3));
   *
   * @see http://bost.ocks.org/mike/chart/
   *
   * @property {function} prop Define a property accessor
   * @property {function} render The chart's body
   *
   * @return {d3.component} A d3 reusable chart
   */
  d3.component = function() {
    var props = {};
    var selectionRenderer = null;
    var renderer = identity;

    /**
     * Constructor
     *
     * @param  {d3.selection} selection Passed in by d3
     */
    function component(selection) {
      if (selectionRenderer) {
        selection.props = function(){ return clone(props); };
        selectionRenderer.apply(selection, slice(arguments));
      }
      selection.each(function() {
        this.__props__ = clone(props);
        renderer.apply(this, slice(arguments));
      });
    }

    /**
     * Define a property accessor with an optional setter
     *
     * @param  {String} prop The property's name
     * @param  {Function} [setter] The setter's context will be bound to the
     *         d3.component. Sets the returned value to the given property
     * @return {d3.component}
     */
    component.prop = function(prop, setter) {
      setter || (setter = identity);
      component[prop] = accessor(props, prop, setter.bind(component)).bind(component);
      return component;
    };

    /**
     * Delegate a properties' accessors to a delegate object
     *
     * @param  {String} prop     The property's name
     * @param  {Object} delegate The target having getter and setter methods for prop
     * @return {d3.component}
     */
    component.delegate = function(prop, delegate) {
      component[prop] = function() {
        var result = delegate[prop].apply(delegate, slice(arguments));
        return (arguments.length === 0) ? result : component;
      };
      return component;
    };

    /**
     * Creates a render context for the given component's parent selection.
     * Use this, when you need full control over the rendering of the component
     * and you need access to the full selection instead of just the selection
     * of one datum.
     *
     * @param  {Function} callback
     * @return {[d3.component]}
     */
    component.renderSelection = function(callback) {
      selectionRenderer = callback;
      return component;
    };

    /**
     * Creates a render context for the given component. Implements the
     * d3.selection.each interface.
     *
     * @see https://github.com/mbostock/d3/wiki/Selections#each
     *
     * @param  {Function} callback
     * @return {d3.component}
     */
    component.render = function(callback) {
      renderer = callback;
      return component;
    };

    return component;
  };

  /**
   * d3.selection plugin to get the properties of a d3.component.
   * Works similarly to d3.selection.data, but for properties.
   *
   * @see https://github.com/mbostock/d3/wiki/Selections
   *
   * @return {Object} An object of properties for the given component
   */
  d3.selection.prototype.props = function() {
    // It would be possible to make this work exactly like
    // d3.selection.data(), but it would need some test cases,
    // so we currently simplify to the most common use-case:
    // getting props.
    if (arguments.length) throw new Error('selection.props() does not accept any arguments');
    if (this.length != 1) throw new Error('only one group is supported');
    if (this[0].length != 1) throw new Error('only one node is supported');

    var group = this[0];
    var node  = group[0];
    return node.__props__ || {};
  };

  /**
   * Creates an accessor function that either gets or sets a value, depending
   * on whether or not it is called with arguments.
   *
   * @param  {Object} props The props to get from or set to
   * @param  {String} attr The property to be accessed
   * @param  {Function} [setter] Transforms the data on set
   * @return {Function} The accessor function
   */
  function accessor(props, prop, setter) {
    setter || (setter = identity);
    return function() {
      if (!arguments.length) return props[prop];

      props[prop] = setter.apply(null, slice(arguments));
      return this;
    };
  }

  function identity(d) {
    return d;
  }

  function slice(array) {
    return Array.prototype.slice.call(array);
  }

  function clone(obj) {
    var copy = {};
    for (var attr in obj) {
      if (obj.hasOwnProperty(attr)) copy[attr] = obj[attr];
    }
    return copy;
  }

}(d3));


//////////////////////////////////// SECTION ///////////////////////////////////


(function(d3) {
  'use strict';

  var localizedFormat = d3.locale({
    'decimal': '.',
    'thousands': ' ',
    'grouping': [3],
    'currency': ['CHF ', ''],
    'dateTime': '%a. %e. %B %X %Y',
    'date': '%d.%m.%Y',
    'time': '%H:%M:%S',
    'periods': [],
    'days': ['Sonntag', 'Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag'],
    'shortDays': ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'],
    'months': ['Januar', 'Februar', 'März', 'April', 'Mai', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'],
    'shortMonths': ['Jan', 'Feb', 'Mär', 'Apr', 'Mai', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dez']
  });
  d3.format = localizedFormat.numberFormat;
  d3.time.format = localizedFormat.timeFormat;

}(d3));


//////////////////////////////////// SECTION ///////////////////////////////////


(function(d3) {
  'use strict';

  /**
   * d3.selection plugin to simplify creating idempotent groups that are not
   * recreated when rendered again.
   *
   * @see https://github.com/mbostock/d3/wiki/Selections
   *
   * @param  {String} key The name of the group
   * @return {d3.selection}
   */
  d3.selection.prototype.selectGroup = function(key) {

    var group = this.selectAll('[data-d3-selectgroup="' + key + '"]')
      .data(function(d){ return [d]; });

    group.enter()
      .append('g')
      .attr('data-d3-selectgroup', key);

    return group;
  };

}(d3));


//////////////////////////////////// SECTION ///////////////////////////////////


(function(d3) {
  'use strict';

  /**
   * d3.selection plugin to simplify creating idempotent divs that are not
   * recreated when rendered again.
   *
   * @see https://github.com/mbostock/d3/wiki/Selections
   *
   * @param {String} key - the name of the group
   * @return {d3.selection}
   */
  d3.selection.prototype.selectDiv = function(key) {
    var div = this.selectAll('[data-d3-selectdiv="' + key + '"]')
      .data(function(d) { return [d]; });

    div.enter()
      .append('div')
      .attr('data-d3-selectdiv', key)
      .style('position', 'absolute');

    return div;
  };

}(d3));


//////////////////////////////////// SECTION ///////////////////////////////////


/**
 * innerHTML property for SVGElement
 * Copyright(c) 2010, Jeff Schiller
 *
 * Licensed under the Apache License, Version 2
 *
 * Works in a SVG document in Chrome 6+, Safari 5+, Firefox 4+ and IE9+.
 * Works in a HTML5 document in Chrome 7+, Firefox 4+ and IE9+.
 * Does not work in Opera since it doesn't support the SVGElement interface yet.
 *
 * I haven't decided on the best name for this property - thus the duplication.
 */

(function() {
'use strict';

var serializeXML = function(node, output) {
  var nodeType = node.nodeType;
  if (nodeType == 3) { // TEXT nodes.
    // Replace special XML characters with their entities.
    output.push(node.textContent.replace(/&/, '&amp;').replace(/</, '&lt;').replace('>', '&gt;'));
  } else if (nodeType == 1) { // ELEMENT nodes.
    // Serialize Element nodes.
    output.push('<', node.tagName);
    if (node.hasAttributes()) {
      var attrMap = node.attributes;
      for (var i = 0, len = attrMap.length; i < len; ++i) {
        var attrNode = attrMap.item(i);
        output.push(' ', attrNode.name, '=\'', attrNode.value, '\'');
      }
    }
    if (node.hasChildNodes()) {
      output.push('>');
      var childNodes = node.childNodes;
      for (var i = 0, len = childNodes.length; i < len; ++i) {
        serializeXML(childNodes.item(i), output);
      }
      output.push('</', node.tagName, '>');
    } else {
      output.push('/>');
    }
  } else if (nodeType == 8) {
    // TODO(codedread): Replace special characters with XML entities?
    output.push('<!--', node.nodeValue, '-->');
  } else {
    // TODO: Handle CDATA nodes.
    // TODO: Handle ENTITY nodes.
    // TODO: Handle DOCUMENT nodes.
    throw 'Error serializing XML. Unhandled node of type: ' + nodeType;
  }
};
// The innerHTML DOM property for SVGElement.
Object.defineProperty(SVGElement.prototype, 'innerHTML', {
  get: function() {
    var output = [];
    var childNode = this.firstChild;
    while (childNode) {
      serializeXML(childNode, output);
      childNode = childNode.nextSibling;
    }
    return output.join('');
  },
  set: function(markupText) {
    // Wipe out the current contents of the element.
    while (this.firstChild) {
      this.removeChild(this.firstChild);
    }

    try {
      // Parse the markup into valid nodes.
      var dXML = new DOMParser();
      dXML.async = false;
      // Wrap the markup into a SVG node to ensure parsing works.
      sXML = '<svg xmlns=\'http://www.w3.org/2000/svg\'>' + markupText + '</svg>';
      var svgDocElement = dXML.parseFromString(sXML, 'text/xml').documentElement;

      // Now take each node, import it and append to this element.
      var childNode = svgDocElement.firstChild;
      while(childNode) {
        this.appendChild(this.ownerDocument.importNode(childNode, true));
        childNode = childNode.nextSibling;
      }
    } catch(e) {
      throw new Error('Error parsing XML string');
    }
  }
});

// The innerSVG DOM property for SVGElement.
Object.defineProperty(SVGElement.prototype, 'innerSVG', {
  get: function() {
    return this.innerHTML;
  },
  set: function(markupText) {
    this.innerHTML = markupText;
  }
});

})();


//////////////////////////////////// SECTION ///////////////////////////////////


(function(global){
  'use strict';

  function isUndefined(value) {
    return typeof value == 'undefined';
  }

  function isPlainObject(value) {
    // this isPlainObject implementation is taken from jQuery ~2.1.2
    // Not plain objects:
    // - Any object or value whose internal [[Class]] property is not '[object Object]'
    // - DOM nodes
    // - window
    if ( value === null || Object.prototype.toString.call(value) !== '[object Object]' || value.nodeType || value === value.window ) {
      return false;
    }

    if ( value.constructor && !Object.prototype.hasOwnProperty.call( value.constructor.prototype, 'isPrototypeOf' ) ) {
      return false;
    }

    // If the function hasn't returned already, we're confident that
    // |value| is a plain object, created by {} or constructed with new Object
    return true;
  }

  function throwNSOverwriteError(nsName, nsTarget) {
    throw new Error('in namespace definition: ' + nsName + ' - attempting to overwrite an existing name: ' + nsTarget);
  }

  function throwNSExtendError(nsName, nsTarget) {
    throw new Error('in namespace definition: ' + nsName + ' - attempting to add properties to a non-module: ' + nsTarget);
  }

  function ensureExtendable(base, target, nsName) {
    if (isUndefined(base[target])) base[target] = {};
    if (!isPlainObject(base[target])) throwNSExtendError(nsName, target);
  }

  function ns_extend(nsname, obj, source) {
    for (var name in source) {
      if (source.hasOwnProperty(name)) {
        if (!isUndefined(obj[name])) throwNSOverwriteError(nsname, name);
        obj[name] = source[name];
      }
    }
    return obj;
  }

  global.sszvis_namespace = function(path, body) {
    var segments = path.split('.');
    var ancestors = segments.slice(0, segments.length - 1);
    var target = segments[segments.length - 1];
    var ns = ancestors.reduce(function(root, part) {
      ensureExtendable(root, part, path);
      return root[part];
    }, global);

    var module = { exports: {} };
    body(module);

    var moduleExports = module.exports;
    if (isPlainObject(moduleExports)) {
      // extend existing module with the values from the returned object
      ensureExtendable(ns, target, path);
      ns_extend(path, ns[target], moduleExports);
    } else {
      // overwrite existing module with the returned value
      if (!isUndefined(ns[target])) throwNSOverwriteError(path, target);
      ns[target] = moduleExports;
    }

    return ns[target];
  };

}(window));




////////////////////////////////////////////////////////////////////////////////
//                                                                            //
//  @SSZVIS                                                                   //
//                                                                            //
//  The main components of the library                                        //
//                                                                            //
////////////////////////////////////////////////////////////////////////////////

if (typeof this.sszvis !== 'undefined') {
  sszvis.logger.warn('sszvis.js has already been defined in this scope. The existing definition will be overwritten.');
  this.sszvis = {};
}


//////////////////////////////////// SECTION ///////////////////////////////////


/**
 * A collection of functional programming helper functions
 *
 * @module sszvis/fn
 */
sszvis_namespace('sszvis.fn', function(module) {
  'use strict';

  module.exports = {
    /**
     * fn.arity
     *
     * Wraps a function of any arity (including nullary) in a function that
     * accepts exactly `n` parameters. Any extraneous parameters will not be
     * passed to the supplied function.
     *
     * @param {number} n The desired arity of the new function.
     * @param {Function} fn The function to wrap.
     * @return {Function} A new function wrapping `fn`. The new function is
     * guaranteed to be of arity `n`.
     */
    arity: function(n, fn) {
      switch (n) {
        case 0: return function() {return fn.call(this);};
        case 1: return function(a0) {return fn.call(this, a0);};
        case 2: return function(a0, a1) {return fn.call(this, a0, a1);};
        case 3: return function(a0, a1, a2) {return fn.call(this, a0, a1, a2);};
        case 4: return function(a0, a1, a2, a3) {return fn.call(this, a0, a1, a2, a3);};
        case 5: return function(a0, a1, a2, a3, a4) {return fn.call(this, a0, a1, a2, a3, a4);};
        case 6: return function(a0, a1, a2, a3, a4, a5) {return fn.call(this, a0, a1, a2, a3, a4, a5);};
        case 7: return function(a0, a1, a2, a3, a4, a5, a6) {return fn.call(this, a0, a1, a2, a3, a4, a5, a6);};
        case 8: return function(a0, a1, a2, a3, a4, a5, a6, a7) {return fn.call(this, a0, a1, a2, a3, a4, a5, a6, a7);};
        case 9: return function(a0, a1, a2, a3, a4, a5, a6, a7, a8) {return fn.call(this, a0, a1, a2, a3, a4, a5, a6, a7, a8);};
        case 10: return function(a0, a1, a2, a3, a4, a5, a6, a7, a8, a9) {return fn.call(this, a0, a1, a2, a3, a4, a5, a6, a7, a8, a9);};
        default: return fn;
      }
    },

    /**
     * fn.compose
     *
     * Returns the composition of a set of functions, in arguments order.
     * For example, if functions F, G, and H are passed as arguments:
     *
     * A = fn.compose(F, G, H)
     *
     * A will be a function which returns F(G(H(...arguments to A...)))
     * so that A(x) === F(G(H(x)))
     *
     * Note: all composed functions but the last should be of arity 1.
     *
     * @param {Function...} ... Accepts any number of functions as arguments
     * @return {Function} returns a function which is the composition of the passed functions
     */
    compose: function() {
      var fns = arguments,
          start = arguments.length - 1;
      return function() {
        var i = start;
        var result = fns[i].apply(this, arguments);
        while (i--) result = fns[i].call(this, result);
        return result;
      };
    },

    /**
     * fn.contains
     *
     * Checks whether an item is present in the given list (by strict equality).
     *
     * @param  {array} list List of items
     * @param  {any}   d    Item that might be in list
     * @return {boolean}
     */
    contains: function(list, d) {
      return list.indexOf(d) >= 0;
    },

    /**
     * fn.defined
     *
     * determines if the passed value is defined.
     *
     * @param  {*} val the value to check
     * @return {Boolean}     true if the value is defined, false if the value is undefined
     */
    defined: function(val) {
      return typeof val !== 'undefined';
    },

    /**
     * fn.derivedSet
     *
     * fn.derivedSet is used to create sets of objects from an input array. The objects are
     * first passed through an accessor function, which should produce a value. The set is calculated
     * using that value, but the actual members of the set are the input objects. This allows you
     * to use .derivedSet to create a group of obejcts, where the values of some derived property
     * of those objects forms a set. This is distinct from other set functions in this toolkit because
     * in the other set functions, the set of derived properties is returned, whereas this function
     * returns a set of objects from the input array.
     *
     * @param  {array} arr        The array of elements from which the set is calculated
     * @param  {function} acc     An accessor function which calculates the set determiner.
     * @return {array}            An array of objects from the input array.
     */
    derivedSet: function(arr, acc) {
      acc || (acc = sszvis.fn.identity);
      var seen = [], sValue, cValue, result = [];
      for (var i = 0, l = arr.length; i < l; ++i) {
        sValue = arr[i];
        cValue = acc(sValue, i, arr);
        if (seen.indexOf(cValue) < 0) {
          seen.push(cValue);
          result.push(sValue);
        }
      }
      return result;
    },

    /**
     * fn.find
     *
     * given a predicate function and a list, returns the first value
     * in the list such that the predicate function returns true
     * when passed that value.
     *
     * @param  {Function} predicate A predicate function to be called on elements in the list
     * @param  {Array} list      An array in which to search for a truthy predicate value
     * @return {*}           the first value in the array for which the predicate returns true.
     */
    find: function(predicate, list) {
      var idx = -1;
      var len = list.length;
      while (++idx < len) {
        if (predicate(list[idx])) return list[idx];
      }
    },

    /**
     * fn.first
     *
     * Returns the first value in the passed array, or undefined if the array is empty
     *
     * @param  {Array} arr an array
     * @return {*}     the first value in the array
     */
    first: function(arr) {
      return arr[0];
    },

    /**
     * fn.hashableSet
     *
     * takes an array of elements and returns the unique elements of that array, optionally
     * after passing them through an accessor function.
     * the returned array is ordered according to the elements' order of appearance
     * in the input array. This function differs from fn.set in that the elements
     * in the input array (or the values returned by the accessor function)
     * MUST be "hashable" - convertible to unique keys of a JavaScript object.
     * As payoff for obeying this restriction, the algorithm can run much faster.
     *
     * @param  {Array} arr the Array of source elements
     * @param {Function} [acc(element, index, array)=(v) -> v] - an accessor function which
     * is called on each element of the Array. Defaults to the identity function.
     * The result is equivalent to calling array.map(acc) before computing the set.
     * When the accessor function is invoked, it is passed the element from the input array,
     * the element's index in the input array, and the input array itself.
     * @return {Array} an Array of unique elements
     */
    hashableSet: function(arr, acc) {
      acc || (acc = sszvis.fn.identity);
      var seen = {}, value, result = [];
      for (var i = 0, l = arr.length; i < l; ++i) {
        value = acc(arr[i], i, arr);
        if (!seen[value]) {
          seen[value] = true;
          result.push(value);
        }
      }
      return result;
    },

    /**
     * fn.identity
     *
     * The identity function. It returns the first argument passed to it.
     * Useful as a default where a function is required.
     *
     * @param  {*} value any value
     * @return {*}       returns its argument
     */
    identity: function(value) {
      return value;
    },

    /**
     * fn.last
     *
     * Returns the last value in the passed array, or undefined if the array is empty
     *
     * @param  {Array} arr an array
     * @return {*}     the last value in the array
     */
    last: function(arr) {
      return arr[arr.length - 1];
    },

    /**
     * fn.not
     *
     * Takes as argument a function f and returns a new function
     * which calls f on its arguments and returns the
     * boolean opposite of f's return value.
     *
     * @param  {Function} f the argument function
     * @return {Function}   a new function which returns the boolean opposite of the argument function
     */
    not: function (f) {
      return function(){ return !f.apply(this, arguments); };
    },

    /**
     * fn.prop
     *
     * takes the name of a property and returns a property accessor function
     * for the named property. When the accessor function is called on an object,
     * it returns that object's value for the named property. (or undefined, if the object
     * does not contain the property.)
     *
     * @param  {String} key the name of the property for which an accessor function is desired
     * @return {Function}     A property-accessor function
     *
     */
    prop: function(key) {
      return function(object) {
        return object[key];
      };
    },

    /**
     * fn.set
     *
     * takes an array of elements and returns the unique elements of that array, optionally
     * after passing them through an accessor function.
     * the returned array is ordered according to the elements' order of appearance
     * in the input array, e.g.:
     *
     * [2,1,1,6,8,6,5,3] -> [2,1,6,8,5,3]
     * ["b", a", "b", "b"] -> ["b", "a"]
     * [{obj1}, {obj2}, {obj1}, {obj3}] -> [{obj1}, {obj2}, {obj3}]
     *
     * @param {Array} arr - the Array of source elements
     * @param {Function} [acc(element, index, array)=(v) -> v] - an accessor function which
     * is called on each element of the Array. Defaults to the identity function.
     * The result is equivalent to calling array.map(acc) before computing the set.
     * When the accessor function is invoked, it is passed the element from the input array,
     * the element's index in the input array, and the input array itself.
     * @return {Array} an Array of unique elements
     */
    set: function(arr, acc) {
      acc || (acc = sszvis.fn.identity);
      return arr.reduce(function(m, value, i) {
        var computed = acc(value, i, arr);
        return m.indexOf(computed) < 0 ? m.concat(computed) : m;
      }, []);
    },

    /**
     * fn.stringEqual
     *
     * Determines whether two values are equal when converted to strings. Useful for comparing
     * date objects, because two different date objects are not considered equal, even if they
     * represent the same date.
     *
     * @param  {any} a        the first value
     * @param  {any} b        the second value
     * @return {boolean}      Whether the provided values are equal when converted to strings.
     */
    stringEqual: function(a, b) {
      return a.toString() === b.toString();
    }

  };

});


//////////////////////////////////// SECTION ///////////////////////////////////


/**
 * Axis component
 *
 * This component is an extension of d3.axis and provides the same interface
 * with some custom additions. It provides good defaults for sszvis charts
 * and helps with some commonly used functionality.
 *
 * @module sszvis/axis
 *
 * The following properties are directly delegated to the d3.axis component.
 * They are documented in the d3 documentation.
 * @see https://github.com/mbostock/d3/wiki/SVG-Axes
 *
 * @property {function} scale         Delegates to d3.axis
 * @property {function} orient        Delegates to d3.axis
 * @property {function} ticks         Delegates to d3.axis
 * @property {function} tickValues    Delegates to d3.axis
 * @property {function} tickSize      Delegates to d3.axis
 * @property {function} innerTickSize Delegates to d3.axis
 * @property {function} outerTickSize Delegates to d3.axis
 * @property {function} tickPadding   Delegates to d3.axis
 * @property {function} tickFormat    Delegates to d3.axis
 *
 * The following properties are custom additions.
 *
 * @property {boolean} alignOuterLabels                 Whether or not to align the outer labels to the axis extent so that they do not fall outside the axis space.
 * @property {boolean} contour                          Specify a 'contour' background for the axis labels.
 * @property {number} hideBorderTickThreshold           Specifies the pixel distance threshold for the visible tick correction. Ticks which are closer than
 *                                                      this threshold to the end of the axis (i.e. a tick which is 1 or two pixels from the end) will be
 *                                                      hidden from view. This prevents the display of a tick very close to the ending line.
 * @property {number} hideLabelThreshold                By default, labels are hidden when they are closer than LABEL_PROXIMITY_THRESHOLD to a highlighted label.
 *                                                      If this value is set to 0 or lower, labels won't be hidden, even if they overlap with the highlighted label.
 * @property {function} highlightTick                   Specifies a predicate function to use to determine whether axis ticks should be highlighted.
 *                                                      Any tick value which returns true for this predicate function will be treated specially as a highlighted tick.
 *                                                      Note that this function does NOT have any effect over which ticks are actually included on the axis. To create special
 *                                                      custom ticks, use tickValues.
 * @property {boolean} showZeroY                        Whether the axis should display a label for at y=0.
 * @property {string} slant                             Specify a label slant for the tick labels. Can be "vertical" - labels are displayed vertically - or
 *                                                      "diagonal" - labels are displayed at a 45 degree angle to the axis.
 * @property {number} textWrap                          Specify a width at which to wrap the axis label text.
 * @property {number, function} tickLength              specify a number or a function which returns a number for setting the tick length.
 * @property {string} title                             Specify a string to use as the title of this chart. Default title position depends on the chart orientation
 * @property {string} titleAnchor                       specify the title text-anchor. Values are 'start', 'middle', and 'end'. Corresponds to the 'text-anchor' svg styling attribute
 *                                                      the default depends on the axis orient property
 * @property {boolean} titleCenter                      whether or not to center the axis title along the axis. If true, this sets the title anchor point
 *                                                      as the midpoint between axis extremes. Should usually be used with titleAnchor('middle') to ensure exact title centering. (default: false)
 * @property {number} dxTitle                           specify an amount by which to offset the title towards the left. This offsets away from the default position. (default: 0)
 * @property {number} dyTitle                           specify an amount by which to offset the title towards the top. This offsets away from the default position. (default: 0)
 * @property {boolean} titleVertical                    whether or not to rotate the title 90 degrees so that it appears vertical, reading from bottom to top. (default: false)
 * @property {boolean} vertical                         whether the axis is a vertical axis. When true, this property changes certain display properties of the axis according to the style guide.
 *
 * @return {d3.component}
 */
sszvis_namespace('sszvis.axis', function(module) {
  'use strict';

  var TICK_PROXIMITY_THRESHOLD = 8;
  var TICK_END_THRESHOLD = 12;
  var LABEL_PROXIMITY_THRESHOLD = 10;

  module.exports = (function() {

    var axis = function() {
      var axisDelegate = d3.svg.axis();

      var axisComponent = d3.component()
        .delegate('scale', axisDelegate)
        .delegate('orient', axisDelegate)
        .delegate('ticks', axisDelegate)
        .delegate('tickValues', axisDelegate)
        .delegate('tickSize', axisDelegate)
        .delegate('innerTickSize', axisDelegate)
        .delegate('outerTickSize', axisDelegate)
        .delegate('tickPadding', axisDelegate)
        .delegate('tickFormat', axisDelegate)
        .prop('alignOuterLabels').alignOuterLabels(false)
        .prop('contour')
        .prop('hideBorderTickThreshold').hideBorderTickThreshold(TICK_PROXIMITY_THRESHOLD)
        .prop('hideLabelThreshold').hideLabelThreshold(LABEL_PROXIMITY_THRESHOLD)
        .prop('highlightTick', d3.functor)
        .prop('showZeroY').showZeroY(false)
        .prop('slant')
        .prop('textWrap')
        .prop('tickLength')
        .prop('title')
        .prop('titleAnchor') // start, end, or middle
        .prop('titleCenter') // a boolean value - whether to center the title
        .prop('dxTitle') // a numeric value for the left offset of the title
        .prop('dyTitle') // a numeric value for the top offset of the title
        .prop('titleVertical')
        .prop('vertical').vertical(false)
        .render(function() {
          var selection = d3.select(this);
          var props = selection.props();

          var isBottom = !props.vertical && axisDelegate.orient() === 'bottom';

          var group = selection.selectGroup('sszvis-axis')
            .classed('sszvis-axis', true)
            .classed('sszvis-axis--top', !props.vertical && axisDelegate.orient() === 'top')
            .classed('sszvis-axis--bottom', isBottom)
            .classed('sszvis-axis--vertical', props.vertical)
            .attr('transform', sszvis.svgUtils.translateString(0, 2))
            .call(axisDelegate);

          var axisScale = axisDelegate.scale();

          // To prevent anti-aliasing on elements that need to be rendered crisply
          // we need to position them on a half-pixel grid: 0.5, 1.5, 2.5, etc.
          // We can't translate the whole .tick group, however, because this
          // leads to weird type rendering artefacts in some browsers. That's
          // why we reach into the group and translate lines onto the half-pixel
          // grid by taking the translation of the group into account.
          group.selectAll('.tick')
            .each(function() {
              var subpixelShift = sszvis.svgUtils.crisp.transformTranslateSubpixelShift(this.getAttribute('transform'));
              var dx = sszvis.svgUtils.crisp.halfPixel(0) - subpixelShift[0];
              var dy = sszvis.svgUtils.crisp.halfPixel(isBottom ? 2 : 0) - subpixelShift[1];
              d3.select(this).select('line')
                .attr('transform', sszvis.svgUtils.translateString(dx, dy));
            });

          // Place axis line on a half-pixel grid to prevent anti-aliasing
          group.selectAll('path.domain')
            .attr('transform', sszvis.svgUtils.translateString(sszvis.svgUtils.crisp.halfPixel(0), sszvis.svgUtils.crisp.halfPixel(0)));


          // hide ticks which are too close to one endpoint
          var rangeExtent = sszvis.scale.range(axisScale);
          group.selectAll('.tick line')
            .each(function(d) {
              var pos = axisScale(d),
                  d3this = d3.select(this);
              d3this
                .classed('hidden', !d3this.classed('sszvis-axis__longtick') && (absDistance(pos, rangeExtent[0]) < props.hideBorderTickThreshold || absDistance(pos, rangeExtent[1]) < props.hideBorderTickThreshold));
            });

          if (sszvis.fn.defined(props.tickLength)) {
            var domainExtent = d3.extent(axisScale.domain());
            var ticks = group.selectAll('.tick')
              .filter(function(d) {
                return !sszvis.fn.stringEqual(d, domainExtent[0]) && !sszvis.fn.stringEqual(d, domainExtent[1]);
              });
            var orientation = axisDelegate.orient();

            var longLinePadding = 2;
            if (orientation === 'left' || orientation === 'right') {
              ticks.selectAll('text').each(function() {
                longLinePadding = Math.max(this.getBoundingClientRect().width, longLinePadding);
              });
              longLinePadding += 2; // a lil' extra on the end
            }

            var lines = ticks.selectAll('line.sszvis-axis__longtick')
              .data([0]);

            if (props.tickLength > longLinePadding) {
              lines.enter().append('line')
                .attr('class', 'sszvis-axis__longtick');

              if (orientation === 'top') {
                lines
                  .attr('y1', longLinePadding)
                  .attr('y2', props.tickLength);
              } else if (orientation === 'bottom') {
                lines
                  .attr('y1', -longLinePadding)
                  .attr('y2', -props.tickLength);
              } else if (orientation === 'left') {
                lines
                  .attr('x1', -longLinePadding)
                  .attr('x2', -props.tickLength);
              } else if (orientation === 'right') {
                lines
                  .attr('x1', longLinePadding)
                  .attr('x2', props.tickLength);
              }
            } else {
              lines.remove();
            }

          }

          if (props.alignOuterLabels) {
            var alignmentBounds = sszvis.scale.range(axisScale);
            var min = alignmentBounds[0];
            var max = alignmentBounds[1];

            group.selectAll('g.tick text')
              .style('text-anchor', function(d) {
                var value = axisScale(d);
                if (absDistance(value, min) < TICK_END_THRESHOLD) {
                  return 'start';
                } else if (absDistance(value, max) < TICK_END_THRESHOLD) {
                  return 'end';
                }
                return 'middle';
              });
          }

          if (sszvis.fn.defined(props.textWrap)) {
            group.selectAll('text')
              .call(sszvis.svgUtils.textWrap, props.textWrap);
          }

          if (props.slant) {
            group.selectAll('text')
              .call(slantLabel[axisDelegate.orient()][props.slant]);
          }

          // Highlight axis labels that return true for props.highlightTick.
          if (props.highlightTick) {
            var activeBounds = [];
            var passiveBounds = [];
            var labels = group.selectAll('.tick text');

            labels
              .classed('hidden', false)
              .classed('active', props.highlightTick);

            // Hide axis labels that overlap with highlighted labels unless
            // the labels are slanted (in which case the bounding boxes overlap)
            if (props.hideLabelThreshold > 0 && !props.slant) {
              labels
                .each(function(d) {
                  // although getBoundingClientRect returns coordinates relative to the window, not the document,
                  // this should still work, since all tick bounds are affected equally by scroll position changes.
                  var bcr = this.getBoundingClientRect();
                  var b = {
                    node: this,
                    bounds: {
                      top: bcr.top,
                      right: bcr.right,
                      bottom: bcr.bottom,
                      left: bcr.left
                    }
                  };
                  if (props.highlightTick(d)) {
                    b.bounds.left -= props.hideLabelThreshold;
                    b.bounds.right += props.hideLabelThreshold;
                    activeBounds.push(b);
                  } else {
                    passiveBounds.push(b);
                  }
                });

              activeBounds.forEach(function(active) {
                passiveBounds.forEach(function(passive) {
                  d3.select(passive.node).classed('hidden', boundsOverlap(passive.bounds, active.bounds));
                });
              });
            }
          }

          if (props.title) {
            var title = group.selectAll('.sszvis-axis__title')
              .data([props.title]);

            title.enter()
              .append('text')
              .classed('sszvis-axis__title', true);

            title.exit().remove();

            title
              .text(function(d) {
                return d;
              })
              .attr('transform', function() {
                var orientation = axisDelegate.orient(),
                  extent = sszvis.scale.range(axisScale),
                  titleProps;

                if (props.titleCenter) {
                  titleProps = {
                    left: orientation === 'left' || orientation === 'right' ? 0 : orientation === 'top' || orientation === 'bottom' ? (extent[0] + extent[1]) / 2 : 0,
                    top: orientation === 'left' || orientation === 'right' ? (extent[0] + extent[1]) / 2 : orientation === 'top' ? 0 : orientation === 'bottom' ? 32 : 0
                  };
                } else {
                  titleProps = {
                    left: orientation === 'left' || orientation === 'right' || orientation === 'top' ? 0 : orientation === 'bottom' ? extent[1] : 0,
                    top: orientation === 'left' || orientation === 'right' || orientation === 'top' ? 0 : orientation === 'bottom' ? 32 : 0
                  };
                }

                titleProps.vertical = !!props.titleVertical;
                titleProps.left += props.dxTitle || 0;
                titleProps.top += props.dyTitle || 0;
                return 'translate(' + (titleProps.left) + ', ' + (titleProps.top) + ') rotate(' + (titleProps.vertical ? '-90' : '0') + ')';
              })
              .style('text-anchor', function() {
                var orientation = axisDelegate.orient();
                if (typeof props.titleAnchor !== 'undefined') {
                  return props.titleAnchor;
                } else if (orientation === 'left') {
                  return 'end';
                } else if (orientation === 'right') {
                  return 'start';
                } else if (orientation === 'top' || orientation === 'bottom') {
                  return 'end';
                }
              });
          }


          /**
           * Add a background to axis labels to make them more readable on
           * colored backgrounds
           */
          if (props.contour && props.slant) {
            sszvis.logger.warn('Can\'t apply contour to slanted labels');
          } else if (props.contour) {
            selection.selectAll('.sszvis-axis .tick').each(function() {
              var g = d3.select(this);
              var textNode = g.select('text').node();
              var textContour = g.select('.sszvis-axis__label-contour');
              if (textContour.empty()) {
                textContour = d3.select(textNode.cloneNode())
                  .classed('sszvis-axis__label-contour', true);
                this.insertBefore(textContour.node(), textNode);
              }
              textContour.text(textNode.textContent);
            });
          }
        });

      axisComponent.__delegate__ = axisDelegate;

      return axisComponent;
    };

    var setOrdinalTicks = function(count) {
      // in this function, the 'this' context should be an sszvis.axis
      var domain = this.scale().domain(),
        values = [],
        step = Math.round(domain.length / count);

      // include the first value
      if (typeof domain[0] !== 'undefined') values.push(domain[0]);
      for (var i = step, l = domain.length; i < l - 1; i += step) {
        if (typeof domain[i] !== 'undefined') values.push(domain[i]);
      }
      // include the last value
      if (typeof domain[domain.length - 1] !== 'undefined') values.push(domain[domain.length - 1]);

      this.tickValues(values);

      return count;
    };

    var axisX = function() {
      return axis()
        .ticks(3)
        .tickSize(4, 6)
        .tickPadding(6)
        .tickFormat(sszvis.fn.arity(1, sszvis.format.number));
    };

    axisX.time = function() {
      return axisX()
        .tickFormat(sszvis.format.axisTimeFormat)
        .alignOuterLabels(true);
    };

    axisX.ordinal = function() {
      return axisX()
        // extend this class a little with a custom implementation of 'ticks'
        // that allows you to set a custom number of ticks,
        // including the first and last value in the ordinal scale
        .prop('ticks', setOrdinalTicks)
        .tickFormat(sszvis.format.text);
    };

    // need to be a little tricky to get the built-in d3.axis to display as if the underlying scale is discontinuous
    axisX.pyramid = function() {
      return axisX()
        .ticks(10)
        .prop('scale', function(s) {
          var extended = s.copy(),
            domain = extended.domain(),
            range = extended.range();

          extended
          // the domain is mirrored - ±domain[1]
            .domain([-domain[1], domain[1]])
            // the range is mirrored – ±range[1]
            .range([range[0] - range[1], range[0] + range[1]]);

          this.__delegate__.scale(extended);
          return extended;
        })
        .tickFormat(function(v) {
          // this tick format means that the axis appears to be divergent around 0
          // when in fact it is -domain[1] -> +domain[1]
          return sszvis.format.number(Math.abs(v));
        });
    };

    var axisY = function() {
      var newAxis = axis()
        .ticks(7)
        .tickSize(0, 0)
        .tickPadding(0)
        .tickFormat(function(d) {
          return 0 === d && !newAxis.showZeroY() ? null : sszvis.format.number(d);
        })
        .vertical(true);
      return newAxis;
    };

    axisY.time = function() {
      return axisY().tickFormat(sszvis.format.axisTimeFormat);
    };

    axisY.ordinal = function() {
      return axisY()
        // add custom 'ticks' function
        .prop('ticks', setOrdinalTicks)
        .tickFormat(sszvis.format.text);
    };

    return {
      x: axisX,
      y: axisY
    };

  }());


  /* Helper functions
  ----------------------------------------------- */

  function absDistance(a, b) {
    return Math.abs(a - b);
  }

  function boundsOverlap(boundsA, boundsB) {
    return !(boundsB.left > boundsA.right ||
      boundsB.right < boundsA.left ||
      boundsB.top > boundsA.bottom ||
      boundsB.bottom < boundsA.top);
  }

  var slantLabel = {
    top: {
      vertical: function(selection) {
        selection.style('text-anchor', 'start')
          .attr('dx', '0em')
          .attr('dy', '0.35em') // vertically-center
          .attr('transform', 'rotate(-90)');
      },
      diagonal: function(selection) {
        selection.style('text-anchor', 'start')
          .attr('dx', '0.1em')
          .attr('dy', '0.1em')
          .attr('transform', 'rotate(-45)');
      }
    },
    bottom: {
      vertical: function(selection) {
        selection.style('text-anchor', 'end')
          .attr('dx', '-1em')
          .attr('dy', '-0.75em')
          .attr('transform', 'rotate(-90)');
      },
      diagonal: function(selection) {
        selection.style('text-anchor', 'end')
          .attr('dx', '-0.8em')
          .attr('dy', '0em')
          .attr('transform', 'rotate(-45)');
      }
    }
  };

});


//////////////////////////////////// SECTION ///////////////////////////////////


/**
 * Bounds
 *
 * Creates a bounds object to help with the construction of d3 charts
 * that follow the d3 margin convention. The result of this function
 * is comsumed by sszvis.createSvgLayer and sszvis.createHtmlLayer.
 *
 * @module sszvis/bounds
 *
 * @see http://bl.ocks.org/mbostock/3019563
 *
 * @property {number} DEFAULT_WIDTH The default width used across all charts
 * @property {number} RATIO The default side length ratio
 *
 * @param  {Object} bounds       Specifies the bounds of a chart area. Valid properties are:
 *                               width: the total width of the chart (default: DEFAULT_WIDTH)
 *                               height: the total height of the chart (default: height / RATIO)
 *                               top: top padding (default: 0)
 *                               left: left padding (default: 1)
 *                               bottom: bottom padding (default: 0)
 *                               right: right padding (default: 1)
 * @return {Object}              The returned object will preserve the properties width and height, or give them default values
 *                               if unspecified. It will also contain 'innerWidth', which is the width minus left and right padding,
 *                               and 'innerHeight', which is the height minus top and bottom padding. And it includes a 'padding' sub-object,
 *                               which contains calculated or default values for top, bottom, left, and right padding.
 */
sszvis_namespace('sszvis.bounds', function(module) {
  'use strict';

  var DEFAULT_WIDTH = 516;
  var RATIO = Math.sqrt(2);

  module.exports = function(bounds) {
    bounds || (bounds = {});
    var padding = {
      top:    either(bounds.top, 0),
      right:  either(bounds.right, 1),
      bottom: either(bounds.bottom, 0),
      left:   either(bounds.left, 1)
    };
    var width   = either(bounds.width, DEFAULT_WIDTH);
    var height  = either(bounds.height, Math.round(width / RATIO) + padding.top + padding.bottom);

    return {
      innerHeight: height - padding.top  - padding.bottom,
      innerWidth:  width  - padding.left - padding.right,
      padding:     padding,
      height:      height,
      width:       width
    };
  };

  module.exports.DEFAULT_WIDTH = DEFAULT_WIDTH;
  module.exports.RATIO = RATIO;


  /* Helper functions
  ----------------------------------------------- */
  function either(val, fallback) {
    return (typeof val === 'undefined') ? fallback : val;
  }

});


//////////////////////////////////// SECTION ///////////////////////////////////


/**
 * Cascade module
 *
 * @module sszvis/cascade
 *
 * sszvis.cascade is a module that can be useful for creating nested data structures.
 * It can be used in similar ways to d3.nest, but should not be conflated with d3.nest,
 * since it provides different behavior.
 *
 * The cascade class is not a data structure. Rather, it is used to create a data structue
 * generator. An instance of the cascade class should be configured to specify the desired
 * characteristics of the resulting data structure, and then applied to a flat array of
 * objects in order to generate the data structure.
 *
 * Fundamental to the cascade class is the concept of "groupBy", which is an operation that
 * transforms a flat array of data into a nested data structure. It does this by
 * passing each value in the flat array through an accessor function, and "groping" those
 * elements based on the return value of that function. Every element in the resulting groups
 * will have produced the same value when passed into the accessor function.
 *
 * For example, if a flat data set contains a number of elements, and some have a value "city = Zurich",
 * while others have a value "city = Basel", performing a groupBy operation on this data set
 * and passing a predicate function which returns the value of the "city" property of these objects
 * will form the objects into groups where all objects in one group have "city = Zurich", and all objects
 * in the other group have "city = Basel".
 *
 * The Cascade module abstracts the concept of "groupBy" on multiple levels, and provides the option
 * to arrange the resultant groups in different ways.
 *
 * There are two options for the form of the resulting groups. (This is where sszvis.cascade
 * diverges in behavior from d3.nest, which offers two options, but they must be the same through
 * the entire data structure):
 *
 * In one version, the groups are formed into a plain Javascript object with key -> value pairs. The keys are
 * the set of results from the grouping function. (In our example, the keys would be "Zurich" and "Basel")
 * In this implementation, the values are each arrays of elements which share the value of the key function.
 * However, these objects may be nested arbitrarily deep. If multiple layers of objects are specified, then the
 * values will themselves be objects with key -> value pairs, and so on. The final layer of objects will have
 * arrays for values, where each element in the arrays is a data object which shares values for all of the specified
 * key properties with the other objects in its array.
 *
 * Alternatively, the input array of objects can be grouped into an array of groups, where the groups
 * contain data values which all share the same value for a certain key property. These, too, can be nested.
 * The sub-groups may be formed as arrays, where each element in the next level is grouped
 * according to the same principle, but with a different key function. Alternatively, the groups may be
 * objects, grouped according to the principle described in the first version. It is up to the user of the
 * class to specify the extent and nature of this nesting. If an array of groups is the last level of the cascade,
 * its values will be arrays of data values.
 *
 * At the base of the cascade, regardless of the types of the levels, will be arrays of data objects. These arrays
 * can also be thought of as containing the leaves of the tree structure.
 *
 * Instances of this class are configured using three methods: "objectBy", "arrayBy", and "sort". They are used by
 * calling the "apply" method, passing a flat array of data objects. The first three methods return the instance
 * to enable method chaining, while "apply" returns the nested data structure.
 *
 * @method objectBy         Takes as argument a predicate function which is called on each element in an input array. The
 *                          return values of this function are used to create an object with key -> value pairs, where the keys
 *                          are the results of the calls to the predicate function and the values are a further layer of the cascade.
 * @method arrayBy          Takes as argument a predicate function which is called on each element in an input array. The
 *                          return values of this function are used to create an array, where each element of the array
 *                          is a further layer of the cascade. arrayBy also takes an optional second parameter, which specifys
 *                          a sorting function. If provided, groups in the resulting array will be sorted by passing the key values
 *                          of the groups through the sorting function. For example, if an alphabetical sort function is passed
 *                          as the second parameter to an arrayBy call in the example above, the resulting array will be sorted
 *                          such that the first group is the one with "city = Basel" and the second group is the one with "city = Zurich".
 *                          The sort function should take the usual form of a function passed to Array.prototype.sort().
 * @method sort             This method specifies a sort function for the very last layer of the cascade, which is always arrays of data objects.
 *                          the sort function passed to this method should accept data objects as values.
 *
 * @returns                 An instance of sszvis.cascade
 */

sszvis_namespace('sszvis.cascade', function(module) {
'use strict';

  function groupBy(data, keyFunc) {
    var group = {}, key;
    for (var i = 0, l = data.length, value; i < l; ++i) {
      value = data[i];
      key = keyFunc(value);
      group[key] ? group[key].push(value) : (group[key] = [value]);
    }
    return group;
  }

  function groupEach(data, func) {
    for (var prop in data) {
      func(data[prop], prop);
    }
  }

  function arrEach(arr, func) {
    for (var i = 0, l = arr.length; i < l; ++i) {
      func(arr[i], i);
    }
  }

  module.exports = function() {
    var cascade = {},
        keys = [],
        sorts = [],
        valuesSort;

    function make(data, depth) {
      if (depth >= keys.length) {
        if (valuesSort) data.sort(valuesSort);
        return data;
      }

      var sorter = sorts[depth];
      var key = keys[depth++];
      var grouped = groupBy(data, key.func);

      if (key.type === 'obj') {
        var obj = {};
        groupEach(grouped, function(value, key) {
          obj[key] = make(value, depth);
        });
        return obj;
      } else if (key.type === 'arr') {
        var arr = [];
        if (sorter) {
          var groupKeys = Object.keys(grouped).sort(sorter);
          arrEach(groupKeys, function(k) {
            arr.push(make(grouped[k], depth));
          });
        } else {
          groupEach(grouped, function(value) {
            arr.push(make(value, depth));
          });
        }
        return arr;
      }
    }

    cascade.apply = function(data) {
      return make(data, 0);
    };

    cascade.objectBy = function(d) {
      keys.push({
        type: 'obj',
        func: d
      });
      return cascade;
    };

    cascade.arrayBy = function(d, sorter) {
      keys.push({
        type: 'arr',
        func: d
      });
      if (sorter) sorts[keys.length - 1] = sorter;
      return cascade;
    };

    cascade.sort = function(d) {
      valuesSort = d;
      return cascade;
    };

    return cascade;
  };

});


//////////////////////////////////// SECTION ///////////////////////////////////


/**
 * Color scales
 *
 * Three kinds of color scales are provided: qualitative, sequential, and
 * diverging. All color scales can be reversed, qualitative color scales
 * can also be brightened or darkened.
 *
 * @module sszvis/color
 *
 *
 * Qualitative color scales
 *
 * @function qual12    The full range of categorical colors
 * @function qual6     Subset of saturated categorical colors
 * @function qual6a    Subset of blue-green categorical colors
 * @function qual6b    Subset of yellow-red categorical colors
 * @method   darken    Instance method to darken all colors. @returns new scale
 * @method   brighten  Instance method to brighten all colors. @returns new scale
 * @method   reverse   Instance method to reverse the color order. @returns new scale
 *
 *
 * Sequential color scales
 *
 * @function seqBlu    Linear color scale from bright to dark blue
 * @function seqRed    Linear color scale from bright to dark red
 * @function seqGrn    Linear color scale from bright to dark green
 * @function seqBrn    Linear color scale from bright to dark brown
 * @method   reverse   Instance method to reverse the color order. @returns new scale
 *
 *
 * Diverging color scales
 *
 * @function divVal    Diverging and valued color scale from red to blue
 * @function divNtr    Diverging and neutral color scale from brown to green
 * @function divValGry Variation of the valued scale with a grey midpoint
 * @function divNtrGry Variation of the neutral scale with a grey midpoint
 * @method   reverse   Instance method to reverse the color order. @returns new scale
 *
 * Grey color scales
 * @function gry       1-color scale for shaded values
 * @function lightGry  1-color scale for shaded backgrounds
 */
sszvis_namespace('sszvis.color', function(module) {
  'use strict';

  /* Constants
  ----------------------------------------------- */
  var LIGHTNESS_STEP = 0.6;

  var QUAL_COLORS = {
    qual12: [
      '#5182B3', '#B8CFE6',
      '#60BF97', '#B8E6D2',
      '#94BF69', '#CFE6B8',
      '#E6CF73', '#FAEBAF',
      '#E67D73', '#F2CEC2',
      '#CC6788', '#E6B7C7'
    ],
    qual6: [
      '#5182B3', '#60BF97',
      '#94BF69', '#E6CF73',
      '#E67D73', '#CC6788'
    ],
    qual6a: [
      '#5182B3', '#B8CFE6',
      '#60BF97', '#B8E6D2',
      '#94BF69', '#CFE6B8'
    ],
    qual6b: [
      '#E6CF73', '#FAEBAF',
      '#E67D73', '#F2CEC2',
      '#CC6788', '#E6B7C7'
    ]
  };

  var SEQ_COLORS = {
    seqBlu: ['#DDE9FE', '#3B76B3', '#343F4D'],
    seqRed: ['#FEECEC', '#CC6171', '#4D353A'],
    seqGrn: ['#D2DFDE', '#4A807C', '#2C3C3F'],
    seqBrn: ['#E9DFD6', '#A67D5A', '#4C3735']
  };

  var DIV_COLORS = {
    divVal:    ['#CC6171', '#FFFFFF', '#3B76B3'],
    divValGry: ['#CC6171', '#F3F3F3', '#3B76B3'],
    divNtr:    ['#A67D5A', '#FFFFFF', '#4A807C'],
    divNtrGry: ['#A67D5A', '#F3F3F3', '#4A807C']
  };

  var GREY_COLORS = {
    gry: ['#D6D6D6'],
    lightGry: ['#FAFAFA']
  };


  /* Scales
  ----------------------------------------------- */
  Object.keys(QUAL_COLORS).forEach(function(key) {
    module.exports[key] = function() {
      var scale = d3.scale.ordinal().range(QUAL_COLORS[key].map(convertLab));
      return decorateOrdinalScale(scale);
    };
  });

  Object.keys(SEQ_COLORS).forEach(function(key) {
    module.exports[key] = function() {
      var scale = d3.scale.linear().range(SEQ_COLORS[key].map(convertLab));
      return decorateLinearScale(scale);
    };
  });

  Object.keys(DIV_COLORS).forEach(function(key) {
    module.exports[key] = function() {
      var scale = d3.scale.linear().range(DIV_COLORS[key].map(convertLab));
      return decorateLinearScale(scale);
    };
  });

  Object.keys(GREY_COLORS).forEach(function(key) {
    module.exports[key] = function() {
      var scale = d3.scale.ordinal().range(GREY_COLORS[key].map(convertLab));
      return decorateLinearScale(scale);
    };
  });

  module.exports.slightlyDarker = function(c) {
    return d3.hsl(c).darker(0.4);
  };

  module.exports.muchDarker = function(c) {
    return d3.hsl(c).darker(0.7);
  };


  /* Scale extensions
  ----------------------------------------------- */
  function decorateOrdinalScale(scale) {
    scale.darker = function(){
      return decorateOrdinalScale(
        scale.copy().range(scale.range().map(func('darker', LIGHTNESS_STEP)))
      );
    };
    scale.brighter = function(){
      return decorateOrdinalScale(
        scale.copy().range(scale.range().map(func('brighter', LIGHTNESS_STEP)))
      );
    };
    scale.reverse = function(){
      return decorateOrdinalScale(
        scale.copy().range(scale.range().reverse())
      );
    };
    return scale;
  }

  function decorateLinearScale(scale) {
    scale = interpolatedColorScale(scale);
    scale.reverse = function(){
      return decorateLinearScale(
        scale.copy().range(scale.range().reverse())
      );
    };
    return scale;
  }

  function interpolatedColorScale(scale) {
    var nativeDomain = scale.domain;
    scale.domain = function(dom) {
      if (arguments.length === 1) {
        var threeDomain = [dom[0], d3.mean(dom), dom[1]];
        return nativeDomain.call(this, threeDomain);
      } else {
        return nativeDomain.apply(this, arguments);
      }
    };
    return scale;
  }


  /* Helper functions
  ----------------------------------------------- */
  function convertLab(d) {
    return d3.lab(d);
  }

  function func(fName) {
    var args = Array.prototype.slice.call(arguments, 1);
    return function(d) {
      return d[fName].apply(d, args);
    };
  }

});


//////////////////////////////////// SECTION ///////////////////////////////////


/**
 * Factory that returns an SVG element appended to the given target selector,
 * ensuring that it is only created once, even when run again.
 *
 * @module sszvis/createSvgLayer
 *
 * @param {string|d3.selection} selector
 * @param {d3.bounds} bounds
 * @param {object} [metadata] Metadata for this chart. Can be one of:
 *   @property {string} metadata.title The chart's title
 *   @property {string} metadata.description A longer description of this chart's content
 *
 * @returns {d3.selection}
 */
sszvis_namespace('sszvis.createSvgLayer', function(module) {
  'use strict';

  module.exports = function(selector, bounds, metadata) {
    var title = metadata.title || '';
    var description = metadata.description || '';

    var root = d3.select(selector);
    var svg = root.selectAll('svg').data([0]);
    var svgEnter = svg.enter().append('svg');

    svgEnter
      .attr('role', 'img')
      .attr('aria-label', title + ' – ' + description);

    svgEnter
      .append('title')
      .text(title);

    svgEnter
      .append('desc')
      .text(description);

    svg
      .attr('height', bounds.height)
      .attr('width',  bounds.width);

    var viewport = svg.selectAll('[data-sszvis-svg-layer]').data([0]);
    viewport.enter().append('g')
      .attr('data-sszvis-svg-layer', '')
      .attr('transform', 'translate(' + (bounds.padding.left) + ',' + (bounds.padding.top) + ')');

    return viewport;
  };

});


//////////////////////////////////// SECTION ///////////////////////////////////


/**
 * Factory that returns an HTML element appended to the given target selector,
 * ensuring that it is only created once, even when run again.
 *
 * @module sszvis/createHtmlLayer
 *
 * @param {string|d3.selection} selector
 * @param {d3.bounds} [bounds]
 *
 * @returns {d3.selection}
 */
sszvis_namespace('sszvis.createHtmlLayer', function(module) {
  'use strict';

  module.exports = function(selector, bounds) {
    bounds || (bounds = sszvis.bounds());

    var root = d3.select(selector);
    root.classed('sszvis-outer-container', true);

    var layer = root.selectAll('[data-sszvis-html-layer]').data([0]);
    layer.enter().append('div')
      .attr('data-sszvis-html-layer', '');

    layer.style({
      position: 'absolute',
      left: bounds.padding.left + 'px',
      top: bounds.padding.top + 'px'
    });

    return layer;
  };

});


//////////////////////////////////// SECTION ///////////////////////////////////


/**
 * Fallback handling
 *
 * Defaults to rendering a fallback image with standard chart proportions.
 *
 * @example
 * if (sszvis.fallback.unsupported()) {
 *   sszvis.fallback.render('#sszvis-chart', {src: '../fallback.png', height: 300});
 *   return;
 * }
 *
 * @module sszvis/fallback
 */
sszvis_namespace('sszvis.fallback', function(module) {
  'use strict';

  module.exports.unsupported = function() {
    var supportsSVG = !!document.createElementNS && !!document.createElementNS('http://www.w3.org/2000/svg', 'svg').createSVGRect;
    return !supportsSVG;
  };

  module.exports.render = function(selector, options) {
    options || (options = {});
    options.src    || (options.src    = 'fallback.png');
    d3.select(selector).append('img')
      .attr('src', options.src);
  };

});


//////////////////////////////////// SECTION ///////////////////////////////////


/**
 * Formatting functions
 *
 * @module sszvis/format
 */
sszvis_namespace('sszvis.format', function(module) {
  'use strict';

  var format = module.exports = {
    /**
     * Format a number as an age
     * @param  {number} d
     * @return {string}
     */
    age: function(d) {
      return String(Math.round(d));
    },

    /**
     * A multi time formatter used by the axis class
     */
    axisTimeFormat: d3.time.format.multi([
      ['.%L', function(d) { return d.getMilliseconds(); }],
      [':%S', function(d) { return d.getSeconds(); }],
      ['%H:%M', function(d) { return d.getMinutes(); }],
      ['%H Uhr', function(d) { return d.getHours(); }],
      ['%a., %d.', function(d) { return d.getDay() && d.getDate() != 1; }],
      ['%e. %b', function(d) { return d.getDate() != 1; }],
      ['%B', function(d) { return d.getMonth(); }],
      ['%Y', function() { return true; }]
    ]),

    /**
     * A month name formatter which gives a capitalized three-letter abbreviation of the German month name.
     */
    month: sszvis.fn.compose(function(m) {
      return m.toUpperCase();
    }, d3.time.format('%b')),

    /**
     * A year formatter for date objects. Gives the date's year.
     */
    year: d3.time.format('%Y'),

    /**
     * Formatter for no label
     * @return {string} the empty string
     */
    none: function() {
      return '';
    },

    /**
     * Format numbers according to the sszvis style guide. The most important
     * rules are:
     *
     * - Thousands separator is a thin space (not a space)
     * - Only apply thousands separator for numbers >= 10000
     * - Decimal places only for significant decimals
     * - No decimal places for numbers >= 10000
     * - One decimal place for numbers >= 100
     * - Two significant decimal places for other numbers
     *
     * @param  {number} d   Number
     * @param  {number} [p] Decimal precision
     * @return {string}     Fully formatted number
     */
    number: function(d, p) {
      var def = sszvis.fn.defined;
      var dAbs = Math.abs(d);
      var natLen = integerPlaces(d);
      var decLen = decimalPlaces(d);

      // NaN
      if (isNaN(d)) {
        return '–';
      }

      // 10250    -> "10 250"
      // 10250.91 -> "10 251"
      else if (dAbs >= 1e4) {
        def(p) || (p = 0);
        return removeTrailingZeroes(d3.format(',.'+ p +'f')(d));
      }

      // 2350     -> "2350"
      // 2350.29  -> "2350.3"
      else if (dAbs >= 100) {
        if (!def(p)) {
          p = (decLen === 0) ? 0 : 1;
        }
        return removeTrailingZeroes(d3.format('.'+ p +'f')(d));
      }

      // 41       -> "41"
      // 41.329   -> "41.33"
      //  1.329   -> "1.33"
      //  0.00034 -> "0.00034"
      else if (dAbs > 0) {
        var f;
        if (!def(p)) {
          p = (decLen === 0) ? 0 : natLen + Math.min(2, decLen);
          f = p > 0 ? 'r' : 'f';
        } else {
          f = 'f';
        }
        return removeTrailingZeroes(d3.format('.'+ p + f)(d));
      }

      //  0       -> "0"
      else {
        return String(0);
      }
    },

    /**
     * Format percentages
     * @param  {number} d A fraction, usually between 0 and 1
     * @return {string}
     */
    percent: function(d) {
      return format.number(d * 100) + ' %';
    },

    /**
     * Default formatter for text
     * @param  {number} d
     * @return {string} Fully formatted text
     */
    text: function(d) {
      return String(d);
    }
  };


  /* Helper functions
  ----------------------------------------------- */
  function decimalPlaces(num) {
    return (String(Math.abs(num)).split('.')[1] || '').length;
  }

  function integerPlaces(num) {
    num = Math.floor(Math.abs(+num));
    return String(num === 0 ? '' : num).length;
  }

  function removeTrailingZeroes(num) {
    return String(num).replace(/([0-9]+)(\.)([0-9]*)0+$/, function(all, nat, dot, dec) {
      if (parseInt(dec) === 0) dec = '';
      return dec.length > 0 ? nat + dot + dec : nat;
    });
  }

});


//////////////////////////////////// SECTION ///////////////////////////////////


/**
 * Handle data load errors in a standardized way
 *
 * @module sszvis/loadError
 *
 * @param  {Error} The error object
 */
sszvis_namespace('sszvis.loadError', function(module) {
  'use strict';

  var RELOAD_MSG = 'Versuchen Sie, die Webseite neu zu laden. Sollte das Problem weiterhin bestehen, nehmen Sie mit uns Kontakt auf.';

  module.exports = function(error) {
    sszvis.logger.error(error);
    if (error.status === 404) {
      alert('Die Daten konnten nicht geladen werden.\n\n' + error.responseURL + '\n\n' + RELOAD_MSG);
    } else {
      alert('Ein Fehler ist aufgetreten und die Visualisierung kann nicht angezeigt werden. ' + RELOAD_MSG);
    }
  };

});


//////////////////////////////////// SECTION ///////////////////////////////////


/**
 *
 * @module sszvis/logger
 *
 * A component for logging development messages and errors
 *
 * This is a custom logger which accomplishes two goals: 1) to clearly identify log messages
 * coming from sszvis, and 2) to smooth out cross-browser inconsistencies in the implementation
 * of various console functions.
 *
 * All log messages should be visible in the developer tools Javascript console for your web browser
 * of choice. For more information on how to access browser developer tools, see the browser documentation.
 *
 * The logger provides three log levels. All logging functions can accept any number of arguments of
 * any type.
 *
 * Examples:
 *
 * Logging general information:
 *
 * sszvis.logger.log('Circle coordinates: ', circle.cx, circle.cy, circle.r);
 *
 * Logging a warning:
 *
 * sszvis.logger.warn('Configuration options are incompatible: ', props.config1(), props.config2());
 *
 * Logging an error:
 *
 * sszvis.logger.error('Component X requires the "abc" property');
 *
 * @method {any...} log        The basic log level, used for informational purposes
 * @method {any...} warn       Logs a warning, which identifies a potential, but not critical problem
 *                             or informs the user about certain implementation issues which may or
 *                             may not require user attention.
 * @method {any...} error      Logs an error. This should be used when something has gone wrong in the
 *                             implementation, or when the API is used in an unsupported manner. An
 *                             error logged in this way is different from an uncaught exception, in that
 *                             it does not force an unexpected termination of code execution. Instead,
 *                             when errors are logged, it is because of a known, and noticed issue, and
 *                             the error message should provide some information towards resolving the
 *                             problem, usually by changing the use of the library. The implementation
 *                             will handle the situation gracefully, and not cause an unexpected termination
 *                             of execution.
 */
sszvis_namespace('sszvis.logger', function(module) {
  'use strict';

  window.console || (window.console = {});

  // Polyfill for console logging
  console.log || (console.log = function() { /* IE8 users get no error messages */ });
  console.warn || (console.warn = function() { console.log.apply(console, arguments); });
  console.error || (console.error = function() { console.log.apply(console, arguments); });

  module.exports = {
    log: logger('log'),
    warn: logger('warn'),
    error: logger('error')
  };

  /* Helper functions
  ----------------------------------------------- */
  function logger(type) {
    return function() {
      if (window.console && window.console[type]) {
        window.console[type](slice(arguments));
      }
    };
  }

  function slice(array) {
    return Array.prototype.slice.call(array);
  }

});


//////////////////////////////////// SECTION ///////////////////////////////////


/**
 * Parsing functions
 *
 * @module sszvis/parse
 */
sszvis_namespace('sszvis.parse', function(module) {
  'use strict';

  var yearParser = d3.time.format('%Y');

  module.exports = {
    /**
     * Parse Swiss date strings
     * @param  {String} d A Swiss date string, e.g. 17.08.2014
     * @return {Date}
     */
    date: function(d) {
      return d3.time.format('%d.%m.%Y').parse(d);
    },

    /**
     * Parse year values
     * @param  {string} d   A string which should be parsed as if it were a year, like "2014"
     * @return {Date}       A javascript date object for the first time in the given year
     */
    year: function(d) {
      return yearParser.parse(d);
    },

    /**
     * Parse untyped input
     * @param  {String} d A value that could be a number
     * @return {Number}   If d is not a number, NaN is returned
     */
    number: function(d) {
      return (d.trim() === '') ? NaN : +d;
    }
  };

});


//////////////////////////////////// SECTION ///////////////////////////////////


/**
 * Patterns module
 *
 * @module sszvis/patterns
 *
 * This module contains svg patterns and pattern helper functions which are used
 * to render important textures for various other components.
 *
 * @method  heatTableMissingValuePattern    The pattern for the missing values in the heat table
 * @method  mapMissingValuePattern          The pattern for the map areas which are missing values. Used by map.js internally
 * @method  mapLakePattern                  The pattern for Lake Zurich in the map component. Used by map.js internally
 * @method  mapLakeFadeGradient             The pattern which provides a gradient, used by the alpha fade pattern,
 *                                          in the Lake Zurich shape. Used by map.js internally
 * @method  mapLakeGradientMask             The pattern which provides a gradient alpha fade for the Lake Zurich shape.
 *                                           It uses the fadeGradient pattern to create an alpha gradient mask. Used by map.js internally
 * @method  dataAreaPattern                 The pattern for the data area texture.
 *
 */
sszvis_namespace('sszvis.patterns', function(module) {
  'use strict';

  module.exports.heatTableMissingValuePattern = function(selection) {
    var rectFill = sszvis.color.lightGry(),
        crossStroke = '#A4A4A4',
        crossStrokeWidth = 0.035,
        cross1 = 0.35,
        cross2 = 0.65;

    selection
      .attr('patternUnits', 'objectBoundingBox')
      .attr('patternContentUnits', 'objectBoundingBox')
      .attr('x', 0)
      .attr('y', 0)
      .attr('width', 1)
      .attr('height', 1);

    selection
      .append('rect')
      .attr('x', 0)
      .attr('y', 0)
      .attr('width', 1)
      .attr('height', 1)
      .attr('fill', rectFill);

    selection
      .append('line')
      .attr('x1', cross1).attr('y1', cross1)
      .attr('x2', cross2).attr('y2', cross2)
      .attr('stroke-width', crossStrokeWidth)
      .attr('stroke', crossStroke);

    selection
      .append('line')
      .attr('x1', cross2).attr('y1', cross1)
      .attr('x2', cross1).attr('y2', cross2)
      .attr('stroke-width', crossStrokeWidth)
      .attr('stroke', crossStroke);
  };

  module.exports.mapMissingValuePattern = function(selection) {
    var pWidth = 14,
        pHeight = 14,
        fillColor = '#FAFAFA',
        lineStroke = '#CCCCCC';

    selection
      .attr('patternUnits', 'userSpaceOnUse')
      .attr('patternContentUnits', 'userSpaceOnUse')
      .attr('x', 0)
      .attr('y', 0)
      .attr('width', pWidth)
      .attr('height', pHeight);

    selection
      .append('rect')
      .attr('x', 0)
      .attr('y', 0)
      .attr('width', pWidth)
      .attr('height', pHeight)
      .attr('fill', fillColor);

    selection
      .append('line')
      .attr('x1', 1).attr('y1', 10)
      .attr('x2', 5).attr('y2', 14)
      .attr('stroke', lineStroke);

    selection
      .append('line')
      .attr('x1', 5).attr('y1', 10)
      .attr('x2', 1).attr('y2', 14)
      .attr('stroke', lineStroke);

    selection
      .append('line')
      .attr('x1', 8).attr('y1', 3)
      .attr('x2', 12).attr('y2', 7)
      .attr('stroke', lineStroke);

    selection
      .append('line')
      .attr('x1', 12).attr('y1', 3)
      .attr('x2', 8).attr('y2', 7)
      .attr('stroke', lineStroke);
  };

  module.exports.mapLakePattern = function(selection) {
    var pWidth = 6;
    var pHeight = 6;
    var offset = 0.5;

    selection
      .attr('patternUnits', 'userSpaceOnUse')
      .attr('patternContentUnits', 'userSpaceOnUse')
      .attr('x', 0)
      .attr('y', 0)
      .attr('width', pWidth)
      .attr('height', pHeight);

    selection
      .append('rect')
      .attr('x', 0)
      .attr('y', 0)
      .attr('width', pWidth)
      .attr('height', pHeight)
      .attr('fill', '#fff');

    selection
      .append('line')
      .attr('x1', 0)
      .attr('y1', pHeight * offset)
      .attr('x2', pWidth * offset)
      .attr('y2', 0)
      .attr('stroke', '#ddd')
      .attr('stroke-linecap', 'square');

    selection
      .append('line')
      .attr('x1', pWidth * offset)
      .attr('y1', pHeight)
      .attr('x2', pWidth)
      .attr('y2', pHeight * offset)
      .attr('stroke', '#ddd')
      .attr('stroke-linecap', 'square');
  };

  module.exports.mapLakeFadeGradient = function(selection) {
    selection
      .attr('x1', 0)
      .attr('y1', 0)
      .attr('x2', 0.55)
      .attr('y2', 1)
      .attr('id', 'lake-fade-gradient');

    selection
      .append('stop')
      .attr('offset', 0.74)
      .attr('stop-color', 'white')
      .attr('stop-opacity', 1);

    selection
      .append('stop')
      .attr('offset', 0.97)
      .attr('stop-color', 'white')
      .attr('stop-opacity', 0);
  };

  module.exports.mapLakeGradientMask = function(selection) {
    selection
      .attr('maskContentUnits', 'objectBoundingBox');

    selection
      .append('rect')
      .attr('fill', 'url(#lake-fade-gradient)')
      .attr('width', 1)
      .attr('height', 1);
  };

  module.exports.dataAreaPattern = function(selection) {
    var pWidth = 6;
    var pHeight = 6;
    var offset = 0.5;

    selection
      .attr('patternUnits', 'userSpaceOnUse')
      .attr('patternContentUnits', 'userSpaceOnUse')
      .attr('x', 0)
      .attr('y', 0)
      .attr('width', pWidth)
      .attr('height', pHeight);

    selection
      .append('line')
      .attr('x1', 0)
      .attr('y1', pHeight * offset)
      .attr('x2', pWidth * offset)
      .attr('y2', 0)
      .attr('stroke', '#e6e6e6')
      .attr('stroke-width', 1.1);

    selection
      .append('line')
      .attr('x1', pWidth * offset)
      .attr('y1', pHeight)
      .attr('x2', pWidth)
      .attr('y2', pHeight * offset)
      .attr('stroke', '#e6e6e6')
      .attr('stroke-width', 1.1);
  };

});


//////////////////////////////////// SECTION ///////////////////////////////////


/**
 * Scale utilities
 *
 * @module sszvis/scale
 */
sszvis_namespace('sszvis.scale', function(module) {
  'use strict';

  /**
   * Scale range
   *
   * Used to determine the extent of a scale's range. Mimics a function found in d3 source code.
   *
   * @param  {array} scale    The scale to be measured
   * @return {array}          The extent of the scale's range. Useful for determining how far
   *                          a scale stretches in its output dimension.
   */
  module.exports.range = function(scale) { // borrowed from d3 source - svg.axis
    return scale.rangeExtent ? scale.rangeExtent() : extent(scale.range());
  };


  /**
   * Helper function
   * Extent
   *
   * Used to determine the extent of an array. Mimics a function found in d3 source code.
   *
   * @param  {array} domain     an array, sorted in either ascending or descending order
   * @return {array}            the extent of the array, with the smaller term first.
   */
  function extent(domain) { // borrowed from d3 source - svg.axis
    var start = domain[0], stop = domain[domain.length - 1];
    return start < stop ? [ start, stop ] : [ stop, start ];
  }

});


//////////////////////////////////// SECTION ///////////////////////////////////


/**
 * Default transition attributes for sszvis
 *
 * @module sszvis/transition
 *
 * Generally speaking, this module is used internally by components which transition the state of the update selection.
 * The module sszvis.transition encapsulates the basic transition attributes used in the app. It is invoked by doing
 * d3.selection().transition().call(sszvis.transition), which applies the transition attributes to the passed transition.
 * transition.fastTransition provides an alternate transition duration for certain situations where the standard duration is
 * too slow.
 */
sszvis_namespace('sszvis.transition', function(module) {
  'use strict';

  var defaultEase = d3.ease('poly-out', 4);

  module.exports = function(transition) {
    transition
      .ease(defaultEase)
      .duration(300);
  };

  module.exports.fastTransition = function(transition) {
    transition
      .ease(defaultEase)
      .duration(50);
  };

  module.exports.slowTransition = function(transition) {
    transition
      .ease(defaultEase)
      .duration(500);
  };

});


//////////////////////////////////// SECTION ///////////////////////////////////


/**
 * Circle annotation
 *
 * A component for creating circular data areas. The component should be passed
 * an array of data values, each of which will be used to render a data area by
 * passing it through the accessor functions. You can specify a caption to display,
 * which can be offset from the center of the data area by specifying dx or dy properties.
 *
 * @module sszvis/annotation/circle
 *
 * @param {number, function} x        The x-position of the center of the data area.
 * @param {number, function} y        The y-position of the center of the data area.
 * @param {number, function} r        The radius of the data area.
 * @param {number, function} dx       The x-offset of the data area caption.
 * @param {number, function} dy       The y-offset of the data area caption.
 * @param {string, function} caption  The caption for the data area. Default position is the center of the circle
 *
 * @returns {d3.component} a circular data area component
 */
sszvis_namespace('sszvis.annotation.circle', function(module) {
  'use strict';

  module.exports = function() {
    return d3.component()
      .prop('x', d3.functor)
      .prop('y', d3.functor)
      .prop('r', d3.functor)
      .prop('dx', d3.functor)
      .prop('dy', d3.functor)
      .prop('caption', d3.functor)
      .render(function(data) {
        var selection = d3.select(this);
        var props = selection.props();

        sszvis.svgUtils.ensureDefsElement(selection, 'pattern', 'data-area-pattern')
          .call(sszvis.patterns.dataAreaPattern);

        var dataArea = selection.selectAll('.sszvis-dataareacircle')
          .data(data);

        dataArea.enter()
          .append('circle')
          .classed('sszvis-dataareacircle', true);

        dataArea
          .attr('cx', props.x)
          .attr('cy', props.y)
          .attr('r', props.r)
          .attr('fill', 'url(#data-area-pattern)');

        if (props.caption) {
          var dataCaptions = selection.selectAll('.sszvis-dataareacircle__caption')
            .data(data);

          dataCaptions.enter()
            .append('text')
            .classed('sszvis-dataareacircle__caption', true);

          dataCaptions
            .attr('x', props.x)
            .attr('y', props.y)
            .attr('dx', props.dx)
            .attr('dy', props.dy)
            .text(props.caption);
        }
      });
  };

});


//////////////////////////////////// SECTION ///////////////////////////////////


/**
 * Line annotation
 *
 * A component for creating reference line data areas. The component should be passed
 * an array of data values, each of which will be used to render a reference line
 * by passing it through the accessor functions. You can specify a caption to display,
 * which will be positioned by default at the midpoint of the line you specify,
 * aligned with the angle of the line. The caption can be offset from the midpoint
 * by specifying dx or dy properties.
 *
 * @module sszvis/annotation/line
 *
 * @param {any} x1             The x-value, in data units, of the first reference line point.
 * @param {any} x2             The x-value, in data units, of the second reference line point.
 * @param {any} y1             The y-value, in data units, of the first reference line point.
 * @param {any} y2             The y-value, in data units, of the second reference line point.
 * @param {function} xScale         The x-scale of the chart. Used to transform the given x- values into chart coordinates.
 * @param {function} yScale         The y-scale of the chart. Used to transform the given y- values into chart coordinates.
 * @param {number} [dx]           The x-offset of the caption
 * @param {number} [dy]           The y-offset of the caption
 * @param {string} [caption]      A reference line caption. (default position is centered at the midpoint of the line, aligned with the slope angle of the line)
 * @returns {d3.component} a linear data area component (reference line)
 */
sszvis_namespace('sszvis.annotation.line', function(module) {
  'use strict';

  // reference line specified in the form y = mx + b
  // user supplies m and b
  // default line is y = x

  module.exports = function() {
    return d3.component()
      .prop('x1')
      .prop('x2')
      .prop('y1')
      .prop('y2')
      .prop('xScale')
      .prop('yScale')
      .prop('dx', d3.functor).dx(0)
      .prop('dy', d3.functor).dy(0)
      .prop('caption', d3.functor)
      .render(function(data) {
        var selection = d3.select(this);
        var props = selection.props();

        var x1 = props.xScale(props.x1);
        var y1 = props.yScale(props.y1);
        var x2 = props.xScale(props.x2);
        var y2 = props.yScale(props.y2);

        var line = selection.selectAll('.sszvis-referenceline')
          .data(data);

        line.enter()
          .append('line')
          .classed('sszvis-referenceline', true);

        line.exit().remove();

        line
          .attr('x1', x1)
          .attr('y1', y1)
          .attr('x2', x2)
          .attr('y2', y2);

        if (props.caption) {
          var caption = selection.selectAll('.sszvis-referenceline__caption')
            .data([0]);

          caption.enter()
            .append('text')
            .classed('sszvis-referenceline__caption', true);

          caption.exit().remove();

          caption
            .attr('transform', function() {
              var vx = x2 - x1;
              var vy = y2 - y1;
              var angle = Math.atan2(vy, vx) * 180 / Math.PI;
              var rotation;
              if (angle > 0) {
                // in top half
                rotation = angle < 90 ? -angle : angle;
              } else {
                // in bottom semicircle
                rotation = angle > -90 ? -angle : angle; // display angle math is weird
              }
              return 'translate(' + ((x1 + x2) / 2) + ',' + ((y1 + y2) / 2) + ') rotate(' + (angle) + ')';
            })
            .attr('dx', props.dx)
            .attr('dy', props.dy)
            .text(props.caption);
        }
      });
  };

});


//////////////////////////////////// SECTION ///////////////////////////////////


/**
 * RangeRuler annotation
 *
 * The range ruler is similar to the handle ruler and the ruler, except for each data
 * point which it finds bound to its layer, it generates two small dots, and a label which
 * states the value of the data point. For an example, see the interactive stacked area charts.
 * Note that the interactive stacked area charts also include the rangeFlag component for highlighting
 * certain specific dots. This is a sepearate component.
 *
 * @module sszvis/annotation/rangeRuler
 *
 * @property {number functor} x            A function for the x-position of the ruler.
 * @property {number functor} y0           A function for the y-position of the lower dot. Called for each datum.
 * @property {number functor} y1           A function for the y-position of the upper dot. Called for each datum.
 * @property {number} top                  A number for the y-position of the top of the ruler
 * @property {number} bottom               A number for the y-position of the bottom of the ruler
 * @property {string functor} label        A function which generates labels for each range.
 * @property {number} total                A number to display as the total of the range ruler (at the top)
 * @property {boolean functor} flip        Determines whether the rangeRuler labels should be flipped (they default to the right side)
 *
 * @return {d3.component}
 */
sszvis_namespace('sszvis.annotation.rangeRuler', function(module) {
  'use strict';

  module.exports = function() {
    return d3.component()
      .prop('x', d3.functor)
      .prop('y0', d3.functor)
      .prop('y1', d3.functor)
      .prop('top')
      .prop('bottom')
      .prop('label').label(d3.functor(''))
      .prop('total')
      .prop('flip', d3.functor).flip(false)
      .render(function(data) {
        var selection = d3.select(this);
        var props = selection.props();

        var crispX = sszvis.fn.compose(sszvis.svgUtils.crisp.halfPixel, props.x);
        var crispY0 = sszvis.fn.compose(sszvis.svgUtils.crisp.halfPixel, props.y0);
        var crispY1 = sszvis.fn.compose(sszvis.svgUtils.crisp.halfPixel, props.y1);
        var middleY = function(d) {
          return sszvis.svgUtils.crisp.halfPixel((props.y0(d) + props.y1(d)) / 2);
        };

        var dotRadius = 1.5;

        var line = selection.selectAll('.sszvis-rangeRuler__rule')
          .data([0]);

        line.enter()
          .append('line')
          .classed('sszvis-rangeRuler__rule', true);

        line.exit().remove();

        line
          .attr('x1', crispX)
          .attr('y1', props.top)
          .attr('x2', crispX)
          .attr('y2', props.bottom);

        var marks = selection.selectAll('.sszvis-rangeRuler--mark')
          .data(data);

        var enteringMarks = marks.enter()
          .append('g')
          .classed('sszvis-rangeRuler--mark', true);

        marks.exit().remove();

        enteringMarks.append('circle').classed('sszvis-rangeRuler__p1', true);
        enteringMarks.append('circle').classed('sszvis-rangeRuler__p2', true);
        enteringMarks.append('text').classed('sszvis-rangeRuler__label', true);

        marks.selectAll('.sszvis-rangeRuler__p1')
          .data(function(d) { return [d]; })
          .attr('cx', crispX)
          .attr('cy', crispY0)
          .attr('r', dotRadius);

        marks.selectAll('.sszvis-rangeRuler__p2')
          .data(function(d) { return [d]; })
          .attr('cx', crispX)
          .attr('cy', crispY1)
          .attr('r', dotRadius);

        marks.selectAll('.sszvis-rangeRuler__label')
          .data(function(d) { return [d]; })
          .attr('x', function(d) {
            var offset = props.flip(d) ? -10 : 10;
            return crispX(d) + offset;
          })
          .attr('y', middleY)
          .attr('dy', '0.35em') // vertically-center
          .style('text-anchor', function(d) {
            return props.flip(d) ? 'end' : 'start';
          })
          .text(sszvis.fn.compose(sszvis.format.number, props.label));

        var total = selection.selectAll('.sszvis-rangeRuler__total')
          .data([sszvis.fn.last(data)]);

        total.enter()
          .append('text')
          .classed('sszvis-rangeRuler__total', true);

        total.exit().remove();

        total
          .attr('x', function(d) {
            var offset = props.flip(d) ? -10 : 10;
            return crispX(d) + offset;
          })
          .attr('y', props.top - 10)
          .style('text-anchor', function(d) {
            return props.flip(d) ? 'end' : 'start';
          })
          .text('Total ' + sszvis.format.number(props.total));
      });
  };

});


//////////////////////////////////// SECTION ///////////////////////////////////


/**
 * Range Flag annotation
 *
 * The range flag component creates a pair of small white circles which fit well with the range ruler.
 * However, this is a separate component for implementation reasons, because the data for the range flag
 * should usually be only one value, distinct from the range ruler which expects multiple values. The range
 * flag also creates a tooltip anchor between the two dots, to which you can attach a tooltip. See the
 * interactive stacked area chart examples for a use of the range flag.
 *
 * @module sszvis/annotation/rangeFlag
 *
 * @property {number functor} x           A value for the x-value of the range flag
 * @property {number functor} y0          A value for the y-value of the lower range flag dot
 * @property {number functor} y1          A value for the y-value of the upper range flag dot
 *
 * @returns {d3.component}
 */
sszvis_namespace('sszvis.annotation.rangeFlag', function(module) {
  'use strict';

  module.exports = function() {
    return d3.component()
      .prop('x', d3.functor)
      .prop('y0', d3.functor)
      .prop('y1', d3.functor)
      .render(function(data) {
        var selection = d3.select(this);
        var props = selection.props();

        var crispX = sszvis.fn.compose(sszvis.svgUtils.crisp.halfPixel, props.x);
        var crispY0 = sszvis.fn.compose(sszvis.svgUtils.crisp.halfPixel, props.y0);
        var crispY1 = sszvis.fn.compose(sszvis.svgUtils.crisp.halfPixel, props.y1);

        var bottomDot = selection.selectAll('.sszvis-rangeFlag__mark.bottom')
          .data(data);

        var topDot = selection.selectAll('.sszvis-rangeFlag__mark.top')
          .data(data);

        bottomDot
          .call(makeFlagDot)
          .classed('bottom', true)
          .attr('cx', crispX)
          .attr('cy', crispY0);

        topDot
          .call(makeFlagDot)
          .classed('top', true)
          .attr('cx', crispX)
          .attr('cy', crispY1);

        var tooltipAnchor = sszvis.annotation.tooltipAnchor()
          .position(function(d) {
            return [crispX(d), sszvis.svgUtils.crisp.halfPixel((props.y0(d) + props.y1(d)) / 2)];
          });

        selection.call(tooltipAnchor);
      });
  };

  function makeFlagDot(dot) {
    dot.enter()
      .append('circle')
      .attr('class', 'sszvis-rangeFlag__mark');

    dot.exit().remove();

    dot
      .attr('r', 3.5);
  }

});


//////////////////////////////////// SECTION ///////////////////////////////////


/**
 * Rectangle annotation
 *
 * A component for creating rectangular data areas. The component should be passed
 * an array of data values, each of which will be used to render a data area by
 * passing it through the accessor functions. You can specify a caption to display,
 * which can be offset from the center of the data area by specifying dx or dy properties.
 *
 * @module sszvis/annotation/rectangle
 *
 * @param {number, function} x        The x-position of the upper left corner of the data area.
 * @param {number, function} y        The y-position of the upper left corner of the data area.
 * @param {number, function} width    The width of the data area.
 * @param {number, function} height   The height of the data area.
 * @param {number, function} dx       The x-offset of the data area caption.
 * @param {number, function} dy       The y-offset of the data area caption.
 * @param {string, function} caption  The caption for the data area.
 *
 * @returns {d3.component} a rectangular data area component
 */
sszvis_namespace('sszvis.annotation.rectangle', function(module) {
  'use strict';

  module.exports = function() {
    return d3.component()
      .prop('x', d3.functor)
      .prop('y', d3.functor)
      .prop('width', d3.functor)
      .prop('height', d3.functor)
      .prop('dx', d3.functor)
      .prop('dy', d3.functor)
      .prop('caption', d3.functor)
      .render(function(data) {
        var selection = d3.select(this);
        var props = selection.props();

        sszvis.svgUtils.ensureDefsElement(selection, 'pattern', 'data-area-pattern')
          .call(sszvis.patterns.dataAreaPattern);

        var dataArea = selection.selectAll('.sszvis-dataarearectangle')
          .data(data);

        dataArea.enter()
          .append('rect')
          .classed('sszvis-dataarearectangle', true);

        dataArea
          .attr('x', props.x)
          .attr('y', props.y)
          .attr('width', props.width)
          .attr('height', props.height)
          .attr('fill', 'url(#data-area-pattern)');

        if (props.caption) {
          var dataCaptions = selection.selectAll('.sszvis-dataarearectangle__caption')
            .data(data);

          dataCaptions.enter()
            .append('text')
            .classed('sszvis-dataarearectangle__caption', true);

          dataCaptions
            .attr('x', function(d, i) {
              return props.x(d, i) + props.width(d, i) / 2;
            })
            .attr('y', function(d, i) {
              return props.y(d, i) + props.height(d, i) / 2;
            })
            .attr('dx', props.dx)
            .attr('dy', props.dy)
            .text(props.caption);
        }
      });
  };

});


//////////////////////////////////// SECTION ///////////////////////////////////


/**
 * Ruler annotation
 *
 * The ruler component can be used to create a vertical line which highlights data at a certain
 * x-value, for instance in a line chart or area chart. The ruler expects data to be bound to
 * the layer it renders into, and it will generate a small dot for each data point it finds.
 *
 * @module sszvis/annotation/ruler
 *
 * @property {number} top                 A number which is the y-position of the top of the ruler line
 * @property {number} bottom              A number which is the y-position of the bottom of the ruler line
 * @property {function} x                 A number or function returning a number for the x-position of the ruler line.
 * @property {function} y                 A function for determining the y-position of the ruler dots. Should take a data
 *                                        value as an argument and return a y-position.
 * @property {function} label             A function for determining the labels of the ruler dots. Should take a
 *                                        data value as argument and return a label.
 * @property {string, function} color     A string or function to specify the color of the ruler dots.
 * @property {function} flip              A boolean or function which returns a boolean that specifies
 *                                        whether the labels on the ruler dots should be flipped. (they default to the right side)
 *
 * @return {d3.component}
 */
sszvis_namespace('sszvis.annotation.ruler', function(module) {
  'use strict';

  module.exports = function() {

    return d3.component()
      .prop('top')
      .prop('bottom')
      .prop('x', d3.functor)
      .prop('y', d3.functor)
      .prop('label').label(d3.functor(''))
      .prop('color')
      .prop('flip', d3.functor).flip(false)
      .render(function(data) {
        var selection = d3.select(this);
        var props = selection.props();

        var key = function(d) {
          return props.x(d) + '_' + props.y(d);
        };

        var ruler = selection.selectAll('.sszvis-ruler__rule')
          .data(data, key);

        ruler.enter()
          .append('line')
          .classed('sszvis-ruler__rule', true);

        ruler
          .attr('x1', sszvis.fn.compose(sszvis.svgUtils.crisp.halfPixel, props.x))
          .attr('y1', props.y)
          .attr('x2', sszvis.fn.compose(sszvis.svgUtils.crisp.halfPixel, props.x))
          .attr('y2', props.bottom);

        ruler.exit().remove();

        var dot = selection.selectAll('.sszvis-ruler__dot')
          .data(data, key);

        dot.enter()
          .append('circle')
          .classed('sszvis-ruler__dot', true);

        dot
          .attr('cx', sszvis.fn.compose(sszvis.svgUtils.crisp.halfPixel, props.x))
          .attr('cy', sszvis.fn.compose(sszvis.svgUtils.crisp.halfPixel, props.y))
          .attr('r', 3.5)
          .attr('fill', props.color);

        dot.exit().remove();


        var labelOutline = selection.selectAll('.sszvis-ruler__label-outline')
          .data(data, key);

        labelOutline.enter()
          .append('text')
          .classed('sszvis-ruler__label-outline', true);

        labelOutline.exit().remove();


        var label = selection.selectAll('.sszvis-ruler__label')
          .data(data, key);

        label.enter()
          .append('text')
          .classed('sszvis-ruler__label', true);

        label.exit().remove();


        // Update both labelOutline and labelOutline selections

        selection.selectAll('.sszvis-ruler__label, .sszvis-ruler__label-outline')
          .attr('transform', function(d) {
            var x = sszvis.fn.compose(sszvis.svgUtils.crisp.halfPixel, props.x)(d);
            var y = sszvis.fn.compose(sszvis.svgUtils.crisp.halfPixel, props.y)(d);

            var dx = props.flip(d) ? -10 : 10;
            var dy = (y < props.top + dy) ? 2 * dy
                   : (y > props.bottom - dy) ? 0
                   : 5;

            return sszvis.svgUtils.translateString(x + dx, y + dy);
          })
          .style('text-anchor', function(d) {
            return props.flip(d) ? 'end' : 'start';
          })
          .html(props.label);

      });
  };

});


//////////////////////////////////// SECTION ///////////////////////////////////


/**
 * Tooltip annotation
 *
 * Use this component to add a tooltip to the document. The tooltip component should be
 * called on a selection of [data-tooltip-anchor], which contain the information necessary to
 * position the tooltip and provide it with data. The tooltip's visibility should be toggled
 * using the .visible property, passing a predicate function. Tooltips will be displayed
 * when .visible returns true.
 *
 * @module sszvis/annotation/tooltip
 *
 * @property {seletion} renderInto      Provide a selection container into which to render the tooltip.
 *                                      Unlike most other components, the tooltip isn't rendered directly into the selection
 *                                      on which it is called. Instead, it's rendered into whichever selection is
 *                                      passed to the renderInto option
 * @property {function} visible         Provide a predicate function which accepts a datum and determines whether the associated
 *                                      tooltip should be visible. (default: false)
 * @property {function} header          A function accepting a datum. The result becomes the header of the tooltip.
 *                                      This function can return:
 *                                      - a plain string
 *                                      - an HTML string to be used as innerHTML
 * @property {function} body            A function accepting a datum. The result becomes the body of the tooltip.
 *                                      This function can return:
 *                                      - a plain string
 *                                      - an HTML string to be used as innerHTML
 *                                      - an array of arrays, which produces a tabular layout where each
 *                                      sub-array is one row in the table.
 * @property {function} orientation     A string or function returning a string which determines the orientation. This determines
 *                                      which direction the tooltip sits relative to its point.
 *                                      Possible values are: "bottom" (points down), "top" (points upward), "left" (points left), and "right" (points right).
 *                                      Default is "bottom".
 * @property {number} dx                A number for the x-offset of the tooltip
 * @property {number} dy                A number for the y-offset of the tooltip
 * @property {function} opacity         A function or number which determines the opacity of the tooltip. Default is 1.
 *
 * @return {d3.component}
 */
sszvis_namespace('sszvis.annotation.tooltip', function(module) {
  'use strict';

  /* Configuration
  ----------------------------------------------- */
  var SMALL_CORNER_RADIUS = 3;
  var LARGE_CORNER_RADIUS = 4;
  var TIP_SIZE = 6;
  var BLUR_PADDING = 5;


  /* Exported module
  ----------------------------------------------- */
  module.exports = function() {

    var renderer = tooltipRenderer();

    return d3.component()
      .delegate('header', renderer)
      .delegate('body', renderer)
      .delegate('orientation', renderer)
      .delegate('dx', renderer)
      .delegate('dy', renderer)
      .delegate('opacity', renderer)
      .prop('renderInto')
      .prop('visible', d3.functor).visible(false)
      .renderSelection(function(selection) {
        var props = selection.props();

        var tooltipData = [];
        selection.each(function(d) {
          var thisBCR = this.getBoundingClientRect();
          var intoBCR = props.renderInto.node().getBoundingClientRect();
          var pos = [thisBCR.left - intoBCR.left, thisBCR.top - intoBCR.top];
          if (props.visible(d)) {
            tooltipData.push({
              datum: d,
              x: pos[0],
              y: pos[1]
            });
          }
        });

        props.renderInto
          .datum(tooltipData)
          .call(renderer);
      });
  };


  /**
   * Tooltip renderer
   * @private
   */
  var tooltipRenderer = function() {
    return d3.component()
      .prop('header')
      .prop('body')
      .prop('orientation', d3.functor).orientation('bottom')
      .prop('dx').dx(1)
      .prop('dy').dy(1)
      .prop('opacity', d3.functor).opacity(1)
      .renderSelection(function(selection) {
        var tooltipData = selection.datum();
        var props = selection.props();

        var isDef = sszvis.fn.defined;
        var isSmall = (
          isDef(props.header) && !isDef(props.body)) || (!isDef(props.header) && isDef(props.body)
        );


        // Select tooltip elements

        var tooltip = selection.selectAll('.sszvis-tooltip')
          .data(tooltipData);

        tooltip.exit().remove();


        // Enter: tooltip

        var enterTooltip = tooltip.enter()
          .append('div');

        tooltip
          .style('pointer-events', 'none')
          .style('opacity', props.opacity)
          .style('padding-top', function(d) {
            return (props.orientation(d) === 'top') ? TIP_SIZE + 'px' : null;
          })
          .style('padding-right', function(d) {
            return (props.orientation(d) === 'right') ? TIP_SIZE + 'px' : null;
          })
          .style('padding-bottom', function(d) {
            return (props.orientation(d) === 'bottom') ? TIP_SIZE + 'px' : null;
          })
          .style('padding-left', function(d) {
            return (props.orientation(d) === 'left') ? TIP_SIZE + 'px' : null;
          })
          .classed('sszvis-tooltip', true);


        // Enter: tooltip background

        var enterBackground = enterTooltip.append('svg')
          .attr('class', 'sszvis-tooltip__background')
          .attr('height', 0)
          .attr('width', 0);

        var enterBackgroundPath = enterBackground.append('path');

        if (supportsSVGFilters()) {
          var filter = enterBackground.append('filter')
            .attr('id', 'sszvisTooltipShadowFilter')
            .attr('height', '150%');

          filter.append('feGaussianBlur')
            .attr('in', 'SourceAlpha')
            .attr('stdDeviation', 2);

          filter.append('feComponentTransfer')
            .append('feFuncA')
            .attr('type', 'linear')
            .attr('slope', 0.2);

          var merge = filter.append('feMerge');
          merge.append('feMergeNode'); // Contains the blurred image
          merge.append('feMergeNode')  // Contains the element that the filter is applied to
            .attr('in', 'SourceGraphic');

          enterBackgroundPath
            .attr('filter', 'url(#sszvisTooltipShadowFilter)');
        } else {
          enterBackground.classed('sszvis-tooltip__background--fallback', true);
        }


        // Enter: tooltip content

        var enterContent = enterTooltip.append('div')
          .classed('sszvis-tooltip__content', true);

        enterContent.append('div')
          .classed('sszvis-tooltip__header', true);

        enterContent.append('div')
          .classed('sszvis-tooltip__body', true);


        // Update: content

        tooltip.select('.sszvis-tooltip__header')
          .datum(sszvis.fn.prop('datum'))
          .html(props.header || d3.functor(''));

        tooltip.select('.sszvis-tooltip__body')
          .datum(sszvis.fn.prop('datum'))
          .html(function(d) {
            var body = props.body ? d3.functor(props.body)(d) : '';
            return Array.isArray(body) ? formatTable(body) : body;
          });

        selection.selectAll('.sszvis-tooltip')
          .classed('sszvis-tooltip--small', isSmall)
          .each(function(d) {
            var tip = d3.select(this);
            // only using dimensions.width and dimensions.height here. Not affected by scroll position
            var dimensions = tip.node().getBoundingClientRect();
            var orientation = props.orientation.apply(this, arguments);


            // Position tooltip element

            switch (orientation) {
              case 'top':
                tip.style({
                  left: (d.x - this.offsetWidth / 2) + 'px',
                  top:  d.y + props.dy + 'px'
                });
                break;
              case 'bottom':
                tip.style({
                  left: (d.x - this.offsetWidth / 2) + 'px',
                  top:  (d.y - props.dy - this.offsetHeight) + 'px'
                });
                break;
              case 'left':
                tip.style({
                  left: d.x + props.dx + 'px',
                  top:  (d.y - this.offsetHeight / 2) + 'px'
                });
                break;
              case 'right':
                tip.style({
                  left: (d.x - props.dx - this.offsetWidth) + 'px',
                  top:  (d.y - this.offsetHeight / 2) + 'px'
                });
                break;
            }


            // Position background element

            var bgHeight = dimensions.height + 2 * BLUR_PADDING;
            var bgWidth =  dimensions.width  + 2 * BLUR_PADDING;
            tip.select('.sszvis-tooltip__background')
              .attr('height', bgHeight)
              .attr('width',  bgWidth)
              .style('left', -BLUR_PADDING + 'px')
              .style('top',  -BLUR_PADDING + 'px')
              .select('path')
                .attr('d', tooltipBackgroundGenerator(
                  [BLUR_PADDING, BLUR_PADDING],
                  [bgWidth - BLUR_PADDING, bgHeight - BLUR_PADDING],
                  orientation,
                  isSmall ? SMALL_CORNER_RADIUS : LARGE_CORNER_RADIUS
                ));
          });
      });
  };


  /**
   * formatTable
   */
  function formatTable(rows) {
    var tableBody = rows.map(function(row) {
      return '<tr>' + row.map(function(cell) {
        return '<td>' + cell + '</td>';
      }).join('') + '</tr>';
    }).join('');
    return '<table class="sszvis-tooltip__body__table">' + tableBody + '</table>';
  }


  /**
   * Tooltip background generator
   *
   * Generates a path description with a tip on the specified side.
   *
   *           top
   *         ________
   *   left |        | right
   *        |___  ___|
   *            \/
   *          bottom
   *
   * @param  {Vector} a           Top-left corner of the tooltip rectangle (x, y)
   * @param  {Vector} b           Bottom-right corner of the tooltip rectangle (x, y)
   * @param  {String} orientation The tip will point in this direction (top, right, bottom, left)
   *
   * @return {Path}               SVG path description
   */
  function tooltipBackgroundGenerator(a, b, orientation, radius) {
    switch (orientation) {
      case 'top':
        a[1] = a[1] + TIP_SIZE;
        break;
      case 'bottom':
        b[1] = b[1] - TIP_SIZE;
        break;
      case 'left':
        a[0] = a[0] + TIP_SIZE;
        break;
      case 'right':
        b[0] = b[0] - TIP_SIZE;
        break;
    }

    function x(d){ return d[0]; }
    function y(d){ return d[1]; }
    function side(cx, cy, x0, y0, x1, y1, showTip) {
      var mx = x0 + (x1 - x0) / 2;
      var my = y0 + (y1 - y0) / 2;

      var corner = ['Q', cx, cy, x0, y0];

      var tip = [];
      if (showTip && y0 === y1) {
        if (x0 < x1) {
          // Top
          tip = [
            'L', mx - TIP_SIZE, my,
            'L', mx,            my - TIP_SIZE,
            'L', mx + TIP_SIZE, my
          ];
        } else {
          // Bottom
          tip = [
            'L', mx + TIP_SIZE, my,
            'L', mx,            my + TIP_SIZE,
            'L', mx - TIP_SIZE, my
          ];
        }
      } else if (showTip && x0 === x1) {
        if (y0 < y1) {
          // Right
          tip = [
            'L', mx,            my - TIP_SIZE,
            'L', mx + TIP_SIZE, my,
            'L', mx,            my + TIP_SIZE
          ];
        } else {
          // Left
          tip = [
            'L', mx,            my + TIP_SIZE,
            'L', mx - TIP_SIZE, my,
            'L', mx,            my - TIP_SIZE
          ];
        }
      }

      var end = ['L', x1, y1];

      return [].concat(corner, tip, end);
    }

    return [
      // Start
      ['M', x(a), y(a) + radius],
      // Top side
      side(x(a), y(a), x(a) + radius, y(a), x(b) - radius, y(a), (orientation === 'top')),
      // Right side
      side(x(b), y(a), x(b), y(a) + radius, x(b), y(b) - radius, (orientation === 'right')),
      // Bottom side
      side(x(b), y(b), x(b) -radius, y(b), x(a) + radius, y(b), (orientation === 'bottom')),
      // Left side
      side(x(a), y(b), x(a), y(b) - radius, x(a), y(a) + radius, (orientation === 'left'))
    ].map(function(d){ return d.join(' '); }).join(' ');
  }


  /**
   * Detect whether the current browser supports SVG filters
   */
  function supportsSVGFilters() {
    return window['SVGFEColorMatrixElement'] !== undefined &&
           SVGFEColorMatrixElement.SVG_FECOLORMATRIX_TYPE_SATURATE == 2;
  }

});


//////////////////////////////////// SECTION ///////////////////////////////////


/**
 * Tooltip anchor annotation
 *
 * Tooltip anchors are invisible SVG <rect>s that each component needs to
 * provide. Because they are real elements we can know their exact position
 * on the page without any calculations and even if the parent element has
 * been transformed. These elements need to be <rect>s because some browsers
 * don't calculate positon information for the better suited <g> elements.
 *
 * Tooltips can be bound to by selecting for the tooltip data attribute.
 *
 * @module sszvis/annotation/tooltipAnchor
 *
 * @example
 * var tooltip = sszvis.annotation.tooltip();
 * bars.selectAll('[data-tooltip-anchor]').call(tooltip);
 *
 * Tooltips use HTML5 data attributes to clarify their intent, which is not
 * to style an element but to provide an anchor that can be selected using
 * Javascript.
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/Guide/HTML/Using_data_attributes
 * @see https://developer.mozilla.org/en-US/docs/Web/CSS/Attribute_selectors
 *
 * To add a tooltip anchor to an element, create a new tooltip anchor function
 * and call it on a selection. This is usually the same selection that you have
 * added the visible elements of your chart to, e.g. the selection that you
 * render bar <rect>s into.
 *
 * @example
 * var tooltipAnchor = sszvis.annotation.tooltipAnchor()
 *   .position(function(d) {
 *     return [xScale(d), yScale(d)];
 *   });
 * selection.call(tooltipAnchor);
 *
 * @property {function} position A vector of the tooltip's [x, y] coordinates
 * @property {boolean}  debug    Renders a visible tooltip anchor when true
 *
 * @return {d3.component}
 */
sszvis_namespace('sszvis.annotation.tooltipAnchor', function(module) {
  'use strict';

  module.exports = function() {

    return d3.component()
      .prop('position').position(d3.functor([0, 0]))
      .prop('debug')
      .render(function(data) {
        var selection = d3.select(this);
        var props = selection.props();

        var anchor = selection.selectAll('[data-tooltip-anchor]')
          .data(data);


        // Enter

        anchor.enter()
          .append('rect')
          .attr('height', 1)
          .attr('width', 1)
          .attr('fill', 'none')
          .attr('stroke', 'none')
          .attr('visibility', 'none')
          .attr('data-tooltip-anchor', '');


        // Update

        anchor
          .style('pointer-events', 'none')
          .attr('transform', sszvis.fn.compose(vectorToTranslateString, props.position));


        // Exit

        anchor.exit().remove();


        // Visible anchor if debug is true
        if (props.debug) {
          var referencePoint = selection.selectAll('[data-tooltip-anchor-debug]')
            .data(data);

          referencePoint.enter()
            .append('circle')
            .attr('data-tooltip-anchor-debug', '');

          referencePoint
            .attr('r', 2)
            .attr('fill', '#fff')
            .attr('stroke', '#f00')
            .attr('stroke-width', 1.5)
            .attr('transform', sszvis.fn.compose(vectorToTranslateString, props.position));

          referencePoint.exit().remove();
        }

      });


    /* Helper functions
    ----------------------------------------------- */
    function vectorToTranslateString(vec) {
      return sszvis.svgUtils.translateString.apply(null, vec);
    }

  };

});


//////////////////////////////////// SECTION ///////////////////////////////////


/**
 * Move behavior
 *
 * The move behavior is used to add a mouseover and touchmove-based interface to a chart.
 *
 * Like other behavior components, this behavior adds an invisible layer over the chart,
 * which the users interact with using touch or mouse actions. The behavior component then interprets
 * these interactions, and calls the relevant event handler callback functions. These callback functions are
 * passed values which represent data-space information about the nature of the interaction.
 * That last sentence was intentionally vague, because different behaviors operate in slightly different ways.
 *
 * The move behavior requires scales to be passed to it as configuration, and when a user interacts with the behavior layer,
 * it inverts the pixel location of the interaction using these scales and passes the resulting data-space values to the callback
 * functions. This component extends a d3.dispatch instance.
 *
 * @module sszvis/behavior/move
 *
 * @property {boolean} debug            Whether or not to render the component in debug mode, which reveals its position in the chart.
 * @property {function} xScale          The x-scale for the component. The extent of this scale, plus component padding, is the width of the
 *                                      component's active area.
 * @property {function} yScale          The y-scale for the component. The extent of this scale, plus component padding, is the height of the
 *                                      component's active area.
 * @property {boolean} draggable        Whether or not this component is draggable. This changes certain display properties of the component.
 * @property {object} padding           An object which specifies padding, in addition to the scale values, for the component. Defaults are all 0.
 *                                      The options are { top, right, bottom, left }
 * @property {string and function} on   The .on() method of this component should specify an event name and an event handler function.
 *                                      Possible event names are:
 *                                      'start' - when the move action starts - mouseover or touchstart
 *                                      'move' - called when a 'moving' action happens - mouseover on the element
 *                                      'drag' - called when a 'dragging' action happens - mouseover with the mouse click down, or touchmove
 *                                      'end' - called when the event ends - mouseout or touchend
 *                                      Event handler functions, excepting end, are passed an x-value and a y-value, which are the data values,
 *                                      computed by inverting the provided xScale and yScale, which correspond to the screen pixel location of the event.
 *
 * @return {d3.component}
 */
sszvis_namespace('sszvis.behavior.move', function(module) {
  'use strict';

  module.exports = function() {
    var event = d3.dispatch('start', 'move', 'drag', 'end');

    var moveComponent = d3.component()
      .prop('debug')
      .prop('xScale')
      .prop('yScale')
      .prop('draggable')
      .prop('padding', function(p) {
        var defaults = { top: 0, left: 0, bottom: 0, right: 0 };
        for (var prop in p) { defaults[prop] = p[prop]; }
        return defaults;
      }).padding({})
      .render(function() {

        var selection = d3.select(this);
        var props = selection.props();

        var xExtent = sszvis.scale.range(props.xScale).sort(d3.ascending);
        var yExtent = sszvis.scale.range(props.yScale).sort(d3.ascending);

        xExtent[0] -= props.padding.left;
        xExtent[1] += props.padding.right;
        yExtent[0] -= props.padding.top;
        yExtent[1] += props.padding.bottom;

        var layer = selection.selectAll('[data-sszvis-behavior-move]')
          .data([0]);

        layer.enter()
          .append('rect')
          .attr('data-sszvis-behavior-move', '')
          .attr('class', 'sszvis-interactive');

        if (props.draggable) {
          layer.classed('sszvis-interactive--draggable', true);
        }

        layer
          .attr('x', xExtent[0])
          .attr('y', yExtent[0])
          .attr('width',  xExtent[1] - xExtent[0])
          .attr('height', yExtent[1] - yExtent[0])
          .attr('fill', 'transparent')
          .on('mouseover', event.start)
          .on('mousedown', function() {
            var target = this;
            var doc = d3.select(document);
            var win = d3.select(window);

            var drag = function() {
              var xy = d3.mouse(target);
              var x = scaleInvert(props.xScale, xy[0]);
              var y = scaleInvert(props.yScale, xy[1]);
              d3.event.preventDefault();
              event.drag(x, y);
            };

            var startDragging = function() {
              target.__dragging__ = true;
              drag();
            };

            var stopDragging = function() {
              target.__dragging__ = false;
              win.on('mouseup.sszvis-behavior-move', null);
              win.on('mousemove.sszvis-behavior-move', null);
              doc.on('mouseout.sszvis-behavior-move', null);
            };

            win.on('mousemove.sszvis-behavior-move', drag);
            win.on('mouseup.sszvis-behavior-move', stopDragging);
            doc.on('mouseout.sszvis-behavior-move', function() {
              var from = d3.event.relatedTarget || d3.event.toElement;
              if (!from || from.nodeName === 'HTML') {
                stopDragging();
              }
            });

            startDragging();
          })
          .on('mousemove', function() {
            var target = this;
            var xy = d3.mouse(this);
            var x = scaleInvert(props.xScale, xy[0]);
            var y = scaleInvert(props.yScale, xy[1]);

            if (!target.__dragging__) {
              event.move(x, y);
            }
          })
          .on('mouseout', event.end)
          .on('touchstart', function() {
            d3.event.preventDefault();

            var xy = sszvis.fn.first(d3.touches(this));
            var x = scaleInvert(props.xScale, xy[0]);
            var y = scaleInvert(props.yScale, xy[1]);

            event.start.apply(this, Array.prototype.slice.call(arguments));
            event.drag(x, y);
            event.move(x, y);
          })
          .on('touchmove', function() {
            var xy = sszvis.fn.first(d3.touches(this));
            var x = scaleInvert(props.xScale, xy[0]);
            var y = scaleInvert(props.yScale, xy[1]);

            event.drag(x, y);
            event.move(x, y);
          })
          .on('touchend', event.end);

        if (props.debug) {
          layer.attr('fill', 'rgba(255,0,0,0.2)');
        }
      });

    d3.rebind(moveComponent, event, 'on');

    return moveComponent;
  };

  function scaleInvert(scale, px) {
    if (scale.invert) {
      // Linear scale
      return scale.invert(px);
    } else {
      // Ordinal scale
      var bandWidth = scale.rangeBand();
      var leftEdges = scale.range().map(function(d) {
        return [d, d + bandWidth];
      });
      for (var i = 0, l = leftEdges.length; i < l; i++) {
        if (leftEdges[i][0] < px && px <= leftEdges[i][1]) {
          return scale.domain()[i];
        }
      }
      return null;
    }
  }

});


//////////////////////////////////// SECTION ///////////////////////////////////


/**
 * Voronoi behavior
 *
 * The voronoi behavior adds an invisible layer of voronoi cells to a chart. The voronoi cells are calculated
 * based on the positions of the data objects which should be bound to the interaction layer before this behavior
 * is called on it. Each voronoi cell is associated with one data object, and this data object is passed to the event
 * callback functions.
 *
 * Like other behavior components, this behavior adds an invisible layer over the chart,
 * which the users interact with using touch or mouse actions. The behavior component then interprets
 * these interactions, and calls the relevant event handler callback functions. These callback functions are
 * passed values which represent data-space information about the nature of the interaction.
 * That last sentence was intentionally vague, because different behaviors operate in slightly different ways.
 *
 * The voronoi behavior expects to find an array of data already bound to the interaction layer. Each datum should
 * represent a point, and these points are used as the focal points of the construction of voronoi cells. These data
 * are also associated with the voronoi cells, so that when a user interacts with them, the datum and its index within the
 * bound data are passed to the callback functions. This component extends a d3.dispatch instance.
 *
 * @module sszvis/behavior/voronoi
 *
 * @property {function} x                         Specify an accessor function for the x-position of the voronoi point
 * @property {function} y                         Specify an accessor function for the y-position of the voronoi point
 * @property {array[array, array]} bounds         Specify the bounds of the voronoi area. This is essential to the construction of voronoi cells
 *                                                using the d3.vornoi geom object. The bounds should determine the chart area over which you would like
 *                                                voronoi cells to be active. Note that if not specified, the voronoi cells will be very large.
 * @property {boolean} debug                      Whether the component is in debug mode. Being in debug mode renders the voroni cells obviously
 * @property {string and function} on             The .on() method should specify an event name and an event handler function.
 *                                                Possible event names are:
 *                                                'over' - when the user interacts with a voronoi area, either with a mouseover or touchstart
 *                                                'out' - when the user ceases to interact with a voronoi area, either with a mouseout or touchend
 *                                                All event handler functions are passed the datum which is the center of the voronoi area,
 *                                                and that datum's index within the data bound to the interaction layer.
 *
 */
sszvis_namespace('sszvis.behavior.voronoi', function(module) {
  'use strict';

  module.exports = function() {
    var event = d3.dispatch('over', 'out');

    var voronoiComponent = d3.component()
      .prop('x')
      .prop('y')
      .prop('bounds')
      .prop('debug')
      .render(function(data) {
        var selection = d3.select(this);
        var props = selection.props();

        if (!props.bounds) {
          sszvis.logger.error('behavior.voronoi - requires bounds');
          return false;
        }

        var voronoi = d3.geom.voronoi()
          .x(props.x)
          .y(props.y)
          .clipExtent(props.bounds);

        var polys = selection.selectAll('[data-sszvis-behavior-voronoi]')
          .data(voronoi(data));

        polys.enter()
          .append('path')
          .attr('data-sszvis-behavior-voronoi', '');

        polys.exit().remove();

        polys
          .attr('d', function(d) { return 'M' + d.join('L') + 'Z'; })
          .attr('fill', 'transparent')
          .on('mouseover', function(d, i) {
            event.over.apply(this, [d.point, i]);
          })
          .on('mouseout', function(d, i) {
            event.out.apply(this, [d.point, i]);
          })
          .on('touchstart', function(d, i) {
            event.over.apply(this, [d.point, i]);
          })
          .on('touchend', function(d, i) {
            event.out.apply(this, [d.point, i]);

            // calling preventDefault here prevents the browser from sending imitation mouse events
            d3.event.preventDefault();
          });

          if (props.debug) {
            polys.attr('stroke', '#f00');
          }
      });

    d3.rebind(voronoiComponent, event, 'on');

    return voronoiComponent;
  };

});


//////////////////////////////////// SECTION ///////////////////////////////////


/**
 * Bar component
 *
 * The bar component is a general-purpose component used to render rectangles, including
 * bars for horizontal and vertical standard and stacked bar charts, bars in the population
 * pyramids, and the boxes of the heat table.
 *
 * The input data should be an array of data values, where each data value contains the information
 * necessary to render a single rectangle. The x-position, y-position, width, and height of each rectangle
 * are then extracted from the data objects using accessor functions.
 *
 * In addition, the user can specify fill and stroke accessor functions. When called, these functions
 * are given each rectangle's data object, and should return a valid fill or stroke color to be applied
 * to the rectangle.
 *
 * The x, y, width, height, fill, and stroke properties may also be specified as constants.
 *
 * @module sszvis/component/bar
 *
 * @property {number, function} x       the x-value of the rectangles. Becomes a functor.
 * @property {number, function} y       the y-value of the rectangles. Becomes a functor.
 * @property {number, function} width   the width-value of the rectangles. Becomes a functor.
 * @property {number, function} height  the height-value of the rectangles. Becomes a functor.
 * @property {string, function} fill    the fill-value of the rectangles. Becomes a functor.
 * @property {string, function} stroke  the stroke-value of the rectangles. Becomes a functor.
 *
 * @return {d3.component}
 */
sszvis_namespace('sszvis.component.bar', function(module) {
  'use strict';

  // replaces NaN values with 0
  function handleMissingVal(v) {
    return isNaN(v) ? 0 : v;
  }

  module.exports = function() {
    return d3.component()
      .prop('x', d3.functor)
      .prop('y', d3.functor)
      .prop('width', d3.functor)
      .prop('height', d3.functor)
      .prop('fill', d3.functor)
      .prop('stroke', d3.functor)
      .prop('centerTooltip')
      .render(function(data) {
        var selection = d3.select(this);
        var props = selection.props();

        var xAcc = sszvis.fn.compose(handleMissingVal, props.x);
        var yAcc = sszvis.fn.compose(handleMissingVal, props.y);
        var wAcc = sszvis.fn.compose(handleMissingVal, props.width);
        var hAcc = sszvis.fn.compose(handleMissingVal, props.height);

        var bars = selection.selectAll('.sszvis-bar')
          .data(data);

        bars.enter()
          .append('rect')
          .classed('sszvis-bar', true);

        bars.exit().remove();

        bars
          .attr('fill', props.fill)
          .attr('stroke', props.stroke);

        bars
          .transition()
          .call(sszvis.transition)
          .attr('x', xAcc)
          .attr('y', yAcc)
          .attr('width', wAcc)
          .attr('height', hAcc);

        // Tooltip anchors
        var tooltipPosition;
        if (props.centerTooltip) {
          tooltipPosition = function(d) {
            return [xAcc(d) + wAcc(d) / 2, yAcc(d) + hAcc(d) / 2];
          };
        } else {
          tooltipPosition = function(d) {
            return [xAcc(d) + wAcc(d) / 2, yAcc(d)];
          };
        }

        var tooltipAnchor = sszvis.annotation.tooltipAnchor()
          .position(tooltipPosition);

        selection.call(tooltipAnchor);

      });
  };

});


//////////////////////////////////// SECTION ///////////////////////////////////


/**
 * Dot component
 *
 * Used to render small circles, where each circle corresponds to a data value. The dot component
 * is built on rendering svg circles, so the configuration properties are directly mapped to circle attributes.
 *
 * @module sszvis/component/dot
 *
 * @property {number, function} x               An accessor function or number for the x-position of the dots.
 * @property {number, function} y               An accessor function or number for the y-position of the dots.
 * @property {number, function} radius          An accessor function or number for the radius of the dots.
 * @property {string, function} stroke          An accessor function or string for the stroke color of the dots.
 * @property {string, function} fill            An accessor function or string for the fill color of the dots.
 *
 * @return {d3.component}
 */
sszvis_namespace('sszvis.component.dot', function(module) {
  'use strict';

  module.exports = function() {
    return d3.component()
      .prop('x', d3.functor)
      .prop('y', d3.functor)
      .prop('radius')
      .prop('stroke')
      .prop('fill')
      .render(function(data) {
        var selection = d3.select(this);
        var props = selection.props();

        var dots = selection.selectAll('.sszvis-circle')
          .data(data);

        dots.enter()
          .append('circle')
          .classed('sszvis-circle', true);

        dots.exit().remove();

        dots
          .transition()
          .call(sszvis.transition)
          .attr('cx', props.x)
          .attr('cy', props.y)
          .attr('r', props.radius)
          .attr('stroke', props.stroke)
          .attr('fill', props.fill);

        // Tooltip anchors

        var tooltipAnchor = sszvis.annotation.tooltipAnchor()
          .position(function(d) {
            return [props.x(d), props.y(d)];
          });

        selection.call(tooltipAnchor);
      });
  };

});


//////////////////////////////////// SECTION ///////////////////////////////////


/**
 * Grouped Bars component
 *
 * The grouped bars component is used to create grouped vertical bar charts.
 *
 * The input to the grouped bar component should be an array of arrays, where each inner
 * array contains the bars for a single group. Each of the inner arrays becomes a group, and
 * each element in those inner arrays becomes a bar.
 *
 * In addition to the raw data, the user must provide other information necessary for calculating
 * the layout of the groups of bars, namely the number of bars in each group (this component requires that
 * all groups have the same number of bars), a scale for finding the x-offset of each group (usually an
 * instance of d3.scale.ordinal), a width for groups, and y- and height- scales for the bars in the group.
 * Note that the number of bars in each group and the group width determines how wide each bar will be, and
 * this width is calculated internally to the groupedBars component.
 *
 * The groups are calculated and laid out entirely by the groupedBars component.
 *
 * @module sszvis/component/groupedBars
 *
 * @property {scale} groupScale         This should be a scale function for determining the correct group offset of a member of a group.
 *                                      This function is passed the group member, and should return a value for the group offset which
 *                                      is the same for all members of the group. The within-group offset (which is different for each member)
 *                                      is then added to this group offset in order to position the bars individually within the group.
 *                                      So, for instance, if the groups are based on the "city" property, the groupScale should return
 *                                      the same value for all data objects with "city = Zurich".
 * @property {number} groupSize         This property tells groupedBars how many bars to expect for each group. It is used to assist in
 *                                      calculating the within-group layout and size of the bars. This number is treated as the same for all
 *                                      groups. Groups with less members than this number will have visible gaps. (Note that having less members
 *                                      in a group is not the same as having a member with a missing value, which will be discussed later)
 * @property {number} groupWidth        The width of the groups. This value is treated as the same for all groups. The width available to the groups
 *                                      is divided up among the bars. Often, this value will be the result of calling .rangeBand() on a d3.scale.ordinal scale.
 * @property {number} groupSpace        The percentage of space between each group. (default: 0.05). Usually the default is fine here.
 * @property {function} y               The y-position of the bars in the group. This function is given a data value and should return
 *                                      a y-value. It should be similar to other functions you have already seen for positioning bars.
 * @property {function} height          The height of the bars in the group. This function is given a data value and should return
 *                                      a height value. It should be similar to other functions you have already seen for setting the height of bars.
 * @property {string, function} fill    A functor which gives the color for each bar (often based on the bar's group). This can be a string or a function.
 * @property {string, function} stroke  The stroke color for each bar (default: none)
 * @property {function} defined         A predicate function which can be used to determine whether a bar has a defined value. (default: true).
 *                                      Any bar for which this function returns false, meaning that it has an undefined (missing) value,
 *                                      will be displayed as a faint "x" in the grouped bar chart. This is in order to distinguish bars with
 *                                      missing values from bars with very small values, which would display as a very thin rectangle.
 *
 * @return {d3.component}
 */
sszvis_namespace('sszvis.component.groupedBars', function(module) {
  'use strict';

  module.exports = function() {
    return d3.component()
      .prop('groupScale')
      .prop('groupSize')
      .prop('groupWidth')
      .prop('groupSpace').groupSpace(0.05)
      .prop('y', d3.functor)
      .prop('height')
      .prop('fill')
      .prop('stroke')
      .prop('defined', d3.functor).defined(true)
      .render(function(data) {
        var selection = d3.select(this);
        var props = selection.props();

        var inGroupScale = d3.scale.ordinal()
          .domain(d3.range(props.groupSize))
          .rangeRoundBands([0, props.groupWidth], props.groupSpace, 0);

        var groups = selection.selectAll('g.sszvis-bargroup')
          .data(data);

        groups.enter()
          .append('g')
          .classed('sszvis-bargroup', true);

        groups.exit().remove();

        var barUnits = groups.selectAll('g.sszvis-barunit')
          .data(function(d) { return d; });

        barUnits.enter()
          .append('g')
          .classed('sszvis-barunit', true);

        barUnits.exit().remove();

        barUnits.each(function(d, i) {
          // necessary for the within-group scale
          d.__sszvisGroupedBarIndex__ = i;
        });

        var unitsWithValue = barUnits.filter(props.defined);

        // clear the units before rendering
        unitsWithValue.selectAll('*').remove();

        unitsWithValue
          .append('rect')
          .classed('sszvis-bar', true)
          .attr('fill', props.fill)
          .attr('x', function(d) {
            // first term is the x-position of the group, the second term is the x-position of the bar within the group
            return props.groupScale(d) + inGroupScale(d.__sszvisGroupedBarIndex__);
          })
          .attr('y', props.y)
          .attr('width', inGroupScale.rangeBand())
          .attr('height', props.height);

        var unitsWithoutValue = barUnits.filter(sszvis.fn.not(props.defined));

        unitsWithoutValue.selectAll('*').remove();

        unitsWithoutValue
          .attr('transform', function(d, i) {
            return sszvis.svgUtils.translateString(props.groupScale(d) + inGroupScale(d.__sszvisGroupedBarIndex__) + inGroupScale.rangeBand() / 2, props.y(d, i));
          });

        unitsWithoutValue
          .append('line')
          .classed('sszvis-bar--missing line1', true)
          .attr('x1', -4).attr('y1', -4)
          .attr('x2', 4).attr('y2', 4);

        unitsWithoutValue
          .append('line')
          .classed('sszvis-bar--missing line2', true)
          .attr('x1', 4).attr('y1', -4)
          .attr('x2', -4).attr('y2', 4);

        var tooltipAnchor = sszvis.annotation.tooltipAnchor()
          .position(function(group) {
            var xTotal = 0;
            var tallest = Infinity;
            group.forEach(function(d, i) {
              xTotal += props.groupScale(d) + inGroupScale(d.__sszvisGroupedBarIndex__) + inGroupScale.rangeBand() / 2;
              // smaller y is higher
              tallest = Math.min(tallest, props.y(d, i));
            });
            var xAverage = xTotal / group.length;
            return [xAverage, tallest];
          });

        selection.call(tooltipAnchor);
      });
  };

});


//////////////////////////////////// SECTION ///////////////////////////////////


/**
 * Line component
 *
 * The line component is a general-purpose component used to render lines.
 *
 * The input data should be an array of arrays, where each inner array
 * contains the data points necessary to render a line. The line is then
 * composed of x- and y- values extracted from these data objects
 * using the x and y accessor functions.
 *
 * Each data object in a line's array is passed to the x- and y- accessors, along with
 * that data object's index in the array. For more information, see the documentation for
 * d3.svg.line.
 *
 * In addition, the user can specify stroke and strokeWidth accessor functions. Because these
 * functions apply properties to the entire line, when called, they are give the entire array of line data
 * as an argument, plus the index of that array of line data within the outer array of lines. Note that this
 * differs slightly from the usual case in that dimension-related accessor functions are given different
 * data than style-related accessor functions.
 *
 * @module sszvis/component/line
 *
 * @property {function} x                An accessor function for getting the x-value of the line
 * @property {function} y                An accessor function for getting the y-value of the line
 * @property {function} [key]            The key function to be used for the data join
 * @property {function} [valuesAccessor] An accessor function for getting the data points array of the line
 * @property {string, function} [stroke] Either a string specifying the stroke color of the line or lines,
 *                                       or a function which, when passed the entire array representing the line,
 *                                       returns a value for the stroke. If left undefined, the stroke is black.
 * @property {string, function} [stroke] Either a number specifying the stroke-width of the lines,
 *                                       or a function which, when passed the entire array representing the line,
 *                                       returns a value for the stroke-width. The default value is 1.
 *
 * @return {d3.component}
 */
sszvis_namespace('sszvis.component.line', function(module) {
  'use strict';

  module.exports = function() {

    return d3.component()
      .prop('x')
      .prop('y')
      .prop('stroke')
      .prop('strokeWidth')
      .prop('key').key(function(d, i){ return i; })
      .prop('valuesAccessor').valuesAccessor(sszvis.fn.identity)
      .render(function(data) {
        var selection = d3.select(this);
        var props = selection.props();


        // Layouts

        var line = d3.svg.line()
          .defined(sszvis.fn.compose(sszvis.fn.not(isNaN), props.y))
          .x(props.x)
          .y(props.y);


        // Rendering

        var path = selection.selectAll('.sszvis-line')
          .data(data, props.key);

        path.enter()
          .append('path')
          .classed('sszvis-line', true)
          .attr('stroke', props.stroke);

        path.exit().remove();

        path
          .transition()
          .call(sszvis.transition)
          .attr('d', sszvis.fn.compose(line, props.valuesAccessor))
          .attr('stroke', props.stroke)
          .attr('stroke-width', props.strokeWidth);
      });
  };

});


//////////////////////////////////// SECTION ///////////////////////////////////


/**
 * Pie component
 *
 * The pie component is used to draw pie charts. It uses the d3.svg.arc() generator
 * to create pie wedges.
 *
 * THe input data should be an array of data values, where each data value represents one wedge in the pie.
 *
 * @module sszvis/component/pie
 *
 * @property {number} radius                  The radius of the pie chart (no default)
 * @property {string, function} fill          a fill color for wedges in the pie (default black). Ideally a function
 *                                            which takes a data value.
 * @property {string, function} stroke        the stroke color for wedges in the pie (default none)
 * @property {string, function} angle         specifys the angle of the wedges in radians. Theoretically this could be
 *                                            a constant, but that would make for a very strange pie. Ideally, this
 *                                            is a function which takes a data value and returns the angle in radians.
 *
 * @return {d3.component}
*/
sszvis_namespace('sszvis.component.pie', function(module) {
  'use strict';

  module.exports = function() {
    return d3.component()
      .prop('radius')
      .prop('fill')
      .prop('stroke')
      .prop('angle', d3.functor)
      .render(function(data) {
        var selection = d3.select(this);
        var props = selection.props();

        var angle = 0;
        data.forEach(function(value) {
          value.a0 = angle;
          angle += props.angle(value);
          value.a1 = angle;
        });

        var arcGen = d3.svg.arc()
          .innerRadius(4)
          .outerRadius(props.radius)
          .startAngle(function(d) { return d.a0; })
          .endAngle(function(d) { return d.a1; });

        var segments = selection.selectAll('.sszvis-path')
          .data(data);

        segments.enter()
          .append('path')
          .classed('sszvis-path', true)
          .attr('transform', 'translate(' + (props.radius) + ',' + (props.radius) + ')')
          .attr('fill', props.fill)
          .attr('stroke', props.stroke);

        segments.exit().remove();

        segments
          .transition()
          .call(sszvis.transition)
          .attr('transform', 'translate(' + (props.radius) + ',' + (props.radius) + ')')
          .attr('d', arcGen)
          .attr('fill', props.fill)
          .attr('stroke', props.stroke);

        var tooltipAnchor = sszvis.annotation.tooltipAnchor()
          .position(function(d) {
            var a = d.a0 + (Math.abs(d.a1 - d.a0) / 2) - Math.PI/2;
            var r = props.radius * 2/3;
            return [props.radius + Math.cos(a) * r, props.radius + Math.sin(a) * r];
          });

        selection
          .datum(data)
          .call(tooltipAnchor);

      });
  };

});


//////////////////////////////////// SECTION ///////////////////////////////////


/**
 * Pyramid component
 *
 * The pyramid component is primarily used to show a distribution of age groups
 * in a population (population pyramid). The chart is mirrored vertically,
 * meaning that it has a horizontal axis that extends in a positive and negative
 * direction having the same domain.
 *
 * This chart's horizontal point of origin is at it's spine, i.e. the center of
 * the chart.
 *
 * @module sszvis/component/pyramid
 *
 * @requires sszvis.component.bar
 *
 * @property {number, d3.scale} [barFill]          The color of a bar
 * @property {number, d3.scale} barHeight          The height of a bar
 * @property {number, d3.scale} barWidth           The width of a bar
 * @property {number, d3.scale} barPosition        The vertical position of a bar
 * @property {function}         leftAccessor       Data for the left side
 * @property {function}         rightAccessor      Data for the right side
 * @property {function}         [leftRefAccessor]  Reference data for the left side
 * @property {function}         [rightRefAccessor] Reference data for the right side
 *
 * @return {d3.component}
 */
sszvis_namespace('sszvis.component.pyramid', function(module) {
  'use strict';

  /* Constants
  ----------------------------------------------- */
  var SPINE_PADDING = 0.5;


  /* Module
  ----------------------------------------------- */
  module.exports = function() {
    return d3.component()
      .prop('barHeight', d3.functor)
      .prop('barWidth', d3.functor)
      .prop('barPosition', d3.functor)
      .prop('barFill', d3.functor).barFill('#000')
      .prop('leftAccessor')
      .prop('rightAccessor')
      .prop('leftRefAccessor')
      .prop('rightRefAccessor')
      .render(function(data) {
        var selection = d3.select(this);
        var props = selection.props();


        // Components

        var leftBar = sszvis.component.bar()
          .x(function(d){ return -SPINE_PADDING - props.barWidth(d); })
          .y(props.barPosition)
          .height(props.barHeight)
          .width(props.barWidth)
          .fill(props.barFill)
          .centerTooltip(true);

        var rightBar = sszvis.component.bar()
          .x(SPINE_PADDING)
          .y(props.barPosition)
          .height(props.barHeight)
          .width(props.barWidth)
          .fill(props.barFill)
          .centerTooltip(true);

        var leftLine = lineComponent()
          .barPosition(props.barPosition)
          .barWidth(props.barWidth)
          .mirror(true);

        var rightLine = lineComponent()
          .barPosition(props.barPosition)
          .barWidth(props.barWidth);


        // Rendering

        selection.selectGroup('left')
          .datum(props.leftAccessor(data))
          .call(leftBar);

        selection.selectGroup('right')
          .datum(props.rightAccessor(data))
          .call(rightBar);

        selection.selectGroup('leftReference')
          .datum(props.leftRefAccessor ? [props.leftRefAccessor(data)] : [])
          .call(leftLine);

        selection.selectGroup('rightReference')
          .datum(props.rightRefAccessor ? [props.rightRefAccessor(data)] : [])
          .call(rightLine);

      });
  };


  function lineComponent() {
    return d3.component()
      .prop('barPosition')
      .prop('barWidth')
      .prop('mirror').mirror(false)
      .render(function(data) {
        var selection = d3.select(this);
        var props = selection.props();

        var lineGen = d3.svg.line()
          .x(props.barWidth)
          .y(props.barPosition);

        var line = selection.selectAll('.sszvis-pyramid__referenceline')
          .data(data);

        line.enter()
          .append('path')
          .attr('class', 'sszvis-pyramid__referenceline');

        line
          .attr('transform', props.mirror ? 'scale(-1, 1)' : '')
          .transition()
          .call(sszvis.transition)
          .attr('d', lineGen);

        line.exit().remove();
      });
  }

});


//////////////////////////////////// SECTION ///////////////////////////////////


/**
 * Stacked Area component
 *
 * Stacked area charts are useful for showing how component parts contribute to a total quantity
 *
 * The stackedArea component uses a [d3 stack layout](https://github.com/mbostock/d3/wiki/Stack-Layout) under the hood,
 * so some of its configuration properties are similar. This component requires an array of layer objects,
 * where each layer object represents a layer in the stack.
 *
 * @module sszvis/component/stackedArea
 *
 * @property {function} x                      Accessor function to read *x*-values from the data. Should return a value in screen pixels.
 *                                             Used to figure out which values share a vertical position in the stack.
 * @property {function} yAccessor              Accessor function to read raw *y*-values from the data. Should return a value which is in data-units,
 *                                             not screen pixels. The results of this function are used to compute the stack, and they are then
 *                                             passed into the yScale before display.
 * @property {function} yScale                 A y-scale for determining the vertical position of data quantities. Used to compute the
 *                                             bottom and top lines of the stack.
 * @property {string, function} fill           String or accessor function for the area fill. Passed a layer object.
 * @property {string, function} stroke         String or accessor function for the area stroke. Passed a layer object.
 * @property {function} key                    Specify a key function for use in the data join. The value returned by the key should be unique
 *                                             among stacks. This option is particularly important when creating a chart which transitions
 *                                             between stacked and separated views.
 * @property {function} valuesAccessor         Specify an accessor for the values of the layer objects. The default treats the layer object
 *                                             as an array of values. Use this if your layer objects should be treated as something other than
 *                                             arrays of values.
 *
 * @return {d3.component}
 */
sszvis_namespace('sszvis.component.stackedArea', function(module) {
  'use strict';

  module.exports = function() {
    return d3.component()
      .prop('x')
      .prop('yAccessor')
      .prop('yScale')
      .prop('fill')
      .prop('stroke')
      .prop('key').key(function(d, i){ return i; })
      .prop('valuesAccessor').valuesAccessor(sszvis.fn.identity)
      .render(function(data) {
        var selection = d3.select(this);
        var props = selection.props();

        data = data.slice().reverse();

        var stackLayout = d3.layout.stack()
          .x(props.x)
          .y(props.yAccessor);

        stackLayout(data.map(props.valuesAccessor));

        var areaGen = d3.svg.area()
          .x(props.x)
          .y0(function(d) { return props.yScale(d.y0); })
          .y1(function(d) { return props.yScale(d.y0 + d.y); });

        var paths = selection.selectAll('path.sszvis-path')
          .data(data, props.key);

        paths.enter()
          .append('path')
          .classed('sszvis-path', true)
          .attr('fill', props.fill);

        paths.exit().remove();

        paths
          .transition()
          .call(sszvis.transition)
          .attr('d', sszvis.fn.compose(areaGen, props.valuesAccessor))
          .attr('fill', props.fill)
          .attr('stroke', props.stroke);
      });
  };

});


//////////////////////////////////// SECTION ///////////////////////////////////


/**
 * Stacked Area Multiples component
 *
 * This component, like stackedArea, requires an array of layer objects, where each layer object is one of the multiples.
 * In addition to stackedArea, this chart's layers can be separated to provide two views on the data: a sum of all
 * elements as well as every element on its own.
 *
 * @module sszvis/component/stackedAreaMultiples
 *
 * @property {number, function} x             Accessor function for the *x*-values. Passed a data object and should return a value
 *                                            in screen pixels.
 * @property {number, function} y0            Accessor function for the *y0*-value (the baseline of the area). Passed a data object
 *                                            and should return a value in screen pixels.
 * @property {number, function} y1            Accessor function for the *y1*-value (the top line of the area). Passed a data object
 *                                            and should return a value in screen pixels.
 * @property {string, function} fill          Accessor function for the area fill. Passed a layer object.
 * @property {string, function} stroke        Accessor function for the area stroke. Passed a layer object.
 * @property {function} key                   Specify a key function for use in the data join. The value returned by the key should
 *                                            be unique among stacks. This option is particularly important when creating a chart
 *                                            which transitions between stacked and separated views.
 * @property {function} valuesAccessor        Specify an accessor for the values of the layer objects. The default treats the layer object
 *                                            as an array of values. Use this if your layer objects should be treated as something other than
 *                                            arrays of values.
 *
 * @return {d3.component}
 */

sszvis_namespace('sszvis.component.stackedAreaMultiples', function(module) {
'use strict';

  module.exports = function() {
    return d3.component()
      .prop('x')
      .prop('y0')
      .prop('y1')
      .prop('fill')
      .prop('stroke')
      .prop('key').key(function(d, i){ return i; })
      .prop('valuesAccessor').valuesAccessor(sszvis.fn.identity)
      .render(function(data) {
        var selection = d3.select(this);
        var props = selection.props();

        data = data.slice().reverse();

        var areaGen = d3.svg.area()
          .x(props.x)
          .y0(props.y0)
          .y1(props.y1);

        var paths = selection.selectAll('path.sszvis-path')
          .data(data, props.key);

        paths.enter()
          .append('path')
          .classed('sszvis-path', true)
          .attr('fill', props.fill);

        paths.exit().remove();

        paths
          .transition()
          .call(sszvis.transition)
          .attr('d', sszvis.fn.compose(areaGen, props.valuesAccessor))
          .attr('fill', props.fill)
          .attr('stroke', props.stroke);
      });
  };

});


//////////////////////////////////// SECTION ///////////////////////////////////


/**
 * Stacked Bar component
 *
 * This component includes both the vertical and horizontal stacked bar chart components.
 * Both are variations on the same concept, and they both use the same abstract intermediate
 * representation for the stack, but are rendered using different dimensions. Note that using
 * this component will add the properties 'y0' and 'y' to any passed-in data objects, as part of
 * computing the stack intermediate representation. Existing properties with these names will be
 * overwritten.
 *
 * @module sszvis/component/stackedBar/horizontal
 * @module sszvis/component/stackedBar/vertical
 *
 * @property {function} xAccessor           Specifies an x-accessor for the stack layout. The result of this function
 *                                          is used to compute the horizontal extent of each element in the stack.
 *                                          The return value must be a number.
 * @property {function} xScale              Specifies an x-scale for the stack layout. This scale is used to position
 *                                          the elements of each stack, both the left offset value and the width of each stack segment.
 * @property {number, function} width       Specifies a width for the bars in the stack layout. This value is not used in the
 *                                          horizontal orientation. (xScale is used instead).
 * @property {function} yAccessor           The y-accessor. The return values of this function are used to group elements together as stacks.
 * @property {function} yScale              A y-scale. After the stack is computed, the y-scale is used to position each stack.
 * @property {number, function} height      Specify the height of each rectangle. This value determines the height of each element in the stacks.
 * @property {string, function} fill        Specify a fill value for the rectangles (default black).
 * @property {string, function} stroke      Specify a stroke value for the stack rectangles (default none).
 * @property {string} orientation           Specifies the orientation ("vertical" or "horizontal") of the stacked bar chart.
 *                                          Used internally to configure the verticalBar and the horizontalBar. Should probably never be changed.
 *
 * @return {d3.component}
 */
sszvis_namespace('sszvis.component.stackedBar', function(module) {
  'use strict';

  function stackedBar() {
    return d3.component()
      .prop('xAccessor', d3.functor)
      .prop('xScale', d3.functor)
      .prop('width', d3.functor)
      .prop('yAccessor', d3.functor)
      .prop('yScale', d3.functor)
      .prop('height', d3.functor)
      .prop('fill')
      .prop('stroke')
      .prop('orientation').orientation('vertical')
      .render(function(data) {
        var selection = d3.select(this);
        var props = selection.props();

        var isHorizontal = props.orientation === 'horizontal';

        if (!isHorizontal) {
          data = data.slice().reverse();
        }

        var stackLayout = d3.layout.stack()
          .x(isHorizontal ? props.yAccessor : props.xAccessor)
          .y(isHorizontal ? props.xAccessor : props.yAccessor);

        var xValue, yValue, widthValue, heightValue;

        if (isHorizontal) {
          xValue = function(d) { return props.xScale(d.y0); };
          yValue = function(d) { return props.yScale(props.yAccessor(d)); };
          widthValue = function(d) { return props.xScale(d.y0 + d.y) - props.xScale(d.y0); };
          heightValue = function() { return props.height.apply(this, arguments); };
        } else {
          xValue = function(d) { return props.xScale(props.xAccessor(d)); };
          yValue = function(d) { return props.yScale(d.y0 + d.y); };
          widthValue = function() { return props.width.apply(this, arguments); };
          heightValue = function(d) { return props.yScale(d.y0) - props.yScale(d.y0 + d.y); };
        }

        var barGen = sszvis.component.bar()
          .x(xValue)
          .y(yValue)
          .width(widthValue)
          .height(heightValue)
          .fill(props.fill)
          .stroke(props.stroke);

        var groups = selection.selectAll('.sszvis-stack')
          .data(stackLayout(data));

        groups.enter()
          .append('g')
          .classed('sszvis-stack', true);

        groups.exit().remove();

        groups.call(barGen);
      });
  }

  module.exports.horizontal = function() { return stackedBar().orientation('horizontal'); };

  module.exports.vertical = function() { return stackedBar().orientation('vertical'); };

});


//////////////////////////////////// SECTION ///////////////////////////////////


/**
 * Stacked Pyramid component
 *
 * The pyramid component is primarily used to show a distribution of age groups
 * in a population (population pyramid). The chart is mirrored vertically,
 * meaning that it has a horizontal axis that extends in a positive and negative
 * direction having the same domain.
 *
 * This chart's horizontal point of origin is at it's spine, i.e. the center of
 * the chart.
 *
 * @module sszvis/component/stackedPyramid
 *
 * @requires sszvis.component.bar
 *
 * @property {number, d3.scale} [barFill]          The color of a bar
 * @property {number, d3.scale} barHeight          The height of a bar
 * @property {number, d3.scale} barWidth           The width of a bar
 * @property {number, d3.scale} barPosition        The vertical position of a bar
 * @property {function}         leftAccessor       Data for the left side
 * @property {function}         rightAccessor      Data for the right side
 * @property {function}         [leftRefAccessor]  Reference data for the left side
 * @property {function}         [rightRefAccessor] Reference data for the right side
 *
 * @return {d3.component}
 */
sszvis_namespace('sszvis.component.stackedPyramid', function(module) {
  'use strict';

  /* Constants
  ----------------------------------------------- */
  var SPINE_PADDING = 0.5;


  /* Module
  ----------------------------------------------- */
  module.exports = function() {
    return d3.component()
      .prop('barHeight', d3.functor)
      .prop('barWidth', d3.functor)
      .prop('barPosition', d3.functor)
      .prop('barFill', d3.functor).barFill('#000')
      .prop('leftAccessor')
      .prop('rightAccessor')
      .prop('leftRefAccessor')
      .prop('rightRefAccessor')
      .render(function(data) {
        var selection = d3.select(this);
        var props = selection.props();

        var stackLayout = d3.layout.stack()
          .x(props.barPosition)
          .y(props.barWidth);


        // Components

        var leftBar = sszvis.component.bar()
          .x(function(d){ return -SPINE_PADDING - d.y0 - d.y; })
          .y(props.barPosition)
          .height(props.barHeight)
          .width(sszvis.fn.prop('y'))
          .fill(props.barFill)
          .centerTooltip(true);

        var rightBar = sszvis.component.bar()
          .x(function(d){ return SPINE_PADDING + d.y0; })
          .y(props.barPosition)
          .height(props.barHeight)
          .width(sszvis.fn.prop('y'))
          .fill(props.barFill)
          .centerTooltip(true);

        var leftStack = stackComponent()
          .stackElement(leftBar);

        var rightStack = stackComponent()
          .stackElement(rightBar);

        var leftLine = lineComponent()
          .barPosition(props.barPosition)
          .barWidth(props.barWidth)
          .mirror(true);

        var rightLine = lineComponent()
          .barPosition(props.barPosition)
          .barWidth(props.barWidth);


        // Rendering

        selection.selectGroup('leftStack')
          .datum(stackLayout(props.leftAccessor(data)))
          .call(leftStack);

        selection.selectGroup('rightStack')
          .datum(stackLayout(props.rightAccessor(data)))
          .call(rightStack);

        selection.selectGroup('leftReference')
          .datum(props.leftRefAccessor ? [props.leftRefAccessor(data)] : [])
          .call(leftLine);

        selection.selectGroup('rightReference')
          .datum(props.rightRefAccessor ? [props.rightRefAccessor(data)] : [])
          .call(rightLine);

      });
  };


  function stackComponent() {
    return d3.component()
      .prop('stackElement')
      .renderSelection(function(selection) {
        var datum = selection.datum();
        var props = selection.props();

        var stack = selection.selectAll('[data-sszvis-stack]')
          .data(datum);

        stack.enter()
          .append('g')
          .attr('data-sszvis-stack', '');

        stack.exit().remove();

        stack.each(function(d) {
          d3.select(this)
            .datum(d)
            .call(props.stackElement);
        });
      });
  }


  function lineComponent() {
    return d3.component()
      .prop('barPosition')
      .prop('barWidth')
      .prop('mirror').mirror(false)
      .render(function(data) {
        var selection = d3.select(this);
        var props = selection.props();

        var lineGen = d3.svg.line()
          .x(props.barWidth)
          .y(props.barPosition);

        var line = selection.selectAll('.sszvis-path')
          .data(data);

        line.enter()
          .append('path')
          .attr('class', 'sszvis-path')
          .attr('fill', 'none')
          .attr('stroke', '#aaa')
          .attr('stroke-width', 2)
          .attr('stroke-dasharray', '3 3');

        line
          .attr('transform', props.mirror ? 'scale(-1, 1)' : '')
          .transition()
          .call(sszvis.transition)
          .attr('d', lineGen);

        line.exit().remove();
      });
  }

});


//////////////////////////////////// SECTION ///////////////////////////////////


/**
 * Button Group control
 *
 * Control for switching top-level filter values. Use this control for changing between several
 * options which affect the state of the chart. This component should be rendered into an html layer.
 *
 * @module sszvis/control/buttonGroup
 *
 * @property {array} values         an array of values which are the options available in the control. Each one will become a button
 * @property {any} current          the current value of the button group. Should be one of the options passed to .values()
 * @property {number} width         The total width of the button group. Each option will have 1/3rd of this width. (default: 300px)
 * @property {function} change      A callback/event handler function to call when the user clicks on a value.
 *                                  Note that clicking on a value does not necessarily change any state unless this callback function does something.
 *
 * @return {d3.component}
 */
sszvis_namespace('sszvis.control.buttonGroup', function(module) {
  'use strict';

  module.exports = function() {
    return d3.component()
      .prop('values')
      .prop('current')
      .prop('width').width(300)
      .prop('change').change(sszvis.fn.identity)
      .render(function() {
        var selection = d3.select(this);
        var props = selection.props();

        var buttonWidth = props.width / props.values.length;

        var container = selection.selectDiv('buttonGroup');

        container
          .classed('sszvis-control-buttonGroup', true)
          .style('width', props.width + 'px');

        var buttons = container.selectAll('.sszvis-control-buttonGroup__item')
          .data(props.values);

        buttons.enter()
          .append('div')
          .classed('sszvis-control-buttonGroup__item', true);

        buttons.exit().remove();

        buttons
          .style('width', buttonWidth + 'px')
          .classed('selected', function(d) { return d === props.current; })
          .text(function(d) { return d; })
          .on('click', props.change);
      });
  };

});


//////////////////////////////////// SECTION ///////////////////////////////////


/**
 * Ruler with a handle control
 *
 * The handle ruler component is very similar to the ruler component, except that it is rendered
 * with a 24-pixel tall handle at the top. It is moved and repositioned in the same manner as a ruler,
 * so the actual interaction with the handle is up to the developer to specify. This component also
 * creates dots for each data point it finds bound to its layer.
 *
 * @module sszvis/control/handleRuler
 *
 * @property {function} x                   A function or number which determines the x-position of the ruler
 * @property {function} y                   A function which determines the y-position of the ruler dots. Passed data values.
 * @property {number} top                   A number for the y-position of the top of the ruler.
 * @property {number} bottom                A number for the y-position of the bottom of the ruler.
 * @property {string, function} label       A string or string function for the labels of the ruler dots.
 * @property {string, function} color       A string or color for the fill color of the ruler dots.
 * @property {boolean, function} flip       A boolean or boolean function which determines whether the ruler should be flipped (they default to the right side)
 *
 * @returns {d3.component}
 */
sszvis_namespace('sszvis.control.handleRuler', function(module) {
  'use strict';

  module.exports = function() {
    return d3.component()
      .prop('x', d3.functor)
      .prop('y', d3.functor)
      .prop('top')
      .prop('bottom')
      .prop('label').label(d3.functor(''))
      .prop('color')
      .prop('flip', d3.functor).flip(false)
      .render(function(data) {
        var selection = d3.select(this);
        var props = selection.props();

        // Elements need to be placed on half-pixels in order to be rendered
        // crisply across browsers. That's why we create this position accessor
        // here that takes a datum as input, reads out its value (props.x) and
        // then rounds this pixel value to half pixels (1px -> 1.5px, 1.2px -> 1.5px)
        var crispX = sszvis.fn.compose(sszvis.svgUtils.crisp.halfPixel, props.x);
        var crispY = sszvis.fn.compose(sszvis.svgUtils.crisp.halfPixel, props.y);

        var bottom = props.bottom - 4;
        var handleWidth = 10;
        var handleHeight = 24;
        var handleTop = props.top - handleHeight;

        var group = selection.selectAll('.sszvis-handleRuler__group')
          .data([0]);

        var entering = group.enter()
          .append('g')
          .classed('sszvis-handleRuler__group', true);

        group.exit().remove();

        entering
          .append('line')
          .classed('sszvis-ruler__rule', true);

        entering
          .append('rect')
          .classed('sszvis-handleRuler__handle', true);

        entering
          .append('line')
          .classed('sszvis-handleRuler__handle-mark', true);

        group.selectAll('.sszvis-ruler__rule')
          .attr('x1', crispX)
          .attr('y1', sszvis.svgUtils.crisp.halfPixel(props.top))
          .attr('x2', crispX)
          .attr('y2', sszvis.svgUtils.crisp.halfPixel(bottom));

        group.selectAll('.sszvis-handleRuler__handle')
          .attr('x', function(d) {
            return crispX(d) - handleWidth / 2;
          })
          .attr('y', sszvis.svgUtils.crisp.halfPixel(handleTop))
          .attr('width', handleWidth)
          .attr('height', handleHeight)
          .attr('rx', 2)
          .attr('ry', 2);

        group.selectAll('.sszvis-handleRuler__handle-mark')
          .attr('x1', crispX)
          .attr('y1', sszvis.svgUtils.crisp.halfPixel(handleTop + handleHeight * 0.15))
          .attr('x2', crispX)
          .attr('y2', sszvis.svgUtils.crisp.halfPixel(handleTop + handleHeight * 0.85));

        var dots = group.selectAll('.sszvis-ruler__dot')
          .data(data);

        dots.enter()
          .append('circle')
          .classed('sszvis-ruler__dot', true);

        dots.exit().remove();

        dots
          .attr('cx', crispX)
          .attr('cy', crispY)
          .attr('r', 3.5)
          .attr('fill', props.color);


        var labelOutline = selection.selectAll('.sszvis-ruler__label-outline')
          .data(data);

        labelOutline.enter()
          .append('text')
          .classed('sszvis-ruler__label-outline', true);

        labelOutline.exit().remove();


        var label = selection.selectAll('.sszvis-ruler__label')
          .data(data);

        label.enter()
          .append('text')
          .classed('sszvis-ruler__label', true);

        label.exit().remove();


        // Update both labelOutline and labelOutline selections

        selection.selectAll('.sszvis-ruler__label, .sszvis-ruler__label-outline')
          .attr('transform', function(d) {
            var x = sszvis.fn.compose(sszvis.svgUtils.crisp.halfPixel, props.x)(d);
            var y = sszvis.fn.compose(sszvis.svgUtils.crisp.halfPixel, props.y)(d);

            var dx = props.flip(d) ? -10 : 10;
            var dy = (y < props.top + dy) ? 2 * dy
                   : (y > props.bottom - dy) ? 0
                   : 5;

            return sszvis.svgUtils.translateString(x + dx, y + dy);
          })
          .style('text-anchor', function(d) {
            return props.flip(d) ? 'end' : 'start';
          })
          .html(props.label);

      });
  };

});


//////////////////////////////////// SECTION ///////////////////////////////////


/**
 * Slider control
 *
 * Control for use in filtering. Works very much like an interactive axis.
 * A d3 scale is its primary configuration, and it has a labeled handle which can be used to
 * select values on that scale. Ticks created using an sszvis.axis show the user where
 * data values lie.
 *
 * @module  sszvis/control/slider
 *
 * @property {function} scale                 A scale function which this slider represents. The values in the scale's domain
 *                                            are used as the possible values of the slider.
 * @property {array} minorTicks               An array of ticks which become minor (smaller and unlabeled) ticks on the slider's axis
 * @property {array} majorTicks               An array of ticks which become major (larger and labeled) ticks on the slider's axis
 * @property {function} tickLabels            A function to use to format the major tick labels.
 * @property {any} value                      The current value of the slider. Should be set whenever slider interaction causes the state to change.
 * @property {string, function} label         A string or function for the handle label. The datum associated with it is the current slider value.
 * @property {function} onchange              A callback function called whenever user interaction attempts to change the slider value.
 *                                            Note that this component will not change its own state. The callback function must affect some state change
 *                                            in order for this component's display to be updated.
 *
 * @returns {d3.component}
 */
sszvis_namespace('sszvis.control.slider', function(module) {
  'use strict';

  function contains(x, a) {
    return a.indexOf(x) >= 0;
  }

  module.exports = function() {
    return d3.component()
      .prop('scale')
      .prop('minorTicks').minorTicks([])
      .prop('majorTicks').majorTicks([])
      .prop('tickLabels')
      .prop('value')
      .prop('label')
      .prop('onchange')
      .render(function() {
        var selection = d3.select(this);
        var props = selection.props();

        var axisOffset = 28; // vertical offset for the axis
        var majorTickSize = 12;
        var backgroundOffset = sszvis.svgUtils.crisp.halfPixel(18); // vertical offset for the middle of the background
        var handleWidth = 10; // the width of the handle
        var handleHeight = 23; // the height of the handle
        var bgWidth = 6; // the width of the background
        var lineEndOffset = (bgWidth / 2); // the amount by which to offset the ends of the background line
        var handleSideOffset = (handleWidth / 2) + 0.5; // the amount by which to offset the position of the handle

        var scaleDomain = props.scale.domain();
        var scaleRange = sszvis.scale.range(props.scale);
        var alteredScale = props.scale.copy()
          .range([scaleRange[0] + handleSideOffset, scaleRange[1] - handleSideOffset]);

        // the mostly unchanging bits
        var bg = selection.selectAll('g.sszvis-control-slider__backgroundgroup')
          .data([1]);

        var enterBg = bg.enter()
          .append('g')
          .classed('sszvis-control-slider__backgroundgroup', true);

        // create the axis
        var axis = sszvis.axis.x()
          .scale(alteredScale)
          .orient('bottom')
          .hideBorderTickThreshold(0)
          .tickSize(majorTickSize)
          .tickPadding(6)
          .tickValues(sszvis.fn.set([].concat(props.majorTicks, props.minorTicks)))
          .tickFormat(function(d) {
            return contains(d, props.majorTicks) ? props.tickLabels(d) : '';
          });

        var axisSelection = enterBg.selectAll('g.sszvis-axisGroup')
          .data([1]);

        axisSelection.enter()
          .append('g')
          .classed('sszvis-axisGroup sszvis-axis sszvis-axis--bottom sszvis-axis--slider', true)
          .attr('transform', sszvis.svgUtils.translateString(0, axisOffset));

        axisSelection.call(axis);

        // adjust visual aspects of the axis to fit the design
        axisSelection.selectAll('.tick line').filter(function(d) {
          return !contains(d, props.majorTicks);
        })
        .attr('y2', 4);

        var majorAxisText = axisSelection.selectAll('.tick text').filter(function(d) {
          return contains(d, props.majorTicks);
        });
        var numTicks = majorAxisText.size();
        majorAxisText.style('text-anchor', function(d, i) {
          return i === 0 ? 'start' : i === numTicks - 1 ? 'end' : 'middle';
        });

        // create the slider background
        var backgroundSelection = enterBg.selectAll('g.sszvis-slider__background')
          .data([1])
          .enter()
          .append('g')
          .attr('transform', sszvis.svgUtils.translateString(0, backgroundOffset))
          .classed('sszvis-slider__background', true);

        backgroundSelection
          .append('line')
          .style('stroke-width', bgWidth)
          .style('stroke', '#888')
          .style('stroke-linecap', 'round')
          .attr('x1', Math.ceil(scaleRange[0] + lineEndOffset))
          .attr('x2', Math.floor(scaleRange[1] - lineEndOffset));

        backgroundSelection
          .append('line')
          .style('stroke-width', bgWidth - 1)
          .style('stroke', '#fff')
          .style('stroke-linecap', 'round')
          .attr('x1', Math.ceil(scaleRange[0] + lineEndOffset))
          .attr('x2', Math.floor(scaleRange[1] - lineEndOffset));

        var shadow = selection.selectAll('g.sszvis-slider__background').selectAll('.sszvis-slider__backgroundshadow')
          .data([props.value]);

        shadow.enter()
          .append('line')
          .attr('class', 'sszvis-slider__backgroundshadow')
          .attr('stroke-width', bgWidth - 1)
          .style('stroke', '#E0E0E0')
          .style('stroke-linecap', 'round');

          shadow
            .attr('x1', Math.ceil(scaleRange[0] + lineEndOffset))
            .attr('x2', sszvis.fn.compose(Math.floor, alteredScale));

        // draw the handle and the label
        var handle = selection.selectAll('g.sszvis-control-slider__handle')
          .data([props.value]);

        handle.exit().remove();

        var handleEntering = handle.enter()
          .append('g').classed('sszvis-control-slider__handle', true);

        handle
          .attr('transform', function(d) {
            return sszvis.svgUtils.translateString(sszvis.svgUtils.crisp.halfPixel(alteredScale(d)), 0.5);
          });

        handleEntering
          .append('text')
          .classed('sszvis-control-slider--label', true);

        handle.selectAll('.sszvis-control-slider--label')
          .data(function(d) { return [d]; })
          .text(props.label)
          .style('text-anchor', function(d) {
            return sszvis.fn.stringEqual(d, scaleDomain[0]) ? 'start' : sszvis.fn.stringEqual(d, scaleDomain[1]) ? 'end' : 'middle';
          })
          .attr('dx', function(d) {
            return sszvis.fn.stringEqual(d, scaleDomain[0]) ? -(handleWidth / 2) : sszvis.fn.stringEqual(d, scaleDomain[1]) ? (handleWidth / 2) : 0;
          });

        handleEntering
          .append('rect')
          .classed('sszvis-control-slider__handlebox', true)
          .attr('x', -(handleWidth / 2))
          .attr('y', backgroundOffset - handleHeight / 2)
          .attr('width', handleWidth).attr('height', handleHeight)
          .attr('rx', 2).attr('ry', 2);

        var handleLineDimension = (handleHeight / 2 - 4); // the amount by which to offset the small handle line within the handle

        handleEntering
          .append('line')
          .classed('sszvis-control-slider__handleline', true)
          .attr('y1', backgroundOffset - handleLineDimension).attr('y2', backgroundOffset + handleLineDimension);

        var sliderInteraction = sszvis.behavior.move()
          .xScale(props.scale)
          // range goes from the text top (text is 11px tall) to the bottom of the axis
          .yScale(d3.scale.linear().range([-11, axisOffset + majorTickSize]))
          .draggable(true)
          .on('drag', props.onchange);

        selection.selectGroup('sliderInteraction')
          .classed('sszvis-control-slider--interactionLayer', true)
          .attr('transform', sszvis.svgUtils.translateString(0, 4))
          .call(sliderInteraction);
      });
  };

});


//////////////////////////////////// SECTION ///////////////////////////////////


/**
 * Heat Table Dimensions
 *
 * Utility function for calculating different demensions in the heat table
 *
 * @module sszvis/layout/heatTableDimensions
 *
 * @param  {Number} spaceWidth   the total available width for the heat table within its container
 * @param  {Number} padding the padding, in pixels, between squares in the heat table
 * @param  {Number} numX     The number of columns that need to fit within the heat table width
 * @param {Number} numY The number of rows in the table
 * @return {object}         An object with dimension information about the heat table:
 *                          {
 *                              side: the length of one side of a table box
 *                              paddedSide: the length of the side plus padding
 *                              padRatio: the ratio of padding to paddedSide (used for configuring d3.scale.ordinal.rangeBands as the second parameter)
 *                              width: the total width of all table boxes plus padding in between
 *                              height: the total height of all table boxes plus padding in between
 *                              centeredOffset: the left offset required to center the table horizontally within spaceWidth
 *                          }
 */
sszvis_namespace('sszvis.layout.heatTableDimensions', function(module) {
  'use strict';

  module.exports = function(spaceWidth, padding, numX, numY) {
    // this includes the default side length for the heat table
    var DEFAULT_SIDE = 30,
        side = Math.min((spaceWidth - padding * (numX - 1)) / numX, DEFAULT_SIDE),
        paddedSide = side + padding,
        padRatio = 1 - (side / paddedSide),
        tableWidth = numX * paddedSide - padding, // subtract the padding at the end
        tableHeight = numY * paddedSide - padding; // subtract the padding at the end
    return {
      side: side,
      paddedSide: paddedSide,
      padRatio: padRatio,
      width: tableWidth,
      height: tableHeight,
      centeredOffset: (spaceWidth - tableWidth) / 2
    };
  };

});


//////////////////////////////////// SECTION ///////////////////////////////////


/**
 * Horizontal Bar Chart Dimensions
 *
 * This function calculates dimensions for the horizontal bar chart. It encapsulates the
 * layout algorithm for sszvis horizontal bar charts. The object it returns contains several
 * properties which can be used in other functions and components for layout purposes.
 *
 * @module sszvis/layout/horizontalBarChartDimensions
 *
 * @param  {number} numBars     the number of bars in the horizontal bar chart
 * @return {object}             an object containing properties used for layout:
 *                                 {
 *                                  barHeight: the height of an individual bar
 *                                  padHeight: the height of the padding between each bar
 *                                  padRatio: the ratio of padding to barHeight + padding.
 *                                            this can be passed as the second argument to d3.scale.ordinal().rangeBands
 *                                  outerRatio: the ratio of outer padding to barHeight + padding.
 *                                              this can be passed as the third parameter to d3.scale.ordinal().rangeBands
 *                                  axisOffset: the amount by which to vertically offset the y-axis of the horizontal bar chart
 *                                              in order to ensure that the axis labels are visible. This can be used as the y-component
 *                                              of a call to sszvis.svgUtils.translateString.
 *                                  barGroupHeight: the combined height of all the bars and their inner padding.
 *                                  totalHeight: barGroupHeight plus the height of the outerPadding. This distance can be used
 *                                               to translate scales below the bars.
 *                                 }
 */
sszvis_namespace('sszvis.layout.horizontalBarChartDimensions', function(module) {
  'use strict';

  module.exports =  function(numBars) {
    var DEFAULT_HEIGHT = 24, // the default bar height
        MIN_PADDING = 20, // the minimum padding size
        barHeight = DEFAULT_HEIGHT, // the bar height
        numPads = numBars - 1,
        padding = MIN_PADDING,
        // compute other information
        padRatio = 1 - (barHeight / (barHeight + padding)),
        computedBarSpace = barHeight * numBars + padding * numPads,
        outerRatio = 0; // no outer padding

    return {
      barHeight: barHeight,
      padHeight: padding,
      padRatio: padRatio,
      outerRatio: outerRatio,
      axisOffset: -(barHeight / 2) - 10,
      barGroupHeight: computedBarSpace,
      totalHeight: computedBarSpace + (outerRatio * (barHeight + padding) * 2)
    };
  };

});


//////////////////////////////////// SECTION ///////////////////////////////////


/**
 * Population Pyramid Layout
 *
 * This function is used to compute the layout parameters for the population pyramid
 *
 * @module sszvis/layout/populationPyramidLayout
 *
 * @property {number} defaultHeight   The default height of the chart. This is used as a base for calculating rounded bar heights.
 *                                    however, the returned total height will not necessarily be the same as this value.
 * @property {number} numBars         The number of bars in the population pyramid. In other words, the number of ages or age groups in the dataset.
 *
 * @return {object}                   An object containing configuration information for the population pyramid:
 *                                    {
 *                                      barHeight: the height of one bar in the population pyramid
 *                                      padding: the height of the padding between bars in the pyramid
 *                                      totalHeight: the total height of all bars plus the padding between them. This should be the basis for the bounds calculation
 *                                      positions: an array of positions, which go from the bottom of the chart (lowest age) to the top. These positions should
 *                                      be set as the range of a d3.scale.ordinal scale, where the domain is the list of ages or age groups that will be displayed
 *                                      in the chart. The domain ages or age groups should be sorted in ascending order, so that the positions will match up. If everything
 *                                      has gone well, the positions array's length will be numBars
 *                                    }
 */
sszvis_namespace('sszvis.layout.populationPyramidLayout', function(module) {
  'use strict';

  module.exports = function(defaultHeight, numBars) {
    var padding = 1;
    var numPads = numBars - 1;
    var totalPadding = padding * numPads;

    var roundedBarHeight = Math.round((defaultHeight - totalPadding) / numBars);
    roundedBarHeight = Math.max(roundedBarHeight, 2); // bars no shorter than 2

    var totalHeight = numBars * roundedBarHeight + totalPadding;

    var barPos = totalHeight - roundedBarHeight,
        step = roundedBarHeight + padding,
        positions = [];
    while (barPos >= 0) {
      positions.push(barPos);
      barPos -= step;
    }

    return {
      barHeight: roundedBarHeight,
      padding: padding,
      totalHeight: totalHeight,
      positions: positions
    };
  };

});


//////////////////////////////////// SECTION ///////////////////////////////////


/**
 * Small Multiples layout
 *
 * Used to generate group elements which contain small multiples charts.
 *
 * This component lays out rectangular groups in a grid according to the number of rows
 * and the number of columns provided. It is possible to specify paddingX and paddingY
 * values, pixel amounts which will be left as empty space between the columns and the
 * rows, respectively.
 *
 * Data should be passed to this component in a special way: it should be an array of
 * data values, where each data value represents a single group. IMPORTANT: each data
 * value must also have a property called 'values' which represents the values corresponding
 * to that group.
 *
 * In the multiple pie charts example, an array of "groups" data is bound to the chart before
 * the multiples component is called. Each element in the "groups" data has a values property
 * which contains the data for a single pie chart.
 *
 * The multiples component creates the groups and lays them out, attaching the following new properties
 * to each group object:
 *
 * gx - the x-position of the group
 * gy - the y-position of the group
 * gw - the width of the group (without padding)
 * gh - the height of the group (without padding)
 *
 * Generally, you should not use source data objects as group objects, but should instead
 * create new objects which are used to store group information. This creates a data hierarchy
 * which matches the representation hierarchy, which is very much a d3 pattern.
 *
 * Once the groups have been created, the user must still do something with them. The pattern
 * for creating charts within each group should look something like:
 *
 * chart.selectAll('.sszvis-multiple')
 *   .each(function(d) {
 *     var groupSelection = d3.select(this);
 *
 *     ... do something which creates a chart using groupSelection ...
 *   });
 *
 * @module sszvis/layout/smallMultiples
 *
 * @property {number} width           the total width of the collection of multiples
 * @property {number} height          the total height of the collection of multiples
 * @property {number} paddingX        x-padding to put between columns
 * @property {number} paddingY        y-padding to put between rows
 * @property {number} rows            the number of rows to generate
 * @property {number} cols            the number of columns to generate
 *
 * @return {d3.component}
 */
sszvis_namespace('sszvis.layout.smallMultiples', function(module) {
  'use strict';

  module.exports = function() {
    return d3.component()
      .prop('width')
      .prop('height')
      .prop('paddingX')
      .prop('paddingY')
      .prop('rows')
      .prop('cols')
      .render(function(data) {
        var selection = d3.select(this);
        var props = selection.props();

        var unitWidth = (props.width - props.paddingX * (props.cols - 1)) / props.cols;
        var unitHeight = (props.height - props.paddingY * (props.rows - 1)) / props.rows;

        var multiples = selection.selectAll('g.sszvis-multiple')
          .data(data);

        multiples.enter()
          .append('g')
          .classed('sszvis-g sszvis-multiple', true);

        multiples.exit().remove();

        var subGroups = multiples.selectAll('g.sszvis-multiple-chart')
          .data(function(d) {
            return [d.values];
          });

        subGroups.enter()
          .append('g')
          .classed('sszvis-multiple-chart', true);

        subGroups.exit().remove();

        multiples
          .datum(function(d, i) {
            d.gx = (i % props.cols) * (unitWidth + props.paddingX);
            d.gw = unitWidth;
            d.gy = Math.floor(i / props.cols) * (unitHeight + props.paddingY);
            d.gh = unitHeight;
            return d;
          })
          .attr('transform', function(d) {
            return 'translate(' + (d.gx) + ',' + (d.gy) + ')';
          });

      });
  };

});


//////////////////////////////////// SECTION ///////////////////////////////////


/**
 * Stacked Area Multiples Layout
 *
 * This function is used to compute layout parameters for the area multiples chart.
 *
 * @module sszvis/layout/stackedAreaMultiplesLayout
 *
 * @param  {number} height      The available height of the chart
 * @param  {number} num         The number of individual stacks to display
 * @param  {number} pct         the planned-for ratio between the space allotted to each area and the amount of space + area.
 *                              This value is used to compute the baseline positions for the areas, and how much vertical space to leave
 *                              between the areas.
 *
 * @return {object}             An object containing configuration properties for use in laying out the stacked area multiples.
 *                              {
 *                                range:          This is an array of baseline positions, counting from the top of the stack downwards.
 *                                                It should be used to configure a d3.scale.ordinal(). The values passed into the ordinal
 *                                                scale will be given a y-value which descends from the top of the stack, so that the resulting
 *                                                scale will match the organization scheme of sszvis.stackedArea. Use the ordinal scale to
 *                                                configure the sszvis.stackedAreaMultiples component.
 *                                bandHeight:     The height of each multiples band. This can be used to configure the within-area y-scale.
 *                                                This height represents the height of the y-axis of the individual area multiple.
 *                                padHeight:      This is the amount of vertical padding between each area multiple.
 *                              }
 */
sszvis_namespace('sszvis.layout.stackedAreaMultiplesLayout', function(module) {
  'use strict';

  module.exports = function(height, num, pct) {
    pct || (pct = 0.1);
    var step = height / (num - pct),
        bandHeight = step * (1 - pct),
        level = bandHeight, // count from the top, and start at the bottom of the first band
        range = [];
    while (level - height < 1) {
      range.push(level);
      level += step;
    }
    return {
      range: range,
      bandHeight: bandHeight,
      padHeight: step * pct
    };
  };

});


//////////////////////////////////// SECTION ///////////////////////////////////


/**
 * Vertical Bar Chart Dimensions
 *
 * Generates a dimension configuration object to be used for laying out the vertical bar chart.
 *
 * @module sszvis/layout/verticalBarChartDimensions
 *
 * @param  {number} width         the total width available to the horizontal bar chart. The computed chart layout is not guaranteed
 *                                to fit inside this width.
 * @param  {number} numBars       The number of bars in the bar chart.
 * @return {object}               An object containing configuration properties for use in laying out the vertical bar chart.
 *                                {
 *                                  barWidth:             the width of each bar in the bar chart
 *                                  padWidth:             the width of the padding between the bars in the bar chart
 *                                  padRatio:             the ratio between the padding and the step (barWidth + padding). This can be passed
 *                                                        as the second parameter to d3.scale.ordinal().rangeBands().
 *                                  outerRatio:           the outer ratio between the outer padding and the step. This can be passed as the
 *                                                        third parameter to d3.scale.ordinal().rangeBands().
 *                                  barGroupWidth:        the width of all the bars plus all the padding between the bars.
 *                                  totalWidth:           The total width of all bars, plus all inner and outer padding.
 *                                }
 */
sszvis_namespace('sszvis.layout.verticalBarChartDimensions', function(module) {
  'use strict';

  module.exports = function(width, numBars) {
    var MAX_BAR_WIDTH = 48, // the maximum width of a bar
        MIN_PADDING = 2, // the minimum padding value
        MAX_PADDING = 100, // the maximum padding value
        TARGET_BAR_RATIO = 0.70, // the ratio of width to width + padding used to compute the initial width and padding
        TARGET_PADDING_RATIO = 1 - TARGET_BAR_RATIO, // the inverse of the bar ratio, this is the ratio of padding to width + padding
        numPads = numBars - 1, // the number of padding spaces
        // compute the target size of the padding
        // the derivation of this equation is available upon request
        padding = (width * TARGET_PADDING_RATIO) / ((TARGET_PADDING_RATIO * numPads) + (TARGET_BAR_RATIO * numBars)),
        // based on the computed padding, calculate the bar width
        barWidth = (width - (padding * numPads)) / numBars;

    // adjust for min and max bounds
    if (barWidth > MAX_BAR_WIDTH) {
      barWidth = MAX_BAR_WIDTH;
      // recompute the padding value where necessary
      padding = (width - (barWidth * numBars)) / numPads;
    }
    if (padding < MIN_PADDING) padding = MIN_PADDING;
    if (padding > MAX_PADDING) padding = MAX_PADDING;

    // compute other information
    var padRatio = 1 - (barWidth / (barWidth + padding)),
        computedBarSpace = barWidth * numBars + padding * numPads,
        outerRatio = (width - computedBarSpace) / 2 / (barWidth + padding);

    return {
      barWidth: barWidth,
      padWidth: padding,
      padRatio: padRatio,
      outerRatio: outerRatio,
      barGroupWidth: computedBarSpace,
      totalWidth: width
    };
  };

});


//////////////////////////////////// SECTION ///////////////////////////////////


/**
 * Binned Color Scale Legend
 *
 * Use for displaying the values of discontinuous (binned) color scale's bins
 *
 * @module sszvis/legend/binnedColorScale
 *
 * @param {function} scale              A scale to use to generate the color values
 * @param {array} displayValues         An array of values which should be displayed. Usually these should be the bin edges
 * @param {array} endpoints             The endpoints of the scale (note that these are not necessarily the first and last
 *                                      bin edges). These will become labels at either end of the legend.
 * @param {number} width                The pixel width of the legend. Default 200
 * @param {function} labelFormat        A formatter function for the labels of the displayValues.
 *
 * @return {d3.component}
 */

sszvis_namespace('sszvis.legend.binnedColorScale', function(module) {
  'use strict';

  module.exports = function() {
    return d3.component()
      .prop('scale')
      .prop('displayValues')
      .prop('endpoints')
      .prop('width').width(200)
      .prop('labelFormat').labelFormat(sszvis.fn.identity)
      .render(function() {
        var selection = d3.select(this);
        var props = selection.props();

        if (!props.scale) return sszvis.logger.error('legend.binnedColorScale - a scale must be specified.');
        if (!props.displayValues) return sszvis.logger.error('legend.binnedColorScale - display values must be specified.');
        if (!props.endpoints) return sszvis.logger.error('legend.binnedColorScale - endpoints must be specified');

        var segHeight = 10;
        var circleRad = segHeight / 2;
        var innerRange = [0, props.width - (2 * circleRad)];

        var barWidth = d3.scale.linear()
          .domain(props.endpoints)
          .range(innerRange);
        var sum = 0;
        var rectData = [];
        var pPrev = props.endpoints[0];
        props.displayValues.forEach(function(p) {
          var w = barWidth(p) - sum;
          var offset = sum % 1;
          rectData.push({
            x: Math.floor(circleRad + sum),
            w: w + offset,
            c: props.scale(pPrev),
            p: p
          });
          sum += w;
          pPrev = p;
        });

        // add the final box (last display value - > endpoint)
        rectData.push({
          x: Math.floor(circleRad + sum),
          w: innerRange[1] - sum,
          c: props.scale(pPrev)
        });

        var circles = selection.selectAll('circle.sszvis-legend__circle')
          .data(props.endpoints);

        circles.enter()
          .append('circle')
          .classed('sszvis-legend__circle', true);

        circles.exit().remove();

        circles
          .attr('r', circleRad)
          .attr('cy', circleRad)
          .attr('cx', function(d, i) {
            return i === 0 ? circleRad : props.width - circleRad;
          })
          .attr('fill', props.scale);

        var segments = selection.selectAll('rect.sszvis-legend__crispmark')
          .data(rectData);

        segments.enter()
          .append('rect')
          .classed('sszvis-legend__crispmark', true);

        segments.exit().remove();

        segments
          .attr('x', function(d) { return d.x; })
          .attr('y', 0)
          .attr('width', function(d) { return d.w; })
          .attr('height', segHeight)
          .attr('fill', function(d) { return d.c; });

        var lineData = rectData.slice(0, -1);

        var lines = selection.selectAll('line.sszvis-legend__crispmark')
          .data(lineData);

        lines.enter()
          .append('line')
          .classed('sszvis-legend__crispmark', true);

        lines.exit().remove();

        lines
          .attr('x1', function(d) { return sszvis.svgUtils.crisp.halfPixel(d.x + d.w); })
          .attr('x2', function(d) { return sszvis.svgUtils.crisp.halfPixel(d.x + d.w); })
          .attr('y1', segHeight + 1)
          .attr('y2', segHeight + 6)
          .attr('stroke', '#B8B8B8');

        var labels = selection.selectAll('.sszvis-legend__axislabel')
          .data(lineData);

        labels.enter()
          .append('text')
          .classed('sszvis-legend__axislabel', true);

        labels.exit().remove();

        labels
          .style('text-anchor', 'middle')
          .attr('transform', function(d) { return 'translate(' + (d.x + d.w) + ',' + (segHeight + 20) + ')'; })
          .text(function(d) {
            return props.labelFormat(d.p);
          });
      });
  };

});


//////////////////////////////////// SECTION ///////////////////////////////////


/**
 * Linear Color Scale Legend
 *
 * Use for displaying the values of a continuous linear color scale.
 *
 * @module sszvis/legend/linearColorScale
 *
 * @property {function} scale                   The scale to use to generate the legend
 * @property {array} displayValues              A list of specific values to display. If not specified, defaults to using scale.ticks
 * @property {number} width                     The pixel width of the legend (default 200).
 * @property {number} segments                  The number of segments to aim for. Note, this is only used if displayValues isn't specified,
 *                                              and then it is passed as the argument to scale.ticks for finding the ticks. (default 8)
 * @property {array} labelText                  Text or a text-returning function to use as the titles for the legend endpoints. If not supplied,
 *                                              defaults to using the first and last tick values.
 * @property {function} labelFormat             An optional formatter function for the end labels. Usually should be sszvis.format.number.
 */
sszvis_namespace('sszvis.legend.linearColorScale', function(module) {
  'use strict';

  module.exports = function() {
    return d3.component()
      .prop('scale')
      .prop('displayValues').displayValues([])
      .prop('width').width(200)
      .prop('segments').segments(8)
      .prop('labelText')
      .prop('labelFormat').labelFormat(sszvis.fn.identity)
      .render(function() {
        var selection = d3.select(this);
        var props = selection.props();

        if (!props.scale) {
          sszvis.logger.error('legend.linearColorScale - a scale must be specified.');
          return false;
        }

        var values = props.displayValues;
        if (!values.length && props.scale.ticks) {
          values = props.scale.ticks(props.segments);
        }

        // Avoid division by zero
        var segWidth = values.length > 0 ? props.width / values.length : 0;
        var segHeight = 10;

        var segments = selection.selectAll('rect.sszvis-legend__mark')
          .data(values);

        segments.enter()
          .append('rect')
          .classed('sszvis-legend__mark', true);

        segments.exit().remove();

        segments
          .attr('x', function(d, i) { return i * segWidth - 1; }) // The offsets here cover up half-pixel antialiasing artifacts
          .attr('y', 0)
          .attr('width', segWidth + 1) // The offsets here cover up half-pixel antialiasing artifacts
          .attr('height', segHeight)
          .attr('fill', function(d) { return props.scale(d); });

        var startEnd = [values[0], values[values.length - 1]];
        var labelText = props.labelText || startEnd;

        // rounded end caps for the segments
        var endCaps = selection.selectAll('circle.ssvis-legend--mark')
          .data(startEnd);

        endCaps.enter()
          .append('circle')
          .attr('class', 'ssvis-legend--mark')
          .attr('cx', function(d, i) { return i * props.width; })
          .attr('cy', segHeight / 2)
          .attr('r', segHeight / 2)
          .attr('fill', function(d) { return props.scale(d); });

        endCaps.exit().remove();

        var labels = selection.selectAll('.sszvis-legend__label')
          .data(labelText);

        labels.enter()
          .append('text')
          .classed('sszvis-legend__label', true);

        labels.exit().remove();

        var labelPadding = 16;

        labels
          .style('text-anchor', function(d, i) { return i === 0 ? 'end' : 'start'; })
          .attr('dy', '0.35em') // vertically-center
          .attr('transform', function(d, i) { return 'translate(' + (i * props.width + (i === 0 ? -1 : 1) * labelPadding) + ', ' + (segHeight / 2) + ')'; })
          .text(function(d, i) {
            var formatted = props.labelFormat(d, i);
            return formatted;
          });
      });
  };

});


//////////////////////////////////// SECTION ///////////////////////////////////


/**
 * Ordinal Color Scale Legend
 *
 * This component is used for creating a legend for a categorical color scale.
 *
 * @module sszvis/legend/ordinalColorScale
 *
 * @property {d3.scale.ordinal()} scale         An ordinal scale which will be transformed into the legend.
 * @property {Number} rowHeight                 The height of the rows of the legend.
 * @property {Number} columnWidth               The width of the columns of the legend.
 * @property {Number} rows                      The target number of rows for the legend.
 * @property {Number} columns                    The target number of columns for the legend.
 * @property {String} orientation               The orientation (layout order) of the legend. should be either "horizontal" or "vertical". No default.
 * @property {Boolean} reverse                  Whether to reverse the order that categories appear in the legend. Default false
 * @property {Boolean} rightAlign               Whether to right-align the legend. Default false.
 * @property {Boolean} horizontalFloat          A true value changes the legend layout to the horizontal float version. Default false.
 * @property {Number} floatPadding              The amount of padding between elements in the horizontal float layout. Default 10px
 * @property {Number} floatWidth                The maximum width of the horizontal float layout. Default 600px
 *
 * The color legend works by iterating over the domain of the provided scale, and generating a legend entry for each
 * element in the domain. The entry consists of a label giving the category, and a circle colored with the category's
 * corresponding color. When props.rightAlign is false (the default), the circle comes before the name. When rightAlign
 * is true, the circle comes afterwards. The layout of these labels is governed by the other parameters.
 *
 * Default Layout:
 *
 * Because the labels are svg elements positioned with translate (and do not use the html box model layout algorithm),
 * rowHeight is necessary to provide the vertical height of each row. Generally speaking, 20px is fine for the default text size.
 * In the default layout, labels are organized into rows and columns in a gridded fashion. columnWidth is the total width of
 * any resulting columns. Note that if there is only one column, columnWidth is irrelevant.
 *
 * There are two orientation options for the row/column layout. The 'horizontal' orientation lays out elements from the input
 * domain into rows, creating new rows as necessary. For example, with three columns, the first three elements will form
 * the top row, then the next three in the second row, and so on. With 'vertical' orientation, labels are stacked into a column,
 * and new columns are added as necessary to hold all of the elements. Therefore, in the 'horizontal' orientation, the number of columns
 * is key, as this determines when a row ends and a new row begins. In the 'vertical' layout, the number of rows determines when to start
 * a new column.
 *
 * For the input set { A, B, C, D, E, F, G }
 *
 * Horizontal Orientation (3 columns):
 *
 *      A    B    C
 *      D    E    F
 *      G
 *
 * Horizontal Orientation (2 columns):
 *
 *     A    B
 *     C    D
 *     E    F
 *     G
 *
 * Vertical Orientation (3 rows):
 *
 *      A    D    G
 *      B    E
 *      C    F
 *
 * Vertical Orientation (2 rows):
 *
 *      A    C    E    G
 *      B    D    F
 *
 * If reverse is true, items from the input domain will be added to the layout in reversed order.
 *
 * For example, Horizontal Orientation (4 columns, reverse = true):
 *
 *    G    F    E    D
 *    C    B    A
 *
 * Horizontal Float Layout:
 *
 * If horizontalFloat is true, a different layout entirely is used, which relies on the width of each element
 * to compute the position of the next one. This layout always proceeds left-to-right first, then top-to-bottom
 * if the floatWidth would be exceeded by a new element. Between each element is an amount of padding configurable
 * using the floatPadding property.
 *
 * For the input set { foo, bar, qux, fooBar, baz, fooBarBaz, fooBaz, barFoo }
 *
 * Horizontal Float Layout (within a floatWidth identified by vertical pipes,
 * with 4 spaces of floatPadding).
 *
 * |foo    bar    qux|
 * |fooBar    baz    |      <--- not enough space for fooBarBaz
 * |fooBarBaz        |      <--- not enough space for padding + fooBaz
 * |fooBaz    barFoo |
 */

sszvis_namespace('sszvis.legend.ordinalColorScale', function(module) {
  'use strict';

  module.exports = function() {
    return d3.component()
      .prop('scale')
      .prop('rowHeight').rowHeight(21)
      .prop('columnWidth').columnWidth(200)
      .prop('rows').rows(3)
      .prop('columns').columns(3)
      .prop('orientation')
      .prop('reverse').reverse(false)
      .prop('rightAlign').rightAlign(false)
      .prop('horizontalFloat').horizontalFloat(false)
      .prop('floatPadding').floatPadding(20)
      .prop('floatWidth').floatWidth(600)
      .render(function() {
        var selection = d3.select(this);
        var props = selection.props();

        var domain = props.scale.domain();

        if (props.reverse) {
          domain = domain.slice().reverse();
        }

        var rows, cols;
        if (props.orientation === 'horizontal') {
          cols = Math.ceil(props.columns);
          rows = Math.ceil(domain.length / cols);
        } else if (props.orientation === 'vertical') {
          rows = Math.ceil(props.rows);
          cols = Math.ceil(domain.length / rows);
        }

        var groups = selection.selectAll('.sszvis-legend--entry')
          .data(domain);

        groups.enter()
          .append('g')
          .classed('sszvis-legend--entry', true);

        groups.exit().remove();

        var marks = groups.selectAll('.sszvis-legend__mark')
          .data(function(d) { return [d]; });

        marks.enter()
          .append('circle')
          .classed('sszvis-legend__mark', true);

        marks.exit().remove();

        marks
          .attr('cx', props.rightAlign ? -5 : 5)
          .attr('cy', sszvis.svgUtils.crisp.halfPixel(props.rowHeight / 2))
          .attr('r', 5)
          .attr('fill', function(d) { return props.scale(d); })
          .attr('stroke', function(d) { return props.scale(d); })
          .attr('stroke-width', 1);

        var labels = groups.selectAll('.sszvis-legend__label')
          .data(function(d) { return [d]; });

        labels.enter()
          .append('text')
          .classed('sszvis-legend__label', true);

        labels.exit().remove();

        labels
          .text(function(d) { return d; })
          .attr('dy', '0.35em') // vertically-center
          .style('text-anchor', function() { return props.rightAlign ? 'end' : 'start'; })
          .attr('transform', function() {
            var x = props.rightAlign ? -18 : 18;
            var y = sszvis.svgUtils.crisp.halfPixel(props.rowHeight / 2);
            return sszvis.svgUtils.translateString(x, y);
          });

        if (props.horizontalFloat) {
          var rowPosition = 0, horizontalPosition = 0;
          groups.attr('transform', function() {
            // not affected by scroll position
            var width = this.getBoundingClientRect().width;
            if (horizontalPosition + width > props.floatWidth) {
              rowPosition += props.rowHeight;
              horizontalPosition = 0;
            }
            var translate = sszvis.svgUtils.translateString(horizontalPosition, rowPosition);
            horizontalPosition += width + props.floatPadding;
            return translate;
          });
        } else {
          groups.attr('transform', function(d, i) {
            if (props.orientation === 'horizontal') {
              return 'translate(' + ((i % cols) * props.columnWidth) + ',' + (Math.floor(i / cols) * props.rowHeight) + ')';
            } else if (props.orientation === 'vertical') {
              return 'translate(' + (Math.floor(i / rows) * props.columnWidth) + ',' + ((i % rows) * props.rowHeight) + ')';
            }
          });
        }

      });
  };

});


//////////////////////////////////// SECTION ///////////////////////////////////


/**
 * Radius size legend
 *
 * Use for showing how different radius sizes correspond to data values.
 *
 * @module sszvis/legend/radius
 *
 * @property {function} scale         A scale to use to generate the radius sizes
 * @property {function} [tickFormat]  Formatter function for the labels (default identity)
 * @property {array} [tickValues]     An array of domain values to be used as radii that the legend shows
 *
 * @returns {d3.component}
 */
sszvis_namespace('sszvis.legend.radius', function(module) {
  'use strict';

  module.exports = function() {
    return d3.component()
      .prop('scale')
      .prop('tickFormat').tickFormat(sszvis.fn.identity)
      .prop('tickValues')
      .render(function() {
        var selection = d3.select(this);
        var props = selection.props();

        var domain = props.scale.domain();
        var tickValues = props.tickValues || [domain[1], Math.round(d3.mean(domain)), domain[0]];
        var maxRadius = sszvis.scale.range(props.scale)[1];

        var group = selection.selectAll('g.sszvis-legend__elementgroup')
          .data([0]);

        group.enter().append('g').attr('class', 'sszvis-legend__elementgroup');

        group.attr('transform', sszvis.svgUtils.translateString(sszvis.svgUtils.crisp.halfPixel(maxRadius), sszvis.svgUtils.crisp.halfPixel(maxRadius)));

        var circles = group.selectAll('circle.sszvis-legend__greyline')
          .data(tickValues);

        circles.enter()
          .append('circle')
          .classed('sszvis-legend__greyline', true);

        circles.exit().remove();

        function getCircleCenter(d) {
          return maxRadius - props.scale(d);
        }

        function getCircleEdge(d) {
          return maxRadius - 2 * props.scale(d);
        }

        circles
          .attr('r', props.scale)
          .attr('stroke-width', 1)
          .attr('cy', getCircleCenter);

        var lines = group.selectAll('line.sszvis-legend__dashedline')
          .data(tickValues);

        lines.enter()
          .append('line')
          .classed('sszvis-legend__dashedline', true);

        lines.exit().remove();

        lines
          .attr('x1', 0)
          .attr('y1', getCircleEdge)
          .attr('x2', maxRadius + 15)
          .attr('y2', getCircleEdge);

        var labels = group.selectAll('.sszvis-legend__label')
          .data(tickValues);

        labels.enter()
          .append('text')
          .attr('class', 'sszvis-legend__label sszvis-legend__label--small');

        labels.exit().remove();

        labels
          .attr('dx', maxRadius + 18)
          .attr('y', getCircleEdge)
          .attr('dy', '0.35em') // vertically-center
          .text(props.tickFormat);
      });
  };

});


//////////////////////////////////// SECTION ///////////////////////////////////


/*
 * A collection of utilities used by the map modules
 *
 * @module sszvis/map/utils
 */
sszvis_namespace('sszvis.map.utils', function(module) {
  'use strict';

  /**
   * This is a special d3.geo.path generator function tailored for rendering maps of
   * Switzerland. The values are chosen specifically to optimize path generation for
   * Swiss map regions and is not necessarily optimal for displaying other areas of the globe.
   *
   * @param  {number} width                  The width of the available map space
   * @param  {number} height                 The height of the available map space
   * @param  {GeoJson} featureCollection     The collection of features to be displayed in the map space
   * @return {d3.geo.path}                   A path generator function. This function takes a geojson datum as argument
   *                                         and returns an svg path string which represents that geojson, projected using
   *                                         a map projection optimal for Swiss areas.
   */
  module.exports.swissMapPath = function(width, height, featureCollection) {
    var mercatorProjection = d3.geo.mercator()
      .rotate([-7.439583333333333, -46.95240555555556]);

    mercatorProjection
      .scale(1)
      .translate([0, 0]);

    var mercatorPath = d3.geo.path()
      .projection(mercatorProjection);

    var b = mercatorPath.bounds(featureCollection),
        s = 1 / Math.max((b[1][0] - b[0][0]) / width, (b[1][1] - b[0][1]) / height),
        t = [(width - s * (b[1][0] + b[0][0])) / 2, (height - s * (b[1][1] + b[0][1])) / 2];

    mercatorProjection
      .scale(s)
      .translate(t);

    return mercatorPath;
  };

});


//////////////////////////////////// SECTION ///////////////////////////////////


/**
 * base renderer component
 *
 * @module sszvis/map/renderer/base
 *
 * A component used internally for rendering the base layer of maps.
 * These map entities have a color fill, which is possibly a pattern that represents
 * missing values. They are also event targets. If your map has nothing else, it should have a
 * base layer.
 *
 * @property {GeoJson} geoJson                        The GeoJson object to be rendered by this map layer.
 * @property {d3.geo.path} mapPath                    A path-generator function used to create the path data string of the provided GeoJson.
 * @property {String} keyName                         The data object key which will return a map entity id. Default 'geoId'.
 * @property {Boolean, Function} defined              A predicate function used to determine whether a datum has a defined value.
 *                                                    Map entities with data values that fail this predicate test will display the missing value texture.
 * @property {String, Function} fill                  A string or function for the fill of the map entities
 * @property {Boolean} transitionColor                Whether or not to transition the fill color of the map entities. (default: true)
 *
 * @return {d3.component}
 */
sszvis_namespace('sszvis.map.renderer.base', function(module) {
  'use strict';

  module.exports = function() {
    return d3.component()
      .prop('keyName').keyName('geoId') // the name of the data key that identifies which map entity it belongs to
      .prop('geoJson')
      .prop('mapPath')
      .prop('defined', d3.functor).defined(true) // a predicate function to determine whether a datum has a defined value
      .prop('fill', d3.functor).fill(function() { return 'black'; }) // a function for the entity fill color. default is black
      .prop('transitionColor').transitionColor(true)
      .render(function(data) {
        var selection = d3.select(this);
        var props = selection.props();

        // render the missing value pattern
        sszvis.svgUtils.ensureDefsElement(selection, 'pattern', 'missing-pattern')
          .call(sszvis.patterns.mapMissingValuePattern);

        // group the input data by map entity id
        var groupedInputData = data.reduce(function(m, v) {
          m[v[props.keyName]] = v;
          return m;
        }, {});

        // merge the map features and the input data into new objects that include both
        var mergedData = props.geoJson.features.map(function(feature) {
          return {
            geoJson: feature,
            datum: groupedInputData[feature.id]
          };
        });

        // map fill function - returns the missing value pattern if the datum doesn't exist or fails the props.defined test
        function getMapFill(d) {
          return sszvis.fn.defined(d.datum) && props.defined(d.datum) ? props.fill(d.datum) : 'url(#missing-pattern)';
        }

        var mapAreas = selection.selectAll('.sszvis-map__area')
          .data(mergedData);

        // add the base map paths - these are filled according to the map fill function
        mapAreas.enter()
          .append('path')
          .classed('sszvis-map__area', true)
          .attr('data-event-target', '')
          .attr('d', function(d) {
            return props.mapPath(d.geoJson);
          })
          .attr('fill', getMapFill);

        mapAreas.exit().remove();

        selection.selectAll('.sszvis-map__area--undefined')
          .attr('fill', getMapFill);

        // change the fill if necessary
        mapAreas
          .classed('sszvis-map__area--undefined', function(d) { return !props.defined(d.datum); });

        if (props.transitionColor) {
          mapAreas
            .transition()
            .call(sszvis.transition.slowTransition)
            .attr('fill', getMapFill);
        } else {
          mapAreas.attr('fill', getMapFill);
        }

        // the tooltip anchor generator
        var tooltipAnchor = sszvis.annotation.tooltipAnchor()
          .position(function(d) {
            var computedCenter = d.geoJson.properties.computedCenter;
            var center = d.geoJson.properties.center;
            if (computedCenter) {
              return computedCenter;
            } else if (center) {
              // properties.center should be a string of the form "longitude,latitude"
              var parsed = center.split(',').map(parseFloat);
              d.geoJson.properties.computedCenter = props.mapPath.projection()(parsed);
            } else {
              d.geoJson.properties.computedCenter = props.mapPath.centroid(d.geoJson);
            }
            return d.geoJson.properties.computedCenter;
          });

        var tooltipGroup = selection.selectGroup('tooltipAnchors')
          .datum(mergedData);

        // attach tooltip anchors
        tooltipGroup.call(tooltipAnchor);
      });
  };

});


//////////////////////////////////// SECTION ///////////////////////////////////


/**
 * mesh renderer component
 *
 * @module sszvis/map/renderer/mesh
 *
 * A component used internally for rendering the borders of all map entities as a single mesh.
 * This component expects a GeoJson object which is a single polyline for the entire mesh of all borders.
 * All borders will therefore be rendered as one continuous object, which is faster, more memory-efficient,
 * and prevents overlapping borders from creating strange rendering effects. The downside is that the entire
 * line must have a single set of styles which all borders share. To highlight individual borders, use the highlight renderer.
 *
 * @property {GeoJson} geoJson                        The GeoJson object to be rendered by this map layer.
 * @property {d3.geo.path} mapPath                    A path-generator function used to create the path data string of the provided GeoJson.
 * @property {string, function} borderColor           The color of the border path stroke. Default is white
 *
 * @return {d3.component}
 */
sszvis_namespace('sszvis.map.renderer.mesh', function(module) {
  'use strict';

  module.exports = function() {
    return d3.component()
      .prop('geoJson')
      .prop('mapPath')
      .prop('borderColor').borderColor('white') // A function or string for the color of all borders. Note: all borders have the same color
      .render(function() {
        var selection = d3.select(this);
        var props = selection.props();

        // add the map borders. These are rendered as one single path element
        var meshLine = selection
          .selectAll('.sszvis-map__border')
          .data([props.geoJson]);

        meshLine.enter()
          .append('path')
          .classed('sszvis-map__border', true);

        meshLine.exit().remove();

        meshLine
          .attr('d', props.mapPath)
          .attr('stroke', props.borderColor);
      });
  };

});


//////////////////////////////////// SECTION ///////////////////////////////////


/**
 * highlight renderer component
 *
 * @module sszvis/map/renderer/highlight
 *
 * A component used internally for rendering the highlight layer of maps.
 * The highlight layer accepts an array of data values to highlight, and renders
 * The map entities associated with those data values using a special stroke.
 *
 * @property {GeoJson} geoJson                        The GeoJson object to be rendered by this map layer.
 * @property {d3.geo.path} mapPath                    A path-generator function used to create the path data string of the provided GeoJson.
 * @property {String} keyName                         The data object key which will return a map entity id. Default 'geoId'.
 * @property {Array} highlight                        An array of data elements to highlight. The corresponding map entities are highlighted.
 * @property {String, Function} highlightStroke       A function for the stroke of the highlighted entities
 *
 * @return {d3.component}
 */
sszvis_namespace('sszvis.map.renderer.highlight', function(module) {
  'use strict';

  module.exports = function() {
    return d3.component()
      .prop('keyName').keyName('geoId') // the name of the data key that identifies which map entity it belongs to
      .prop('geoJson')
      .prop('mapPath')
      .prop('highlight').highlight([]) // an array of data values to highlight
      .prop('highlightStroke', d3.functor).highlightStroke('white') // a function for highlighted entity stroke colors (default: white)
      .render(function() {
        var selection = d3.select(this);
        var props = selection.props();

        var highlightBorders = selection
          .selectAll('.sszvis-map__highlight');

        if (!props.highlight.length) {
          highlightBorders.remove();
          return true; // no highlight, no worry
        }

        var groupedMapData = props.geoJson.features.reduce(function(m, feature) {
          m[feature.id] = feature;
          return m;
        }, {});

        // merge the highlight data
        var mergedHighlight = props.highlight.reduce(function(m, v) {
          if (v) {
            m.push({
              geoJson: groupedMapData[v[props.keyName]],
              datum: v
            });
          }
          return m;
        }, []);

        highlightBorders = highlightBorders.data(mergedHighlight);

        highlightBorders.enter()
          .append('path')
          .classed('sszvis-map__highlight', true);

        highlightBorders.exit().remove();

        highlightBorders
          .attr('d', function(d) {
            return props.mapPath(d.geoJson);
          })
          .attr('stroke', function(d) {
            return props.highlightStroke(d.datum);
          });
      });
  };

});


//////////////////////////////////// SECTION ///////////////////////////////////


/**
 * patternedlakeoverlay component
 *
 * @module sszvis/map/renderer/patternedlakeoverlay
 *
 * A component used internally for rendering Lake Zurich, and the borders of map entities which
 * lie above Lake Zurich.
 *
 * @property {d3.geo.path} mapPath      A path-generator function used to create the path data string of the provided GeoJson.
 * @property {GeoJson} lakeFeature      A GeoJson object which provides data for the outline shape of Lake Zurich. This shape will
 *                                      be filled with a special texture fill and masked with an alpha gradient fade.
 * @property {GeoJson} lakeBounds       A GeoJson object which provides data for the shape of map entity borders which lie over the
 *                                      lake. These borders will be drawn over the lake shape, as grey dotted lines.
 *
 * @return {d3.component}
 */
sszvis_namespace('sszvis.map.renderer.patternedlakeoverlay', function(module) {
  'use strict';

  module.exports = function() {
    return d3.component()
      .prop('mapPath')
      .prop('lakeFeature')
      .prop('lakeBounds')
      .render(function() {
        var selection = d3.select(this);
        var props = selection.props();

        // the lake texture
        sszvis.svgUtils.ensureDefsElement(selection, 'pattern', 'lake-pattern')
          .call(sszvis.patterns.mapLakePattern);

        // the fade gradient
        sszvis.svgUtils.ensureDefsElement(selection, 'linearGradient', 'lake-fade-gradient')
          .call(sszvis.patterns.mapLakeFadeGradient);

        // the mask, which uses the fade gradient
        sszvis.svgUtils.ensureDefsElement(selection, 'mask', 'lake-fade-mask')
          .call(sszvis.patterns.mapLakeGradientMask);

        // generate the Lake Zurich path
        var zurichSee = selection.selectAll('.sszvis-map__lakezurich')
          .data([props.lakeFeature]);

        zurichSee.enter()
          .append('path')
          .classed('sszvis-map__lakezurich', true);

        zurichSee.exit().remove();

        zurichSee
          .attr('d', props.mapPath)
          .attr('fill', 'url(#lake-pattern)')
          // this mask applies the fade effect
          .attr('mask', 'url(#lake-fade-mask)');

        // add a path for the boundaries of map entities which extend over the lake.
        // This path is rendered as a dotted line over the lake shape
        var lakePath = selection.selectAll('.sszvis-map__lakepath')
          .data([props.lakeBounds]);

        lakePath.enter()
          .append('path')
          .classed('sszvis-map__lakepath', true);

        lakePath.exit().remove();

        lakePath
          .attr('d', props.mapPath);
      });
  };

});


//////////////////////////////////// SECTION ///////////////////////////////////


/**
 * Crisp
 *
 * Utilities to render SVG elements crisply by placing them precisely on the
 * pixel grid. Rectangles should be placed on round pixels, lines and circles
 * on half-pixels.
 *
 * Example of rectangle placement (four • create one pixel)
 * •    •----•----•    •
 *      |         |
 * •    •----•----•    •
 *
 * Example of line placement (four • create one pixel)
 * •    •    •    •    •
 *    ---------------
 * •    •    •    •    •
 *
 * @module sszvis/svgUtils/crisp
 */

sszvis_namespace('sszvis.svgUtils.crisp', function(module) {
  'use strict';

  /**
   * crisp.halfPixel
   *
   * To ensure SVG elements are rendered crisply and without anti-aliasing
   * artefacts, they must be placed on a half-pixel grid.
   *
   * @param  {number} pos A pixel position
   * @return {number}     A pixel position snapped to the pixel grid
   */
  module.exports.halfPixel = function(pos) {
    return Math.floor(pos) + 0.5;
  };


  /**
   * crisp.roundTransformString
   *
   * Takes an SVG transform string 'translate(12.3,4.56789) rotate(3.5)' and
   * rounds all translate coordinates to integers: 'translate(12,5) rotate(3.5)'.
   *
   * A valid translate instruction has the form 'translate(<x> [<y>])' where
   * x and y can be separated by a space or comma. We normalize this to use
   * spaces because that's what Internet Explorer uses.
   *
   * @param  {string} transformStr A valid SVG transform string
   * @return {string}              An SVG transform string with rounded values
   */
  module.exports.roundTransformString = function(transformStr) {
    var roundNumber = sszvis.fn.compose(Math.floor, Number);
    return transformStr.replace(/(translate\()\s*([0-9., ]+)\s*(\))/i, function(_, left, vecStr, right) {
      var roundVec = vecStr
        .replace(',', ' ')
        .replace(/\s+/, ' ')
        .split(' ')
        .map(roundNumber)
        .join(',');
      return left + roundVec + right;
    });
  };


  /**
   * crisp.transformTranslateSubpixelShift
   *
   * This helper function takes a transform string and returns a vector that
   * tells us how much to shift an element in order to place it on a half-pixel
   * grid.
   *
   * @param  {string} transformStr A valid SVG transform string
   * @return {vecor}               Two-element array ([dx, dy])
   */
  module.exports.transformTranslateSubpixelShift = function(transformStr) {
    var roundNumber = sszvis.fn.compose(Math.floor, Number);
    var m = transformStr.match(/(translate\()\s*([0-9.,\- ]+)\s*(\))/i);
    var vec = m[2]
      .replace(',', ' ')
      .replace(/\s+/, ' ')
      .split(' ')
      .map(Number);

    if (vec.length === 1) vec.push([0]);

    var vecRound = vec.map(roundNumber);
    return [vec[0] - vecRound[0], vec[1] - vecRound[1]];
  };

});


//////////////////////////////////// SECTION ///////////////////////////////////


/**
 * Ensure Defs Element
 *
 * This method ensures that the provided selection contains a 'defs' object,
 * and furthermore, that the defs object contains an instance of the provided
 * element type, with the provided ID.
 *
 * @module sszvis/svgUtils/ensureDefsElement
 *
 * @param {d3.selection} selection
 * @param {string}       type       Element to create
 * @param {string}       elementId  The ID to assign to the created element
 */
sszvis_namespace('sszvis.svgUtils.ensureDefsElement', function(module) {
  'use strict';

  module.exports = function(selection, type, elementId) {
    var element = ensureDefsSelection(selection)
      .selectAll(type + '#' + elementId)
      .data([0])
      .enter()
      .append(type)
      .attr('id', elementId);

    return element;
  };


  /* Helper functions
  ----------------------------------------------- */

  /**
   * This method ensures that the provided selection contains a 'defs' object,
   * which is required for rendering patterns. SVG elements rendered into a defs
   * container will not be displayed, but can be referenced by ID in the fill property
   * of other, visible, elements.
   */
  function ensureDefsSelection(selection) {
    var defs = selection.selectAll('defs')
      .data([0]);

    defs.enter()
      .append('defs');

    return defs;
  }

});


//////////////////////////////////// SECTION ///////////////////////////////////


/**
 * ModularText component
 *
 * Create structured text with formatting and newlines. Use either the HTML or
 * SVG variant, depending on the output you expect.
 *
 * @module sszvis/svgUtils/modularText/html
 * @module sszvis/svgUtils/modularText/svg
 *
 * @example HTML
 * var fmtHtml = sszvis.svgUtils.modularText.html()
 *   .plain('Artist:')
 *   .plain(function(d) { return d.name; })
 *   .newline()
 *   .bold(function(d) { return d.age; })
 *   .italic('years old');
 * fmtHtml({name: 'Patti', age: 67});
 * //=> "Artist: Patti<br/><strong>67</strong> <em>years old</em>"
 *
 * @example SVG
 * var fmtSvg = sszvis.svgUtils.modularText.svg()
 *   .bold(function(d) { return d.items; })
 *   .plain('items');
 * fmtSvg({items: 30});
 * //=> "<tspan x="0" dy="0"><tspan style="font-weight:bold">30</tspan> <tspan>items</tspan></tspan>"
 *
 * @property {string, function} plain  String without formatting
 * @property {string, function} italic String with italic style
 * @property {string, function} bold   String with bold style
 * @property newline                   Insert a line break
 *
 * @return {function} Formatting function that accepts a datum
 */
sszvis_namespace('sszvis.svgUtils.modularText', function(module) {
  'use strict';

  function formatHTML() {
    var styles = {
      plain: function(d){ return d;},
      italic: function(d){ return '<em>' + d + '</em>';},
      bold: function(d){ return '<strong>' + d + '</strong>';}
    };

    return function(textBody, datum) {
      return textBody.lines().map(function(line) {
        return line.map(function(word) {
          return styles[word.style].call(null, word.text(datum));
        }).join(' ');
      }).join('<br/>');
    };
  }

  function formatSVG() {
    var styles = {
      plain: function(d){ return '<tspan>' + d + '</tspan>'; },
      italic: function(d){ return '<tspan style="font-style:italic">' + d + '</tspan>'; },
      bold: function(d){ return '<tspan style="font-weight:bold">' + d + '</tspan>'; }
    };

    return function(textBody, datum) {
      return textBody.lines().reduce(function(svg, line, i) {
        var lineSvg = line.map(function(word) {
          return styles[word.style].call(null, word.text(datum));
        }).join(' ');
        var dy = (i === 0) ? 0 : '1.2em';
        return svg + '<tspan x="0" dy="'+ dy +'">' + lineSvg + '</tspan>';
      }, '');
    };
  }

  function structuredText() {
    var lines = [[]];

    return {
      addLine: function() {
        lines.push([]);
      },

      addWord: function(style, text) {
        sszvis.fn.last(lines).push({
          text: d3.functor(text),
          style: style
        });
      },

      lines: function() {
        return lines;
      }
    };
  }

  function makeTextWithFormat(format) {
    return function() {
      var textBody = structuredText();

      function makeText(d) {
        return format(textBody, d);
      }

      makeText.newline = function() {
        textBody.addLine();
        return makeText;
      };

      ['bold', 'italic', 'plain'].forEach(function(style) {
        makeText[style] = function(text) {
          textBody.addWord(style, text);
          return makeText;
        };
      });

      return makeText;
    };
  }

  module.exports = {
    html: makeTextWithFormat(formatHTML()),
    svg:  makeTextWithFormat(formatSVG())
  };

});


//////////////////////////////////// SECTION ///////////////////////////////////


/**
 * Text wrap
 *
 * Function allowing to 'wrap' the text from an SVG <text> element with <tspan>.
 *
 * @module sszvis/svgUtils/textWrap
 *
 * Based on https://github.com/mbostock/d3/issues/1642
 * @example svg.append("g")
 *      .attr("class", "x axis")
 *      .attr("transform", "translate(0," + height + ")")
 *      .call(xAxis)
 *      .selectAll(".tick text")
 *          .call(d3TextWrap, x.rangeBand());
 *
 * @param text d3 selection for one or more <text> object
 * @param width number - global width in which the text will be word-wrapped.
 * @param paddingRightLeft integer - Padding right and left between the wrapped text and the 'invisible bax' of 'width' width
 * @param paddingTopBottom integer - Padding top and bottom between the wrapped text and the 'invisible bax' of 'width' width
 * @returns Array[number] - Number of lines created by the function, stored in a Array in case multiple <text> element are passed to the function
 */
sszvis_namespace('sszvis.svgUtils.textWrap', function(module) {
  'use strict';

  module.exports = function(text, width, paddingRightLeft, paddingTopBottom) {
    paddingRightLeft = paddingRightLeft || 5; //Default padding (5px)
    paddingTopBottom = (paddingTopBottom || 5) - 2; //Default padding (5px), remove 2 pixels because of the borders
    var maxWidth = width; //I store the tooltip max width
    width = width - (paddingRightLeft * 2); //Take the padding into account

    var arrLineCreatedCount = [];
    text.each(function() {
      var text = d3.select(this);
      var words = text.text().split(/[ \f\n\r\t\v]+/).reverse(); //Don't cut non-breaking space (\xA0), as well as the Unicode characters \u00A0 \u2028 \u2029)
      var word;
      var line = [];
      var lineNumber = 0;
      var lineHeight = 1.1; //Em
      var x;
      var y = text.attr('y');
      var dy = parseFloat(text.attr('dy'));
      var createdLineCount = 1; //Total line created count
      var textAlign = text.style('text-anchor') || 'start'; //'start' by default (start, middle, end, inherit)

      //Clean the data in case <text> does not define those values
      if (isNaN(dy)) dy = 0; //Default padding (0em) : the 'dy' attribute on the first <tspan> _must_ be identical to the 'dy' specified on the <text> element, or start at '0em' if undefined

      //Offset the text position based on the text-anchor
      var wrapTickLabels = d3.select(text.node().parentNode).classed('tick'); //Don't wrap the 'normal untranslated' <text> element and the translated <g class='tick'><text></text></g> elements the same way..
      if (wrapTickLabels) {
        switch (textAlign) {
          case 'start':
          x = -width / 2;
          break;
          case 'middle':
          x = 0;
          break;
          case 'end':
          x = width / 2;
          break;
          default :
        }
      } else { //untranslated <text> elements
        switch (textAlign) {
          case 'start':
          x = paddingRightLeft;
          break;
          case 'middle':
          x = maxWidth / 2;
          break;
          case 'end':
          x = maxWidth - paddingRightLeft;
          break;
          default :
        }
      }
      y = +((null === y)?paddingTopBottom:y);

      var tspan = text.text(null).append('tspan').attr('x', x).attr('y', y).attr('dy', dy + 'em');

      while (words.length > 0) {
        word = words.pop();
        line.push(word);
        tspan.text(line.join(' '));
        if (tspan.node().getComputedTextLength() > width && line.length > 1) {
          line.pop();
          tspan.text(line.join(' '));
          line = [word];
          tspan = text.append('tspan').attr('x', x).attr('y', y).attr('dy', ++lineNumber * lineHeight + dy + 'em').text(word);
          ++createdLineCount;
        }
      }

      arrLineCreatedCount.push(createdLineCount); //Store the line count in the array
    });
    return arrLineCreatedCount;
  };

});


//////////////////////////////////// SECTION ///////////////////////////////////


/**
 * translateString
 *
 * Pass an x and a y component, and this returns a translate string, which can be set as the 'transform' property of
 * an svg element.
 *
 * @module sszvis/svgUtils/translateString
 *
 * @param  {number} x     The x-component of the transform
 * @param  {number} y     The y-component of the transform
 * @return {string}       The translate string
 */
sszvis_namespace('sszvis.svgUtils.translateString', function(module) {
  'use strict';

  module.exports = function(x, y) {
    return 'translate(' + x + ',' + y + ')';
  };

});
