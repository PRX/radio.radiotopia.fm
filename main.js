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

    var playedTrackURLs = JSON.parse(localStorage.playedTrackURLs);

    var remainingTrackURLs = $.grep(allTrackURLs, function (trackURL, i){
      return $.inArray(trackURL, playedTrackURLs) == -1;
    });

    ga('send', 'event', 'app', 'load', 'played tracks', playedTrackURLs.length);
    console.log('[Radio] Added ' + remainingTrackURLs.length + ' of ' + allTracks.length + ' tracks to playlist.');

    //
    //
    // Load a track, or skip the current track
    //
    //

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

      ga('send', 'event', 'player', 'play', gaSlug(), { 'nonInteraction': 1 });
    }

    //
    //
    // Interaction bindings
    //
    //

    $('h1').bind('click', function () {
      ga('send', 'event', 'outbound', 'radiotopia.fm', 'WWW');
      window.open("http://radiotopia.fm/?utm_source=radio&utm_medium=logo&utm_campaign=radio");
    });

    $('#outbound-itunes').bind('click', function (e) {
      e.preventDefault();

      var artist = window.currentTrack[2];
      var itunes = linkMap[artist]['iTunes'];

      if (itunes) {
        ga('send', 'event', 'outbound', artist, 'iTunes');

        window.open(itunes);
      }
    });

    $('#outbound-www').bind('click', function (e) {
      e.preventDefault();

      var artist = window.currentTrack[2];
      var www = linkMap[artist]['www'];

      if (www) {
        ga('send', 'event', 'outbound', artist, 'WWW');

        window.open(www);
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
      ga('send', 'event', 'player', 'ended', gaSlug());
      loadTrack();
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
