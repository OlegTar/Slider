function Slider (param) {
	var div = document.getElementById(param.id);
	div.style.width = param.width + 'px';

	/*debug*/
	//div.style.border = '1px solid black';

	var bgimage = new Image();

	var scripts= document.getElementsByTagName('script');
	var dir;
	for (var i = 0; i < scripts.length; i++) { 
		var src = scripts[i].src; 
		if (/slider\/slider.js$/.test(src)) { 
			dir = src.replace(/\/([^\/]+)$/, '/'); 
			break;
		}
	};

	var links = document.getElementsByTagName('link');
	var found = false;
	for (var i = 0; i < links.length; i++) { 
		var src = scripts[i].src; 
		if (/slider\/css\/slider.css$/.test(src)) { 
			found = true;
			break;
		}
	};

	var obj = this;

	if (!found) {
		var link = document.createElement('link');
		link.setAttribute('rel', 'stylesheet');
		link.setAttribute('type', 'text/css');
		link.setAttribute('src', dir + 'css/slider.css');
		document.getElementsByTagName('head')[0].appendChild(link);

		var xml = Slider.Util.getXMLHttpRequest();
		this.xml = xml;
		if (!/^file:\/\//.test(dir)) {
			try {
				xml.open('GET', dir + 'css/slider.css', true);
				xml.onreadystatechange = function () { obj.setStyle.call(this, obj) }
				xml.send(null);
			}
			catch(e) {
			}
		}
	}
	div.className = 'slider';

	bgimage.src = dir + '/img/slider_bg.gif';
	//div.style.height = bgimage.height;
	div.style.backgroundImage = 'url(' + bgimage.src + ')';
	div.style.backgroundRepeat = 'repeat-x';

	var slider = new Image();


	this.slider = slider;
	this.div = div;

	this.min_value = param.min_value;
	this.max_value = param.max_value;

	this.moving = false;
	this.value = 0;

	this.divOffset = Slider.Util.getPosition(this.div);

	this.mouseOffset = new Object();

	this.listeners = new Object();
	this.listeners['move'] = new Array();


	if (param.init_value) {
		this.value = param.init_value;
	}
	
	slider.onload = function () {
		obj.setDivHeight();
		obj.up();
	};

	slider.src = dir + '/img/knob.gif';

	div.style.position = 'relative';

	div.appendChild(slider);
	slider.style.position = 'absolute';
	slider.style.top = '0';
	

	if (param.value_id) {
		this.addEventListener('move', Slider.Util.setValue, param.value_id);
		Slider.Util.setValue(this.value, param.value_id);
	}

	//document.ondragstart = null;
	//document.body.onselectstart = null;

	//slider.onselectstart = null;

	
	Slider.Util.addEvent(div, 'mousedown', 
		function (event) {
			event = Slider.Util.fixEvent(event);
			Slider.prototype.divDown.call(obj, event); 
		}
	);

	Slider.Util.addEvent(slider, 'mousedown', 
		function (event) {
			event = Slider.Util.fixEvent(event);
			Slider.prototype.down.call(obj, event); 
		}
	);

	Slider.objects.push(obj);	
	if (Slider.objects.length > 1) {
		return this;
	}

	Slider.Util.addEvent(document, 'mousemove', 
		function (event) {
			event = Slider.Util.fixEvent(event);
			for (var i = 0; i < Slider.objects.length; i++) {
				var obj = Slider.objects[i];
				Slider.prototype.move.call(obj, event); 
			}
			return true;
		}
	);


	Slider.Util.addEvent(document, 'mouseup', 
		function (event) {
			event = Slider.Util.fixEvent(event);			
			for (var i = 0; i < Slider.objects.length; i++) {
				var obj = Slider.objects[i];
				Slider.prototype.up.call(obj, event); 
			}
			return true;
		}
	);
	
	return this;
}

Slider.objects = new Array();


Slider.prototype.setStyle = function (obj) {
	if (this.readyState == 4 && this.status == 200) {
		var ref = document.createElement('style');
		ref.setAttribute("rel", "stylesheet");
		ref.setAttribute("type", "text/css");
		document.getElementsByTagName("head")[0].appendChild(ref);
		if(!!(window.attachEvent && !window.opera)) ref.styleSheet.cssText = this.responseText;
		else ref.appendChild(document.createTextNode(this.responseText))

		obj.divOffset = Slider.Util.getPosition(obj.div);
	}
}

Slider.prototype.setDivHeight = function () {
	this.div.style.height = this.slider.height;

	this.half_slider_width = this.slider.width / 2;
	this.slider.style.left = -this.half_slider_width;

	this.divWidth = parseInt(this.div.style.width);

	this.__max_offset = this.divWidth - this.half_slider_width;
	this.__min_offset = -this.half_slider_width;

	this.__full_range = this.__max_offset - this.__min_offset;
	this.__full_range_values = this.max_value - this.min_value;
}

