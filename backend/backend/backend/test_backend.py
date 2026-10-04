import requests


# =========================================================
# CONFIGURATION
# =========================================================

BASE_URL = "http://127.0.0.1:8000/api/v1"

ADMIN_EMAIL = "admin@school.com"
ADMIN_PASSWORD = "Admin@123"

TEACHER_EMAIL = "teacher@school.com"
TEACHER_PASSWORD = "Teacher@123"

STUDENT_EMAIL = "student@school.com"
STUDENT_PASSWORD = "Student@123"


# =========================================================
# TEST COUNTERS
# =========================================================

passed = 0
failed = 0


def check(name, condition):
    global passed, failed

    if condition:
        print(f"✅ PASS  {name}")
        passed += 1
    else:
        print(f"❌ FAIL  {name}")
        failed += 1


# =========================================================
# LOGIN
# =========================================================

def login(email, password):
    try:
        response = requests.post(
            f"{BASE_URL}/auth/login",
            json={
                "email": email,
                "password": password,
            },
            timeout=5,
        )

        if response.status_code != 200:
            print(
                f"   Login response: "
                f"{response.status_code} - {response.text}"
            )
            return None

        data = response.json()

        return data.get("access_token")

    except Exception as e:
        print(f"   Login error: {e}")
        return None


# =========================================================
# HEADERS
# =========================================================

def get_headers(token):
    if not token:
        return {}

    return {
        "Authorization": f"Bearer {token}"
    }


# =========================================================
# START
# =========================================================

print("\n==============================")
print("SCHOOL MANAGEMENT SYSTEM")
print("BACKEND AUTOMATED TESTS")
print("==============================")


# =========================================================
# 1. SERVER
# =========================================================

print("\n==============================")
print("1. SERVER")
print("==============================")


try:
    response = requests.get(
        "http://127.0.0.1:8000/docs",
        timeout=5,
    )

    check(
        "FastAPI server is running",
        response.status_code == 200,
    )

except Exception as e:

    print("❌ FAIL  FastAPI server is not reachable")
    print(f"   {e}")

    failed += 1

    print("\n==============================")
    print("TEST SUMMARY")
    print("==============================")

    print(f"✅ Passed : {passed}")
    print(f"❌ Failed : {failed}")
    print(f"📊 Total  : {passed + failed}")

    raise SystemExit


# =========================================================
# 2. AUTHENTICATION
# =========================================================

print("\n==============================")
print("2. AUTHENTICATION")
print("==============================")


admin_token = login(
    ADMIN_EMAIL,
    ADMIN_PASSWORD,
)

teacher_token = login(
    TEACHER_EMAIL,
    TEACHER_PASSWORD,
)

student_token = login(
    STUDENT_EMAIL,
    STUDENT_PASSWORD,
)


check(
    "Admin login",
    admin_token is not None,
)

check(
    "Teacher login",
    teacher_token is not None,
)

check(
    "Student login",
    student_token is not None,
)


# =========================================================
# AUTH HEADERS
# =========================================================

admin_headers = get_headers(admin_token)
teacher_headers = get_headers(teacher_token)
student_headers = get_headers(student_token)


# =========================================================
# 3. CURRENT USER
# =========================================================

print("\n==============================")
print("3. CURRENT USER")
print("==============================")


if admin_token:

    response = requests.get(
        f"{BASE_URL}/auth/me",
        headers=admin_headers,
        timeout=5,
    )

    check(
        "Admin /auth/me",
        response.status_code == 200,
    )

else:

    print("⚠️ SKIP  Admin /auth/me because login failed")


# =========================================================
# 4. AUTH SECURITY
# =========================================================

print("\n==============================")
print("4. AUTH SECURITY")
print("==============================")


response = requests.get(
    f"{BASE_URL}/students",
    timeout=5,
)

check(
    "Request without token returns 401",
    response.status_code == 401,
)


# =========================================================
# 5. ADMIN
# =========================================================

print("\n==============================")
print("5. ADMIN")
print("==============================")


if admin_token:

    response = requests.get(
        f"{BASE_URL}/admin/dashboard",
        headers=admin_headers,
        timeout=5,
    )

    check(
        "Admin can access admin dashboard",
        response.status_code == 200,
    )

else:

    print("⚠️ SKIP  Admin dashboard because admin login failed")


if student_token:

    response = requests.get(
        f"{BASE_URL}/admin/dashboard",
        headers=student_headers,
        timeout=5,
    )

    check(
        "Student cannot access admin dashboard",
        response.status_code == 403,
    )

else:

    print("⚠️ SKIP  Student admin protection because student login failed")


# =========================================================
# 6. BASIC MODULES
# =========================================================

print("\n==============================")
print("6. BASIC MODULES")
print("==============================")


basic_modules = [
    "students",
    "teachers",
    "parents",
    "academic-years",
    "classes",
    "sections",
    "student-enrollments",
    "subjects",
    "class-subjects",
    "teacher-assignments",
    "parent-student-links",
    "attendance",
    "homework",
    "homework-submissions",
    "examinations",
    "exam-subjects",
    "marks",
    "fee-structures",
    "student-fees",
    "payments",
    "timetables",
    "announcements",
]


if admin_token:

    for module in basic_modules:

        response = requests.get(
            f"{BASE_URL}/{module}",
            headers=admin_headers,
            timeout=5,
        )

        check(
            f"GET /{module}",
            response.status_code == 200,
        )

