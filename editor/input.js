function Input(target) {
	this.active = false;
	this.target = target;
	
	this.cursor = $('<span class="cursor">');
};

Input.prototype.getpending = function() {}
Input.prototype.setpending = function() {}

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

function HandwritingInput(target) {
	Input.call(this, target);
};
HandwritingInput.prototype = Object.create(Input.prototype);

HandwritingInput.prototype.activate = function() {
	
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
	console.log("getpending", this.tmp.val().replace(/(^\s|\s$)/, ''));
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
}

KeyboardInput.prototype.deactivate = function() {
	this.cursor.remove();
	this.target.deactivate();
	
	this.active = false;
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
		case 118: // v
			if (e.ctrlKey) {
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
		case 0:
			pending = this.getpending()
			break;
		default:
			pending = this.getpending() + String.fromCharCode(e.which);
			e.preventDefault();
	}

	if (pending && this.target.sendcommand(pending)) {
		this.setpending('');
	} else {
		this.setpending(pending);
	}
}