Slider.prototype.divDown = function (event) {		
	var new_x = event.pageX - this.divOffset.x - this.half_slider_width;
	this.value = Math.round(((new_x - this.__min_offset)/this.__full_range) * 		this.__full_range_values + this.min_value);
		
	new_x = ((this.value - this.min_value) / this.__full_range_values) * this.__full_range - this.half_slider_width;

	this.slider.style.left = new_x + 'px';
	this.runListeners();

	event.returnValue = false;
	if (event.preventDefault) {
		event.preventDefault();
	}

	if (event.stopPropagation) {
		event.stopPropagation();
	}
}


Slider.prototype.down = function (event) {		
	this.moving = true;
	var sliderOffset = Slider.Util.getPosition(this.slider);
	this.offsetX = event.pageX - sliderOffset.x;
	this.offsetY = event.pageY - sliderOffset.y;

	event.returnValue = false;
	if (event.preventDefault) {
		event.preventDefault();
	}

	if (event.stopPropagation) {
		event.stopPropagation();
	}
}

Slider.prototype.move = function (event) {
	if (this.moving) {
		var new_x = event.pageX - this.divOffset.x - this.offsetX;
		
		if (new_x > this.__max_offset) {
			new_x = this.__max_offset;
		}
		if ((new_x + this.half_slider_width) < 0) {
			new_x = this.__min_offset;
		}


		this.value = Math.round(((new_x - this.__min_offset)/this.__full_range) * this.__full_range_values + this.min_value);
		
		this.slider.style.left = new_x + 'px';

		this.runListeners();	
		event.returnValue = false;

		if (event.preventDefault) {
			event.preventDefault();
		}
		if (event.stopPropagation) {
			event.stopPropagation();
		}
	}		
}


Slider.prototype.runListeners = function() {
	for (var i = 0; i < this.listeners['move'].length; i++) {
		var func = this.listeners['move'][i]['func'];
		var args = this.listeners['move'][i]['args'];
		var obj  = this.listeners['move'][i]['obj'];

		var args_ = new Array();
		args_.push(this.value);			
		for (var j = 0; j < args.length; j++) {
			args_.push(args[j]);		
		}

		func.apply(obj, args_);
	}
}

Slider.prototype.up = function () {
	this.moving = false;

	var new_x = this.getX();
	this.slider.style.left = new_x + 'px';
}

Slider.prototype.getX = function () {
	if (this.value > this.max_value) {
		this.value = this.max_value;
	}

	if (this.value < this.min_value) {
		this.value = this.min_value;
	}

	var new_x = ((this.value - this.min_value) / this.__full_range_values) * this.__full_range - this.half_slider_width;

	
	return new_x;
}

Slider.prototype.addEventListener = function (event, func, args, obj) {
	var args_ = args || new Array();
	if (!(args_ instanceof Array)) {
		args_ = new Array();
		args_.push(args);
	}

	this.listeners[event].push({
		'func' : func, 
		'args' : args_, 
		'obj'  : obj
	});
}


Slider.Util = new Object();

Slider.Util.addEvent = function (elem, evType, fn) {
    if (elem.addEventListener) {
        elem.addEventListener(evType, fn, false);
    }
    else {
        elem.attachEvent('on' + evType, fn)
    }
}

Slider.Util.fixEvent = function (e) {
    // получить объект событие для IE
    e = e || window.event
 
    // добавить pageX/pageY для IE
    if ( e.pageX == null && e.clientX != null ) {
        var html = document.documentElement
        var body = document.body
        e.pageX = e.clientX + (html && html.scrollLeft || body && body.scrollLeft || 0) - (html.clientLeft || 0)
        e.pageY = e.clientY + (html && html.scrollTop || body && body.scrollTop || 0) - (html.clientTop || 0)
    }

    // добавить which для IE
    if (!e.which && e.button) {
        e.which = e.button & 1 ? 1 : ( e.button & 2 ? 3 : ( e.button & 4 ? 2 : 0 ) )
    }
 
    return e;
}

Slider.Util.getMouseOffset = function (target, e) {
	var docPos  = Slider.Util.getPosition(target);
	return {x:e.pageX - docPos.x, y:e.pageY - docPos.y}
}

Slider.Util.getPosition = function (e) {
    var left = 0
    var top  = 0
 
    while (e.offsetParent){
        left += e.offsetLeft
        top  += e.offsetTop
        e    = e.offsetParent
    }
 
    left += e.offsetLeft
    top  += e.offsetTop
 
    return {x:left, y:top};
}

Slider.Util.setValue = function setValue(value, id) {
	var element = document.getElementById(id);
	if (element.tagName.toLowerCase() == 'input' || element.tagName.toLowerCase() == 'textarea') {
		element.value = value;
	}
	else {
		element.innerHTML = value;
	}
}

Slider.Util.getXMLHttpRequest = function () {
	if (typeof XMLHttpRequest === 'undefined') {
    XMLHttpRequest = function() {
      try { return new ActiveXObject("Msxml2.XMLHTTP.6.0"); }
        catch(e) {}
      try { return new ActiveXObject("Msxml2.XMLHTTP.3.0"); }
        catch(e) {}
      try { return new ActiveXObject("Msxml2.XMLHTTP"); }
        catch(e) {}
      try { return new ActiveXObject("Microsoft.XMLHTTP"); }
        catch(e) {}
      throw new Error("This browser does not support XMLHttpRequest.");
    };
  }
  return new XMLHttpRequest();
}
