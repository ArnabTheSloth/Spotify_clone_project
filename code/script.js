// function showLeftPanel() {
//     document.querySelector('div.left').style.left = '0';
// }
// let mediaQuery;

// function checkMediaQuery() {
//     mediaQuery = window.matchMedia("(max-width: 1020px)");
//     const cards = document.querySelectorAll('div.card');

//     if (mediaQuery.matches) {  // If media query matches (screen width <= 1020px)
//         cards.forEach((elem) => {
//             elem.addEventListener('click', showLeftPanel.bind(this));
//         });

//     } else {  // If media query does not match
//         console.log("Media query does not match!");
//         cards.forEach((elem) => {
//             console.log("Removing event listener from card");
//             elem.removeEventListener('click', showLeftPanel.bind(this));
//         });
//     }
// }

// // Run the media query check on load
// document.addEventListener("DOMContentLoaded", () => {
//     checkMediaQuery();
//     window.addEventListener("resize", checkMediaQuery);
// });


//I don't have a single clue why this piece of code does not work


//volume
function updateSliderValue(slider) {
    const value = (slider.value - slider.min) / (slider.max - slider.min) * 100; // Calculate percentage
    slider.style.background = `linear-gradient(to right, #4CAF50 ${value}%, #b3b3b3 ${value}%)`
}


//Hamburger
document.querySelector('div.button img').addEventListener('click', (e) => {
    e.stopPropagation()
    document.querySelector('div.left').style.left = '0'
})
document.querySelector('div.right').addEventListener('click', () => { document.querySelector('div.left').style.left = '-100%' })
document.querySelector('#close').addEventListener('click', () => { document.querySelector('div.left').style.left = '-100%' })

const play = document.getElementById('play');

//Js for playing music
async function fetchsong(index) {
    let alpha = await fetch('http://127.0.0.1:5500/songs/')
    let response = await alpha.text()
    let div = document.createElement('div')
    div.innerHTML = response
    let directories = Array.from(div.querySelectorAll('li a'))
    directories.shift()
    let directurl = `${directories[index].href}`
    let alpha2 = await fetch(directurl)
    let response2 = await alpha2.text()
    let div2 = document.createElement('div')
    div2.innerHTML = response2
    let as = div2.getElementsByTagName('a')
    let songs = []
    let songsurl = []

    for (let index = 0; index < as.length; index++) {
        const element = as[index];
        if (element.href.endsWith('.mp3')) {
            songsurl.push(element.href)
            songs.push(decodeURI(element.href.split('/').pop().replace('.mp3', '')));
        }
    }


    return [songs, songsurl]

}

function convertToMinutesAndSeconds(secondsMillis) {
    // Convert the input to total seconds
    let totalSeconds = Math.floor(secondsMillis);  // Remove milliseconds

    // Calculate minutes and remaining seconds
    let minutes = Math.floor(totalSeconds / 60);
    let seconds = totalSeconds % 60;

    // Ensure both minutes and seconds are two digits (pad with zeroes if needed)
    let formattedMinutes = String(minutes).padStart(2, '0');
    let formattedSeconds = String(seconds).padStart(2, '0');

    // Return the result in the format MM:SS
    return `${formattedMinutes}:${formattedSeconds}`;
}

let currentAudio = null

const timeupdatefunc = () => {
    // Check if `currentAudio` is defined and has a duration
    if (!currentAudio || isNaN(currentAudio.duration)) {
        document.querySelector('div.duration').innerHTML = '00:00/00:00';
        document.querySelector('div.circle').style.left = '0%';
        return; // Exit the function early if there's an issue
    }

    // Check if the audio has ended
    if (currentAudio.ended) {
        console.log("Audio has ended.");
        document.querySelector('div.duration').innerHTML = '00:00/00:00';
        document.querySelector('div.circle').style.left = '0%';

        // Check if `play` is defined and valid
        if (play) {
            play.src = '/assets/play copy.svg';
        } else {
            console.error("The `play` element is not defined.");
        }
    } else {
        // Update duration and circle position
        const currentTimeFormatted = convertToMinutesAndSeconds(currentAudio.currentTime);
        const durationFormatted = convertToMinutesAndSeconds(currentAudio.duration);

        document.querySelector('div.duration').innerHTML = `${currentTimeFormatted}/${durationFormatted}`;
        document.querySelector('div.circle').style.left = `${(currentAudio.currentTime / currentAudio.duration) * 100}%`;
    }
}

//Main function for playing music

