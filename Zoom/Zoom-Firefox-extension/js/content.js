//================================================
/*

Zoom
Zoom in or out on web content using the zoom button for more comfortable reading.
Copyright (C) 2019 Stefan vd
www.stefanvd.net

This program is free software; you can redistribute it and/or
modify it under the terms of the GNU General Public License
as published by the Free Software Foundation; either version 2
of the License, or (at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program; if not, write to the Free Software
Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301, USA.


To view a copy of this license, visit http://creativecommons.org/licenses/GPL/2.0/

*/
//================================================

function $(id) { return document.getElementById(id); }

var currentscreen = screen.width+"x"+screen.height;
chrome.runtime.sendMessage({action: "getallRatio", website: window.location.href, screen: currentscreen});

// Listen for messages
chrome.runtime.onMessage.addListener(function (msg, sender, sendResponse) {
    // If the received message has the expected format...
    if (msg.text === 'getwebzoom') {
        // Call the specified callback, passing
        // the web-page's DOM content as argument
        sendResponse(document.body.style.zoom);
    }
    else if (msg.text === 'getfontsize') {
        // Call the specified callback, passing
        // the web-page's DOM content as argument
        if($('stefanvdzoomextension')){
            var currentfontsizezoom = $('stefanvdzoomextension').getAttribute('data-current-zoom');
            sendResponse(currentfontsizezoom/100);
        }
    }
    else if (msg.text === 'refreshscreen') {
        var currentscreen = screen.width+"x"+screen.height;
        chrome.runtime.sendMessage({action: "getallRatio", website: window.location.href, screen: currentscreen });
    }
    else if (msg.text === 'setfontsize') {
        setdefaultfontsize();
    }else if (msg.text === 'changefontsize') {
        var newfontsize = msg.value;
        if($('stefanvdzoomextension')){
            $('stefanvdzoomextension').setAttribute('data-current-zoom',newfontsize);
        }else{
            var div = document.createElement("div");
            div.setAttribute('id','stefanvdzoomextension');
            div.setAttribute('data-current-zoom',newfontsize);
            div.style.display = "none";
            document.body.appendChild(div);
        }
        var q = document.getElementsByTagName('*');
        for(var i = 0; i < q.length; i++ ) {
            if(q[i].hasAttribute("data-default-fontsize")){
                var tempcurrent = q[i].getAttribute("data-default-fontsize")
                tempcurrent = tempcurrent.replace('px','');
                finalfontsize = tempcurrent * (newfontsize/100);
                finalfontsize = finalfontsize + "px";
            q[i].style.setProperty("font-size", finalfontsize, "important");
            }
        }
    }else if (msg.text === 'enablemagnifyingglass') {
        magnifyenabled = true;
        chrome.runtime.sendMessage({name: "getscreenshot"});
    }else if (msg.text === 'showmagnifyglass') {
        showmagnify(msg.value);
    }
});

var magnifyenabled = false;
var prevcoordx = -25;
var prevcoordy = -25;
var circlewidth; 
var zoom;
var bw;
var isScrolling;
var prefleft = 0; var preftop = 0;
function showmagnify(image){
    // mouse magnifying glass
    circlewidth = zoommagszoomsize; 
    zoom = zoommagszoomlevel;
    bw = 3;

    if($("stefanvdzoompoint")){
        clearmagnify();
    }else{
        addmanify(image);
    }

    window.addEventListener("mousemove", moveSpot, { passive: true });
    window.addEventListener("touchmove", moveSpot, { passive: true });
    window.addEventListener('scroll', function ( event ) {
        if(magnifyenabled == true){
        clearmagnify();
        // Clear our timeout throughout the scroll
        window.clearTimeout( isScrolling );

        // Set a timeout to run after scrolling ends
        isScrolling = setTimeout(function() {

            // Run the callback
            //console.log( 'Scrolling has stopped.' ); 
            chrome.runtime.sendMessage({name: "getscreenshot"});
        }, 66);
        }
    }, false);
}

function clearmagnify(){
    var elem = document.getElementById("stefanvdzoompoint");
    if(elem){elem.parentElement.removeChild(elem);}
}

function addmanify(image){
    var div = document.createElement("div");
    div.setAttribute('id','stefanvdzoompoint');
    div.setAttribute('class',"stefanzoommagnify");
    div.style.position = "fixed";
    div.style.border = "3px solid #000";
    if(zoommagcircle == true){
        div.style.borderRadius = "50%";
    }else{}
    div.style.cursor = "none";
    div.style.width = circlewidth+"px";
    div.style.height = circlewidth+"px";
    div.style.boxSizing = "border-box";
    div.addEventListener("click", function(){
        magnifyenabled = false;
        var elem = document.getElementById("stefanvdzoompoint");
        elem.parentElement.removeChild(elem);
    },false);
    div.style.zIndex = 990;
    // the image
    div.style.backgroundImage = "url('" + image + "')";
    div.style.backgroundRepeat = "no-repeat";

    var docheight = document.documentElement.clientHeight;
    var docwidth = document.documentElement.clientWidth;
    div.style.backgroundSize = (docwidth * zoom) + "px " + (docheight * zoom) + "px";
    div.style.left = parseInt(prevcoordx)-circlewidth/2+"px";// previous
    div.style.top = parseInt(prevcoordy)-circlewidth/2+"px";// previous
    div.style.backgroundPosition = prefleft + "px "+ preftop + "px";// previous
    document.body.appendChild(div);


    glass = $('stefanvdzoompoint');
    
    w = circlewidth / 2;
    h = circlewidth / 2;
}

