
   var peer;
var myStream;
function ajoutVideo(stream) {
 try {
 var video = document.createElement('video');
 document.getElementById('participants').appendChild(video);
 video.autoplay = true;
 video.controls = true;
 video.srcObject = stream;
 } catch (error) {
 console.error(error);
 }
 }
function register() {
 var name = document.getElementById('name').value;
 try {
 peer = new Peer(name);
 navigator.getUserMedia({video: true, audio: true}, function(stream) {
 myStream = stream;
 ajoutVideo(stream);
 document.getElementById('register').style.display = 'none';
 document.getElementById('userAdd').style.display = 'block';
 document.getElementById('userShare').style.display = 'block';
 peer.on('call', function(call) {
 call.answer(myStream);
 call.on('stream', function(remoteStream) {
 ajoutVideo(remoteStream);
 });
 });
 function raccrocher() {
    if (myStream) {
        myStream.getTracks().forEach(track => track.stop()); // Arrête le flux vidéo et audio
    }
    if (peer) {
        peer.destroy(); // Ferme la connexion PeerJS
    }
    
    // Supprime toutes les vidéos affichées
    document.getElementById('participants').innerHTML = '';

    // Réafficher le formulaire d'inscription pour relancer un appel
    document.getElementById('register').style.display = 'block';
    document.getElementById('userAdd').style.display = 'none';
    document.getElementById('userShare').style.display = 'none';
}

// Ajouter un écouteur sur le bouton raccrocher
document.querySelector('.hangup-button').addEventListener('click', raccrocher);

 }, function(err) {
 console.log('Failed to get local stream' ,err);
 });
 } catch (error) {
 console.error(error);
 }
}
function appelUser(){
 try {
 var name = document.getElementById('add').value;
 document.getElementById('add').value = ""; 
 var call = peer.call(name, myStream);
 call.on('stream', function(remoteStream) {
 ajoutVideo(remoteStream);
 }); 
 } catch (error) {
 console.error(error);
 }
}
function addScreenShare(){
 var name = document.getElementById('share').value;
 document.getElementById('share').value = "";
 navigator.mediaDevices.getDisplayMedia({video: {
 cursor: "always"},audio: true})
 .then((stream) => {
 let call = peer.call(name, stream); 
 }); 
}








        






