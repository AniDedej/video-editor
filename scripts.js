let video = document.getElementById('vid_1'),
    canvas = document.getElementById('c_vid_1'),
    context = canvas.getContext('2d'),
    bckCanvas = document.getElementById('c_vid_2'),
    bcv = bckCanvas.getContext('2d'),
    width = canvas.width,
    height = canvas.height;

let SELECTED_MODE = 0;
let videoSource = document.querySelector("#videoSource");
let preview = document.querySelector('.preview');
let fileTypes = [
    'video/mp4',
    'video/avi',
    'video/wmv',
    'video/webm'
]

videoSource.style.opacity = 0;
//Effects
let normalButton = document.getElementById('normal_bttn'),
    b_a_wButton = document.getElementById('grayScale_bttn'),
    pixelated = document.getElementById('pixelated_bttn'),
    adjustColors = document.querySelector("#adjustColors_bttn"),
    edgesBtn = document.querySelector("#edges_bttn"),
    blurBtn = document.querySelector("#blur_bttn"),
    noiseBttn = document.querySelector("#noise_bttn"),
    invertColorsBtn = document.querySelector("#invertColors_bttn");
    
let buttonSelected = document.getElementsByClassName('button_selected');

//Effects Updaters
let frameUpdate,
    bawUpdate,
    pixelUpdate,
    changeColorsUpdate,
    invColorsUpdate;

// Video Controllers
let videoCtrllsContainer = document.querySelector("#video-controls");
let videoContainer = document.querySelector("#videoContainer");
let playPauseBorder = document.getElementById("playPauseBorder");
let playPauseContainer = document.getElementById("playPauseContainer");
let playButton = document.getElementById("play-pause"),
    muteButton = document.getElementById("mute"),
    fullScreenButton = document.getElementById("full-screen"),
    seekBar = document.getElementById("seek-bar"),
    volumeBar = document.getElementById("volume-bar");
let volBarUser = volumeBar.value;
//playButton.disabled = true;
//muteButton.disabled = true;
//fullScreenButton.disabled = true;
seekBar.disabled = true;
//volumeBar.disabled = true;

//Filter Controllers
let filterController = document.querySelector("#filter-controllers");
let pixelatedController = document.querySelector("#pixelatedControllers");
let adjustColorsController = document.querySelector("#adjustColorSliders");
let pixelatedValue = document.querySelector("#pixelatedValue");
let pixelatedBttnClick = document.querySelector("#pixelatedSubmit");
let value;

filterController.removeChild(pixelatedController);
filterController.removeChild(adjustColorsController);

function updateImageDisplay() {
    while(preview.firstChild) {
        preview.removeChild(preview.firstChild);
    }
  
    let curFiles = videoSource.files;
    if(curFiles.length === 0) {
        let para = document.createElement('p');
        para.textContent = 'No video file currently selected for upload';
        preview.appendChild(para);
    } else {
        let list = document.createElement('ol');
        playButton.disabled = false;
        muteButton.disabled = false;
        fullScreenButton.disabled = false;
        seekBar.disabled = false;
        volumeBar.disabled = false;
        preview.appendChild(list);
        for(let i = 0; i < curFiles.length; i++) {
            let listItem = document.createElement('li');
            let para = document.createElement('p');
            if(validFileType(curFiles[i])) {
                video.src = URL.createObjectURL(curFiles[i]);
                para.textContent = 'File name: ' + curFiles[i].name + ', file size ' + returnFileSize(curFiles[i].size) + '.';
                listItem.appendChild(para);

            } else {
                para.textContent = 'File name: ' + curFiles[i].name + ': Not a valid file type. Update your selection.';
                listItem.appendChild(para);
            }

            list.appendChild(listItem);
        }
    }
}

  
function validFileType(file) {
    for(let i = 0; i < fileTypes.length; i++) {
        if(file.type === fileTypes[i]) {
            return true;
        }
    }
  
    return false;
}

function returnFileSize(number) {
    if(number < 1024) {
        return number + 'bytes';
    } else if(number > 1024 && number < 1048576) {
        return (number/1024).toFixed(1) + 'KB';
    } else if(number > 1048576) {
        return (number/1048576).toFixed(1) + 'MB';
    }
}

videoSource.addEventListener('change', updateImageDisplay);

function changeColors() {
    filterController.appendChild(adjustColorsController);
    context.drawImage(video, 0, 0, width, height);
    let apx = context.getImageData(0, 0, width, height);
    let data = apx.data,
        redSlider = parseInt(document.querySelector("#red").value),
        greenSlider = parseInt(document.querySelector("#green").value),
        blueSlider = parseInt(document.querySelector("#blue").value);

    for (let i = 0; i < data.length; i+=4) {
        data[i] = data[i] + redSlider;
        data[i+1] = data[i+1] + greenSlider;
        data[i+2] = data[i+2] + blueSlider;
    }

    apx.data = data;
    bcv.putImageData(apx, 0, 0);

    if (video.paused || video.ended || SELECTED_MODE !== 3) {
        clearTimeout(pixelUpdate);
        filterController.removeChild(adjustColorsController);
        return;
    }
    //requestAnimationFrame(changeColors);
    changeColorsUpdate = setTimeout(function () {
        changeColors();
    }, 0);
}