var glass;
var w; var h;
function moveSpot(e) {
    var x = 0; var y = 0;
    if (!e) e = window.event;

    x = e.clientX;
    y = e.clientY;

    prevcoordx = x;
    prevcoordy = y;

    // set the view position of the magnifier glass
    glass.style.left = (x - w) + "px";
    glass.style.top = (y - h) + "px";
    // see area of the magnifier glass
    if(((y*zoom)-h+bw)>=0){
        topsign = "-"+((y*zoom)-h+bw);
    }else{
        topsign = Math.abs(((y*zoom)-h+bw));
    }
    preftop = topsign;
    var leftsign;
    if(((x*zoom)-w+bw)>=0){
        leftsign = "-"+((x*zoom)-w+bw);
    }else{
        leftsign = Math.abs(((x*zoom)-w+bw));
    }
    prefleft = leftsign;
    glass.style.backgroundPosition = leftsign + "px "+ topsign + "px";
}

function setdefaultfontsize(){
    var q = document.getElementsByTagName('*');
    for(var i = 0; i < q.length; i++ ) {
        if(q[i].currentStyle){
            var y = q[i].currentStyle["font-size"];
        }
        else if(window.getComputedStyle){
            var st = document.defaultView.getComputedStyle(q[i], null);
            var y = st.getPropertyValue("font-size");
        }

		if(q[i].hasAttribute("data-default-fontsize")){
            // already got the default font size
		}else{
			q[i].setAttribute("data-default-fontsize",y);
        }
    }
}

var zoommousescroll; var zoommousebuttonleft; var zoommousescrollup; var zoommousescrolldown;
var rightmousehold = false;
var zoommagcircle; var zoommagsquare; var zoommagszoomlevel; var zoommagszoomsize;
chrome.storage.sync.get(['zoommousescroll','zoommousebuttonleft','zoommousebuttonright','zoommousescrollup','zoommousescrolldown','zoommagcircle','zoommagsquare','zoommagszoomlevel','zoommagszoomsize'], function(response){
zoommousescroll = response.zoommousescroll;if(zoommousescroll == null)zoommousescroll = false; // default zoommousescroll false
zoommousebuttonleft = response.zoommousebuttonleft;if(zoommousebuttonleft == null)zoommousebuttonleft = true; // default zoommousebuttonleft false
zoommousebuttonright = response.zoommousebuttonright;if(zoommousebuttonright == null)zoommousebuttonright = false; // default zoommousebuttonright false
zoommousescrollup = response.zoommousescrollup;if(zoommousescrollup == null)zoommousescrollup = true; // default zoommousescrollup false
zoommousescrolldown = response.zoommousescrolldown;if(zoommousescrolldown == null)zoommousescrolldown = false; // default zoommousescrolldown false
zoommagcircle = response.zoommagcircle;if(zoommagcircle == null)zoommagcircle = true;
zoommagsquare = response.zoommagsquare;if(zoommagsquare == null)zoommagsquare = false;
zoommagszoomlevel = response.zoommagszoomlevel;if(zoommagszoomlevel == null)zoommagszoomlevel = 2;
zoommagszoomsize = response.zoommagszoomsize;if(zoommagszoomsize == null)zoommagszoomsize = 200;

if(zoommousescroll == true){
    document.body.addEventListener("mousedown", function(e) {
        e = e || window.event;
        if(zoommousebuttonleft == true){
            if(e.which == 1){
            rightmousehold = true;
            }
        }else{
            if(e.which == 3){
            rightmousehold = true;
            }
        }
    });
    document.body.addEventListener("mouseup", function(e) {
        rightmousehold = false;
    });

    window.addEventListener('wheel', function(e) {
        if(zoommousescrollup == true){
            if (e.deltaY < 0 && rightmousehold == true) {
                //console.log('scrolling up');
                chrome.runtime.sendMessage({name: "contentzoomout"});
            }
            if (e.deltaY > 0 && rightmousehold == true) {
                //console.log('scrolling down');
                chrome.runtime.sendMessage({name: "contentzoomin"});
            }
        } else{
            if (e.deltaY < 0 && rightmousehold == true) {
                //console.log('scrolling up');
                chrome.runtime.sendMessage({name: "contentzoomin"});
            }
            if (e.deltaY > 0 && rightmousehold == true) {
                //console.log('scrolling down');
                chrome.runtime.sendMessage({name: "contentzoomout"});
            }
        }
    });
}
});