async function songdir(indices) {
    let songs = await fetchsong(indices)
    let songlist = songs[0]
    let songsurl = songs[1]
    let div = document.querySelector('.songlist ul')
    for (let i = 0; i < songlist.length; i++) {
        div.innerHTML = div.innerHTML + `<li>
                            <img src="/assets/music.svg" alt="">
                            <div>${songlist[i]}</div>
                            <div class="overlay"><img src="/assets/play.svg" alt=""></div>
                        </li>`
    }

    let listItems = document.querySelectorAll('.songlist ul li');
    currentAudio = new Audio(songsurl[0])
    currentAudio.play()
    play.src = '/assets/pause.svg'
    currentAudio.addEventListener('timeupdate', timeupdatefunc)
    document.querySelector('div.title').innerHTML = decodeURI(songsurl[0].split('/').pop().replace('.mp3', ''))
    document.querySelector('div.duration').innerHTML = '00:00/00:00'
    document.querySelector('div.circle').style.left = '0%';


    listItems.forEach((li, index) => {
        li.addEventListener('click', () => {
            // If there's an audio playing, pause it
            if (currentAudio) {
                currentAudio.pause();
            }

            // Play the new song
            currentAudio = new Audio(songsurl[index]);
            currentAudio.play();
            play.src = '/assets/pause.svg'
            document.querySelector('div.title').innerHTML = decodeURI(currentAudio.src.split('/').pop().replace('.mp3', ''))
            document.querySelector('div.duration').innerHTML = '00:00/00:00'

            currentAudio.addEventListener('timeupdate', timeupdatefunc)


        });
    });


    document.querySelector('div.seekbar').addEventListener('click', (e) => {
        let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100
        document.querySelector('div.circle').style.left = percent + '%'
        currentAudio.currentTime = (currentAudio.duration * percent) / 100
    })

    let value;

    document.querySelector('input').addEventListener('input', (e) => {
        value = e.target.value
        if (value <= 50 && value > 0) {
            document.querySelector('img.volume').src = '/assets/lessvolume.svg'
        }

        else if (Number.parseInt(value) === 0) {
            document.querySelector('img.volume').src = '/assets/mute.svg'
        }

        else {
            document.querySelector('img.volume').src = '/assets/volume.svg'
        }

        if (currentAudio) {
            currentAudio.volume = e.target.value / 100
        }
    })

    let index;

    document.getElementsByClassName('playbar1')[0].addEventListener('click', () => {
        index = songsurl.indexOf(currentAudio.src)
        if (index > 0) {
            currentAudio.pause()
            currentAudio = new Audio(songsurl[index - 1])
            document.querySelector('div.title').innerHTML = decodeURI(songsurl[index - 1].split('/').pop().replace('.mp3', ''))
            document.querySelector('div.duration').innerHTML = '00:00/00:00'
            currentAudio.addEventListener('timeupdate', timeupdatefunc)
            currentAudio.addEventListener('loadeddata', () => {
                currentAudio.play()
            })
            play.src = '/assets/pause.svg'
        }

    })

    document.getElementsByClassName('playbar1')[1].addEventListener('click', (e) => {
        index = songsurl.indexOf(currentAudio.src)
        console.log(songsurl)
        if (index >= 0 && index < songsurl.length - 1) {
            currentAudio.pause()
            currentAudio = new Audio(songsurl[index + 1])
            document.querySelector('div.title').innerHTML = decodeURI(songsurl[index + 1].split('/').pop().replace('.mp3', ''))
            document.querySelector('div.duration').innerHTML = '00:00/00:00'
            currentAudio.addEventListener('timeupdate', timeupdatefunc)
            currentAudio.addEventListener('loadeddata', () => {
                currentAudio.play()
            })
            play.src = '/assets/pause.svg'
        }

    })



}

Array.from(document.querySelectorAll('div.card')).forEach((elem, index) => {
    elem.addEventListener('click', () => {
        document.querySelector('.songlist div').style.display = 'none'
        let div = document.querySelector('.songlist ul')
        div.innerHTML = ''
        div.style.display = 'block'
        if (currentAudio) {
            currentAudio.pause()
        }
        songdir(index)
    })
})

play.addEventListener('click', (e) => {
    if (currentAudio === null) {
        return;
    }

    else if (currentAudio.paused) {
        currentAudio.play()
        currentAudio.addEventListener('timeupdate', timeupdatefunc)
        play.src = '/assets/pause.svg'
    }
    else {
        currentAudio.pause()
        play.src = '/assets/play copy.svg'
    }

})


let slider = document.querySelector('input.slider');
let volumeicon = document.querySelector('div.volume img');

volumeicon.addEventListener('click', (e) => {
    if (slider.value !== '0') {
        slider.value = '0'
        updateSliderValue(slider)
        e.target.src = '/assets/mute.svg'
        currentAudio.volume = 0
    }
    else if (slider.value === '0') {
        slider.value = '100'
        updateSliderValue(slider)
        e.target.src = '/assets/volume.svg'
        currentAudio.volume = 1
    }
    else {
        return;
    }
})