var gaSlug = function () {
  var title = window.currentTrack[1];
  var artist = window.currentTrack[2];

  var slug = artist + ' - ' + title;

  return slug;
};

var linkMap = {
  'Criminal': {
    'iTunes': 'https://itunes.apple.com/us/podcast/criminal/id809264944?at=10l9zE',
    'www': 'http://thisiscriminal.com/',
  },
  'The Truth': {
    'iTunes': 'https://itunes.apple.com/us/podcast/the-truth/id502304410?at=10l9zE',
    'www': 'http://thetruthpodcast.com/',
  },
  'The Mortified Podcast': {
    'iTunes': 'https://itunes.apple.com/us/podcast/the-mortified-podcast/id964902342?at=10l9zE',
    'www': 'http://getmortified.com/',
  },
  'The Heart': {
    'iTunes': 'https://itunes.apple.com/us/podcast/audio-smut/id595892633?at=10l9zE',
    'www': 'http://theheartradio.org/',
  },
  'Fugitive Waves': {
    'iTunes': 'https://itunes.apple.com/us/podcast/fugitive-waves/id814067846?at=10l9zE',
    'www': 'http://www.kitchensisters.org/',
  },
  'Love + Radio': {
    'iTunes': 'https://itunes.apple.com/us/podcast/love-+-radio/id84389707?at=10l9zE',
    'www': 'http://loveandradio.org/',
  },
  '99% Invisible': {
    'iTunes': 'https://itunes.apple.com/us/podcast/99-invisible/id394775318?at=10l9zE',
    'www': 'http://99percentinvisible.org/',
  },
  'Strangers': {
    'iTunes': 'https://itunes.apple.com/us/podcast/strangers/id490297492?at=10l9zE',
    'www': 'http://storycentral.org/',
  },
  'Radio Diaries': {
    'iTunes': 'https://itunes.apple.com/us/podcast/npr-radio-diaries-podcast/id207505466?at=10l9zE',
    'www': 'http://www.radiodiaries.org/',
  },
  "Benjamen Walker's Theory of Everything": {
    'iTunes': 'https://itunes.apple.com/us/podcast/benjamen-walkers-theory-everything/id646537599?at=10l9zE',
    'www': 'http://toe.prx.org/',
  },
  'The Allusionist': {
    'iTunes': 'https://itunes.apple.com/us/podcast/the-allusionist/id957430475?at=10l9zE',
    'www': 'http://www.theallusionist.org/',
  },
};

$(function () {
  $.get('https://pacific-forest-5405.herokuapp.com/enclosures/list', function(data) {

    $('body').removeClass('loading');

    var allTracks = data;
    console.log('Total tracks: ' + allTracks.length);

    var dup = allTracks.slice(0);
    var allTrackURLs = $.map(dup, function (track, i) { return track[0] });

    if (!localStorage.playedTrackURLs) {
      localStorage.playedTrackURLs = JSON.stringify([]);
    }

    var playedTrackURLs = JSON.parse(localStorage.playedTrackURLs);

    console.log('[GA][app][load] Played tracks: ' + playedTrackURLs.length);
    ga('send', 'event', 'app', 'load', 'played tracks', playedTrackURLs.length);

    var remainingTrackURLs = $.grep(allTrackURLs, function (trackURL, i){
      return $.inArray(trackURL, playedTrackURLs) == -1;
    });
    console.log('Remaining tracks: ' + remainingTrackURLs.length);

    var loadTrack = function () {
      if (window.currentTrackURL) {
        playedTrackURLs.push(window.currentTrackURL);
        localStorage.playedTrackURLs = JSON.stringify(playedTrackURLs);
      }

      if (remainingTrackURLs.length == 0) {
        localStorage.playedTrackURLs = JSON.stringify([]);
        remainingTrackURLs = allTrackURLs;
      }

      var rnd = Math.floor(Math.random() * remainingTrackURLs.length);
      var randomTrackURL = remainingTrackURLs[rnd];
      window.currentTrackURL = randomTrackURL;

      // Find the track from its URL
      var randomTrack = $.grep(allTracks, function (track, i) {
        return track[0] == randomTrackURL;
      })[0];

      window.currentTrack = randomTrack;

      $('#audio').attr('src', randomTrack[0]);
      $('#audio')[0].play();
      $('h3').text(randomTrack[1]);
      $('h4').text(randomTrack[2]);

      console.log('[GA][player][play](NI): ' + gaSlug());
      ga('send', 'event', 'player', 'play', gaSlug(), { 'nonInteraction': 1 });
    }

    $('#speed').bind('click', function () {
      var a = $('#audio')[0];

      if (a.playbackRate == 1.0) {
        a.playbackRate = 2.0;
        $('#speed').text('1x');
        console.log('[GA][player][speed]: 2x');
        ga('send', 'event', 'player', 'speed', '2x');
      } else {
        a.playbackRate = 1.0;
        $('#speed').text('2x');
        console.log('[GA][player][speed]: 1x');
        ga('send', 'event', 'player', 'speed', '1x');
      }
    });

    $('#audio').bind('ended', function () { loadTrack(); });
    $('#audio').bind('error', function () { loadTrack(); });
    $('#audio').bind('pause play', function () {
      $('#playpause').removeClass();
      $('#playpause').addClass('fa');

      var a = $('#audio')[0];
      if (a.paused) {
        $('#playpause').addClass('fa-play');
      } else {
        $('#playpause').addClass('fa-pause');
      }
    });

    $('#skip').bind('click', function () { loadTrack(); });

    $('#playpause').bind('click', function () {
      var a = $('#audio')[0]

      if (a.paused) {
        a.play();
        console.log('[GA][player][play]: ' + gaSlug())
        ga('send', 'event', 'player', 'play', gaSlug());
      } else {
        a.pause();
        console.log('[GA][player][pause]: ' + gaSlug())
        ga('send', 'event', 'player', 'pause', gaSlug());
      }
    });

    loadTrack();
  });

  $('#wordmark').bind('click', function () {
    console.log('[GA][outbound][radiotopia.fm]');
    ga('send', 'event', 'outbound', 'radiotopia.fm', 'WWW');
    window.open("http://radiotopia.fm/?utm_source=radio&utm_medium=logo&utm_campaign=radio");
  });

  $('#skip').bind('click', function () {
    console.log('[GA][player][skip]: ' + gaSlug());
    ga('send', 'event', 'player', 'skip', gaSlug());
  });

  $('#outbound-itunes').bind('click', function (e) {
    e.preventDefault();

    var artist = window.currentTrack[2];
    var itunes = linkMap[artist]['iTunes'];

    if (itunes) {
      console.log('[GA][outbound][' + artist + ']: iTunes');
      ga('send', 'event', 'outbound', artist, 'iTunes');

      window.open(itunes);
    }
  });

  $('#outbound-www').bind('click', function (e) {
    e.preventDefault();

    var artist = window.currentTrack[2];
    var www = linkMap[artist]['www'];
    if (www) {
      console.log('[GA][outbound][' + artist + ']: WWW');
      ga('send', 'event', 'outbound', artist, 'WWW');

      window.open(www);
    }
  });
});
