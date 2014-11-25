/**
 * @license
 * Copyright (c) 2014 The Polymer Project Authors. All rights reserved.
 * This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
 * The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
 * The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
 * Code distributed by Google as part of the polymer project is also
 * subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
 */

(function(scope) {
  'use strict';

  var forwardMethodsToWrapper = scope.forwardMethodsToWrapper;
  var getTreeScope = scope.getTreeScope;
  var mixin = scope.mixin;
  var registerWrapper = scope.registerWrapper;
  var setWrapper = scope.setWrapper;
  var unsafeUnwrap = scope.unsafeUnwrap;
  var unwrap = scope.unwrap;
  var wrap = scope.wrap;
  var wrappers = scope.wrappers;

  var wrappedFuns = new WeakMap();
  var listenersTable = new WeakMap();
  var handledEventsTable = new WeakMap();
  var currentlyDispatchingEvents = new WeakMap();
  var targetTable = new WeakMap();
  var currentTargetTable = new WeakMap();
  var relatedTargetTable = new WeakMap();
  var eventPhaseTable = new WeakMap();
  var stopPropagationTable = new WeakMap();
  var stopImmediatePropagationTable = new WeakMap();
  var eventHandlersTable = new WeakMap();
  var eventPathTable = new WeakMap();

  function isShadowRoot(node) {
    return node instanceof wrappers.ShadowRoot;
  }

  function rootOfNode(node) {
    return getTreeScope(node).root;
  }

  // http://w3c.github.io/webcomponents/spec/shadow/#event-paths
  function getEventPath(node, event) {
    var path = [];
    var current = node;
    path.push(current);
    while (current) {
      // 4.1.
      var destinationInsertionPoints = getDestinationInsertionPoints(current);
      if (destinationInsertionPoints && destinationInsertionPoints.length > 0) {
        // 4.1.1
        for (var i = 0; i < destinationInsertionPoints.length; i++) {
          var insertionPoint = destinationInsertionPoints[i];
          // 4.1.1.1
          if (isShadowInsertionPoint(insertionPoint)) {
            var shadowRoot = rootOfNode(insertionPoint);
            // 4.1.1.1.2
            var olderShadowRoot = shadowRoot.olderShadowRoot;
            if (olderShadowRoot)
              path.push(olderShadowRoot);
          }

          // 4.1.1.2
          path.push(insertionPoint);
        }

        // 4.1.2
        current = destinationInsertionPoints[
            destinationInsertionPoints.length - 1];

      // 4.2
      } else {
        if (isShadowRoot(current)) {
          if (inSameTree(node, current) && eventMustBeStopped(event)) {
            // Stop this algorithm
            break;
          }
          current = current.host;
          path.push(current);

        // 4.2.2
        } else {
          current = current.parentNode;
          if (current)
            path.push(current);
        }
      }
    }

    return path;
  }

  // http://w3c.github.io/webcomponents/spec/shadow/#dfn-events-always-stopped
  function eventMustBeStopped(event) {
    if (!event)
      return false;

    switch (event.type) {
      case 'abort':
      case 'error':
      case 'select':
      case 'change':
      case 'load':
      case 'reset':
      case 'resize':
      case 'scroll':
      case 'selectstart':
        return true;
    }
    return false;
  }

  // http://w3c.github.io/webcomponents/spec/shadow/#dfn-shadow-insertion-point
  function isShadowInsertionPoint(node) {
    return node instanceof HTMLShadowElement;
    // and make sure that there are no shadow precing this?
    // and that there is no content ancestor?
  }

  function getDestinationInsertionPoints(node) {
    return scope.getDestinationInsertionPoints(node);
  }

  // http://w3c.github.io/webcomponents/spec/shadow/#event-retargeting
  function eventRetargetting(path, currentTarget) {
    if (path.length === 0)
      return currentTarget;

    // The currentTarget might be the window object. Use its document for the
    // purpose of finding the retargetted node.
    if (currentTarget instanceof wrappers.Window)
      currentTarget = currentTarget.document;

    var currentTargetTree = getTreeScope(currentTarget);
    var originalTarget = path[0];
    var originalTargetTree = getTreeScope(originalTarget);
    var relativeTargetTree =
        lowestCommonInclusiveAncestor(currentTargetTree, originalTargetTree);

    for (var i = 0; i < path.length; i++) {
      var node = path[i];
      if (getTreeScope(node) === relativeTargetTree)
        return node;
    }

    return path[path.length - 1];
  }

  function getTreeScopeAncestors(treeScope) {
    var ancestors = [];
    for (;treeScope; treeScope = treeScope.parent) {
      ancestors.push(treeScope);
    }
    return ancestors;
  }

  function lowestCommonInclusiveAncestor(tsA, tsB) {
    var ancestorsA = getTreeScopeAncestors(tsA);
    var ancestorsB = getTreeScopeAncestors(tsB);

    var result = null;
    while (ancestorsA.length > 0 && ancestorsB.length > 0) {
      var a = ancestorsA.pop();
      var b = ancestorsB.pop();
      if (a === b)
        result = a;
      else
        break;
    }
    return result;
  }

  function getTreeScopeRoot(ts) {
    if (!ts.parent)
      return ts;
    return getTreeScopeRoot(ts.parent);
  }

  function relatedTargetResolution(event, currentTarget, relatedTarget) {
    // In case the current target is a window use its document for the purpose
    // of retargetting the related target.
    if (currentTarget instanceof wrappers.Window)
      currentTarget = currentTarget.document;

    var currentTargetTree = getTreeScope(currentTarget);
    var relatedTargetTree = getTreeScope(relatedTarget);

    var relatedTargetEventPath = getEventPath(relatedTarget, event);

    var lowestCommonAncestorTree;

    // 4
    var lowestCommonAncestorTree =
        lowestCommonInclusiveAncestor(currentTargetTree, relatedTargetTree);

    // 5
    if (!lowestCommonAncestorTree)
      lowestCommonAncestorTree = relatedTargetTree.root;

    // 6
    for (var commonAncestorTree = lowestCommonAncestorTree;
         commonAncestorTree;
         commonAncestorTree = commonAncestorTree.parent) {
      // 6.1
      var adjustedRelatedTarget;
      for (var i = 0; i < relatedTargetEventPath.length; i++) {
        var node = relatedTargetEventPath[i];
        if (getTreeScope(node) === commonAncestorTree)
          return node;
      }
    }

    return null;
  }

  function inSameTree(a, b) {
    return getTreeScope(a) === getTreeScope(b);
  }

  var NONE = 0;
  var CAPTURING_PHASE = 1;
  var AT_TARGET = 2;
  var BUBBLING_PHASE = 3;

  // pendingError is used to rethrow the first error we got during an event
  // dispatch. The browser actually reports all errors but to do that we would
  // need to rethrow the error asynchronously.
  var pendingError;

  function dispatchOriginalEvent(originalEvent) {
    // Make sure this event is only dispatched once.
    if (handledEventsTable.get(originalEvent))
      return;
    handledEventsTable.set(originalEvent, true);
    dispatchEvent(wrap(originalEvent), wrap(originalEvent.target));
    if (pendingError) {
      var err = pendingError;
      pendingError = null;
      throw err;
    }
  }


  function isLoadLikeEvent(event) {
    switch (event.type) {
      // http://www.whatwg.org/specs/web-apps/current-work/multipage/webappapis.html#events-and-the-window-object
      case 'load':
      // http://www.whatwg.org/specs/web-apps/current-work/multipage/browsers.html#unloading-documents
      case 'beforeunload':
      case 'unload':
        return true;
    }
    return false;
  }

  function dispatchEvent(event, originalWrapperTarget) {
    if (currentlyDispatchingEvents.get(event))
      throw new Error('InvalidStateError');

    currentlyDispatchingEvents.set(event, true);

    // Render to ensure that the event path is correct.
    scope.renderAllPending();
    var eventPath;

    // http://www.whatwg.org/specs/web-apps/current-work/multipage/webappapis.html#events-and-the-window-object
    // All events dispatched on Nodes with a default view, except load events,
    // should propagate to the Window.

    // http://www.whatwg.org/specs/web-apps/current-work/multipage/the-end.html#the-end
    var overrideTarget;
    var win;

    // Should really be not cancelable too but since Firefox has a bug there
    // we skip that check.
    // https://bugzilla.mozilla.org/show_bug.cgi?id=999456
    if (isLoadLikeEvent(event) && !event.bubbles) {
      var doc = originalWrapperTarget;
      if (doc instanceof wrappers.Document && (win = doc.defaultView)) {
        overrideTarget = doc;
        eventPath = [];
      }
    }

    if (!eventPath) {
      if (originalWrapperTarget instanceof wrappers.Window) {
        win = originalWrapperTarget;
        eventPath = [];
      } else {
        eventPath = getEventPath(originalWrapperTarget, event);

        if (!isLoadLikeEvent(event)) {
          var doc = eventPath[eventPath.length - 1];
          if (doc instanceof wrappers.Document)
            win = doc.defaultView;
        }
      }
    }

    eventPathTable.set(event, eventPath);

    if (dispatchCapturing(event, eventPath, win, overrideTarget)) {
      if (dispatchAtTarget(event, eventPath, win, overrideTarget)) {
        dispatchBubbling(event, eventPath, win, overrideTarget);
      }
    }

    eventPhaseTable.set(event, NONE);
    currentTargetTable.delete(event, null);
    currentlyDispatchingEvents.delete(event);

    return event.defaultPrevented;
  }

  function dispatchCapturing(event, eventPath, win, overrideTarget) {
    var phase = CAPTURING_PHASE;

    if (win) {
      if (!invoke(win, event, phase, eventPath, overrideTarget))
        return false;
    }

    for (var i = eventPath.length - 1; i > 0; i--) {
      if (!invoke(eventPath[i], event, phase, eventPath, overrideTarget))
        return false;
    }

    return true;
  }

  function dispatchAtTarget(event, eventPath, win, overrideTarget) {
    var phase = AT_TARGET;
    var currentTarget = eventPath[0] || win;
    return invoke(currentTarget, event, phase, eventPath, overrideTarget);
  }

  function dispatchBubbling(event, eventPath, win, overrideTarget) {
    var phase = BUBBLING_PHASE;
    for (var i = 1; i < eventPath.length; i++) {
      if (!invoke(eventPath[i], event, phase, eventPath, overrideTarget))
        return;
    }

    if (win && eventPath.length > 0) {
      invoke(win, event, phase, eventPath, overrideTarget);
    }
  }

  function invoke(currentTarget, event, phase, eventPath, overrideTarget) {
    var listeners = listenersTable.get(currentTarget);
    if (!listeners)
      return true;

    var target = overrideTarget || eventRetargetting(eventPath, currentTarget);

    if (target === currentTarget) {
      if (phase === CAPTURING_PHASE)
        return true;

      if (phase === BUBBLING_PHASE)
         phase = AT_TARGET;

    } else if (phase === BUBBLING_PHASE && !event.bubbles) {
      return true;
    }

    if ('relatedTarget' in event) {
      var originalEvent = unwrap(event);
      var unwrappedRelatedTarget = originalEvent.relatedTarget;

      // X-Tag sets relatedTarget on a CustomEvent. If they do that there is no
      // way to have relatedTarget return the adjusted target but worse is that
      // the originalEvent might not have a relatedTarget so we hit an assert
      // when we try to wrap it.
      if (unwrappedRelatedTarget) {
        // In IE we can get objects that are not EventTargets at this point.
        // Safari does not have an EventTarget interface so revert to checking
        // for addEventListener as an approximation.
        if (unwrappedRelatedTarget instanceof Object &&
            unwrappedRelatedTarget.addEventListener) {
          var relatedTarget = wrap(unwrappedRelatedTarget);

          var adjusted =
              relatedTargetResolution(event, currentTarget, relatedTarget);
          if (adjusted === target)
            return true;
        } else {
          adjusted = null;
        }
        relatedTargetTable.set(event, adjusted);
      }
    }

    eventPhaseTable.set(event, phase);
    var type = event.type;

    var anyRemoved = false;
    targetTable.set(event, target);
    currentTargetTable.set(event, currentTarget);

    // Keep track of the invoke depth so that we only clean up the removed
    // listeners if we are in the outermost invoke.
    listeners.depth++;

    for (var i = 0, len = listeners.length; i < len; i++) {
      var listener = listeners[i];
      if (listener.removed) {
        anyRemoved = true;
        continue;
      }

      if (listener.type !== type ||
          !listener.capture && phase === CAPTURING_PHASE ||
          listener.capture && phase === BUBBLING_PHASE) {
        continue;
      }

      try {
        if (typeof listener.handler === 'function')
          listener.handler.call(currentTarget, event);
        else
          listener.handler.handleEvent(event);

        if (stopImmediatePropagationTable.get(event))
          return false;

      } catch (ex) {
        if (!pendingError)
          pendingError = ex;
      }
    }

    listeners.depth--;

    if (anyRemoved && listeners.depth === 0) {
      var copy = listeners.slice();
      listeners.length = 0;
      for (var i = 0; i < copy.length; i++) {
        if (!copy[i].removed)
          listeners.push(copy[i]);
      }
    }

    return !stopPropagationTable.get(event);
  }

  function Listener(type, handler, capture) {
    this.type = type;
    this.handler = handler;
    this.capture = Boolean(capture);
  }
  Listener.prototype = {
    equals: function(that) {
      return this.handler === that.handler && this.type === that.type &&
          this.capture === that.capture;
    },
    get removed() {
      return this.handler === null;
    },
    remove: function() {
      this.handler = null;
    }
  };

  var OriginalEvent = window.Event;
  OriginalEvent.prototype.polymerBlackList_ = {
    returnValue: true,
    // TODO(arv): keyLocation is part of KeyboardEvent but Firefox does not
    // support constructable KeyboardEvent so we keep it here for now.
    keyLocation: true
  };

  /**
   * Creates a new Event wrapper or wraps an existin native Event object.
   * @param {string|Event} type
   * @param {Object=} options
   * @constructor
   */
  function Event(type, options) {
    if (type instanceof OriginalEvent) {
      var impl = type;
      // In browsers that do not correctly support BeforeUnloadEvent we get to
      // the generic Event wrapper but we still want to ensure we create a
      // BeforeUnloadEvent. Since BeforeUnloadEvent calls super, we need to
      // prevent reentrancty.
      if (!OriginalBeforeUnloadEvent && impl.type === 'beforeunload' &&
          !(this instanceof BeforeUnloadEvent)) {
        return new BeforeUnloadEvent(impl);
      }
      setWrapper(impl, this);
    } else {
      return wrap(constructEvent(OriginalEvent, 'Event', type, options));
    }
  }
  Event.prototype = {
    get target() {
      return targetTable.get(this);
    },
    get currentTarget() {
      return currentTargetTable.get(this);
    },
    get eventPhase() {
      return eventPhaseTable.get(this);
    },
    get path() {
      var eventPath = eventPathTable.get(this);
      if (!eventPath)
        return [];
      // TODO(arv): Event path should contain window.
      return eventPath.slice();
    },
    stopPropagation: function() {
      stopPropagationTable.set(this, true);
    },
    stopImmediatePropagation: function() {
      stopPropagationTable.set(this, true);
      stopImmediatePropagationTable.set(this, true);
    }
  };
  registerWrapper(OriginalEvent, Event, document.createEvent('Event'));

  function unwrapOptions(options) {
    if (!options || !options.relatedTarget)
      return options;
    return Object.create(options, {
      relatedTarget: {value: unwrap(options.relatedTarget)}
    });
  }

  function registerGenericEvent(name, SuperEvent, prototype) {
    var OriginalEvent = window[name];
    var GenericEvent = function(type, options) {
      if (type instanceof OriginalEvent)
        setWrapper(type, this);
      else
        return wrap(constructEvent(OriginalEvent, name, type, options));
    };
    GenericEvent.prototype = Object.create(SuperEvent.prototype);
    if (prototype)
      mixin(GenericEvent.prototype, prototype);
    if (OriginalEvent) {
      // - Old versions of Safari fails on new FocusEvent (and others?).
      // - IE does not support event constructors.
      // - createEvent('FocusEvent') throws in Firefox.
      // => Try the best practice solution first and fallback to the old way
      // if needed.
      try {
        registerWrapper(OriginalEvent, GenericEvent, new OriginalEvent('temp'));
      } catch (ex) {
        registerWrapper(OriginalEvent, GenericEvent,
                        document.createEvent(name));
      }
    }
    return GenericEvent;
  }

  var UIEvent = registerGenericEvent('UIEvent', Event);
  var CustomEvent = registerGenericEvent('CustomEvent', Event);

  var relatedTargetProto = {
    get relatedTarget() {
      var relatedTarget = relatedTargetTable.get(this);
      // relatedTarget can be null.
      if (relatedTarget !== undefined)
        return relatedTarget;
      return wrap(unwrap(this).relatedTarget);
    }
  };

  function getInitFunction(name, relatedTargetIndex) {
    return function() {
      arguments[relatedTargetIndex] = unwrap(arguments[relatedTargetIndex]);
      var impl = unwrap(this);
      impl[name].apply(impl, arguments);
    };
  }

  var mouseEventProto = mixin({
    initMouseEvent: getInitFunction('initMouseEvent', 14)
  }, relatedTargetProto);

  var focusEventProto = mixin({
    initFocusEvent: getInitFunction('initFocusEvent', 5)
  }, relatedTargetProto);

  var MouseEvent = registerGenericEvent('MouseEvent', UIEvent, mouseEventProto);
  var FocusEvent = registerGenericEvent('FocusEvent', UIEvent, focusEventProto);

  // In case the browser does not support event constructors we polyfill that
  // by calling `createEvent('Foo')` and `initFooEvent` where the arguments to
  // `initFooEvent` are derived from the registered default event init dict.
  var defaultInitDicts = Object.create(null);

  var supportsEventConstructors = (function() {
    try {
      new window.FocusEvent('focus');
    } catch (ex) {
      return false;
    }
    return true;
  })();

  /**
   * Constructs a new native event.
   */
  function constructEvent(OriginalEvent, name, type, options) {
    if (supportsEventConstructors)
      return new OriginalEvent(type, unwrapOptions(options));

    // Create the arguments from the default dictionary.
    var event = unwrap(document.createEvent(name));
    var defaultDict = defaultInitDicts[name];
    var args = [type];
    Object.keys(defaultDict).forEach(function(key) {
      var v = options != null && key in options ?
          options[key] : defaultDict[key];
      if (key === 'relatedTarget')
        v = unwrap(v);
      args.push(v);
    });
    event['init' + name].apply(event, args);
    return event;
  }

  if (!supportsEventConstructors) {
    var configureEventConstructor = function(name, initDict, superName) {
      if (superName) {
        var superDict = defaultInitDicts[superName];
        initDict = mixin(mixin({}, superDict), initDict);
      }

      defaultInitDicts[name] = initDict;
    };

    // The order of the default event init dictionary keys is important, the
    // arguments to initFooEvent is derived from that.
    configureEventConstructor('Event', {bubbles: false, cancelable: false});
    configureEventConstructor('CustomEvent', {detail: null}, 'Event');
    configureEventConstructor('UIEvent', {view: null, detail: 0}, 'Event');
    configureEventConstructor('MouseEvent', {
      screenX: 0,
      screenY: 0,
      clientX: 0,
      clientY: 0,
      ctrlKey: false,
      altKey: false,
      shiftKey: false,
      metaKey: false,
      button: 0,
      relatedTarget: null
    }, 'UIEvent');
    configureEventConstructor('FocusEvent', {relatedTarget: null}, 'UIEvent');
  }

  // Safari 7 does not yet have BeforeUnloadEvent.
  // https://bugs.webkit.org/show_bug.cgi?id=120849
  var OriginalBeforeUnloadEvent = window.BeforeUnloadEvent;

  function BeforeUnloadEvent(impl) {
    Event.call(this, impl);
  }
  BeforeUnloadEvent.prototype = Object.create(Event.prototype);
  mixin(BeforeUnloadEvent.prototype, {
    get returnValue() {
      return unsafeUnwrap(this).returnValue;
    },
    set returnValue(v) {
      unsafeUnwrap(this).returnValue = v;
    }
  });

  if (OriginalBeforeUnloadEvent)
    registerWrapper(OriginalBeforeUnloadEvent, BeforeUnloadEvent);

  function isValidListener(fun) {
    if (typeof fun === 'function')
      return true;
    return fun && fun.handleEvent;
  }

  function isMutationEvent(type) {
    switch (type) {
      case 'DOMAttrModified':
      case 'DOMAttributeNameChanged':
      case 'DOMCharacterDataModified':
      case 'DOMElementNameChanged':
      case 'DOMNodeInserted':
      case 'DOMNodeInsertedIntoDocument':
      case 'DOMNodeRemoved':
      case 'DOMNodeRemovedFromDocument':
      case 'DOMSubtreeModified':
        return true;
    }
    return false;
  }

  var OriginalEventTarget = window.EventTarget;

  /**
   * This represents a wrapper for an EventTarget.
   * @param {!EventTarget} impl The original event target.
   * @constructor
   */
  function EventTarget(impl) {
    setWrapper(impl, this);
  }

  // Node and Window have different internal type checks in WebKit so we cannot
  // use the same method as the original function.
  var methodNames = [
    'addEventListener',
    'removeEventListener',
    'dispatchEvent'
  ];

  [Node, Window].forEach(function(constructor) {
    var p = constructor.prototype;
    methodNames.forEach(function(name) {
      Object.defineProperty(p, name + '_', {value: p[name]});
    });
  });

  function getTargetToListenAt(wrapper) {
    if (wrapper instanceof wrappers.ShadowRoot)
      wrapper = wrapper.host;
    return unwrap(wrapper);
  }

  EventTarget.prototype = {
    addEventListener: function(type, fun, capture) {
      if (!isValidListener(fun) || isMutationEvent(type))
        return;

      var listener = new Listener(type, fun, capture);
      var listeners = listenersTable.get(this);
      if (!listeners) {
        listeners = [];
        listeners.depth = 0;
        listenersTable.set(this, listeners);
      } else {
        // Might have a duplicate.
        for (var i = 0; i < listeners.length; i++) {
          if (listener.equals(listeners[i]))
            return;
        }
      }

      listeners.push(listener);

      var target = getTargetToListenAt(this);
      target.addEventListener_(type, dispatchOriginalEvent, true);
    },
    removeEventListener: function(type, fun, capture) {
      capture = Boolean(capture);
      var listeners = listenersTable.get(this);
      if (!listeners)
        return;
      var count = 0, found = false;
      for (var i = 0; i < listeners.length; i++) {
        if (listeners[i].type === type && listeners[i].capture === capture) {
          count++;
          if (listeners[i].handler === fun) {
            found = true;
            listeners[i].remove();
          }
        }
      }

      if (found && count === 1) {
        var target = getTargetToListenAt(this);
        target.removeEventListener_(type, dispatchOriginalEvent, true);
      }
    },
    dispatchEvent: function(event) {
      // We want to use the native dispatchEvent because it triggers the default
      // actions (like checking a checkbox). However, if there are no listeners
      // in the composed tree then there are no events that will trigger and
      // listeners in the non composed tree that are part of the event path are
      // not notified.
      //
      // If we find out that there are no listeners in the composed tree we add
      // a temporary listener to the target which makes us get called back even
      // in that case.

      var nativeEvent = unwrap(event);
      var eventType = nativeEvent.type;

      // Allow dispatching the same event again. This is safe because if user
      // code calls this during an existing dispatch of the same event the
      // native dispatchEvent throws (that is required by the spec).
      handledEventsTable.set(nativeEvent, false);

      // Force rendering since we prefer native dispatch and that works on the
      // composed tree.
      scope.renderAllPending();

      var tempListener;
      if (!hasListenerInAncestors(this, eventType)) {
        tempListener = function() {};
        this.addEventListener(eventType, tempListener, true);
      }

      try {
        return unwrap(this).dispatchEvent_(nativeEvent);
      } finally {
        if (tempListener)
          this.removeEventListener(eventType, tempListener, true);
      }
    }
  };

  function hasListener(node, type) {
    var listeners = listenersTable.get(node);
    if (listeners) {
      for (var i = 0; i < listeners.length; i++) {
        if (!listeners[i].removed && listeners[i].type === type)
          return true;
      }
    }
    return false;
  }

  function hasListenerInAncestors(target, type) {
    for (var node = unwrap(target); node; node = node.parentNode) {
      if (hasListener(wrap(node), type))
        return true;
    }
    return false;
  }

  if (OriginalEventTarget)
    registerWrapper(OriginalEventTarget, EventTarget);

  function wrapEventTargetMethods(constructors) {
    forwardMethodsToWrapper(constructors, methodNames);
  }

  var originalElementFromPoint = document.elementFromPoint;

  function elementFromPoint(self, document, x, y) {
    scope.renderAllPending();

    var element =
        wrap(originalElementFromPoint.call(unsafeUnwrap(document), x, y));
    if (!element)
      return null;
    var path = getEventPath(element, null);

    // scope the path to this TreeScope
    var idx = path.lastIndexOf(self);
    if (idx == -1)
      return null;
    else
      path = path.slice(0, idx);

    // TODO(dfreedm): pass idx to eventRetargetting to avoid array copy
    return eventRetargetting(path, self);
  }

  /**
   * Returns a function that is to be used as a getter for `onfoo` properties.
   * @param {string} name
   * @return {Function}
   */
  function getEventHandlerGetter(name) {
    return function() {
      var inlineEventHandlers = eventHandlersTable.get(this);
      return inlineEventHandlers && inlineEventHandlers[name] &&
          inlineEventHandlers[name].value || null;
     };
  }

  /**
   * Returns a function that is to be used as a setter for `onfoo` properties.
   * @param {string} name
   * @return {Function}
   */
  function getEventHandlerSetter(name) {
    var eventType = name.slice(2);
    return function(value) {
      var inlineEventHandlers = eventHandlersTable.get(this);
      if (!inlineEventHandlers) {
        inlineEventHandlers = Object.create(null);
        eventHandlersTable.set(this, inlineEventHandlers);
      }

      var old = inlineEventHandlers[name];
      if (old)
        this.removeEventListener(eventType, old.wrapped, false);

      if (typeof value === 'function') {
        var wrapped = function(e) {
          var rv = value.call(this, e);
          if (rv === false)
            e.preventDefault();
          else if (name === 'onbeforeunload' && typeof rv === 'string')
            e.returnValue = rv;
          // mouseover uses true for preventDefault but preventDefault for
          // mouseover is ignored by browsers these day.
        };

        this.addEventListener(eventType, wrapped, false);
        inlineEventHandlers[name] = {
          value: value,
          wrapped: wrapped
        };
      }
    };
  }

  scope.elementFromPoint = elementFromPoint;
  scope.getEventHandlerGetter = getEventHandlerGetter;
  scope.getEventHandlerSetter = getEventHandlerSetter;
  scope.wrapEventTargetMethods = wrapEventTargetMethods;
  scope.wrappers.BeforeUnloadEvent = BeforeUnloadEvent;
  scope.wrappers.CustomEvent = CustomEvent;
  scope.wrappers.Event = Event;
  scope.wrappers.EventTarget = EventTarget;
  scope.wrappers.FocusEvent = FocusEvent;
  scope.wrappers.MouseEvent = MouseEvent;
  scope.wrappers.UIEvent = UIEvent;

})(window.ShadowDOMPolyfill);
