
 var peer;
var myStream = null; // Initialisation a null pour eviter l'affichage avant l'enregistrement

// Fonction pour ajouter une video sans duplication
function ajoutVideo(stream, userId) {
    let existingVideo = document.getElementById(`video-${userId}`);

    // Verifier si la video existe deja pour cet utilisateur
    if (!existingVideo) {
        let video = document.createElement('video');
        video.id = `video-${userId}`;
        video.srcObject = stream;
        video.autoplay = true;
        video.controls = true;
        document.getElementById('participants').appendChild(video);
        console.log(`Video ajoutee pour l'utilisateur: ${userId}`);
    }
}

// Fonction pour enregistrer l'utilisateur et initialiser le peer
function register() {
    var name = document.getElementById('name').value.trim();

    if (!name) {
        alert("Veuillez entrer un nom !");
        return;
    }

    try {
        peer = new Peer(name);  // Creer un peer avec le nom de l'utilisateur

        peer.on('open', function(id) {
            console.log('Mon ID de peer est : ' + id);
        });

        peer.on('error', function(err) {
            console.error('Erreur PeerJS:', err);
        });

        navigator.mediaDevices.getUserMedia({ video: true, audio: true })
            .then(function(stream) {
                myStream = stream; // Stocke le flux local
                ajoutVideo(stream, "self"); // Ajoute la video uniquement apres l'enregistrement du nom
                document.getElementById('register').style.display = 'none';
                document.getElementById('userAdd').style.display = 'block';
                document.getElementById('userShare').style.display = 'block';

                // Reception d'un appel entrant
                peer.on('call', function(call) {
                    console.log('Appel entrant de:', call.peer);
                    call.answer(myStream); // Repondre avec le flux local
                    call.on('stream', function(remoteStream) {
                        ajoutVideo(remoteStream, call.peer); // Ajouter la video de l'appelant si elle n'existe pas deja
                    });
                    call.on('close', function() {
                        console.log('Appel termine avec:', call.peer);
                    });
                    call.on('error', function(err) {
                        console.error('Erreur lors de l'appel entrant:', err);
                    });
                });
            })
            .catch(function(err) {
                console.log('Echec de l'acces au flux video/audio', err);
            });

    } catch (error) {
        console.error("Erreur lors de la creation du peer:", error);
    }
}

// Fonction pour appeler un utilisateur
function appelUser() {
    var name = document.getElementById('add').value.trim();
    
    if (!name || !myStream) {
        alert("Veuillez entrer un nom valide et vous enregistrer d'abord !");
        return;
    }

    console.log('Appel en cours vers:', name);
    var call = peer.call(name, myStream);
    
    call.on('stream', function(remoteStream) {
        ajoutVideo(remoteStream, name); // Ajouter la video de l'utilisateur appele
    });

    call.on('close', function() {
        console.log('Appel termine avec:', name);
    });

    call.on('error', function(err) {
        console.error('Erreur lors de l'appel:', err);
    });

    document.getElementById('add').value = ""; // Reinitialiser l'entree
}

function addScreenShare() {
    var name = document.getElementById('share').value.trim();
    document.getElementById('share').value = ""; // Reinitialiser l'entree

    if (!name || !peer) {
        alert("Veuillez entrer un nom valide et vous enregistrer d'abord !");
        return;
    }

    navigator.mediaDevices.getDisplayMedia({ video: { cursor: "always" }, audio: true })
        .then((screenStream) => {
            console.log('Partage d'ecran demarre');

            // Supprimer l'ancienne video de partage d'ecran si elle existe
            let existingScreenVideo = document.getElementById(`video-screen-${name}`);
            if (existingScreenVideo) existingScreenVideo.remove();

            // Ajouter la video du partage pour l'administrateur
            ajoutVideo(screenStream, `screen-${name}`);

            // Envoyer le flux de partage a l'invite
            let call = peer.call(name, screenStream);

            // L'invite recoit le partage et l'affiche
            call.on('stream', function(remoteStream) {
                let userScreenVideoId = `video-screen-${name}`;
                
                // Supprimer la video normale de l'invite (evite les doublons)
                let existingUserVideo = document.getElementById(`video-${name}`);
                if (existingUserVideo) existingUserVideo.remove();

                // Ajouter la video du partage pour l'invite
                if (!document.getElementById(userScreenVideoId)) {
                    ajoutVideo(remoteStream, userScreenVideoId);
                }
            });

            // Quand l'administrateur arrete le partage, il remet sa camera
            screenStream.getTracks()[0].onended = function() {
                console.log("Partage d'ecran termine");
                document.getElementById(`video-screen-${name}`)?.remove(); // Supprimer le partage
                ajoutVideo(myStream, "self"); // Remettre la camera normale
            };
        })
        .catch((err) => {
            console.error('Erreur lors du partage d'ecran:', err);
            alert('Impossible de partager l'ecran.');
        });
}

