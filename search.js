function ratelimit(fn, delay) {
   delay = delay || 300;

   var delayTimer = null;

   return function() {
      var args = arguments;
      var callerThis = this;
      queuedCall = function(){
         delayTimer = null;
         fn.apply(callerThis, args)
      };

      if (delayTimer) {
         window.clearTimeout(delayTimer);
      }

      delayTimer = window.setTimeout(queuedCall, delay);
   };
}

function textSearch() {
	var query = $(this).val()
		.toLowerCase()
		.replace(/[,.\/\\\[\]\(\)"']/, '')
		.split(' ');

	if (query) {
		$('#transcription > *').each(function(i, el) {
			var score = 0;
			el = $(el);
			var text = el.text()
				.toLowerCase()
				.replace(/[,.\/\\\[\]\(\)"']/, '')

			for (i in query) {
				if (text.indexOf(query[i]) == -1) {
					el.hide();
					return;
				}
			}

			el.show();
		});
	} else {
		$('#transcription > *').show();
	}
}

$(function(){
	$('#search_field').on('keypress', ratelimit(textSearch, 200))
});