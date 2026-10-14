<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
  <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
  <script type="text/javascript">
    function clearAllStorage() {
      // 1. Clear Cookies
      document.cookie.split(";").forEach((cookie) => {
        document.cookie = cookie.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date(0).toUTCString() + ";path=/");
      });

      // 2. Clear Local Storage
      localStorage.clear();

      // 3. Clear Session Storage
      sessionStorage.clear();

      // 4. Clear Cache API caches (if any)
      if ("caches" in window) {
        caches.keys().then((names) => {
          names.forEach((name) => caches.delete(name));
        });
      }

      // 5. Clear IndexedDB databases (if supported)
      if (indexedDB.databases) {
        indexedDB.databases().then((databases) => {
          databases.forEach((db) => {
            if (db.name) {
              indexedDB.deleteDatabase(db.name);
            }
          });
        });
      } else {
        console.warn("indexedDB.databases() is not supported in this browser.");
      }

      console.log("all clear success.");
    }
    // Call the function to clear storage
    clearAllStorage();
  </script>
</head>

<body>
all clear success.
</body>

</html>