# معمارية النظام وتدفق البيانات بالتفصيل (04_ARCHITECTURE.md)

تعتمد منصة **Spoken English** على معمارية سحابية ثلاثية الطبقات (3-Tier Serverless Architecture) تفصل بين واجهة المستخدم، الدوال البرمجية الذكية، وقاعدة البيانات السحابية. يوضح هذا المستند الهيكل الهندسي للنظام وتدفق العمليات البرمجية بالتفصيل.

---

## 1. المخطط العام لتدفق البيانات (System Architecture Diagram)

```text
+--------------------------------------------------------------------------+
|                       طبقة الواجهة الأمامية (Frontend)                     |
|            متصفح العميل (Vanilla HTML5 / CSS3 / JavaScript SPA)          |
+------------------------------------+-------------------------------------+
                                     |
                       REST API Requests (JSON)
                                     |
                                     v
+------------------------------------+-------------------------------------+
|                     طبقة الدوال السحابية (Netlify Functions)              |
|        بيئة تشغيل Node.js مؤقتة (Stateless Serverless Environment)        |
+------------------------------------+-------------------------------------+
                                     |
                            Connection Pooling
                                     |
                                     v
+------------------------------------+-------------------------------------+
|                      بوابة تجميع الاتصالات (PgPooler)                      |
|                موزع اتصالات NeonDB الذكي (Connection Proxy)               |
+------------------------------------+-------------------------------------+
                                     |
                                     v
+------------------------------------+-------------------------------------+
|                     طبقة قاعدة البيانات السحابية (NeonDB)                  |
|                 قاعدة بيانات علائقية سحابية (PostgreSQL)                  |
+--------------------------------------------------------------------------+
```

---

## 2. آلية جلب البيانات (Data Fetching Mechanism)

عند تشغيل التطبيق أو تسجيل الدخول، يتم استدعاء البيانات وتحديثها عبر الخطوات البرمجية التالية:

### الخطوة 1: تهيئة الواجهة محلياً (Immediate Cache Render)
* **الملف:** `public/js/app.js`
* **الحدث:** `DOMContentLoaded`
* **العملية:** يستدعي كود الواجهة دالة `loadData()` لقراءة البيانات المخزنة محلياً في الذاكرة المؤقتة للمتصفح (`localStorage`) وعرضها فوراً حتى لا يرى المعلم شاشة بيضاء بانتظار استجابة الشبكة.

### الخطوة 2: استدعاء دالة الجلب السحابية (Async Remote Fetch)
* **الملف:** `public/js/app.js`
* **الدالة:** `syncWithBackend()`
* **العملية:** يتم إرسال طلب غير متزامن (Asynchronous HTTP GET) للرابط السحابي:
  ```javascript
  const response = await fetch('/.netlify/functions/get_data');
  const data = await response.json();
  ```

### الخطوة 3: معالجة الطلب في السيرفر (Server-Side Execution)
* **الملف:** `netlify/functions/get_data.js`
* **العملية:** 
  1. تقوم الدالة بفتح اتصال آمن عبر تجمع الاتصالات (Connection Pool) بقاعدة بيانات NeonDB.
  2. تنفذ استعلامين لجلب الطلاب والكشوفات التاريخية:
     ```sql
     SELECT id, name, roll_number, class_level FROM students ORDER BY id ASC;
     SELECT id, TO_CHAR(session_date, 'YYYY-MM-DD') AS session_date, class_level, records, stats FROM attendance_logs ORDER BY session_date DESC;
     ```
  3. تنسق الصفوف الناتجة في مصفوفة JSON وتضيف ترويسات الأمان ومشاركة الموارد (CORS Headers) ثم ترجعها برمز نجاح `200 OK`.

### الخطوة 4: تحديث الواجهة والذاكرة (UI Synchronization)
* **الملف:** `public/js/app.js`
* **العملية:** يستقبل المتصفح البيانات المحدثة، ويقوم بتخزينها محلياً لدمج الكاش، ويعيد استدعاء دوال الرسم `renderDashboard()` و `renderStudentsList()` لتحديث الأرقام والجداول فوراً أمام المعلم.

