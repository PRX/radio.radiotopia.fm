$(function () {
  $.get('https://pacific-forest-5405.herokuapp.com/enclosures/list', function(data) {

    var allTracks = data
    console.log('Total tracks: ' + allTracks.length)

    var dup = allTracks.slice(0);
    var allTrackURLs = $.map(dup, function (track, i) { return track[0] });

    if (!localStorage.playedTrackURLs) {
      localStorage.playedTrackURLs = JSON.stringify([]);
    }

    var playedTrackURLs = JSON.parse(localStorage.playedTrackURLs);
    console.log('Played tracks: ' + playedTrackURLs.length)

    var remainingTrackURLs = $.grep(allTrackURLs, function (trackURL, i){
      return $.inArray(trackURL, playedTrackURLs) == -1
    });
    console.log('Remaining tracks: ' + remainingTrackURLs.length)

    var loadTrack = function () {
      if (window.currentTrackURL) {
        playedTrackURLs.push(window.currentTrackURL);
        localStorage.playedTrackURLs = JSON.stringify(playedTrackURLs);
      }

      if (remainingTrackURLs.length == 0) {
        localStorage.playedTrackURLs = JSON.stringify([]);
        remainingTrackURLs = allTrackURLs
      }

      var rnd = Math.floor(Math.random() * remainingTrackURLs.length);
      var randomTrackURL = remainingTrackURLs[rnd];
      window.currentTrackURL = randomTrackURL;

      // Find the track from its URL
      var randomTrack = $.grep(allTracks, function (track, i) {
        return track[0] == randomTrackURL
      })[0];

      $('#audio').attr('src', randomTrack[0]);
      $('#audio')[0].play();
      $('h3').text(randomTrack[1]);
      $('h4').text(randomTrack[2]);
      console.log('Playing: "' + randomTrack[1] + '", ' + randomTrack[2])
    }

    $('#speed').bind('click', function () {
      var a = $('#audio')[0];

      if (a.playbackRate == 1.0) {
        a.playbackRate = 2.0;
      } else {
        a.playbackRate = 1.0;
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
      } else {
        a.pause();
      }
    });

    loadTrack();
  });
});
