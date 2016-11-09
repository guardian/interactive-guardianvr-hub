





// Expand and hide projects
var expandBtns = document.querySelectorAll('.gvr-vr__expandbtn');
var projectStrips = document.querySelectorAll('.gvr-strip--project');

for(var i=0; i<expandBtns.length; i++){
	expandBtns[i].addEventListener('click',function(e){
		var oldPos = e.target.parentElement.getBoundingClientRect().top;
		for(var j=0; j<projectStrips.length; j++){
			projectStrips[j].classList.remove('gvr-strip--active');
		}
		e.target.parentElement.parentElement.parentElement.classList.add('gvr-strip--active');
		var newPos = e.target.parentElement.getBoundingClientRect().top;
		var diffPos = oldPos - newPos;
		var currentScroll = document.body.scrollTop;

		window.scrollTo(0,currentScroll - diffPos)
	})
}




// Play trailers
var trailerBtns = document.querySelectorAll('.gvr-vr__trailerbtn');
var stopTrailerBtns = document.querySelectorAll('.gvr-lightbox__close')

for(var i=0; i<trailerBtns.length; i++){
	trailerBtns[i].addEventListener('click',function(e){
		var videoUrl = e.target.getAttribute('data-video');
		var iframeEl = e.target.parentElement.parentElement.parentElement.querySelector('.gvr-lightbox__video iframe');

		iframeEl.src = videoUrl;
		e.target.parentElement.parentElement.parentElement.classList.add('gvr-strip--trailerplaying')
	})
}

for(var i=0; i<stopTrailerBtns.length; i++){
	stopTrailerBtns[i].addEventListener('click',function(e){
		e.target.parentElement.parentElement.parentElement.classList.remove('gvr-strip--trailerplaying')
		e.target.parentElement.querySelector('.gvr-lightbox__video iframe').src="";
	})
}

// Go to immersive
var previewBtns = document.querySelectorAll('.gvr-vr__previewbtn');

for(var i=0; i<previewBtns.length; i++){
	previewBtns[i].addEventListener('click',function(e){
		var url = e.target.getAttribute('data-url');
		document.location = url;
	})
	
}








// Animate header text
var headerTextContainer = document.querySelector('.gvr-header__title');

function animateHeaderText(count){
	var sentences = [
		"From a different perspective",
		"Step inside the story"
	]
	function fadeOutLetters(){
		var spans = headerTextContainer.querySelectorAll('span:not(.faded)');
		var randomNo = Math.round(Math.random()*(spans.length-1))
		setTimeout(function(){
			spans[randomNo].className = "faded";

			if(spans.length > 1){
				fadeOutLetters();
			}else{
				headerTextContainer.innerHTML = "";
				for(var k=0; k<sentences[count].length; k++){
					headerTextContainer.innerHTML += "<span class='faded'>" + sentences[count][k] + '</span>'
				}
				fadeInLetters();
			}
		},20)
	}
	fadeOutLetters();


	function fadeInLetters(){
		var spans = headerTextContainer.querySelectorAll('.faded');
		var randomNo = Math.round(Math.random()*(spans.length-1))
		setTimeout(function(){
			spans[randomNo].className = "";

			if(spans.length > 1){
				fadeInLetters();
			}else{
				if(count === 0){
					setTimeout(function(){
						animateHeaderText(1)
					},4000)
				}
			}
		},20)
	}
}

setTimeout(function(){
	animateHeaderText(0);
},4000)
