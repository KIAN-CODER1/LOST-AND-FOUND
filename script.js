/* =========================================================
   UCB LOST & FOUND
   JAVASCRIPT
   Handles posts, search, filters, likes, comments,
   localStorage, modal, uploads, and statistics.
   ========================================================= */

const STORAGE_KEY = "ucbLostFoundPosts";

/* ---------- Demo Posts ---------- */

const demoPosts = [
  {
    id: 1,
    type: "found",
    reporter: "Alex Rivera",
    role: "Student",
    item: "Black Wallet",
    description:
      "Found a black wallet near the library entrance. It contains several cards. If you think it is yours, please describe one identifying detail when contacting the reporter.",
    location: "UCB Library Entrance",
    date: getToday(),
    media: "",
    mediaType: "",
    contact: "Alex Rivera",
    likes: 12,
    comments: [
      {
        name: "Maria",
        text: "I hope the owner sees this!"
      }
    ],
    recovered: false,
    createdAt: Date.now() - 1000 * 60 * 45
  },

  {
    id: 2,
    type: "lost",
    reporter: "Jamie Santos",
    role: "Student",
    item: "Blue Water Bottle",
    description:
      "I lost my blue insulated water bottle. It has a small sticker near the bottom. Last seen after class.",
    location: "Science Building",
    date: getToday(),
    media: "",
    mediaType: "",
    contact: "Jamie Santos",
    likes: 7,
    comments: [],
    recovered: false,
    createdAt: Date.now() - 1000 * 60 * 95
  },

  {
    id: 3,
    type: "found",
    reporter: "Campus Security",
    role: "Guard",
    item: "USB Flash Drive",
    description:
      "A USB flash drive was found on a classroom desk. The owner may claim it by identifying its color and approximate storage capacity.",
    location: "Computer Laboratory 2",
    date: getYesterday(),
    media: "",
    mediaType: "",
    contact: "Campus Security Office",
    likes: 18,
    comments: [
      {
        name: "Ken",
        text: "Shared with our class group."
      },
      {
        name: "Lara",
        text: "Thank you, Guard!"
      }
    ],
    recovered: true,
    createdAt: Date.now() - 1000 * 60 * 60 * 25
  }
];


/* ---------- Global Variables ---------- */

let posts = loadPosts();
let currentFilter = "all";
let searchTerm = "";


/* =========================================================
   INITIALIZATION
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {

  // Automatically set today's date in the report form.
  document.getElementById("date").value = getToday();

  // Display posts and statistics.
  renderPosts();
  updateStats();

  // Search functionality.
  document
    .getElementById("searchInput")
    .addEventListener("input", (event) => {

      searchTerm = event.target.value.trim().toLowerCase();

      renderPosts();
    });


  // File upload preview.
  document
    .getElementById("mediaInput")
    .addEventListener("change", previewMedia);


  // Report form submission.
  document
    .getElementById("reportForm")
    .addEventListener("submit", handleSubmit);

});


/* =========================================================
   LOCAL STORAGE
   ========================================================= */

function loadPosts() {

  try {

    const saved = localStorage.getItem(STORAGE_KEY);

    if (saved) {
      return JSON.parse(saved);
    }

    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(demoPosts)
    );

    return [...demoPosts];

  } catch (error) {

    console.error("Could not load saved posts:", error);

    return [...demoPosts];
  }
}


function savePosts() {

  try {

    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(posts)
    );

  } catch (error) {

    console.error("Could not save posts:", error);

    showToast(
      "Storage is full. Try using a smaller photo or video."
    );
  }
}


/* =========================================================
   DATE FUNCTIONS
   ========================================================= */

function getToday() {

  return new Date()
    .toISOString()
    .split("T")[0];
}


function getYesterday() {

  const date = new Date();

  date.setDate(date.getDate() - 1);

  return date
    .toISOString()
    .split("T")[0];
}


function formatDate(dateString) {

  const date = new Date(
    dateString + "T00:00:00"
  );

  return date.toLocaleDateString(
    "en-US",
    {
      month: "short",
      day: "numeric",
      year: "numeric"
    }
  );
}


