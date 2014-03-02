SAMP_INT = '<math><mrow><msubsup><mo>∫</mo><mn>1</mn><mi>x</mi></msubsup><mfrac><mrow><mi>d</mi><mi>t</mi></mrow><mi>t</mi></mfrac></mrow></math>';
SAMP_EXP = '<math><mrow><msup><mi>x</mi><mn>2</mn></msup></mrow></math>';
SAMP_SUB = '<math><mrow><msub><mi>x</mi><mn>2</mn></msub></mrow></math>';

function Editor(parent, el) {
	this.el = $(el);

	this.parent = parent;
	this.active = false;
	this.input = new (window.inputMethod || KeyboardInput)(this);

	this.commands = {};

	el.on('click', this.activate.bind(this));
}

// Install listeners and elements for a focused editor
Editor.prototype.activate = function() {
	this.input.getcursor().appendTo(this.el);
	this.input.activate();
}

Editor.prototype.deactivate = function() {
	this.input.getcursor().remove();
}

Editor.prototype.navigate = function(direction) {
	if (direction = 1) {
		this.parent && this.parent.activate();
	} //TODO: Implement other directions
}

Editor.prototype.resolveCommand = function(cmd) {
	if (this.commands[cmd])
		return this.commands[cmd].bind(this);
	//else if (this.parent)
	//	return this.parent.resolveCommand(cmd);
	else return undefined;
}

Editor.prototype.insert = function(value) {
	//FIXME: Probably buggy
	this.el.append(value);
	this.input.getcursor().appendTo(this.el);
}

Editor.prototype.sendcommand = function(value) {
	var cmd = this.resolveCommand(value);
	console.log("cmd", value, cmd);
	return cmd ? cmd(value) : false;
}

Editor.prototype.sendinput = function(input) {
	this.insert(input + ' ');
	return true;
}

// Transforms complex pastes (ex. Image URI)
Editor.prototype.sendpaste = function(input) {
	this.insert(input);
}

Editor.prototype.dobackspace = function() {
	//FIXME: Buggy also.
	var cur = this.input.getcursor();
	cur.remove();
	var content = this.el.html();
	if (content[content.length-1] == '>')
		//TODO: Enter sections rather than deleting them whole
		this.el.children(":last-child").remove();
	else
		this.el.html(this.el.html().slice(0,-1));
	cur.appendTo(this.el);
}

Editor.prototype.childFactory = function(newType, args) {
	var args = Array.slice(args);
	args.unshift(this);

	return function() {
		var ed = new newType;
		newType.apply(ed, args);

		this.insert(ed.el);
		ed.activate();

		return true;
	}.bind(this);
}

// Base class for editors deriving from an DOM element or CSS class
ElementEditor = function(parent, el, className) {
	if (typeof el != "object")
		el = $('<' + el + '>');
	Editor.call(this, parent, el);

	this.className = className || (parent && parent.className) || "editText";
	el.addClass(this.className);
}
ElementEditor.prototype = Object.create(Editor.prototype);

// Editor for MathML content
MathEditor = function(parent, el, className) {
	ElementEditor.call(this, parent, el || "math", className || "editMath");

	this.commands['\\sqrt'] = this.childFactory(MathEditor, ["msqrt"]);
	this.commands['x^2'] = function() {this.insert(SAMP_EXP); return true;};
	this.commands['x_2'] = function() {this.insert(SAMP_SUB); return true;};
	this.commands['\\int'] = function() {this.insert("<mo>∫</mo>"); return true;};
}
MathEditor.prototype = Object.create(ElementEditor.prototype);

MathEditor.prototype.sendinput = function(input) {
	if (input.match(/-?[0-9]+(.[0-9]+)?(e[0-9]+)?/)) {
		this.insert($('<mn>').text(input));
	} else if (input.match(/[\+\-\/\\\*]/)) {
		this.insert($('<mo>').text(input));
	} else {
		this.insert($('<mi>').text(input));
	}

	return true;
}

// Editor for plain or formatted text
TextEditor = function(parent, el, className) {
	ElementEditor.call(this, parent, el, className);

	this.commands['\\eq'] = this.childFactory(MathEditor, ["math"]);
	this.commands['^'] = this.childFactory(TextEditor, ['sup']);
	this.commands['_'] = this.childFactory(TextEditor, ['sub']);
	this.commands['\\1'] = this.childFactory(TextEditor, ['h1']);
	this.commands['\\2'] = this.childFactory(TextEditor, ['h2']);
	this.commands['\\3'] = this.childFactory(TextEditor, ['h3']);
	this.commands['\\i'] = this.childFactory(TextEditor, ['i']);
	this.commands['\\b'] = this.childFactory(TextEditor, ['b']);
	this.commands['\\u'] = this.childFactory(TextEditor, ['u']);
}
TextEditor.prototype = Object.create(ElementEditor.prototype);