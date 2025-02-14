



var peer;
var myStream = null; // Initialisation à null pour éviter l'affichage avant l'enregistrement

// Fonction pour ajouter une vidéo sans duplication
function ajoutVideo(stream, userId) {
    let existingVideo = document.getElementById(`video-${userId}`);

    // Vérifier si la vidéo existe déjà pour cet utilisateur
    if (!existingVideo) {
        let video = document.createElement('video');
        video.id = `video-${userId}`;
        video.srcObject = stream;
        video.autoplay = true;
        video.controls = true;
        document.getElementById('participants').appendChild(video);
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
        peer = new Peer(name);  // Créer un peer avec le nom de l'utilisateur

        navigator.mediaDevices.getUserMedia({ video: true, audio: true })
            .then(function(stream) {
                myStream = stream; // Stocke le flux local
                ajoutVideo(stream, "self"); // Ajoute la vidéo uniquement après l'enregistrement du nom
                document.getElementById('register').style.display = 'none';
                document.getElementById('userAdd').style.display = 'block';
                document.getElementById('userShare').style.display = 'block';

                // Réception d'un appel entrant
                peer.on('call', function(call) {
                    call.answer(myStream); // Répondre avec le flux local
                    call.on('stream', function(remoteStream) {
                        ajoutVideo(remoteStream, call.peer); // Ajouter la vidéo de l'appelant si elle n'existe pas déjà
                    });
                });
            })
            .catch(function(err) {
                console.log('Échec de l\'accès au flux vidéo/audio', err);
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

    var call = peer.call(name, myStream);
    
    call.on('stream', function(remoteStream) {
        ajoutVideo(remoteStream, name); // Ajouter la vidéo de l'utilisateur appelé
    });

    document.getElementById('add').value = ""; // Réinitialiser l'entrée
}

// Fonction pour activer le partage d'écran
function startScreenShare() {
    if (!peer || !myStream) {
        alert("Veuillez vous enregistrer d'abord et obtenir un flux vidéo !");
        return;
    }

    // Demander l'accès au partage d'écran
    navigator.mediaDevices.getDisplayMedia({ video: { cursor: "always" }, audio: true })
        .then((screenStream) => {
            console.log('Partage d\'écran démarré');

            // Supprimer l'ancienne vidéo de partage d'écran si elle existe
            let existingScreenVideo = document.getElementById(`video-screen-self`);
            if (existingScreenVideo) existingScreenVideo.remove();

            // Ajouter la vidéo du partage d'écran
            ajoutVideo(screenStream, "screen-self");

            // Envoi du flux de partage d'écran à l'autre utilisateur
            var name = document.getElementById('add').value.trim();
            if (name) {
                var call = peer.call(name, screenStream);

                // Réception du flux vidéo de l'interlocuteur (appels vidéo classiques)
                call.on('stream', function(remoteStream) {
                    ajoutVideo(remoteStream, name); // Ajouter la vidéo de l'interlocuteur
                });
            }

            // Arrêter le partage d'écran et revenir à la caméra locale
            screenStream.getTracks()[0].onended = function() {
                console.log("Partage d'écran terminé");
                document.getElementById('video-screen-self')?.remove(); // Supprimer le partage d'écran
                ajoutVideo(myStream, "self"); // Remettre la caméra normale
            };
        })
        .catch((err) => {
            console.error('Erreur lors du partage d\'écran:', err);
            alert('Impossible de partager l\'écran.');
        });
}




