let peer;
let myStream;

/**
 * Gérer les erreurs de PeerJS
 */
function handlePeerErrors() {
    peer.on('error', (err) => {
        console.error("Erreur PeerJS :", err);
        alert("Erreur PeerJS : " + err.type);
    });
}

/**
 * Ajouter une vidéo (locale ou distante) à l'écran
 */
function ajoutVideo(stream, isLocal = false) {
    let videoContainer = isLocal ? document.getElementById('myVideo') : document.getElementById('remoteVideos');
    
    let video = document.createElement('video');
    video.autoplay = true;
    video.controls = true;
    video.srcObject = stream;
    
    // Supprimer les anciennes vidéos (si c'est local)
    if (isLocal) {
        videoContainer.innerHTML = ''; 
    }

    videoContainer.appendChild(video);
}

/**
 * Inscription à PeerJS et activation de la webcam/micro
 */
function register() {
    const name = document.getElementById('name').value.trim();
    if (!name) return alert("Veuillez entrer un nom !");

    peer = new Peer(name, {
        debug: 2,
        config: {
            iceServers: [
                { urls: "stun:stun.l.google.com:19302" },
                { urls: "stun:stun1.l.google.com:19302" },
                { urls: "turn:yourturnserver.com:3478", username: "user", credential: "password" }
            ]
        }
    });

    handlePeerErrors();

    peer.on('open', (id) => {
        console.log("Connexion PeerJS établie avec l'ID :", id);
    });

    navigator.mediaDevices.getUserMedia({ video: true, audio: true })
        .then((stream) => {
            myStream = stream;
            ajoutVideo(stream, true);

            document.getElementById('register').style.display = 'none';
            document.getElementById('userAdd').style.display = 'block';
            document.getElementById('userShare').style.display = 'block';

            peer.on('call', (call) => {
                console.log("📞 Appel entrant...");
                call.answer(myStream);
                call.on('stream', (remoteStream) => {
                    ajoutVideo(remoteStream);
                });
            });
        })
        .catch((err) => {
            console.error("Erreur accès caméra/micro :", err);
            alert("Vérifiez vos permissions de caméra et microphone !");
        });
}

/**
 * Appeler un autre utilisateur
 */
function appelUser() {
    const name = document.getElementById('add').value.trim();
    if (!name) return alert("Veuillez entrer le nom de l'utilisateur !");

    if (!peer || !peer.open) {
        return alert("Vous devez être connecté avant d'appeler quelqu'un !");
    }

    const call = peer.call(name, myStream);
    call.on('stream', (remoteStream) => {
        ajoutVideo(remoteStream);
    });
}

/**
 * Partager son écran avec un utilisateur
 */
function addScreenShare() {
    const name = document.getElementById('share').value.trim();
    if (!name) return alert("Veuillez entrer le nom de l'utilisateur !");

    if (!peer || !peer.open) {
        return alert("Vous devez être connecté avant de partager votre écran !");
    }

    navigator.mediaDevices.getDisplayMedia({ video: true, audio: true })
        .then((stream) => {
            ajoutVideo(stream, true);
            const call = peer.call(name, stream);
        })
        .catch((error) => {
            console.error("Erreur partage d'écran :", error);
            alert("Impossible de partager l'écran.");
        });
}

/**
 * Déconnexion et arrêt des flux
 */
function deconnexion() {
    if (myStream) {
        myStream.getTracks().forEach(track => track.stop());
    }
    if (peer) {
        peer.destroy();
    }

    document.getElementById('register').style.display = 'block';
    document.getElementById('userAdd').style.display = 'none';
    document.getElementById('userShare').style.display = 'none';

    document.getElementById('myVideo').innerHTML = '';
    document.getElementById('remoteVideos').innerHTML = '';
}


