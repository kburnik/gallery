/*
GALLERY : jQuery extension 
Developed by Kristijan Burnik :: (c) 2010 :: http://www.invision-web.net/

*/

// MOUSEWHEEL
(function(c){var a=["DOMMouseScroll","mousewheel"];c.event.special.mousewheel={setup:function(){if(this.addEventListener){for(var d=a.length;d;){this.addEventListener(a[--d],b,false)}}else{this.onmousewheel=b}},teardown:function(){if(this.removeEventListener){for(var d=a.length;d;){this.removeEventListener(a[--d],b,false)}}else{this.onmousewheel=null}}};c.fn.extend({mousewheel:function(d){return d?this.bind("mousewheel",d):this.trigger("mousewheel")},unmousewheel:function(d){return this.unbind("mousewheel",d)}});function b(f){var d=[].slice.call(arguments,1),g=0,e=true;f=c.event.fix(f||window.event);f.type="mousewheel";if(f.wheelDelta){g=f.wheelDelta/120}if(f.detail){g=-f.detail/3}d.unshift(f,g);return c.event.handle.apply(this,d)}})(jQuery);


$.fn.extend({
	fullDimensions:function() {
		//@ todo: cross browser check @//
		var p = {
			width:['width','borderLeftWidth','borderRightWidth','paddingLeft','paddingRight'],
			height:['height','borderTopWidth','borderBottomWidth','paddingTop','paddingBottom']
		};
		
		var secureParseFloat = function(x) {
			var r = parseFloat(x);
			if ((r*0+'')!=='0') {r = 0;}			
			return r;
		}

		var width = 0;
		var	height = 0;
	
		// stupid faqin IE and it's incompatibility with dimensions...
		if ( secureParseFloat($(this).css("width")) == 0 ) {
			width = $(this).width();
		}
		
		if ( secureParseFloat($(this).css("height")) == 0 ) {
			height = $(this).height();
		}
		//
		
		for (var x in p.width) {
			width +=  secureParseFloat($(this).css(p.width[x]));
			height +=  secureParseFloat($(this).css(p.height[x]));
		}
		
		if (width == 0) width =  $(this).width();
		if (height == 0) height =  $(this).height();
		
		return {
			width:width,
			height:height
		}
	},
	gallery:function(options,params,additional) {
		if (typeof options=='undefined') options = {};
		var $parent = $(this);
		
		// cancel the creation if object not existing
		if ($parent.length == 0) return $parent;
		
		// check to see if running an action rather than constructing
		if ( (typeof  options == "string" ) && (typeof $parent[0].__GALLERY__ != 'undefined') ) {
			return $parent[0].__GALLERY__.runaction(options,params,additional);
		}
		
		$(this).each(function() {
			var $parent = $(this);
			
			
			// setup default options for gallers
			var defaults = {
				ready:function() {},
				preloadImages:false,
				autoConstruct:true, // when set to true, the images are used from existing DOM
				images:[], // list of images, when need to construct
				animDuration:400, // default animation duration
				scaleFactor:0.6, // by distance this factor is used
				opacityFactor:0.6,
				effect:'default', // can be extended to other,
				imageDistance:10,
				distanceFactor:1,
				maxHeight:'inherit', // max height of an image, all rescaled in that way  [inehrit,original,200,...],
				retainContainerDimensions:false,
				descriptionSelector:'p:first',
				useMouseWheel:true,
				swingInterval:2000,
				swing:true
			}	
			
			
			// overwrite defaults with chosen options
			if (typeof options == 'object') {
				if (!options) {
					options=defaults;
				} else {
					for (property in defaults) {
						if (options[property]==null) options[property]=defaults[property];
					}
				}
			}
			
			// constructors for DOM objects
			var constructors = {
				
			}
			
			// actions after constructing
			var actions = {
				"add":function(t,src) { // add an image to collection

				},
				"remove":function(t,selector) {
				
				},
				"focus":function(t,mixed) { // bring focus to an image given by selector or index
					var t = t;
					if (typeof mixed == 'number') { // when mixed is an image zero-based index
						var centerIndex = mixed;
					} else { // when mixed is a jQuery of image
						var $img = $(mixed);
						var centerIndex = aux.getImageIndex($img);
					}
					if (t.eventsEnabled) {
						
						var callback = function() { 
							t.eventsEnabled = true; 
							
						}
						t.$images.removeClass("current");
						$(t.$images[centerIndex]).addClass("current"); 
						t.eventsEnabled = false; // prevent events durgin animation and then restore them after with the callback function
						t.currentIndex = aux.placeImages(t.$parent,t.$images,centerIndex,o.imageDistance,o.distanceFactor,o.scaleFactor,o.opacityFactor,o.animDuration,callback);
						
					} 
				},
				"shift":function(t,amount) {	
					var count = t.getImageCount();
					var newIndex = t.currentIndex+amount;
					if (newIndex < 0) newIndex = 0;
					if (newIndex >= count) newIndex = count-1;
					if (t.currentIndex!=newIndex) { 
						t.$parent.gallery("focus",newIndex);
						return true;
					} else {
						return false;
					}
				},
				"next":function(t) { // move focus to the next image
					t.$parent.gallery("shift",1);
				},
				"prev":function(t) { // move focus to previous image
					t.$parent.gallery("shift",-1);
				},
				"scale":function(t,selector,scaleFactor) {
					var $img = $(selector);
					aux.rescaleImage($img,scaleFactor,o.animDuration);
				},
				"swing":function(t) {
					if (!t.$parent.gallery("shift",t.swingDirection)) {
						t.swingDirection *= -1;
						t.$parent.gallery("shift",t.swingDirection);
					}
				},
				"swingcontinue":function(t) {
					var x = this;
					var t = t;
					
					setTimeout(function() {
						t.swinging = true;
						if (!t.swingPaused) { t.$parent.gallery("swing"); }
						t.$parent.gallery("swingcontinue");
					},o.swingInterval);				
				},
				"swingstart":function(t) {
					t.swingPaused = false;
					if (!t.swinging) t.$parent.gallery("swingcontinue");
				},
				"swingstop":function(t) {
					t.swingPaused = true;
				},
				"current":function(t) {
					return t.$parent.find("img.current");
				}
			}
			
			
			// auxiliary functions
			var aux = {
				preloadImage:function($img) {
					var src = $img.attr("src");
					var w = $img.attr("width");
					var h = $img.attr("height");
					var pic1 = new Image(w,h); 
					pic1.src=src; 	
					return true;
				},
				getAllDimensions:function($images) {
					var dims = [];
					var i = 0;
					$images.each(function() {
						dims[i] = aux.getDimensions($(this)) ;
						i++;
					});
					
					return dims;
				},
				getHighestDimension:function(dimlist) {
					var max = dimlist[0].height;
					for (var x in dimlist) {
						if (dimlist[x].height > max) max = dimlist[x].height;
					}
					return max;
				},
				rescaleToMaxHeight:function($images,dimlist) {
					// galert($images); alert(dimlist);
					var currentMaxHeight = aux.getHighestDimension(dimlist);
					var targetMaxHeight = o.maxHeight;
					// do not rescale if all images are below target max height
					if (targetMaxHeight >= currentMaxHeight) return true;
					
					// from this point target max height is smaller then current max height
					var normalScaleFactor = targetMaxHeight / currentMaxHeight   ;
					$images.each(function() {
						var newWidth = $(this).width() * normalScaleFactor;
						var newHeight = $(this).height() * normalScaleFactor;
						
						aux.setDimensions($(this),newWidth,newHeight);
					});
				},
				getDimensions:function($obj) {
					return {
						width:$obj.width(),
						height:$obj.height()
					}
				},
				setDimensions:function($obj,w,h,animDuration) {
					if (animDuration > 0) {
						$obj.animate({width:w+'px',height:h+'px'},animDuration);
					} else { 
						$obj.width(w+'px');
						$obj.height(h+'px');
					}
				},
				getPosition:function($obj) {
					return {
						left:$obj.css("left"),
						top:$obj.css("top")
					};
				},
				setPosition:function($obj,left,top,animDuration) {
					if (animDuration>0) {
						$obj.animate({left:Math.round(left)+'px',top:Math.round(top)+'px'});
					} else {
						$obj.css({left:Math.round(left)+'px',top:Math.round(top)+'px'});
					}
				},
				getImageIndex:function($img) {
					return $img[0].__index;
				},
				retainContainerDimensions:function($container) {
					var dims = aux.getDimensions($container);
					// $container.width(dims.width);
					$container.height(dims.height);
				},
				getRescaledDimensions:function(cdim,scaleFactor) {											
					return {width:Math.round(cdim.width*scaleFactor),height:Math.round(cdim.height*scaleFactor)};
				},
				rescaleImage:function($img,scaleFactor,animDuration) {
						
					// current dimensions
					var cdim = {w:$img.width(),h:$img.height()};
					
					// new dimensions;
					var ndim = {w:Math.round(cdim.w*scaleFactor),h:Math.round(cdim.h*scaleFactor)};
					
					aux.setDimensions($img,ndim.w,ndim.h,animDuration);
					
				},
				
				getCenterPosition:function(container_dims,image_dims,image_pos,heightOnly) {
					var cDims = container_dims;
					var iDims = image_dims;
					
					var iLeft = (heightOnly===true) ? image_pos.left : (cDims.width-iDims.width)/2;
					var iTop =  (cDims.height-iDims.height)/2;
					
					return {left:iLeft,top:iTop};
				},
				centerImage:function($container,$image,animDuration,heightOnly) {
					var newPos = aux.getCenterPosition($container.fullDimensions,aux.getDimensions($image),$image.css("left"),heightOnly); 
					aux.setPosition($image,newPos.left,newPos.top,animDuration);
					return newPos;
				},
				moveImage:function($img,l,t,w,h,o,animDuration,callback) {
					if (l=='NaN') l = 0;
					
					var newProps = {left:l+'px',top:t+'px',width:w+'px',height:h+'px',opacity:o};
					
					if (typeof callback != 'function') {
						callback = function() {};
					}
					if ((typeof animDuration != 'undefined')) {
						$img.animate(newProps,animDuration,callback);
					} else {
						// alert("ok so far 8");
						// for (var x in newProps) alert(x+':'+newProps[x]);
						$img.css(newProps);
						// alert("ok so far 9");
					}
					// alert("ok so far 10");
				},
				placeImages:function($container,$images,centerIndex,imageDistance,distanceFactor,scaleFactor,opacityFactor,animDuration,callback) {
					var $container = $container;
					var c = $images.length;
					var $centerImage = $($images[centerIndex]);
				
					// alert("ok so far 5");
					var centerPosition = aux.getCenterPosition(
						$container.fullDimensions(),
						{
							width:dimensions[centerIndex].width,
							height:dimensions[centerIndex].height
						}
					);
					
					// alert("ok so far 6");
					
					$centerImage.stop();
					aux.moveImage(
							$centerImage,
							centerPosition.left,centerPosition.top,
							dimensions[centerIndex].width,dimensions[centerIndex].height,
							1,
							animDuration
					);
					
					// alert("ok so far 11");
					
					
					var $descbox = $centerImage[0].__descbox;
					// place the corresponding description box below image
					if (typeof $descbox != 'undefined' && $descbox.length > 0) {
							// hide current desc box
							t.$images.parent().parent().find(o.descriptionSelector).hide();
							
							// show corresponding box
							$descbox.css({
								position:'absolute',
								top:centerPosition.top+dimensions[centerIndex].height+'px',
								left: Math.round( ($container.width() - $descbox.width())/2 ),
								zIndex:centerIndex+1
							})
							if (animDuration > 0) {
								$descbox.fadeIn(animDuration);
							} else {
								$descbox.show();
							}

					}
					
					
					
					
					$centerImage.css({zIndex:c});
					
					// place the left images
					var f = scaleFactor; // rescale factor
					var opacity = opacityFactor; // opacity factor
					var distance = imageDistance; // distance factor
					
					var lastPosition = centerPosition;
					var newZindex = c-1;
					
					for (var i = centerIndex-1; i >= 0; i--) {
					
						var $img = $($images[i]);
						$img.stop();
						
						var currentPos = aux.getPosition($img);
						var currentDims = aux.getDimensions($img);
						
						var targetDims =  aux.getRescaledDimensions(dimensions[i],f);					
						var targetPos = aux.getCenterPosition(
							$container.fullDimensions(),
							targetDims,
							currentPos
						);
						
						var newLeft = (lastPosition.left - targetDims.width) - distance;
						var newTop = targetPos.top;
						var newWidth = targetDims.width;
						var newHeight = targetDims.height;
						
						
						// if on last image and there are no right images, place the callback event here
						if (i==0 && centerIndex==(c-1)) {
							var onComplete = callback; 
						} else {
							var onComplete = null;
						}
						
						var newOpacity = opacity;
						
						aux.moveImage(
							$img,
							newLeft,newTop,
							newWidth,newHeight,
							newOpacity,
							animDuration,
							onComplete
						);
						
						
						$img.css({zIndex:newZindex});

						// next round
						newZindex--;
						lastPosition = {left:newLeft,top:newTop};
						f = f * scaleFactor;
						opacity = opacity * opacityFactor
						distance *= distanceFactor
					}
					
					// place the right images
					var f = scaleFactor; // rescale factor
					var opacity = opacityFactor; // opacity factor
					var distance = imageDistance;
					var lastPosition = centerPosition;
					var lastDims = dimensions[centerIndex];
					var newZindex = c-1;
					for (var i = centerIndex+1; i < c; i++) {
					
						var $img = $($images[i]);
						$img.stop();
						
						var currentPos = aux.getPosition($img);
						var currentDims = aux.getDimensions($img);
						
						var targetDims =  aux.getRescaledDimensions(dimensions[i],f);					
						var targetPos = aux.getCenterPosition(
							$container.fullDimensions(),
							targetDims,
							currentPos
						);
						
						var newLeft = (lastPosition.left + lastDims.width) + distance;
						var newTop = targetPos.top;
						var newWidth = targetDims.width;
						var newHeight = targetDims.height;
						
						// if on last image place the callback event here
						if (i==(c-1)) {
							var onComplete = callback; 
						} else {
							var onComplete = null;
						}
						
						var newOpacity = opacity;
						
						aux.moveImage(
							$img,
							newLeft,newTop,
							newWidth,newHeight,
							newOpacity,
							animDuration,
							onComplete
						);
						
						//0 1 2 3 4
						
						$img.css({zIndex:newZindex});

						// next round
						newZindex--;
						lastPosition = {left:newLeft,top:newTop};
						lastDims = targetDims;
						f = f * scaleFactor;
						opacity = opacity * opacityFactor;
						distance *= distanceFactor
					}
					
					
					return centerIndex;
					
				}
			}
			
			
			var dimensions = [];
			
			// some shorthands
			var d = dimensions;
			var o = options;
			var a = actions;
			var c = constructors;
			var $p = $parent;
			
			
			// the main object
	 		var t =  {
				
				currentIndex:0,
				eventsEnabled:true,
				$parent:$parent,
				aux:aux,
				$images:{},
				swingDirection:1,
				swingPaused:false,
				getImageCount:function() {
					return t.$images.length;
				},
				construct:function() {

					
					// apply the class: //@ todo: optionalize @//
					
					$p.addClass("jquery-gallery");
					
					var $images = t.$images = $p.find("img");
					
					// get the original dimensions;
					dimensions = aux.getAllDimensions(t.$images);


					
					// rescale images to their max height
					try {
						// aux.rescaleToMaxHeight(t.$images,dimensions);
					} catch (e) {
						// for (var x in e) {console.log(e[x]);}
					}
										
					dimensions = aux.getAllDimensions(t.$images);
					
					

										
					// some image DOM handling 
					var i = 0;
					$p.find("img").each(function() {
					
						$(this)[0].__index = i; // set images index;
						i++;
						
						// temporary / testing
						$(this).click(function() {
							
							
							allowClick = ($(this)[0].__index == t.currentIndex);						
							$p.gallery("focus",$(this));
							return allowClick;
						});
						
						var $descbox =  $(this).parent().parent().find(o.descriptionSelector);
						if ($descbox.length > 0) {
							$descbox.hide();
							$(this)[0].__descbox = $descbox;
						} else {
							$(this)[0].__descbox = $('<p>');
						}
					});

					// alert("ok so far 3");

					
					
				

					// experimantal: setting height of container;
					if (o.retainContainerDimensions) {
						$p.height(aux.getHighestDimension(dimensions)*1.4);
						aux.retainContainerDimensions($p);
					}
					
					//alert($p.fullDimensions().width);
					
					
					// make the images absolute positioned
					$images.css({position:'absolute'});
					
					// hide images
					$images.hide();
					
					// alert("ok so far 4");

					// place the images
					var centerIndex = Math.round($images.length/2)-1;
					t.currentIndex = centerIndex;
					
					aux.placeImages($p,$images,centerIndex,o.imageDistance,o.distanceFactor,o.scaleFactor,o.opacityFactor);
					
					// bind the resize event to keep images centered in container
					
					
					
					$(window).bind("resize",function() {
						try {
							aux.placeImages(t.$parent,t.$images,t.currentIndex,o.imageDistance,o.scaleFactor,o.opacityFactor);
						} catch (e) {
							// console.log(e);
						}
					});
					
					
					
					// fadeIn the images
					$images.fadeIn(o.animDuration);
									
				
					// mousewheel
					var scrollNavigation = function(event, delta) {
						if (o.useMouseWheel) {
							try {
								$p.gallery("shift",-delta);
							} catch (e) {
							}
							return false;
						}
					}
					$p.bind("mousewheel",scrollNavigation);
					
					// swing it baby
					if (o.swing) {
						$p.gallery("swingstart").mouseover(function(){
							t.swingPaused = true;
						}).mouseout(function() {
							t.swingPaused = false;
						});
					}
				
					return $p;
				},
				runaction:function(action,params,additional) {
					var result = a[action](t,params,additional);
					if (typeof result != 'undefined' && typeof result != null) {
						return result;
					} else {
						return $p;
					}
				}
			}
			
			// image preloading // occurs before window load event is ready
			$p.find("img").each(function() {
				aux.preloadImage($(this));
			});
			
			
			
			var t = t;
			$(window).load(function() {
				t.construct();
				$p.removeClass("loading");
				
				// run the onReadyFunction
				t.$parent[0].__readyFunction = o.ready;
				t.$parent[0].__readyFunction();
				delete t.$parent[0].__readyFunction;
			});
			
			// assign the gallery object to DOM element
			$p[0].__GALLERY__ = t;
			$p.addClass("loading");
			
			return $p;
		});
		
		return $(this);
	}
})