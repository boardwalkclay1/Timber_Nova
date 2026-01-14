// /modules/webrtc/webrtcClient.js
// Requires <script src="https://cdn.socket.io/4.7.5/socket.io.min.js"></script> in the page.

export function createTimberNovaRTC({ signalingUrl, roomId, localVideoId, remoteVideoId }) {
  const socket = io(signalingUrl, { transports: ['websocket'] });

  const pc = new RTCPeerConnection({
    iceServers: [
      { urls: 'stun:stun.l.google.com:19302' }
    ]
  });

  const localVideo = document.getElementById(localVideoId);
  const remoteVideo = document.getElementById(remoteVideoId);

  socket.on('connect', () => {
    socket.emit('join-room', roomId);
  });

  socket.on('signal', async ({ from, data }) => {
    if (data.type === 'offer') {
      await pc.setRemoteDescription(new RTCSessionDescription(data));
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);
      socket.emit('signal', { roomId, data: pc.localDescription });
    } else if (data.type === 'answer') {
      await pc.setRemoteDescription(new RTCSessionDescription(data));
    } else if (data.candidate) {
      try {
        await pc.addIceCandidate(new RTCIceCandidate(data.candidate));
      } catch (e) {
        console.error('Error adding ICE candidate', e);
      }
    }
  });

  pc.onicecandidate = event => {
    if (event.candidate) {
      socket.emit('signal', { roomId, data: { candidate: event.candidate } });
    }
  };

  pc.ontrack = event => {
    if (remoteVideo) {
      remoteVideo.srcObject = event.streams[0];
    }
  };

  async function startLocalMedia() {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
    if (localVideo) {
      localVideo.srcObject = stream;
    }
    stream.getTracks().forEach(track => pc.addTrack(track, stream));
  }

  async function startCall() {
    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);
    socket.emit('signal', { roomId, data: pc.localDescription });
  }

  return {
    startLocalMedia,
    startCall
  };
}
