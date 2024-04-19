// Additional JS
let docTitle = document.title;

window.addEventListener("blur", () => {
    document.title = "Come back 🥺";
})

window.addEventListener("focus", () => {
    document.title = docTitle;
})


// let's start javascript
let currentSong = new Audio();

let play = document.querySelector(".playBtn");
let songs;
let currfolder;

function secondsToMMSS(seconds) {
    if (isNaN(seconds) || seconds < 0) {
        return "00:00";
    }
    var minutes = Math.floor(seconds / 60);
    var remainingSeconds = seconds % 60;
    var mm = minutes < 10 ? '0' + minutes : minutes;
    var ss = remainingSeconds < 10 ? '0' + remainingSeconds.toString().slice(0, 1) : remainingSeconds.toString().slice(0, 2);
    return mm + ':' + ss;
}

async function getSongs(folder) {
    currfolder = folder.replaceAll(" ", "%20");
    // console.log(currfolder);

    let a = await fetch(`http://192.168.29.218:3000/${currfolder}`);
    let response = await a.text();
    // console.log(response);
    let div = document.createElement("div");
    div.innerHTML = response;
    let as = div.getElementsByTagName("a");
    // console.log(as);
    songs = [];
    for (let i = 0; i < as.length; i++) {
        const element = as[i];
        if (element.href.endsWith(".mp3")) {
            songs.push(element.href.split(`/${currfolder}`)[1]);
        }
    }
    // console.log(songs);


    // show all the songs in the playlist
    let songUL = document.querySelector(".songList").getElementsByTagName("ul")[0];
    songUL.innerHTML = "";
    for (const song of songs) {
        songUL.innerHTML = songUL.innerHTML + `<li>
        <img src="music.svg" alt="">
        <div class="songinfo">
            <div>${song.replaceAll("_", " ").split(".")[0]}</div>
            <div>Tanmoy Das</div>
        </div>
        <div class="playNow">
            <span>Play Now</span>
            <img src="play.svg" alt="">
        </div>
        </li>`;
    }

    Array.from(document.querySelector(".songList").getElementsByTagName("li"))[0].style.backgroundColor = "red";
    Array.from(document.querySelector(".songList").getElementsByTagName("li"))[0].style.filter = "invert(1)";

    // attach an event listner to each song
    Array.from(document.querySelector(".songList").getElementsByTagName("li")).forEach(e => {
        e.addEventListener("click", element => {
            // console.log(e.querySelector(".songinfo").firstElementChild.innerHTML.trim());
            playMusic(e.querySelector(".songinfo").firstElementChild.innerHTML.trim());

            // change backgroundColor
            e.style.backgroundColor = "red";
            e.style.filter = "invert(1)";
        })
    })

    // attach an event listener to play, next and previous

    
    return songs;

}

const playMusic = (track, pause = false) => {
    let songName = track.replaceAll(" ", "_") + ".mp3";
    // let audio=new Audio("//songs/"+songName);
    currentSong.src = `/${currfolder}` + songName;
    if (!pause) {
        currentSong.play();
        play.src = "pause.svg";
        play.classList.remove("playBtn");
        play.classList.add("pauseBtn");
    }
    document.querySelector(".songname").innerHTML = track.replaceAll("_", " ");

    document.querySelector(".songtime").innerHTML = "00:00 / 00:00";
}

