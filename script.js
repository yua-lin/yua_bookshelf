document.addEventListener('DOMContentLoaded', () => {
    // --- STATE ---
    // This will hold all our book data once fetched
    let libraryData = null;
    // This will track which book and chapter we are currently viewing
    let currentBookId = 1;
    let currentChapterId = 1;

    // --- DOM ELEMENTS ---
    const bookCoverEl = document.getElementById('book-cover');
    const bookTitleEl = document.getElementById('book-title');
    const bookAuthorEl = document.getElementById('book-author');
    const chapterListEl = document.getElementById('chapter-list');
    const chapterTitleEl = document.getElementById('chapter-title');
    const chapterTextEl = document.getElementById('chapter-text');
    const likeBtn = document.getElementById('like-btn');
    const likeCountEl = document.getElementById('like-count');
    const commentsListEl = document.getElementById('comments-list');
    const commentForm = document.getElementById('comment-form');
    const shareTwitter = document.getElementById('share-twitter');
    const shareFacebook = document.getElementById('share-facebook');


    // --- FUNCTIONS ---

    // 1. Fetch data from the JSON file
    async function fetchData() {
        try {
            const response = await fetch('data.json');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            libraryData = await response.json();
            // Once data is loaded, render the initial view
            renderBook(currentBookId, currentChapterId);
        } catch (error) {
            console.error("Could not fetch library data:", error);
            chapterTextEl.innerHTML = "<p>Sorry, we couldn't load the book. Please try refreshing the page.</p>";
        }
    }

    // 2. Render the book and a specific chapter
    function renderBook(bookId, chapterId) {
        const book = libraryData.books.find(b => b.id === bookId);
        if (!book) return;

        const chapter = book.chapters.find(c => c.id === chapterId);
        if (!chapter) return;

        // Update current state
        currentBookId = bookId;
        currentChapterId = chapterId;

        // --- Update Sidebar ---
        bookCoverEl.src = book.cover;
        bookTitleEl.textContent = book.title;
        bookAuthorEl.textContent = `by ${book.author}`;

        // --- Update Chapter Navigation ---
        chapterListEl.innerHTML = ''; // Clear old list
        book.chapters.forEach(chap => {
            const li = document.createElement('li');
            const a = document.createElement('a');
            a.href = '#';
            a.textContent = chap.title;
            a.dataset.chapterId = chap.id; // Store chapter id
            if (chap.id === chapterId) {
                a.classList.add('active'); // Highlight current chapter
            }
            li.appendChild(a);
            chapterListEl.appendChild(li);
        });

        // --- Update Main Content ---
        chapterTitleEl.textContent = chapter.title;
        chapterTextEl.innerHTML = chapter.content;

        // --- Update Interaction Bar ---
        likeCountEl.textContent = chapter.likes;
        likeBtn.classList.remove('liked'); // Reset like button style

        // --- Update Comments ---
        renderComments(chapter.comments);
        
        // --- Update Share Links ---
        updateShareLinks(book.title, chapter.title);
    }
    
    // 3. Render the comments for the current chapter
    function renderComments(comments) {
        commentsListEl.innerHTML = ''; // Clear old comments
        if (!comments || comments.length === 0) {
            commentsListEl.innerHTML = '<p>No comments yet. Be the first!</p>';
            return;
        }
        
        comments.forEach(comment => {
            const commentDiv = document.createElement('div');
            commentDiv.className = 'comment';
            commentDiv.innerHTML = `<p class="comment-user">${comment.user}</p><p>${comment.text}</p>`;
            commentsListEl.appendChild(commentDiv);
        });
    }

    // 4. Update share links
    function updateShareLinks(bookTitle, chapterTitle) {
        const url = window.location.href;
        const text = `I'm reading "${chapterTitle}" from the book "${bookTitle}"! Check it out:`;
        shareTwitter.href = `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`;
        shareFacebook.href = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
    }

    // --- EVENT LISTENERS ---

    // Chapter navigation click
    chapterListEl.addEventListener('click', (e) => {
        e.preventDefault();
        if (e.target.tagName === 'A') {
            const chapterId = parseInt(e.target.dataset.chapterId);
            renderBook(currentBookId, chapterId);
        }
    });

    // Like button click
    likeBtn.addEventListener('click', () => {
        // This is a temporary visual-only like
        const currentLikes = parseInt(likeCountEl.textContent);
        if (likeBtn.classList.contains('liked')) {
            // "Unlike"
            likeCountEl.textContent = currentLikes - 1;
            likeBtn.classList.remove('liked');
        } else {
            // "Like"
            likeCountEl.textContent = currentLikes + 1;
            likeBtn.classList.add('liked');
        }
        // NOTE: This change will be lost on page refresh.
    });

    // Comment form submission
    commentForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const userName = document.getElementById('comment-user').value;
        const commentText = document.getElementById('comment-text').value;

        // Create a new comment element and add it to the top of the list
        const newComment = { user: userName, text: commentText };
        
        // This visually adds the comment, but won't save it
        const commentDiv = document.createElement('div');
        commentDiv.className = 'comment';
        commentDiv.innerHTML = `<p class="comment-user">${newComment.user}</p><p>${newComment.text}</p>`;
        
        // If it's the first comment, remove the "No comments yet" message
        if (commentsListEl.querySelector('p')) {
            commentsListEl.innerHTML = '';
        }

        commentsListEl.prepend(commentDiv);

        // Clear the form
        commentForm.reset();
        
        // NOTE: This new comment will disappear on page refresh.
    });


    // --- INITIALIZATION ---
    fetchData();

});
