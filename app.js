var  panel = document.getElementById('panel'),
  prefix = document.getElementById('timer__prefix'),
  src = document.getElementById('stream').src;

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

var t = document.getElementById('timer__time');

setShowTimer(t);
window.setInterval(function() {
    setShowTimer(t);
}, 999);

document.getElementById('play-stream').addEventListener('click', function(e) {
  var target = e.target;
  var audio = document.getElementById('stream');

  audio.addEventListener('error', function() {
      target.classList.add('disabled');
      
      if (panel.classList.contains('panel_on-air')) {
        setTimeout(function() {
          audio.src = null;
          audio.src = src;
          audio.play();

          target.classList.remove('disabled');
        }, 5000);
      }
  });

  if (audio.paused) {
    audio.src = src;
    audio.play();
    target.classList.remove('disabled');
  } else {
    audio.src = null;  
    audio.pause();
    target.classList.add('disabled');
  }
});