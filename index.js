
let peer;
let myStream;

/**
 * Fonction pour afficher les erreurs de PeerJS
 */
function handlePeerErrors() {
    peer.on('error', (err) => {
        console.error("Erreur PeerJS :", err);
        alert("Erreur PeerJS : " + err.type);
    });
}

/**
 * Ajoute ou remplace une vidéo à la liste des participants
 */
function ajoutVideo(stream, isLocal = false) {
    try {
        let videoContainer = document.getElementById(isLocal ? 'myVideo' : 'participants');
        let video = videoContainer.querySelector('video');
        
        if (!video) {
            video = document.createElement('video');
            video.autoplay = true;
            video.controls = true;
            videoContainer.appendChild(video);
        }
        
        let tracks = video.srcObject ? video.srcObject.getTracks() : [];
        tracks.forEach(track => track.stop()); // Stopper l'ancien flux
        video.srcObject = stream;
    } catch (error) {
        console.error("Erreur lors de l'ajout de la vidéo :", error);
    }
}

/**
 * Inscription de l'utilisateur au service PeerJS
 */
function register() {
    const name = document.getElementById('name').value.trim();
    if (!name) return alert("Veuillez entrer un nom !");
    
    try {
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
            console.log("Connexion établie avec PeerJS. ID :", id);
        });

        navigator.mediaDevices.getUserMedia({ video: true, audio: true })
            .then((stream) => {
                console.log("Flux récupéré :", stream);
                if (!stream.getAudioTracks().length) {
                    console.warn("⚠️ Aucun flux audio détecté !");
                    alert("Aucun flux audio détecté, vérifiez votre micro !");
                }
                if (!stream.getVideoTracks().length) {
                    console.warn("⚠️ Aucun flux vidéo détecté !");
                    alert("Aucun flux vidéo détecté, vérifiez votre caméra !");
                }
                
                myStream = stream;
                ajoutVideo(stream, true);

                document.getElementById('register').style.display = 'none';
                document.getElementById('userAdd').style.display = 'block';
                document.getElementById('userShare').style.display = 'block';

                peer.on('call', (call) => {
                    console.log("📞 Appel entrant détecté !");
                    call.answer(myStream);
                    call.on('stream', (remoteStream) => {
                        console.log("✅ Flux distant reçu :", remoteStream);
                        ajoutVideo(remoteStream);
                    });
                    call.on('error', (err) => console.error("Erreur appel entrant :", err));
                });
            })
            .catch((err) => {
                console.error("Erreur lors de l'accès à la caméra/microphone :", err);
                alert("Vérifiez les permissions de votre navigateur et réessayez.");
            });
    } catch (error) {
        console.error("Erreur lors de l'inscription PeerJS :", error);
    }
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

    try {
        console.log(`Tentative d'appel à ${name}...`);
        const call = peer.call(name, myStream);
        call.on('stream', (remoteStream) => {
            console.log("✅ Appel réussi, flux vidéo/audio reçu !");
            ajoutVideo(remoteStream);
        });
        call.on('error', (err) => console.error("❌ Erreur appel sortant :", err));
    } catch (error) {
        console.error("Erreur lors de l'appel :", error);
        alert("Échec de l'appel.");
    }
}

/**
 * Partager son écran avec un utilisateur
 */
function addScreenShare() {
    const name = document.getElementById('share').value.trim();
    if (!name) return alert("Veuillez entrer le nom de l'utilisateur !");
    
    if (!peer || !peer.open) {
        return alert("Vous devez être connecté avant de partager l'écran !");
    }

    navigator.mediaDevices.getDisplayMedia({ video: { cursor: "always" }, audio: true })
        .then((stream) => {
            console.log(`Partage d'écran avec ${name}...`);
            try {
                const call = peer.call(name, stream);
                ajoutVideo(stream, true);
                call.on('error', (err) => console.error("Erreur lors du partage d'écran :", err));
            } catch (error) {
                console.error("Erreur lors du partage d'écran :", error);
                alert("Impossible de partager l'écran.");
            }
        })
        .catch((error) => {
            console.error("Erreur lors de la capture d'écran :", error);
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
    document.getElementById('participants').innerHTML = '';
    document.getElementById('myVideo').innerHTML = '';
}

