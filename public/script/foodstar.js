document.addEventListener("DOMContentLoaded", () => {
    const reviewForm = document.getElementById("reviewForm");
    const restaurantName = document.getElementById("restaurantName");
    const reviewText = document.getElementById("reviewText");
    const ratingInput = document.getElementById("rating");
    const reviewList = document.getElementById("reviewList");
    const stars = document.querySelectorAll(".star-rating .star");

    // 페이지 로드 시 모든 리뷰 불러오기
    loadAllReviews();

    // 별점 클릭 이벤트 설정
    stars.forEach(star => {
        star.addEventListener("click", () => {
            const rating = star.getAttribute("data-value");
            ratingInput.value = rating;
            updateStarSelection(rating);
        });
    });

    // 리뷰 폼 제출 이벤트
    reviewForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        const restaurant = restaurantName.value.trim();
        const text = reviewText.value.trim();
        const rating = ratingInput.value;

        if (rating === "0") {
            alert("별점을 선택해 주세요!");
            return;
        }

        const review = {
            restaurant,
            review: text,
            rating
        };

        // 서버에 데이터 전송
        const response = await fetch('/save-review', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(review)
        });

        if (response.ok) {
            alert('리뷰가 성공적으로 저장되었습니다!');
            displayReview(review);
            reviewForm.reset();
            updateStarSelection(0);
        } else {
            alert('리뷰 저장에 실패했습니다.');
        }
    });

    // 별점 선택 상태 업데이트
    function updateStarSelection(rating) {
        stars.forEach(star => {
            star.classList.toggle("selected", star.getAttribute("data-value") <= rating);
        });
    }

    // 모든 리뷰를 서버에서 불러오는 함수
    async function loadAllReviews() {
        const response = await fetch('/get-all-reviews');
        const reviews = await response.json();
        reviewList.innerHTML = ''; // 기존 리뷰 지우기
        reviews.forEach(review => displayReview(review));
    }

    // 리뷰를 화면에 표시
    function displayReview(review) {
        const li = document.createElement("li");
        li.innerHTML = `
            <strong>${review.restaurant}</strong><br> 
            <span class="review-text">${review.review}</span>
            <div class="review-rating">${'★'.repeat(review.rating)}${'☆'.repeat(5 - review.rating)}</div>
        `;
        reviewList.appendChild(li);
    }
});
