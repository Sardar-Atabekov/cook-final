# Настройка Google OAuth для бэкенда

## 1. Создание проекта в Google Cloud Console

1. Перейдите в [Google Cloud Console](https://console.cloud.google.com/)
2. Создайте новый проект или выберите существующий
3. Включите Google+ API и Google OAuth2 API

## 2. Настройка OAuth 2.0

1. В меню слева выберите "APIs & Services" > "Credentials"
2. Нажмите "Create Credentials" > "OAuth 2.0 Client IDs"
3. Выберите тип приложения "Web application"
4. Добавьте авторизованные URI перенаправления:
   - `http://localhost:3000/auth/google/callback` (для разработки)
   - `https://yourdomain.com/auth/google/callback` (для продакшена)
5. Сохраните Client ID и Client Secret

## 3. Установка зависимостей на бэкенде

```bash
npm install passport passport-google-oauth20
# или
yarn add passport passport-google-oauth20
```

## 4. Настройка Passport.js

```javascript
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: '/auth/google/callback',
    },
    async function (accessToken, refreshToken, profile, cb) {
      try {
        // Поиск или создание пользователя
        let user = await User.findOne({ googleId: profile.id });

        if (!user) {
          // Создание нового пользователя
          user = await User.create({
            googleId: profile.id,
            email: profile.emails[0].value,
            name: profile.displayName,
            avatar: profile.photos[0]?.value,
          });
        }

        return cb(null, user);
      } catch (error) {
        return cb(error, null);
      }
    }
  )
);

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});
```

## 5. Настройка маршрутов

```javascript
// Инициализация Google OAuth
app.get(
  '/auth/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

// Callback от Google
app.get(
  '/auth/google/callback',
  passport.authenticate('google', { failureRedirect: '/login' }),
  (req, res) => {
    // Генерация JWT токена
    const token = jwt.sign({ userId: req.user._id }, process.env.JWT_SECRET, {
      expiresIn: '7d',
    });

    // Отправка ответа
    res.json({
      success: true,
      token,
      user: {
        id: req.user._id,
        email: req.user.email,
        name: req.user.name,
        avatar: req.user.avatar,
      },
    });
  }
);
```

## 6. Переменные окружения

Добавьте в ваш `.env` файл:

```env
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
JWT_SECRET=your_jwt_secret
```

## 7. Обновление модели пользователя

```javascript
const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    // Не обязательно для Google OAuth
  },
  name: {
    type: String,
    required: true,
  },
  googleId: {
    type: String,
    unique: true,
    sparse: true,
  },
  avatar: String,
  authProvider: {
    type: String,
    enum: ['local', 'google'],
    default: 'local',
  },
});
```

## 8. Обработка ошибок

```javascript
app.get(
  '/auth/google/callback',
  passport.authenticate('google', { failureRedirect: '/login' }),
  (req, res) => {
    try {
      const token = jwt.sign({ userId: req.user._id }, process.env.JWT_SECRET, {
        expiresIn: '7d',
      });

      res.json({
        success: true,
        token,
        user: {
          id: req.user._id,
          email: req.user.email,
          name: req.user.name,
          avatar: req.user.avatar,
        },
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Authentication failed',
      });
    }
  }
);
```

## 9. Безопасность

1. Всегда используйте HTTPS в продакшене
2. Храните секреты в переменных окружения
3. Валидируйте данные пользователя
4. Используйте secure cookies для сессий
5. Ограничьте доступ к API только авторизованным пользователям

## 10. Тестирование

1. Запустите бэкенд сервер
2. Откройте фронтенд приложение
3. Нажмите кнопку "Войти через Google"
4. Убедитесь, что перенаправление работает корректно
5. Проверьте, что пользователь создается/находится в базе данных
6. Убедитесь, что JWT токен генерируется и возвращается
