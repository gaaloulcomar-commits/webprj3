@@ .. @@
     restartDelay: {
       type: DataTypes.INTEGER,
       defaultValue: 0
+    },
+    scriptPath: {
+      type: DataTypes.STRING,
+      allowNull: true,
+      comment: 'Chemin du script à exécuter sur le serveur'
     }
   });
 };