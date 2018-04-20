'use strict';
const servers = {
  'iceServers': [
    {'urls': 'stun:stun.services.mozilla.com'},
    {'urls': 'stun:stun.l.google.com:19302'},
    {
      'urls': 'turn:numb.viagenie.ca',
      'credential': 'Z9HjeWB2xLFGbnW',
      'username': 'villehie@metropolia.fi',
    }],
};

const socket = io.connect('https://localhost:80');
const caller = new RTCPeerConnection();

const constraints = {audio: true, video: true};
navigator.mediaDevices.getUserMedia(constraints).then(mediaStream => {
  const video = document.querySelector('#localVideo');

  video.srcObject = mediaStream;
  caller.addStream(mediaStream);
}).catch(err => {
  console.log(err.name + ': ' + err.message);
});

caller.onaddstream = evt => {
  console.log('onaddstream called');
  document.querySelector('#remoteVideo').srcObject = evt.stream;
};

caller.onicecandidate = evt => {
  if (!evt.candidate) return;
  console.log('onicecandidate called');
  onIceCandidate(evt);
};
//Send the ICE Candidate to the remote peer
const onIceCandidate = (evt) => {
  socket.emit('candidate', JSON.stringify({'candidate': evt.candidate}));
};

const makeCall = () => {
  caller.createOffer().then(desc => {
    console.log('offer made');
    caller.setLocalDescription(new RTCSessionDescription(desc));
    socket.emit('call', JSON.stringify(desc));

  });
};
socket.on('connect', () => {
  console.log('socket.io connected');

  socket.on('call', msg => {
    console.log('call message ' + JSON.parse(msg));
    caller.setRemoteDescription(new RTCSessionDescription(JSON.parse(msg)));
    caller.createAnswer().then(call => {
      caller.setLocalDescription(new RTCSessionDescription(call));
      socket.emit('answer', JSON.stringify(call));
    });
  });

  socket.on('answer', answer => {
    console.log('answer received: ' + answer);
    caller.setRemoteDescription(new RTCSessionDescription(JSON.parse(answer)));
  });

  socket.on('candidate', (msg) => {
    console.log('candidate message recieved!');
    caller.addIceCandidate(new RTCIceCandidate(JSON.parse(msg).candidate));
    socket.broadcast.emit('candidate', msg);
  });
});

document.querySelector('#btnMakeCall').addEventListener('click', makeCall);

