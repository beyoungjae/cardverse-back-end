## Date : 25/02/14

### Path: models/adminModels/coupon.js

```javascript
label: {
type: Sequelize.STRING(100),
allowNull: false,
},

discount: {
type: Sequelize.DECIMAL(10, 2),
allowNull: false,
},

minPurchase: {
type: Sequelize.DECIMAL(10, 2),
allowNull: false,
defaultValue: 0,
},

maxDiscount: {
type: Sequelize.DECIMAL(10, 2),
allowNull: false,
defaultValue: 0,
},
```

-  **추가사항**
   -  `maxDiscount` 추가
   -  `minPurchase` 추가
-  **변경사항**
   -  `value` $\rightarrow$ `discount` 변경
   -  `name` $\rightarrow$ `label` 변경

### Path: models/userModels/userTemplate.js

```javascript
status: {
    type: Sequelize.ENUM('draft', 'active', 'expired', 'deleted'),
    allowNull: false,
    defaultValue: 'draft',
    comment: 'draft: 작성중 / active: 결제완료 / expired: 만료 / deleted: 삭제',
},
```

-  **변경사항**
   -  `결제중` $\rightarrow$ `작성중`으로 변경

## Date : 25/02/24

### 라이브러리 추가

```javascript
npm install node-cron nodemailer handlebars
```

-  `node-cron`: 스케줄링
-  `nodemailer`: 이메일 발송
-  `handlebars`: 이메일 템플릿
