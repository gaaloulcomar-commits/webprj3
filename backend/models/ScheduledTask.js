@@ .. @@
     notificationEmails: {
       type: DataTypes.JSON,
       defaultValue: []
+    },
+    smsNotification: {
+      type: DataTypes.BOOLEAN,
+      defaultValue: false
+    },
+    notificationPhones: {
+      type: DataTypes.JSON,
+      defaultValue: []
     }
   });
 };