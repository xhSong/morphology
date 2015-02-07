var canvas;
var context;

var camera;
var ismousedown = false;
var mouse_x, mouse_y;
var level = 2;
var points;
var cos60 = Math.cos(Math.PI / 3);
var sin60 = Math.sin(Math.PI / 3);


function Point(x, y) {
    this.x = x || 0;
    this.y = y || 0;
    this.add = function(p2) {
        return new Point(this.x + p2.x, this.y + p2.y);
    }

    this.sub = function(p2) {
        return new Point(this.x - p2.x, this.y - p2.y);
    }

    this.multi = function(value) {
        return new Point(this.x * value, this.y * value);
    }

    this.rotate60 = function() {
        return new Point(this.x * cos60 - this.y * sin60, this.x * sin60 + this.y * cos60);
    }
    this.dist = function(p2) {
        return Math.sqrt((this.x - p2.x) * (this.x - p2.x) + (this.y - p2.y) * (this.y - p2.y));
    }
}

function Camera() {
    this.left = 0;
    this.right = canvas.width;
    this.top = 0;
    this.bottom = canvas.height;

    this.show = function() {
        alert(this.left.toString() + ", " + this.right.toString() + ", " + this.top.toString() + ", " + this.bottom.toString());
    };

    this.moveX = function(delta) {
        delta = delta / canvas.width * (this.right - this.left);
        this.left += delta;
        this.right += delta;
    };
    
    this.moveY = function(delta) {
        delta = delta / canvas.height * (this.bottom - this.top);
        this.top += delta;
        this.bottom += delta;
    };
	
    this.zoomin = function(rate_x, rate_y, k) {
	    var width = this.right - this.left;
		var height = this.bottom - this.top;
        this.left += (1 - k) * rate_x * width;
        // this.left = (this.left + rate_x / 2 * width) * 2;
        this.right -= (1 - k) * (1 - rate_x) * width;
        // this.right = (this.right - (1 - rate_x) / 2 * width) * 2;
        this.top += (1 - k) * rate_y * height;
        // this.top = (this.top + rate_y / 2 * height) * 2;
        this.bottom -= (1 - k) * (1 - rate_y) * height;
        // this.bottom = (this.bottom - (1 - rate_y) / 2 * height) * 2;
	}

    this.transform = function(point, rate) {
        var x = canvas.width / 2 + point.x * rate;
        var y = canvas.height / 2 - point.y * rate;
        return new Point((x - this.left) * canvas.width / (this.right - this.left),
                         (y - this.top) * canvas.height / (this.bottom - this.top));
    }
}

function init(id) {
    canvas = document.getElementById("canvas");
    if (canvas == null) return false;
    context = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    camera = new Camera();
    canvas.addEventListener("mousewheel", doMouseWheel, false);
    canvas.addEventListener("mousemove", doMouseMove, false);
    window.addEventListener("mousedown", doMouseDown, false);
    window.addEventListener("mouseup", doMouseUp, false);
    window.addEventListener("keydown", doKeyDown, false);
    CalcKoch(2);
    render();
}


function render() {
    clearCavans();
    renderInfo();
    rate = Math.min(window.innerWidth / 3, window.innerHeight / 3);
    var p = camera.transform(points[0], rate);
    context.beginPath();
    context.moveTo(p.x, p.y);
    for (var i = 1; i < points.length; ++i) {
        p = camera.transform(points[i], rate);
        context.lineTo(p.x, p.y);
    }
    context.closePath();
    // context.stroke();
    context.fillStyle = 'blue'
    context.fill();

    var center = camera.transform(new Point(0, 0), rate);
    var raduis = center.dist(camera.transform(new Point(1, 0), rate));
    context.lineWidth = 1;
    context.strokeStyle = "green"
    context.beginPath();
    context.arc(center.x, center.y, raduis, 0, Math.PI * 2, true);
    context.closePath();
    context.stroke();
}

function renderInfo() {
    context.strokeStyle = 'black';
    context.lineWidth = 1;
    context.font = "15px sans-serif"
    context.strokeText('Koch Snow', 55, 60);
    context.font = "10px sans-serif"
    context.strokeText('level: ' + level.toString(), 60, 80);
    context.strokeText('Press + to increase level', 60, 100);
    context.strokeText('Press - to decrease level', 60, 120);

}

function CalcKoch(level) {
    points = new Array(new Point(0, 1), new Point(Math.sqrt(3.0) / 2, -0.5), new Point(Math.sqrt(3.0) / -2, -0.5), new Point(0, 1));
    for (var l = 1; l < level; ++l) {
        var next = new Array();
        next.push(points[0])
        for (var i = 1; i < points.length; ++i) {
            var p1 = (points[i - 1].multi(2.0 / 3)).add(points[i].multi(1.0 / 3));
            var p2 = p1.sub(points[i - 1]).rotate60().add(p1);
            var p3 = points[i - 1].multi(1.0 / 3).add(points[i].multi(2.0 / 3));
            next.push(p1, p2, p3, points[i]);
        }
        points = next;
    }  
}


function doMouseWheel(event) {
	var rate_x = event.x / canvas.width;
    var rate_y = event.y / canvas.height;
    if (event.wheelDelta > 0) {
		camera.zoomin(rate_x, rate_y, 2 / 3);
        // camera.zoomin(.5, .5, 2 / 3);

    } else {
		camera.zoomin(rate_x, rate_y, 3 / 2);
        // camera.zoomin(.5, .5, 3 / 2);
    }
    // camera.show();
    render();
}

function doMouseMove(event) {
    if (ismousedown == true) {
        // alert("mouse move: " + event.offsetX.toString() + ", " + event.offsetY.toString());
        camera.moveX(-event.x + mouse_x);
        camera.moveY(-event.y + mouse_y);
        mouse_x = event.x;
        mouse_y = event.y;    
		render();
    }
}

function doMouseDown(event) {
    // alert("mouse down" + event.button.toString());
    if (event.button == 0) {
        
        ismousedown = true;
        mouse_x = event.x;
        mouse_y = event.y;
    }
}

function doMouseUp(event) {
    // 
    if (event.button == 0) {
        // alert("mouse up" + event.button.toString());
        ismousedown = false;
        render();
    }
}

function doKeyDown(event) {
    var keyID = event.keyCode? event.keyCode: event.which;
    // camera.show();
    // alert(keyID.toString());
    if (keyID == 68 || keyID == 187) { // key 'd' or '+'
        level += 1;
        level = Math.min(7, level);
        CalcKoch(level);
    } else if (keyID == 85 || keyID == 189) {           // key 'u' or '-'
        level = Math.max(1, level - 1);
        CalcKoch(level);
    }
    render();
    event.preventDefault();
}

function resizeCanvas() {   
    camera.right = camera.left + (camera.right - camera.left) / canvas.width * window.innerWidth;
    camera.bottom = camera.top + (camera.bottom - camera.top) / canvas.height * window.innerHeight;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    render();
}

function clearCavans() {
    context.fillStyle = "#F4F4F4";
    context.fillRect(0, 0, canvas.width, canvas.height);
}