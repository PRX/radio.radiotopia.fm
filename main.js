var gaSlug = function () {
  var title = window.currentTrack[1];
  var artist = window.currentTrack[2];

  var slug = artist + ' - ' + title;

  return slug;
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
        ga('send', 'event', 'player', 'seed', '2x');
      } else {
        a.playbackRate = 1.0;
        $('#speed').text('2x');
        console.log('[GA][player][speed]: 1x');
        ga('send', 'event', 'player', 'seed', '1x');
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

  $('#skip').bind('click', function () {
    console.log('[GA][player][skip]: ' + gaSlug());
    ga('send', 'event', 'player', 'skip', gaSlug());
  });
});
