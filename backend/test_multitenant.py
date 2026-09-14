import uuid
from fastapi.testclient import TestClient
from app.main import app
from app.routers.advisor import build_context
from app.database import SessionLocal
from app import models

client = TestClient(app)

# Generate unique emails for test run
uid = uuid.uuid4().hex[:6]
email_a = f"user_a_{uid}@finance.app"
email_b = f"user_b_{uid}@finance.app"

# 1. Reject unauthorized requests
unauth_dash = client.get('/api/dashboard')
assert unauth_dash.status_code == 401, f'Expected 401, got {unauth_dash.status_code}'

unauth_income = client.get('/api/income')
assert unauth_income.status_code == 401

# 2. Register User Alpha
res_a = client.post('/api/auth/register', json={
    'email': email_a,
    'username': 'Alpha User',
    'password': 'secretPassword1'
})
assert res_a.status_code == 200, res_a.text
token_a = res_a.json()['token']
user_a_id = res_a.json()['user']['id']

# 3. Register User Beta
res_b = client.post('/api/auth/register', json={
    'email': email_b,
    'username': 'Beta User',
    'password': 'secretPassword2'
})
assert res_b.status_code == 200, res_b.text
token_b = res_b.json()['token']
user_b_id = res_b.json()['user']['id']

# 4. Wrong password test
bad_login = client.post('/api/auth/login', json={
    'email': email_a,
    'password': 'wrongPassword'
})
assert bad_login.status_code == 401

# 5. Correct login test
good_login = client.post('/api/auth/login', json={
    'email': email_a,
    'password': 'secretPassword1'
})
assert good_login.status_code == 200

# 6. User Alpha creates Income and Expense
inc_a = client.post('/api/income', headers={'Authorization': f'Bearer {token_a}'}, json={
    'date': '2026-09-14',
    'source': 'Alpha Consulting',
    'amount': 120000
}).json()

exp_a = client.post('/api/expenses', headers={'Authorization': f'Bearer {token_a}'}, json={
    'date': '2026-09-14',
    'category': 'Office Rent',
    'amount': 30000,
    'note': 'Main branch'
}).json()

# 7. User Beta creates Income and Expense
inc_b = client.post('/api/income', headers={'Authorization': f'Bearer {token_b}'}, json={
    'date': '2026-09-14',
    'source': 'Beta Teaching',
    'amount': 45000
}).json()

exp_b = client.post('/api/expenses', headers={'Authorization': f'Bearer {token_b}'}, json={
    'date': '2026-09-14',
    'category': 'Books & Courses',
    'amount': 5000,
    'note': 'Python & AI'
}).json()

# 8. Cross-User isolation verification:
list_a = client.get('/api/income', headers={'Authorization': f'Bearer {token_a}'}).json()
assert any(i['source'] == 'Alpha Consulting' for i in list_a)
assert not any(i['source'] == 'Beta Teaching' for i in list_a)

list_b = client.get('/api/income', headers={'Authorization': f'Bearer {token_b}'}).json()
assert any(i['source'] == 'Beta Teaching' for i in list_b)
assert not any(i['source'] == 'Alpha Consulting' for i in list_b)

# 9. Cross-User update / delete protection:
inc_a_id = inc_a['id']
hacker_delete = client.delete(f'/api/income/{inc_a_id}', headers={'Authorization': f'Bearer {token_b}'})
assert hacker_delete.status_code == 404, 'User B should not be able to delete User A record!'

# 10. Individual Google Sheet URLs:
client.put('/api/gsheet/config', headers={'Authorization': f'Bearer {token_a}'}, json={
    'url': 'https://docs.google.com/spreadsheets/d/ALPHA_SHEET/edit'
})
client.put('/api/gsheet/config', headers={'Authorization': f'Bearer {token_b}'}, json={
    'url': 'https://docs.google.com/spreadsheets/d/BETA_SHEET/edit'
})

sheet_a = client.get('/api/gsheet/status', headers={'Authorization': f'Bearer {token_a}'}).json()['user_sheet_url']
sheet_b = client.get('/api/gsheet/status', headers={'Authorization': f'Bearer {token_b}'}).json()['user_sheet_url']
assert 'ALPHA_SHEET' in sheet_a
assert 'BETA_SHEET' in sheet_b

# 11. Advisor prompt isolation:
db = SessionLocal()
user_a = db.query(models.User).filter(models.User.id == user_a_id).first()
user_b = db.query(models.User).filter(models.User.id == user_b_id).first()

ctx_a = build_context(db, user_a, 'What is my highest expense?')
ctx_b = build_context(db, user_b, 'What is my highest expense?')
db.close()

assert 'Office Rent' in ctx_a and 'Books & Courses' not in ctx_a
assert 'Books & Courses' in ctx_b and 'Office Rent' not in ctx_b

# Clean up test accounts after run
db = SessionLocal()
for uid_to_del in [user_a_id, user_b_id]:
    db.query(models.Income).filter(models.Income.user_id == uid_to_del).delete()
    db.query(models.Expense).filter(models.Expense.user_id == uid_to_del).delete()
    db.query(models.Stock).filter(models.Stock.user_id == uid_to_del).delete()
    db.query(models.User).filter(models.User.id == uid_to_del).delete()
db.commit()
db.close()

print('ALL 11 MULTI-TENANT & DATA ISOLATION TESTS PASSED 100%!')
