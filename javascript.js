document.addEventListener("DOMContentLoaded", function () {

    const STORAGE_KEYS = {
        profile: "lfProfile"
    };

    function isLoggedIn() {
        return localStorage.getItem("lfLoggedIn") === "true" || Boolean(localStorage.getItem("username"));
    }

    function setLoggedIn(username) {
        localStorage.setItem("username", username);
        localStorage.setItem("lfLoggedIn", "true");
    }

    function logoutUser() {
        localStorage.removeItem("username");
        localStorage.removeItem("lfLoggedIn");
        window.location.href = "index.html";
    }

    function addLogoutButton() {
        const pageName = window.location.pathname.split("/").pop();
        const hideOnPages = ["login.html", "signup.html", "index.html"];

        if (hideOnPages.includes(pageName)) {
            return;
        }

        if (document.getElementById("logout-btn")) {
            return;
        }

        const button = document.createElement("button");
        button.id = "logout-btn";
        button.type = "button";
        button.textContent = "Logout";
        button.style.position = "fixed";
        button.style.top = "16px";
        button.style.right = "16px";
        button.style.zIndex = "9999";
        button.style.padding = "10px 16px";
        button.style.border = "none";
        button.style.borderRadius = "999px";
        button.style.background = "#0b63d6";
        button.style.color = "white";
        button.style.cursor = "pointer";
        button.style.fontWeight = "700";
        button.addEventListener("click", logoutUser);
        document.body.appendChild(button);
    }

    function updateAuthNavigation() {
        const loggedIn = isLoggedIn();

        document.querySelectorAll('a[href="index.html"]').forEach((link) => {
            if (loggedIn) {
                link.href = "dashboard.html";
                if (link.textContent.trim().toLowerCase() === "home") {
                    link.textContent = "Dashboard";
                }
            }
        });

        document.querySelectorAll('a[href="login.html"]').forEach((link) => {
            if (loggedIn) {
                link.href = "dashboard.html";
                link.textContent = "Dashboard";
            }
        });

        if (loggedIn) {
            addLogoutButton();
        } else {
            const existingButton = document.getElementById("logout-btn");
            if (existingButton) {
                existingButton.remove();
            }
        }
    }

    async function getStoredReports() {
        try {
            const response = await fetch("/api/reports");
            if (!response.ok) {
                throw new Error("Failed to fetch reports");
            }
            const data = await response.json();
            return Array.isArray(data) ? data : [];
        } catch (error) {
            console.error("Could not load reports:", error);
            try {
                const raw = localStorage.getItem("lfReports");
                return raw ? JSON.parse(raw) : [];
            } catch (fallbackError) {
                console.error("Could not load fallback reports:", fallbackError);
                return [];
            }
        }
    }

    function saveReportsToLocalFallback(reports) {
        localStorage.setItem("lfReports", JSON.stringify(reports));
    }

    async function saveReport(report) {
        try {
            const response = await fetch("/api/reports", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(report)
            });

            if (!response.ok) {
                throw new Error("Failed to save report");
            }

            return await response.json();
        } catch (error) {
            console.error("Could not save report remotely:", error);
            const reports = JSON.parse(localStorage.getItem("lfReports") || "[]");
            reports.push(report);
            saveReportsToLocalFallback(reports);
            return report;
        }
    }

    function getStoredProfile() {
        try {
            const raw = localStorage.getItem(STORAGE_KEYS.profile);
            return raw ? JSON.parse(raw) : null;
        } catch (error) {
            console.error("Could not load profile:", error);
            return null;
        }
    }

    function saveProfile(profile) {
        localStorage.setItem(STORAGE_KEYS.profile, JSON.stringify(profile));
    }

    function updateDashboardIdentity() {
        const welcome = document.getElementById("dashboard-welcome");
        const profileName = document.querySelector(".lf-user-profile-name");
        const storedProfile = getStoredProfile();
        const name = storedProfile?.fullName || localStorage.getItem("username") || "Student";

        if (welcome) {
            welcome.textContent = `Welcome to Your Dashboard, ${name}! Find, claim, and announce with us`;
        }

        if (profileName) {
            profileName.textContent = name;
        }
    }

    const themeBtn = document.getElementById("theme-btn");
    if (themeBtn) {
        if (localStorage.getItem("theme") === "light") {
            document.body.classList.add("light-theme");
            themeBtn.innerHTML = "Switch to Dark";
        } else {
            document.body.classList.remove("light-theme");
            themeBtn.innerHTML = "Switch to Light";
        }

        themeBtn.addEventListener("click", function () {
            document.body.classList.toggle("light-theme");

            if (document.body.classList.contains("light-theme")) {
                localStorage.setItem("theme", "light");
                themeBtn.innerHTML = "Switch to Dark";
            } else {
                localStorage.setItem("theme", "dark");
                themeBtn.innerHTML = "Switch to Light";
            }
        });
    }

    const dateEl = document.getElementById("date");
    function updateDate() {
        if (dateEl) {
            const today = new Date();
            const options = {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric"
            };
            dateEl.innerHTML = today.toLocaleDateString(undefined, options);
        }
    }
    updateDate();

    const clock = document.getElementById("clock");
    function updateClock() {
        if (clock) {
            const now = new Date();
            clock.innerHTML = now.toLocaleTimeString();
        }
    }
    updateClock();
    setInterval(updateClock, 1000);

    const loginBtn = document.getElementById("loginBtn");
    if (loginBtn) {
        loginBtn.addEventListener("click", function (e) {
            e.preventDefault();

            const username = document.getElementById("username").value;
            if (username === "") {
                alert("Please enter your username.");
                return;
            }

            setLoggedIn(username);
            window.location.href = "dashboard.html";
        });
    }

    const greeting = document.getElementById("greeting");
    if (greeting) {
        let username = localStorage.getItem("username") || "Student";
        const hour = new Date().getHours();
        let message = "";

        if (hour < 12) {
            message = "Good Morning";
        } else if (hour < 17) {
            message = "Good Afternoon";
        } else {
            message = "Good Evening";
        }

        greeting.innerHTML = message + ", " + username + "!";
    }

    const loginForm = document.getElementById("login-form");
    if (loginForm) {
        loginForm.addEventListener("submit", function (e) {
            e.preventDefault();
            const usernameInput = document.getElementById("username");
            if (usernameInput && usernameInput.value.trim()) {
                setLoggedIn(usernameInput.value.trim());
            }
            window.location.href = "dashboard.html";
        });
    }

    updateDashboardIdentity();
    updateAuthNavigation();

    // Populate recently lost and found items from reports
    const populateDashboardItems = async () => {
        const recentlyLostList = document.getElementById("recently-lost-list");
        const recentlyFoundList = document.getElementById("recently-found-list");

        if (recentlyLostList || recentlyFoundList) {
            const reports = await getStoredReports();
            
            if (recentlyLostList) {
                const lostReports = reports
                    .filter((report) => report.type === "lost")
                    .slice(-3)
                    .reverse();

                if (lostReports.length === 0) {
                    recentlyLostList.innerHTML = "<p style='padding: 20px; text-align: center; color: #666;'>No lost items reported yet</p>";
                } else {
                    recentlyLostList.innerHTML = lostReports
                        .map((report) => {
                            return `
                                <button class="item-btn">
                                    <div class="item-btn-name">${report.itemName || "Unnamed item"}</div>
                                    <div class="item-btn-location">${report.location || "Not specified"}</div>
                                </button>
                            `;
                        })
                        .join("");
                }
            }

            if (recentlyFoundList) {
                const foundReports = reports
                    .filter((report) => report.type === "found")
                    .slice(-3)
                    .reverse();

                if (foundReports.length === 0) {
                    recentlyFoundList.innerHTML = "<p style='padding: 20px; text-align: center; color: #666;'>No found items reported yet</p>";
                } else {
                    recentlyFoundList.innerHTML = foundReports
                        .map((report) => {
                            return `
                                <button class="item-btn">
                                    <div class="item-btn-name">${report.itemName || "Unnamed item"}</div>
                                    <div class="item-btn-location">${report.location || "Not specified"}</div>
                                </button>
                            `;
                        })
                        .join("");
                }
            }
        }
    };

    populateDashboardItems();

    // Search functionality
    const searchInput = document.querySelector(".lf-search-input input");
    if (searchInput) {
        searchInput.addEventListener("input", function () {
            const searchQuery = this.value.toLowerCase();
            const itemButtons = document.querySelectorAll(".item-btn");

            itemButtons.forEach((button) => {
                const itemName = button.querySelector(".item-btn-name").textContent.toLowerCase();
                const itemLocation = button.querySelector(".item-btn-location").textContent.toLowerCase();

                if (itemName.includes(searchQuery) || itemLocation.includes(searchQuery)) {
                    button.style.display = "block";
                } else {
                    button.style.display = "none";
                }
            });
        });
    }

    const lostForm = document.getElementById("lost-report-form");
    if (lostForm) {
        const message = document.getElementById("lost-form-status");

        lostForm.addEventListener("submit", async function (event) {
            event.preventDefault();

            const formData = new FormData(lostForm);
            const report = {
                id: Date.now(),
                type: "lost",
                reporterName: (formData.get("full-name") || "").toString().trim(),
                email: (formData.get("email") || "").toString().trim(),
                itemName: (formData.get("item-name") || "").toString().trim(),
                category: (formData.get("category") || "").toString().trim(),
                location: (formData.get("location") || "").toString().trim(),
                date: (formData.get("lost-date") || "").toString().trim(),
                description: (formData.get("details") || "").toString().trim(),
                submittedAt: new Date().toISOString()
            };

            await saveReport(report);

            lostForm.reset();
            if (message) {
                message.textContent = "Your lost report has been saved successfully.";
                message.className = "form-status success";
            }

            updateDashboardIdentity();
        });
    }

    const foundForm = document.getElementById("found-report-form");
    if (foundForm) {
        const message = document.getElementById("found-form-status");

        foundForm.addEventListener("submit", async function (event) {
            event.preventDefault();

            const formData = new FormData(foundForm);
            const report = {
                id: Date.now(),
                type: "found",
                reporterName: (formData.get("finder-name") || "").toString().trim(),
                email: (formData.get("finder-email") || "").toString().trim(),
                itemName: (formData.get("found-item-name") || "").toString().trim(),
                category: (formData.get("found-category") || "").toString().trim(),
                location: (formData.get("found-location") || "").toString().trim(),
                date: (formData.get("found-date") || "").toString().trim(),
                description: (formData.get("found-details") || "").toString().trim(),
                submittedAt: new Date().toISOString()
            };

            await saveReport(report);

            foundForm.reset();
            if (message) {
                message.textContent = "Your found report has been saved successfully.";
                message.className = "form-status success";
            }

            updateDashboardIdentity();
        });
    }

    const reportsList = document.getElementById("reports-list");
    const reportsSummary = document.getElementById("reports-summary");

    if (reportsList && reportsSummary) {
        const renderReports = async () => {
            const reports = await getStoredReports();
            const lostCount = reports.filter((report) => report.type === "lost").length;
            const foundCount = reports.filter((report) => report.type === "found").length;

            reportsSummary.innerHTML = `
                <div class="summary-card">
                    <h3>${reports.length}</h3>
                    <p>Total reports</p>
                </div>
                <div class="summary-card">
                    <h3>${lostCount}</h3>
                    <p>Lost</p>
                </div>
                <div class="summary-card">
                    <h3>${foundCount}</h3>
                    <p>Found</p>
                </div>
            `;

            if (reports.length === 0) {
                reportsList.innerHTML = `
                    <div class="empty-state">
                        <h3>No reports yet</h3>
                        <p>Submitted reports will appear here once you save a lost or found item.</p>
                    </div>
                `;
                return;
            }

            reportsList.innerHTML = reports
                .slice()
                .reverse()
                .map((report) => {
                    const badgeClass = report.type === "lost" ? "lost" : "found";
                    const label = report.type === "lost" ? "Lost item" : "Found item";
                    const submittedAt = report.submittedAt
                        ? new Date(report.submittedAt).toLocaleDateString(undefined, {
                            year: "numeric",
                            month: "short",
                            day: "numeric"
                        })
                        : "Recently submitted";

                    return `
                        <article class="report-card ${badgeClass}">
                            <div class="report-card-top">
                                <span class="report-badge ${badgeClass}">${label}</span>
                                <span class="report-date">${submittedAt}</span>
                            </div>
                            <h3>${report.itemName || "Unnamed item"}</h3>
                            <p><strong>Reporter:</strong> ${report.reporterName || "Unknown"}</p>
                            <p><strong>Category:</strong> ${report.category || "Unspecified"}</p>
                            <p><strong>Location:</strong> ${report.location || "Not provided"}</p>
                            <p><strong>Description:</strong> ${report.description || "No description provided."}</p>
                        </article>
                    `;
                })
                .join("");
        };

        renderReports();
    }

    const profileForm = document.getElementById("profile-form");
    const profileStatus = document.getElementById("profile-status");

    if (profileForm) {
        const storedProfile = getStoredProfile();
        const defaultProfile = {
            fullName: localStorage.getItem("username") || "Student",
            email: "",
            phone: "",
            department: "",
            bio: ""
        };
        const profile = storedProfile || defaultProfile;

        profileForm.querySelector('input[name="fullName"]').value = profile.fullName || "";
        profileForm.querySelector('input[name="email"]').value = profile.email || "";
        profileForm.querySelector('input[name="phone"]').value = profile.phone || "";
        profileForm.querySelector('input[name="department"]').value = profile.department || "";
        profileForm.querySelector('textarea[name="bio"]').value = profile.bio || "";

        profileForm.addEventListener("submit", function (event) {
            event.preventDefault();

            const profileData = {
                fullName: profileForm.querySelector('input[name="fullName"]').value.trim(),
                email: profileForm.querySelector('input[name="email"]').value.trim(),
                phone: profileForm.querySelector('input[name="phone"]').value.trim(),
                department: profileForm.querySelector('input[name="department"]').value.trim(),
                bio: profileForm.querySelector('textarea[name="bio"]').value.trim()
            };

            saveProfile(profileData);
            localStorage.setItem("username", profileData.fullName || "Student");
            updateDashboardIdentity();

            if (profileStatus) {
                profileStatus.textContent = "Profile saved successfully.";
                profileStatus.className = "form-status success";
            }
        });
    }
});
