const images = [
    "bihar1.jpg",
    "bihar2.jpg",
    "bihar3.jpg",
    "bihar4.jpg"
];

let index = 0;
const hero = document.querySelector(".hero");

function changesBackground() {
    if (!hero) return;

    hero.style.backgroundImage =
        `url("${images[index]}")`;

    index = (index + 1) % images.length;
}

changesBackground();
setInterval(changesBackground, 1000);


const aboutBtn = document.getElementById("aboutBtn");
const aboutContent = document.getElementById("aboutMore");

if (aboutBtn && aboutContent) {
    let expanded = false;

    aboutBtn.addEventListener("click", function () {
        expanded = !expanded;

        aboutContent.classList.toggle("show", expanded);

        aboutBtn.textContent = expanded
            ? "Read Less ▲"
            : "Read More +";

        aboutBtn.setAttribute("aria-expanded", expanded);
    });
    
}

const culture = {
   
   bodh: {
        title: "Culture of Bodh Gaya",
        food: "Traditional Bihari dishes such as litti chokha and sattu.",
        clothes: "Traditional Bihari sarees and regional clothing.",
        festivals: "Buddha Jayanti and religious celebrations.",
        famous: "Mahabodhi Temple and the Great Buddha Statue."
    },

    nalanda: {
        title: "Culture of Nalanda",
        food: "Traditional Bihari food, including litti chokha and khaja.",
        clothes: "Traditional Bihari clothing and regional handloom.",
        festivals: "Local festivals and Buddhist cultural events.",
        famous: "Ancient Nalanda Mahavihara."
    },

    rajgir: {
        title: "Culture of Rajgir",
        food: "Bihari cuisine and regional sweets.",
        clothes: "Traditional sarees, dhotis and local clothing.",
        festivals: "Rajgir Mahotsav and religious celebrations.",
        famous: "Vishwa Shanti Stupa and historic hills."
    },

    vaishali: {
        title: "Culture of Vaishali",
        food: "Traditional Bihari dishes and local sweets.",
        clothes: "Regional traditional clothing and sarees.",
        festivals: "Buddhist and Jain religious celebrations.",
        famous: "Ashokan Pillar and ancient historical sites."
    },

    patna: {
        title: "Culture of Patna",
        food: "Litti chokha, khaja, thekua and other Bihari dishes.",
        clothes: "Traditional sarees, Bhagalpuri silk and regional attire.",
        festivals: "Chhath Puja, Sonepur Mela and other celebrations.",
        famous: "Golghar, Patna Sahib and Bihar Museum."
    },

    valmiki: {
        title: "Culture of Valmiki Nagar",
        food: "Regional Bihari cuisine and local traditional dishes.",
        clothes: "Traditional clothing and regional attire.",
        festivals: "Local festivals and community celebrations.",
        famous: "Valmiki Tiger Reserve, forests and natural scenery."
    }
};

function showCulture(place) {
    const data = culture[place];

    if (!data) {
        alert("Culture information is not available!");
        return;
    }

    document.getElementById("place-title").textContent = data.title;
    document.getElementById("place-about").textContent =
        "Explore the culture and traditions of " + place + ".";

    document.getElementById("culture-info").textContent =
        "Culture: " + data.title;

    document.getElementById("clothes").textContent = data.clothes;
    document.getElementById("food").textContent = data.food;
    document.getElementById("festivals").textContent = data.festivals;
    document.getElementById("places").textContent = data.famous;

    document.getElementById("culture-details").hidden = false;

    document.getElementById("culture-details").scrollIntoView({
        behavior: "smooth"
    });
}


// ===== CONTACT FORM BACKEND =====

const contactForm = document.getElementById("contactForm");

if (contactForm) {

    contactForm.addEventListener("submit", async function(e) {

        e.preventDefault();

        const name = document.getElementById("contactName").value;
        const email = document.getElementById("contactEmail").value;
        const subject = document.getElementById("contactSubject").value;
        const message = document.getElementById("contactMessage").value;

        try {

            const response = await fetch(
                "http:/api/contact",
                {
                    method: "POST",

                    headers: {
                        "Content-Type": "application/json"
                    },

                    body: JSON.stringify({
                        name,
                        email,
                        subject,
                        message
                    })
                }
            );

            const result = await response.json();

            alert(result.message);

            if (result.success) {
                contactForm.reset();
            }

        } catch (error) {

            alert("Backend connection failed!");

            console.error(error);
        }

    });

}