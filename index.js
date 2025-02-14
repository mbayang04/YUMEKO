




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
        video.style.width = '320px'; // Définir une taille pour la vidéo
        video.style.height = '240px';
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

        // Demande l'accès à la caméra et au micro
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
                        ajoutVideo(remoteStream, call.peer); // Ajouter la vidéo de l'appelant
                    });
                });
            })
        