function timeAgo(timestamp) {

  const seconds =
    Math.floor(
      (Date.now() - timestamp) / 1000
    );


  if (seconds < 60) {
    return "Just now";
  }


  const minutes =
    Math.floor(seconds / 60);


  if (minutes < 60) {
    return `${minutes}m ago`;
  }


  const hours =
    Math.floor(minutes / 60);


  if (hours < 24) {
    return `${hours}h ago`;
  }


  const days =
    Math.floor(hours / 24);

  return `${days}d ago`;
}


/* =========================================================
   RENDER POSTS
   ========================================================= */

function renderPosts() {

  const container =
    document.getElementById(
      "postsContainer"
    );


  let filtered = [...posts];


  /* ---------- Apply Filter ---------- */

  if (
    currentFilter === "lost" ||
    currentFilter === "found"
  ) {

    filtered =
      filtered.filter(
        post =>
          post.type === currentFilter
      );
  }


  if (currentFilter === "today") {

    filtered =
      filtered.filter(
        post =>
          post.date === getToday()
      );
  }


  /* ---------- Apply Search ---------- */

  if (searchTerm) {

    filtered =
      filtered.filter(post => {

        const searchable = [

          post.item,

          post.description,

          post.location,

          post.reporter,

          post.role,

          post.type

        ]
          .join(" ")
          .toLowerCase();


        return searchable.includes(
          searchTerm
        );

      });
  }


  /* ---------- Sort Newest First ---------- */

  filtered.sort(
    (a, b) =>
      b.createdAt - a.createdAt
  );


  /* ---------- Empty State ---------- */

  if (filtered.length === 0) {

    container.innerHTML = `

      <div class="card empty">

        <div class="empty-icon">
          🔎
        </div>

        <h3>
          No matching items found
        </h3>

        <p>
          Try another keyword or report
          a new lost/found item.
        </p>

      </div>

    `;

    return;
  }


  /* ---------- Display Posts ---------- */

  container.innerHTML =
    filtered
      .map(createPostHTML)
      .join("");
}


/* =========================================================
   CREATE POST HTML
   ========================================================= */

function createPostHTML(post) {

  const avatarLetter =
    escapeHTML(
      post.reporter
        .charAt(0)
        .toUpperCase()
    );


  const mediaHTML =
    createMediaHTML(post);


  const commentsHTML =
    (post.comments || [])
      .map(comment => `

        <div class="comment">

          <strong>
            ${escapeHTML(comment.name)}
          </strong>

          ${escapeHTML(comment.text)}

        </div>

      `)
      .join("");


  return `

    <article class="card post">

      <!-- POST HEADER -->

      <div class="post-header">

        <div class="avatar">
          ${avatarLetter}
        </div>


        <div class="post-info">

          <strong>
            ${escapeHTML(post.reporter)}
          </strong>

          <div class="post-meta">

            ${escapeHTML(post.role)}

            ·

            ${timeAgo(post.createdAt)}

          </div>

        </div>


        <button
          class="more-btn"
          title="Post options"
          onclick="showPostOptions(${post.id})"
        >
          ⋯
        </button>

      </div>


      <!-- POST CONTENT -->

      <div class="post-body">

        <div
          class="status-badge
          ${
            post.type === "found"
              ? "status-found"
              : "status-lost"
          }"
        >

          ${
            post.type === "found"
              ? "🟢 Found"
              : "🔴 Lost"
          }

        </div>


        <div class="post-text">

          <strong>
            ${escapeHTML(post.item)}
          </strong>

          <br />

          ${escapeHTML(post.description)}

        </div>

      </div>


      <!-- IMAGE OR VIDEO -->

      <div class="post-media">

        ${mediaHTML}

      </div>


      <!-- ITEM INFORMATION -->

      <div class="post-details">

        <div class="detail-grid">

          <div class="detail">

            📍

            <b>
              Location:
            </b>

            ${escapeHTML(post.location)}

          </div>


          <div class="detail">

            📅

            <b>
              Date:
            </b>

            ${formatDate(post.date)}

          </div>


          <div class="detail">

            👤

            <b>
              Reporter:
            </b>

            ${escapeHTML(post.role)}

          </div>


          <div class="detail">

            ${
              post.recovered
                ? "🎉"
                : "📌"
            }

            <b>
              Status:
            </b>

            ${
              post.recovered
                ? "Recovered"
                : "Active"
            }

          </div>

        </div>

      </div>


      <!-- POST STATISTICS -->

      <div class="post-stats">

        <span>
          👍 ${post.likes || 0} reactions
        </span>

        <span>
          ${(post.comments || []).length}
          comments
        </span>

      </div>


      <!-- POST ACTIONS -->

      <div class="post-actions">

        <button
          id="like-${post.id}"
          onclick="likePost(${post.id})"
        >
          👍 Like
        </button>


        <button
          onclick="toggleComments(${post.id})"
        >
          💬 Comment
        </button>


        <button
          onclick="sharePost(${post.id})"
        >
          ↗ Share
        </button>

      </div>


      <!-- COMMENTS -->

      <div
        class="comments"
        id="comments-${post.id}"
      >

        <div
          id="comment-list-${post.id}"
        >

          ${commentsHTML}

        </div>


        <form
          class="comment-form"
          onsubmit="
            addComment(
              event,
              ${post.id}
            )
          "
        >

          <input
            id="comment-input-${post.id}"
            type="text"
            maxlength="150"
            placeholder="Write a comment..."
          />


          <button type="submit">
            ➤
          </button>

        </form>

      </div>

    </article>

  `;
}


