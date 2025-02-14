var peer;
var myStream = null; // Initialisation du flux local

// Fonction pour ajouter une vidéo sans duplication
function ajoutVideo(stream, userId) {
    let existingVideo = document.getElementById(video-${userId});

    if (!existingVideo) {
        let video = document.createElement('video');
        video.id = video-${userId};
        video.srcObject = stream;
        video.autoplay = true;
        video.controls = true;
        document.getElementById('participants').appendChild(video);
        console.log(Vidéo ajoutée pour l'utilisateur: ${userId});
    } else {
        // Vérifie si le flux est différent avant de le remplacer
        if (existingVideo.srcObject !== stream) {
            existingVideo.srcObject = stream;
        }
    }
}

// Fonction pour enregistrer l'utilisateur et initialiser PeerJS
function register() {
    var name = document.getElementById('name').value.trim();

    if (!name) {
        alert("Veuillez entrer un nom !");
        return;
    }

    try {
        peer = new Peer(name); // Création du Peer avec le nom

        navigator.mediaDevices.getUserMedia({ video: true, audio: true })
            .then(function(stream) {
                myStream = stream; // Stocker le flux local
                ajoutVideo(stream, "self"); // Afficher la vidéo après enregistrement

                document.getElementById('register').style.display = 'none';
                document.getElementById('userAdd').style.display = 'block';
                document.getElementById('userShare').style.display = 'block';

                // Réception d'un appel entrant
                peer.on('call', function(call) {
                    console.log('Appel entrant de:', call.peer);
                    call.answer(myStream); // Répondre avec le flux local

                    call.on('stream', function(remoteStream) {
                        ajoutVideo(remoteStream, call.peer); // Ajouter la vidéo du correspondant
                    });

                    call.on('close', function() {
                        console.log('Appel terminé avec:', call.peer);
                    });
                });

                peer.on('error', function(err) {
                    console.error('Erreur PeerJS:', err);
                });

                peer.on('open', function(id) {
                    console.log('Mon ID de peer est : ' + id);
                });

            })
            .catch(function(err) {
                console.log("Échec de l'accès au flux vidéo/audio", err);
            });

    } catch (error) {
        console.error("Erreur lors de la création du peer:", error);
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
        ajoutVideo(remoteStream, name);
    });

    call.on('close', function() {
        console.log('Appel terminé avec:', name);
    });

    call.on('error', function(err) {
        console.error("Erreur lors de l'appel:", err);
    });

    document.getElementById('add').value = ""; // Réinitialiser l'entrée
}

// Fonction pour partager l'écran
function addScreenShare() {
    var name = document.getElementById('share').value.trim();
    document.getElementById('share').value = ""; // Réinitialiser l'entrée

    if (!name || !peer) {
        alert("Veuillez entrer un nom valide et vous enregistrer d'abord !");
        return;
    }

    navigator.mediaDevices.getDisplayMedia({ video: { cursor: "always" }, audio: true })
        .then((screenStream) => {
            console.log('Partage d\'écran démarré');

            // Supprimer l'ancienne vidéo de partage d'écran si elle existe
            let existingScreenVideo = document.getElementById(video-screen-${name});
            if (existingScreenVideo) existingScreenVideo.remove();

            // Ajouter la vidéo du partage pour l'administrateur
            ajoutVideo(screenStream, screen-${name});

            // Envoyer le flux de partage à l'invité
            let call = peer.call(name, screenStream);

            call.on('stream', function(remoteStream) {
                let userScreenVideoId = video-screen-${name};
                
                // Supprimer la vidéo normale de l’invité (évite les doublons)
                let existingUserVideo = document.getElementById(video-${name});
                if (existingUserVideo) existingUserVideo.remove();

                // Ajouter la vidéo du partage pour l'invité
                if (!document.getElementById(userScreenVideoId)) {
                    ajoutVideo(remoteStream, userScreenVideoId);
                }
            });

            // Quand l’administrateur arrête le partage, il remet sa caméra
            screenStream.getTracks()[0].onended = function() {
                console.log("Partage d'écran terminé");
                document.getElementById(video-screen-${name})?.remove(); // Supprimer le partage
                
                // Remettre la caméra normale
                if (myStream) {
                    ajoutVideo(myStream, "self");
                }
            };
        })
        .catch((err) => {
            console.error("Erreur lors du partage d'écran:", err);
            alert("Impossible de partager l'écran.");
        });
}







        






