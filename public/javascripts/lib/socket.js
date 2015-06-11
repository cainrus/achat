define(['socket'], function(io) {

  // var socket = new io.connect(location.href);
  var socket = io();

  socket.on('connect', function() {
    console.log("Connected");
  });

  socket.on('disconnect', function() {
    console.log('disconnected');
  });


  return socket;
});
