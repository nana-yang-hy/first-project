# 簡易會員登入系統 API

這是一個簡易的會員登入系統，支持本地註冊和Google登入功能。

## 目錄

- [創建及更新](#創建及更新)
  - [創建新用戶](#創建新用戶)
  - [獲取用戶資訊](#獲取用戶資訊)
  - [獲取所有用戶資訊](#獲取所有用戶資訊)
  - [更新用戶資訊](#更新用戶資訊)
  - [刪除用戶](#刪除用戶)
- [登入及登出](#登入及登出)
  - [本地登入](#本地登入)
  - [Google登入](#Google登入)
  - [登出](#登出)

## 創建及更新

### 創建新用戶
- POST `/users`

```
// Request (application/json)
  {
      "name": "Test Member",
      "email": "test01@gmail.com",
      "password": "test12345",
      "birthday": "1998-09-12"
  }

// Response 200 (application/json)
  {
      msg: 'sign in success',
      code: 'C001'
  }

// Response 400 (application/json)
  {
      msg: 'field cannot be empty',
      code: 'E002'
  }

// Response 400 (application/json)
  {
      msg: 'email has been used',
      code: 'E001'
  }

// Response 500 (application/json)
  {
      msg: 'error occurred while sign in',
      code: 'C002'
  }
```
### 獲取用戶資訊
- GET `/users/{user_id}`
- 完成使用者登入後，使用此api會回傳使用者資料
```
// Parameters
  user_id: (string) - 如欲查詢某使用者資料，請輸入該使用者的id

// Response 200 (application/json)
  {
      msg: 'get profile success',
      obj: getUser,
      code: 'G003'
  }
        
// Response 500 (application/json)
  {
      msg: 'get profile failed',
      code: 'G004'
  }
```

### 獲取所有用戶資訊
- GET `/users/all`
- 完成超級使用者登入後，使用此api會回傳所有使用者的資料
```
// Response 200 (application/json)
  {
      msg: 'get all users' profiles success',
      obj: users,
      code: 'G005'
  }
        
// Response 500 (application/json)
  {
      msg: 'get profile failed',
      code: 'G004'
  }
```
### 更新用戶資訊
- PATCH `/users/{user_id}`
- 完成使用者登入後，使用此api並在request.body寫入要更新的內容及目前的密碼，即可以更新資料
```
// Parameters
  user_id: (string) - 如欲更新某使用者資料，請輸入該使用者的id

// Request (application/json) 
  {
      "name": "",
      "email": "",
      "new_password": "",
      "birthday": "",
      "confirm_password": ""
  }

// Response 200 (application/json)
  {
      msg: 'update success',
      code: 'U001'
  }
        
// Response 400 (application/json)
  {
      msg: 'incorrect password',
      code: 'E003'
  } 
        
// Response 500 (application/json)
  {
      msg: 'error occurred while updating',
      code: 'U002'
  }
```

### 刪除用戶
- DELETE `/users/{user_id}`
- 完成使用者登入後，使用此api並輸入密碼確認後，即可刪除使用者
```
// Parameters
  user_id: (string) - 如欲刪除某使用者資料，請輸入該使用者的id
    
// Request (application/json) 
  {
      "password": "",
  }

// Response 200 (application/json)
  {
      msg: 'delete user success',
      code: 'D001'
  }
        
// Response 401 (application/json)
  {
      msg: 'incorrect password',
      code: 'E003'
  } 
        
// Response 500 (application/json)
  {
      msg: 'error occurred while deleting user',
      code: 'D002'
  }
```

## 登入及登出
### 本地登入
- POST `/auth/login`
- 本地登入功能，request.body.option = "super" 時，可以超級使用者身份登入。
```
// Request (application/json)
  {
      "email": "test01@gmail.com",
      "password": "test12345",
      "option": "super"
  }

// Response 200 (application/json)
  {
      msg: 'log in success',
      userId: userId,
      code: 'L001'
  }

// Response 200 (application/json)
  {
      msg: 'super log in success',
      userId,
      code: 'L003'
  }

// Response 500 (application/json)
  {
      msg: 'log in failed',
      errorMessage: e,
      code: 'L002'
  }
```

### Google登入
- POST `/auth/google`
- Google Oauth2.0 登入系統，登入成功會自動導回首頁
```
// Response 200 (application/json)
  {
      msg: 'Member System',
      url: {
          profile: `/users/${userId}`,
          option: '/auth/log-out',
      },
      code: 'G001'
  }

// Response 500 (application/json)
  {
      msg: 'get homepage error',
      code: 'G002'
  }
```

### 登出
- POST `/auth/login`
- 登出系統
```
// Response 200 (application/json)
  {
      msg: 'log out success',
      code: 'L004'
  }
```
