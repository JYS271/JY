# 🎰 오늘의 운세 뽑기

🔗 **라이브 데모: https://jys271.github.io/JY/AI%20creative%20challenge/**

인형뽑기 기계에서 이모지 하나를 집게로 뽑아 깨면, 그 안에서 **오늘의 한 줄 운세**가 나오는 웹앱입니다.
무언가를 시작하기 전이나 약속에 나가기 전, 가볍게 하루 운세를 확인해 보세요.

## ✨ 기능

- **인형뽑기 연출**: ◀ ▶ 버튼(또는 키보드 화살표)으로 집게를 옮기고, 핑크 버튼(또는 Space/Enter)으로 뽑기
- **10가지 이모지 = 10가지 운세**: 뽑은 이모지를 깨면 한 줄 운세 + 행운 아이템이 나와요
- **하루 1회**: 오늘 뽑은 결과는 저장되어, 다시 열어도 같은 결과가 보입니다 (다음 날 다시 뽑기 가능)
- **애플 스타일 이모지**: 어느 기기에서 봐도 동일한 글로시 3D 이모지로 보이도록, 애플 이모지 PNG를 jsDelivr CDN(`emoji-datasource-apple`)에서 불러옵니다
- **빌드 없음**: 순수 HTML/CSS/JavaScript. 외부에서 불러오는 건 웹폰트(Google Fonts)와 이모지 이미지(jsDelivr CDN)뿐이라 GH Pages에 파일만 올리면 동작합니다 (인터넷 연결 필요)

## 📁 구성

```
index.html   # 구조
style.css    # 디자인 (다크 캐비닛 · 크롬 프레임 · 핑크 포인트)
script.js    # 뽑기 로직 · 운세 데이터 · 하루 1회 저장
```

> `.claude/` 폴더는 로컬 미리보기용 개발 설정이라 배포에 영향을 주지 않습니다.

## 🚀 GitHub Pages 배포

1. 이 폴더를 GitHub 저장소에 올립니다.
   ```bash
   git init
   git add .
   git commit -m "오늘의 운세 뽑기"
   git branch -M main
   git remote add origin https://github.com/<사용자명>/<저장소명>.git
   git push -u origin main
   ```
2. 저장소 **Settings → Pages** 로 이동
3. **Source** 를 `Deploy from a branch`, 브랜치를 `main` / `/ (root)` 으로 설정 후 저장
4. 잠시 뒤 `https://<사용자명>.github.io/<저장소명>/` 에서 열립니다.

빌드 과정이 없으므로 파일을 그대로 올리면 끝입니다.

## 🛠 운세 문구 바꾸기

[`script.js`](script.js) 상단의 `FORTUNES` 배열에서 이모지 / 문구 / 행운 아이템을 자유롭게 수정하면 됩니다.
