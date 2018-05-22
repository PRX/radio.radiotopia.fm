var NEW_PERIOD = 7;

var gaSlug = function () {
  var title = window.currentTrack.title;
  var artist = window.currentTrack.show;

  var slug = artist + ' - ' + title;

  return slug;
};

var gaTitle = function () {
  return window.currentTrack.title;
};

var gaArtist = function () {
  return window.currentTrack.show;
};

// // noop until the chat has started
// var addZopimNowListeningNote = function () {};
//
// $zopim(function () {
//   // When the chat starts, reset the callback to add now playing to notes
//   $zopim.livechat.setOnChatStart(function () {
//     addZopimNowListeningNote = function () {
//       console.log("Setting Zopim Notes");
//       $zopim.livechat.appendNotes("[NowPlaying] " + gaSlug() + "\n");
//     };
//
//     // add immediately.
//     addZopimNowListeningNote();
//   });
// });

var padz = function (n, width, z) {
  z = z || '0';
  n = n + '';
  return n.length >= width ? n : new Array(width - n.length + 1).join(z) + n;
}

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
  'Song Exploder': {
    'iTunes': 'https://itunes.apple.com/us/podcast/song-exploder/id788236947?at=10l9zE',
    'www': 'http://songexploder.net/',
  },
  'the memory palace': {
    'iTunes': 'http://itunes.apple.com/podcast/the-memory-palace/id299436963?at=10l9zE',
    'www': 'http://thememorypalace.us/',
  },
  'Millennial': {
    'iTunes': 'https://itunes.apple.com/us/podcast/millennial/id961509999?at=10l9zE',
    'www': 'http://www.millennialpodcast.org/',
  },
  'The West Wing Weekly': {
    'iTunes': 'https://itunes.apple.com/us/podcast/the-west-wing-weekly/id1093364587?at=10l9zE',
    'www': 'http://thewestwingweekly.com/',
  },
  'The Bugle': {
    'iTunes': 'https://itunes.apple.com/us/podcast/the-bugle/id265799883?at=10l9zE',
    'www': 'http://thebuglepodcast.com/',
  },
};

