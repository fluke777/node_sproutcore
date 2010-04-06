// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2009 Sprout Systems, Inc. and contributors.
//            Portions ©2008-2009 Apple Inc. All rights reserved.
// License:   Licened under MIT license (see license.js)
// ==========================================================================

sc_require('views/scroller');
sc_require('mixins/border');

/** @class

  Implements a complete scroll view.  This class uses a manual implementation
  of scrollers in order to properly support clipping frames.
  
  Important Events:
  
  - contentView frame size changes (to autoshow/hide scrollbar - adjust scrollbar size)
  - horizontalScrollOffset change
  - verticalScrollOffsetChanges
  - scroll wheel events
  
  @extends SC.View
  @since SproutCore 1.0
*/
SC.ScrollView = SC.View.extend(SC.Border, {

  classNames: ['sc-scroll-view'],
  
  // ..........................................................
  // PROPERTIES
  // 
  
  isScrollable: YES,
  
  /** 
    The content view you want the scroll view to manage. This will be assigned to the contentView of the clipView also.
  */
  contentView: null,

  /**
    The current horizontal scroll offset. Changing this value will update both the contentView and the horizontal scroller, if there is one.
  */
  horizontalScrollOffset: 0,
  
  /**
    The current vertical scroll offset.  Changing this value will update both the contentView and the vertical scroller, if there is one.
  */
  verticalScrollOffset: 0,
  
  /**
    The maximum horizontal scroll offset allowed given the current contentView 
    size and the size of the scroll view.  If horizontal scrolling is 
    disabled, this will always return 0.
    
    @property {Number}
  */
  maximumHorizontalScrollOffset: function() {
    if (!this.get('canScrollHorizontal')) return 0 ;
    var view = this.get('contentView') ;
    var contentWidth = view ? view.get('frame').width : 0 ;
    
    // The following code checks if there is a calculatedWidth (collections)
    // to avoid looking at the incorrect value calculated by frame.
    if(view.calculatedWidth && view.calculatedWidth!==0){
      contentWidth = view.calculatedWidth; 
    }
    var containerWidth = this.get('containerView').get('frame').width ;
    return Math.max(0, contentWidth-containerWidth) ;
  }.property(),
  
  /**
    The maximum vertical scroll offset allowed given the current contentView 
    size and the size of the scroll view.  If vertical scrolling is disabled,
    this will always return 0.
    
    @property {Number}
  */
  maximumVerticalScrollOffset: function() {
    if (!this.get('canScrollVertical')) return 0 ;
    var view = this.get('contentView') ;
    var contentHeight = (view && view.get('frame')) ? view.get('frame').height : 0 ;
    
    // The following code checks if there is a calculatedWidth (collections)
    // to avoid looking at the incorrect value calculated by frame.
    if(view.calculatedHeight && view.calculatedHeight!==0){
      contentHeight = view.calculatedHeight; 
    }
    var containerHeight = this.get('containerView').get('frame').height ;
    return Math.max(0, contentHeight-containerHeight) ;
  }.property(),
  
  /** 
    Amount to scroll one vertical line.
  
    Used by the default implementation of scrollDownLine() and scrollUpLine().  
    Defaults to 20px.
  */
  verticalLineScroll: 20,
  
  /**
    Amount to scroll one horizontal line.
  
    Used by the default implementation of scrollLeftLine() and 
    scrollRightLine(). Defaults to 20px.
  */
  horizontalLineScroll: 20,
  
  /**
    Amount to scroll one vertical page.
    
    Used by the default implementation of scrollUpPage() and scrollDownPage(). 
    Defaults to current frame height.
  */
  verticalPageScroll: function() {
    return this.get('frame').height ;
  }.property('frame'),
  
  /**
    Amount to scroll one horizontal page.
    
    Used by the default implementation of scrollLeftPage() and 
    scrollRightPage().  Defaults to current innerFrame width.
  */
  horizontalPageScroll: function() {
    return this.get('frame').width ;  
  }.property('frame'),
    
  // ..........................................................
  // SCROLLERS
  // 
  
  /** 
    YES if the view should maintain a horizontal scroller.   This property 
    must be set when the view is created.
    
    @property {Boolean}
  */
  hasHorizontalScroller: YES,
  
  /**
    The horizontal scroller view class. This will be replaced with a view 
    instance when the ScrollView is created unless hasHorizontalScroller is 
    NO.
    
    @property {SC.View}
  */
  horizontalScrollerView: SC.ScrollerView,
  
  /**
    YES if the horizontal scroller should be visible.  You can change this 
    property value anytime to show or hide the horizontal scroller.  If you 
    do not want to use a horizontal scroller at all, you should instead set 
    hasHorizontalScroller to NO to avoid creating a scroller view in the 
    first place.
    
    @property {Boolean}
  */
  isHorizontalScrollerVisible: YES,

  /**
    Returns YES if the view both has a horizontal scroller, the scroller is
    visible.
    
    @property {Boolean}
  */
  canScrollHorizontal: function() {
    return !!(this.get('hasHorizontalScroller') && 
      this.get('horizontalScrollerView') && 
      this.get('isHorizontalScrollerVisible')) ;
  }.property('isHorizontalScrollerVisible').cacheable(),
  
  /**
    If YES, the horizontal scroller will autohide if the contentView is
    smaller than the visible area.  You must set hasHorizontalScroller to YES 
    for this property to have any effect.  
  */
  autohidesHorizontalScroller: YES,
  
  /** 
    YES if the view shuld maintain a vertical scroller.   This property must 
    be set when the view is created.
    
    @property {Boolean}
  */
  hasVerticalScroller: YES,
  
  /**
    The vertical scroller view class. This will be replaced with a view 
    instance when the ScrollView is created unless hasVerticalScroller is NO.
    
    @property {SC.View}
  */
  verticalScrollerView: SC.ScrollerView,
  
  /**
    YES if the vertical scroller should be visible.  You can change this 
    property value anytime to show or hide the vertical scroller.  If you do 
    not want to use a vertical scroller at all, you should instead set 
    hasVerticalScroller to NO to avoid creating a scroller view in the first 
    place.
    
    @property {Boolean}
  */
  isVerticalScrollerVisible: YES,

  /**
    Returns YES if the view both has a horizontal scroller, the scroller is
    visible.
    
    @property {Boolean}
  */
  canScrollVertical: function() {
    return !!(this.get('hasVerticalScroller') && 
      this.get('verticalScrollerView') && 
      this.get('isVerticalScrollerVisible')) ;
  }.property('isVerticalScrollerVisible').cacheable(),

  /**
    If YES, the vertical scroller will autohide if the contentView is
    smaller than the visible area.  You must set hasVerticalScroller to YES 
    for this property to have any effect.  
  */
  autohidesVerticalScroller: YES,
  
  /**
    Use this property to set the 'bottom' offset of your vertical scroller, 
    to make room for a thumb view or other accessory view. Default is 0.
    
    @property {Number}
  */
  verticalScrollerBottom: 0,
  
  
  // ..........................................................
  // CUSTOM VIEWS
  // 
  
  /**
    The container view that will contain your main content view.  You can 
    replace this property with your own custom subclass if you prefer.
    
    @type {SC.ContainerView}
  */
  containerView: SC.ContainerView,
  
  // ..........................................................
  // METHODS
  // 
  
  /**
    Scrolls the receiver to the specified x,y coordinate.  This should be the
    offset into the contentView you want to appear at the top-left corner of
    the scroll view.
    
    This method will contrain the actual scroll based on whether the view
    can scroll in the named direction and the maximum distance it can
    scroll.
    
    If you only want to scroll in one direction, pass null for the other 
    direction.  You can also optionally pass a Hash for the first parameter 
    with x and y coordinates.
    
    @param x {Number} the x scroll location
    @param y {Number} the y scroll location
    @returns {SC.ScrollView} receiver
  */
  scrollTo: function(x,y) {
    // normalize params
    if (y===undefined && SC.typeOf(x) === SC.T_HASH) {
      y = x.y; x = x.x;
    }
    
    if (!SC.none(x)) {
      x = Math.max(0,Math.min(this.get('maximumHorizontalScrollOffset'), x)) ;
      this.set('horizontalScrollOffset', x) ;
    }
    
    if (!SC.none(y)) {
      y = Math.max(0,Math.min(this.get('maximumVerticalScrollOffset'), y)) ;
      this.set('verticalScrollOffset', y) ;
    }
    
    return this ;
  },
  
  /**
    Scrolls the receiver in the horizontal and vertical directions by the 
    amount specified, if allowed.  The actual scroll amount will be 
    constrained by the current scroll view settings.
    
    If you only want to scroll in one direction, pass null or 0 for the other 
    direction.  You can also optionally pass a Hash for the first parameter 
    with x and y coordinates.
    
    @param x {Number} change in the x direction (or hash)
    @param y {Number} change in the y direction
    @returns {SC.ScrollView} receiver
  */
  scrollBy: function(x , y) {
    // normalize params
    if (y===undefined && SC.typeOf(x) === SC.T_HASH) {
      y = x.y; x = x.x;
    }
    
    // if null, undefined, or 0, pass null; otherwise just add current offset
    x = (x) ? this.get('horizontalScrollOffset')+x : null ;
    y = (y) ? this.get('verticalScrollOffset')+y : null ;
    return this.scrollTo(x,y) ;
  },
  
  /**
    Scroll the view to make the view's frame visible.  For this to make sense,
    the view should be a subview of the contentView.  Otherwise the results
    will be undefined.
    
    @param {SC.View} view view to scroll or null to scroll receiver visible
    @returns {Boolean} YES if scroll position was changed
  */
  scrollToVisible: function(view) {
    
    // if no view is passed, do default
    if (arguments.length === 0) return arguments.callee.base.apply(this,arguments); 
    
    var contentView = this.get('contentView') ;
    if (!contentView) return NO; // nothing to do if no contentView.

    // get the frame for the view - should work even for views with static 
    // layout, assuming it has been added to the screen.
    var vf = view.get('frame');
    if (!vf) return NO; // nothing to do
    
    // convert view's frame to an offset from the contentView origin.  This
    // will become the new scroll offset after some adjustment.
    vf = contentView.convertFrameFromView(vf, view.get('parentView')) ;
    
    // find current visible frame.
    var vo = SC.cloneRect(this.get('containerView').get('frame')) ;
    
    vo.x = this.get('horizontalScrollOffset') ;
    vo.y = this.get('verticalScrollOffset') ;

    var origX = vo.x, origY = vo.y;
    
    // if top edge is not visible, shift origin
    vo.y -= Math.max(0, SC.minY(vo) - SC.minY(vf)) ;
    vo.x -= Math.max(0, SC.minX(vo) - SC.minX(vf)) ;
    
    // if bottom edge is not visible, shift origin
    vo.y += Math.max(0, SC.maxY(vf) - SC.maxY(vo)) ;
    vo.x += Math.max(0, SC.maxX(vf) - SC.maxX(vo)) ;
    
    // scroll to that origin.
    if ((origX !== vo.x) || (origY !== vo.y)) {
      this.scrollTo(vo.x, vo.y);
      return YES ;
    } else return NO;
  },
  
  /**
    Scrolls the receiver down one or more lines if allowed.  If number of
    lines is not specified, scrolls one line.
    
    @param lines {Number} options number of lines
    @returns {SC.ScrollView} receiver
  */
  scrollDownLine: function(lines) {
    if (lines === undefined) lines = 1 ;
    return this.scrollBy(null, this.get('verticalLineScroll')*lines) ;
  },
  
  /**
    Scrolls the receiver up one or more lines if allowed.  If number of
    lines is not specified, scrolls one line.
    
    @param lines {Number} options number of lines
    @returns {SC.ScrollView} receiver
  */
  scrollUpLine: function(lines) {
    if (lines === undefined) lines = 1 ;
    return this.scrollBy(null, 0-this.get('verticalLineScroll')*lines) ;
  },
  
  /**
    Scrolls the receiver right one or more lines if allowed.  If number of
    lines is not specified, scrolls one line.
    
    @param lines {Number} options number of lines
    @returns {SC.ScrollView} receiver
  */
  scrollRightLine: function(lines) {
    if (lines === undefined) lines = 1 ;
    return this.scrollTo(this.get('horizontalLineScroll')*lines, null) ;
  },
  
  /**
    Scrolls the receiver left one or more lines if allowed.  If number of
    lines is not specified, scrolls one line.
    
    @param lines {Number} options number of lines
    @returns {SC.ScrollView} receiver
  */
  scrollLeftLine: function(lines) {
    if (lines === undefined) lines = 1 ;
    return this.scrollTo(0-this.get('horizontalLineScroll')*lines, null) ;
  },
  
  /**
    Scrolls the receiver down one or more page if allowed.  If number of
    pages is not specified, scrolls one page.  The page size is determined by
    the verticalPageScroll value.  By default this is the size of the current
    scrollable area.
    
    @param pages {Number} options number of pages
    @returns {SC.ScrollView} receiver
  */
  scrollDownPage: function(pages) {
    if (pages === undefined) pages = 1 ;
    return this.scrollBy(null, this.get('verticalPageScroll')*pages) ;
  },
  
  /**
    Scrolls the receiver up one or more page if allowed.  If number of
    pages is not specified, scrolls one page.  The page size is determined by
    the verticalPageScroll value.  By default this is the size of the current
    scrollable area.
    
    @param pages {Number} options number of pages
    @returns {SC.ScrollView} receiver
  */
  scrollUpPage: function(pages) {
    if (pages === undefined) pages = 1 ;
    return this.scrollBy(null, 0-(this.get('verticalPageScroll')*pages)) ;
  },
  
  /**
    Scrolls the receiver right one or more page if allowed.  If number of
    pages is not specified, scrolls one page.  The page size is determined by
    the verticalPageScroll value.  By default this is the size of the current
    scrollable area.
    
    @param pages {Number} options number of pages
    @returns {SC.ScrollView} receiver
  */
  scrollRightPage: function(pages) {
    if (pages === undefined) pages = 1 ;
    return this.scrollBy(this.get('horizontalPageScroll')*pages, null) ;
  },
  
  /**
    Scrolls the receiver left one or more page if allowed.  If number of
    pages is not specified, scrolls one page.  The page size is determined by
    the verticalPageScroll value.  By default this is the size of the current
    scrollable area.
    
    @param pages {Number} options number of pages
    @returns {SC.ScrollView} receiver
  */
  scrollLeftPage: function(pages) {
    if (pages === undefined) pages = 1 ;
    return this.scrollBy(0-(this.get('horizontalPageScroll')*pages), null) ;
  },
  
  /**
    Adjusts the layout for the various internal views.  This method is called
    once when the scroll view is first configured and then anytime a scroller
    is shown or hidden.  You can call this method yourself as well to retile.
    
    You may also want to override this method to handle layout for any
    additional controls you have added to the view.
  */
  tile: function() {
    // get horizontal scroller/determine if we should have a scroller
    var hscroll = this.get('hasHorizontalScroller') ? this.get('horizontalScrollerView') : null ;
    var hasHorizontal = hscroll && this.get('isHorizontalScrollerVisible');
    
    // get vertical scroller/determine if we should have a scroller
    var vscroll = this.get('hasVerticalScroller') ? this.get('verticalScrollerView') : null ;
    var hasVertical = vscroll && this.get('isVerticalScrollerVisible') ;
    
    // get the containerView
    var clip = this.get('containerView') ;
    var clipLayout = { left: 0, top: 0 } ;
    var t ;
    
    var ht = ((hasHorizontal) ? hscroll.get('scrollerThickness') : 0) ;
    var vt = (hasVertical) ?   vscroll.get('scrollerThickness') : 0 ;
    
    if (hasHorizontal) {
      hscroll.set('layout', { left: 0, bottom: 0, right: vt-1, height: ht }) ;
      clipLayout.bottom = ht-1 ;
    } else {
      clipLayout.bottom = 0 ;
    }
    if (hscroll) hscroll.set('isVisible', hasHorizontal) ;
    
    if (hasVertical) {
      ht = ht + this.get('verticalScrollerBottom') ;
      vscroll.set('layout', { top: 0, bottom: ht, right: 0, width: vt }) ;
      clipLayout.right = vt-1 ;
    } else {
      clipLayout.right = 0 ;
    }
    if (vscroll) vscroll.set('isVisible', hasVertical) ;
    
    clip.set('layout', clipLayout) ;
  },
  
  /** @private
    Called whenever a scroller visibility changes.  Calls the tile() method.
  */
  scrollerVisibilityDidChange: function() {
    this.tile();
  }.observes('isVerticalScrollerVisible', 'isHorizontalScrollerVisible'),
  
  // ..........................................................
  // SCROLL WHEEL SUPPORT
  // 
  
  /** @private */ _scroll_wheelDeltaX: 0,
  /** @private */ _scroll_wheelDeltaY: 0,
  
  // save adjustment and then invoke the actual scroll code later.  This will
  // keep the view feeling smooth.
  mouseWheel: function(evt) {
    this._scroll_wheelDeltaX += evt.wheelDeltaX;
    this._scroll_wheelDeltaY += evt.wheelDeltaY;
    this.invokeLater(this._scroll_mouseWheel, 10) ;
    return this.get('canScrollHorizontal') || this.get('canScrollVertical') ;  
  },
  
  /** @private */
  _scroll_mouseWheel: function() {
    this.scrollBy(this._scroll_wheelDeltaX, this._scroll_wheelDeltaY);
    this._scroll_wheelDeltaX = this._scroll_wheelDeltaY = 0;
  },
  
  
  // ..........................................................
  // INTERNAL SUPPORT
  // 
  
  /** @private
    Instantiate scrollers & container views as needed.  Replace their classes
    in the regular properties.
  */
  createChildViews: function() {
    var childViews = [] , view; 
       
    // create the containerView.  We must always have a container view. 
    // also, setup the contentView as the child of the containerView...
    if (SC.none(view = this.containerView)) view = SC.ContainerView;
    
    childViews.push(this.containerView = this.createChildView(view, {
      contentView: this.contentView
    }));
    
    // and replace our own contentView...
    this.contentView = this.containerView.get('contentView');
    
    // create a horizontal scroller view if needed...
    if (view=this.horizontalScrollerView) {
      if (this.get('hasHorizontalScroller')) {
        view = this.horizontalScrollerView = this.createChildView(view, {
          layoutDirection: SC.LAYOUT_HORIZONTAL,
          valueBinding: '*owner.horizontalScrollOffset'
        }) ;
        childViews.push(view);
      } else this.horizontalScrollerView = null ;
    }
    
    // create a vertical scroller view if needed...
    if (view=this.verticalScrollerView) {
      if (this.get('hasVerticalScroller')) {
        view = this.verticalScrollerView = this.createChildView(view, {
          layoutDirection: SC.LAYOUT_VERTICAL,
          valueBinding: '*owner.verticalScrollOffset'
        }) ;
        childViews.push(view);
      } else this.verticalScrollerView = null ;
    }
    
    // set childViews array.
    this.childViews = childViews ;
    
    this.contentViewDidChange() ; // setup initial display...
    this.tile() ; // set up initial tiling
  },
  
  init: function() {
    arguments.callee.base.apply(this,arguments);
    
    // start observing initial content view.  The content view's frame has
    // already been setup in prepareDisplay so we don't need to call 
    // viewFrameDidChange...
    this._scroll_contentView = this.get('contentView') ;
    var contentView = this._scroll_contentView ;

    if (contentView) {
      contentView.addObserver('frame', this, this.contentViewFrameDidChange) ;
    }

    if (this.get('isVisibleInWindow')) this._scsv_registerAutoscroll() ;
  },
  
  /** @private Registers/deregisters view with SC.Drag for autoscrolling */
  _scsv_registerAutoscroll: function() {
    if (this.get('isVisibleInWindow')) SC.Drag.addScrollableView(this);
    else SC.Drag.removeScrollableView(this);
  }.observes('isVisibleInWindow'),
  
  /** @private
    Whenever the contentView is changed, we need to observe the content view's
    frame to be notified whenever it's size changes.
  */
  contentViewDidChange: function() {
    var newView = this.get('contentView'), oldView = this._scroll_contentView;
    var f = this.contentViewFrameDidChange ;
    if (newView !== oldView) {
      
      // stop observing old content view
      if (oldView) oldView.removeObserver('frame', this, f);
      
      // update cache
      this._scroll_contentView = newView;
      if (newView) newView.addObserver('frame', this, f);
      
      // replace container
      this.containerView.set('contentView', newView);
      
      this.contentViewFrameDidChange();
    }
  }.observes('contentView'),
  
  /** @private
    Invoked whenever the contentView's frame changes.  This will update the 
    scroller maxmimum and optionally update the scroller visibility if the
    size of the contentView changes.  We don't care about the origin since
    that is tracked separately from the offset values.
  */
  
  oldMaxHOffset: 0,
  oldMaxVOffset: 0,
  
  contentViewFrameDidChange: function() {
        
    var view   = this.get('contentView'), 
        f      = (view) ? view.get('frame') : null,
        width  = (f) ? f.width : 0,  
        height = (f) ? f.height : 0,
        dim    = this.get('frame') ;
    
    // cache out scroll settings...
    //if ((width === this._scroll_contentWidth) && (height === this._scroll_contentHeight)) return ;
    this._scroll_contentWidth = width;
    this._scroll_contentHeight = height ;
    
    if (this.get('hasHorizontalScroller') && (view = this.get('horizontalScrollerView'))) {
      width -= 1 ; // accurately account for our layout
      // decide if it should be visible or not
      if (this.get('autohidesHorizontalScroller')) {
        this.set('isHorizontalScrollerVisible', width > dim.width);
      }
      view.setIfChanged('maximum', width) ;
    }
    
    if (this.get('hasVerticalScroller') && (view = this.get('verticalScrollerView'))) {
      height -= 1 ; // accurately account for our layout
      // decide if it should be visible or not
      if (this.get('autohidesVerticalScroller')) {
        this.set('isVerticalScrollerVisible', height > dim.height);
      }
      height -= this.get('verticalScrollerBottom') ;
      view.setIfChanged('maximum', height) ;
    }
    
    // If there is no vertical scroller and auto hiding is on, make
    // sure we are at the top if not already there
    if (!this.get('isVerticalScrollerVisible') && (this.get('verticalScrollOffset') !== 0) && 
       this.get('autohidesVerticalScroller')) {
      this.set('verticalScrollOffset', 0);
    }
    
    // Same thing for horizontal scrolling.
    if (!this.get('isHorizontalScrollerVisible') && (this.get('horizontalScrollOffset') !== 0) && 
       this.get('autohidesHorizontalScroller')) {
      this.set('horizontalScrollOffset', 0);
    }
    
    // This forces to recalculate the height of the frame when is at the bottom
    // of the scroll and the content dimension are smaller that the previous one
    
    var mxVOffSet = this.get('maximumVerticalScrollOffset'),
        vOffSet = this.get('verticalScrollOffset'),
        mxHOffSet = this.get('maximumHorizontalScrollOffset'),
        hOffSet = this.get('horizontalScrollOffset');
    var forceHeight = mxVOffSet<vOffSet;
    var forceWidth = mxHOffSet<hOffSet;
    if(forceHeight || forceWidth){
      this.forceDimensionsRecalculation(forceWidth, forceHeight, vOffSet, hOffSet);
    }
  },
  
  /** @private
    Whenever the horizontal scroll offset changes, update the scrollers and 
    edit the location of the contentView.
  */
  _scroll_horizontalScrollOffsetDidChange: function() {
    var offset = this.get('horizontalScrollOffset');
    
    offset = Math.max(0,Math.min(this.get('maximumHorizontalScrollOffset'), offset)) ;
    
    // update the offset for the contentView...
    var contentView = this.get('contentView');
    if (contentView) contentView.adjust('left', 0-offset);
     
  }.observes('horizontalScrollOffset'),
  
  /** @private
    Whenever the vertical scroll offset changes, update the scrollers and 
    edit the location of the contentView.
  */
  _scroll_verticalScrollOffsetDidChange: function() {
    var offset = this.get('verticalScrollOffset') ;
    
    offset = Math.max(0,Math.min(this.get('maximumVerticalScrollOffset'), offset)) ;
    
    // update the offset for the contentView...
    var contentView = this.get('contentView');
    var containerView = this.get('containerView');
    
    // Optimization when not using collections. We need to reimplement clippingFrame
    // and scrolling to be able to scroll using scrolltop. For now I just
    // detect if the content to scroll is a class of collectionView.
    if (contentView) contentView.adjust('top', 0-offset) ;
    
  }.observes('verticalScrollOffset'),
  
  forceDimensionsRecalculation: function (forceWidth, forceHeight, vOffSet, hOffSet) {
    var oldScrollHOffset = hOffSet;
    var oldScrollVOffset = vOffSet;
    this.scrollTo(0,0);
    if(forceWidth && forceHeight){
      this.scrollTo(this.get('maximumHorizontalScrollOffset'), this.get('maximumVerticalScrollOffset'));
    }
    if(forceWidth && !forceHeight){
      this.scrollTo(this.get('maximumHorizontalScrollOffset'), oldScrollVOffset);
    }
    if(!forceWidth && forceHeight){
      this.scrollTo(oldScrollHOffset ,this.get('maximumVerticalScrollOffset'));
    }
  }
  
});
