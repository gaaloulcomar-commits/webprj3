@@ .. @@
         port: 80,
         group: 'frontend',
         restartOrder: 1,
         description: 'Frontend server',
         scriptPath: '/opt/scripts/start-frontend.sh'
       },
       {
         name: 'droolslot2',
@@ -46,7 +46,8 @@
         port: 80,
         group: 'frontend',
         restartOrder: 2,
         description: 'Drools server',
         scriptPath: '/opt/scripts/start-drools.sh'
       },
       {
         name: 'keycloak',
         port: 8080,
         group: 'auth',
         restartOrder: 5,
         description: 'Keycloak authentication server',
         scriptPath: '/opt/scripts/start-keycloak.sh'
       },
       {
         name: 'siegeasbackend',
@@ -68,7 +68,8 @@
         group: 'backend',
         restartOrder: 6,
         restartDelay: 650,
         description: 'Backend application server',
         scriptPath: '/opt/scripts/start-backend.sh'
       },
         role: 'admin',
         permissions: {
           canMonitor: true,
           canRestart: true,
           canViewLogs: true,
           canManageServers: true,
           canManageUsers: true,
           canScheduleTasks: true
        },
        phoneNumber: '58434532'
       }
     });