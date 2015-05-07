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
  "Theory of Everything": {
    'iTunes': 'https://itunes.apple.com/us/podcast/benjamen-walkers-theory-everything/id646537599?at=10l9zE',
    'www': 'http://toe.prx.org/',
  },
  'The Allusionist': {
    'iTunes': 'https://itunes.apple.com/us/podcast/the-allusionist/id957430475?at=10l9zE',
    'www': 'http://www.theallusionist.org/',
  },
};

$(function () {
  $.get('http://tower.radiotopia.fm/enclosures/list', function(data) {

    //
    //
    // Build playlist
    //
    //

    var allTracks = data;

    var dup = allTracks.slice(0);
    var allTrackURLs = $.map(dup, function (track, i) { return track[0] });

    if (!localStorage.playedTrackURLs) {
      localStorage.playedTrackURLs = JSON.stringify([]);
    }

    // Get the list of already played tracks from local stoage
    var playedTrackURLs = JSON.parse(localStorage.playedTrackURLs);
    window.playedTrackCount = playedTrackURLs.length;

    // Get any tracks from the last couple of days
    var now = Date.now();
    var yesterday = now - (2 * 24 * 60 * 60 * 1000);

    // Make a separate list of unheard tracks from the last two days
    var newTracks = $.grep(allTracks, function (track, i) {
      var pubDate = Date.parse(track[3]);
      return (pubDate > yesterday) && ($.inArray(track[0], playedTrackURLs) == -1);
    });

    var newTrackURLs = $.map(newTracks, function (track, i) { return track[0] });

    // Construct a list of unheard tracks
    var remainingTrackURLs = $.grep(allTrackURLs, function (trackURL, i) {
      return $.inArray(trackURL, playedTrackURLs) == -1;
    });

    ga('send', 'event', 'app', 'load', 'played tracks', playedTrackURLs.length);
    console.log('[Radio] Found ' + newTrackURLs.length + ' new tracks to be played first.')
    console.log('[Radio] Added ' + remainingTrackURLs.length + ' of ' + allTracks.length + ' tracks to playlist.');

    //
    //
    // Load a track, or skip the current track
    //
    //

    var loadTrack = function () {
      $('#progress').css('width', 0);

      if (window.currentTrackURL) {
        var a = $('#audio')[0];

        // Don't treat the outgoing track as heard if it just loaded
        if (a.currentTime > 1.3) {
          playedTrackURLs.push(window.currentTrackURL);
          localStorage.playedTrackURLs = JSON.stringify(playedTrackURLs);

          // Remove the played (or skipped) track from the lists
          var rIndex = remainingTrackURLs.indexOf(window.currentTrackURL);
          if (rIndex > -1) {
            console.log('[Radio] Removing track from playlist.')
            remainingTrackURLs.splice(rIndex, 1);
          }

          var nIndex = newTrackURLs.indexOf(window.currentTrackURL);
          if (nIndex > -1) {
            console.log('[Radio] Removing track from new tracks list.')
            newTrackURLs.splice(nIndex, 1);
          }

          console.log('[Radio] ' + remainingTrackURLs.length + ' tracks remaining in playlist.')
        }
      }

      // Reset the list if there's nothing else to play
      if (remainingTrackURLs.length == 0) {
        localStorage.playedTrackURLs = JSON.stringify([]);
        remainingTrackURLs = allTrackURLs;
      }

      // Pick a random track from those remaining
      var rnd = Math.floor(Math.random() * remainingTrackURLs.length);
      var randomTrackURL = remainingTrackURLs[rnd];

      // If there are any remaining new tracks, play those before a random track
      if (newTrackURLs.length > 0) {
        rnd = Math.floor(Math.random() * newTrackURLs.length);
        randomTrackURL = newTrackURLs[rnd];
      }

      // If it got the same track try to find another one
      if (window.currentTrackURL == randomTrackURL) {
        rnd = Math.floor(Math.random() * remainingTrackURLs.length);
        randomTrackURL = remainingTrackURLs[rnd];
      }

      window.currentTrackURL = randomTrackURL;

      // Find the track from its URL
      var randomTrack = $.grep(allTracks, function (track, i) {
        return track[0] == randomTrackURL;
      })[0];

      window.currentTrack = randomTrack;

      window.playedTrackCount = playedTrackURLs.length;

      $('#audio').attr('src', randomTrack[0]);
      $('#audio')[0].play();
      $('h3').text(randomTrack[1]);
      $('h4').text(randomTrack[2]);

      ga('send', 'event', 'player', 'play', gaSlug(), { 'nonInteraction': 1 });
    }

    //
    //
    // Interaction bindings
    //
    //

    $('h1').bind('click', function () {
      ga('send', 'event', 'outbound', 'radiotopia.fm', 'WWW');
      window.open("http://radiotopia.fm/?utm_source=radio.radiotopia.fm&utm_medium=Logo&utm_campaign=passive");
    });

    $('#outbound-itunes').bind('click', function (e) {
      e.preventDefault();

      var artist = window.currentTrack[2];

      if (artist.indexOf('Theory of Everything') != -1) {
        artist = 'Theory of Everything';
      }

      var itunes = linkMap[artist]['iTunes'];

      if (itunes) {
        ga('send', 'event', 'outbound', artist, 'iTunes');

        window.open(itunes);
      }
    });

    $('#outbound-www').bind('click', function (e) {
      e.preventDefault();

      var artist = window.currentTrack[2];

      if (artist.indexOf('Theory of Everything') != -1) {
        artist = 'Theory of Everything';
      }

      var www = linkMap[artist]['www'];

      if (www) {
        ga('send', 'event', 'outbound', artist, 'WWW');

        window.open(www + '?utm_source=radio.radiotopia.fm&utm_medium=logo&utm_campaign=radio');
      }
    });

    $('#speed').bind('click', function () {
      var a = $('#audio')[0];

      if (a.playbackRate == 1.0) {
        a.playbackRate = 2.0;
        $('#speed').text('1x');

        ga('send', 'event', 'player', 'speed', '2x');
      } else {
        a.playbackRate = 1.0;
        $('#speed').text('2x');

        ga('send', 'event', 'player', 'speed', '1x');
      }
    });

    $('#playpause').bind('click', function () {
      var a = $('#audio')[0]

      if (a.paused) {
        ga('send', 'event', 'player', 'play', gaSlug());
        a.play();
      } else {
        ga('send', 'event', 'player', 'pause', gaSlug());
        a.pause();
      }
    });

    $('#skip').bind('click', function () {
      ga('send', 'event', 'player', 'skip', gaSlug());

      loadTrack();
    });

    $(document).bind('keydown', 'right', function () {
      ga('send', 'event', 'player', 'skip', gaSlug());

      loadTrack();
    });

    $(document).bind('keydown', 'space', function () {
      var a = $('#audio')[0]

      if (a.paused) {
        ga('send', 'event', 'player', 'play', gaSlug());
        a.play();
      } else {
        ga('send', 'event', 'player', 'pause', gaSlug());
        a.pause();
      }
    });

    //
    //
    // Media event bindings
    //
    //

    $('#audio').bind('ended', function () {
      var count = window.playedTrackCount;
      ga('send', 'event', 'player', 'ended', gaSlug(), count);
      loadTrack();
    });

    $('#audio').bind('timeupdate', function () {
      var a = $('#audio')[0];
      var progress = (a.currentTime / a.duration);

      $('#progress').css('width', progress * 100 + '%');
    });

    $('#audio').bind('error', function () {
      ga('send', 'event', 'player', 'error', gaSlug());
      loadTrack();
    });

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

    //
    //
    // Start the radio
    //
    //

    $('body').removeClass('isLoading');
    loadTrack();
  });
});
