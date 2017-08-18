// Jump to page
var queryString = document.location.hash;
var projectStrips = document.querySelectorAll('.gvr-strip--project');

if(queryString){
	var projectHash = queryString.replace('#','');
	if(projectHash === "goto-underworld" || projectHash === "goto-6x9"){
		for(var x=0; x<projectStrips.length; x++){
			projectStrips[x].classList.remove('gvr-strip--active')
		}
		var projectEl = document.querySelector("#" + projectHash);
		projectEl.classList.add('gvr-strip--active')
	}
}




// Expand and hide projects
var expandBtns = document.querySelectorAll('.gvr-vr__expandbtn');


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

// Auto-play header video on desktop
if (/Mobi/.test(navigator.userAgent) === false) {
	var videoEl = document.querySelector('.gvr-header__video');
	var sources = videoEl.querySelectorAll('source');
	if(window.innerWidth > 1140){
		sources[0].src = "<%= path %>/assets/header_video_hi.webm";
		sources[1].src = "<%= path %>/assets/header_video_hi.mp4";
	} else {
		sources[0].src = "<%= path %>/assets/header_video.webm";
		sources[1].src = "<%= path %>/assets/header_video.mp4";
	}
	videoEl.load();
	videoEl.setAttribute('autoplay', true);
	videoEl.play();
}

setTimeout(function(){
	animateHeaderText(0);
},4000)
