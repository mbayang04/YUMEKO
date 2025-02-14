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
    console.error('Erreur lors de l\'ajout de la vidéo:', error); 
  } 
} 

function register() { 
  var name = document.getElementById('name').value; 
  try { 
    peer = new Peer(name); 
    navigator.mediaDevices.getUserMedia({video: true, audio: true}).then((stream) => { 
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
    }).catch((err) => { 
      console.error('Échec de l\'obtention du flux local:', err); 
    }); 
  } catch (error) { 
    console.error('Erreur lors de l\'enregistrement:', error); 
  } 
} 

function appelUser() { 
  try { 
    var name = document.getElementById('add').value; 
    document.getElementById('add').value = ""; 
    var call = peer.call(name, myStream); 
    call.on('stream', function(remoteStream) { 
      ajoutVideo(remoteStream); 
    }); 
  } catch (error) { 
    console.error('Erreur lors de l\'appel:', error); 
  } 
} 