function blackAndWhiteFrame() {
    context.drawImage(video, 0, 0, width, height);
    let apx = context.getImageData(0, 0, width, height);
    let data = apx.data;

    for(let i = 0; i < data.length; i+=4) {
        let r = data[i],
            g = data[i+1],
            b = data[i+2];
            let v = 0.2126*r + 0.7152*g + 0.0722*b;
            data[i] = data[i+1] = data[i+2] = v;
    }

    apx.data = data;
    bcv.putImageData(apx, 0, 0);

    if (video.paused || video.ended || SELECTED_MODE !== 1) {
        clearTimeout(bawUpdate);
        return;
    }
    //requestAnimationFrame(blackAndWhiteFrame);
    bawUpdate = setTimeout(function () {
        blackAndWhiteFrame();
    }, 0);
}

function invertColors() {
    context.drawImage(video, 0, 0, width, height);
    let apx = context.getImageData(0, 0, width, height);
    let data = apx.data;

    for(let i = 0; i < data.length; i+=4) {
        let r = data[i],
            g = data[i+1],
            b = data[i+2];
        data[i] = 255 - r;
        data[i+1] = 255 - g;
        data[i+2] = 255 - b;
	}

    apx.data = data;
    bcv.putImageData(apx, 0, 0);

    if (video.paused || video.ended || SELECTED_MODE !== 4) {
        clearTimeout(invColorsUpdate);
        return;
    }
    //requestAnimationFrame(invertColors);
    let invColorsUpdate = setTimeout(function () {
        invertColors();
    }, 0);
}

function drawPixelFrame(blocksize) {
    filterController.appendChild(pixelatedController);
    context.drawImage(video, 0, 0, width, height);

    for(let x = 1; x < width; x += blocksize) {
        for(let y = 1; y < height; y += blocksize) {
            let pixel = context.getImageData(x, y, 1, 1);
            bcv.fillStyle = "rgb("+pixel.data[0]+","+pixel.data[1]+","+pixel.data[2]+")";
            bcv.fillRect(x, y, x + blocksize - 1, y + blocksize - 1);
        }
    }

    if (video.paused || video.ended || SELECTED_MODE !== 2) {
        filterController.removeChild(pixelatedController);
        clearTimeout(pixelUpdate);
        return;
    }
    /*requestAnimationFrame(function() {
        drawPixelFrame(blocksize);
    });*/
    pixelUpdate = setTimeout(function () {
        drawPixelFrame(blocksize);
    }, 0);
}

function drawPlayIcon() {
    bcv.fillStyle = "#0E2019";  // darken display
    bcv.globalAlpha = 0.5;
    bcv.fillRect(0,0,bckCanvas.width,bckCanvas.height);

    bcv.beginPath();
    bcv.fillStyle = "#2E4966"; // colour of circle
    bcv.globalAlpha = 0.7; // partly transparent
    bcv.arc(bckCanvas.width / 2 - 10, bckCanvas.height / 2, 80, 0, 2 * Math.PI); // create the circle
    bcv.closePath();
    bcv.fill();

    bcv.fillStyle = "#E9E9CF"; // colour of play icon
    bcv.globalAlpha = 0.75; // partly transparent
    bcv.beginPath(); // create the path for the icon
    let size = (bckCanvas.height / 2) * 0.25;  // the size of the icon
    bcv.moveTo(bckCanvas.width/2 + size/2, bckCanvas.height / 2); // start at the pointy end
    bcv.lineTo(bckCanvas.width/2 - size/2, bckCanvas.height / 2 + size);
    bcv.lineTo(bckCanvas.width/2 - size/2, bckCanvas.height / 2 - size);
    bcv.closePath();
    bcv.fill();
    bcv.globalAlpha = 1; // restore alpha
}
function drawFrame() {
    bcv.drawImage(video, 0, 0, width, height);
    //requestAnimationFrame(drawFrame);
    
    if (video.paused || video.ended) {
        clearTimeout(frameUpdate);
        return;
    }

    frameUpdate = setTimeout(drawFrame, 0);
}

video.addEventListener('play', selected);