async function displayAlbums() {
    let a = await fetch(`http://192.168.29.218:3000/songs/`);
    let response = await a.text();
    // console.log(response);
    let div = document.createElement("div");
    div.innerHTML = response;
    let anchors = div.getElementsByTagName("a");
    // console.log(anchors);
    // let folders=[]
    let cardContainer = document.querySelector(".cardContainer");
    let array = Array.from(anchors)
    for (let index = 0; index < array.length; index++) {
        const e = array[index];

        if (e.href.includes("/songs")) {
            // console.log(e.href.split("/").splice(-2)[0]);
            let folder = (e.href.split("/").splice(-2)[0]);

            // get the meta data of the folder
            let a = await fetch(`http://192.168.29.218:3000/songs/${folder}/info.json`);
            let response = await a.json();
            // console.log(response);
            cardContainer.innerHTML = cardContainer.innerHTML + `<div data-folder="${folder}" class="card">
            <div class="play">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"
                    color="#000000" fill="black">
                    <path
                        d="M18.8906 12.846C18.5371 14.189 16.8667 15.138 13.5257 17.0361C10.296 18.8709 8.6812 19.7884 7.37983 19.4196C6.8418 19.2671 6.35159 18.9776 5.95624 18.5787C5 17.6139 5 15.7426 5 12C5 8.2574 5 6.3861 5.95624 5.42132C6.35159 5.02245 6.8418 4.73288 7.37983 4.58042C8.6812 4.21165 10.296 5.12907 13.5257 6.96393C16.8667 8.86197 18.5371 9.811 18.8906 11.154C19.0365 11.7084 19.0365 12.2916 18.8906 12.846Z"
                        stroke="currentColor" stroke-width="1.5" stroke-linejoin="round" />
                </svg>
            </div>
            <img src="/songs/${folder}/cover.jpeg" alt="">
            <h5>${response.title}</h5>
            <p>${response.description}</p>
        </div>`;
        }
    }

        
    // Load the playlist whenever card is clicked
    Array.from(document.getElementsByClassName("card")).forEach(e => {
        e.addEventListener("click", async item => {
            songs = await getSongs(`songs/${item.currentTarget.dataset.folder}/`)
            playMusic(songs[0].split(".mp3")[0])
            // console.log(songs);
        })
    })

}