/* =========================================================
   MEDIA DISPLAY
   ========================================================= */

function createMediaHTML(post) {

  if (!post.media) {

    return `

      <div class="no-media">

        📦 No photo or video attached

      </div>

    `;
  }


  if (post.mediaType === "video") {

    return `

      <video
        controls
        preload="metadata"
      >

        <source
          src="${post.media}"
        />

        Your browser does not
        support video playback.

      </video>

    `;
  }


  return `

    <img
      src="${post.media}"
      alt="${escapeHTML(post.item)}"
      loading="lazy"
    />

  `;
}


/* =========================================================
   FILTER FUNCTIONS
   ========================================================= */

function filterPosts(filter, button) {

  currentFilter = filter;


  // Remove active state from filter buttons.
  document
    .querySelectorAll(".filter-btn")
    .forEach(btn => {

      btn.classList.remove(
        "active"
      );

    });


  // Remove active state from sidebar buttons.
  document
    .querySelectorAll(".side-link")
    .forEach(btn => {

      btn.classList.remove(
        "active"
      );

    });


  // Activate clicked button.
  if (button) {

    button.classList.add(
      "active"
    );
  }


  // Activate All button when needed.
  if (filter === "all") {

    document
      .querySelectorAll(".filter-btn")[0]
      .classList.add("active");
  }


  renderPosts();
}


/* =========================================================
   MODAL
   ========================================================= */

function openModal(type = "found") {

  document
    .getElementById("reportModal")
    .classList.add("show");


  document.body.style.overflow =
    "hidden";


  document.getElementById(
    "reportType"
  ).value = type;
}


function closeModal() {

  document
    .getElementById("reportModal")
    .classList.remove("show");


  document.body.style.overflow = "";


  document
    .getElementById("reportForm")
    .reset();


  document.getElementById(
    "date"
  ).value = getToday();


  const preview =
    document.getElementById(
      "mediaPreview"
    );


  preview.innerHTML = "";

  preview.style.display =
    "none";
}


/* ---------- Close Modal When Clicking Outside ---------- */

document
  .getElementById("reportModal")
  .addEventListener(
    "click",
    event => {

      if (
        event.target.id ===
        "reportModal"
      ) {

        closeModal();
      }

    }
  );


/* ---------- Close With Escape Key ---------- */

document.addEventListener(
  "keydown",
  event => {

    if (event.key === "Escape") {
      closeModal();
    }

  }
);


/* =========================================================
   MEDIA PREVIEW
   ========================================================= */

