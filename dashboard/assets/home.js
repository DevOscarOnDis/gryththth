let menu = document.querySelector('.ghost');
let sidenavbar = document.querySelector('.side-navbar');
let content = document.querySelector('.content');
 
menu.onclick = () => {
    sidenavbar.classList.toggle('active');
    content.classList.toggle('active');
}
window.onload = function ()  {
    sidenavbar.classList.toggle('active');
    content.classList.toggle('active');
}

/* up_button */
const mybutton = document.querySelector(".up")
mybutton.onclick = function () {
    window.scrollTo({
        top: 0,
        left: 0,
        behavior: 'smooth'
    });
}
window.onscroll = function() {scrollFunction()};

function scrollFunction() {
if (document.body.scrollTop > 20 || document.documentElement.scrollTop > 20) {
mybutton.style.display = "block";
} else {
mybutton.style.display = "none";
}
}

let inp = document.querySelector(".form-control")

inp.onclick = function () {
  let wow = inp.innerText;
    navigator.clipboard.writeText(inp.innerText);
  inp.innerText = "DONE";
  
}

document.body.style.height = "auto";