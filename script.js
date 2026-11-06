document.addEventListener("DOMContentLoaded", function () {

    // ==========================================
    // 1. CSV作品一覧
    // ==========================================

    const worksGrid = document.getElementById("works-grid");
    const categorySelect = document.getElementById("category");
    const sortSelect = document.getElementById("sort");

    let works = [];

    if (worksGrid) {

        fetch("./works.csv")
            .then(function (response) {
                if (!response.ok) {
                    throw new Error("CSVを読み込めませんでした");
                }
                return response.text();
            })
            .then(function (data) {

                const rows = data.trim().split(/\r?\n/);
                rows.shift();

                works = rows.filter(Boolean).map(function (row) {

                    const columns = row.split(",");

                    return {
                        title: columns[0] || "",
                        description: columns[1] || "",
                        category: columns[2] || "",
                        year: Number(columns[3]) || 0,
                        image: columns[4] || ""
                    };
                });

                displayWorks();
            })
            .catch(function (error) {
                console.error(error);
                worksGrid.textContent = "作品情報を読み込めませんでした";
            });
    }

    function displayWorks() {

        if (!worksGrid) return;

        worksGrid.replaceChildren();

        const category = categorySelect
            ? categorySelect.value
            : "all";

        const sort = sortSelect
            ? sortSelect.value
            : "new";

        const filteredWorks = works
            .filter(function (work) {
                return category === "all" ||
                    work.category === category;
            })
            .sort(function (a, b) {
                return sort === "new"
                    ? b.year - a.year
                    : a.year - b.year;
            });

        filteredWorks.forEach(function (work) {

            const card = document.createElement("div");
            card.className = "portfolio-work";

            const image = document.createElement("img");
            image.src = "./media/" + work.image;
            image.alt = work.title;
            image.loading = "lazy";

            const title = document.createElement("h3");
            title.textContent = work.title;

            const description = document.createElement("p");
            description.textContent = work.description;

            const info = document.createElement("span");
            info.textContent = work.category + " / " + work.year;

            card.append(image, title, description, info);
            worksGrid.appendChild(card);
        });
    }

    if (categorySelect) {
        categorySelect.addEventListener("change", displayWorks);
    }

    if (sortSelect) {
        sortSelect.addEventListener("change", displayWorks);
    }


    // ==========================================
    // 2. 天気表示
    // ==========================================

    const weatherIcon = document.getElementById("weather-icon");
    const weatherText = document.getElementById("weather-text");

    if (weatherIcon && weatherText) {

        const latitude = 35.561;
        const longitude = 139.576;

        const weatherUrl =
            "https://api.open-meteo.com/v1/forecast" +
            "?latitude=" + latitude +
            "&longitude=" + longitude +
            "&current=temperature_2m,weather_code" +
            "&timezone=Asia%2FTokyo";

        fetch(weatherUrl)
            .then(function (response) {
                if (!response.ok) {
                    throw new Error("天気を取得できませんでした");
                }
                return response.json();
            })
            .then(function (data) {

                const code = data.current.weather_code;
                const temperature = data.current.temperature_2m;

                document.body.classList.remove(
                    "weather-sunny",
                    "weather-cloudy",
                    "weather-rainy",
                    "weather-other"
                );

                if (code === 0) {

                    weatherIcon.textContent = "☀️";
                    weatherText.textContent =
                        "晴れ / " + temperature + "℃";

                    document.body.classList.add("weather-sunny");

                } else if (code >= 1 && code <= 3) {

                    weatherIcon.textContent = "☁️";
                    weatherText.textContent =
                        "曇り / " + temperature + "℃";

                    document.body.classList.add("weather-cloudy");

                } else if (
                    (code >= 51 && code <= 67) ||
                    (code >= 80 && code <= 82)
                ) {

                    weatherIcon.textContent = "🌧️";
                    weatherText.textContent =
                        "雨 / " + temperature + "℃";

                    document.body.classList.add("weather-rainy");

                } else {

                    weatherIcon.textContent = "🌤️";
                    weatherText.textContent =
                        "現在 " + temperature + "℃";

                    document.body.classList.add("weather-other");
                }
            })
            .catch(function (error) {
                console.error(error);
                weatherText.textContent =
                    "天気情報を取得できませんでした";
            });
    }


    // ==========================================
    // 3. NEON ENERGY 背景
    // ==========================================

    const canvas = document.getElementById("background-canvas");

    if (!canvas) {
        console.warn("background-canvas が見つかりません");
        return;
    }

    const ctx = canvas.getContext("2d");

    if (!ctx) return;

    let width = 0;
    let height = 0;

    let particles = [];
    let sparks = [];
    let shockwaves = [];

    let frame = 0;

    const mouse = {
        x: -1000,
        y: -1000,
        active: false,
        lastX: -1000,
        lastY: -1000
    };


    // ==========================================
    // 4. セクション別のテーマカラー
    // ==========================================

    const themes = {

        top: [
            [255, 45, 70],
            [255, 45, 145]
        ],

        about: [
            [255, 190, 45],
            [255, 130, 35]
        ],

        marvel: [
            [35, 255, 105],
            [0, 215, 145]
        ],

        batman: [
            [255, 215, 0],
            [255, 245, 65]
        ],

        training: [
            [255, 55, 65],
            [255, 135, 35]
        ],

        works: [
            [35, 150, 255],
            [110, 80, 255]
        ]
    };

    let currentTheme = "top";

    let currentColors = themes.top.map(function (color) {
        return [...color];
    });

    let targetColors = themes.top.map(function (color) {
        return [...color];
    });


    // ==========================================
    // 5. 便利な関数
    // ==========================================

    function random(min, max) {
        return Math.random() * (max - min) + min;
    }

    function randomIndex(length) {
        return Math.floor(Math.random() * length);
    }

    function rgba(color, alpha) {
        return "rgba(" +
            Math.round(color[0]) + "," +
            Math.round(color[1]) + "," +
            Math.round(color[2]) + "," +
            Math.max(0, Math.min(1, alpha)) +
            ")";
    }

    function mixColor(a, b, amount) {
        return [
            a[0] + (b[0] - a[0]) * amount,
            a[1] + (b[1] - a[1]) * amount,
            a[2] + (b[2] - a[2]) * amount
        ];
    }

    function getThemeColor(index) {
        return currentColors[index % currentColors.length];
    }

    function changeTheme(themeName) {

        if (!themes[themeName]) return;

        if (currentTheme === themeName) return;

        currentTheme = themeName;

        targetColors = themes[themeName].map(function (color) {
            return [...color];
        });

        console.log("NEON THEME:", themeName);
    }

    function updateThemeColors() {

        for (let i = 0; i < currentColors.length; i++) {

            currentColors[i] = mixColor(
                currentColors[i],
                targetColors[i],
                0.045
            );
        }
    }


    // ==========================================
    // 6. スクロール位置から色を決める
    // ==========================================

    function getElementCenter(element) {

        const rect = element.getBoundingClientRect();

        return rect.top + rect.height / 2;
    }

    function getHobbyCards() {

        return Array.from(
            document.querySelectorAll(".hobby-card")
        );
    }

    function detectHobbyTheme(card) {

        const text = card.textContent.toUpperCase();

        if (
            text.includes("MARVEL") ||
            text.includes("AVENGERS") ||
            text.includes("アベンジャーズ")
        ) {
            return "marvel";
        }

        if (
            text.includes("BATMAN") ||
            text.includes("バットマン")
        ) {
            return "batman";
        }

        if (
            text.includes("TRAINING") ||
            text.includes("筋トレ")
        ) {
            return "training";
        }

        return null;
    }

    function detectThemeOnScroll() {

        const screenCenter = window.innerHeight * 0.5;

        const candidates = [];

        // TOP
        const topSection =
            document.getElementById("top") ||
            document.querySelector(".hero");

        if (topSection) {
            candidates.push({
                element: topSection,
                theme: "top"
            });
        }

        // ABOUT ME
        const aboutSection = document.getElementById("about");

        if (aboutSection) {
            candidates.push({
                element: aboutSection,
                theme: "about"
            });
        }

        // MARVEL / BATMAN / TRAINING
        const hobbyCards = getHobbyCards();

        hobbyCards.forEach(function (card) {

            const theme = detectHobbyTheme(card);

            if (theme) {
                candidates.push({
                    element: card,
                    theme: theme
                });
            }
        });

        // WORKS
        const worksSection = document.getElementById("works");

        if (worksSection) {
            candidates.push({
                element: worksSection,
                theme: "works"
            });
        }

        // 画面中央に最も近い要素を探す
        let nearestTheme = "top";
        let nearestDistance = Infinity;

        candidates.forEach(function (candidate) {

            const rect = candidate.element.getBoundingClientRect();

            // 画面に表示されていないものは除外
            if (
                rect.bottom < 0 ||
                rect.top > window.innerHeight
            ) {
                return;
            }

            const center = getElementCenter(candidate.element);

            const distance = Math.abs(center - screenCenter);

            if (distance < nearestDistance) {

                nearestDistance = distance;
                nearestTheme = candidate.theme;
            }
        });

        // 画面上に対象がないときは、
        // スクロール位置を使って補完
        if (nearestDistance === Infinity) {

            if (window.scrollY < 200) {
                nearestTheme = "top";
            } else {
                nearestTheme = currentTheme;
            }
        }

        changeTheme(nearestTheme);
    }

    window.addEventListener(
        "scroll",
        detectThemeOnScroll,
        { passive: true }
    );

    window.addEventListener(
        "resize",
        detectThemeOnScroll
    );


    // ==========================================
    // 7. キャンバスサイズ調整
    // ==========================================

    function resizeCanvas() {

        const dpr = Math.min(
            window.devicePixelRatio || 1,
            2
        );

        width = window.innerWidth;
        height = window.innerHeight;

        canvas.width = Math.round(width * dpr);
        canvas.height = Math.round(height * dpr);

        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

        particles = [];

        const count = Math.min(
            100,
            Math.max(
                45,
                Math.floor(width * height / 11000)
            )
        );

        for (let i = 0; i < count; i++) {

            particles.push({

                x: random(0, width),
                y: random(0, height),

                vx: random(-0.55, 0.55),
                vy: random(-0.55, 0.55),

                size: random(1.5, 4),

                colorIndex: randomIndex(2),

                pulse: random(0, Math.PI * 2)
            });
        }
    }


    // ==========================================
    // 8. 火花を発生させる
    // ==========================================

    function createSparks(x, y, amount, power) {

        for (let i = 0; i < amount; i++) {

            const angle = random(0, Math.PI * 2);
            const speed = random(1, power);

            sparks.push({

                x: x,
                y: y,

                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,

                size: random(2, 7),

                life: 1,

                colorIndex: randomIndex(2)
            });
        }

        if (sparks.length > 550) {
            sparks.splice(0, sparks.length - 550);
        }
    }


    // ==========================================
    // 9. 背景アニメーション
    // ==========================================

    function animate() {

        frame++;

        updateThemeColors();

        ctx.clearRect(0, 0, width, height);

        ctx.save();

        ctx.globalCompositeOperation = "lighter";

        const primaryColor = getThemeColor(0);
        const secondaryColor = getThemeColor(1);


        // --------------------------------------
        // マウス周辺の大きな光
        // --------------------------------------

        if (mouse.active) {

            const glow = ctx.createRadialGradient(
                mouse.x,
                mouse.y,
                0,
                mouse.x,
                mouse.y,
                220
            );

            glow.addColorStop(
                0,
                rgba(primaryColor, 0.42)
            );

            glow.addColorStop(
                0.4,
                rgba(secondaryColor, 0.17)
            );

            glow.addColorStop(
                1,
                rgba(primaryColor, 0)
            );

            ctx.fillStyle = glow;

            ctx.fillRect(
                0,
                0,
                width,
                height
            );


            // 1つ目のネオンリング
            const pulse = Math.sin(frame * 0.08) * 12;

            ctx.beginPath();

            ctx.arc(
                mouse.x,
                mouse.y,
                40 + pulse,
                0,
                Math.PI * 2
            );

            ctx.strokeStyle = rgba(primaryColor, 0.95);
            ctx.lineWidth = 3;
            ctx.stroke();


            // 2つ目のネオンリング
            ctx.beginPath();

            ctx.arc(
                mouse.x,
                mouse.y,
                70 + pulse,
                0,
                Math.PI * 2
            );

            ctx.strokeStyle = rgba(secondaryColor, 0.7);
            ctx.lineWidth = 2;
            ctx.stroke();


            // マウス中心
            ctx.beginPath();

            ctx.arc(
                mouse.x,
                mouse.y,
                6,
                0,
                Math.PI * 2
            );

            ctx.fillStyle = rgba(primaryColor, 1);
            ctx.fill();
        }


        // --------------------------------------
        // 背景の粒子
        // --------------------------------------

        for (let i = 0; i < particles.length; i++) {

            const p = particles[i];

            p.x += p.vx;
            p.y += p.vy;

            if (p.x < 0) p.x = width;
            if (p.x > width) p.x = 0;

            if (p.y < 0) p.y = height;
            if (p.y > height) p.y = 0;


            // マウスから粒子が逃げる
            if (mouse.active) {

                const dx = p.x - mouse.x;
                const dy = p.y - mouse.y;

                const distance = Math.hypot(dx, dy);

                if (distance < 160 && distance > 1) {

                    p.x += (dx / distance) * 2.8;
                    p.y += (dy / distance) * 2.8;
                }
            }

            const color = getThemeColor(p.colorIndex);

            const pulseSize =
                p.size +
                Math.sin(frame * 0.05 + p.pulse) * 0.8;


            // 粒子の発光
            ctx.beginPath();

            ctx.arc(
                p.x,
                p.y,
                Math.max(1, pulseSize * 5),
                0,
                Math.PI * 2
            );

            ctx.fillStyle = rgba(color, 0.12);
            ctx.fill();


            // 粒子本体
            ctx.beginPath();

            ctx.arc(
                p.x,
                p.y,
                Math.max(0.5, pulseSize),
                0,
                Math.PI * 2
            );

            ctx.fillStyle = rgba(color, 0.95);
            ctx.fill();


            // 粒子同士の接続線
            for (let j = i + 1; j < particles.length; j++) {

                const q = particles[j];

                const distance = Math.hypot(
                    p.x - q.x,
                    p.y - q.y
                );

                if (distance < 125) {

                    ctx.beginPath();

                    ctx.moveTo(p.x, p.y);
                    ctx.lineTo(q.x, q.y);

                    ctx.strokeStyle = rgba(
                        color,
                        (1 - distance / 125) * 0.35
                    );

                    ctx.lineWidth = 0.9;
                    ctx.stroke();
                }
            }
        }


        // --------------------------------------
        // マウスから飛び散る火花
        // --------------------------------------

        for (let i = sparks.length - 1; i >= 0; i--) {

            const s = sparks[i];

            s.x += s.vx;
            s.y += s.vy;

            s.vx *= 0.97;
            s.vy *= 0.97;

            s.life -= 0.023;
            s.size *= 0.99;

            const color = getThemeColor(s.colorIndex);


            // 火花の光
            ctx.beginPath();

            ctx.arc(
                s.x,
                s.y,
                s.size * 4,
                0,
                Math.PI * 2
            );

            ctx.fillStyle = rgba(
                color,
                s.life * 0.2
            );

            ctx.fill();


            // 火花本体
            ctx.beginPath();

            ctx.arc(
                s.x,
                s.y,
                s.size,
                0,
                Math.PI * 2
            );

            ctx.fillStyle = rgba(
                color,
                s.life
            );

            ctx.fill();


            if (s.life <= 0) {
                sparks.splice(i, 1);
            }
        }


        // --------------------------------------
        // クリック時の衝撃波
        // --------------------------------------

        for (let i = shockwaves.length - 1; i >= 0; i--) {

            const wave = shockwaves[i];

            wave.radius += 8;
            wave.life -= 0.022;

            const color = getThemeColor(wave.colorIndex);

            ctx.beginPath();

            ctx.arc(
                wave.x,
                wave.y,
                wave.radius,
                0,
                Math.PI * 2
            );

            ctx.strokeStyle = rgba(
                color,
                wave.life
            );

            ctx.lineWidth = 4;
            ctx.stroke();


            // 2重の衝撃波
            ctx.beginPath();

            ctx.arc(
                wave.x,
                wave.y,
                wave.radius * 0.72,
                0,
                Math.PI * 2
            );

            ctx.strokeStyle = rgba(
                color,
                wave.life * 0.35
            );

            ctx.lineWidth = 2;
            ctx.stroke();


            if (wave.life <= 0) {
                shockwaves.splice(i, 1);
            }
        }

        ctx.restore();

        requestAnimationFrame(animate);
    }


    // ==========================================
    // 10. マウスを動かしたとき
    // ==========================================

    window.addEventListener(
        "pointermove",
        function (event) {

            mouse.x = event.clientX;
            mouse.y = event.clientY;
            mouse.active = true;

            const distance = Math.hypot(
                mouse.x - mouse.lastX,
                mouse.y - mouse.lastY
            );

            if (distance > 3 && distance < 300) {

                const amount = Math.min(
                    14,
                    Math.max(5, Math.floor(distance / 3))
                );

                createSparks(
                    mouse.x,
                    mouse.y,
                    amount,
                    7
                );
            }

            mouse.lastX = mouse.x;
            mouse.lastY = mouse.y;
        }
    );


    // ==========================================
    // 11. クリックしたとき
    // ==========================================

    window.addEventListener(
        "pointerdown",
        function (event) {

            createSparks(
                event.clientX,
                event.clientY,
                70,
                12
            );

            shockwaves.push({

                x: event.clientX,
                y: event.clientY,

                radius: 10,
                life: 1,

                colorIndex: randomIndex(2)
            });

            if (shockwaves.length > 20) {
                shockwaves.shift();
            }
        }
    );


    // ==========================================
    // 12. マウスが画面から出たとき
    // ==========================================

    document.addEventListener(
        "pointerout",
        function (event) {

            if (!event.relatedTarget) {
                mouse.active = false;
            }
        }
    );


    // ==========================================
    // 13. 画面サイズが変わったとき
    // ==========================================

    window.addEventListener(
        "resize",
        function () {

            resizeCanvas();
            detectThemeOnScroll();
        }
    );


    // ==========================================
    // 14. アニメーション開始
    // ==========================================

    resizeCanvas();
    detectThemeOnScroll();
    animate();

});