$(function () {
  var url = $('body').data('tower-url');
  $.get(url, function(data) {

    //
    //
    // Setup
    //
    //

    var lastBoundary;
    var lastPercentage;

    if (!sessionStorage.playCount) { sessionStorage.playCount = 0; }
    if (!sessionStorage.skipCount) { sessionStorage.skipCount = 0; }
    if (!sessionStorage.finishCount) { sessionStorage.finishCount = 0; }
    if (!sessionStorage.hookCount) { sessionStorage.hookCount = 0; }
    if (!sessionStorage.listeningTime) { sessionStorage.listeningTime = 0; }

    if (!localStorage.playCount) { localStorage.playCount = 0; }
    if (!localStorage.skipCount) { localStorage.skipCount = 0; }
    if (!localStorage.finishCount) { localStorage.finishCount = 0; }
    if (!localStorage.hookCount) { localStorage.hookCount = 0; }
    if (!localStorage.listeningTime) { localStorage.listeningTime = 0; }

    // Session Skips
    ga('set', 'dimension6', padz(sessionStorage.skipCount, 5));

    // Session Plays/User Plays
    ga('set', 'dimension7', padz(sessionStorage.playCount, 5));
    ga('set', 'dimension10', padz(localStorage.playCount, 5));

    // Session Completions/User Completions
    ga('set', 'dimension8', padz(sessionStorage.finishCount, 5));
    ga('set', 'dimension9', padz(localStorage.finishCount, 5));

    //
    //
    // Build playlist
    //
    //

    var allTracks = data;

    var dup = allTracks.slice(0);
    var allTrackURLs = $.map(dup, function (track, i) { return track.audioURL });

    if (!localStorage.playedTrackURLs) {
      localStorage.playedTrackURLs = JSON.stringify([]);
    }

    // Get the list of already played tracks from local stoage
    var playedTrackURLs = JSON.parse(localStorage.playedTrackURLs);
    window.playedTrackCount = playedTrackURLs.length;

    // Get any tracks from the last couple of days
    var now = Date.now();
    var yesterday = now - (NEW_PERIOD * 24 * 60 * 60 * 1000);

    // Make a separate list of unheard tracks from the last two days
    var newTracks = $.grep(allTracks, function (track, i) {
      var pubDate = Date.parse(track.date.replace(' UTC', '').replace(' ', 'T'));
      return (pubDate > yesterday) && ($.inArray(track.audioURL, playedTrackURLs) == -1);
    });

    // Track if session loaded 'new' episodes
    ga('set', 'dimension14', ((newTracks.length > 0) ? 'Premiere' : 'Archive'));

    var newTrackURLs = $.map(newTracks, function (track, i) { return track.audioURL });

    // Construct a list of unheard tracks
    var remainingTrackURLs = $.grep(allTrackURLs, function (trackURL, i) {
      return $.inArray(trackURL, playedTrackURLs) == -1;
    });

    ga('send', 'event', 'App', 'Load');
    // Session Pre-Plays
    ga('set', 'dimension5', padz(playedTrackURLs.length, 5));
    console.log('[Radio] Found ' + newTrackURLs.length + ' new tracks to be played first.')
    console.log('[Radio] Added ' + remainingTrackURLs.length + ' of ' + allTracks.length + ' tracks to playlist.');

    //
    //
    // Load a track, or skip the current track
    //
    //

    var loadTrack = function () {
      $('#progress').css('width', 0);
      lastBoundary = undefined;
      lastPercentage = undefined;

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
        return track.audioURL == randomTrackURL;
      })[0];

      window.currentTrack = randomTrack;

      window.playedTrackCount = playedTrackURLs.length;

      var titleText = randomTrack.title;

      if (Date.parse(randomTrack.date.replace(' UTC', '').replace(' ', 'T')) > yesterday) {
        titleText = "<span>New!</span>" + titleText;
      }

      $('#audio').attr('src', randomTrack.audioURL);
      $('#audio')[0].play();
      $('h3').html(titleText);
      $('h4').text(randomTrack.show);

      if (parseInt(sessionStorage.playCount) == 0) {
        // Entry show name
        ga('set', 'dimension11', gaArtist());
      }

      // Exit show name
      ga('set', 'dimension13', gaArtist());

      // Zopim information
      // addZopimNowListeningNote();

      sessionStorage.playCount = (parseInt(sessionStorage.playCount) + 1);
      localStorage.playCount = (parseInt(localStorage.playCount) + 1);

      // Re-set play counts after a track loads
      ga('set', 'dimension7', padz(sessionStorage.playCount, 5));
      ga('set', 'dimension10', padz(localStorage.playCount, 5));

      ga('send', 'event', 'Player', 'Load', { 'dimension1': gaArtist(), 'dimension2': gaTitle() });
      ga('send', 'event', 'Player', 'Play', { 'dimension1': gaArtist(), 'dimension2': gaTitle() });
    }

    //
    //
    // Interaction bindings
    //
    //

    $('h1').bind('click', function () {
      ga('send', 'event', 'Outbound Link', 'radiotopia.fm', 'WWW');
      window.open("https://www.radiotopia.fm/?utm_source=radio.radiotopia.fm&utm_medium=Logo&utm_campaign=passive");
    });

    $('#outbound-itunes').bind('click', function (e) {
      e.preventDefault();

      var artist = window.currentTrack.show;

      if (artist.indexOf('Theory of Everything') != -1) {
        artist = 'Theory of Everything';
      }

      var itunes = linkMap[artist]['iTunes'];

      if (itunes) {
        ga('send', 'event', 'Outbound Link', 'iTunes', { 'dimension1': gaArtist() });

        window.open(itunes);
      }
    });

    $('#outbound-www').bind('click', function (e) {
      e.preventDefault();

      var artist = window.currentTrack.show;

      if (artist.indexOf('Theory of Everything') != -1) {
        artist = 'Theory of Everything';
      }

      var www = linkMap[artist]['www'];

      if (www) {
        ga('send', 'event', 'Outbound Link', 'WWW', { 'dimension1': gaArtist() });

        window.open(www + '?utm_source=radio.radiotopia.fm&utm_medium=logo&utm_campaign=radio');
      }
    });

    //
    // Playback speed ==========================================================
    //

    $('#speed').bind('click', function () {
      var a = $('#audio')[0];

      if (a.playbackRate == 1.0) {
        a.playbackRate = 2.0;
        $('#speed').text('1x');

        ga('send', 'event', 'Player', 'Speed', '2x');
      } else {
        a.playbackRate = 1.0;
        $('#speed').text('2x');

        ga('send', 'event', 'Player', 'Speed', '1x');
      }
    });

    //
    // Track Skipping ==========================================================
    //

    function doSkip() {
      sessionStorage.skipCount = (parseInt(sessionStorage.skipCount) + 1);
      localStorage.skipCount = (parseInt(localStorage.skipCount) + 1);

      // Session Skips
      ga('set', 'dimension6', padz(sessionStorage.skipCount, 5));
      ga('send', 'event', 'Player', 'Skip', { 'dimension1': gaArtist(), 'dimension2': gaTitle() });

      loadTrack();
    };

    $('#skip').bind('click', function () { doSkip(); });
    $(document).bind('keydown', 'right', function () { doSkip(); });

    //
    // Play/Pause ==============================================================
    //

    function doPlayPause() {
      var a = $('#audio')[0]

      if (a.paused) {
        ga('send', 'event', 'Player', 'Play', { 'dimension1': gaArtist(), 'dimension2': gaTitle() });
        a.play();
      } else {
        ga('send', 'event', 'Player', 'Pause', { 'dimension1': gaArtist(), 'dimension2': gaTitle() });
        a.pause();
      }
    }

    $('#playpause').bind('click', function () { doPlayPause(); });
    $(document).bind('keydown', 'space', function () { doPlayPause(); });
    $(document).bind('keydown', 'k', function () { doPlayPause(); });

    //
    //
    // Media event bindings
    //
    //

    $('#audio').bind('ended', function () {
      var count = window.playedTrackCount;

      sessionStorage.finishCount = (parseInt(sessionStorage.finishCount) + 1);
      localStorage.finishCount = (parseInt(localStorage.finishCount) + 1);

      // Session Completions/User Completions
      ga('set', 'dimension8', padz(sessionStorage.finishCount, 5));
      ga('set', 'dimension9', padz(localStorage.finishCount, 5));
      ga('send', 'event', 'Player', 'Ended', { 'eventValue': count, 'dimension1': gaArtist(), 'dimension2': gaTitle() });

      loadTrack();
    });

    // Updates the progress bar
    // Also handles playback tracking analytics. Sends a `Playback Progress`
    // heartbeat every 10 seconds, with a value of the 10 second block playback
    // is currently in (eg, "0000 seconds", "0010 seconds"..."0600 seconds").
    // The values are paddded to make GA sort them in a meaningful way. A
    // metric value of 10 is also sent with each heartbeat to roughly track
    // total playback time in GA. Additionally, the percentage of playback
    // progress is also tracked in 5% increments. 10 seconds represents > 4%
    // for tracks of 4 minutes or less, so many percentage values would be
    // missed if the percentage values weren't rounded to the nearest factor of
    // five. This `Playback Percentage` dimension is only sent when playback
    // crosses into a new 5% block.
    $('#audio').bind('timeupdate', function () {
      var a = $('#audio')[0];
      var progress = (a.currentTime / a.duration);
      var percentage = (progress * 100);

      // Update progress bar width
      $('#progress').css('width', percentage + '%');

      // Period between heartbeats
      var boundarySpacing = 10;

      var roundedCurrentTime = Math.round(a.currentTime);
      var isNearBoundary = ((roundedCurrentTime % boundarySpacing) == 0)

      if (isNearBoundary && lastBoundary != roundedCurrentTime) {
        lastBoundary = roundedCurrentTime;

        sessionStorage.listeningTime = (parseInt(sessionStorage.listeningTime) + boundarySpacing);
        localStorage.listeningTime = (parseInt(localStorage.listeningTime) + boundarySpacing);

        var obj = {
          'dimension1': gaArtist(),
          'dimension2': gaTitle(),
          'dimension3': padz(roundedCurrentTime, 5) + " seconds",
          'metric3': (roundedCurrentTime == 0 ? 0 : boundarySpacing)
        };

        var percentTick = padz((Math.round(percentage / 5) * 5), 3) + "%";

        if (lastPercentage != percentTick && percentage >= 0) {
          lastPercentage = percentTick;
          obj['dimension4'] = percentTick;
        }

        ga('send', 'event', 'Player', 'Progress', obj);

        if (roundedCurrentTime == 60) {
          sessionStorage.hookCount = (parseInt(sessionStorage.hookCount) + 1);
          localStorage.hookCount = (parseInt(localStorage.hookCount) + 1);

          //
          if (parseInt(sessionStorage.hookCount) == 1) {
            ga('set', 'dimension12', padz(sessionStorage.playCount, 5));
          }
        }
      }
    });

    $('#audio').bind('error', function () {
      ga('send', 'event', 'Player', 'Error', { 'dimension1': gaArtist(), 'dimension2': gaTitle() });
      loadTrack();
    });

    $('#audio').bind('pause play', function () {
      $('#playpause').removeClass();

      var a = $('#audio')[0];
      if (a.paused) {
        $('#playpause').addClass('play');
        $('#playpause').attr('aria-label', 'play');
      } else {
        $('#playpause').addClass('pause');
        $('#playpause').attr('aria-label', 'pause');
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