pixelatedBttnClick.addEventListener("click", function () {
    value = parseInt(pixelatedValue.value);
});
function selected() {
    switch (SELECTED_MODE) {
        case 0:
            drawFrame();
            break;
        case 1:
            blackAndWhiteFrame();
            break;
        case 2:
            if (value !== NaN) {
                drawPixelFrame(value);
            } else {
                return;
            }
            break;
        case 3:
            changeColors();
            break;
        case 4:
            invertColors();
            break;
        case 5:
            edges();
            break;
        case 6:
            blur();
            break;
        case 7:
            noise();
            break;
        /*default:
            drawFrame();
            console.log("normal frame");
            break;*/
    }
    if (video.paused) {
        drawPlayIcon();
    }
    requestAnimationFrame(selected);
}
requestAnimationFrame(selected);
//setInterval(selected, 0);
//setTimeout(selected,0);

function playPauseClick(){
    if (video.src === "") {
        return;
    } else {
        if(video.paused){
            video.play();
            playButton.classList.remove("playIconHover");
            playButton.classList.add("pauseIconHover");
        }else{
            playButton.classList.remove("pauseIconHover");
            playButton.classList.add("playIconHover");
            video.pause();
        }
        if (!playPauseBorder.classList.contains("rotate")) {
            playPauseBorder.classList.remove("rotateReverse");
            playPauseBorder.classList.add("rotate");
        } else {
            playPauseBorder.classList.remove("rotate");
            playPauseBorder.classList.add("rotateReverse");
        }
    }
}
playPauseContainer.addEventListener("mouseenter", playPauseBtnHover);
playPauseContainer.addEventListener("mouseleave", function () {
    playPauseBorder.classList.remove("play_pauseBorderHover");
    if (playButton.classList.contains("playIconHover")) {
        playButton.classList.remove("playIconHover");
        playButton.classList.add("playIcon");
    } else {
        playButton.classList.remove("pauseIconHover");
        playButton.classList.add("pauseIcon");
    }
})
function playPauseBtnHover() {
    if (playButton.classList.contains("playIcon")) {
        playButton.classList.remove("playIcon");
        playButton.classList.add("playIconHover");
    } else {
        playButton.classList.remove("pauseIcon");
        playButton.classList.add("pauseIconHover");
    }
    playPauseBorder.classList.add("play_pauseBorderHover");
}
// Event listener for the volume bar
volumeBar.addEventListener("change", function () {
    volBarUpdate(volumeBar);
    volBarUser = volumeBar.value;
});

function volBarUpdate(vol) {
    // Update the video volume
    video.volume = vol.value;
    requestAnimationFrame(function () {
        volBarUpdate(vol);
    });
    return vol;
}

function videoMute(){
	if(!video.muted){
        video.muted = true;
        muteButton.textContent = "Unmute";
        volumeBar.value = 0;
    }else{
        video.muted = false;
        muteButton.textContent= "Mute";
        volumeBar.value = volBarUser;
    }
}

// Event listener for the seek bar
seekBar.addEventListener("change", function() {
    // Calculate the new time
    let time = video.duration * (seekBar.value / 100);

    // Update the video time
    video.currentTime = time;
});

// Update the seek bar as the video plays
video.addEventListener("timeupdate", function() {
    // Calculate the slider value
    let value = (100 / video.duration) * video.currentTime;

    // Update the slider value
    seekBar.value = value;
});

function fullScreen () {
    let videoSubContainer = document.querySelector("#videoSubContainer");
    if (document.fullscreenElement ||
        document.webkitFullscreenElement ||
        document.mozFullScreenElement ||
        document.msFullscreenElement) {
        if (document.exitFullscreen) {
            document.exitFullscreen();
        } else if (document.mozCancelFullScreen) {
            document.mozCancelFullScreen();
        } else if (document.webkitExitFullscreen) {
            document.webkitExitFullscreen();
        } else if (document.msExitFullscreen) {
            document.msExitFullscreen();
        }
        bckCanvas.style.width = "initial";
      } else {
        if (videoSubContainer.requestFullscreen) {
            videoSubContainer.requestFullscreen();
            bckCanvas.style.width = "100%";
        } else if (videoSubContainer.mozRequestFullScreen) {
            videoSubContainer.mozRequestFullScreen();
            bckCanvas.style.width = "100%";
        } else if (videoSubContainer.webkitRequestFullscreen) {
            bckCanvas.style.width = "100%";
            videoSubContainer.webkitRequestFullscreen(Element.ALLOW_KEYBOARD_INPUT);
        } else if (videoSubContainer.msRequestFullscreen) {
            videoSubContainer.msRequestFullscreen();
            bckCanvas.style.width = "100%";
        }
      }
}


