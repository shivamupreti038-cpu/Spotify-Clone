

let songs;
let currentSong = new Audio();
let currFolder = "songs/ncs";
let currentSongIndex = 0;

console.log("Spotify Clone with 6 Playlists Loaded");


function secondsToMinutesSeconds(seconds) {
    if (isNaN(seconds) || seconds < 0) {
        return "00:00";
    }

    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);

    const formattedMinutes = String(minutes).padStart(2, '0');
    const formattedSeconds = String(remainingSeconds).padStart(2, '0');

    return `${formattedMinutes}:${formattedSeconds}`;
}


async function getSongs(folder) {
    currFolder = folder;
    try {
        console.log(`Fetching songs from: http://127.0.0.1:3000/${folder}/`);
        let a = await fetch(`http://127.0.0.1:3000/${folder}/`);
        
        if (!a.ok) {
            throw new Error(`Server returned ${a.status}: ${a.statusText}`);
        }
        
        let response = await a.text();
        console.log(`Server response for ${folder}:`, response.substring(0, 200) + "...");
        
        let div = document.createElement("div");
        div.innerHTML = response;
        let as = div.getElementsByTagName("a");
        
        let songs = [];
        for (let index = 0; index < as.length; index++) {
            const element = as[index];
            if (element.href.endsWith(".mp3")) {
                let songPath = element.href.split("songs")[1];
                songs.push(songPath);
                console.log(`Found song: ${songPath}`);
            }
        }
        
        console.log(`Total songs found in ${folder}: ${songs.length}`);
        return songs;
    } catch (error) {
        console.error(`Error fetching songs from ${folder}:`, error);
        return [];
    }
}


const playMusic = (track, pause = false) => {
    if (!track || !songs || songs.length === 0) return;
    
    currentSongIndex = songs.indexOf(track);
    console.log("Playing song at index:", currentSongIndex, "Track:", track);
    
    currentSong.src = "/songs" + track;
    
    if (!pause) {
        currentSong.play();
        play.src = "pause.svg";
    }
    
    let filename = track.split('/').pop();
    let folderName = currFolder.split('/').pop();
    
    let displayName = decodeURI(filename)
        
        .replace(/\\/g, ' ')
        .replace(/%20/g, ' ')
        .replace(/%5C/g, ' ')
        .replace(/%5D/g, ' ')
        .replace(/%5B/g, ' ')
        .replace(/%28/g, '(')
        .replace(/%29/g, ')')
       
        .replace(new RegExp(`^${folderName}\\s*`, 'i'), '')
        .replace(/Copy/gi, '(Copy)')
        .replace(/-/g, ' - ')
        .replace(/_/g, ' ')
        .trim();
    
 
    const prefixes = ['ncs', 'cs', 'ggm', 'llr', 'bcd', 'ppq'];
    prefixes.forEach(prefix => {
        displayName = displayName.replace(new RegExp(`^${prefix}\\s*`, 'i'), '').trim();
    });
    
    document.querySelector(".songinfo").innerHTML = displayName || "Select a song";
    document.querySelector(".songtime").innerHTML = "00:00/00:00";
}


