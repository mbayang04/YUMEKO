
// Configuration de SimpleWebRTC
const webrtc = new SimpleWebRTC({
  localVideoEl: 'localVideo',
  remoteVideosEl: 'remoteVideos',
  autoRequestMedia: true,
});

// Démarrer l'appel
document.getElementById('startCall').addEventListener('click', () => {
  webrtc.joinRoom('ma-salle-de-reunion');
});

// Partager l'écran
document.getElementById('shareScreen').addEventListener('click', () => {
  webrtc.shareScreen((err, stream) => {
      if (err) {
          console.error('Erreur lors du partage de l\'écran:', err);
      } else {
          console.log('Partage d\'écran démarré');
      }
  });
});

// Gestion des événements
webrtc.on('readyToCall', () => {
  console.log('Prêt à passer un appel');
});

webrtc.on('videoAdded', (video, peer) => {
  console.log('Nouvelle vidéo ajoutée:', peer.id);
});

webrtc.on('videoRemoved', (video, peer) => {
  console.log('Vidéo retirée:', peer.id);
});
