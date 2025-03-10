# cardverse-back-end

## 백엔드

### 개요
Cardverse 백엔드는 Node.js와 Express를 기반으로 구축된 확장 가능하고 안정적인 API 서버입니다. MVC 아키텍처를 채택하여 코드의 구조화와 유지보수성을 높였으며, 사용자 인증, 템플릿 관리, 파일 업로드 등 다양한 기능을 제공합니다.

### 주요 기능
- **템플릿 관리**: 템플릿 생성, 조회, 수정, 삭제 기능
- **사용자 인증**: 회원가입, 로그인, 권한 관리 시스템
- **파일 업로드**: 이미지 업로드 및 관리 기능
- **데이터 저장**: 사용자 템플릿 데이터의 안전한 저장 및 관리
- **API 엔드포인트**: RESTful API를 통한 프론트엔드와의 통신
- **보안**: JWT 기반 인증 및 권한 부여 시스템

### 기술 스택
- **Node.js**: 서버 측 JavaScript 런타임
- **Express**: 웹 애플리케이션 프레임워크
- **Sequelize**: MySQL 데이터베이스 ORM
- **JWT & Passport**: 사용자 인증 및 권한 부여
- **Multer**: 파일 업로드 처리
- **bcrypt**: 비밀번호 암호화
- **MySQL**: 관계형 데이터베이스

### 아키텍처
Cardverse 백엔드는 MVC 패턴을 기반으로 구조화되어 있습니다:

- **라우터 (Routes)**: API 엔드포인트 정의 및 요청 라우팅
- **컨트롤러 (Controllers)**: 비즈니스 로직 처리 및 응답 생성
- **모델 (Models)**: 데이터베이스 스키마 및 데이터 액세스 로직
- **미들웨어**: 인증, 파일 업로드, 에러 처리 등 공통 기능
- **서비스**: 복잡한 비즈니스 로직을 추상화한 서비스 레이어
- **유틸리티**: 공통 유틸리티 함수 및 헬퍼

### 데이터베이스 구조
- **Template**: 기본 템플릿 정보 (카테고리, 이름, 구조 등)
- **User**: 사용자 정보 (이메일, 비밀번호, 역할 등)
- **UserTemplate**: 사용자가 커스터마이징한 템플릿 정보
- **TemplateSet**: 사용자 템플릿의 세부 설정 및 콘텐츠
