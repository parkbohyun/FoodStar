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

// 하드코딩된 비밀번호
const PASSWORD = "0511";

// 리뷰 저장 엔드포인트 (비밀번호 확인)
app.post('/save-review', (req, res) => {
    const { password, restaurant, review, rating } = req.body;

    if (password !== PASSWORD) {
        return res.status(403).json({ message: '비밀번호가 틀렸습니다.' });
    }

    if (!restaurant || !review || !rating) {
        return res.status(400).json({ message: '모든 필드를 입력해 주세요.' });
    }

    const fileName = `${encodeURIComponent(restaurant)}.json`;
    const filePath = path.join(reviewFolder, fileName);

    let reviews = [];
    if (fs.existsSync(filePath)) {
        reviews = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    }

    reviews.push({ review, rating });
    fs.writeFileSync(filePath, JSON.stringify(reviews, null, 2));
    res.json({ message: '리뷰가 저장되었습니다.' });
});

// 리뷰 삭제 엔드포인트 (비밀번호 확인)
app.delete('/delete-review', (req, res) => {
    const { password, restaurant, reviewText } = req.body;

    if (password !== PASSWORD) {
        return res.status(403).json({ message: '비밀번호가 틀렸습니다.' });
    }

    const fileName = `${encodeURIComponent(restaurant)}.json`;
    const filePath = path.join(reviewFolder, fileName);

    if (fs.existsSync(filePath)) {
        let reviews = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        reviews = reviews.filter(review => review.review !== reviewText);
        fs.writeFileSync(filePath, JSON.stringify(reviews, null, 2));
        res.json({ message: '리뷰가 삭제되었습니다.' });
    } else {
        res.status(404).json({ message: '해당 리뷰가 없습니다.' });
    }
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
