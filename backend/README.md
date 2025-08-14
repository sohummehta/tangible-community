# Quick Setup

## Install Docker
```bash
brew install --cask docker
```

## Start
```bash
./setup.sh
```

## Access
- API: http://localhost:8000/api/
- Admin: http://localhost:8000/admin/

## Stop
```bash
docker compose down
``` 

## Steps:

1. **Access Django Admin** (already set up):
   - Go to: http://localhost:8000/admin/
   - Login with the superuser credentials created by setup script

2. **Add a new user**:
   - In admin, click on **"Users"** under **"Authentication and Authorization"**
   - Click **"Add user"** button
   - Fill in username, email, and password
   - Save

3. **Or create user via command line**:
   ```bash
   docker compose exec web python manage.py createsuperuser
   ```

The admin interface will show you all the models you can manage, including Users, Groups, and your custom Task model. You can add, edit, or delete records directly from there.

If you want to create a custom "Person" model instead of using Django's built-in User model, let me know and I can help you set that up! 