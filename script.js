// script.js
const container = document.getElementById('shorts-container');

fetch('videos.txt')
    .then(response => response.text())
    .then(data => {
        let lines = data.split('\n').filter(line => line.trim() !== '');

        // Shuffle the lines array randomly
        lines = lines.sort(() => Math.random() - 0.5);

        lines.forEach(line => {
            const trimmedLine = line.trim();
            if (trimmedLine) {
                const short = document.createElement('div');
                short.className = 'short';
                short.innerHTML = `
                    <video src="${trimmedLine}" autoplay muted loop controlslist="nodownload" playsinline></video>
                `;
                container.appendChild(short);
            }
        });

        // Automatically pause videos that are out of view and play the one in view
        const videos = document.querySelectorAll('video');
        const observer = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                const video = entry.target;
                if (entry.isIntersecting) {
                    video.play();
                } else {
                    video.pause();
                }
            });
        }, { threshold: 0.5 });

        videos.forEach(video => {
            observer.observe(video);
        });
    })
    .catch(error => console.error('Error loading videos:', error));
