SAMP_INT = '<math><mrow><msubsup><mo>∫</mo><mn>1</mn><mi>x</mi></msubsup><mfrac><mrow><mi>d</mi><mi>t</mi></mrow><mi>t</mi></mfrac></mrow></math>';
SAMP_EXP = '<math><mrow><msup><mi>x</mi><mn>2</mn></msup></mrow></math>';
SAMP_SUB = '<math><mrow><msub><mi>x</mi><mn>2</mn></msub></mrow></math>';

function Editor(parent, el) {
	this.el = $(el);

	this.parent = parent;
	this.defaultCommand = this.defaultCommand.bind(this);
	this.active = false;
	pending = "";

	this.commands = {};

	el.on('click', this.activate.bind(this));
}

// Install listeners and elements for a focused editor
Editor.prototype.activate = function() {
	if (this.active)
		return;
	this.active = true;

	var cursor = $('<span class="cursor">');
	cursor
		.appendTo(this.el);

	var doinput = function(e) {
		var pending = tmp.val();
		switch (e.which) {
			case 118: // v
				if (e.ctrlKey)
					pending = '';
					window.setTimeout(function() {
						this.sendpaste(tmp.val());
						tmp.val('');
					}.bind(this), 0);
				break;
			case 32: // Sp.
				if (this.sendinput(pending))
					pending = '';
					window.setTimeout(function() {
						tmp.val('');
					}, 0);
				break;
			case 8: // Bksp
				//FIXME: buggy.
				if (pending) {
					tmp.val(pending = pending.slice(0,-1));
				} else {
					this.el.text(this.el.text().slice(0,-1))
					cursor.appendTo(this.el);
				}
				break;
			case 0:
				break;
			default:
				pending += String.fromCharCode(e.which);
		}

		if (pending &&
			this.resolveCommand(pending) &&
			this.sendinput(pending)) {
			tmp.val(pending = '');
		}

		cursor.text(pending);
	}.bind(this);

	var dokey = function(e) {
		var pending = tmp.val();
		switch (e.which) {
			case 9: // Tab
			case 13: // Return
				e.preventDefault();
			case 39: // Right
				pending !== '' && this.sendinput(pending);
				tmp.val('');
				this.parent && this.parent.activate();
				break;
		}
	}.bind(this);

	this.deactivate = function() {
		tmp.remove();
		cursor.remove();
		this.active = false;
	}.bind(this);

	var tmp = $('<input class="offscreen" type="text">');
	tmp
		.blur(this.deactivate)
		.keydown(dokey)
		.keypress(doinput)
		.appendTo(document.body)
		.focus();

	this.insert = function(content) {
		return cursor.before(content);
	}
}

// Check if this editor or it's parents have a handler
// for the command
Editor.prototype.resolveCommand = function(cmd) {
	if (this.commands[cmd])
		return this.commands[cmd].bind(this);
	else if (this.parent)
		return this.parent.resolveCommand(cmd);
	else return undefined;
}

Editor.prototype.sendinput = function(value) {
	return (this.resolveCommand(value) || this.defaultCommand)(value);
}

// Handle input that doesn't match the pattern for any command
Editor.prototype.defaultCommand = function(input) {
	this.insert(input + ' ');
	return true;
}

// Transforms complex pastes (ex. Image URI)
Editor.prototype.sendpaste = function(input) {
	this.insert(input);
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
	this.commands['x^2'] = function() {return this.insert(SAMP_EXP)};
	this.commands['x_2'] = function() {return this.insert(SAMP_SUB)};
}
MathEditor.prototype = Object.create(ElementEditor.prototype);

MathEditor.prototype.defaultCommand = function(input) {
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
	this.commands['\\1'] = this.childFactory(TextEditor, ['h1']);
	this.commands['\\2'] = this.childFactory(TextEditor, ['h2']);
	this.commands['\\3'] = this.childFactory(TextEditor, ['h3']);
	this.commands['\\i'] = this.childFactory(TextEditor, ['i']);
	this.commands['\\b'] = this.childFactory(TextEditor, ['b']);
	this.commands['\\u'] = this.childFactory(TextEditor, ['u']);
}
TextEditor.prototype = Object.create(ElementEditor.prototype);


$(function(){
	var el = $('#editorRoot').first();
	var editor = new TextEditor(undefined, el);
	console.log("Created editor:", el, editor);
});