async function main() {

    // get the list of all the songs
    await getSongs("songs/Hindi Songs/");
    // console.log(songs);

    playMusic(songs[0].split(".")[0], true);

    // Display all the albums on the page    
    displayAlbums()

    // Listen for timeupdate event
    currentSong.addEventListener("timeupdate", () => {
        // console.log(currentSong.currentTime, currentSong.duration);
        document.querySelector(".songtime").innerHTML = `${secondsToMMSS(currentSong.currentTime)} / ${secondsToMMSS(currentSong.duration)}`;

        //updating seekbar
        document.querySelector(".circle").style.left = (currentSong.currentTime / currentSong.duration) * 100 + "%";

    })

    // Add an event listener to the seekbar
    document.querySelector(".seekbar").addEventListener("click", (e) => {
        // console.log(e.clientX,e.clientY);
        // console.log(e.target.getBoundingClientRect().width,e.offsetX);
        if (currentSong.src != "") {
            // console.log((e.offsetX/e.target.getBoundingClientRect().width)*100);
            let percent = Math.floor((e.offsetX / e.target.getBoundingClientRect().width) * 100);
            document.querySelector(".circle").style.left = percent + "%";
            // console.log(((currentSong.duration)*percent)/100);

            currentSong.currentTime = ((currentSong.duration) * percent) / 100;
            // console.log(currentSong.currentTime, currentSong.duration);

        }
    })

    // displaying menubar on mobile
    document.querySelector(".menu").addEventListener("click", () => {
        document.querySelector(".left").style.left = "0";
    })

    // close menubar
    document.querySelector(".closeBtn").addEventListener("click", () => {
        document.querySelector(".left").style.left = "-200%";
    })

    play.addEventListener("click", () => {
        if (currentSong.paused) {

            currentSong.play();
            play.src = "pause.svg";
            play.classList.remove("playBtn");
            play.classList.add("pauseBtn");

        } else if (currentSong.played) {
            currentSong.pause();
            play.src = "play.svg";
            play.classList.remove("pauseBtn");
            play.classList.add("playBtn");

        }
        // else{
        //     let songArr=Array.from(document.querySelector(".songList").getElementsByTagName("li"));
        //     let songCount= songArr.length;
        //     let randomNum=Math.floor(Math.random()*songCount)
        //     console.log(randomNum);
        //     playMusic(songArr[randomNum].querySelector(".songinfo").firstElementChild.innerHTML.trim());
        //     songArr[randomNum].style.backgroundColor="red";
        //     songArr[randomNum].style.filter="invert(1)";
        // }

    })

    // Add an event listner to previous and next
    document.querySelector(".previousBtn").addEventListener("click", () => {
        // console.log('previous Clicked',currentSong);
        // console.log(currentSong.src);

        // get current song index
        let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0]);
        // console.log(index);

        if (index - 1 >= 0) {
            // play the music
            playMusic(songs[index - 1].split(".mp3")[0]);

            // change the li color
            Array.from(document.querySelector(".songList").getElementsByTagName("li"))[index - 1].style.backgroundColor = "red";
            Array.from(document.querySelector(".songList").getElementsByTagName("li"))[index - 1].style.filter = "invert(1)";
        } else {
            let lastIndex = songs.length - 1;
            // play the last song of the songs array
            playMusic(songs[lastIndex].split(".mp3")[0]);

            // change the li color
            Array.from(document.querySelector(".songList").getElementsByTagName("li"))[lastIndex].style.backgroundColor = "red";
            Array.from(document.querySelector(".songList").getElementsByTagName("li"))[lastIndex].style.filter = "invert(1)";
        }
    })

    document.querySelector(".nextBtn").addEventListener("click", () => {
        // console.log('next Clicked',currentSong);
        // console.log(currentSong.src.split("/").slice(-1)[0]);
        // console.log(songs)

        currentSong.pause();
        // get current song index
        let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0]);
        // console.log(index);

        if (index + 1 < songs.length) {

            // play the music
            playMusic(songs[index + 1].split(".mp3")[0]);

            // change the li color
            Array.from(document.querySelector(".songList").getElementsByTagName("li"))[index + 1].style.backgroundColor = "red";
            Array.from(document.querySelector(".songList").getElementsByTagName("li"))[index + 1].style.filter = "invert(1)";
        } else {
            // play the last song of the songs array
            playMusic(songs[0].split(".mp3")[0]);

            // change the li color
            Array.from(document.querySelector(".songList").getElementsByTagName("li"))[0].style.backgroundColor = "red";
            Array.from(document.querySelector(".songList").getElementsByTagName("li"))[0].style.filter = "invert(1)";
        }
    })

    // Add an event to volume
    document.querySelector(".range").getElementsByTagName("input")[0].addEventListener("change", (e) => {
        // console.log(e, e.target, e.target.value);
        if (e.target.value == 0) {
            document.querySelector(".volume").getElementsByTagName("img")[0].src = "mute.svg";
        }
        else if (e.target.value > 0 && e.target.value <= 30) {
            document.querySelector(".volume").getElementsByTagName("img")[0].src = "low_volume.svg";
        } else {
            document.querySelector(".volume").getElementsByTagName("img")[0].src = "volume.svg";
        }
        currentSong.volume = parseInt(e.target.value) / 100;
    })



    // mute the music
    document.querySelector(".volume").getElementsByTagName("img")[0].addEventListener("click",(e)=>{
        // console.log(e.target.src);
        if(e.target.src.includes("volume.svg")){
            // e.target.src.replace("volume.svg","mute.svg")
            e.target.src="mute.svg"
            currentSong.volume=0;
            document.querySelector(".range").getElementsByTagName("input")[0].value=0
        }
        else if (e.target.src.includes("low_volume.svg")){
            // e.target.src.replace("volume.svg","mute.svg");
            e.target.src="mute.svg"
            currentSong.volume=0;
            document.querySelector(".range").getElementsByTagName("input")[0].value=0
        }
        else{
            // e.target.src.replace("mute.svg","volume.svg")
            e.target.src="volume.svg"
            currentSong.volume=0.50;
            document.querySelector(".range").getElementsByTagName("input")[0].value=50
        }
    })
}

main();