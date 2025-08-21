# 1. 베이스 이미지 선택 (가볍고 보안에 유리한 alpine 버전 사용)
FROM node:18-alpine

# 2. 작업 디렉토리 설정
WORKDIR /usr/src/app

# 3. package.json 및 package-lock.json 복사
# 의존성이 변경되지 않으면 이 레이어는 캐시되어 빌드 속도가 향상됩니다.
COPY package*.json ./

# 4. 프로덕션 의존성 설치
RUN npm install --omit=dev

# 5. 애플리케이션 소스 코드 복사
COPY . .