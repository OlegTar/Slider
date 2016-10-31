# Slider
Javascript slider

#Usages
Quick start:
```Html
<html>
<head>
<meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
<script src="slider.js"></script>
<script>
onload = function() {
  new Slider({
      id : 'slider',//id of div for placing the slider
      width : 100,//width of slider,
      min_value: 0,
      max_value: 100,
      value_id : 'value',//id of input for putting value (optional)
      init_value: 25//(initial value, optional)
    });
}
</script>
<body>
<div id="slider"></div>
<input type="text" id="value"/>
</body>
</html>
```

# Listeners:
```javascript
slider.addEventListener(eventName, function, parameter, thisObject)
```
##Parameters
* ``` event name ``` - event name, type: string
* ``` function ``` - method, type: function
* ``` parameter ``` - second parameter for function (the first one is the value of the slider), type: anything
* ``` this object ``` - object for replacing **this** of the method, type: Object *(optional)*

# Events
* Move - it's raised when user is dragging the slider

## Example
```Html
<html>
<head>
<meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
<script src="slider.js"></script>
<script>
onload = function() {
  var slider = new Slider({
      id : 'slider',//id of div for placing the slider
      width : 100,//width of slider,
      min_value: 0,
      max_value: 100,
      init_value: 25//(initial value, optional)
    });
  slider.addEventListener('move', setValue, 'double_value');
}

function setValue(sliderValue/*value of the slider*/, id) {
	document.getElementById(id).innerHTML = sliderValue * 2;
}
</script>
<body>
<div id="slider"></div>
<span id="double_value"></span>
</body>
</html>
```


