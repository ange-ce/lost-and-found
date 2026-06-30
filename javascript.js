// Initialize interactive UI after DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    const themeBtn = document.getElementById('theme-btn');
    const dateEl = document.getElementById('date');
    const clock = document.getElementById('clock');

    if (themeBtn) {
        themeBtn.addEventListener('click', () => {
            document.body.classList.toggle('light-mode');
            if (document.body.classList.contains('light-mode')) {
                themeBtn.innerHTML = '🌚 switch to dark';
            } else {
                themeBtn.innerHTML = '🌞 switch to light';
            }
        });
    }

    // live date
    function updateDate() {
        if (!dateEl) return;
        const now = new Date();
        const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        dateEl.innerHTML = now.toLocaleDateString(undefined, options);
    }
    updateDate();
    setInterval(updateDate, 60000);

    // live clock
    function updateClock() {
        if (!clock) return;
        const now = new Date();
        let hours = now.getHours();
        let minutes = now.getMinutes();
        let seconds = now.getSeconds();
        if (hours < 10) hours = '0' + hours;
        if (minutes < 10) minutes = '0' + minutes;
        if (seconds < 10) seconds = '0' + seconds;
        clock.innerHTML = `${hours}:${minutes}:${seconds}`;
    }
    updateClock();
    setInterval(updateClock, 1000);

    // LOGIN
    const loginBtn = document.getElementById('loginBtn');
    if (loginBtn) {
        loginBtn.addEventListener('click', function (e) {
            e.preventDefault();
            const username = document.getElementById('username').value;
            if (!username) {
                alert('Please enter your username.');
                return;
            }
            localStorage.setItem('username', username);
            window.location.href = 'dashboard.html';
        });
    }

    // GREETING
    function showGreeting() {
        const greeting = document.getElementById('greeting');
        if (!greeting) return;
        let username = localStorage.getItem('username');
        if (username === null) username = 'Student';
        const hour = new Date().getHours();
        let message = '';
        if (hour >= 5 && hour < 12) message = 'Good Morning';
        else if (hour >= 12 && hour < 17) message = 'Good Afternoon';
        else message = 'Good Evening';
        greeting.innerHTML = message + ', ' + username + '!';
    }
    showGreeting();
});