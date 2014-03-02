LOREM = "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vestibulum gravida eu urna ut aliquet. Sed faucibus congue dui, at vehicula ante consectetur a. Quisque vel egestas mi. Phasellus vitae lectus ac diam scelerisque facilisis a at dolor. Sed at molestie elit. Phasellus nisl mauris, molestie malesuada pellentesque nec, luctus non lacus. Quisque elementum eleifend luctus. Nam vestibulum volutpat metus, rutrum blandit nunc posuere id. Pellentesque lobortis convallis ante. Pellentesque eget feugiat arcu, id posuere nunc. Curabitur orci lorem, consequat vel consequat vitae, mattis vitae nibh. Aenean vitae dictum leo. Praesent at arcu quis massa auctor feugiat. Phasellus vel metus ut augue lobortis aliquet. Phasellus vel ultricies ligula. Duis posuere, sapien ac euismod tempus, dui leo mollis felis, sit amet interdum ipsum ligula ut dolor.  In hac habitasse platea dictumst. Cras id placerat urna. Phasellus ut orci quis nunc sagittis iaculis. Phasellus eu sem vel lacus aliquet placerat. Phasellus consectetur bibendum consectetur. Donec eget justo eu quam lacinia pellentesque. Vivamus ut viverra lectus. Duis euismod blandit nisl tempor molestie. Sed vel blandit turpis, tempor suscipit odio. Quisque feugiat vestibulum malesuada. Cras molestie felis vel est molestie, et tempus lectus ornare. Praesent eros ipsum, aliquet nec urna eu, venenatis iaculis tortor.  Nullam placerat leo mi, et hendrerit turpis egestas eu. Duis fermentum ipsum rhoncus mattis convallis. Cras sed porta tortor. Nunc luctus eleifend massa id laoreet. Aliquam quis fringilla libero. In a pharetra elit. Duis vitae neque blandit, feugiat velit non, suscipit tortor. Vivamus id lobortis lacus, sit amet fermentum odio. Mauris fringilla pulvinar dapibus. Nam pellentesque auctor leo, id cursus elit sodales id. Cras ac quam in leo gravida commodo vel eget erat. Fusce id purus in leo pulvinar placerat sed vel est. Etiam tincidunt elit sed ultrices imperdiet. Curabitur vitae odio sollicitudin, viverra purus et, molestie sapien. Morbi commodo mollis enim in varius. Duis sed mauris aliquet tortor aliquam facilisis ultrices ut turpis.  Suspendisse ut fringilla erat. Suspendisse placerat pharetra arcu, non dignissim libero semper eu. Cras ac felis vel turpis dapibus aliquam a a purus. Mauris ornare, urna nec laoreet ullamcorper, ante mi tincidunt ipsum, ut interdum purus lorem sed diam. Cras et nunc consequat, commodo erat ut, placerat tellus. Quisque at suscipit libero. Proin eros quam, vulputate a purus eget, aliquet fringilla ligula. Vestibulum in mi in nisl iaculis consequat non id turpis. Phasellus sed imperdiet purus. Suspendisse potenti. In in vulputate odio, a vulputate felis. Duis rhoncus augue vel facilisis bibendum.  Nam porta sapien congue, vulputate dolor a, hendrerit felis. Mauris id justo eleifend, rhoncus mi a, facilisis velit. Nullam ac libero id massa porttitor sollicitudin in varius lacus. Pellentesque mattis magna vitae libero faucibus, a imperdiet purus lobortis. Praesent pulvinar lectus ipsum, quis feugiat sapien ultrices eu. Nullam ultricies at tellus vel viverra. Pellentesque rutrum mattis erat, nec tristique diam scelerisque sed. Duis ut sapien ut tortor placerat adipiscing. Mauris sollicitudin vehicula est, nec convallis justo blandit a. Proin sit amet leo ac libero facilisis dapibus varius quis lorem. Pellentesque volutpat velit sed erat facilisis vulputate. Nulla dapibus libero quis risus lobortis gravida."

function Input(target) {
	this.active = false;
	this.target = target;
	
	this.cursor = $('<span class="cursor">');
};

Input.prototype.getpending = function() {}
Input.prototype.setpending = function() {}

Input.prototype.activate = function() {
	
}

Input.prototype.deactivate = function() {
	this.target.deactivate();
}

Input.prototype.getcursor = function() {
	return this.cursor;
}

Input.prototype.dobackspace = function() {
	var pending = this.getpending();
	if (pending) {
		this.setpending(pending.slice(0,-1));
	} else {
		this.setpending(this.target.dobackspace());
	}
}

Input.prototype.sendinput = function() {
	if (this.target.sendinput(this.getpending())) {
		this.setpending('');
		return true;
	}
	return false;
}

function KeyboardInput(target) {
	Input.call(this, target);
	
	this.tmp = $('<input class="offscreen" type="text">');
	this.tmp
		.blur(this.deactivate.bind(this))
		.keydown(this.dokeydown.bind(this))
		.keypress(this.dokeypress.bind(this))
		.appendTo(document.body);
};
KeyboardInput.prototype = Object.create(Input.prototype);

KeyboardInput.prototype.getpending = function() {
	return this.tmp.val().replace(/(^\s|\s$)/, '');
}

KeyboardInput.prototype.setpending = function(value) {
	this.cursor.text(value);
	console.log("set", value, this.cursor, this.cursor.text())
	return this.tmp.val(value);
}

KeyboardInput.prototype.activate = function() {
	if (this.active)
		return;
	this.active = true;
	
	this.tmp.focus();
	Input.prototype.activate.call(this);	
}

KeyboardInput.prototype.deactivate = function() {
	this.active = false;
	Input.prototype.deactivate.call(this);
}

