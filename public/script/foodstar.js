document.addEventListener("DOMContentLoaded", () => {
    const reviewForm = document.getElementById("reviewForm");
    const restaurantName = document.getElementById("restaurantName");
    const reviewText = document.getElementById("reviewText");
    const ratingInput = document.getElementById("rating");
    const reviewList = document.getElementById("reviewList");
    const stars = document.querySelectorAll(".star-rating .star");
    const passwordModal = document.getElementById("passwordModal");
    const passwordInput = document.getElementById("passwordInput");
    const confirmPasswordBtn = document.getElementById("confirmPasswordBtn");
    const cancelPasswordBtn = document.getElementById("cancelPasswordBtn");

    let currentAction = null;

    loadAllReviews();

    stars.forEach(star => {
        star.addEventListener("click", () => {
            const rating = star.getAttribute("data-value");
            ratingInput.value = rating;
            updateStarSelection(rating);
        });
    });

    reviewForm.addEventListener("submit", (e) => {
        e.preventDefault();
        currentAction = "add";
        openPasswordModal();
    });

    confirmPasswordBtn.addEventListener("click", async () => {
        const password = passwordInput.value;
        if (currentAction === "add") {
            await addReview(password);
        } else if (currentAction.action === "delete") {
            await deleteReview(currentAction.review, currentAction.reviewElement, password);
        }
        closePasswordModal();
    });

    cancelPasswordBtn.addEventListener("click", closePasswordModal);

    function openPasswordModal() {
        passwordModal.style.display = "flex";
    }

    function closePasswordModal() {
        passwordInput.value = '';
        passwordModal.style.display = "none";
    }

    function updateStarSelection(rating) {
        stars.forEach(star => {
            star.classList.toggle("selected", star.getAttribute("data-value") <= rating);
        });
    }

    async function loadAllReviews() {
        const response = await fetch('/get-all-reviews');
        const reviews = await response.json();
        reviewList.innerHTML = '';
        reviews.forEach(review => displayReview(review));
    }

    function displayReview(review) {
        const li = document.createElement("li");
        li.classList.add("review-item"); // 추가된 클래스명
    
        li.innerHTML = `
            <div class="review-content">
                <div>
                    <strong class="restaurant-name">${review.restaurant}</strong><br>
                    <span class="review-text">${review.review}</span>
                </div>
                <div class="review-rating">${'★'.repeat(review.rating)}${'☆'.repeat(5 - review.rating)}</div>
            </div>
        `;
    
        // 삭제 버튼 추가
        const deleteButton = document.createElement("button");
        deleteButton.textContent = "삭제";
        deleteButton.classList.add("delete-btn"); // 삭제 버튼에 클래스 추가
        deleteButton.addEventListener("click", () => {
            currentAction = { action: "delete", review, reviewElement: li };
            openPasswordModal();
        });
    
        li.appendChild(deleteButton);
        reviewList.appendChild(li);
    }

    async function addReview(password) {
        const restaurant = restaurantName.value.trim();
        const text = reviewText.value.trim();
        const rating = ratingInput.value;

        if (rating === "0") {
            alert("별점을 선택해 주세요!");
            return;
        }

        const review = { restaurant, review: text, rating };

        const response = await fetch('/save-review', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ password, ...review })
        });

        if (response.ok) {
            alert('리뷰가 성공적으로 저장되었습니다!');
            displayReview(review);
            reviewForm.reset();
            updateStarSelection(0);
        } else {
            alert('리뷰 저장에 실패했습니다.');
        }
    }

    async function deleteReview(review, reviewElement, password) {
        const response = await fetch('/delete-review', {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ password, restaurant: review.restaurant, reviewText: review.review })
        });

        if (response.ok) {
            alert('리뷰가 성공적으로 삭제되었습니다.');
            reviewElement.remove();
        } else {
            alert('리뷰 삭제에 실패했습니다.');
        }
    }
});
