var expandBtns = document.querySelectorAll('.gvr-vr__expandbtn');

for(var i=0; i<expandBtns.length; i++){
	expandBtns[i].addEventListener('click',function(e){
		e.target.parentElement.parentElement.classList.add('gvr-strip--active')
	})
}