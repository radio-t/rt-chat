function getRelativeCoordinates (e, elem) {
  var pos = {}, 
    offset = {}, 
    ref;

  ref = elem.offsetParent;

  pos.x = !! e.touches ? e.touches[0].pageX : e.pageX;
  pos.y = !! e.touches ? e.touches[0].pageY : e.pageY;

  offset.left = elem.offsetLeft;
  offset.top = elem.offsetTop;

  while (ref) {
      offset.left += ref.offsetLeft;
      offset.top += ref.offsetTop;

      ref = ref.offsetParent;
  }

  return { 
    x : pos.x - offset.left,
    y : pos.y - offset.top,
  }; 
}

function onAir() {
  panel.classList.add('panel_on-air');
  prefix.textContent = 'Вещаем!';
}

function offAir() {
  panel.classList.remove('panel_on-air');
  prefix.textContent = 'До эфира';
}

function setShowTimer(el) {
  var timeInMoscow = new Date();
  timeInMoscow.setMinutes(timeInMoscow.getMinutes() + timeInMoscow.getTimezoneOffset() + 3 * 60);

  var nextShow = new Date(timeInMoscow);
  nextShow.setDate(nextShow.getDate() + 6 - nextShow.getDay());
  nextShow.setHours(23, 0, 0, 0);

  var totalSeconds = Math.floor((nextShow - timeInMoscow) / 1000);
  var passFromStart = (7 * 24 * 60 * 60) - totalSeconds;

  if (totalSeconds < 0 || passFromStart < 3 * 60 * 60 && passFromStart >= 0) {
    onAir();
    return;
  } else {
    offAir();  
  }

  var seconds = ('0' + totalSeconds % 60).slice(-2);
    minutes = ('0' + Math.round((totalSeconds - seconds) / 60) % 60).slice(-2),
    hours = Math.round((totalSeconds - seconds - minutes * 60) / 3600),
    days = (hours - hours % 24) / 24;

  hours = ('0' + hours % 24).slice(-2);

  var res = [];

  if (days > 0) {
    res.push(days);
    res.push(hours);
    res.push(minutes);
    res.push(seconds);
  } else {
    if (hours > 0) {
      res.push(hours);
      res.push(minutes);
      res.push(seconds);
    } else {
      if (minutes > 0) {
        res.push(minutes);
        res.push(seconds);
      } else {
        res.push(seconds);
      }
    }
  }

  el.textContent = res.join(':');
}

var panel = document.getElementById('panel'),
  prefix = document.getElementById('timer__prefix'),
  audio = document.getElementById('stream'),
  src = null;

if (audio) {
  src = audio.src;
}

var t = document.getElementById('timer__time');

setShowTimer(t);
window.setInterval(function() {
    setShowTimer(t);
}, 999);

var playButton = document.getElementById('play-stream'),
  volume = document.getElementById('volume'),
  maxVolumeWidth = volume.offsetWidth,
  volumePosition = document.getElementById('volume__inner'),
  currentVolume = 1;

if (playButton) {
  var errorHandler = function() {
    playButton.classList.add('play-stream_disabled');
    
    if (panel.classList.contains('panel_on-air')) {
      setTimeout(function() {
        audio.pause();
        audio.src = null;
        audio.src = src;
        audio.play();

        playButton.classList.remove('play-stream_disabled');
      }, 5000);
    }
  };

  function updateVolume() {
    volumePosition.style.width = currentVolume * 100 + '%';
    audio.volume = currentVolume;
  }

  updateVolume();

  playButton.addEventListener('click', function(e) {
    var target = e.target;
      
    if (audio.paused) {
      audio.src = src;
      audio.play();
      target.classList.remove('play-stream_disabled');

      audio.addEventListener('error', errorHandler);
    } else {
      audio.removeEventListener('error', errorHandler);

      audio.pause();
      audio.src = null;  
      target.classList.add('play-stream_disabled');
    }
  });

  panel.addEventListener('wheel', function (event) {
    if (event.deltaY < 0 || event.deltaX > 0) {
      currentVolume += .05;

      if (currentVolume > 1) {
        currentVolume = 1;
      }
    }

    if (event.deltaY > 0 || event.deltaX < 0) {
      currentVolume -= .05;

      if (currentVolume < 0) {
        currentVolume = 0;
      }
    }

    updateVolume();
  });

  volume.addEventListener('click', function (event) {
    var target = event.target;

    currentVolume = getRelativeCoordinates(event, target).x / maxVolumeWidth;

    updateVolume();
  });
}
