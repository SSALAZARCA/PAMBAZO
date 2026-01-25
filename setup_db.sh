#!/bin/bash

# Configurar PostgreSQL para PAMBAZO
echo "Configurando PostgreSQL..."

# Crear usuario pambazo
sudo -u postgres psql -c "CREATE USER pambazo WITH PASSWORD 'pambazo123';"

# Crear base de datos pambazo
sudo -u postgres psql -c "CREATE DATABASE pambazo OWNER pambazo;"

# Otorgar privilegios
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE pambazo TO pambazo;"

# Configurar PostgreSQL para permitir conexiones
echo "host all all 0.0.0.0/0 md5" >> /etc/postgresql/16/main/pg_hba.conf
echo "listen_addresses = '*'" >> /etc/postgresql/16/main/postgresql.conf

# Reiniciar PostgreSQL
systemctl restart postgresql
systemctl enable postgresql

echo "PostgreSQL configurado correctamente"