---

## 3. تدفق عملية تسجيل الحضور والغياب (Attendance Registration Flow)

يوضح المخطط التالي تسلسل العمليات من لحظة نقر المعلم على زر "الحفظ" حتى انزلاق البيانات في قاعدة البيانات:

```text
[المعلم] ينقر زر الحفظ
        |
        v
[app.js] يمنع إرسال النموذج الافتراضي (e.preventDefault)
        |
        v
[app.js] يجمع مدخلات الراديو (Present/Absent/Late) لكل طالب
        |
        v
[app.js] يحسب الإحصائيات (النسبة المئوية، مجموع الحضور، الغياب)
        |
        v
[app.js] يعطل زر الحفظ مؤقتاً ويطلق مؤشر الانتظار (Spinner)
        |
        v
[app.js] يرسل طلب POST لـ /save_attendance ومعه جسم الطلب كـ JSON
        |
        +-----------------------------> [سحابة Netlify]
                                              |
                                              v
                                  [save_attendance.js] تستقبل الطلب
                                              |
                                              v
                                  [save_attendance.js] تتصل بـ NeonDB
                                              |
                                              v
                                  تنفذ استعلام UPSERT المدمج:
                                  "INSERT ... ON CONFLICT DO UPDATE"
                                              |
                                              v
                                  تغلق الاتصال وترسل رد 200 OK للواجهة
        +<------------------------------------+
        |
        v
[app.js] يستقبل الرد، ويعيد تفعيل زر الحفظ وإخفاء السبينر
        |
        v
[app.js] يقوم بحفظ الكشف في الذاكرة المحلية localStorage احتياطياً
        |
        v
[app.js] يظهر رسالة توست النجاح الخضراء: "Saved attendance for Level X on Date!"
        |
        v
[app.js] ينقل المعلم تلقائياً لتبويب لوحة التحكم الرئيسي (Dashboard)
```

---

## 4. تدفق كود الحفظ البرمجي بالتفصيل (Code Call Stack Tracer)

### 1. إرسال الكشف من الواجهة الأمامية:
* **الملف:** `public/js/app.js`
* **الدالة:** مستمع الحدث `submit` للنموذج `#attendance-sheet-form`:
  ```javascript
  form.addEventListener('submit', async (e) => {
      e.preventDefault();
      // جمع البيانات وحساب الإحصائيات...
      const stats = { present, absent, late, rate };
      
      // تعطيل زر الإرسال لتجنب تكرار الضغط
      submitBtn.disabled = true;
      
      // إرسال الطلب البرمجي
      const response = await fetch('/.netlify/functions/save_attendance', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ date: dateStr, level, records, stats })
      });
  ```

### 2. استقبال وحفظ الكشف في السيرفر:
* **الملف:** `netlify/functions/save_attendance.js`
* **الدالة:** `exports.handler`:
  ```javascript
  const { date, level, records, stats } = JSON.parse(event.body);
  
  // استعلام UPSERT لضمان عدم التكرار لنفس اليوم والصف
  const query = `
    INSERT INTO attendance_logs (session_date, class_level, records, stats)
    VALUES ($1, $2, $3, $4)
    ON CONFLICT (session_date, class_level)
    DO UPDATE SET records = EXCLUDED.records, stats = EXCLUDED.stats
  `;
  await pool.query(query, [date, level, JSON.stringify(records), JSON.stringify(stats)]);
  ```

### 3. معالجة الاستجابة وتحديث شاشة المعلم:
* **الملف:** `public/js/app.js`
* **العملية:** عند استقبال رد السيرفر بنجاح:
  ```javascript
  // تحديث الكاش المحلي
  attendanceLogs.push(logData);
  saveLogs();
  
  // الانتقال للرئيسية وإظهار التنبيه
  showToast(`Saved attendance for ${level} on ${dateStr}!`, 'success');
  switchTab('dashboard');
  ```
