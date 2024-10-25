const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 8000;

// body-parser 설정
app.use(bodyParser.json());

// 정적 파일 제공 (HTML, CSS, JS)
app.use(express.static(path.join(__dirname, 'public')));

// 메인 페이지 제공 (foodstar.html)
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'foodstar.html'));
});

// 리뷰 저장 경로
const reviewFolder = path.join(__dirname, 'reviews');

// 리뷰 저장 폴더가 존재하지 않으면 생성
if (!fs.existsSync(reviewFolder)) {
    fs.mkdirSync(reviewFolder);
}

// 리뷰 저장 엔드포인트 (한국어 식당 이름 지원)
app.post('/save-review', (req, res) => {
    const { restaurant, review, rating } = req.body;

    if (!restaurant || !review || !rating) {
        return res.status(400).json({ message: '모든 필드를 입력해 주세요.' });
    }

    // 파일 이름을 URL-safe 형식으로 설정 (한국어 지원)
    const fileName = `${encodeURIComponent(restaurant)}.json`;
    const filePath = path.join(reviewFolder, fileName);

    // 기존 파일이 존재하면 로드하고, 없으면 빈 배열로 초기화
    let reviews = [];
    if (fs.existsSync(filePath)) {
        reviews = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    }

    // 새로운 리뷰 추가
    reviews.push({ review, rating });

    // JSON 파일로 저장
    fs.writeFileSync(filePath, JSON.stringify(reviews, null, 2));

    res.json({ message: '리뷰가 저장되었습니다.' });
});

// 모든 리뷰 불러오기 (한국어 식당 이름 처리)
app.get('/get-all-reviews', (req, res) => {
    const allReviews = [];

    // 리뷰 폴더 내 모든 파일 읽기
    fs.readdir(reviewFolder, (err, files) => {
        if (err) {
            return res.status(500).json({ message: '리뷰를 불러오는 중 오류가 발생했습니다.' });
        }

        files.forEach(file => {
            const filePath = path.join(reviewFolder, file);
            const restaurantReviews = JSON.parse(fs.readFileSync(filePath, 'utf8'));

            // 파일 이름을 디코딩하여 식당 이름으로 변환
            const restaurantName = decodeURIComponent(file.replace('.json', ''));
            restaurantReviews.forEach(review => {
                review.restaurant = restaurantName;
                allReviews.push(review);
            });
        });

        res.json(allReviews); // 모든 리뷰를 클라이언트로 전송
    });
});

// 서버 실행
app.listen(PORT, () => {
    console.log(`서버가 http://localhost:${PORT} 에서 실행 중입니다.`);
});
