let stories = [];
let currentIndex = 0;
let autoPlayTimer = null;

const storyBar = document.getElementById("storyBar");
const storyViewer = document.getElementById("storyViewer");
const storyImage = document.getElementById("storyImage");
const storyArea = document.getElementById("storyArea");
const closeBtn = document.getElementById("closeBtn");
const loadingIndicator = document.getElementById("loadingIndicator");

const prevBtn = document.getElementById("prevBtn");
const nextBtn = document.getElementById("nextBtn");

// Swipe variables
let touchStartX = 0;
let touchEndX = 0;

async function fetchStories() {
  try {
    const res = await fetch("stories.json");
    if (!res.ok) throw new Error("Failed to load stories");
    stories = await res.json();

    if (stories.length === 0) {
      storyBar.textContent = "No stories available.";
      return;
    }

    storyBar.textContent = "";
    displayStoryThumbnails();
  } catch (e) {
    storyBar.textContent = "Error loading stories.";
    console.error(e);
  }
}

function displayStoryThumbnails() {
  stories.forEach((story, index) => {
    const img = document.createElement("img");
    img.src = story.url;
    img.alt = `Story ${index + 1}`;
    img.addEventListener("click", () => {
      openStory(index);
    });
    storyBar.appendChild(img);
  });
}

function highlightActiveThumbnail() {
  Array.from(storyBar.children).forEach((img, i) => {
    img.classList.toggle("active", i === currentIndex);
  });
}

function showStory() {
  loadingIndicator.classList.remove("hidden");
  storyImage.style.opacity = 0;

  storyImage.onload = () => {
    loadingIndicator.classList.add("hidden");
    storyImage.style.opacity = 1;
    highlightActiveThumbnail();
  };

  storyImage.src = stories[currentIndex].url;
}

function openStory(index) {
  currentIndex = index;
  storyViewer.classList.remove("hidden");
  showStory();
  startAutoPlay();
}

function startAutoPlay() {
  clearInterval(autoPlayTimer);
  autoPlayTimer = setInterval(() => {
    nextStory();
  }, 5000);
}

function nextStory() {
  if (currentIndex < stories.length - 1) {
    currentIndex++;
    showStory();
    startAutoPlay();
  } else {
    closeViewer();
  }
}

function prevStory() {
  if (currentIndex > 0) {
    currentIndex--;
    showStory();
    startAutoPlay();
  }
}

function closeViewer() {
  storyViewer.classList.add("hidden");
  clearInterval(autoPlayTimer);
}

// Tap left/right half navigation (ignore clicks on arrows or close)
storyArea.addEventListener("click", (e) => {
  if (e.target === prevBtn || e.target === nextBtn || e.target === closeBtn) return;

  const x = e.clientX;
  const width = window.innerWidth;

  if (x < width / 2) {
    prevStory();
  } else {
    nextStory();
  }
});

// Arrow buttons handlers
prevBtn.addEventListener("click", (e) => {
  e.stopPropagation();
  prevStory();
});

nextBtn.addEventListener("click", (e) => {
  e.stopPropagation();
  nextStory();
});

// Close button handler
closeBtn.addEventListener("click", (e) => {
  e.stopPropagation();
  closeViewer();
});

// Swipe gesture handlers
storyArea.addEventListener("touchstart", (e) => {
  touchStartX = e.changedTouches[0].screenX;
});

storyArea.addEventListener("touchend", (e) => {
  touchEndX = e.changedTouches[0].screenX;
  handleGesture();
});

function handleGesture() {
  const threshold = 50;
  if (touchEndX < touchStartX - threshold) {
    nextStory();
  }
  if (touchEndX > touchStartX + threshold) {
    prevStory();
  }
}

window.addEventListener("load", fetchStories);