async function loadPlaylist(folderPath) {
    console.log("Loading playlist:", folderPath);
  
    document.querySelectorAll('.card').forEach(card => {
        card.classList.remove('active');
    });
    
    
    let clickedCard = document.querySelector(`.card[data-folder="${folderPath}"]`);
    if (clickedCard) {
        clickedCard.classList.add('active');
    }
    
   
    let songUL = document.querySelector(".songList ul");
    songUL.innerHTML = "<li>Loading songs...</li>";
    
    
    songs = await getSongs(folderPath);
    console.log("Loaded songs:", songs);
    
    if (songs.length === 0) {
        console.error("No songs found in playlist!");
        songUL.innerHTML = `<li class="error">No songs found in ${folderPath}</li>
                           <li class="help">Please check if folder exists and contains .mp3 files</li>`;
        return;
    }
    
   
    songUL.innerHTML = "";
    
    let folderName = folderPath.split('/').pop();
    
    for (const song of songs) {
        let filename = song.split('/').pop();
        
        let displayName = decodeURI(filename)
            
            .replace(/\\/g, ' ')
            .replace(/%20/g, ' ')
            .replace(/%5C/g, ' ')
            .replace(/%5D/g, ' ')
            .replace(/%5B/g, ' ')
            .replace(/%28/g, '(')
            .replace(/%29/g, ')')
            
            .replace(new RegExp(`^${folderName}\\s*`, 'i'), '')
            .replace(/Copy/gi, '(Copy)')
            .replace(/-/g, ' - ')
            .replace(/_/g, ' ')
            .trim();
        
        
        ['ncs', 'cs', 'ggm', 'llr', 'bcd', 'ppq'].forEach(prefix => {
            displayName = displayName.replace(new RegExp(`^${prefix}\\s*`, 'i'), '').trim();
        });
        
        songUL.innerHTML += `<li> 
            <img class="invert" src="abc.svg" alt="">
            <div class="info">
                <div>${displayName}</div>
                <div></div>
            </div>
            <div class="playnow">
                <span>Play Now</span>
                <img class="invert" src="play.svg" alt="">
            </div>
        </li>`;
    }
    
    
    Array.from(document.querySelectorAll(".songList li")).forEach((li, index) => {
        li.addEventListener("click", () => {
            console.log("Playing from list, index:", index);
            playMusic(songs[index]);
        });
    });
    
    
    if (songs.length > 0) {
        playMusic(songs[0], true);
    }
}


async function main() {
    
    await loadPlaylist("songs/ncs");
    
    
    document.querySelectorAll('.card').forEach(card => {
        card.addEventListener('click', async () => {
            let folder = card.getAttribute('data-folder');
            console.log("Card clicked, loading:", folder);
            await loadPlaylist(folder);
        });
    });
    
    
    play.addEventListener("click", () => {
        if (currentSong.paused) {
            currentSong.play();
            play.src = "pause.svg";
        } else {
            currentSong.pause();
            play.src = "play.svg";
        }
    });

    
    currentSong.addEventListener("timeupdate", () => {
        document.querySelector(".songtime").innerHTML = 
            `${secondsToMinutesSeconds(currentSong.currentTime)}/${secondsToMinutesSeconds(currentSong.duration)}`;
        
        if (currentSong.duration) {
            document.querySelector(".circle").style.left = 
                (currentSong.currentTime / currentSong.duration) * 100 + "%";
        }
    });

    
    document.querySelector(".seekbar").addEventListener("click", e => {
        if (currentSong.duration) {
            let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
            document.querySelector(".circle").style.left = percent + "%";
            currentSong.currentTime = ((currentSong.duration) * percent) / 100;
        }
    });
    
    
    previous.addEventListener("click", () => {
        if (!songs || songs.length === 0) return;
        
        currentSong.pause();
        let prevIndex = currentSongIndex - 1;
        if (prevIndex < 0) prevIndex = songs.length - 1;
        
        playMusic(songs[prevIndex]);
    });

    
    next.addEventListener("click", () => {
        if (!songs || songs.length === 0) return;
        
        currentSong.pause();
        let nextIndex = currentSongIndex + 1;
        if (nextIndex >= songs.length) nextIndex = 0;
        
        playMusic(songs[nextIndex]);
    });

   
    document.querySelector(".range input").addEventListener("input", (e) => {
        currentSong.volume = parseInt(e.target.value) / 100;
        if (currentSong.volume > 0) {
            document.querySelector(".volume img").src = "volume.svg";
        }
    });
    
    
    document.querySelector(".volume img").addEventListener("click", e => {
        if (e.target.src.includes("volume.svg")) {
            e.target.src = "mute.svg";
            currentSong.volume = 0;
            document.querySelector(".range input").value = 0;
        } else {
            e.target.src = "volume.svg";
            currentSong.volume = 0.10;
            document.querySelector(".range input").value = 10;
        }
    });


    currentSong.addEventListener("ended", () => {
    console.log("Song ended, playing next automatically");
    
    if (!songs || songs.length === 0) return;
    
    let nextIndex = currentSongIndex + 1;
    if (nextIndex >= songs.length) nextIndex = 0;
    
    playMusic(songs[nextIndex]);
});



    
}


main();