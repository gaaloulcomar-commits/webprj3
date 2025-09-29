@@ .. @@
     lastLogin: {
       type: DataTypes.DATE
+    },
+    phoneNumber: {
+      type: DataTypes.STRING,
+      allowNull: true,
+      comment: 'Numéro de téléphone pour les notifications SMS'
     }
   });
 };