function previewMedia(event) {

  const file =
    event.target.files[0];


  const preview =
    document.getElementById(
      "mediaPreview"
    );


  preview.innerHTML = "";


  if (!file) {

    preview.style.display =
      "none";

    return;
  }


  /*
    Front-end validation:

    - Only images/videos.
    - Maximum 25 MB.

    This is suitable for this prototype.
  */

  const allowed =
    file.type.startsWith("image/") ||
    file.type.startsWith("video/");


  const maxSize =
    25 * 1024 * 1024;


  if (!allowed) {

    event.target.value = "";

    showToast(
      "Please choose an image or video file."
    );

    return;
  }


  if (file.size > maxSize) {

    event.target.value = "";

    showToast(
      "File is too large. Maximum size is 25 MB."
    );

    return;
  }


  const url =
    URL.createObjectURL(file);


  /* ---------- Video Preview ---------- */

  if (
    file.type.startsWith("video/")
  ) {

    preview.innerHTML = `

      <video controls>

        <source
          src="${url}"
          type="${file.type}"
        />

      </video>

    `;

  }

  /* ---------- Image Preview ---------- */

  else {

    preview.innerHTML = `

      <img
        src="${url}"
        alt="Selected item preview"
      />

    `;
  }


  preview.style.display =
    "block";
}


/* =========================================================
   CREATE NEW POST
   ========================================================= */

async function handleSubmit(event) {

  event.preventDefault();


  /* ---------- Get Form Values ---------- */

  const type =
    document.getElementById(
      "reportType"
    ).value;


  const reporter =
    document.getElementById(
      "reporterName"
    ).value.trim();


  const role =
    document.getElementById(
      "reporterRole"
    ).value;


  const item =
    document.getElementById(
      "itemName"
    ).value.trim();


  const description =
    document.getElementById(
      "description"
    ).value.trim();


  const location =
    document.getElementById(
      "location"
    ).value.trim();


  const date =
    document.getElementById(
      "date"
    ).value;


  const contact =
    document.getElementById(
      "contact"
    ).value.trim();


  const file =
    document.getElementById(
      "mediaInput"
    ).files[0];


  /* ---------- Validate Required Fields ---------- */

  if (
    !reporter ||
    !item ||
    !description ||
    !location ||
    !date
  ) {

    showToast(
      "Please complete all required fields."
    );

    return;
  }


  /* ---------- Prepare Media ---------- */

  let media = "";

  let mediaType = "";


  if (file) {

    const allowed =
      file.type.startsWith("image/") ||
      file.type.startsWith("video/");


    const maxSize =
      25 * 1024 * 1024;


    if (!allowed) {

      showToast(
        "Only image and video files are allowed."
      );

      return;
    }


    if (file.size > maxSize) {

      showToast(
        "File is too large. Maximum size is 25 MB."
      );

      return;
    }


    try {

      media =
        await fileToDataURL(file);


      mediaType =
        file.type.startsWith("video/")
          ? "video"
          : "image";

    } catch (error) {

      showToast(
        "The selected file could not be loaded."
      );

      return;
    }
  }


  /* ---------- Create Post Object ---------- */

  const newPost = {

    id: Date.now(),

    type,

    reporter,

    role,

    item,

    description,

    location,

    date,

    media,

    mediaType,

    contact,

    likes: 0,

    comments: [],

    recovered: false,

    createdAt: Date.now()

  };


  /* ---------- Add Post ---------- */

  posts.push(newPost);


  savePosts();

  updateStats();

  renderPosts();


  /* ---------- Close Form ---------- */

  closeModal();


  showToast(
    "Your report has been published!"
  );


  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });
}


/* =========================================================
   FILE TO DATA URL
   ========================================================= */

function fileToDataURL(file) {

  return new Promise(
    (resolve, reject) => {

      const reader =
        new FileReader();


      reader.onload = () => {

        resolve(
          reader.result
        );

      };


      reader.onerror = reject;


      reader.readAsDataURL(file);

    }
  );
}


/* =========================================================
   LIKE POST
   ========================================================= */

function likePost(id) {

  const post =
    posts.find(
      post => post.id === id
    );


  if (!post) {
    return;
  }


  const likeButton =
    document.getElementById(
      `like-${id}`
    );


  if (
    likeButton.classList.contains(
      "liked"
    )
  ) {

    post.likes =
      Math.max(
        0,
        (post.likes || 0) - 1
      );


    likeButton.classList.remove(
      "liked"
    );

  }

  else {

    post.likes =
      (post.likes || 0) + 1;


    likeButton.classList.add(
      "liked"
    );
  }


  savePosts();

  renderPosts();
}


