var parts = {
    'days': document.getElementById('part_days'),
    'hours': document.getElementById('part_hours'),
    'mins': document.getElementById('part_mins'),
    'secs': document.getElementById('part_secs')
  },
  panel = document.getElementById('panel'),
  toggle = document.getElementById('panel__toggle'),
  src = document.getElementById('stream').src;

function onAir() {
  panel.classList.add('panel_on-air');
  toggle.textContent = 'вещаем!';
}

function offAir() {
  panel.classList.remove('panel_on-air');
  toggle.textContent = 'до эфира';
}

function setTime(type, value) {
  function getUnits(value, units) {
      return (/^[0,2-9]?[1]$/.test(value)) ? units[0] : ((/^[0,2-9]?[2-4]$/.test(value)) ? units[1] : units[2])
  }

  var el, suffixes;

  switch (type) {
    case 'days': suffixes = ['день', 'дня', 'дней'];
      break;
    case 'hours': suffixes = ['час', 'часа', 'часов'];
      break;
    case 'mins': suffixes = ['минута', 'минуты', 'минут'];
      break;
    case 'secs': suffixes = ['секунда', 'секунды', 'секунд'];
      break;
  }

  el = parts[type];

  var elNum = el.children[0],
    elSuf = el.children[1];

  el.style.display = '';
  elNum.textContent = value;
  elSuf.textContent = getUnits(value, suffixes);
}

function setShowTimer() {
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

  if (days > 0) {
    setTime('days', days);
    setTime('hours', hours);
    setTime('mins', minutes);
    setTime('secs', seconds);
  } else {
    parts['days'].style.display = 'none';

    if (hours > 0) {
      setTime('hours', hours);
      setTime('mins', minutes);
      setTime('secs', seconds);
    } else {
      parts['hours'].style.display = 'none';

      if (minutes > 0) {
        setTime('mins', minutes);
        setTime('secs', seconds);
      } else {
        parts['hours'].style.display = 'none';

        setTime('secs', seconds);
      }
    }
  }
}

setShowTimer();
window.setInterval(function() {
    setShowTimer();
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

document.getElementById('panel__toggle').addEventListener('click', function(e) {
  var content = document.getElementById('panel__content');

  if (content.style.display == 'none') {
    content.style.display = '';
  } else {
    content.style.display = 'none';
  }
});