else:

    print("⚠️ SKIP  Basic modules because admin login failed")


# =========================================================
# 7. NOTIFICATIONS
# =========================================================

print("\n==============================")
print("7. NOTIFICATIONS")
print("==============================")


if student_token:

    response = requests.get(
        f"{BASE_URL}/notifications/me",
        headers=student_headers,
        timeout=5,
    )

    check(
        "Get my notifications",
        response.status_code == 200,
    )

else:

    print("⚠️ SKIP  Notifications because student login failed")


# =========================================================
# 8. NOT FOUND VALIDATION
# =========================================================

print("\n==============================")
print("8. NOT FOUND VALIDATION")
print("==============================")


not_found_modules = [
    "students",
    "teachers",
    "parents",
    "academic-years",
    "classes",
    "sections",
    "subjects",
    "attendance",
    "homework",
    "examinations",
    "exam-subjects",
    "marks",
    "fee-structures",
    "student-fees",
    "payments",
    "timetables",
    "announcements",
]


if admin_token:

    for module in not_found_modules:

        response = requests.get(
            f"{BASE_URL}/{module}/999999",
            headers=admin_headers,
            timeout=5,
        )

        check(
            f"GET /{module}/999999 returns 404",
            response.status_code == 404,
        )

else:

    print("⚠️ SKIP  404 validation because admin login failed")


# =========================================================
# 9. ROLE PROTECTION
# =========================================================

print("\n==============================")
print("9. ROLE PROTECTION")
print("==============================")


protected_endpoints = [
    "students",
    "teachers",
    "parents",
    "academic-years",
    "classes",
    "sections",
    "subjects",
    "class-subjects",
    "teacher-assignments",
    "parent-student-links",
]


if student_token:

    for endpoint in protected_endpoints:

        response = requests.post(
            f"{BASE_URL}/{endpoint}",
            headers=student_headers,
            json={},
            timeout=5,
        )

        check(
            f"Student blocked from POST /{endpoint}",
            response.status_code == 403,
        )

else:

    print("⚠️ SKIP  Role protection because student login failed")


# =========================================================
# 10. NOTIFICATION OWNERSHIP
# =========================================================

print("\n==============================")
print("10. NOTIFICATION OWNERSHIP")
print("==============================")


if student_token:

    response = requests.get(
        f"{BASE_URL}/notifications/me",
        headers=student_headers,
        timeout=5,
    )

    check(
        "Student can access own notifications",
        response.status_code == 200,
    )

else:

    print("⚠️ SKIP  Notification ownership because student login failed")


# =========================================================
# 11. TEACHER DATA ISOLATION
# =========================================================

print("\n==============================")
print("11. TEACHER DATA ISOLATION")
print("==============================")


if teacher_token:

    # -----------------------------------------------------
    # Teacher can access student list
    # -----------------------------------------------------

    response = requests.get(
        f"{BASE_URL}/students",
        headers=teacher_headers,
        timeout=5,
    )

    check(
        "Teacher can access assigned students",
        response.status_code == 200,
    )

    teacher_students = []

    if response.status_code == 200:

        try:
            teacher_students = response.json()

        except Exception:

            teacher_students = []

    # -----------------------------------------------------
    # Teacher response must be a list
    # -----------------------------------------------------

    if response.status_code == 200:

        check(
            "Teacher student response is a list",
            isinstance(teacher_students, list),
        )

    # -----------------------------------------------------
    # Teacher can access returned student
    # -----------------------------------------------------

    if teacher_students:

        first_student_id = teacher_students[0].get("id")

        if first_student_id is not None:

            response = requests.get(
                f"{BASE_URL}/students/{first_student_id}",
                headers=teacher_headers,
                timeout=5,
            )

            check(
                "Teacher can access assigned student",
                response.status_code == 200,
            )

        else:

            print(
                "⚠️ SKIP  Teacher student does not contain an ID"
            )

    else:

        print(
            "⚠️ SKIP  Teacher has no assigned students"
        )

else:

    print("⚠️ SKIP  Teacher isolation because teacher login failed")


# =========================================================
# ADMIN STUDENT ACCESS
# =========================================================

if admin_token:

    response = requests.get(
        f"{BASE_URL}/students",
        headers=admin_headers,
        timeout=5,
    )

    check(
        "Admin can access all students",
        response.status_code == 200,
    )

else:

    print("⚠️ SKIP  Admin student access because admin login failed")


# =========================================================
# STUDENT MANAGEMENT PROTECTION
# =========================================================

if student_token:

    response = requests.get(
        f"{BASE_URL}/students",
        headers=student_headers,
        timeout=5,
    )

    check(
        "Student blocked from student management list",
        response.status_code == 403,
    )

else:

    print(
        "⚠️ SKIP  Student management protection "
        "because student login failed"
    )


# =========================================================
# FINAL SUMMARY
# =========================================================

print("\n==============================")
print("TEST SUMMARY")
print("==============================")


print(f"✅ Passed : {passed}")
print(f"❌ Failed : {failed}")
print(f"📊 Total  : {passed + failed}")


if failed == 0:

    print("\n🎉 ALL AUTOMATED TESTS PASSED")

else:

    print("\n⚠️ SOME TESTS FAILED")