/* =========================================================
   COMMENTS
   ========================================================= */

function toggleComments(id) {

  const comments =
    document.getElementById(
      `comments-${id}`
    );


  comments.classList.toggle(
    "show"
  );
}


function addComment(event, id) {

  event.preventDefault();


  const input =
    document.getElementById(
      `comment-input-${id}`
    );


  const text =
    input.value.trim();


  if (!text) {
    return;
  }


  const post =
    posts.find(
      post => post.id === id
    );


  if (!post) {
    return;
  }


  if (!post.comments) {

    post.comments = [];
  }


  post.comments.push({

    name: "UCB Community",

    text: text

  });


  savePosts();

  renderPosts();


  // Open comments again after re-render.
  setTimeout(() => {

    const comments =
      document.getElementById(
        `comments-${id}`
      );


    if (comments) {

      comments.classList.add(
        "show"
      );
    }

  }, 0);
}


/* =========================================================
   SHARE POST
   ========================================================= */

async function sharePost(id) {

  const post =
    posts.find(
      post => post.id === id
    );


  if (!post) {
    return;
  }


  const shareText =

    `UCB Lost & Found: ` +
    `${post.type.toUpperCase()} - ` +
    `${post.item} at ` +
    `${post.location}.`;


  /* ---------- Native Share ---------- */

  if (navigator.share) {

    try {

      await navigator.share({

        title:
          "UCB Lost & Found",

        text:
          shareText

      });


      return;

    } catch (error) {

      // User cancelled sharing.
    }
  }


  /* ---------- Copy To Clipboard ---------- */

  try {

    await navigator.clipboard
      .writeText(shareText);


    showToast(
      "Post information copied!"
    );

  } catch (error) {

    showToast(
      shareText
    );
  }
}


/* =========================================================
   POST OPTIONS
   ========================================================= */

function showPostOptions(id) {

  const post =
    posts.find(
      post => post.id === id
    );


  if (!post) {
    return;
  }


  const action =
    confirm(

      `Item: ${post.item}\n\n` +

      `Press OK to mark this item ` +
      `as recovered.\n\n` +

      `Press Cancel to close.`

    );


  if (action) {

    post.recovered = true;


    savePosts();

    updateStats();

    renderPosts();


    showToast(
      "Item marked as recovered!"
    );
  }
}


/* =========================================================
   STATISTICS
   ========================================================= */

function updateStats() {

  const total =
    posts.length;


  const lost =
    posts.filter(
      post =>
        post.type === "lost"
    ).length;


  const found =
    posts.filter(
      post =>
        post.type === "found"
    ).length;


  const recovered =
    posts.filter(
      post =>
        post.recovered
    ).length;


  document.getElementById(
    "totalStat"
  ).textContent = total;


  document.getElementById(
    "lostStat"
  ).textContent = lost;


  document.getElementById(
    "foundStat"
  ).textContent = found;


  document.getElementById(
    "recoveredStat"
  ).textContent = recovered;
}


/* =========================================================
   TOAST MESSAGE
   ========================================================= */

let toastTimer;


function showToast(message) {

  const toast =
    document.getElementById(
      "toast"
    );


  toast.textContent =
    message;


  toast.classList.add(
    "show"
  );


  clearTimeout(
    toastTimer
  );


  toastTimer =
    setTimeout(() => {

      toast.classList.remove(
        "show"
      );

    }, 2800);
}


/* =========================================================
   HTML ESCAPING
   Prevents user-entered text from being interpreted
   as HTML when posts are displayed.
   ========================================================= */

function escapeHTML(value) {

  return String(
    value ?? ""
  )

    .replace(
      /&/g,
      "&amp;"
    )

    .replace(
      /</g,
      "&lt;"
    )

    .replace(
      />/g,
      "&gt;"
    )

    .replace(
      /"/g,
      "&quot;"
    )

    .replace(
      /'/g,
      "&#039;"
    );
}