KeyboardInput.prototype.dokeydown = function(e) {
	var pending = this.tmp.val();
	switch (e.which) {
		case 9: // Tab
		case 13: // Return
			e.preventDefault();
		case 39: // Right
			pending !== '' && this.sendinput(pending);
			this.setpending('');
			this.target.navigate(1);
			break;
	}
}

KeyboardInput.prototype.dokeypress = function(e) {
	var pending;
	switch (e.which) {
		case 118:
			if (e.ctrlKey) { // Ctrl-V
				pending = '';
				window.setTimeout(function() {
					this.target.sendpaste(this.getpending());
					tmp.setpending('');
				}.bind(this), 0);
			}
			break;
		case 32: // Sp.
			this.sendinput()
			return;
		case 8: // Bksp
			this.dobackspace();
			pending = this.getpending();
			break;
		case 0: // Non-printable
			pending = this.getpending();
			break;
		default:
			if (e.ctrlKey || e.altKey)
				return;
			pending = this.getpending() + String.fromCharCode(e.which);
			e.preventDefault();
	}

	if (pending && this.target.sendcommand(pending)) {
		this.setpending('');
	} else {
		this.setpending(pending);
	}
}

function HandwritingInput(target) {
	Input.call(this, target);
	
	this.active = false;
	
	this.simulatedInput = ["<h1>NoteTorious</h1>", "<b>NoteTorious</b>", "recognizes", "whatever", "you", "write!", "</br></br><u>Examples:</u></br>", "Math~", "y", "=", "x<sup>2</sup>", "+", "2x", "+", "4", "</br>", "Chemistry~", "C<sub>6</sub>", "H<sub>12</sub>", "O<sub>6</sub>", "</br>", "Links~", '<a href="#">email@address.com</a>', '<a href="#">notetorio.us</a>', "<br><i>And</i>", "<i>more~</i></br>"];
	this.simulatedInput.push.apply(this.simulatedInput, LOREM.split(' '));
};
HandwritingInput.prototype = Object.create(Input.prototype);

HandwritingInput.prototype.activate = function() {
	if (this.active)
		return
	this.active = true;
	
	this.pad = $('<canvas width="600" height="400" class="penInput" tabindex="0">');
	this.pad
		.on('touchstart', this.startline.bind(this))
		.on('touchend', this.finishline.bind(this))
		.on('touchmove', this.continueline.bind(this))
		.mousedown(this.startline.bind(this))
		.mouseup(this.finishline.bind(this))
		.mousemove(this.continueline.bind(this))
		.mouseout(this.finishline.bind(this))
		.blur(this.deactivate.bind(this))
		.appendTo(document.body)
		.focus();
		
	this.scale = {
		x: this.pad[0].width / this.pad.width(),
		y: this.pad[0].height / this.pad.height()
	}
		
	this.ctx = this.pad[0].getContext("2d");
	this.clearCanvas();
		
	Input.prototype.activate.call(this);	
}

HandwritingInput.prototype.deactivate = function() {
	this.pad.remove();
	this.pad = this.ctx = undefined;
	
	this.active = false;
		
	Input.prototype.deactivate.call(this);
}

//TODO Replace with actual recognition code
HandwritingInput.prototype.getpending = function() {return this.simulatedInput[0];}
HandwritingInput.prototype.setpending = function() {this.simulatedInput.shift();}
HandwritingInput.prototype.recognize = function() {
	this.sendinput();
	return true;
}

HandwritingInput.prototype.getPosition = function(t) {
	var offset = this.pad.offset();

	//document.write(t.originalEvent.touches);
	if (t.originalEvent.touches)
		// This is a touch event
		//TODO Support multitouch
		t = t.originalEvent.touches[0]
	
	//document.write("x:"+(t.pageX - offset.left) * this.scale.x)
	return {
		x: (t.pageX - offset.left) * this.scale.x,
		y: (t.pageY - offset.top) * this.scale.y
	};
}

HandwritingInput.prototype.clearCanvas = function() {
	this.ctx.clearRect(0, 0, this.pad[0].width, this.pad[0].height);
	
	this.ctx.beginPath();
	this.ctx.moveTo(0, 325);
	this.ctx.lineTo(600, 325);
	
	this.ctx.moveTo(0, 75);
	this.ctx.lineTo(600, 75);
	this.ctx.stroke();
	
	this.ctx.beginPath();
	this.ctx.setLineDash([5]);
	
	this.ctx.moveTo(0, 200);
	this.ctx.lineTo(600, 200);
	
	this.ctx.stroke();
	this.ctx.setLineDash([]);
}

HandwritingInput.prototype.startline = function(e) {
	e.preventDefault();
	
	window.clearTimeout(this.wordTimer);
	this.strokes = this.strokes || []
	this.curStroke = this.curStroke || [this.getPosition(e)];
}

HandwritingInput.prototype.continueline = function(e) {
	e.preventDefault();
	
	if (!this.curStroke)
		return;
	
	var newPos = this.getPosition(e);
	var lastPos = this.curStroke[this.curStroke.length-1];
	this.curStroke.push(newPos);
	
	this.ctx.beginPath();
	this.ctx.moveTo(lastPos.x, lastPos.y);
	this.ctx.lineTo(newPos.x, newPos.y);
	this.ctx.stroke();
}

HandwritingInput.prototype.finishline = function(e) {
	e.preventDefault();
	
	this.strokes.push(this.curStroke);
	delete this.curStroke;
	
	this.wordTimer = window.setTimeout(this.finishword.bind(this), 500);
}

HandwritingInput.prototype.finishword = function(e) {
	if (this.recognize()) {
		delete this.linePos;
		this.clearCanvas();
	} else {
		//TODO: Handle recognizer failure
	}
}