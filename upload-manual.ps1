$VPS_HOST = "72.62.130.152"
$USER = "root"
# Password: Ssalazarca841209+ (User will need to enter this if not using keys)

Write-Host "1. Subiendo server.cjs al VPS..."
scp -o StrictHostKeyChecking=no "backend/server.cjs" "${USER}@${VPS_HOST}:/root/server.cjs"

Write-Host "2. Subiendo 01-init-database.sql al VPS..."
scp -o StrictHostKeyChecking=no "database/init/01-init-database.sql" "${USER}@${VPS_HOST}:/root/01-init-database.sql"

Write-Host "3. Aplicando cambios en el servidor remoto..."
ssh -o StrictHostKeyChecking=no ${USER}@${VPS_HOST} "
    echo '--> Analizando contenedores de Coolify...'
    
    # Buscar contenedor del Backend (prioridad: nombre contiene 'backend', luego 'pambazo', luego imagen node)
    CONTAINER_ID=\`$(docker ps | grep -iE 'backend|pambazo.*app' | awk '{print \$1}' | head -n 1)
    
    if [ -z \"\`$CONTAINER_ID\" ]; then
         echo '⚠️ No se pudo identificar automáticamente el contenedor del Backend por nombre.'
         echo 'Listando contenedores candidatos (Node/App):'
         docker ps | grep -iE 'node|app'
         echo 'Por favor, ajusta el script con el ID correcto.'
         exit 1
    else
         echo \"✅ Contenedor Backend detectado: \`$CONTAINER_ID\"
    fi

    # Buscar contenedor de Base de Datos (Postgres)
    DB_CONTAINER_ID=\`$(docker ps | grep -i 'postgres' | awk '{print \$1}' | head -n 1)

    if [ -z \"\`$DB_CONTAINER_ID\" ]; then
         echo '⚠️ No se pudo identificar automáticamente el contenedor de la Base de Datos (postgres).'
         echo 'Listando todos los contenedores:'
         docker ps
         exit 1
    else
         echo \"✅ Contenedor Base de Datos detectado: \`$DB_CONTAINER_ID\"
    fi

    echo '--> Actualizando Backend...'
    # Intentar copiar a /app/backend/server.cjs (Ruta estándar de Dockerfile)
    # Si falla, intentar /app/server.cjs
    if docker exec \`$CONTAINER_ID ls /app/backend/server.cjs >/dev/null 2>&1; then
        docker cp /root/server.cjs \`$CONTAINER_ID:/app/backend/server.cjs
        echo 'Copiado a /app/backend/server.cjs'
    else
        docker cp /root/server.cjs \`$CONTAINER_ID:/app/server.cjs
        echo 'Copiado a /app/server.cjs (ruta alternativa)'
    fi
    
    echo '--> Reiniciando Backend...'
    docker restart \`$CONTAINER_ID

    echo '--> Inicializando Base de Datos...'
    cat /root/01-init-database.sql | docker exec -i \`$DB_CONTAINER_ID psql -U pambaso_user -d pambaso_db
    echo '--> Script SQL ejecutado.'
"

Write-Host "Proceso completado."
