var canvas;
var context;

var camera;
var ismousedown = false;
var mouse_x, mouse_y;
var level = 2;
var triangles;


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

    this.dist = function(p2) {
        return Math.sqrt((this.x - p2.x) * (this.x - p2.x) + (this.y - p2.y) * (this.y - p2.y));
    }
}

function Triangle(p1, p2, p3) {
    this.p1 = p1;
    this.p2 = p2;
    this.p3 = p3;
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
    Sierpinski(2);
    render();
}


function render() {
    clearCavans();
    renderInfo();
    rate = Math.min(window.innerWidth / 3, window.innerHeight / 3);

    context.fillStyle = 'blue'
    for (var i = 0; i < triangles.length; ++i) {
        var t = new Triangle(camera.transform(triangles[i].p1, rate), 
                             camera.transform(triangles[i].p2, rate), 
                             camera.transform(triangles[i].p3, rate));
        context.beginPath();
        context.moveTo(t.p1.x, t.p1.y);
        context.lineTo(t.p2.x, t.p2.y);
        context.lineTo(t.p3.x, t.p3.y);
        context.closePath();
        context.fill();
    }
}

function Sierpinski(level) {
    triangles = new Array(new Triangle(new Point(0, 1), 
                                    new Point(Math.sqrt(3.0) / 2, -0.5), 
                                    new Point(Math.sqrt(3.0) / -2, -0.5)));
    for (var l = 1; l < level; ++l) {
        var next = new Array();
        for (var i = 0; i < triangles.length; ++i) {
            var t = triangles[i];
            next.push(new Triangle(t.p1, t.p1.add(t.p2).multi(0.5), t.p1.add(t.p3).multi(0.5)));
            next.push(new Triangle(t.p1.add(t.p2).multi(0.5), t.p2, t.p2.add(t.p3).multi(0.5)));
            next.push(new Triangle(t.p1.add(t.p3).multi(0.5), t.p2.add(t.p3).multi(0.5), t.p3));
        }
        triangles = next;
    }  
}

function renderInfo() {
    context.strokeStyle = 'black';
    context.lineWidth = 1;
    context.font = "12px sans-serif"
    context.strokeText('Sierpinski', 55, 60);
    context.font = "10px sans-serif"
    context.strokeText('level: ' + level.toString(), 60, 80);
    context.strokeText('Press + to increase level', 60, 100);
    context.strokeText('Press - to decrease level', 60, 120);
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
        level = Math.min(9, level);
        Sierpinski(level);
    } else if (keyID == 85 || keyID == 189) {           // key 'u' or '-'
        level = Math.max(1, level - 1);
        Sierpinski(level);
    }
    render();
    // image = canvas.toDataURL('image/png').replace('image/png', 'image/octet-stream')
    // window.location.href = image
    // window.open(image, 'sierpinski' + level + '.png')
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