function convolute(weights, opaque) {
	let side = Math.round(Math.sqrt(weights.length));
	let halfSide = Math.floor(side / 2);
	let pixels = getPixelData();
	let src = pixels.data;
	let sw = pixels.width;
	let sh = pixels.height;
	let pixelData = bcv.createImageData(width, height);
	let dst = pixelData.data;
	// Iterate through the destination image pixels
	let alphaFac = opaque ? 1 : 0;
	for (let y = 0; y < height; y++) {
		for (let x = 0; x < width; x++) {
			let sy = y;
			let sx = x;
			let dstOff = (y * width + x) * 4;
			// Calculate the weighed sum of the source image pixels that fall under the convolution matrix
			let r = 0, g = 0, b = 0, a = 0;
			for (let cy = 0; cy < side; cy++) {
				for (let cx = 0; cx < side; cx++) {
					let scy = sy + cy - halfSide;
					let scx = sx + cx - halfSide;
					if (scy >= 0 && scy < sh && scx >= 0 && scx < sw) {
						let srcOff = (scy * sw + scx) * 4;
						let wt = weights[cy * side + cx];
						r += src[srcOff] * wt;
						g += src[srcOff+1] * wt;
						b += src[srcOff+2] * wt;
						a += src[srcOff+3] * wt;
					}
				}
			}
			dst[dstOff] = r;
			dst[dstOff+1] = g;
			dst[dstOff+2] = b;
			dst[dstOff+3] = a + alphaFac * (255 - a);
		}
    }
	// Draw the data on the visible canvas
	bcv.putImageData(pixelData, 0, 0);
}
// Draws the contents of the video element onto the background canvas and returns the image data
function getPixelData() {
	// Draw the video onto the backing canvas
	bcv.drawImage(video, 0, 0, width, height);
	// Grab the pixel data and work on that directly
	return bcv.getImageData(0, 0, width, height);
}

function noise() {
	let pixelData = getPixelData();
	let pixelDataLen = pixelData.data.length;

	for (let i = 0; i < pixelDataLen; i += 4 ) {
		let rand =  (0.5 - Math.random()) * 70;
		
		let r = pixelData.data[i];
		let g = pixelData.data[i+1];
		let b = pixelData.data[i+2];

		pixelData.data[i] = r + rand;
		pixelData.data[i+1] = g + rand;
		pixelData.data[i+2] = b + rand;
	}
	// Draw the data on the visible canvas
	bcv.putImageData(pixelData, 0, 0);
}

// Blurs the canvas image
function blur() {
	let weights = [
		1/9, 1/9, 1/9,
		1/9, 1/9, 1/9,
		1/9, 1/9, 1/9];
	convolute(weights);
}

function edges() {
	let weights = [
		2, 1, -1,
		1, -4, -4,
        1, 3, 2 ];
    let weights2 = [
        7, 1, 0,
        1, -4, -4,
        1/2, 7/5, -2 ];
    let weights3 = [
        0, 1, -1,
        -1, 1, 1,
        1, 0, -2 ];
    convolute(weights);
}

// Pause the video when the slider handle is being dragged
seekBar.addEventListener("mousedown", function() {
    video.pause();
});

// Play the video when the slider handle is dropped
seekBar.addEventListener("mouseup", function() {
    video.play();
});

requestAnimationFrame(function () {
    volBarUpdate(volumeBar);
});
playButton.addEventListener('click', playPauseClick);
bckCanvas.addEventListener('click', function () {
    if (video.src === "") {
        return;
    } else {
        if(video.paused){
            video.play();
            playButton.classList.remove("playIcon");
            playButton.classList.add("pauseIcon");
        }else{
            playButton.classList.remove("pauseIcon");
            playButton.classList.add("playIcon");
            video.pause();
        }
        if (!playPauseBorder.classList.contains("rotate")) {
            playPauseBorder.classList.remove("rotateReverse");
            playPauseBorder.classList.add("rotate");
        } else {
            playPauseBorder.classList.remove("rotate");
            playPauseBorder.classList.add("rotateReverse");
        }
        // Event listener for the full-screen button
        fullScreenButton.addEventListener("click", fullScreen);
        normalButton.addEventListener('click', function () {
            SELECTED_MODE = 0;
        });
        b_a_wButton.addEventListener('click', function () {
            SELECTED_MODE = 1;
        });
        pixelated.addEventListener('click', function () {
            SELECTED_MODE = 2;
        });
        adjustColors.addEventListener('click', function() {
            SELECTED_MODE = 3;
        });
        invertColorsBtn.addEventListener('click', function () {
            SELECTED_MODE = 4;
        });
        edgesBtn.addEventListener('click', function () {
            SELECTED_MODE = 5;
            console.log('Edges');
        });
        blurBtn.addEventListener('click', function () {
            SELECTED_MODE = 6;
        });
        noiseBttn.addEventListener('click', function () {
            SELECTED_MODE = 7;
        });
    }
});

muteButton.addEventListener("click", videoMute);

//requestAnimationFrame(drawFrame);

