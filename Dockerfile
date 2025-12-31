# Base image PHP FPM
FROM php:8.3-fpm

# Install system dependencies
RUN apt-get update && apt-get install -y \
    git \
    unzip \
    libpq-dev \
    libzip-dev \
    zip \
    curl \
    npm \
    nodejs \
    && rm -rf /var/lib/apt/lists/*

# Install PHP extensions
RUN docker-php-ext-install pdo pdo_pgsql pgsql zip

# Install Composer
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

# Set working directory
WORKDIR /app

# Copy project files
COPY . .

# Install PHP dependencies
RUN composer install --no-dev --optimize-autoloader

# Install Node dependencies and build React assets
RUN npm install
RUN npm run build

# Set permissions (Ajout du chmod pour être certain)
RUN chown -R www-data:www-data /app/storage /app/bootstrap/cache
RUN chmod -R 775 /app/storage /app/bootstrap/cache

# Railway injecte dynamiquement le port, on ne doit pas l'exposer en dur
# EXPOSE 8000 (Optionnel sur Railway, mais peut porter à confusion)

# Start Laravel
# Changement CRUCIAL : Utilisation de la variable $PORT et exécution des migrations
CMD php artisan migrate --force && php artisan serve --host=0.0.0.0 --port=${PORT:-8000}